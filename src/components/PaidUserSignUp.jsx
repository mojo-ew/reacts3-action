import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  SIGNIN_ROUTE,
  SIGNUP_ROUTE,
  SUCCESS_ROUTE,
  UPDATE_PASSWORD_ROUTE,
} from "../constants/RoutePaths";
import {
  Container,
  Spinner,
  Row,
  FormFeedback,
  CustomInput,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Card,
  UncontrolledTooltip,
} from "reactstrap";
import logo from "../images/logo.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  CREATE_CUSTOMER,
  CREATE_PREMIUM_CUSTOMER,
  LOGIN_URL,
  USER_SIGN_OUT_URL,
} from "./common/url";
import API from "./redux/API";
import Swal from "sweetalert2";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { authHeader, getAlert, getAlertToast } from "./common/mainfunctions";
import { last } from "underscore";
import { EMAIL_REGEX, PASSWORD_REGEX } from "./common/constants";
import moment from "moment";
import {
  UPDATE_APROVAL_AMOUNT,
  UPDATE_COMPANY_LOGO,
  UPDATE_USER_PROFILE,
} from "./redux/actionTypes";
import { useDispatch } from "react-redux";
import { deCryptFun, enCryptFun, getUserId } from "./common/functions";
import { Fragment } from "react";

var initialValues = {
  firstName: "",
  ezcloudemail: "",
  personalemail: "",
  expiryDate: "",
};
export default function PaidUserSignUp() {
  let history = useHistory();
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState(true);
  const [PasswordToggle, setPasswordToggle] = useState(true);
  const [formValues, setFormValues] = useState(initialValues);
  const [formValues1, setFormValues1] = useState({
    email: "",
    password: "",
  });
  const [code, setCode] = useState("");
  const [signupFlag, setSignupFlag] = useState(false);
  const [token, setToken] = useState({ Authorization: null });
  const [userId, setId] = useState();
  const NUMBER_REGEX = /^\d+$/;
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("Required"),
    ezcloudemail: Yup.string()
      .matches(EMAIL_REGEX, "Invalid email")
      .required("Required"),
    personalemail: Yup.string().email("Invalid email").required("Required"),
    expiryDate: Yup.string().required("Required"),
  });
  const validationSchema1 = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
  });
  const {
    handleSubmit,
    setValues,
    handleChange,
    handleBlur,
    values,
    errors,
    touched,
  } = useFormik({
    initialValues:
      signupFlag === true
        ? {
            ...formValues,
          }
        : {
            ...formValues1,
          },
    enableReinitialize: true,

    validationSchema:
      signupFlag === true ? validationSchema : validationSchema1,
    enableReinitialize: true,
    onSubmit:
      signupFlag === true
        ? (values) => {
            SuccessRoute(values);
          }
        : (values) => saveFormValues(values),
  });
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
  let SuccessRoute = async (values) => {
    setLoading(true);
    const { firstName, ezcloudemail, personalemail, expiryDate } = values;

    const config = {
      method: "POST",
      url: CREATE_PREMIUM_CUSTOMER,
      headers: token,
      data: {
        // firstName: firstName.trim(),
        // invoiceSenderEmail: ezcloudemail,
        // email: personalemail,
        // expiryDate: expiryDate,
        // createdBy: userId,
       webString : enCryptFun(
          JSON.stringify({
            firstName: firstName.trim(),
        invoiceSenderEmail: ezcloudemail,
        email: personalemail,
        expiryDate: expiryDate,
        createdBy: userId,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      //const { status, message } = response.data;
       let l = deCryptFun(response.data);
      const {  status, message  } = JSON.parse(l);
      if (status === "Success") {
        localStorage.setItem("AUTH_TOKEN", "");

        Swal.fire(
          getAlertToast("success", "Registration Completed Successfully")
        );
        history.push(SUCCESS_ROUTE, { flag: true });
      } else {
        Swal.fire("Error", message);
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // errorFun(data.message);
 if (error.response) {
              let { data } = error.response;
              let decryptErr = deCryptFun(data);
              let parsedErr = JSON.parse(decryptErr);
              // console.log("error data new", parsedErr.message);
              Swal.fire("Error", parsedErr.message);
            }
      // Swal.fire("Error", data.message);
    } finally {
      setLoading(false);
    }
  };

  let Toogle = () => {
    setPasswordToggle(!PasswordToggle);
  };
  //login
  const [PasswordToggle1, setPasswordToggle1] = useState(true);
  const [loginLoading, setloginLoading] = useState(false);
  const dispatch = useDispatch();

  const saveFormValues = async (values) => {
    setloginLoading(true);
    const config1 = {
      method: "POST",
      url: LOGIN_URL,
     // data: values,
     data: {  webString: enCryptFun(
          JSON.stringify(
            values
         )
        ),
      flutterString: "" }
    };
    try {
      const response1 = await API(config1);
     // const { status, data, invoiceCount } = response1.data;
       let l = deCryptFun(response1.data);
      const { status, data, invoiceCount } = JSON.parse(l);
     const { accesstoken } = response1.headers;
      // let p = deCryptFun(response1.headers);
      //   const { accesstoken } =  JSON.parse(p);
      if (status === "Success") {
        setToken({ Authorization: accesstoken });
        setId(data.userId);

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
          if (data.userRole === "Super Admin") {
            Swal.fire(
              getAlert(
                "Success",
                "Access verified successfully. Please go ahead and do the paid signup for our customer."
              )
            );
            setSignupFlag(true);
            // Swal.fire(getAlertToast("Success", "Login Successfully"));
          } else {
            Swal.fire(getAlert("error", "Un Authorized"));
          }
        }
      } else {
        console.error("error");
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { accountExist, message } = data;
       if (error.response) {
              let { data } = error.response;
              let decryptErr = deCryptFun(data);
              let parsedErr = JSON.parse(decryptErr);
              if (parsedErr.accountExist !== 1) {
        Swal.fire(getAlertToast("Alert",parsedErr.message));
        history.push(SIGNUP_ROUTE);
      } else {
        Swal.fire(getAlertToast("Error", "Invalid Credentials!"));
      }
            }
      // if (accountExist !== 1) {
      //   Swal.fire(getAlertToast("Alert", message));
      //   history.push(SIGNUP_ROUTE);
      // } else {
      //   Swal.fire(getAlertToast("Error", "Invalid Credentials!"));
      // }
    } finally {
      setloginLoading(false);
    }
  };

  let Toogle1 = () => {
    setPasswordToggle1(!PasswordToggle1);
  };
  const [logoutFlag, setLogoutFlag] = useState(false);
  const logOutFun = async () => {
    const config = {
      method: "PUT",
      url: USER_SIGN_OUT_URL,
      headers: token,
      data: { // userId: userId ,
      webString: enCryptFun(
          JSON.stringify({
           userId: userId ,
        
          })
        ),
        flutterString: ""
      },
    };
    try {
      const response = await API(config);
      //const { status } = response.data;
        let l = deCryptFun(response.data);
      const {  status } = JSON.parse(l);
      if (status == "Success") {
        setLogoutFlag(true);

        Swal.fire(getAlertToast("success", "logout successful’ "));
        localStorage.clear();
        // history.push(SIGNIN_ROUTE);
        setFormValues1({
          email: "",
          password: "",
        });
        setSignupFlag(false);
      }
    } catch (error) {
      
      console.error(error);
    }
  };
  let Logout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to signout",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        logOutFun();
      }
    });
  };
  const signInFun = () => {
    localStorage.clear();
    history.push(SIGNIN_ROUTE);
  };
  return (
    <div>
      <Container className="paid-container">
        <div className="w-100">
          <div className="paid-logo">
            <img src={logo} />
          </div>

          <Row className="w-100 mx-0">
            <Col md="6" className="mx-auto login-form">
              <h4 class="mb-4">Sign Up</h4>
              <Form form="true" onSubmit={handleSubmit}>
                {/* <Row> */}
                {/* <Col md="6"> */}
                <FormGroup>
                  <Label for="firstName">First Name*</Label>
                  <Input
                    type="text"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    invalid={
                      errors.firstName && touched.firstName ? true : false
                    }
                    value={values.firstName}
                    name="firstName"
                    id="firstname"
                    placeholder="Enter First Name"
                    disabled={signupFlag === true ? false : true}
                  />
                  <FormFeedback>
                    {errors.firstName && touched.firstName
                      ? errors.firstName
                      : ""}
                  </FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="email">Ezcloud Email*</Label>
                  <Input
                    type="email"
                    name="ezcloudemail"
                    id="ezcloudemail"
                    placeholder="Enter Email"
                    invalid={
                      errors.ezcloudemail && touched.ezcloudemail ? true : false
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.ezcloudemail}
                    disabled={signupFlag === true ? false : true}
                  />
                  <FormFeedback>
                    {errors.ezcloudemail && touched.ezcloudemail
                      ? errors.ezcloudemail
                      : ""}
                  </FormFeedback>
                </FormGroup>

                <FormGroup>
                  <Label for="email">Alternate Email*</Label>
                  <Input
                    type="email"
                    name="personalemail"
                    id="personalemail"
                    placeholder="Enter Email"
                    invalid={
                      errors.personalemail && touched.personalemail
                        ? true
                        : false
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.personalemail}
                    disabled={signupFlag === true ? false : true}
                  />
                  <FormFeedback>
                    {errors.personalemail && touched.personalemail
                      ? errors.personalemail
                      : ""}
                  </FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="expiryDate">Subscription Expiry Date*</Label>

                  <Input
                    type="date"
                    name="expiryDate"
                    min={moment().format("YYYY-MM-DD")}
                    // value={moment(values.expiryDate).format("YYYY-MM-DD")}
                    value={values.expiryDate}
                    onChange={handleChange}
                    invalid={
                      touched.expiryDate && errors.expiryDate ? true : false
                    }
                    placeholder="Enter Expiry Date for subscription"
                    disabled={signupFlag === true ? false : true}
                  />
                  <FormFeedback>
                    {touched.expiryDate && errors.expiryDate
                      ? errors.expiryDate
                      : ""}{" "}
                  </FormFeedback>
                </FormGroup>

                <Button
                  style={{
                    lineHeight: "2",
                    width: "fit-content",
                    margin: "auto",
                    display: "block",
                  }}
                  type="submit"
                  className="btn btn-primary mt-4"
                  disabled={signupFlag === true ? false : true}
                >
                  {loading && <Spinner color="light" />}SIGN UP{" "}
                </Button>
              </Form>
              <div>
                <h5>
                  Already have an account?
                  <Link
                    // to={SIGNIN_ROUTE}
                    onClick={signInFun}
                  >
                    Signin
                  </Link>
                </h5>
              </div>
            </Col>
            <Col xl="6">
              <h4 className="mb-4">EZ Cloud Staff</h4>
              <Form form="true" onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="exampleEmail">Email</Label>
                  <Input
                    type="email"
                    onBlur={handleBlur}
                    name="email"
                    value={values.email}
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
                      type={PasswordToggle1 == true ? "password" : "text"}
                      onBlur={handleBlur}
                      name="password"
                      invalid={
                        errors.password && touched.password ? true : false
                      }
                      onChange={handleChange}
                      value={values.password}
                      placeholder="Enter Password"
                    />
                    <InputGroupAddon
                      onClick={() => Toogle1()}
                      addonType="append"
                    >
                      <InputGroupText>
                        {PasswordToggle1 == true ? (
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
                  disabled={loginLoading || signupFlag === true ? true : false}
                >
                  {" "}
                  {loginLoading && <Spinner color="light" />}SIGN IN{" "}
                </Button>
                {signupFlag === true ? (
                  <Fragment>
                    <Button
                      onClick={() => Logout()}
                      color="link"
                      id="logoutTooltip"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15.656"
                        height="15.656"
                        viewBox="0 0 15.656 15.656"
                      >
                        <g
                          id="Icon_feather-log-out"
                          data-name="Icon feather-log-out"
                          transform="translate(-3.65 -3.65)"
                        >
                          <path
                            id="Path_303"
                            data-name="Path 303"
                            d="M9.152,18.456h-3.1A1.551,1.551,0,0,1,4.5,16.905V6.051A1.551,1.551,0,0,1,6.051,4.5h3.1"
                            fill="none"
                            stroke="#868686"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                          />
                          <path
                            id="Path_304"
                            data-name="Path 304"
                            d="M24,18.253l3.877-3.877L24,10.5"
                            transform="translate(-9.421 -2.899)"
                            fill="none"
                            stroke="#868686"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                          />
                          <path
                            id="Path_305"
                            data-name="Path 305"
                            d="M22.8,18H13.5"
                            transform="translate(-4.348 -6.522)"
                            fill="none"
                            stroke="#868686"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                          />
                        </g>
                      </svg>
                    </Button>

                    <UncontrolledTooltip
                      placement="right"
                      target="logoutTooltip"
                    >
                      Logout
                    </UncontrolledTooltip>
                  </Fragment>
                ) : (
                  ""
                )}
              </Form>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
