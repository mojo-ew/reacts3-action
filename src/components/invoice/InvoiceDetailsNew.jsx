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
  Row,
  Modal,
  ModalBody
} from "reactstrap";
import Sidebar from "../layout/Sidebar";
import {
  INVOICE_DETAILS_NEW_ROUTE,
  INVOICE_DETAILS_ROUTE,
  INVOICE_ROUTE,
  UPLOAD_INVOICE_ROUTE
  
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
  TRAINING_DATASET_URL,
  SAVE_TRAINING_DATASET_URL,
  TRAINING_DATA_STORAGE_URL,
  GET_TRAINED_DATASET_URL,
  EXTRACTION_FORM_URL,
  GET_KEYVALUES_BY_SUPPLIERNAME,
  GET_ASSIGNER_LIST,
  TEAM_MEMBER_ASSIGN,
  GET_EXCEPTION_HANDLER_ROLE_URL,
  GET_GLCODE,
  GET_ASSIGNED_GLCODE_VALUE
} from "../common/url";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import {
  deCryptFun,
  enCryptFun,
  getApprovalAmount,
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
import InvoiceFormNew from "./InvoiceFormNew";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import InvoiceFormNewExtract from "./InvoiceFormNewExtract";
import ExceptionHandlerModel from "./ExceptionHandlerModel";
import { NUMBERS_AND_SLASH_SYMBOLS_REGEX, NUMBERS_ONLY_REGEX } from "../common/Rejex";
import { UPDATE_USER_PROFILE } from "../redux/actionTypes";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.5.207/pdf.worker.js`;

export default function InvoiceDetailsNew() {
  var fileDownload = require("js-file-download");

  const history = useHistory();
  const [timerFlag, setTimerFlag] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [Toggle, setToggle] = useState(false);
  const [Toggle1, setToggle1] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingdetect, setDetectLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false)
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
  const [keyChangeFlag, setKeyFlag] = useState(false);
  const [detectedData, setDetectedData] = useState({});
  const [dynamicVal, setDynamicVal] = useState([]);
  const [dateShow, setDateShow] = useState(false)
  const [updateKey, setUpdateKey] = useState(false)
  const [buttonClicked, setButtonClicked] = useState("")
  const [currentInvoiceKeyPair, setCurrentInvoiceKeyPair] = useState([]);
  const [newSupplierSet, setNewSupplierSet] = useState([])
  const [teamMemberId, setTeamMemberId] = useState(0);
  const [teamMemberList, setTeamMemberList] = useState([]);
  const [exceptionFlagModel, setExceptionFlagModel] = useState(false)
  const [screenDisable, setScreenDisable] = useState();
  const [moveStatus, setMoveStatus] = useState(false)
  const [detectedTableData, setDetectedTableData] = useState({})
  const [GlCode,setGlCode]=useState("");
 
localStorage.setItem("ID",invoiceID)

  const dispatch = useDispatch();

  // const [rawsec, setRawSec] = useState([]);
  const { arraval } = useSelector((state) => state.trainingArray);
  const [fieldArray, setFieldArray] = useState([
    {
      fieldName: "",
      targetVariable: "invoiceNumber",
    },
    {
      fieldName: "",
      targetVariable: "dueDate",
    },
    {
      fieldName: "",
      targetVariable: "invoiceAmount",
    },
    {
      fieldName: "",
      targetVariable: "dueAmount",
    },
    {
      fieldName: "",
      targetVariable: "orderNumber",
    },
    {
      fieldName: "",
      targetVariable: "invoiceDate",
    },
    {
      fieldName: "",
      targetVariable: "taxTotal",
    },
  ]);
  const [keyData, setKeyData] = useState([]);
  const [jobId, setJobId] = useState();
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

  //Get Key Pair values: Displayed in third column.
  const getKeyPairValues = async () => {
    const configkp = {
      method: "GET",
      url: EXTRACTION_FORM_URL,
      headers: authHeader(),
      params: {
        webString: enCryptFun(
          JSON.stringify({
            invoiceId: invoiceID,
          })
        ),
        flutterString: "",
      },
    };
    try {
      //console.log("INSIDE TRY")
      const response = await API(configkp);
      // console.log("TRY response", response)
      let l = deCryptFun(response.data);
      const { status, documentData = "", detectedEntities } = JSON.parse(l);
      //  console.log("JSONParsed", JSON.parse(l))
      if (status == "Success") {
        if (documentData != "N/A") {
          console.log("documentData", documentData)
          setDynamicVal(documentData);
          setCurrentInvoiceKeyPair(documentData)
        } else {
          setDynamicVal([]);
          setCurrentInvoiceKeyPair([])
        }
      }
    } catch (error) {
      console.error(error);

    }
  };

  //Invoice Pre selected values
  const getPreSelectValues = async () => {
    setDetectLoading(true);
    const configps = {
      method: "GET",
      url: GET_TRAINED_DATASET_URL,
      headers: authHeader(),
      params: {
        // invoiceId: invoiceID,
        webString: enCryptFun(
          JSON.stringify({
            invoiceId: invoiceID,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(configps);

      // const { status, data = "" } = response.data;
      let l = deCryptFun(response.data);
      // console.log("detected parsed",JSON.parse(l))
      const { status, data = "" } = JSON.parse(l);

      if (status == "Success") {
        setDetectedData(data);
        setDetectedTableData(data);

      }
    } catch (error) {
      console.error(error);
    } finally {
      setDetectLoading(false);
    }
  };


  const getPreSelectValuesNewSupplier = async (newInvoiceId, newSupplierKeyPair) => {
    setDetectLoading(true);
    const configps = {
      method: "GET",
      url: GET_TRAINED_DATASET_URL,
      headers: authHeader(),
      params: {
        // invoiceId: invoiceID,
        webString: enCryptFun(
          JSON.stringify({
            invoiceId: newInvoiceId ? newInvoiceId : invoiceID,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(configps);

      // const { status, data = "" } = response.data;
      let l = deCryptFun(response.data);

      const { status, data = "" } = JSON.parse(l);

      if (status == "Success") {
        setDetectedData(data);
        let detectedArray = Object.keys(data)
        // console.log("detected Array", detectedArray)
        let newobjectCreated = detectedArray.map(el => {
          //let keyofobj = el

          let properties = { label: data[el].label, value: formValues[el] }
          return properties;
        })
        // console.log("newObject", newobjectCreated)
        if (newobjectCreated) {
          let destructuredkeypair = newSupplierKeyPair.map(el => {
            let properties = {}
            let datamatch = newobjectCreated.find((val) => val.label == el.label)
            // console.log("datamatch", datamatch)
            if (newobjectCreated.find((val) => el.label === val.label)) {

              properties = { "label": el.label, "value": datamatch.value }
            }
            else {
              properties = { "label": el.label, "value": el.value }
            }
            return properties;
          })
          setDynamicVal(destructuredkeypair)
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDetectLoading(false);
    }
  };

  useEffect(() => {
    getPreSelectValues();
    getKeyPairValues();
  }, []);


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
      //const { status } = response.data;
      let l = deCryptFun(response.data);
      const { status } = JSON.parse(l);
      if (status === "Success") {
        
        console.error("success");
      }
    } catch (error) {
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        Swal.fire(getAlert("Error", v.message));
      }
    } finally {
      setLockFlag(false);
      localStorage.setItem("EDIT_IN_PROCESS",false)
    }
  };
  const onPoRadioChange = (e) => {
    setType("po");
  };

  const onNonpoRadioChange = (e) => {
    setType("nonpo");
  };

  const onClickEdit = async () => {
    setButtonClicked("editButton")
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
      //const { status, data } = response.data;
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
          localStorage.setItem("EDIT_IN_PROCESS",true)
        }
      }
    } catch (error) {
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        Swal.fire(getAlert("Error", v.message));
      }
    }
  };
  const GetRequiredValues = async () => {
    const config = {
      method: "GET",
      url: GET_INVOICE_FIELDS,
      params: {
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
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        setRequiredFieldList(data);
      }
    } catch (error) {

      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        Swal.fire(getAlert("Error", v.message));
      }
    }
  };

  useEffect(() => {
    GetDetails();
    // GetRequiredValues();
  }, [invoiceID]);
  useEffect(() => {
    GetRequiredValues();
  }, [subTeamId]);

  let DetailsToggle = () => {
    setToggle(!Toggle);
  };



  let GetInitialValues = async () => {
    console.log("supplier name before cancel", name)
    const config = {
      method: "GET",
      url: GET_INVOICE_DETAILS,
      headers: authHeader(),
      params: {
        // invoiceId: invoiceID,
        webString: enCryptFun(
          JSON.stringify({
            invoiceId: invoiceID,
          })
        ),
        flutterString: "",
      },
    };
    setLoading(true)
    try {
      window.setTimeout(
        () => Swal.fire(getAlertToast("success", "Loading....")),
        1000
      );
      const response = await API(config);
      //const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        console.log("inital values")
        const initialData = data[0];
        const reformattedData = {
          ...initialData,

          dueDate: initialData.dueDate
            ? moment.parseZone(initialData.dueDate).format("MM/DD/YYYY")
            : "",
          invoiceDate: initialData.invoiceDate
            ? moment.parseZone(initialData.invoiceDate).format("MM/DD/YYYY")
            : "",
          dueDateYYYMMDD: initialData.dueDateYYYMMDD
            ? moment.parseZone(initialData.dueDateYYYMMDD).format("MM/DD/YYYY")
            : null,
        };
        setFormValues(reformattedData);
        //onCancelSupplierKeyPair(initialData.name)
      }
    } catch (error) {

      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        errorFun(v.message)
      }
    } finally {
      setLoading(false);
      setDateShow(!dateShow)
    }
  }

  let onClickApproveInvoice = async () => {
    setApproveLoading(true);

    // if (keyChangeFlag == true) {

    let filteredArray = fieldArray.filter((element) => element.fieldName != "");
    const keycongigure = {
      method: "POST",
      url: SAVE_TRAINING_DATASET_URL,
      headers: authHeader(),
      data: {
        supplierName: values.name,
        entityDataset: filteredArray,
        invoiceId: invoiceID,
      },
    };
    try {
      const response = await API(keycongigure);

    } catch (error) {
      console.log("error", error);
    } finally {
      setKeyFlag(false);
    }
    // }
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
      //const { status } = response.data;
      let l = deCryptFun(response.data);
      const { status } = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", "Approved Successfully"));
        setFormValues({ ...formValues, status: "Approved" });
      }
    } catch (error) {

      if (error.response) {
        let { data } = error.response
        let p = deCryptFun(data);
        let v = JSON.parse(p)
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
    //console.log("dec.....", invoiceID)
    const config = {
      method: "GET",
      url: GET_INVOICE_DETAILS,
      headers: authHeader(),
      params: {
        // invoiceId: invoiceID,
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
      //const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        const initialData = data[0];
        const { teamId, emailContentFilePath, analysisJobId ,name } = initialData;
        
        setJobId(analysisJobId);
        setSubTeamId(teamId);
        setMessage(emailContentFilePath);
        localStorage.setItem("TEAM_SUB_ID", teamId);

        setType(initialData.orderNumber ? "po" : "nonpo");
        //console.log("initialData dueDate, invoiceDate", initialData.dueDate, initialData.invoiceDate)
        const reformattedData = {
          ...initialData,
          dueDate: initialData.dueDate
            ? moment.parseZone(initialData.dueDate).format("MM/DD/YYYY")
            : "",
          invoiceDate: initialData.invoiceDate
            ? moment.parseZone(initialData.invoiceDate).format("MM/DD/YYYY")
            : "",
          dueDateYYYMMDD: initialData.dueDateYYYMMDD
            ? moment.parseZone(initialData.dueDateYYYMMDD).format("MM/DD/YYYY")
            : "",

        };
        console.log("getDetails on value field", initialData)
        setFormValues(reformattedData);

        if (data[0].filePath !== null) {
          const config = {
            method: "POST",
            url: ACCESS_S3_FILE,
            data: {
              filePath: data[0].filePath
            },
            headers: authHeader(),
          };
          try {
            const response = await API(config);
            const { status, url } = response.data;
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
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // // Swal.fire(getAlert("Error", message));
      // errorFun(message);
      if (error.response) {
        let { data } = error.response
        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        Swal.fire(getAlert("Error", v.message));
      }

    } finally {
      //  setLoading(false);
    }
  };
 
  let ns;
  if (emailbody) {
    ns = emailbody.split(/\r?\n/);
  }
  let onClickNextInvoice = async () => {
    if (buttonClicked == "editButton") {
      Swal.fire("Message", "Update or Cancel current invoice")
    }
    else {
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
        const { status, data } = JSON.parse(l);
        if (status === "Success") {
          // console.log("next invoice getuser", data[0])
          const { approvalAmountTo } = data[0];

          amount = approvalAmountTo;
          //console.log("amount", amount)
        }
      } catch (error) {
        //Swal.fire("Error", error);
        if (error.response) {
          let { data } = error.response
          let p = deCryptFun(data);
          let v = JSON.parse(p)
          // console.log("error data new",  v.message)
          Swal.fire("Error", v.message);
        }
      }
      //  console.log("invoice id passing", invoiceID)
      const config = {
        method: "GET",
        url: NEXT_INVOICE_URL,
        headers: authHeader(),
        params: {
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
        // const { status, data, message } = response.data;
        let l = deCryptFun(response.data);
        const { status, data, message } = JSON.parse(l);
        if (status === "Success") {
          if (data.length === 0) {
            Swal.fire(getAlertToast("warning", "Next invoice is not available!"));
          } else {
            // console.log("next invoice url data", data)
            history.push(
              `${INVOICE_DETAILS_NEW_ROUTE}/${data[0].invoiceId}`,
              true
            );
            const initialData = data[0];
            const reformattedData = {
              ...initialData,
              // invoiceDate: initialData.invoiceDate ? moment(initialData.invoiceDate).format("MM/DD/YYYY") : "",
              dueDate: initialData.dueDate
                ? moment(initialData.dueDate).format("MM/DD/YYYY")
                : "",
              invoiceDate: initialData.invoiceDate
                ? moment.parseZone(initialData.invoiceDate).format("MM/DD/YYYY")
                : "",
              dueDateYYYMMDD: initialData.dueDateYYYMMDD
                ? moment.parseZone(initialData.dueDateYYYMMDD).format("MM/DD/YYYY")
                : "",
            };
            setFormValues(reformattedData);

            if (data[0].filePath !== null) {
              const config = {
                method: "POST",
                url: ACCESS_S3_FILE,
                data: {
                  filePath: data[0].filePath
                },
                headers: authHeader(),
              };
              try {
                const response = await API(config);
                const { status, url } = response.data;
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
        } else {
          Swal.fire(getAlertToast("warning", message));
        }
      } catch (error) {
        let errorObj = Object.assign({}, error);
        let { data } = errorObj.response;
        let { message } = data;
        Swal.fire(getAlertToast("Error", message));

      }
    }
  };

  let CancelEdit = async () => {

    resetForm({});
    getPreSelectValues()
    getKeyPairValues()
    GetInitialValues()
    setTimerFlag(false);
    setIsEdit(false);
    unlockInvoice();
    setButtonClicked("cancelButton")
  };
  //Save
  const saveFormValues = async (values) => {
    // update
    // if (keyChangeFlag == true) {
    setUpdateKey(true)
    const keycongigure = {
      method: "POST",
      url: TRAINING_DATA_STORAGE_URL,
      headers: authHeader(),
      data: {
        invoiceId: parseInt(invoiceID),
        entityDatasetDetails: fieldArray,

      },
    };
    try {
      const response = await API(keycongigure);
    } catch (error) {
      console.log("error", error);
    } finally {
      setKeyFlag(false);
    }
    // }


    setIsEdit(!isEdit);
    //console.log("values on update", "invAmt",values.invoiceAmount ?  values.invoiceAmount.toString() : "", "dueAmt",values.dueAmount ? values.dueAmount.toString() :"", "tax", values.taxTotal ? values.taxTotal.toString() : "")
    console.log("on update Values", {
      ...values,
      taxTotal: values.taxTotal ? values.taxTotal.toString() : "",
      invoiceAmount: values.invoiceAmount ? values.invoiceAmount.toString() : "",
      dueAmount: values.dueAmount ? values.dueAmount.toString() : "",
      invoiceDate: moment(values.invoiceDate).format("YYYY-MM-DD"),
      dueDateYYYMMDD: moment(values.dueDateYYYMMDD).format("YYYY-MM-DD"),
      dueDate: moment(values.dueDate).format("YYYY-MM-DD"),
      updateBy: parseInt(getUserId()),
    })
    const config = {
      method: "PUT",
      url: UPDATE_INVOICE,
      headers: authHeader(),

      data: {
        webString: enCryptFun(
          JSON.stringify({
            ...values,
            taxTotal: values.taxTotal ? values.taxTotal.toString() : "",
            invoiceAmount: values.invoiceAmount ? values.invoiceAmount.toString() : "",
            dueAmount: values.dueAmount ? values.dueAmount.toString() : "",
            invoiceDate: moment(values.invoiceDate).format("YYYY-MM-DD"),
            dueDateYYYMMDD: moment(values.dueDateYYYMMDD).format("YYYY-MM-DD"),
            dueDate: moment(values.dueDate).format("YYYY-MM-DD"),
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
        getPreSelectValues();
      }
    } catch (error) {
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        Swal.fire(getAlert("Error", v.message));
        //console.log("v.message")
      }
    } finally {
      setLoading(false);
      setButtonClicked("updateButton")
      setTimerFlag(false);
      unlockInvoice();
      setUpdateKey(false)
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
        //console.log("value", value)
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
    dueDate: Yup.string()
      // .matches(/(^[0-9/]+)/, "Allow preferred date format")
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
      // .matches(NUMBERS_AND_SLASH_SYMBOLS_REGEX, 'Accept only preferred date format')
      .nullable(),

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
      .matches(NUMBERS_ONLY_REGEX, 'Invalid currency')
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
      .matches(NUMBERS_ONLY_REGEX, 'Invalid currency')
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
      .matches(NUMBERS_ONLY_REGEX, 'Invalid currency')
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

    paidAmount: Yup.string()
      //("Must be number")
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
      .matches(NUMBERS_ONLY_REGEX, 'Invalid currency')
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
      let l = deCryptFun(response.data);
      const { message, data } = JSON.parse(l);
      if (message === "Success") {
        const { dateFormat = "" } = data;
        setFormatType(dateFormat);
      }
    } catch (error) {
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
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

  const onClickRejectInvoice = () => {
    Swal.fire({
      input: 'textarea',
      inputLabel: 'Give Comments...',
      inputPlaceholder: 'Give Comments to reject invoice',
      inputAttributes: {
        'aria-label': 'Comments'
      },
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value) {
         // console.log("commented value", result.value)
          let rejectComment = result.value
          rejectInvoice(rejectComment);
        }
        else {
          Swal.fire(getAlertToast("Message", "Please give comments to reject"));
        }
      }

    })

  }

  const rejectInvoice = async (rejectComment) => {
    const config = {
      method: "PUT",
      url: UPDATE_INVOICE_STATUS,
      headers: authHeader(),
      data: {
        webString: enCryptFun(
          JSON.stringify({
            userId: getUserId(),
            invoiceId: invoiceID,
            status: "Rejected",
            comments: rejectComment
          })
        ),
        flutterString: "",
      },
    };
    setRejectLoading(true)
    try {
      const response = await API(config);
      //const { status } = response.data;
      let l = deCryptFun(response.data);
      const { status } = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", "Rejected Successfully"));
        setFormValues({ ...formValues, status: "Rejected" });
      }
    } catch (error) {
      if (error.response) {
        let { data } = error.response
        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        Swal.fire(getAlert("Error", v.message));
      }
    } finally {
      setRejectLoading(false);
    }
  };

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
    invoiceAmount,
    senderEmail,
    extractEngineFailed,
    name,
    assignSupplierId,
    supplierName,
    invoiceCurrency
  } = values;

  const getAssignedGlcode = async (value, id) => {
    //console.log("assignedCall", value, id);

    const config = {
      method: "GET",
      url: GET_ASSIGNED_GLCODE_VALUE,
      params: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            tagName: "suppliername",
            tagedTo: name,
          })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };
    try {
      const response = await API(config);
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        // console.log("supplierDataontagged", data);
       // setSupplierLists(data);
       console.log("assignedData",data)
       setGlCode(data[0].glCode)
      }
    } catch (error) {
      //   let { data } = error.response;
      console.log("error", error);
    }
  };

//   const getgeneratedglcode = async () => {
//     console.log("ongenerateGlcode", name,invoiceAmount,invoiceCurrency)
//     const config = {
    
//         method: "POST",
//         url: GET_GLCODE,
//         data: {
//             webString: enCryptFun(
//                 JSON.stringify({
//                   teamId: 26,
//                   tagList: [
//                     {
//                       tagName: "suppliername",
//                       tagedTo: name
//                     },
//                 {
//                       tagName: "invoiceamount",
//                       tagedTo: `${invoiceAmount}`
                   
//                     },
//                 {
//                     tagName: "invoicecurrency",
//                       tagedTo: invoiceCurrency
                     
//                     }
//                   ]
//                 })
//             ),
//             flutterString: "",
//         },
//         headers: authHeader(),

//     };
//     try {
  
//         const response = await API(config);
//         let l = deCryptFun(response.data);
//         const { status, glCode } = JSON.parse(l);
//         console.log('gfgfgf',JSON.parse(l))

//         if (status === "Success") {
//           console.log("glcodegenerated",glCode)
//            setGlCode(glCode)

//         }

//     } catch (error) {
//       if (error.response) {
//         let { data } = error.response

//         let p = deCryptFun(data);
//         let v = JSON.parse(p)
//         // console.log("error data new",  v.message)
//         Swal.fire(getAlert("Error", v.message));
//       }

//     }
// }

useEffect(()=>{
    if(name=="" || name == null ){
      console.log("nodata to generate")
    } else{
      console.log("generate")
    getAssignedGlcode()
    }
},[name,invoiceAmount,invoiceCurrency])
 // console.log("values on details invoiceAmount", invoiceAmount)
  let Download = async (e) => {
    const urlfromSelection = e.currentTarget.dataset.url;
    const flag = e.currentTarget.dataset.flag;
    if (urlfromSelection) {
      const config = {
        method: "POST",
        url: ACCESS_S3_FILE,
        data: {
          filePath: urlfromSelection,
        },
        headers: authHeader(),
      };
      try {
        const response = await API(config);
        const { status, url } = response.data;

        if (status === "Success") {
          setDownloadURL(url);
          if (flag === "pdf") {
            Axios.get(url, {
              responseType: "blob",
            }).then((res) => {
              fileDownload(res.data, invoiceNumber != 'N/A' ? `invoice${invoiceNumber}.pdf` : `${Date.now()}.pdf`);
            });
          } else if (flag === "json") {
            Axios.get(url, {
              responseType: "blob",
            }).then((res) => {
              fileDownload(res.data, invoiceNumber != 'N/A' ? `invoice${invoiceNumber}.json` : `${Date.now()}.json`);
            });
          }

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
    console.log(history)
    //history.push(INVOICE_ROUTE);
    history.goBack()
    


  };


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
      const { status, message, data, count } = JSON.parse(l);
      setCount(count);
    } catch (error) {
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        Swal.fire(getAlert("Error", v.message));
      }
    }
  };

  const newSupplierData = async (nameinput) => {
  //  console.log("supplier name on new supplier functioncall", nameinput, parseInt(invoiceID),)
    const getconfig = {
      method: "GET",
      url: GET_KEYVALUES_BY_SUPPLIERNAME,
      headers: authHeader(),
      params: {
        webString: enCryptFun(
          JSON.stringify({
            supplierName: nameinput,
            invoiceId: parseInt(invoiceID),
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(getconfig);
      let l = deCryptFun(response.data);
      // console.log("json parsed",JSON.parse(l) )
      const { status, invoiceId, documentData } = JSON.parse(l);
      let newInvoiceId = invoiceId
      if (status == "Success") {
        if (documentData != "N/A") {
         // console.log("new supplier on response", documentData)
          let newSupplierLabelArray = documentData.map(function (obj) {
            return obj.label;
          });
          let newSupplierKeyPair = newSupplierLabelArray.map((el) => {
            let labelUpperCase = el.toUpperCase()
            let camelCaseWord = (el).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            let properties = {}

            let dataMatch = currentInvoiceKeyPair.find((supp) => supp.label == el)
            let dataMatch1 = currentInvoiceKeyPair.find((supp) => supp.label == `${el}:`)
            if (dataMatch) {
              properties = {
                "label": el, "value": dataMatch.value
              }
            }
            else if (dataMatch1) {
              properties = {
                "label": el, "value": dataMatch1.value
              }
            }
            else {
              properties = {
                "label": el, "value": ""
              }
            }
            return properties;
          })

          setDynamicVal(newSupplierKeyPair);
          Swal.fire(getAlertToast("Success", "Supplier Changed Successfully"));
          getPreSelectValuesNewSupplier(newInvoiceId, newSupplierKeyPair)
        }
        else {
          //  console.log("if not data")
          Swal.fire({
            title: "",
            text: "No Record Found",
            // icon: "info",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ok",
          }).then((result) => {
            if (result.isConfirmed) {
              setDynamicVal([])
            }
          });
          //Swal.fire(getAlert("Info", "No Record Found"));

        }
      }
    } catch (error) {
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        Swal.fire(getAlert("Info", v.message));
        setDynamicVal([])
      }

    }
  }

  const getAssignerList = async () => {
    console.log("getAssignerList call")
    const getconfig = {
      method: "GET",
      url: GET_ASSIGNER_LIST,
      headers: authHeader(),
      params: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            approvalAmountTo: invoiceAmount ? invoiceAmount : 0,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(getconfig);
      // const { status, message, data, count } = response.data;
      let l = deCryptFun(response.data);

      const { status, message, data, count } = JSON.parse(l);
      //  console.log("jsonParsed assigner list",JSON.parse(l) )

      if (status === "Success") {
        setTeamMemberList(data)
      }
      setCount(count);
    } catch (error) {
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        Swal.fire(getAlert("Error", v.message));
      }
    }
  }


  const assignTeamMember = async (teamId) => {
    // let newStructuredData = teamMemberList.map(el => {
    //   let properties = {}
    //   properties = {
    //     "assignSupplierId": 0,
    //     "teamUserId": el.teamUserId,
    //     "supplierName": suppName,
    //     "isDeleted": el.isDeleted
    //   }
    //   return properties;
    // })
    let newStructuredData = [{
      "assignSupplierId": assignSupplierId,
      "teamUserId": teamId,
      "supplierName": name,
      "isDeleted": 0
    }]
   
    const config = {
      method: "POST",
      url: TEAM_MEMBER_ASSIGN,
      headers: authHeader(),
      data: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            teamList: newStructuredData
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      // const { data } = response.data;
      let l = deCryptFun(response.data);
      const { message, status } = JSON.parse(l);
      // console.log("JSON PARSED", JSON.parse(l))
      if (status == "Success") {
        history.push(INVOICE_ROUTE);
        Swal.fire(getAlertToast("success", "Invoice assigned successfully"))
      }
      // setSupplierList(data);
    } catch (error) {
      console.error(error);
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        //Swal.fire(getAlert("Error", v.message));
      }
    }

  }


  const handleTeamMemberChange = (teamMemberId, e) => {
    // console.log("teamMemberId", e.target.value)
    // setTeamMember(e.target.value)
    // //assignTeamMember()
    e.preventDefault();
    // console.log('assignToAnotherTM', teamMemberId);
    // console.log("assignteamMemberList", teamMemberList)
    let filterteamMember = teamMemberList.filter(el => {
      return el.userId == teamMemberId
    })
//console.log("teamMemberName", filterteamMember[0].userName)
    let teamMemberName = filterteamMember[0].userName
    Swal.fire({
      title: "",
      text: `Are you sure you want to assign this invoice to "${teamMemberName}"`,
      //icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "yes",
    }).then((result) => {
      if (result.isConfirmed) {
        assignTeamMember(teamMemberId)
      }
    });
    //assignTeamMember(teamMemberId)
  }

  const updateStatus= async()=>{
    const config = {
      method: "PUT",
      url: UPDATE_INVOICE_STATUS,
      headers: authHeader(),
      data: {
      webString: enCryptFun(
          JSON.stringify({
            userId: getUserId(),
        invoiceId: invoiceID,
        status: "Pending",
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      //const { status } = response.data;
        let l = deCryptFun(response.data);
      const { status} = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", "Transfer is success "));
        setMoveStatus(true)
      }
    } catch (error) {
      
      if (error.response) {
        let { data } = error.response
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    }
  }

  const openExceptionHandler = () => {

    setExceptionFlagModel(true)

  }
  let closeExceptionHandler = () => {
    setExceptionFlagModel(false);
  };

  let handlescreenDisable = (data) => {
    setScreenDisable(data)

  }
  let statusBacktoClerk=()=>{

    updateStatus();
  }
 


  useEffect(() => {
    getComment();
  }, []);

  useEffect(() => {
   // console.log("approvalAmount", getApprovalAmount(), "invoiceAmount", invoiceAmount)
    if (getRole() === "Team Member" && invoiceAmount >= 0) {
      getAssignerList()
    }
  }, [invoiceAmount]);
  
  //console.log("approvalAmount", getApprovalAmount())

  // useEffect(()=>{
  //   if(invoiceAmount && getRole()==="Team Member"){
  //     getAssignerList()
  //     console.log("approvalAmount", getApprovalAmount(), "approval invoiceAmount", invoiceAmount)
  //   }
  // },[invoiceAmount])
  const targetId = "container"
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
                    //onClick={Download}
                    >
                      Extract JSON
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>



            <div className="">
              {/* {(getRole() != "Supplier" && screenDisable) || (status == "In Exception") ?
                <Modal isOpen={true} container='section'>
                  <ModalBody>
                    under Exception
                  </ModalBody>
                </Modal> : ""} */}
              {/* <div className={(getRole() != "Supplier" && screenDisable) || (status == "Request Information") ? "overlay" : "normal"}>
              </div> */}
              <Row style={{width:"100%"}}>
              <Col md="6">
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
                    disabled={!formValues.senderEmail || status == "Request Information" 
                  ||status == "Supplier Maintenance" || status == "Specialist Exception" || status == "Invoice Rejection"}
                  >
                    Notify Supplier
                  </Button>
                )}
                 </h4>
                </Col>
               
               
                {/* <Col md="6" className="glcode">
                <h6>GL CODE: {glCode}</h6>
                </Col> */}
            
              </Row>
              {/* {extractEngineFailed === 1 ? (
              <p>
                We had issues while extracting the file, please upload a good
                quality invoice.
              </p>
            ) : (
              ""
            )} */}
              { getRole()!="Exception Handler" && (status == "Request Information" || status == "Invoice Rejection" || status == "Supplier Maintenance" || status == "Specialist Exception")
           ? <span class="badge badge-secondary msg-in-handler">This invoice is under review by the exceptional handler and will be sent back to AP clerk once the review is complete.</span> : <>  
                <br />
                <Button color="primary" onClick={onClickAudit}>
                  Audit
                </Button>
                
              </>}
             

              
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
                            {/* <h1>select supplier</h1> */}
                            {getRole() === "Team Member" && (invoiceAmount > getApprovalAmount()) && <Row>
                              <Col md="4"><Label>Assign To</Label></Col>
                              <Col md="4">

                                <Input
                                  type="select"
                                  onChange={(e) => setTeamMemberId(e.currentTarget.value)}
                                  name="newTM"
                                  id="newTM"
                                // value={teamMemberId}
                                >
                                  <option value="" >Please select</option>
                                  {teamMemberList.map((el, i) => {
                                    const {
                                      userId,
                                      userName
                                    } = el
                                    return (
                                      <option key={i} value={userId}>
                                        {userName}
                                      </option>
                                    );
                                  })}
                                </Input>
                              </Col>
                              <Col md="2">
                                <Button
                                  color="primary"
                                  onClick={(e) => handleTeamMemberChange(teamMemberId, e)}>Assign</Button>
                              </Col>
                            </Row>}
                          </div>
                          <InvoiceFormNewExtract
                            isEdit={isEdit}
                            errors={errors}
                            dateShow={dateShow}
                            requiredFieldList={requiredFieldList}
                            touched={touched}
                            handleChange={handleChange}
                            values={values}
                            defaultInvoiceType={type}
                            setFormValues={setFormValues}
                            setValues={setValues}
                            setErrors={setErrors}
                            invoiceID={invoiceID}
                            keyChangeFlag={keyChangeFlag}
                            setKeyFlag={setKeyFlag}
                            keyData={keyData}
                            setKeyData={setKeyData}
                            fieldArray={fieldArray}
                            setFieldArray={setFieldArray}
                            detectedData={detectedData}
                            setDetectedData={setDetectedData}
                            dynamicVal={dynamicVal}
                            setDynamicVal={setDynamicVal}
                            loadingdetect={loadingdetect}
                            newSupplierData={newSupplierData}
                          />
                        </div>
                      </TabPane>
                      <TabPane tabId="2">
                        <List
                          invoiceID={invoiceID}
                          key={invoiceID}
                          status={status}
                          type={type}
                          GlCode={GlCode}
                          detectedTableData = {detectedTableData}
                          setDetectedTableData = {setDetectedTableData}
                          getPreSelectValues = {getPreSelectValues}
                        ></List>
                      </TabPane>
                    </TabContent>
                    
                    {activeTab === "1" && <div className="wf-ma mt-5 mb-4">
                      
                      {isEdit ? (
                        <Fragment>
                          <Button outline color="primary" onClick={CancelEdit}>
                            Cancel
                          </Button>
                          <Button color="primary" type="submit" disabled={updateKey === true || Object.keys(errors).some(x => errors[x])}>
                            {" "}
                            {loading && <Spinner color="light" />}Update
                          </Button>
                        </Fragment>
                      ) : (
                        <Fragment>
                          {status && status == "Pending"  ||
                          status && getRole() == "Exception Handler" ?
                            // status !== "Approved" &&
                            // status !== "Rejected" &&
                            // status !== "Auto Approved" &&
                            // status !== "Request Information" ? 
                            (
                            <>
                              

                              {/* {getRole() !== "Supplier" && ( */}
                              <div className="btn-grp-line-1">
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
                              </div>
                              {getRole() == "Exception Handler" &&  (status == "Request Information" 
                  ||status == "Supplier Maintenance" || status == "Specialist Exception" || status == "Invoice Rejection")?
                                <Button
                                  className="resApproveBtn"
                                  
                                  color="primary"
                                  onClick={statusBacktoClerk}
                                  
                                >

                             {moveStatus ? "Pending" : "Transfer ownership back to the AP Clerk"}
                                </Button> : ''}

                                {getRole() == "Team Member" ?
                                <Button
                                className="resApproveBtn"
                                 
                                  color="primary"
                                  onClick={openExceptionHandler}
                                >

                                  Exception Handler
                                </Button> : ''}
                                
                              {exceptionFlagModel && <ExceptionHandlerModel
                                exceptionFlagOn={exceptionFlagModel}
                                exceptionaFlagOff={closeExceptionHandler}
                                invoiceId={invoiceID}
                                screenDisable={handlescreenDisable}

                              />}


                              {getRole() !== "Supplier" && (
                                <Button
                                  className="resApproveBtn"
                                  color="primary"
                                  onClick={FieldCheck}
                                  disabled={
                                   approveLoading || rejectLoading ||
                                    supplierStatus !== "Valid" ||
                                    invoiceStatus !== "Valid" ||
                                    (type =="po" && invoicePOStatus != "Valid")
                                   // (orderNumber && invoicePOStatus != "Valid")
                                   || (invoiceAmount > getApprovalAmount() && getRole() == "Team Member")
                                  }
                                >
                                  {approveLoading && <Spinner color="light" />}
                                  Approve
                                </Button>
                              )}
                              {getRole() == "Exception Handler" && status == "Invoice Rejection" &&(
                                <Button
                                  className="resApproveBtn"
                                  color="primary"
                                  onClick={onClickRejectInvoice}
                                  disabled={
                                    approveLoading || rejectLoading
                                  }
                                >
                                  {rejectLoading && <Spinner color="light" />}
                                  Reject
                                </Button>
                              )}
                            </>
                          ) : (
                            ""
                          )}
                        </Fragment>
                      )}
                    </div>}

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
                          {`Page ${pageNumber || (numPages ? 1 : "--")} of ${numPages || "--"
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
                          return <p key={`mail_body_${i}`}>{record}</p>;
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
            </div>

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
