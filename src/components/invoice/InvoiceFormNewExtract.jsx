import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Row,
  Col,
  InputGroup,
  InputGroupText,
  Spinner,
} from "reactstrap";
import moment from "moment";
import {
  deCryptFun,
  enCryptFun,
  getEmail,
  getRole,
  getSorting,
  getTeamID,
  stableSort,
} from "../../components/common/functions";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import {
  EXTRACTION_FORM_URL,
  GET_FORMAT_SETTING_URL,
  GET_SUPPLIER_LIST_URL,
  GET_TRAINED_DATASET_URL,
  TEAM_MEMBER_ASSIGN,
} from "../common/url";
import Swal from "sweetalert2";
import { valuesIn } from "lodash";
import { detect } from "underscore";
import { VALID_DATE_DDMMYYYY_REGEX, VALID_DATE_MMDDYYYY_REGEX } from "../common/constants";
import { FaSyncAlt } from "react-icons/fa";
import MaskedInput from "react-text-mask";



export default function InvoiceFormNewExtract(props) {
  const {
    invoiceID = "",
    isEdit,
    errors,
    touched,
    requiredFieldList,
    handleChange,
    values,
    defaultInvoiceType,
    setFormValues,
    setValues,
    setErrors,
    keyChangeFlag,
    setKeyFlag,
    keyData,
    setKeyData,
    fieldArray,
    setFieldArray,
    detectedData,
    setDetectedData,
    dateShow,
    loadingdetect,
    dynamicVal,
    setDynamicVal,
    newSupplierData
  } = props;

  const [activeTab, setActiveTab] = useState("1");
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  let {
    invoiceNumber,
    invoiceDate,
    operatingUnit,
    invoiceType,
    supplierName,
    supplierNumber,
    supplierType,
    supplierSite,
    supplierId,
    supplierAddress,
    city,
    state,
    supplierAddress2,
    invoiceCurrency,
    invoiceAmount,
    dueAmount,
    taxTotal,
    dueDate,
    dueDateYYYMMDD,
    totalAmount = 0,
    orderNumber,
    name,
    senderEmail,
    phoneNumber,
    status,
    source,
    country,
    taxNumber,
    documentType,
    bankAccount,
    sortCode,
    swift,
    iban,
    paidAmount,
    // invoiceDescription,
    paymentTerms,
    supplierEmail,
    invoiceNumberTR,
    invoiceAmountTR,
    dueAmountTR,
    taxNumberTR,
    bankAccountTR,
    sortCodeTR,
    paidAmountTR,
    swiftTR,
    ibanTR,
    invoiceDateTR,
    taxTotalTR,
    totalAmountTR,
    invoiceCurrencyTR,
    dueDateTR,
    supplierAddressTR,
    supplierSiteTR,
    invoiceDescriptionTR,
    senderEmailTR,
    orderNumberTR,
    nameTR,
    supplierNameTR,
    phoneNumberTR,
    documentTypeTR,
    postalCode,
    invoiceId
  } = values;

  //console.log("supplier name", supplierName, "name", name)
  //const [dynamicVal, setDynamicVal] = useState([]);
  //console.log("name", name)
  useEffect(() => {
    fieldArray.map((rec, i) => {
      const { targetVariable, fieldName } = rec;
      return detectedData && detectedData[targetVariable]
        ? (rec.fieldName = detectedData[targetVariable].label)
        : "";
    });
    setSelectedOption({
      ...selectedOption, ["Invoice Date"]: detectedData.invoiceDate?.label || "",
      ["Invoice Number"]: detectedData.invoiceNumber?.label || "",
      ["Invoice Amount"]: detectedData.invoiceAmount?.label || "",
      ["Due Amount"]: detectedData.dueAmount?.label || "",
      ["Purchase Order Number"]: detectedData.orderNumber?.label || "",
      ["Tax Total"]: detectedData.taxTotal?.label || "",
      ["Due Date"]: detectedData.dueDate?.label || "",
    })
  }, [detectedData]);

  const [startDate, setStartDate] = useState("");
  const [duedate, setdueDate] = useState("");
  const [type, setType] = useState("MM/dd/yyyy");
  const [rowValue, setRowValue] = useState("");
  const [rawsec, setRawSec] = useState([]);
  const [rawsec1, setRawSec1] = useState([]);
  const [f, setF] = useState();
  const [selectedOption, setSelectedOption] = useState({})
  const [invoiceKeyPress, setInvoiceKeyPress] = useState("")
  const [dueKeyPress, setDueKeyPress] = useState("")
  const [invalidInvoiceDate, setInvalidInvoiceDate] = useState("")
  const [invalidDueDate, setInvalidDueDate] = useState("")
  const [supplierList, setSupplierList] = useState([])


  const RowHandlerChk = (e) => {
    let temp = rawsec;
    let temp1 = keyData;
    let temp2 = fieldArray;

    let fafind = temp2.find(
      (element) => element.targetVariable == e.currentTarget.dataset.exaval
    );
    if (fafind) {
      temp2.find(
        (element) => element.targetVariable == e.currentTarget.dataset.exaval
      ).fieldName = e.target.value;
    }

    setFieldArray(temp2);
    let fe = temp.find(
      (element) => element.name == e.currentTarget.dataset.labname
    );

    let fe1 = temp1.find(
      (element) => element.targetVariable == e.currentTarget.dataset.exaval
    );
    let dylab = e.currentTarget.dataset.exaval;
    let dv = e.target.value != "" ? dynamicVal.find((ele) => ele.label == e.target.value).value : "";
    //console.log("datetype", type)
    //console.log("dylab", dylab)
    if (dylab == "invoiceDate") {
      // console.log("invoice dateee", dv)
      if (VALID_DATE_MMDDYYYY_REGEX.test(dv) == true) {
        //console.log("if")
        setInvalidInvoiceDate("validInvoice")
        setStartDate(new Date(dv));
        setFormValues({ ...values, [e.currentTarget.dataset.exaval]: dv });
        setValues((val) => ({ ...val, [e.currentTarget.dataset.exaval]: dv }));
      }
      else {
        //console.log("else")
        setInvalidInvoiceDate("invalidInvoice")
        setStartDate("");
        setFormValues({ ...values, [e.currentTarget.dataset.exaval]: "" });
        setValues((val) => ({ ...val, [e.currentTarget.dataset.exaval]: "" }));
        Swal.fire(getAlertToast("error", "Invalid Date5"));
        // setErrors({invoiceDate:"Invalid Date"})
      }
    }
    else if (dylab == "dueDate") {
      if (VALID_DATE_MMDDYYYY_REGEX.test(dv) == true) {
        setInvalidDueDate("validDue")
        setdueDate(new Date(dv));
        setFormValues({ ...values, [e.currentTarget.dataset.exaval]: dv });
        setValues((val) => ({ ...val, [e.currentTarget.dataset.exaval]: dv }));
      }
      else {
        setInvalidDueDate("invalidDue")
        Swal.fire(getAlertToast("error", "Invalid Date"));
        setdueDate("");
        setFormValues({ ...values, [e.currentTarget.dataset.exaval]: "" });
        setValues((val) => ({ ...val, [e.currentTarget.dataset.exaval]: "" }));
      }

    }

    else if (dylab != "dueDate" || dylab != "invoiceDate") {
      //console.log("not invoice date")
      setFormValues({ ...values, [e.currentTarget.dataset.exaval]: dv });
      setValues((val) => ({ ...val, [e.currentTarget.dataset.exaval]: dv }));
    }
    //rawsec
    if (fe) {
      temp.find(
        (element) => element.name == e.currentTarget.dataset.labname
      ).value = e.target.value;
    } else {
      temp.push({
        name: e.currentTarget.dataset.labname,
        value: e.target.value,
      });
    }
    setRawSec(temp);

    //keydata
    if (fe1) {
      temp1.find(
        (element) => element.targetVariable == e.currentTarget.dataset.exaval
      ).fieldName = e.target.value;
    } else {
      temp1.push({
        fieldName: e.target.value,
        targetVariable: e.currentTarget.dataset.exaval,
      });
    }
    setRawSec1(temp1);

    setKeyData(temp1);

    setKeyFlag(true);
    // let newArray = selectedOption
    // newArray.push({[e.target.id]: e.target.value})
    setSelectedOption({ ...selectedOption, [e.target.id]: e.target.value })

  };



  useEffect(() => {
    //  console.log("invalidDueDate", invalidDueDate)
    if (invalidDueDate === "invalidDue") {

      setErrors({ dueDate: "Allows Valid Date" });
      console.log("errors", errors)
    }
  }, [invalidDueDate
  ]);

  useEffect(() => {
    // console.log("invalidInvoiceDate", invalidInvoiceDate)
    if (invalidInvoiceDate === "invalidInvoice") {

      setErrors({ invoiceDate: "Allows Valid Date" });
      console.log("errors", errors)
    }
  }, [invalidInvoiceDate
  ]);


  // useEffect(()=>{
  //   console.log("suppliername on useEffect", name)
  //   if(name != "N/A" || name != undefined){
  //  newSupplierData()
  //   }
  // },[name])

  const [selectFlag, setSelectFlag] = useState(true);
  const [selectFlaginvoice, setSelectFlaginvoice] = useState(true);

  const changedDate = (e) => {
    // console.log("onchange invoice date", e)
    setStartDate(e);
    setValues((val) => ({ ...val, invoiceDate: e }));
  };

  const changedDatedue = (e) => {
    // console.log("onchangeee due date", e)
    setdueDate(e);
    setValues((val) => ({ ...val, dueDateYYYMMDD: e, dueDate: e }));
  };

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
      //const { message, data } = response.data;
      let l = deCryptFun(response.data);
      const { message, data } = JSON.parse(l);
      if (message === "Success") {
        const { dateFormat = "MM/dd/yyyy" } = data;

        if (dateFormat == "") {
          setType("MM/dd/yyyy");
        } else {
          setType(dateFormat);
        }
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // Swal.fire("Error", data.message);
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        Swal.fire("Error", v.message);
      }
    }
  };


  const getEmailList = async () => {
    const config = {
      method: "GET",
      url: GET_SUPPLIER_LIST_URL,
      headers: authHeader(),
      params: {
        webString: enCryptFun(
          JSON.stringify({
            supplierId: getEmail()
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      // const { data } = response.data;
      let l = deCryptFun(response.data);
      const { data } = JSON.parse(l);
      // console.log("supplier List", data)
      setSupplierList(data);
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
  };



  useEffect(() => {
    getdateFormatSetting(getTeamID());
    if (getRole() != "Supplier") {
      getEmailList();
    }
  }, []);

  const startRef = useRef();
  const startRefinvoice = useRef();
  const onKeyDown = (e) => {
    //console.log("keydown")
    setDueKeyPress("duekey")
    if (e.key === "Tab" || e.which === 9) {
      startRef.current.setOpen(false);
    }
  };
  const onKeyDowninvoice = (e) => {
    // console.log("keydown")
    setInvoiceKeyPress("invoicekey")
    if (e.key === "Tab" || e.which === 9) {
      startRefinvoice.current.setOpen(false);
    }
  };
  const handleOnBlur = ({ target: { value } }) => {
    //   setDueKeyPress("dueRawKey")
      let format = "";
      if (type == "dd/MM/yyyy") {
        format = "DD/MM/yyyy";
      } else {
        format = "MM/DD/yyyy";
      }

      if (value) {

      if( format=="MM/dd/yyyy" ? 
      ( VALID_DATE_MMDDYYYY_REGEX.test(value) == false || value.length != 10) : 
      (VALID_DATE_DDMMYYYY_REGEX.test(value) == false || value.length != 10)){
        console.log('onblur')

          Swal.fire(getAlertToast("Error", "Invalid Date6"));
          setErrors({dueDate: "Allows Valid Date"}); 
          setdueDate("");
         // setValues((val) => ({ ...val, dueDateYYYMMDD: "", dueDate: "" }));
         } 
    } 
    // else{

    // }


  }

  const handleChangeRaw = (value, event) => {

    setDueKeyPress("dueRawKey")
    let format = "";
    let month = "";
    let date = "";
    if (type == "dd/MM/yyyy") {
      format = "DD/MM/yyyy";
    } else {
      format = "MM/DD/yyyy";
    }

    if (value) {
      const final = new Date(moment(value, format));
      console.log("final",value)
      const unmask = value.replace(/-|_/ig, '').replace(/\//g, "");
      if (format == "MM/DD/yyyy") {
        month = unmask.substring(0, 2);
        date = unmask.substring(2, 4)
      }
      else {
        date = unmask.substring(0, 2);
        month = unmask.substring(2, 4)
      }

      if ((month.length == 2 && !(month >= 0 && month <= 12) && final == "Invalid Date")
      || (date.length == 2 && !(date >= 1 && date <= 31) && final == "Invalid Date")) {
        Swal.fire(getAlertToast("Error", "Invalid Date"));
        setErrors({ dueDate: "Allows Valid Date" });
        //value=''
        setdueDate("");
        setValues((val) => ({ ...val, dueDateYYYMMDD: "", dueDate: "" }));

       // console.log('log1', value)

      }
      // else if (date.length == 2 && !(date >= 1 && date <= 31) && final == "Invalid Date") {
      //   Swal.fire(getAlertToast("Error", "Invalid Date"));
      //   setErrors({ dueDate: "Allows Valid Date1" });
      //   console.log('log2', value)
      //   setdueDate("");
      //   setValues((val) => ({ ...val, dueDateYYYMMDD: "", dueDate: "" }));
      //   return null

      // }
      else {
        setdueDate(final)
        setValues((val) => ({ ...val, dueDateYYYMMDD: final, dueDate: final }));
      }
    }
    else {
      setdueDate("");
      setValues((val) => ({ ...val, dueDateYYYMMDD: "", dueDate: "" }));
    }


  };


  const handleChangeRawinvoice = (value) => {
    //console.log("invoiceKeypress", invoiceKeyPress)
    setInvoiceKeyPress("invoiceRawKey")
    //console.log("raw invoice", value)
    let format = "";
    if (type == "dd/MM/yyyy") {
      format = "DD/MM/yyyy";
    } else {
      format = "MM/DD/yyyy";
    }

    if (value) {
      // if( type=="MM/dd/yyyy" ? ( VALID_DATE_MMDDYYYY_REGEX.test(value) == false || value.length != 10) : (VALID_DATE_DDMMYYYY_REGEX.test(value) == false || value.length != 10)){

      //  } 
      const final = new Date(moment(value, format));
      const unmask = value.replace(/-|_/ig, '').replace(/\//g, "");
      let month = unmask.substring(0, 2);
      let date = unmask.substring(2, 4)
      if (month.length == 2 && !(month >= 0 && month <= 12) && final == "Invalid Date") {
        Swal.fire(getAlertToast("Error", "Invalid Date"));
        setErrors({ invoiceDate: "Allows Valid Date" });

      }
      else if (date.length == 2 && final == "Invalid Date") {
        Swal.fire(getAlertToast("Error", "Invalid Date"));
        setErrors({ invoiceDate: "Allows Valid Date1" });

        return null

      }
      else {
        setStartDate(final)
        setValues((val) => ({ ...val, invoiceDate: final }));
      }

    }
    else {
      setStartDate("");
      setValues((val) => ({ ...val, invoiceDate: ""}));
    }


  };


  const handleNameChange = (e) => {
    // console.log("name", e.target.value)
    let nameinput = e.target.value
    setValues((val) => ({ ...val, name: nameinput }));
    Swal.fire({
      title: "Do you want to change supplier?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        newSupplierData(nameinput, invoiceId)
      }
      else setValues((val) => ({ ...val, name: name }));
    })
  }

  const handleChangeFun = (e) => {
    let val = e.target.value;
    let label = e.currentTarget.dataset.idlabel;
    let tempstatic = dynamicVal;
    tempstatic.find((element) => element.label == label).value = val;
    // setStaticSample(tempstatic);
    setDynamicVal(tempstatic);
    handleChange(e);
  };


 



  let ob = [];



  return (
    <Fragment>
      <Row>
        <Col sm="12">
          <p className="extract-p">
            <span></span>Extract
          </p>
          <p className="manual-p">
            <span></span>Manual
          </p>
        </Col>
      </Row>
      <Row>
        {" "}
        <Col sm="4">
          <p>
            <span></span>Invoice Label
          </p>
        </Col>
        <Col sm="4">
          <p>
            <span></span>Identified Label Options
          </p>
        </Col>
        <Col sm="4">
          <p>
            <span></span>Identified Corresponding values
          </p>
        </Col>
      </Row>

      <div className="invoiceDataScroll">
        {loadingdetect && <Spinner color="primary" />}
        {!loadingdetect &&
          requiredFieldList &&
          stableSort(
            requiredFieldList.filter((i) => i.moduleName == "Invoice"),
            getSorting("asc", "fieldOrder")
          ).map((record, index) => {
            const { columnName, dataFormat } = record;
            // console.log("values of column name", columnName,":", values[columnName] ? values[columnName] :"")
            const findingc = rawsec.find(
              (element) => element.name === record.fieldName
            );
            let nts = "";
            let foundval = "";
           
            let dyfou = dynamicVal && dynamicVal.find(
              (element) => element.label == record.fieldName.toUpperCase()
            );
            let dyfoundval = "";
            if (dyfou) {
              dyfoundval = dynamicVal.find(
                (element) =>
                  element.label == record.fieldName.toUpperCase().value
              );
            }
            if (findingc) {
              nts = rawsec.find(
                (element) => element.name === record.fieldName
              ).value;
              if ((dynamicVal.find(
                (element) => element.label == nts
              )) != undefined) {

                foundval = dynamicVal.find(
                  (element) => element.label == nts
                ).value;
              }
            }

            //option list
            let simtre1 = dynamicVal.filter(
              (idla1) => idla1.label !== record.name
            );

            return (
              <div>
                {[
                  "dueDate",
                  "invoiceDate",
                  "paidAmount",
                  "orderNumber",
                  "name"
                ].includes(columnName) && record.isVisible == 1 ? (
                  columnName == "orderNumber" ? (
                    defaultInvoiceType == "po" ? (
                      <>
                        <Row>
                          <Col sm="4">
                            <Label for="orderNumber">
                              PO Number
                              {requiredFieldList.filter(
                                (element) =>
                                  element.columnName === "orderNumber" &&
                                  element.isRequired === 1
                              ).length == 1
                                ? "*"
                                : ""}{" "}
                            </Label>
                          </Col>
                          <Col sm="4">
                            <Input
                              type="select"
                              // required={record.isRequired===1}
                              name={record.fieldName}
                              id={record.fieldName}
                              disabled={!isEdit}
                              data-labname={record.fieldName}
                              data-exaval={record.columnName}
                              onChange={(e) => RowHandlerChk(e)}
                              value={
                                Object.keys(selectedOption).length && Object.keys(selectedOption).includes(record.fieldName) ?
                                  selectedOption[record.fieldName] || " " :
                                  detectedData.length && detectedData[record.columnName]
                                    ? detectedData[record.columnName].label
                                    // detectedData[record.columnName].label.split(
                                    //     ":"
                                    //   )[0]

                                    : ""
                              }

                            >
                              <option value={""}></option>
                              {simtre1.map((i) => {
                                return (
                                  <option
                                    style={{ display: Object.keys(selectedOption).length && Object.values(selectedOption).includes(i.label) ? "none" : "inherit" }}
                                    key={`po_${i.label}`}
                                    value={[i.label]}
                                    data-va={i.label}
                                    disabled={Object.keys(selectedOption).length && Object.values(selectedOption).includes(i.label)}
                                  >
                                    {i.label}
                                  </option>
                                );
                              })}
                            </Input>
                          </Col>
                          <Col sm="4">
                            <FormGroup
                              className={
                                orderNumberTR === "Extract"
                                  ? "extract"
                                  : "manual"
                              }
                            >
                              <Input
                                disabled={!isEdit}
                                type="text"
                                name="orderNumber"
                                value={orderNumber ? orderNumber : ""}
                                data-idlabel={"PO NUMBER"}
                                onChange={handleChange}
                                invalid={
                                  touched.orderNumber && errors.orderNumber
                                    ? true
                                    : false
                                }
                                placeholder="Enter PO Number"
                              />
                              <FormFeedback>
                                {touched.orderNumber && errors.orderNumber
                                  ? errors.orderNumber
                                  : ""}{" "}
                              </FormFeedback>
                            </FormGroup>
                          </Col>
                        </Row>
                      </>
                    ) : (
                      ""
                    )
                  ) : columnName == "paidAmount" ? (
                    <Row>
                      <Col sm="4">
                        <FormGroup
                          className={
                            paidAmountTR === "Extract" ? "extract" : "manual"
                          }
                        >
                          <Label for="paidAmount">
                            Paid Amount($)
                            {requiredFieldList.filter(
                              (element) =>
                                element.columnName === "paidAmount" &&
                                element.isRequired === 1
                            ).length == 1
                              ? "*"
                              : ""}{" "}
                          </Label>
                        </FormGroup>
                      </Col>

                      <Col sm="4">
                        <FormGroup
                          className={
                            orderNumberTR === "Extract" ? "extract" : "manual"
                          }
                        >
                          <Input
                            // type="number"
                            type="text"
                            disabled={!isEdit}
                            name="paidAmount"
                            value={paidAmount}
                            // min={1}
                            // max={99999999}
                            // step=".01"
                            onChange={handleChange}
                            invalid={
                              touched.paidAmount && errors.paidAmount
                                ? true
                                : false
                            }
                            placeholder="Enter Paid Amount"
                            // value={
                            //   rawsec.find(
                            //     (element) => element.name === record.fieldName
                            //   )
                            //     ? foundval
                            //     : paidAmount
                            // }
                            data-idlabel={record.fieldName}
                          />
                          <FormFeedback>
                            {touched.paidAmount && errors.paidAmount
                              ? errors.paidAmount
                              : ""}{" "}
                          </FormFeedback>
                        </FormGroup>
                      </Col>
                    </Row>
                  ) : columnName == "name" ? getRole() != "Supplier" ? (<Row>

                    <Col sm="4">
                      <FormGroup
                        className={
                          nameTR === "Extract" ? "extract" : "manual"
                        }
                      >
                        <Label for="name">
                          Vendor/Supplier Name
                          {requiredFieldList.filter(
                            (element) =>
                              element.columnName === "name" &&
                              element.isRequired === 1
                          ).length == 1
                            ? "*"
                            : ""}{" "}
                        </Label>
                      </FormGroup>
                    </Col>

                    <Col sm="4">
                      {/* <FormGroup
                          className={
                            nameTR === "Extract" ? "extract" : "manual"
                          }
                        >
                          <Input
                           // type="number"
                           type="text"
                            disabled={!isEdit}
                            name="name"
                            value={name}
                            // min={1}
                            // max={99999999}
                            // step=".01"
                            onChange={handleChange}
                            invalid={
                              touched.name && errors.name
                                ? true
                                : false
                            }
                            placeholder="Enter Vendor/Supplier Name"
                            // value={
                            //   rawsec.find(
                            //     (element) => element.name === record.fieldName
                            //   )
                            //     ? foundval
                            //     : paidAmount
                            // }
                            data-idlabel={record.fieldName}
                          />
                          <FormFeedback>
                            {touched.name && errors.name
                              ? errors.name
                              : ""}{" "}
                          </FormFeedback>
                        </FormGroup> */}
                      <FormGroup>
                        <Input
                          type="select"
                          invalid={
                            errors.name && touched.name ? true : false
                          }
                          //onBlur={handleBlur}
                          disabled={!isEdit}
                          onChange={handleNameChange}
                          value={name}
                          name="name"
                          id="name"
                          placeholder="Vendor/SupplierName"
                        >
                          <option value="" disabled>
                            Please select
                          </option>

                          {supplierList &&
                            supplierList.map((record, index) => {
                              return (
                                <option
                                  key={`listing_${index}`}
                                  value={record.supplierName}
                                >
                                  {record.supplierName}
                                </option>
                              );
                            })}
                        </Input>
                        <FormFeedback>
                          {touched.name && errors.name
                            ? errors.name
                            : ""}{" "}
                        </FormFeedback>
                      </FormGroup>
                    </Col>
                    {/* <Col sm="4" className="mt-3">
                        <FaSyncAlt onClick={newSupplierData}/>
                        </Col> */}
                  </Row>) : (
                    <Row>
                      <Col sm="4">
                        <FormGroup
                          className={
                            nameTR === "Extract" ? "extract" : "manual"
                          }
                        >
                          <Label for="name">
                            Vendor/Supplier Name
                            {requiredFieldList.filter(
                              (element) =>
                                element.columnName === "name" &&
                                element.isRequired === 1
                            ).length == 1
                              ? "*"
                              : ""}{" "}
                          </Label>
                        </FormGroup>
                      </Col>

                      <Col sm="4">
                        <FormGroup
                          className={
                            nameTR === "Extract" ? "extract" : "manual"
                          }
                        >
                          <Input
                            // type="number"
                            type="text"
                            disabled={!isEdit}
                            name="name"
                            value={name}
                            // min={1}
                            // max={99999999}
                            // step=".01"
                            onChange={handleChange}
                            invalid={
                              touched.name && errors.name
                                ? true
                                : false
                            }
                            placeholder="Enter Vendor/Supplier Name"
                            // value={
                            //   rawsec.find(
                            //     (element) => element.name === record.fieldName
                            //   )
                            //     ? foundval
                            //     : paidAmount
                            // }
                            data-idlabel={record.fieldName}
                          />
                          <FormFeedback>
                            {touched.name && errors.name
                              ? errors.name
                              : ""}{" "}
                          </FormFeedback>
                        </FormGroup>
                      </Col>
                    </Row>
                  ) : (
                    <Row>
                      <Col sm="4">
                        <Label
                          for={
                            columnName == "dueDate" ? "dueDate" : "invoiceDate"
                          }
                        >
                          {columnName}{" "}
                          {columnName == "dueDate"
                            ? requiredFieldList.filter(
                              (element) =>
                                element.columnName === "dueDate" &&
                                element.isRequired === 1
                            ).length == 1
                              ? "*"
                              : ""
                            : columnName == "invoiceDate"
                              ? requiredFieldList.filter(
                                (element) =>
                                  element.columnName === "invoiceDate" &&
                                  element.isRequired === 1
                              ).length == 1
                                ? "*"
                                : ""
                              : ""}
                        </Label>
                      </Col>
                      <Col sm="4">
                        <Input
                          type="select"
                          // required={record.isRequired===1}
                          name={record.fieldName}
                          id={record.fieldName}
                          disabled={!isEdit}
                          data-labname={record.fieldName}
                          data-exaval={columnName}
                          onChange={(e) => RowHandlerChk(e)}
                          value={
                            Object.keys(selectedOption).length && Object.keys(selectedOption).includes(record.fieldName) ?
                              selectedOption[record.fieldName] || " " :
                              detectedData.length && detectedData[record.columnName]
                                ? detectedData[record.columnName].label
                                //  detectedData[record.columnName].label.split(
                                //     ":"
                                //   )[0]
                                : ""
                          }
                        >
                          {/* <option value={record.fieldName} disabled>
                            {record.fieldName}
                          </option> */}
                          <option value={""}></option>

                          {simtre1.map((i) => {
                            return (
                              <option
                                style={{ display: Object.keys(selectedOption).length && Object.values(selectedOption).includes(i.label) ? "none" : "inherit" }}
                                key={`sdate_${i.label}`}
                                value={[i.label]}
                                data-va={i.label}
                                disabled={Object.keys(selectedOption).length && Object.values(selectedOption).includes(i.label)}

                              >
                                {i.label}
                              </option>
                            );
                          })}
                        </Input>
                      </Col>
                      <Col sm="4">
                        <>
                          <DatePicker
                            className="react-datepicker__input-container input"
                            disabled={!isEdit}
                            popperPlacement="bottom-end"
                            name={
                              columnName == "dueDate"
                                ? "dueDate"
                                : "invoiceDate"
                            }
                            onSelect={
                              columnName == "dueDate"
                                ? (date) => changedDatedue(date)
                                : (date) => changedDate(date)
                            }

                            customInput={<MaskedInput
                              mask={[/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/]}
                            />}

                            invalid={
                              columnName == "dueDate"
                                // ? touched.dueDate &&
                                ? errors.dueDate
                                  ? true
                                  : false
                                : errors.invoiceDate
                                  ? true
                                  : false
                            }

                            dateFormat={type}
                            selected={
                              columnName == "dueDate" ?

                                (dueDate && new Date(dueDate) || null) : (invoiceDate && new Date(invoiceDate) || null)

                            }
                            placeholderText={type}
                            onBlur={handleOnBlur}
                            onChangeRaw={

                              columnName == "dueDate"
                                ? (dueKeyPress === "duekey" && ((event) => handleChangeRaw(event.target.value, event)))
                                : (invoiceKeyPress == "invoicekey" && ((event) =>
                                  handleChangeRawinvoice(event.target.value)))
                            }

                            ref={
                              columnName == "dueDate"
                                ? startRef
                                : startRefinvoice
                            }
                            onKeyDown={
                              columnName == "dueDate"
                                ? onKeyDown
                                : onKeyDowninvoice
                            }


                            data-idlabel={record.fieldName}
                          />

                          {columnName == "dueDate" ? (
                            dueDateTR == "Manual" ? (
                              <div>
                                <hr
                                  style={{
                                    border: "0",
                                    borderTop: " 1px solid rgb(220 62 81)",
                                  }}
                                />
                              </div>
                            ) : (
                              <div>
                                <hr
                                  style={{
                                    border: "0",
                                    borderTop: " 1px solid rgb(57 193 136)",
                                  }}
                                />
                              </div>
                            )
                          ) : invoiceDateTR == "Manual" ? (
                            <div>
                              <hr
                                style={{
                                  border: "0",
                                  borderTop: " 1px solid rgb(220 62 81)",
                                }}
                              />
                            </div>
                          ) : (
                            <div>
                              <hr
                                style={{
                                  border: "0",
                                  borderTop: " 1px solid rgb(57 193 136)",
                                }}
                              />
                            </div>
                          )}
                        </>
                        <FormFeedback style={{ display: "block" }}>
                          {columnName == "dueDate"
                            ? errors.dueDate

                            : errors.invoiceDate
                          }{" "}
                        </FormFeedback>
                      </Col>
                    </Row>
                  )
                ) : // ""
                  columnName == "senderEmail" ||
                    columnName == "supplierId" ||
                   // columnName == "supplierSite" ||
                    columnName == "supplierAddress" ||
                    columnName == "supplierAddress2" ||
                    columnName == "city" ||
                    columnName == "state" ||
                    columnName == "country" ||
                    columnName == "postalCode" ||
                    columnName == "taxNumber" ||
                    columnName == "bankAccount" ||
                    columnName == "swift" ||
                    columnName == "sortCode" ||
                    columnName == "iban" ? (
                    !isEdit ? (
                      requiredFieldList.filter(
                        (element) =>
                          element.columnName === record.columnName &&
                          element.isVisible === 1
                      ).length == 1 ? (
                        <Row>
                          <Col sm="4">
                            <Label for={columnName}>
                              {record.fieldName}{" "}
                              {requiredFieldList.filter(
                                (element) =>
                                  element.columnName === record.columnName &&
                                  element.isRequired === 1
                              ).length == 1
                                ? "*"
                                : ""}{" "}
                            </Label>
                          </Col>
                          <Col sm="4">
                            <FormGroup
                              className={
                                values[`${columnName}TR`] === "Extract"
                                  ? "extract"
                                  : "manual"
                              }
                            >
                              <Input
                                disabled={!isEdit}
                                type="text"
                                name={columnName}
                                value={values[columnName]}
                                onChange={handleChange}
                                invalid={
                                  touched[record.columnName] &&
                                    errors[record.columnName]
                                    ? true
                                    : false
                                }
                                placeholder={`Enter ${columnName}`}
                              />
                              <FormFeedback>
                                {touched[record.columnName] &&
                                  errors[record.columnName]
                                  ? errors[record.columnName]
                                  : ""}{" "}
                              </FormFeedback>
                            </FormGroup>
                          </Col>
                        </Row>
                      ) : (
                        ""
                      )
                    ) : (
                      ""
                    )
                  ) : requiredFieldList.filter(
                    (element) =>
                      element.columnName === record.columnName &&
                      element.isVisible === 1
                  ).length == 1 ? (
                    <Row>
                      <Col sm="4">
                        <Label for={columnName}>
                          {record.fieldName}{" "}
                          {requiredFieldList.filter(
                            (element) =>
                              element.columnName === record.columnName &&
                              element.isRequired === 1
                          ).length == 1
                            ? "*"
                            : ""}{" "}
                        </Label>
                      </Col>
                      {record.fieldName == "Invoice Description" ||
                        record.fieldName == "Document Type" ||
                        record.fieldName == "Vendor/Supplier Name" ||
                        record.fieldName == "Vendor/Supplier Number" ||
                        record.fieldName == "Vendor/Supplier Site" ||
                        record.fieldName == "Invoice Currency" ||
                        record.fieldName == "Paid Amount" ? (
                        ""
                      ) : (
                        <Col sm="4">
                          <Input
                            type="select"
                            //required={record.isRequired===1}
                            name={record.fieldName}
                            id={record.fieldName}
                            disabled={
                              !isEdit ||
                              record.fieldName == "Invoice Description" ||
                              record.fieldName == "Document Type" ||
                              record.fieldName == "Vendor/Supplier Name" ||
                              record.fieldName == "Vendor/Supplier Number" ||
                              record.fieldName == "Invoice Currency" ||
                              record.fieldName == "Paid Amount"
                            }
                            data-labname={record.fieldName}
                            data-exaval={columnName}
                            onChange={(e) => RowHandlerChk(e)}
                            value={
                              Object.keys(selectedOption).length && Object.keys(selectedOption).includes(record.fieldName) ?
                                selectedOption[record.fieldName] || " " :
                                detectedData && detectedData[record.columnName]
                                  ? detectedData[record.columnName].label
                                  // detectedData[record.columnName].label.split(
                                  //     ":"
                                  //   )[0]
                                  : ""
                            }
                          >
                            <option value={""}></option>

                            {simtre1.map((i) => {
                              return (
                                <option
                                  style={{ display: Object.keys(selectedOption).length && Object.values(selectedOption).includes(i.label) ? "none" : "inherit" }}
                                  key={`col_${i.label}`}
                                  value={[i.label]}
                                  data-va={i.label}
                                  disabled={Object.keys(selectedOption).length && Object.values(selectedOption).includes(i.label)}
                                >
                                  {i.label}
                                </option>
                              );
                            })}
                          </Input>
                        </Col>
                      )}
                      {
                        // columnName == "Vendor/Supplier Number" ?  
                        //  <Col sm="4">
                        //         <Input
                        //           type="select"
                        //           // required={record.isRequired===1}
                        //           name={columnName}
                        //           id={columnName}
                        //           disabled={!isEdit}
                        //           data-labname={columnName}
                        //           data-exaval={record.columnName}
                        //           onChange={(e) => RowHandlerChk(e)}
                        //           value={
                        //             Object.keys(selectedOption).length && Object.keys(selectedOption).includes(columnName) ?
                        //             selectedOption[columnName] || " " :
                        //             detectedData.length && detectedData[record.columnName]
                        //               ? detectedData[record.columnName].label
                        //               // detectedData[record.columnName].label.split(
                        //               //     ":"
                        //               //   )[0]

                        //               : ""
                        //           }

                        //         >
                        //           <option value={""}></option>
                        //           {simtre1.map((i) => {
                        //             return (
                        //               <option
                        //                 //style={{ display: Object.keys(selectedOption).length  && Object.values(selectedOption).includes(i.label) ? "none" : "inherit" }}
                        //                 key={`vendor_${i.label}`}
                        //                 value={[i.label]}
                        //                 data-va={i.label}
                        //                 //disabled={Object.keys(selectedOption).length  && Object.values(selectedOption).includes(i.label)}
                        //               >
                        //                 {i.label}
                        //               </option>
                        //             );
                        //           })}
                        //         </Input>
                        //       </Col> :

                        <Col sm="4">
                          <FormGroup
                            className={
                              values[`${columnName}TR`] === "Extract"
                                ? "extract"
                                : "manual"
                            }
                          >
                            <Input
                              disabled={!isEdit}
                              type="text"
                              name={columnName}
                              value={values[columnName] != null ? values[columnName] : ""}
                              onChange={handleChange}
                              // onChange = {handleSelectInputChange}
                              invalid={
                                //touched[record.columnName] &&
                                errors[record.columnName]
                                  ? true
                                  : false
                              }
                              placeholder={`Enter ${columnName}`}
                            />
                            <FormFeedback>
                              {
                                errors[record.columnName]
                              }{" "}
                            </FormFeedback>
                          </FormGroup>
                        </Col>
                      }

                    </Row>
                  ) : (
                    ""
                  )}
              </div>
            );
          })}
      </div>
    </Fragment>
  );
}
