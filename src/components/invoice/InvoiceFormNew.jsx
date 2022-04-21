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
} from "reactstrap";
import moment from "moment";
import {
  deCryptFun,
  enCryptFun,
  getSorting,
  getTeamID,
  stableSort,
} from "../../components/common/functions";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { authHeader, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import { EXTRACTION_FORM_URL, GET_FORMAT_SETTING_URL } from "../common/url";
import Swal from "sweetalert2";
import { valuesIn } from "lodash";

export default function InvoiceFormNew(props) {
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
    phoneNumberTR,
    documentTypeTR,
    postalCode,
  } = values;
  //   const fieldArray=[
  //     {
  //     fieldOrder:1,fieldName:"Invoice Number",type:"text",
  //   },
  //   {
  //     fieldOrder:2,fieldName:"PO Number",type:"text",

  //   }
  // ]
  const [startDate, setStartDate] = useState();
  const [duedate, setdueDate] = useState();
  const [type, setType] = useState("MM/dd/yyyy");
  const [rowValue, setRowValue] = useState("");
  const [rawsec, setRawSec] = useState([]);
  const [f, setF] = useState();
  const RowHandler = (e) => {
    let te = { name: "dueAmount", value: "invoiceAmount" };
    // rawsec.push(te);
    setRowValue(e.target.value);
  };
  const RowHandlerChk = (e) => {
    let temp = rawsec;
    let fe = temp.find(
      (element) => element.name == e.currentTarget.dataset.labname
    );
    if (fe) {
      temp.find(
        (element) => element.name == e.currentTarget.dataset.labname
      ).value = e.target.value;
      temp.push({
        name: e.currentTarget.dataset.labname,
        value: e.target.value,
      });
    } else {
      temp.push({
        name: e.currentTarget.dataset.labname,
        value: e.target.value,
      });
    }
    setRawSec(temp);
    // if (fe) {
    //   setF(fe);

    //   console.log("vajj", temp, f);
    // } else {
    //   setF("");
    // }
    setFormValues({ ...values });
  };
  const [rowValuepo, setRowValuepo] = useState("");
  const RowHandlerforPo = (e) => {
    setRowValuepo(e.target.value);
  };
  const [rowValuedate, setRowValuedate] = useState("");
  const RowHandlerdate = (e) => {
    setRowValuedate(e.target.value);
  };
  useEffect(() => {
    if (invoiceDate) {
      setStartDate(new Date(invoiceDate));
    }
  }, [invoiceDate]);
  useEffect(() => {
    if (dueDateYYYMMDD) {
      setdueDate(new Date(dueDateYYYMMDD));
    }
  }, [dueDateYYYMMDD]);

  const [selectFlag, setSelectFlag] = useState(true);
  const [selectFlaginvoice, setSelectFlaginvoice] = useState(true);
  const changedDate = (e) => {
    setSelectFlaginvoice(true);
    setStartDate(e);
    setValues((val) => ({ ...val, invoiceDate: e }));
  };
  const changedDatedue = (e) => {
    setSelectFlag(true);
    setdueDate(e);
    setValues((val) => ({ ...val, dueDateYYYMMDD: e }));
  };

  const getdateFormatSetting = async () => {
    const configget = {
      method: "GET",
      url: GET_FORMAT_SETTING_URL,
      params: {
         getSettingsString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            
          })
        ),
      },
      headers: authHeader(),
    };

    try {
      const response = await API(configget);
      const { message, data } = response.data;
      //  let l = deCryptFun(response.data);
      // const { message, data } = JSON.parse(l);
      if (message === "Success") {
        const { dateFormat = "MM/dd/yyyy" } = data;

        if (dateFormat == "") {
          setType("MM/dd/yyyy");
        } else {
          setType(dateFormat);
        }
      }
    } catch (error) {
      let errorObj = Object.assign({}, error);
      let { data } = errorObj.response;
      Swal.fire("Error", data.message);
    }
  };
  useEffect(() => {
    getdateFormatSetting(getTeamID());
  }, []);
  const startRef = useRef();
  const startRefinvoice = useRef();
  const onKeyDown = (e) => {
    if (e.key === "Tab" || e.which === 9) {
      startRef.current.setOpen(false);
    }
  };
  const onKeyDowninvoice = (e) => {
    if (e.key === "Tab" || e.which === 9) {
      startRefinvoice.current.setOpen(false);
    }
  };

  const handleChangeRaw = (value) => {
    let format = "";
    if (type == "dd/MM/yyyy") {
      format = "DD/MM/yyyy";
    } else {
      format = "MM/DD/yyyy";
    }
    if (value) {
      setSelectFlag(false);
    }

    if (!selectFlag) {
      if (moment(value, format).isValid() == false) {
        Swal.fire(getAlertToast("Error", "Invalid Date"));
        setErrors({ dueDateYYYMMDD: "Invalid Date" });
        setValues((val) => ({ ...val, dueDateYYYMMDD: "" }));
        setdueDate("");
        setSelectFlag(true);
      } else {
        const final = new Date(moment(value, format));
        setValues((val) => ({ ...val, dueDateYYYMMDD: final }));
        setSelectFlag(true);
      }
    }
  };

  const handleChangeRawinvoice = (value) => {
    let format = "";
    if (type == "dd/MM/yyyy") {
      format = "DD/MM/yyyy";
    } else {
      format = "MM/DD/yyyy";
    }
    if (value) {
      setSelectFlaginvoice(false);
    }

    if (!selectFlaginvoice) {
      if (moment(value, format).isValid() == false) {
        Swal.fire(getAlertToast("Error", "Invalid Date"));
        setErrors({ invoiceDate: "Invalid Date" });
        setValues((val) => ({ ...val, invoiceDate: "" }));
        setStartDate("");
        setSelectFlaginvoice(true);
      } else {
        const final = new Date(moment(value, format));
        setValues((val) => ({ ...val, invoiceDate: final }));
        setSelectFlaginvoice(true);
      }
    }
  };
  const nameLabels = [
    { id: 1, name: "Paid Amount" },
    { id: 2, name: "Due Amount" },
    { id: 3, name: "Tax Total" },
    { id: 4, name: "Purchase Order Number" },
    { id: 5, name: "Invoice Amount" },
    { id: 6, name: "Invoice Description" },
    { id: 7, name: "Document Type" },
    { id: 8, name: "Vendor/Supplier Name" },
    { id: 9, name: "Vendor/Supplier Number" },
    { id: 10, name: "Invoice Currency" },
    { id: 11, name: "Invoice Date" },
    { id: 12, name: "Due Date" },
    { id: 13, name: "IBAN" },
    { id: 14, name: "Sort Code" },
    { id: 15, name: "Vendor/Supplier Bank Account" },
    { id: 16, name: "BIC/SWIFT" },
    { id: 17, name: "Vendor/Supplier site" },
    { id: 18, name: "Vendor/Supplier Tax Number" },
    { id: 19, name: "Vendor/Supplier Email" },
  ];
  const initialVal = [
    { identitylabel: "Paid Amount", valueoflab: "78750" },
    { identitylabel: "Due Amount", valueoflab: "100" },
    { identitylabel: "Tax Total", valueoflab: "200" },
    { identitylabel: "Purchase Order Number", valueoflab: "332458" },
    { identitylabel: "Invoice Amount", valueoflab: "723.63" },
    { identitylabel: "Invoice Number", valueoflab: "302 0033677" },
    { identitylabel: "Invoice Description", valueoflab: "Description" },
    { identitylabel: "Document Type", valueoflab: "INVOICE" },
    { identitylabel: "Vendor/Supplier Name", valueoflab: "CYI CYMER, LLC" },
    { identitylabel: "Vendor/Supplier Number", valueoflab: "1234567898" },
    { identitylabel: "Invoice Currency", valueoflab: "USD" },
    { identitylabel: "Invoice Date", valueoflab: "12/11/2021" },
    { identitylabel: "Due Date", valueoflab: "13/10/2021" },
    { identitylabel: "Sort Code", valueoflab: "011001962" },
    { identitylabel: "Vendor/Supplier Bank Account", valueoflab: "P160666" },
    { identitylabel: "BIC/SWIFT", valueoflab: "" },
    { identitylabel: "IBAN", valueoflab: "" },
    { identitylabel: "Vendor/Supplier site", valueoflab: "60 O'Connor Road" },
    {
      identitylabel: "Vendor/Supplier Tax Number",
      valueoflab: "Corning Tropel Corporation",
    },
    {
      identitylabel: "Vendor/Supplier Email",
      valueoflab: "gayathris@apptomate.co",
    },
  ];

  const [staticValueSample, setStaticSample] = useState(initialVal);
  const [dynamicVal, setDynamicVal] = useState([]);
  const [fff, setHF] = useState(false);
  const handleChangeFun = (e) => {
    let val = e.target.value;
    let label = e.currentTarget.dataset.idlabel;
    let tempstatic = staticValueSample;
    tempstatic.find((element) => element.identitylabel == label).valueoflab =
      val;
    setStaticSample(tempstatic);
    setHF(!fff);
  };

  const getKeyPairValues = async () => {
    const configkp = {
      method: "GET",
      url: EXTRACTION_FORM_URL,
      headers: authHeader(),
      params: {
        invoiceId: invoiceID,
      //  getFormValuesByIdString: enCryptFun(
      //     JSON.stringify({
      //        invoiceId: invoiceID,
      //     })
      //   ),
      },
    };
    try {
     
      const response = await API(configkp);

     
      const { status, documentData = "" } = response.data;
      // let l = deCryptFun(response.data);
      // const { status, documentData = "" } = JSON.parse(l);
      if (status == "Success") {
      
        setDynamicVal(documentData);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getKeyPairValues();
  }, []);
 
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
        {nameLabels.map((record, index) => {
          const findingc = rawsec.find(
            (element) => element.name === record.name
          );
          let nts = "";
          let foundval = "";
          if (findingc) {
           
            nts = rawsec.find((element) => element.name === record.name).value;
            foundval = staticValueSample.find(
              (element) => element.identitylabel == nts
            ).valueoflab;
          }
         
          let simtre = staticValueSample.filter(
            (idla) => idla.identitylabel !== record.name
          );

          return (
            <FormGroup>
              {(isEdit && record.name === "Sort Code") ||
              record.name === "IBAN" ||
              record.name === "Vendor/Supplier Bank Account" ||
              record.name === "Vendor/Supplier Email" ||
              record.name === "Vendor/Supplier Tax Number" ||
              record.name === "Vendor/Supplier site" ||
              record.name === "BIC/SWIFT" ? (
                ""
              ) : (
                <Row>
                  <Col sm="4">
                    <Label for={record.name}>{record.name}</Label>
                  </Col>

                  <Col sm="4">
                    <Input
                      type="select"
                      name={record.name}
                      id={record.name}
                      disabled={!isEdit}
                      data-labname={record.name}
                      onChange={(e) => RowHandlerChk(e)}
                      // value={record.name}
                    >
                      <option>{record.name}</option>

                      {simtre.map((i) => {
                        return (
                          <option
                            key={`showing_${i}`}
                            value={[i.identitylabel]}
                            data-va={i.label}
                          >
                            {i.identitylabel}
                          </option>
                        );
                      })}
                    </Input>
                  </Col>
                  <Col sm="4" className="extract">
                    <Input
                      disabled={!isEdit}
                      type="text"
                      name="paidAmount"
                      value={
                        rawsec.find((element) => element.name === record.name)
                          ? foundval
                          : staticValueSample.find(
                              (element) => element.identitylabel == record.name
                            ).valueoflab
                      }
                      data-idlabel={record.name}
                      onChange={handleChangeFun}
                      placeholder={`Enter ${record.name}`}
                    />
                  </Col>
                </Row>
              )}
            </FormGroup>
          );
        })}
      </div>
      <div>
        {requiredFieldList &&
          stableSort(
            requiredFieldList.filter((i) => i.moduleName == "Invoice"),
            getSorting("asc", "fieldOrder")
          ).map((record, index) => {
            const { columnName, dataFormat } = record;
            const findingc = rawsec.find(
              (element) => element.name === record.fieldName
            );
            let nts = "";
            let foundval = "";
            if (findingc) {
             
              nts = rawsec.find(
                (element) => element.name === record.fieldName
              ).value;
              foundval = staticValueSample.find(
                (element) => element.identitylabel == nts
              ).valueoflab;
            }
         
            let simtre = staticValueSample.filter(
              (idla) => idla.identitylabel !== record.name
            );
            return (
              <div>
                <Row>
                  {[
                    "dueDate",
                    "invoiceDate",
                    "paidAmount",
                    "orderNumber",
                  ].includes(columnName) && record.isVisible == 1 ? (
                    columnName == "orderNumber" ? (
                      defaultInvoiceType == "po" ? (
                        <>
                          <Col md="3">
                            <FormGroup
                              className={
                                orderNumberTR === "Extract"
                                  ? "extract"
                                  : "manual"
                              }
                            >
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
                            </FormGroup>
                          </Col>
                          <Col sm="4">
                            <Input
                              type="select"
                              name={record.fieldName}
                              id={record.fieldName}
                              disabled={!isEdit}
                              data-labname={record.fieldName}
                              onChange={(e) => RowHandlerChk(e)}
                              // value={record.name}
                            >
                              <option>{record.name}</option>

                              {simtre.map((i) => {
                                return (
                                  <option
                                    key={`showing_${i}`}
                                    value={[i.identitylabel]}
                                    data-va={i.label}
                                  >
                                    {i.identitylabel}
                                  </option>
                                );
                              })}
                            </Input>
                          </Col>
                          <Col md="4">
                            <Input
                              disabled={!isEdit}
                              type="text"
                              name="orderNumber"
                              value={
                                rawsec.find(
                                  (element) => element.name === record.fieldName
                                )
                                  ? foundval
                                  : staticValueSample.find(
                                      (element) =>
                                        element.identitylabel ==
                                        record.fieldName
                                    ).valueoflab
                              }
                              onChange={handleChangeFun}
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
                          </Col>
                        </>
                      ) : (
                        ""
                      )
                    ) : (
                      ""
                    )
                  ) : (
                    ""
                  )}
                </Row>
              </div>
            );
          })}
      </div>
    </Fragment>
  );
}
