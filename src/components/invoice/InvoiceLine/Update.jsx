import React, { Fragment, useState } from "react";
import {
  FormGroup,
  Modal,
  ModalBody,
  ModalHeader,
  Label,
  Input,
  ModalFooter,
  Button,
  Form,
  FormFeedback,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

import { INVOICE_LINE_UPDATE_URL } from "../../common/url";
import {
  authHeader,
  getAlert,
  getAlertToast,
} from "../../common/mainfunctions";
import API from "../../redux/API";
import CustomButtonLoader from "../../common/CustomButtonLoader";
import Swal from "sweetalert2";
import { deCryptFun, enCryptFun } from "../../common/functions";

export default function CreateInvoice(props) {
  const {
    updateInvoiceModal,
    updateinvoiceToggle,
    submitCallBack1,
    invoiceID,
    selectedInvoice,
    getIvoiceListing,
    invoiceUnit,
    invoiceType,
    invoiceAmount,
    invoiceNumber,
  } = props;
  const [loading, setLoading] = useState(false);
  const validationSchema = Yup.object({
    operatingUnit: Yup.string().trim().required("Operating Unit is required"),
    invoiceLineAmount: Yup.string()
      .trim()
      .required("Invoice Amount is required"),
    invoiceLineNumber: Yup.string().trim().required("Line Number is required"),
    invoiceLineType: Yup.string()
      .trim()

      .required(" Line Type is required"),
  });
  const saveFormValues = async (values) => {
    setLoading(true);
    const config = {
      method: "PUT",
      url: INVOICE_LINE_UPDATE_URL,
      data: { // ...values, invoiceId: invoiceID, invoiceLineId: selectedInvoice,
      webString: enCryptFun(
          JSON.stringify({
            ...values, invoiceId: invoiceID, invoiceLineId: selectedInvoice,
          })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };

    try {
      const response = await API(config);
      //const { status } = response.data;
      let l = deCryptFun(response.data);
      const { status} = JSON.parse(l);
      if (status == "Success") {
        Swal.fire(
          getAlertToast("success", "Invoice Line Updated successfully!")
        );
      }
      submitCallBack1();
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
  //Formik
  const {
    handleSubmit,
    handleChange,
    values,
    errors,
    touched,
    handleBlur,
  } = useFormik({
    initialValues: {
      operatingUnit: invoiceUnit,
      invoiceLineAmount: invoiceAmount,
      invoiceLineNumber: invoiceNumber,
      invoiceLineType: invoiceType,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => saveFormValues(values),
  });

  return (
    <Fragment>
      <Modal
        isOpen={updateInvoiceModal}
        toggle={updateinvoiceToggle}
        className=""
      >
        <ModalHeader toggle={updateinvoiceToggle}>Update Invoice</ModalHeader>
        <ModalBody>
          <Form form="true" onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="operatingUnit">Operating Unit</Label>
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

            <FormGroup>
              <Label for="invoiceLineAmount">Line Amount</Label>
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
            <FormGroup>
              <Label for="invoiceLineNumber">Line Number</Label>
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
            <FormGroup>
              <Label for="invoiceLineType">Line Type</Label>
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
            <ModalFooter>
              <Button color="primary" type="submit">
                {loading && <CustomButtonLoader />}
                Update
              </Button>
            </ModalFooter>
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
}
