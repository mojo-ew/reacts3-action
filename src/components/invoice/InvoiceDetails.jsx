import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  Container,
  Button,
  Card,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  FormGroup,
  Label,
  Input,
  Spinner,
  Form,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Badge,
  UncontrolledCollapse,
} from "reactstrap";
import Sidebar from "../layout/Sidebar";
import {
  INVOICE_DETAILS_ROUTE,
  INVOICE_ROUTE,
  UPLOAD_INVOICE_ROUTE,
} from "../../constants/RoutePaths";
import Swal from "sweetalert2";
import { Link, useParams, useHistory, Prompt } from "react-router-dom";
import {
  GET_INVOICE_DETAILS,
  UPDATE_INVOICE_STATUS,
  UPDATE_INVOICE,
  NEXT_INVOICE_URL,
  LOCK_INVOICE_URL,
  UNLOCK_INVOICE_URL,
  GET_INVOICE_FIELDS,
  ACCESS_S3_FILE,
  GET_USER_BY_ID,
  COMMENT_LIST_URL,
  GET_FORMAT_SETTING_URL,
} from "../common/url";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import {
  deCryptFun,
  enCryptFun,
  getRole,
  getSenderEmail,
  getTeamID,
  getUserId,
} from "../common/functions";
import Preview from "./Preview";
import moment from "moment";
import { useFormik } from "formik";
import * as Yup from "yup";
import List from "./InvoiceLine/List";
import InvoiceForm from "./InvoiceForm.jsx";
import { Document, Page, pdfjs } from "react-pdf";
import classnames from "classnames";
import { validationStatusConfig } from "../../constants/HelperConstant";
import Timer from "react-compound-timer/build";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import Axios from "axios";
import NotifySupplier from "./NotifySupplier";
import axios from "axios";
import ChatSection from "./ChatSection";
import { RiTruckLine } from "react-icons/ri";
import AuditLog from "./AuditLog";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.5.207/pdf.worker.js`;

export default function InvoiceDetails() {
  var fileDownload = require("js-file-download");

  const history = useHistory();
  const [timerFlag, setTimerFlag] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [Toggle, setToggle] = useState(false);
  const [Toggle1, setToggle1] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [approveLoading, setApproveLoading] = useState(false);
  const [type, setType] = useState("po");
  const [downloadURL, setDownloadURL] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  let { invoiceID } = useParams();
  const [requiredFieldList, setRequiredFieldList] = useState([]);
  const [formIsHalfFilledOut, setFilled] = useState(true);
  const [lockFlag, setLockFlag] = useState(false);
  const [subTeamId, setSubTeamId] = useState();
  const [dateType, setFormatType] = useState("MM/dd/yyyy");
  const [activeTab, setActiveTab] = useState("1");
  const [activeTabsec, setActiveTabsec] = useState("1");
  const [emailbody, setMessage] = useState("");

  const tabToggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const tabTogglesec = (tabsec) => {
    if (activeTabsec !== tabsec) setActiveTabsec(tabsec);
  };

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const changePage = useCallback(
    (offset) =>
      setPageNumber((prevPageNumber) => (prevPageNumber || 1) + offset),
    []
  );
  const previousPage = useCallback(() => changePage(-1), [changePage]);

  const nextPage = useCallback(() => changePage(1), [changePage]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }
  const unlockInvoice = async () => {
    const config = {
      method: "DELETE",
      url: UNLOCK_INVOICE_URL,
      headers: authHeader(),
      params: {
        // invoiceId: invoiceID,
        // lockedBy: getUserId(),
        webString: enCryptFun(
          JSON.stringify({
            invoiceId: invoiceID,
        lockedBy: getUserId(),
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
     // const { status } = response.data;
        let l = deCryptFun(response.data);
      const { status } = JSON.parse(l);
      if (status === "Success") {
        console.error("success");
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlertToast("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    } finally {
      setLockFlag(false);
    }
  };
  const onPoRadioChange = (e) => {
    setType("po");
  };

  const onNonpoRadioChange = (e) => {
    setType("nonpo");
  };

  const onClickEdit = async () => {
    tabToggle("1");
    setTimerFlag(true);
    setLockFlag(true);
    const config = {
      method: "POST",
      url: LOCK_INVOICE_URL,
      headers: authHeader(),
      data: {
        // invoiceId: invoiceID,
        // lockedBy: getUserId(),
        webString: enCryptFun(
          JSON.stringify({
             invoiceId: invoiceID,
       lockedBy: getUserId(),
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      // const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        if (
          parseInt(data.lockedUserId) > 0 &&
          parseInt(data.lockedUserId) !== parseInt(getUserId())
        ) {
          Swal.fire(
            getAlertToast(
              "error",
              "This invoice is locked for editing as another user is currently editing invoice fields."
            )
          );
        } else {
          setIsEdit(!isEdit);
        }
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlertToast("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    }
  };
  const GetRequiredValues = async () => {
    const config = {
      method: "GET",
      url: GET_INVOICE_FIELDS,
      params: {   // teamId: getRole() == "Supplier" ? subTeamId : getTeamID(),
       webString: enCryptFun(
          JSON.stringify({
            teamId: getRole() == "Supplier" ? subTeamId : getTeamID(),
          })
        ),
        flutterString: "",
    },
      headers: authHeader(),
    };
    try {
      const response = await API(config);
      //const { status, data } = response.data;
        let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
      if (status === "Success") {
        setRequiredFieldList(data);
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlertToast("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    }
  };

  useEffect(() => {
    GetDetails();
    // GetRequiredValues();
  }, []);
  useEffect(() => {
    GetRequiredValues();
  }, [subTeamId]);
  // useEffect(() => {
  //   if (formIsHalfFilledOut != false) {
  //     console.log();
  //     window.onbeforeunload = () => true;
  //   } else {
  //     window.onbeforeunload = undefined;
  //   }
  // });
  let DetailsToggle = () => {
    setToggle(!Toggle);
  };

  let onClickApproveInvoice = async () => {
    setApproveLoading(true);
    const config = {
      method: "PUT",
      url: UPDATE_INVOICE_STATUS,
      headers: authHeader(),
      data: {
        // userId: getUserId(),
        // invoiceId: invoiceID,
        // status: "Approved",
      webString: enCryptFun(
          JSON.stringify({
             userId: getUserId(),
        invoiceId: invoiceID,
        status: "Approved",
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
     // const { status } = response.data;
      let l = deCryptFun(response.data);
      const { status} = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", "Approved Successfully"));
        setFormValues({ ...formValues, status: "Approved" });
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlertToast("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    } finally {
      setApproveLoading(false);
    }
  };
  const errorFun = async (message) => {
    Swal.fire({
      title: "",
      text: message,
      icon: "warning",
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ok",
    }).then((result) => {
      if (result.isConfirmed) {
      }
    });
  };
  let GetDetails = async () => {
    const config = {
      method: "GET",
      url: GET_INVOICE_DETAILS,
      headers: authHeader(),
      params: {
        //invoiceId: invoiceID,
        webString: enCryptFun(
          JSON.stringify({
            invoiceId: invoiceID,
          })
        ),
        flutterString: "",
      },
    };
    try {
      window.setTimeout(
        () => Swal.fire(getAlertToast("success", "Loading....")),
        1000
      );
      const response = await API(config);
     //  const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        const initialData = data[0];
        const { teamId, emailContentFilePath } = initialData;
        setSubTeamId(teamId);
        setMessage(emailContentFilePath);
        localStorage.setItem("TEAM_SUB_ID", teamId);

        setType(initialData.orderNumber ? "po" : "nonpo");
        const reformattedData = {
          ...initialData,
          //  invoiceDate: initialData.invoiceDate
          //  ? moment(initialData.invoiceDate).format("MM/DD/YYYY")
          //    : "",
          dueDateYYYMMDD: initialData.dueDateYYYMMDD
            ? moment.parseZone(initialData.dueDateYYYMMDD).format("MM/DD/YYYY")
            : "",
        };

        setFormValues(reformattedData);

        if (data[0].filePath !== null) {
          const config = {
            method: "POST",
            url: ACCESS_S3_FILE,
            data: {  filePath: data[0].filePath
            },
            headers: authHeader(),
          };
          try {
            const response = await API(config);
           const { status, url } = response.data;
      //       let l = deCryptFun(response.data);
      // const { status, url } = JSON.parse(l);
            if (status === "Success") {
              setPreviewUrl(url);
            }
          } catch (error) {
            let errorObj = Object.assign({}, error);
            let { data } = errorObj.response;
            let { message } = data;
            Swal.fire(getAlertToast("Error", message));
          }
        }
      }
    } catch (error) {
      let errorObj = Object.assign({}, error);
      let { data } = errorObj.response;
      let { message } = data;
      // Swal.fire(getAlert("Error", message));
      errorFun(message);
     
    } finally {
      //  setLoading(false);
    }
  };
  let ns;
  if (emailbody) {
    ns = emailbody.split(/\r?\n/);
  }
  let onClickNextInvoice = async () => {
    Swal.fire(getAlertToast("success", "Loading...."));
    let amount;
    const configuser = {
      method: "GET",
      url: GET_USER_BY_ID,
      headers: authHeader(),
      params: {
       // userId: getUserId(),
        webString: enCryptFun(
          JSON.stringify({
        userId: getUserId(),
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(configuser);
     // const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
      if (status === "Success") {
      //  console.log("next invoice getuser", data[0])
        const { approvalAmountTo } = data[0];

        amount = approvalAmountTo;
      }
    } catch (error) {
     // Swal.fire("Error", error);
     if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    }
    const config = {
      method: "GET",
      url: NEXT_INVOICE_URL,
      headers: authHeader(),
      params: {
        // teamId: getRole() != "Supplier" || amount === -1 ? getTeamID() : 0,
        // senderEmail: getRole() == "Supplier" ? getSenderEmail() : "",
        // currentInvoiceId: invoiceID,
        webString: enCryptFun(
          JSON.stringify({
            teamId: getRole() != "Supplier" || amount === -1 ? getTeamID() : 0,
        senderEmail: getRole() == "Supplier" ? getSenderEmail() : "",
        currentInvoiceId: invoiceID,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      //const { status, data, message } = response.data;
      let l = deCryptFun(response.data);
      const { status, data,  message} = JSON.parse(l);
      if (status === "Success") {
        if (data.length === 0) {
          Swal.fire(getAlertToast("warning", "Next invoice is not available!"));
        } else {
         // console.log("Next invoice url data[0]", data[0])
          history.push(`${INVOICE_DETAILS_ROUTE}/${data[0].invoiceId}`, true);
          const initialData = data[0];
          const reformattedData = {
            ...initialData,
            // invoiceDate: initialData.invoiceDate ? moment(initialData.invoiceDate).format("MM/DD/YYYY") : "",
            dueDateYYYMMDD: initialData.dueDateYYYMMDD
              ? moment(initialData.dueDateYYYMMDD).format("MM/DD/YYYY")
              : "",
          };
          setFormValues(reformattedData);
        }
      } else {
        Swal.fire(getAlertToast("warning", message));
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlertToast("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    }
  };

  let CancelEdit = async () => {
    resetForm({});
    setTimerFlag(false);
    setIsEdit(false);
    unlockInvoice();
  };
  //Save
  const saveFormValues = async (values) => {
    const config = {
      method: "PUT",
      url: UPDATE_INVOICE,
      headers: authHeader(),
      data: {
        // ...values,
        // taxTotal:
        //   values.taxTotal === null
        //     ? values.taxTotal
        //     : values.taxTotal.toString(),
        // invoiceDate: moment(values.invoiceDate).format("YYYY-MM-DD"),
        // dueDateYYYMMDD: moment(values.dueDateYYYMMDD).format("YYYY-MM-DD"),
        // dueDate: moment(values.dueDateYYYMMDD).format("YYYY-MM-DD"),
        // updateBy: parseInt(getUserId()),
        webString: enCryptFun(
          JSON.stringify({
          ...values,
        taxTotal:
          values.taxTotal === null
            ? values.taxTotal
            : values.taxTotal.toString(),
        invoiceDate: moment(values.invoiceDate).format("YYYY-MM-DD"),
        dueDateYYYMMDD: moment(values.dueDateYYYMMDD).format("YYYY-MM-DD"),
        dueDate: moment(values.dueDateYYYMMDD).format("YYYY-MM-DD"),
        updateBy: parseInt(getUserId()),
          })
        ),
        flutterString: "",
      },
    };

    setLoading(true);
    try {
      const response = await API(config);
     // const { status } = response.data;
      let l = deCryptFun(response.data);
      const { status } = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", "Updated Successfully"));
        setIsEdit(!isEdit);
        // window.location.reload();
        GetDetails();
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlertToast("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    } finally {
      setLoading(false);
      setTimerFlag(false);
      unlockInvoice();
    }
  };

  let validationSchema = Yup.object({
    invoiceNumber: Yup.string()
      .test("invoiceNumberTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "invoiceNumber" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    documentType: Yup.string()
      .test("documentTypeTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "documentType" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    invoiceDate: Yup.string()
      .test("invoiceDateTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "invoiceDate" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    dueDateYYYMMDD: Yup.string()
      // .matches(REG_DATE, "Invalid date")
      .test("test", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "dueDate" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });

        return !value && found.length == 1 ? false : true;
        // return false;
      })
      .nullable(),
    // supplierName: Yup.string()
    //   .test("supplierNameTest", "Field is required", function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return (
    //         element.columnName === "supplierName" && element.isMandatory === 1
    //       );
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   })
    //   .nullable(),
    // supplierType: Yup.string()
    //   .test("supplierTypeTest", "Field is required", function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return (
    //         element.columnName === "supplierType" && element.isMandatory === 1
    //       );
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   })
    //   .nullable(),
    // supplierSite: Yup.string()
    //   .test("supplierSiteTest", "Field is required", function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return (
    //         element.columnName === "supplierSite" && element.isMandatory === 1
    //       );
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   })
    //   .nullable(),
    // supplierAddress: Yup.string()
    //   .test("supplierAddressTest", "Field is required", function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return (
    //         element.columnName === "supplierAddress" &&
    //         element.isMandatory === 1
    //       );
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   })
    //   .nullable(),
    invoiceCurrency: Yup.string()
      .test("invoiceCurrencyTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "invoiceCurrency" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    invoiceAmount: Yup.string()
      .test("invoiceAmountTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "invoiceAmount" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    dueAmount: Yup.string()
      .test("dueAmountTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "dueAmount" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    taxTotal: Yup.string()
      .test("taxTotalTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "taxTotal" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    // totalAmount: Yup.string().nullable(),
    source: Yup.string()
      .test("sourceTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "source" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    // taxNumber: Yup.string()
    //   .test("taxNumberTest", "Field is required", function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return (
    //         element.columnName === "taxNumber" && element.isMandatory === 1
    //       );
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   })
    //   .nullable(),
    // bankAccount: Yup.string()
    //   .test("bankAccountTest", "Field is required", function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return (
    //         element.columnName === "bankAccount" && element.isMandatory === 1
    //       );
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   })
    //   .nullable(),
    // sortCode: Yup.string()
    //   .test("sortCodeTest", "Field is required", function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return element.columnName === "sortCode" && element.isMandatory === 1;
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   })
    //   .nullable(),
    // swift: Yup.string()
    //   .test("swiftTest", "Field is required", function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return element.columnName === "swift" && element.isMandatory === 1;
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   })
    //   .nullable(),
    // iban: Yup.string()
    //   .test("ibanTest", "Field is required", function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return element.columnName === "iban" && element.isMandatory === 1;
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   })
    //   .nullable(),
    paidAmount: Yup.number("Must be number")
      .test("paidAmountTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "paidAmount" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })

      // .positive()
      .nullable(),
    invoiceDescription: Yup.string()
      .test("invoiceDescriptionTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "invoiceDescription" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    senderEmail: Yup.string()
      .test("senderEmailTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "supplierEmail" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    orderNumber: Yup.string()
      .test("orderNumberTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "orderNumber" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    name: Yup.string()
      .test("nameTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "name" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
    phoneNumber: Yup.string()
      .test("phoneNumberTest", "Field is required", function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "phoneNumber" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      })
      .nullable(),
  });

  const getdateFormatSetting = async () => {
    const configget = {
      method: "GET",
      url: GET_FORMAT_SETTING_URL,
      params: {
        //teamId: getTeamID(),
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
          })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };

    try {
      const response = await API(configget);
     // const { message, data } = response.data;
      let l = deCryptFun(response.data);
      const { message, data } = JSON.parse(l);
      if (message === "Success") {
        const { dateFormat = "" } = data;
        setFormatType(dateFormat);
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // Swal.fire("Error", data.message);
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    }
  };
  useEffect(() => {
    getdateFormatSetting(getTeamID());
  }, []);
  const {
    handleSubmit,
    handleChange,
    values,
    errors,
    resetForm,
    touched,
    setValues,
    setErrors,
  } = useFormik({
    initialValues: { ...formValues },
    enableReinitialize: true,
    validationSchema,
    onSubmit(values) {
      saveFormValues(values);
    },
  });

  let FieldCheck = () => {
    const Field = requiredFieldList.filter(
      (data) =>
        data.isRequired === 1 &&
        data.isVisible === 1 &&
        data.moduleName === "Invoice"
    );
    const FieldforTax = requiredFieldList.filter(
      (data) =>
        data.isRequired === 1 &&
        data.isVisible === 1 &&
        data.moduleName === "Invoice" &&
        data.columnName === "taxTotal"
    );
    var found = Field.filter(function (element) {
      return values[element.columnName];
    });
    var foundCount = parseInt(found.length);
    if (FieldforTax.length > 0) {
      if (values["taxTotal"] === 0) {
        foundCount = foundCount + 1;
      }
    }
    if (foundCount == Field.length) {
      Swal.fire({
        title: "Do you want to Approve?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Approve",
      }).then((result) => {
        if (result.isConfirmed) {
          onClickApproveInvoice();
        }
      });
    } else {
      Swal.fire(
        getAlert(
          "Alert",
          "Required fields Are not filled. You won't be able to Approve this!"
        )
      );
    }
  };

  const {
    orderNumber,
    status,
    filePath,
    invoiceStatus,
    supplierStatus,
    invoicePOStatus,
    invoiceNumber,
    senderEmail,
    extractEngineFailed,
  } = values;
  let Download = async (e) => {
    const urlfromSelection = e.currentTarget.dataset.url;
    const flag = e.currentTarget.dataset.flag;
    if (urlfromSelection) {
      const config = {
        method: "POST",
        url: ACCESS_S3_FILE,
        data: { filePath: urlfromSelection,
        },
        headers: authHeader(),
      };
      try {
        const response = await API(config);
        const { status, url } = response.data;
      //    let l = deCryptFun(response.data);
      // const { status, url} = JSON.parse(l);
        if (status === "Success") {
          setDownloadURL(url);
          if (flag === "pdf") {
            Axios.get(url, {
              responseType: "blob",
            }).then((res) => {
              fileDownload(res.data, "filename.pdf");
            });
          } else if (flag === "json") {
            Axios.get(url, {
              responseType: "blob",
            }).then((res) => {
              fileDownload(res.data, "filename.json");
            });
          }
          // const link = document.createElement("a");
          // link.href = url;
          // link.setAttribute("download", `FileName.pdf`);
          // document.body.appendChild(link);

          // link.download = url;
          // link.click();
          // document.body.removeChild(link);
        }
      } catch (error) {
        let errorObj = Object.assign({}, error);
        let { data } = errorObj.response;
        let { message } = data;
        Swal.fire(getAlertToast("Error", message));
         
      }
    } else {
      Swal.fire(getAlertToast("error", "No file is found!"));
    }
  };

  const onDocumentError = async (e) => {
    console.log("error", e);
  };
  const backClick = async () => {
    unlockInvoice();
    history.push(INVOICE_ROUTE);
  };

  // console.error(
  //   "validation status",
  //   orderNumber,
  //   orderNumber && invoicePOStatus !== "Success",
  //   approveLoading ||
  //     supplierStatus !== "Success" ||
  //     invoiceStatus !== "Success" ||
  //     (orderNumber && invoicePOStatus !== "Success")
  // );
  const Refresh = () => {
    window.location.reload();
  };

  const [suppFlag, setSupFlag] = useState(false);
  const notifySupplier = () => {
    setSupFlag(true);
  };
  let CloseToggle = () => {
    setSupFlag(false);
  };
  const [chatFlag, setChatFlag] = useState(false);
  const chatFun = () => {
    setChatFlag(true);
    setToggle1(!Toggle1);
  };
  const [auditFlag, setAuditFlag] = useState(false);
  const onClickAudit = () => {
    setAuditFlag(true);
  };
  const callBack = () => {
    setAuditFlag(!auditFlag);
  };
  const [count, setCount] = useState(0);
  const getComment = async (value) => {
    const getconfig = {
      method: "GET",
      url: COMMENT_LIST_URL,
      headers: authHeader(),
      params: {
        // teamId: getTeamID(),
        // postedBy: value ? value : "",
        // invoiceId: invoiceID,
      webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
        postedBy: value ? value : "",
        invoiceId: invoiceID,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(getconfig);
     // const { status, message, data, count } = response.data;
       let l = deCryptFun(response.data);
      const { status, message,data, count } = JSON.parse(l);
      setCount(count);
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlert("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    }
  };
  useEffect(() => {
    getComment();
  }, []);
  return (
    <Fragment>
      <div className="wrapper">
        <Sidebar />

        <div className="page-content-wrapper">
          <Container fluid={true}>
            <div className="page-title">
              <h3>Invoice Details</h3>
              {/* {timerFlag ? (
                <Timer
                  initialTime={15000}
                  direction="backward"
                  checkpoints={[
                    {
                      time: 0,
                      callback: () => saveFormValues(values),
                    },
                  ]}
                >
                  <Timer.Hours />
                  hr :
                  <Timer.Minutes />
                  min:
                  <Timer.Seconds />
                  sec
                </Timer>
              ) : (
                ""
              )} */}
              <Button
                className="next-invoicebtn"
                color="primary"
                onClick={onClickNextInvoice}
              >
                Next Invoice{" "}
                <svg
                  className="ml-3"
                  xmlns="http://www.w3.org/2000/svg"
                  width="6.874"
                  height="12.023"
                  viewBox="0 0 6.874 12.023"
                >
                  <path
                    id="Icon_ionic-ios-arrow-back"
                    data-name="Icon ionic-ios-arrow-back"
                    d="M16.052,12.2,11.5,7.658A.859.859,0,1,1,12.72,6.445L17.874,11.6A.858.858,0,0,1,17.9,12.78l-5.176,5.186a.859.859,0,0,1-1.217-1.213Z"
                    transform="translate(-11.251 -6.194)"
                    fill="#fff"
                  />
                </svg>
              </Button>
              <div className="rightside">
                {/* <Link to={INVOICE_ROUTE}> */}
                {/* <div className="PageTopSearch"> */}
                <div style={{ paddingTop: "10px" }}>
                  <svg
                    onClick={Refresh}
                    className="mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    width="22.292"
                    height="22.319"
                    viewBox="0 0 22.292 22.319"
                  >
                    <path
                      id="Icon_open-reload"
                      data-name="Icon open-reload"
                      d="M11.16,0a11.16,11.16,0,1,0,7.923,19.083l-2.009-2.009A8.376,8.376,0,1,1,11.132,2.79a8.116,8.116,0,0,1,5.831,2.539L13.922,8.37h8.37V0l-3.32,3.32A11.1,11.1,0,0,0,11.132,0Z"
                      fill="#ff7619"
                    />
                  </svg>
                </div>
                {/* </div> */}
                <Button outline color="secondary" onClick={backClick}>
                  Back
                </Button>
                {/* </Link> */}
                <Button
                  className="ml-2"
                  color="primary"
                  onClick={DetailsToggle}
                >
                  Preview
                </Button>

                <Dropdown
                  className="ml-2"
                  isOpen={dropdownOpen}
                  toggle={toggle}
                >
                  <DropdownToggle
                    color="primary"
                    caret
                    disabled={formValues.filePath ? false : true}
                  >
                    Download
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      data-url={formValues.filePath}
                      data-flag="pdf"
                      onClick={Download}
                    >
                      PDF File
                    </DropdownItem>
                    <DropdownItem
                      data-url={formValues.textractJson}
                      data-flag="json"
                      onClick={Download}
                    >
                      Extract JSON
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>

            <h4 className="pl-3">
              Invoice: {formValues.invoiceNumber}
              {(formValues.senderEmail &&
                (formValues.senderEmail === "supplier@dummy.com" ||
                  formValues.senderEmail === "N/A")) ||
              getRole() === "Supplier" ? (
                ""
              ) : (
                <Button
                  className="ml-2"
                  color="primary"
                  onClick={notifySupplier}
                  disabled={!formValues.senderEmail}
                >
                  Notify Supplier
                </Button>
              )}
            </h4>
            {/* {extractEngineFailed === 1 ? (
              <p>
                We had issues while extracting the file, please upload a good
                quality invoice.
              </p>
            ) : (
              ""
            )} */}
            <>
              <br />
              <Button color="primary" onClick={onClickAudit}>
                Audit
              </Button>
            </>
            <div className="p-3">
              <div className="ValidationStatusTable card card-body w-100">
                <p>Validation Status</p>
                <table className="table w-100">
                  <thead>
                    <tr>
                      <th scope="col">Invoice Status</th>
                      <th scope="col">Supplier Status</th>
                      <th scope="col">PO Status</th>
                      {/* <th scope="col"></th> */}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td key={`invoiceStatus_${invoiceStatus}`}>
                        <Badge color={validationStatusConfig[invoiceStatus]}>
                          {invoiceStatus}
                        </Badge>
                      </td>
                      <td key={`supplierStatus_${supplierStatus}`}>
                        <Badge color={validationStatusConfig[supplierStatus]}>
                          {supplierStatus}
                        </Badge>
                      </td>
                      <td key={`invoicePOStatus_${invoicePOStatus}`}>
                        <Badge color={validationStatusConfig[invoicePOStatus]}>
                          {invoicePOStatus}
                        </Badge>
                      </td>
                      {/* <td>
                        <Fragment>
                          {status &&
                            status !== "Approved" &&
                            status !== "Auto Approved" &&
                            getRole() !== "Supplier" && (
                              <Button
                                className="d-none-767"
                                size="lg"
                                color="primary"
                                onClick={FieldCheck}
                                disabled={
                                  approveLoading ||
                                  supplierStatus !== "Valid" ||
                                  invoiceStatus !== "Valid" ||
                                  (orderNumber && invoicePOStatus !== "Valid")
                                }
                              >
                                {approveLoading && <Spinner color="light" />}
                                Approve
                              </Button>
                            )}
                        </Fragment>
                      </td> */}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="cus-row ">
              {/* <Col md="12" lg="6" xl="5"> */}

              <Col md="6">
                <Card body>
                  <Form form="true" onSubmit={handleSubmit}>
                    <Nav tabs>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "1" })}
                          onClick={() => {
                            tabToggle("1");
                          }}
                        >
                          Invoice Data
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "2" })}
                          onClick={() => {
                            tabToggle("2");
                          }}
                        >
                          Invoice Line Data
                        </NavLink>
                      </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId="1">
                        <div className="invoiceDetails">
                          <div className="mb-4">
                            <FormGroup check inline className="pl-0">
                              <Label className="w-100 mt-4" check>
                                {((status && status === "Approved") ||
                                  status === "Auto Approved") && (
                                  <h6>
                                    {" "}
                                    <Label className="mr-2" for="invoiceType">
                                      Invoice Type:{" "}
                                    </Label>
                                    {orderNumber ? "PO" : "NON PO"}
                                  </h6>
                                )}
                                {status &&
                                  status !== "Approved" &&
                                  status !== "Auto Approved" && (
                                    <Fragment>
                                      <div className="invoice-radio-bg">
                                        <Input
                                          type="radio"
                                          name="type"
                                          id="po"
                                          checked={type === "po" ? true : false}
                                          onChange={onPoRadioChange}
                                        />
                                        PO
                                      </div>
                                      <div className="invoice-radio-bg">
                                        <Input
                                          type="radio"
                                          name="type"
                                          id="nonpo"
                                          checked={
                                            type === "nonpo" ? true : false
                                          }
                                          onChange={onNonpoRadioChange}
                                        />
                                        NON PO
                                      </div>
                                    </Fragment>
                                  )}
                              </Label>
                            </FormGroup>
                          </div>
                          <InvoiceForm
                            isEdit={isEdit}
                            errors={errors}
                            requiredFieldList={requiredFieldList}
                            touched={touched}
                            handleChange={handleChange}
                            values={values}
                            defaultInvoiceType={type}
                            setFormValues={setFormValues}
                            setValues={setValues}
                            setErrors={setErrors}
                          />
                        </div>
                      </TabPane>
                      <TabPane tabId="2">
                        <List
                          invoiceID={invoiceID}
                          key={invoiceID}
                          status={status}
                        ></List>
                      </TabPane>
                    </TabContent>

                    <div className="wf-ma mt-5 mb-4">
                      {isEdit ? (
                        <Fragment>
                          <Button outline color="primary" onClick={CancelEdit}>
                            Cancel
                          </Button>
                          <Button color="primary" type="submit">
                            {" "}
                            {loading && <Spinner color="light" />}Update
                          </Button>
                        </Fragment>
                      ) : (
                        <Fragment>
                          {status &&
                          status !== "Approved" &&
                          status !== "Auto Approved" ? (
                            <>
                              {/* {getRole() !== "Supplier" && ( */}
                              <Button
                                className="mr-2"
                                outline
                                color="primary"
                                onClick={onClickEdit}
                              >
                                Edit Invoice
                              </Button>
                              {/* )} */}
                              <Link to={UPLOAD_INVOICE_ROUTE + "/" + invoiceID}>
                                <Button color="primary">Reupload</Button>
                              </Link>
                              {getRole() !== "Supplier" && (
                                <Button
                                  className="resApproveBtn"
                                  color="primary"
                                  onClick={FieldCheck}
                                  disabled={
                                    approveLoading ||
                                    supplierStatus !== "Valid" ||
                                    invoiceStatus !== "Valid" ||
                                    (orderNumber && invoicePOStatus !== "Valid")
                                  }
                                >
                                  {approveLoading && <Spinner color="light" />}
                                  Approve
                                </Button>
                              )}
                            </>
                          ) : (
                            ""
                          )}
                        </Fragment>
                      )}
                    </div>
                  </Form>
                </Card>
              </Col>

              <Col md="6" className="d-none-767">
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTabsec === "1" })}
                      onClick={() => {
                        tabTogglesec("1");
                      }}
                    >
                      Invoice Preview
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTabsec === "2" })}
                      onClick={() => {
                        tabTogglesec("2");
                      }}
                    >
                      Email Body
                      {emailbody ? (
                        <FaExclamationTriangle color="#ff8811" />
                      ) : (
                        ""
                      )}
                    </NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={activeTabsec}>
                  <TabPane tabId="1">
                    <TransformWrapper
                      defaultScale={1}
                      defaultPositionX={200}
                      defaultPositionY={100}
                    >
                      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                        <Fragment>
                          <div className="tools">
                            <button onClick={zoomIn}>+</button>
                            <button onClick={zoomOut}>-</button>
                            <button onClick={resetTransform}>x</button>
                          </div>

                          <TransformComponent>
                            <Document
                              key={previewUrl}
                              file={previewUrl}
                              onLoadSuccess={onDocumentLoadSuccess}
                              onLoadError={onDocumentError}
                              noData="Loading PDF..."
                            >
                              <Page pageNumber={pageNumber} />
                            </Document>
                            {/* )} */}
                          </TransformComponent>
                        </Fragment>
                      )}
                    </TransformWrapper>
                    {numPages ? (
                      <div>
                        <button
                          disabled={pageNumber <= 1}
                          onClick={previousPage}
                          type="button"
                        >
                          <FaChevronLeft />
                        </button>
                        <span>
                          {`Page ${pageNumber || (numPages ? 1 : "--")} of ${
                            numPages || "--"
                          }`}
                        </span>
                        <button
                          disabled={pageNumber >= numPages}
                          onClick={nextPage}
                          type="button"
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                  </TabPane>
                  <TabPane tabId="2">
                    <div>
                      {" "}
                      {emailbody ? (
                        ns &&
                        ns.map((record, i) => {
                          return <p>{record}</p>;
                        })
                      ) : (
                        <p>No Message</p>
                      )}
                    </div>
                  </TabPane>
                </TabContent>
              </Col>
            </div>

            {/* chat section */}
            {/* <Badge count={1}> */}
            <div className="chat-btn" onClick={chatFun}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="36px"
                viewBox="0 0 24 24"
                width="36px"
                fill="#FFFFFF"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" />
              </svg>
              {count > 0 ? <span className="count">{count}</span> : ""}
            </div>
            {/* </Badge> */}
            {/* {chatFlag === true ? ( */}

            {/* ) : (
              ""
            )} */}
          </Container>
        </div>

        {Toggle && (
          <Preview
            filePath={formValues.filePath}
            fileContent={formValues.emailContentFilePath}
            Toggle={Toggle}
            DetailsToggle={DetailsToggle}
            renderMode="canvas"
          />
        )}
        {Toggle1 && (
          <ChatSection
            Toggle1={Toggle1}
            chatFun={chatFun}
            chatFlag={chatFlag}
            invoiceID={invoiceID}
          />
        )}
      </div>

      {/* {
        downloadURL && 
        fileDownload(downloadURL, "filename.csv")
        <iframe
          title={downloadURL}
          src="http://www.africau.edu/images/default/sample.pdf"
          frameborder="0"
          height="700px"
          width="100%"
        ></iframe>
      } */}
      {/* <Prompt
        when={lockFlag}
        message="You have not unlock !, are you sure you want to leave?"
      /> */}
      {suppFlag && (
        <NotifySupplier
          suppFlag={suppFlag}
          CloseToggle={CloseToggle}
          number={formValues.invoiceNumber}
          email={formValues.senderEmail}
        />
      )}
      {auditFlag && (
        <AuditLog
          auditFlag={auditFlag}
          callBack={callBack}
          invoiceId={invoiceID}
        />
      )}
    </Fragment>
  );
}
