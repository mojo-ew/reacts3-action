import React, { useState } from "react";
import { Fragment } from "react";
import {
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { ADD_SUPPLIER_REQUEST_URL } from "../common/url";
import { deCryptFun, enCryptFun, getTeamID, getUserId } from "../common/functions";
import API from "../redux/API";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import Swal from "sweetalert2";
import CustomButtonLoader from "../common/CustomButtonLoader";

export default function AddRequest(props) {
  const { requestModal, addToggle, successCallBack } = props;
  const [loading, setLoading] = useState(false);
  const validationSchema = Yup.object({
    supplierEmail: Yup.string()
      .email("Invalid email")
      .required("Supplier Email Required"),
  });

  const saveFormValues = async (values) => {
    setLoading(true);
    const config = {
      method: "POST",
      url: ADD_SUPPLIER_REQUEST_URL,
      headers: authHeader(),
      data: {
        // ...values,
        // teamId: getTeamID(),
        // requestedBy: getUserId(),
         webString: enCryptFun(
          JSON.stringify({
             ...values,
        teamId: getTeamID(),
        requestedBy: getUserId(),
          })
        ),
         flutterString: "",
      },
    };
    try {
      const response = await API(config);
      //const { status, message } = response.data;
       let l = deCryptFun(response.data);
     
      const { status, message} = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", "Request sent Successfully!"));
      } else {
        Swal.fire(getAlert("error", message));
      }
    } catch (error) {
      if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    } finally {
      successCallBack();
      setLoading(false);
    }
  };

  const { handleSubmit, handleChange, values, errors, touched } = useFormik({
    initialValues: {
      supplierEmail: "",
    },
    validationSchema,
    onSubmit: (values) => {
      saveFormValues(values);
    },
  });

  return (
    <Modal isOpen={requestModal} toggle={addToggle} className="">
      <Form form="true" onSubmit={handleSubmit}>
        <ModalHeader toggle={addToggle}>Add New Request</ModalHeader>
        <ModalBody className="p-3">
          <FormGroup>
            <Label for="supplierEmail">Supplier Email</Label>
            <Input
              type="text"
              name="supplierEmail"
              id="supplierEmail"
              placeholder="Enter Supplier Email"
              invalid={
                errors.supplierEmail && touched.supplierEmail ? true : false
              }
              onChange={handleChange}
              value={values.supplierEmail}
            />
            <FormFeedback>
              {errors.supplierEmail && touched.supplierEmail
                ? errors.supplierEmail
                : ""}
            </FormFeedback>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={loading}>
            {loading && <CustomButtonLoader loading={loading ? true : false} />}
            Submit
          </Button>
          <Button color="primary" onClick={addToggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
