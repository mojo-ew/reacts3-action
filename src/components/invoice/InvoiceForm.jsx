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
import { GET_FORMAT_SETTING_URL } from "../common/url";
import Swal from "sweetalert2";
import { valuesIn } from "lodash";

export default function InvoiceDetails(props) {
  const {
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
       // teamId: getTeamID(),
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
      const {message,data } = JSON.parse(l);
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
      <div className="invoiceDataScroll">
        {requiredFieldList &&
          stableSort(
            requiredFieldList.filter((i) => i.moduleName == "Invoice"),
            getSorting("asc", "fieldOrder")
          ).map((record, index) => {
            const { columnName, dataFormat } = record;

            return (
              <div>
                {[
                  "dueDate",
                  "invoiceDate",
                  "paidAmount",
                  "orderNumber",
                ].includes(columnName) && record.isVisible == 1 ? (
                  columnName == "orderNumber" ? (
                    defaultInvoiceType == "po" ? (
                      <FormGroup
                        className={
                          orderNumberTR === "Extract" ? "extract" : "manual"
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
                        <Input
                          disabled={!isEdit}
                          type="text"
                          name="orderNumber"
                          value={orderNumber}
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
                    ) : (
                      ""
                    )
                  ) : columnName == "paidAmount" ? (
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
                      <Input
                        type="number"
                        disabled={!isEdit}
                        name="paidAmount"
                        value={paidAmount}
                        // min={1}
                        max={99999999}
                        step=".01"
                        onChange={handleChange}
                        invalid={
                          touched.paidAmount && errors.paidAmount ? true : false
                        }
                        placeholder="Enter Paid Amount"
                      />
                      <FormFeedback>
                        {touched.paidAmount && errors.paidAmount
                          ? errors.paidAmount
                          : ""}{" "}
                      </FormFeedback>
                    </FormGroup>
                  ) : (
                    <FormGroup>
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
                      <>
                        <DatePicker
                          className="react-datepicker__input-container input"
                          disabled={!isEdit}
                          name={
                            columnName == "dueDate"
                              ? "dueDateYYYMMDD"
                              : "invoiceDate"
                          }
                          onSelect={
                            columnName == "dueDate"
                              ? (date) => changedDatedue(date)
                              : (date) => changedDate(date)
                          }
                          invalid={
                            columnName == "dueDate"
                              ? touched.dueDateYYYMMDD && errors.dueDateYYYMMDD
                                ? true
                                : false
                              : touched.invoiceDate && errors.invoiceDate
                              ? true
                              : false
                          }
                          dateFormat={type}
                          selected={
                            columnName == "dueDate" ? duedate : startDate
                          }
                          placeholderText={type}
                          onChangeRaw={
                            columnName == "dueDate"
                              ? (event) => handleChangeRaw(event.target.value)
                              : (event) =>
                                  handleChangeRawinvoice(event.target.value)
                          }
                          ref={
                            columnName == "dueDate" ? startRef : startRefinvoice
                          }
                          onKeyDown={
                            columnName == "dueDate"
                              ? onKeyDown
                              : onKeyDowninvoice
                          }
                        />
                        {/* <hr
                          style={{
                            border: "0",
                            borderTop: " 1px solid rgb(52 174 106)",
                          }} */}
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
                          ? touched.dueDateYYYMMDD && errors.dueDateYYYMMDD
                            ? errors.dueDateYYYMMDD
                            : ""
                          : touched.invoiceDate && errors.invoiceDate
                          ? errors.invoiceDate
                          : ""}{" "}
                      </FormFeedback>
                    </FormGroup>
                  )
                ) : // ""
                columnName == "senderEmail" ||
                  columnName == "supplierId" ||
                  columnName == "supplierSite" ||
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
                      <FormGroup
                        className={
                          values[`${columnName}TR`] === "Extract"
                            ? "extract"
                            : "manual"
                        }
                      >
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
                  <FormGroup
                    className={
                      values[`${columnName}TR`] === "Extract"
                        ? "extract"
                        : "manual"
                    }
                  >
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
                    <Input
                      disabled={!isEdit}
                      type="text"
                      name={columnName}
                      value={values[columnName]}
                      onChange={handleChange}
                      invalid={
                        touched[record.columnName] && errors[record.columnName]
                          ? true
                          : false
                      }
                      placeholder={`Enter ${columnName}`}
                    />
                    <FormFeedback>
                      {touched[record.columnName] && errors[record.columnName]
                        ? errors[record.columnName]
                        : ""}{" "}
                    </FormFeedback>
                  </FormGroup>
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
