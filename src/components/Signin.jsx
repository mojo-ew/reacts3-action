import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  FORGOT_PASSWORD_ROUTE,
  UPDATE_PASSWORD_ROUTE,
  DASHBOARD_ROUTE,
  SIGNUP_ROUTE,
} from "../constants/RoutePaths";
import {
  Container,
  Spinner,
  Row,
  Col,
  FormFeedback,
  InputGroupAddon,
  InputGroup,
  InputGroupText,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
} from "reactstrap";
import logo from "../images/logo.png";
import { useFormik } from "formik";
import { LOGIN_URL } from "./common/url";
import API from "./redux/API";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { getAlertToast } from "./common/mainfunctions";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useDispatch } from "react-redux";
import {
  UPDATE_APROVAL_AMOUNT,
  UPDATE_COMPANY_LOGO,
  UPDATE_USER_PROFILE,
} from "./redux/actionTypes";
import { deCryptFun, enCryptFun } from "./common/functions";
export default function Signin() {
  const [PasswordToggle, setPasswordToggle] = useState(true);
  const [loading, setLoading] = useState(false);

  let history = useHistory();
  const dispatch = useDispatch();

  const saveFormValues = async (values) => {
    setLoading(true);
    const config = {
      method: "POST",
      url: LOGIN_URL,
      data: // values,
      {webString: enCryptFun(
          JSON.stringify(values)
        ),
      flutterString: "" }
    };
    try {
      const response = await API(config);
      //const { status, data, invoiceCount } = response.data;
      let l = deCryptFun(response.data);
      const { status, data,invoiceCount } = JSON.parse(l);
      const { accesstoken } = response.headers;
      if (status === "Success") {
        localStorage.setItem("User_ID", data.userId);
        localStorage.setItem("AUTH_TOKEN", accesstoken);
        localStorage.setItem("Team_ID", data.teamId);
        localStorage.setItem("EMAIL", data.email);
        localStorage.setItem("SENDER_EMAIL", data.invoiceSenderEmail);
        localStorage.setItem("USER_ROLE", data.userRole);
        localStorage.setItem("PROFILE_PIC", data.profileLogo);
        localStorage.setItem("APROVALAMOUNT", data.approvalAmountTo);
        localStorage.setItem("INVOICE_COUNT", invoiceCount);
        localStorage.setItem("BRAND_LOGO", data.companyLogo);
        localStorage.setItem("AUTH_USER_DETAILS", JSON.stringify(data));
        localStorage.setItem(
          "LOGIN_NAME",
          data.firstName + " " + data.lastName
        );
        dispatch({
          type: UPDATE_USER_PROFILE,
          payload: data.profileLogo,
        });
        dispatch({
          type: UPDATE_COMPANY_LOGO,
          payload: data.companyLogo,
        });
        dispatch({
          type: UPDATE_APROVAL_AMOUNT,
          payload: data.approvalAmountTo,
        });
        if (data.isDefaultPassword == "1") {
          history.push(UPDATE_PASSWORD_ROUTE);
        } else {
          history.push(DASHBOARD_ROUTE);
          Swal.fire(getAlertToast("Success", "Login successful"));
        }
      } else {
        console.error("error");
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { accountExist, message, status } = data;
         if (error.response) {
        let { data } = error.response
        let p = deCryptFun(data);
         let  v = JSON.parse(p)
         if (v.accountExist !== 1) {
        Swal.fire(getAlertToast("Alert", v.message));
        history.push(SIGNUP_ROUTE);
      } else {
        Swal.fire(getAlertToast("Error", v.message));
      }
      }
      
      // if (accountExist !== 1) {
      //   Swal.fire(getAlertToast("Alert", message));
      //   history.push(SIGNUP_ROUTE);
      // } else {
      //   Swal.fire(getAlertToast("Error", message));
      // }
      //  else if (accountExist === 1) {
      //   Swal.fire(getAlertToast("Alert", message));
      // }
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
  });

  const { handleSubmit, handleChange, values, handleBlur, errors, touched } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
      },
      validationSchema,
      onSubmit: (values) => saveFormValues(values),
    });

  let Toogle = () => {
    setPasswordToggle(!PasswordToggle);
  };

  return (
    <div>
      <Container className="login-body-wrapper">
        <div className="login-wrapper d-flex align-items-center px-0">
          <Row className="w-100 mx-0">
            <Col md="4" className="mx-auto login-form">
              <div className="brand-logo">
                <img src={logo} />
              </div>
              <h4 className="mb-4">Sign in</h4>
              <Form form="true" onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="exampleEmail">Email</Label>
                  <Input
                    type="email"
                    onBlur={handleBlur}
                    name="email"
                    values={values.email}
                    invalid={errors.email && touched.email ? true : false}
                    onChange={handleChange}
                    id="exampleEmail"
                    placeholder="Enter Email"
                  />
                  <FormFeedback>
                    {errors.email && touched.email ? errors.email : ""}
                  </FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="exampleEmail">Password</Label>
                  <InputGroup>
                    <Input
                      type={PasswordToggle == true ? "password" : "text"}
                      onBlur={handleBlur}
                      name="password"
                      invalid={
                        errors.password && touched.password ? true : false
                      }
                      onChange={handleChange}
                      values={values.password}
                      placeholder="Enter Password"
                    />
                    <InputGroupAddon
                      onClick={() => Toogle()}
                      addonType="append"
                    >
                      <InputGroupText>
                        {PasswordToggle == true ? (
                          <AiFillEyeInvisible />
                        ) : (
                          <AiFillEye />
                        )}
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FormFeedback
                    style={{
                      display:
                        errors.password && touched.password ? "block" : "none",
                    }}
                  >
                    {errors.password && touched.password ? errors.password : ""}
                  </FormFeedback>
                </FormGroup>
                <Button
                  color="primary"
                  style={{
                    lineHeight: "2",
                    width: "fit-content",
                    margin: "auto",
                    display: "block",
                  }}
                  type="submit"
                  className="btn btn-primary mt-4"
                  disabled={loading ? true : false}
                >
                  {" "}
                  {loading && <Spinner color="light" />}SIGN IN{" "}
                </Button>
              </Form>
              <h5>
                Don't have an account?<Link to={SIGNUP_ROUTE}>Sign Up</Link>
              </h5>
              <h5>
                <Link to={FORGOT_PASSWORD_ROUTE}>Forgot password?</Link>
              </h5>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
