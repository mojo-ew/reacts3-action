import { swap } from "formik";
import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  Spinner,
  FormFeedback,
  InputGroupText,
  ModalFooter,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { deCryptFun, enCryptFun, getEmail, getTeamID } from "../common/functions";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import { NOTIFY_SUPPLIER_URL } from "../common/url";
import API from "../redux/API";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { useFormik } from "formik";
export default function NotifySupplier(props) {
  const { suppFlag, CloseToggle, number, email } = props;

  const supplierSubmit = async (values) => {
    const config = {
      method: "POST",
      url: NOTIFY_SUPPLIER_URL,
      headers: authHeader(),
      data: {
        // teamId: getTeamID(),
        // supplierEmail: email,
        // invoiceNumber:
        //   values.invoiceNumber === "N/A" ? "" : values.invoiceNumber,
        // requesterEmail: getEmail(),
          webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
        supplierEmail: email,
        invoiceNumber:
          values.invoiceNumber === "N/A" ? "" : values.invoiceNumber,
        requesterEmail: getEmail(),
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
     // const { status, message } = response.data;
       let l = deCryptFun(response.data);
      const { status, message} = JSON.parse(l);
      Swal.fire(getAlertToast("success", message));
      CloseToggle();
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
  const validationSchema = Yup.object().shape({
    // invoiceNumber: Yup.string().required("Required"),
  });

  const { handleSubmit, handleChange, values, handleBlur, errors, touched } =
    useFormik({
      initialValues: {
        invoiceNumber: number === "N/A" ? "" : number,
      },
      validationSchema,
      onSubmit: (values) => supplierSubmit(values),
    });

  return (
    <Modal isOpen={suppFlag} toggle={CloseToggle}>
      <Form form="true" onSubmit={handleSubmit}>
        <ModalHeader>
          <p>
            Are you sure to notify this supplier if this particular invoice
            looks pixelated, corrupted or poor in terms of quality?
          </p>
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="invoiceNumber">Invoice Number </Label>
            <Input
              // disabled={number !== "N/A"}
              type="text"
              name="invoiceNumber"
              value={values.invoiceNumber}
              placeholder="Enter Invoice Number"
              onChange={handleChange}
              invalid={
                touched.invoiceNumber && errors.invoiceNumber ? true : false
              }
            />
            <FormFeedback>
              {touched.invoiceNumber && errors.invoiceNumber
                ? errors.invoiceNumber
                : ""}{" "}
            </FormFeedback>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit">
            Yes
            {/* {loading && <Spinner color="light" />} */}
          </Button>
          <Button color="primary" onClick={CloseToggle}>
            No
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
