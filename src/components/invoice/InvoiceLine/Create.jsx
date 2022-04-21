import React, { Fragment, useEffect, useState } from "react";
import {
  FormGroup,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Col,
  Label,
  Input,
  ModalFooter,
  Button,
  Form,
  FormFeedback,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { deCryptFun, enCryptFun, getRole, getSubTeamId, getTeamID } from "../../common/functions";
import {
  GET_INVOICE_FIELDS,
  INVOICELINE_CREATE_URL,
  INVOICE_LINE_UPDATE_URL,
} from "../../common/url";
import {
  authHeader,
  getAlert,
  getAlertToast,
} from "../../common/mainfunctions";
import API from "../../redux/API";
import CustomButtonLoader from "../../common/CustomButtonLoader";
import Swal from "sweetalert2";
import { getSorting, stableSort } from "../../common/functions";
import DatePicker from "react-datepicker";
import moment from "moment";

export default function CreateInvoice(props) {
  const {
    createInvoiceModal,
    flag,
    invoiceToggle,
    formData,
    submitCallBack,
    invoiceID,
    dialogueView,
    type,
    GlCode
  } = props;
  //console.log("dialogueView", dialogueView)
  const [loading, setLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState();
  const subTeamId = getSubTeamId();
  const [requiredFieldList, setRequiredFieldList] = useState([]);
  const [glDate, setGlDate] = useState();
  const validationSchema = Yup.object({
    // operatingUnit: Yup.string().test(
    //   "operatingUnitTest",
    //   "Field is required",
    //   function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return (
    //         element.columnName === "operatingUnit" &&
    //         element.isRequired === 1 &&
    //         element.isVisible === 1
    //       );
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   }
    // ),
    
    // invoiceLineNumber: Yup.string().test(
    //   "invoiceLineNumberTest",
    //   "Field is required",
    //   function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return (
    //         element.columnName === "invoiceLineNumber" &&
    //         element.isRequired === 1 &&
    //         element.isVisible === 1
    //       );
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   }
    // ),
    // invoiceLineNumber: Yup.string().trim().required("Line Number is required"),
    // invoiceLineType: Yup.string().test(
    //   "invoiceLineTypeTest",
    //   "Field is required",
    //   function (value) {
    //     var found = requiredFieldList.filter(function (element) {
    //       return (
    //         element.columnName === "invoiceLineType" &&
    //         element.isRequired === 1 &&
    //         element.isVisible === 1
    //       );
    //     });
    //     return !value && found.length === 1 ? false : true;
    //   }
    // ),

    extendedPrice: Yup.string().test(
      "extendedPriceTest",
      "Field is required",
      function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "extendedPrice" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      }
    ).nullable(),

    unitOfMeasure: Yup.string().test(
      "unitOfMeasureTest",
      "Field is required",
      function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "unitOfMeasure" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      }
    ).nullable(),
    itemDescription: Yup.string().test(
      "itemDescriptionTest",
      "Field is required",
      function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "itemDescription" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      }
    ).nullable(),
    itemNumber: Yup.string().test(
      "itemNumberTest",
      "Field is required",
      function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "itemNumber" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      }
    ).nullable(),
    poLineNumber: Yup.string().test(
      "poLineNumberTest",
      "Field is required",
      function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "poLineNumber" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      }
    ).nullable(),
    poNumber: Yup.string().test(
      "poNumberTest",
      "Field is required",
      function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "poNumber" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      }
    ).nullable(),
    quantity: Yup.string().test(
      "quantityTest",
      "Field is required",
      function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "quantity" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      }
    ).nullable(),
    unitPrice: Yup.string().test(
      "unitPriceTest",
      "Field is required",
      function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "unitPrice" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      }
    ).nullable(),
    glAccount: Yup.string().test(
      "glAccountTest",
      "Field is required",
      function (value) {
        var found = requiredFieldList.filter(function (element) {
          return (
            element.columnName === "glAccount" &&
            element.isRequired === 1 &&
            element.isVisible === 1
          );
        });
        return !value && found.length === 1 ? false : true;
      }
    ).nullable(),
    
    




    // invoiceLineType: Yup.string()
    //   .trim()

    //   .required(" Line Type is required"),
  });
  const saveFormValues = async (values) => {
    //console.log("glDate on call", glDate, "formatted", moment(new Date(glDate)).format("yyyy/MM/DD"))
    console.log("save in values", values)
    setLoading(true);
    const config = {
      method: flag ? "POST" : "PUT",
      url: flag ? INVOICELINE_CREATE_URL : INVOICE_LINE_UPDATE_URL,
      // data: { ...values, invoiceId: invoiceID 
      
      // },
      data:  {webString: enCryptFun(
          JSON.stringify({
            ...values, invoiceId: invoiceID , GLDate: moment(new Date(glDate)).format("yyyy/MM/DD") ,
          })
        ), 
        flutterString: "",
       } ,
      headers: authHeader(),
    };

    try {
      const response = await API(config);
     // const { status, data } = response.data;
  let l = deCryptFun(response.data);
          const { status,data } = JSON.parse(l);
      Swal.fire(
        getAlertToast(
          "success",
          flag
            ? "Invoice Line created successfully!"
            : "Invoice Line Update successfully!"
        )
      );
      resetForm();
      submitCallBack();
    } catch (error) {
      // let { data } = error.response;
      // Swal.fire(getAlert("error", data));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const GetRequiredValues = async () => {
    const config = {
      method: "GET",
      url: GET_INVOICE_FIELDS,
      params: {// teamId: getRole() == "Supplier" ? subTeamId : getTeamID(),
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
     // const { status, data } = response.data;
       let l = deCryptFun(response.data);
      const {  status, data } = JSON.parse(l);
      if (status === "Success") {
        // let requiredFields = data.filter((d) => { return d.isMandatory === 1});
       // console.log("fieldList data", data)
        setRequiredFieldList(data);
      }
    } catch (error) {
     // Swal.fire("Error", error);
      if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    }
  };
  //Formik
  const {
    handleSubmit,
    handleChange,
    values,
    errors,
    touched,
    resetForm,
    handleBlur,
  } = useFormik({
    initialValues: formData,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => saveFormValues(values),
  });

  useEffect(() => {
    GetRequiredValues();
  }, [subTeamId]);
  const op = requiredFieldList.filter(
    (element) =>
      element.columnName === "operatingUnit" && element.isMandatory === 1
  );
  const lineAmountRequired = requiredFieldList.filter(
    (element) =>
      element.columnName === "operatingUnit" && element.isMandatory === 1
  );
  return (
    <Fragment>
      <Modal
        isOpen={createInvoiceModal}
        toggle={() => invoiceToggle(resetForm({}))}
        className=""
      >
        <ModalHeader toggle={invoiceToggle}>
          {flag ? "Add Invoice Line Item" : "Update Invoice Line Item"}
        </ModalHeader>
        <ModalBody>
          <Form form="true" onSubmit={handleSubmit}>
            {requiredFieldList &&
              stableSort(
                requiredFieldList.filter((i) => i.moduleName == "Invoice Line"),
                getSorting("asc", "fieldOrder")
              ).map((record, index) => {
                const { columnName } = record;
                console.log("value columnName", columnName, "value Values", values)
                return requiredFieldList.filter(
                  (element) =>
                    element.columnName === record.columnName &&
                    element.isVisible === 1 && element.columnName != "glCode"
                ).length == 1 ? (
                  columnName == "GLDate" ? 
                  <FormGroup>
                    <Label for={columnName}>
                      {record.fieldName}{" "}
                      {requiredFieldList.filter(
                        (element) =>
                          element.columnName === columnName &&
                          element.isRequired === 1
                      ).length == 1
                        ? "*"
                        : ""}
                    </Label>
                    <DatePicker
      closeOnScroll={true}
      selected={glDate}
      //onChange={(date) => values[columnName] ? setGlDate(new Date(values[columnName])): setGlDate(new Date(date))}
      onChange = {(date) => setGlDate(new Date(date)) }
      disabled = {dialogueView=="viewLineItem"}
    />
                  </FormGroup> :
                  <FormGroup>
                    <Label for={columnName}>
                      {record.fieldName}{" "}
                      {requiredFieldList.filter(
                        (element) =>
                          element.columnName === columnName &&
                          element.isRequired === 1
                      ).length == 1
                        ? "*"
                        : ""}
                    </Label>
                    <Input
                    style={{backgroundColor:"white"}}
                      type="text"
                      name={columnName}
                      id={columnName}
                      placeholder={`Enter ${columnName}`}
                      invalid={
                        errors[record.columnName] && touched[record.columnName]
                          ? true
                          : false
                      }
                      value={values[columnName] ? values[columnName] : (columnName =='glAccount' ? GlCode:'')}
                      onChange={handleChange}
                      disabled = {dialogueView=="viewLineItem"}
                    />
                    <FormFeedback>
                      {errors[record.columnName] 
                      //&& touched[record.columnName]
                        ? errors[record.columnName]
                        : ""}
                    </FormFeedback>
                  </FormGroup>
                ) : (
                  ""
                );
              })}
              {
                type==="nonpo" && requiredFieldList && requiredFieldList.filter(
                  (element) =>
                    element.columnName === "glAccount" 
                ).length == 1 &&  
                  requiredFieldList.filter(
                  (element) =>
                    element.columnName === "glAccount" 
                ).map(el => {
                  const {columnName,fieldName} = el;
                   console.log("Gl ColumnName", columnName, "Gl Values", values[columnName])
                  return (
 <FormGroup>
                    <Label for={columnName}>
                     {fieldName}
                    </Label>
                    <Input
                    style={{backgroundColor:"white"}}
                      type="text"
                      name={columnName}
                      id={columnName}
                      placeholder={`Enter ${columnName}`}
                      invalid={
                        errors[columnName] && touched[columnName]
                          ? true
                          : false
                      }
                      value={values[columnName] == null ? GlCode : values[columnName]}
                      onChange={handleChange}
                      disabled = {dialogueView=="viewLineItem"}
                    />
                    <FormFeedback>
                      {errors[columnName] 
                      //&& touched[record.columnName]
                        ? errors[columnName]
                        : ""}
                    </FormFeedback>
                  </FormGroup>
                  )
                })
                
              }

            {/* {requiredFieldList.filter(
              (element) =>
                element.columnName === "operatingUnit" &&
                element.isVisible === 1
            ).length == 1 ? (
              <FormGroup>
                <Label for="operatingUnit">
                  Operating Unit{" "}
                  {requiredFieldList.filter(
                    (element) =>
                      element.columnName === "operatingUnit" &&
                      element.isRequired === 1
                  ).length == 1
                    ? "*"
                    : ""}
                </Label>
                <Input
                  type="text"
                  name="operatingUnit"
                  id="operatingUnit"
                  placeholder="Enter Operating Unit"
                  invalid={
                    errors.operatingUnit && touched.operatingUnit ? true : false
                  }
                  value={values.operatingUnit}
                  onChange={handleChange}
                />
                <FormFeedback>
                  {errors.operatingUnit && touched.operatingUnit
                    ? errors.operatingUnit
                    : ""}
                </FormFeedback>
              </FormGroup>
            ) : (
              ""
            )}
            {requiredFieldList.filter(
              (element) =>
                element.columnName === "invoiceLineAmount" &&
                element.isVisible === 1
            ).length == 1 ? (
              <FormGroup>
                <Label for="invoiceLineAmount">
                  Line Amount{" "}
                  {requiredFieldList.filter(
                    (element) =>
                      element.columnName === "invoiceLineAmount" &&
                      element.isRequired === 1
                  ).length == 1
                    ? "*"
                    : ""}
                </Label>
                <Input
                  type="text"
                  name="invoiceLineAmount"
                  id="invoiceLineAmount"
                  placeholder="Enter Invoice Amount"
                  invalid={
                    errors.invoiceLineAmount && touched.invoiceLineAmount
                      ? true
                      : false
                  }
                  value={values.invoiceLineAmount}
                  onChange={handleChange}
                />
                <FormFeedback>
                  {errors.invoiceLineAmount && touched.invoiceLineAmount
                    ? errors.invoiceLineAmount
                    : ""}
                </FormFeedback>
              </FormGroup>
            ) : (
              ""
            )}
            {requiredFieldList.filter(
              (element) =>
                element.columnName === "invoiceLineNumber" &&
                element.isVisible === 1
            ).length == 1 ? (
              <FormGroup>
                <Label for="invoiceLineNumber">
                  Line Number{" "}
                  {requiredFieldList.filter(
                    (element) =>
                      element.columnName === "invoiceLineNumber" &&
                      element.isRequired === 1
                  ).length == 1
                    ? "*"
                    : ""}
                </Label>
                <Input
                  type="text"
                  name="invoiceLineNumber"
                  id="invoiceLineNumber"
                  placeholder="Enter Line Number"
                  invalid={
                    errors.invoiceLineNumber && touched.invoiceLineNumber
                      ? true
                      : false
                  }
                  value={values.invoiceLineNumber}
                  onChange={handleChange}
                />
                <FormFeedback>
                  {errors.invoiceLineNumber && touched.invoiceLineNumber
                    ? errors.invoiceLineNumber
                    : ""}
                </FormFeedback>
              </FormGroup>
            ) : (
              ""
            )}
            {requiredFieldList.filter(
              (element) =>
                element.columnName === "invoiceLineType" &&
                element.isVisible === 1
            ).length == 1 ? (
              <FormGroup>
                <Label for="invoiceLineType">
                  Line Type{" "}
                  {requiredFieldList.filter(
                    (element) =>
                      element.columnName === "invoiceLineType" &&
                      element.isRequired === 1
                  ).length == 1
                    ? "*"
                    : ""}
                </Label>
                <Input
                  type="text"
                  name="invoiceLineType"
                  id="invoiceLineType"
                  placeholder="Enter Line Type"
                  invalid={
                    errors.invoiceLineType && touched.invoiceLineType
                      ? true
                      : false
                  }
                  value={values.invoiceLineType}
                  onChange={handleChange}
                />
                <FormFeedback>
                  {errors.invoiceLineType && touched.invoiceLineType
                    ? errors.invoiceLineType
                    : ""}
                </FormFeedback>
              </FormGroup>
            ) : (
              ""
            )} */}
            <ModalFooter>
              {dialogueView=="viewLineItem" ?  null : <Button color="primary" type="submit" disabled={loading===true}>
                {loading && <CustomButtonLoader />}
                {flag ? "Add" : "Update"}
              </Button> }
            </ModalFooter>
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
}
