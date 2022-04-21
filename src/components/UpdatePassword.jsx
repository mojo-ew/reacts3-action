import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { DASHBOARD_ROUTE, SIGNIN_ROUTE } from "../constants/RoutePaths";
import {
  Container,
  Row,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Col,
  FormFeedback,
  Button,
  Spinner,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import logo from "../images/logo.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import { deCryptFun, enCryptFun, getEmail } from "./common/functions";
import { UPDATE_PASSWORD } from "./common/url";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { authHeader, getAlertToast } from "./common/mainfunctions";
import Swal from "sweetalert2";
import API from "./redux/API";
import { PASSWORD_REGEX } from "./common/constants";

export default function UpdatePassword() {
  let history = useHistory();
  const [loading, setloading] = useState(false);
  const [NewPasswordToggle, setNewPasswordToggle] = useState(false);
  const [OldPasswordToggle, setOldPasswordToggle] = useState(false);
  const [ConfirmPasswordToggle, setConfirmPasswordToggle] = useState(false);
  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Required"),
    newPassword: Yup.string()
      .required("Required")
      .matches(
        PASSWORD_REGEX,
        "Invalid Password, Must contain one lowercase and one uppercase"
      )
      .min("6", "Invalid Password,Password must be longer than 6 characters"),
    confirmnewPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Required"),
  });

  const { handleSubmit, handleChange, handleBlur, values, errors, touched } =
    useFormik({
      initialValues: {
        oldPassword: "",
        newPassword: "",
        confirmnewPassword: "",
      },
      validationSchema,
      onSubmit: (values) => UpdatePassword(values),
    });

  let UpdatePassword = async (values) => {
    setloading(true);
    // console.log("on update values", values)
    // console.log("getEmail", getEmail())
    values.email = getEmail();
    // console.log("values.email", getEmail())
    // console.log("onupdate after email assign", values)
    const config = {
      method: "PUT",
      url: UPDATE_PASSWORD,
      headers: authHeader(),
      data: //values,
     { webString: enCryptFun(
          JSON.stringify(
            values
          )
        ),
      flutterString: ""}
    };
    try {
      const response = await API(config);
      //const { status } = response.data;
      let l = deCryptFun(response.data);
      const { status } = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", "Password updated successfully"));
        history.push(DASHBOARD_ROUTE);
        setloading(false);
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(message);
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    } finally {
      setloading(false);
    }
  };
  let NewToogle = () => {
    setNewPasswordToggle(!NewPasswordToggle);
  };
  let ConfirmToogle = () => {
    setConfirmPasswordToggle(!ConfirmPasswordToggle);
  };
  let OldToogle = () => {
    setOldPasswordToggle(!OldPasswordToggle);
  };
  return (
    <div>
      <Container className="login-body-wrapper">
        <div class="login-wrapper d-flex align-items-center px-0">
          <Row className="w-100 mx-0">
            <Col md="4" className="mx-auto login-form">
              <div className="brand-logo">
                <img src={logo} />
              </div>
              <h4 class="mb-4">Update Password</h4>
              <Form form="true" onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="exampleEmail">Current Password</Label>
                  <InputGroup>
                    <Input
                      type={OldPasswordToggle ? "text" : "password"}
                      value={values.oldPassword}
                      onChange={handleChange}
                      invalid={
                        errors.oldPassword && touched.oldPassword ? true : false
                      }
                      placeholder="Enter Current Password"
                      onBlur={handleBlur}
                      name="oldPassword"
                      id=""
                    />
                    <InputGroupAddon
                      onClick={() => OldToogle()}
                      addonType="append"
                    >
                      <InputGroupText>
                        {OldPasswordToggle == false ? (
                          <AiFillEyeInvisible />
                        ) : (
                          <AiFillEye />
                        )}
                      </InputGroupText>
                    </InputGroupAddon>
                    <FormFeedback>
                      {errors.oldPassword && touched.oldPassword
                        ? errors.oldPassword
                        : ""}
                    </FormFeedback>
                  </InputGroup>
                </FormGroup>

                <FormGroup>
                  <Label for="newPassword">New Password</Label>
                  <InputGroup>
                    <Input
                      type={NewPasswordToggle ? "text" : "password"}
                      value={values.newPassword}
                      onChange={handleChange}
                      placeholder="Enter New Password"
                      invalid={
                        errors.newPassword && touched.newPassword ? true : false
                      }
                      onBlur={handleBlur}
                      name="newPassword"
                      id=""
                    />
                    <InputGroupAddon
                      onClick={() => NewToogle()}
                      addonType="append"
                    >
                      <InputGroupText>
                        {NewPasswordToggle == false ? (
                          <AiFillEyeInvisible />
                        ) : (
                          <AiFillEye />
                        )}
                      </InputGroupText>
                    </InputGroupAddon>
                    <FormFeedback>
                      {errors.newPassword && touched.newPassword
                        ? errors.newPassword
                        : ""}
                    </FormFeedback>
                  </InputGroup>
                </FormGroup>

                <FormGroup>
                  <Label for="confirmnewPassword">Confirm New Password</Label>
                  <InputGroup>
                    <Input
                      type={ConfirmPasswordToggle ? "text" : "password"}
                      value={values.confirmnewPassword}
                      onChange={handleChange}
                      placeholder="Confirm New Password"
                      invalid={
                        errors.confirmnewPassword && touched.confirmnewPassword
                          ? true
                          : false
                      }
                      onBlur={handleBlur}
                      name="confirmnewPassword"
                      id=""
                    />
                    <InputGroupAddon
                      onClick={() => ConfirmToogle()}
                      addonType="append"
                    >
                      <InputGroupText>
                        {ConfirmPasswordToggle == false ? (
                          <AiFillEyeInvisible />
                        ) : (
                          <AiFillEye />
                        )}
                      </InputGroupText>
                    </InputGroupAddon>
                    <FormFeedback>
                      {errors.confirmnewPassword && touched.confirmnewPassword
                        ? errors.confirmnewPassword
                        : ""}
                    </FormFeedback>
                  </InputGroup>
                </FormGroup>
                <Button
                  style={{ lineHeight: "2" }}
                  className="btn btn-primary btn-block"
                  color="primary"
                  type="submit"
                >
                  {loading && <Spinner color="light" />}UPDATE PASSWORD
                </Button>
              </Form>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
