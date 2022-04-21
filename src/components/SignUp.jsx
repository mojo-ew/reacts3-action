import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SIGNIN_ROUTE, SUCCESS_ROUTE } from "../constants/RoutePaths";
import { useHistory, useLocation } from "react-router";

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
} from "reactstrap";
import logo from "../images/logo.png";
import { useFormik } from "formik";
import * as Yup from "yup";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";

import "react-phone-number-input/style.css";

import PhoneInput, {
  isValidPhoneNumber,
  formatPhoneNumberIntl,
} from "react-phone-number-input";
import { CREATE_CUSTOMER, IS_NEW_USER_URL } from "./common/url";
import API from "./redux/API";
import Swal from "sweetalert2";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { authHeader, getAlert, getAlertToast } from "./common/mainfunctions";
import { last } from "underscore";
import { PASSWORD_REGEX } from "./common/constants";
import { useParams } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { deCryptFun, enCryptFun } from "./common/functions";

export default function SignUp(props) {
  let history = useHistory();
  let params = useParams();
  const location = useLocation();
  //console.log("location", location.search);
  let mail = "";
  mail = location.search.split("=");
  
  var initialValues = {
    firstName: "",
    lastName: "",
    email: mail[1] ? mail[1] : "",
    phoneNumber: "",
    password: "",
    confirmpassword: "",
    companyName: "",
    approvalAmountFrom: 0,
    approvalAmountTo: 0,
    planId: 1,
    userType: mail[1] ? "Supplier" : "",
  };
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState(true);
  const [PasswordToggle, setPasswordToggle] = useState(true);
  const [formValues, setFormValues] = useState(initialValues);
  const [code, setCode] = useState("");
  const [snum, setSnum] = useState();

  const NUMBER_REGEX = /^\d+$/;
  const isNewUser = async (mail) => {
  const userConfig = {
      method: "GET",
      url: IS_NEW_USER_URL,
      headers: authHeader(),
      params: {
       // email: mail,
        webString: enCryptFun(
          JSON.stringify({
            email: mail
          })
        ),
        flutterString: ""
      },
    };
    try {
      const response = await API(userConfig);
     // const { status, isNewUser = "" } = response.data;
      let l = deCryptFun(response.data);
      
      const { status, isNewUser = "" } = JSON.parse(l);
      if (status == "Success") {
        if (isNewUser == false && !isMobile) {
          history.push(SIGNIN_ROUTE);
        }
      }
     // console.log("res", response);
    } catch (error) {
     // console.error(error);
       if (error.response) {
        let { data } = error.response
       
       let p = deCryptFun(data);
       let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    }
  };
  useEffect(() => {
    if (mail[1]) {
      isNewUser(mail[1]);
    }
  }, []);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    // phoneNumber: Yup.string().matches(
    //   NUMBER_REGEX,
    //   "Phone number is not valid"
    // ),
    password: Yup.string()
      .required("Required")
      .matches(
        PASSWORD_REGEX,
        "Invalid Password, Must contain one lowercase and one uppercase"
      )
      .min("6", "Invalid Password,Password must be longer than 6 characters"),
    companyName: Yup.string().required("Required"),
    userType: Yup.string().required("Required"),
    confirmpassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Required"),
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
    initialValues: {
      ...formValues,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      SuccessRoute(values);
    },
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
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmpassword,
      companyName,
      approvalAmountFrom,
      approvalAmountTo,
      planId,
      userType,
    } = values;
    let l, coden, number;
    if (phoneNumber) {
      l = formatPhoneNumberIntl(phoneNumber);
      coden = l.split(" ")[0];
      setCode(coden);
      number = phoneNumber.split(coden)[1];
    }

    if (code && snum) {
      if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
        const config = {
          method: "POST",
          url: CREATE_CUSTOMER,
          headers: authHeader(),
          data: {
            // firstName: firstName.trim(),
            // lastName: lastName.trim(),
            // email,
            // phoneNumber: number,
            // password,
            // confirmpassword,
            // companyName,
            // approvalAmountFrom,
            // approvalAmountTo,
            // planId,
            // countryCode: code,
            // invoiceSenderEmail: email,
            // userType,
          webString:enCryptFun(
          JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email,
            phoneNumber: number,
            password,
            confirmpassword,
            companyName,
            approvalAmountFrom,
            approvalAmountTo,
            planId,
            countryCode: code,
            invoiceSenderEmail: email,
            userType,
          })
        ),
        flutterString: ""
          },
        };
        try {
          setLoading(true);
            
          const response = await API(config);
           
         // const { status, message } = response.data;
           let l = deCryptFun(response.data);
          
      const { status, message } = JSON.parse(l);
          if (status === "Success") {
            Swal.fire(
              getAlertToast("success", "Registration Completed Successfully")
            );
            mail = "";
            history.push(SUCCESS_ROUTE);
          } else {
            Swal.fire("Error", message);
          }
        } catch (error) {
          // let errorObj = Object.assign({}, error);
          // let { data } = errorObj.response;
          // errorFun(data.message);
       if (error.response) {
        let { data } = error.response
        let p = deCryptFun(data);
         let  v = JSON.parse(p)
        //console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
       // console.log("error 2", error.response)
          // Swal.fire("Error", data.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        Swal.fire(getAlert("error", "Please fill valid Phone number"));
      }
    } else {
      const config = {
        method: "POST",
        url: CREATE_CUSTOMER,
        headers: authHeader(),
        data: {
          // firstName: firstName.trim(),
          // lastName: lastName.trim(),
          // email,
          // phoneNumber: code ? number : "",
          // password,
          // confirmpassword,
          // companyName,
          // approvalAmountFrom,
          // approvalAmountTo,
          // planId,
          // countryCode: code ? code : "",
          // invoiceSenderEmail: email,
          // userType,
          webString:enCryptFun(
          JSON.stringify({
            firstName: firstName.trim(),
          lastName: lastName.trim(),
          email,
          phoneNumber: code ? number : "",
          password,
          confirmpassword,
          companyName,
          approvalAmountFrom,
          approvalAmountTo,
          planId,
          countryCode: code ? code : "",
          invoiceSenderEmail: email,
          userType,
          })
        ),
        flutterString: ""
        },
      };
      try {
        const response = await API(config);
       // const { status, message } = response.data;
         let l = deCryptFun(response.data);
      const { status, message } = JSON.parse(l);
        if (status === "Success") {
          Swal.fire(
            getAlertToast("success", "Registration Completed Successfully")
          );
          history.push(SUCCESS_ROUTE);
        } else {
          Swal.fire("Error", message);
        }
      } catch (error) {
        // let errorObj = Object.assign({}, error);
        // let { data } = errorObj.response;
        // errorFun(data.message);
         if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
        // Swal.fire("Error", data.message);
      } finally {
        setLoading(false);
      }
    }
  };
  // const phoneNumberChange = (value, e) => {
  //   const { dialCode } = e;
  //   setCode(dialCode);
  //   e.target = { name: "", value: "" };
  //   e.target.name = "phoneNumber";
  //   e.target.value = value;
  //   setValues({ ...values, [e.target.name]: e.target.value });
  // };
  const phoneNumberChange = (value) => {
    setValues({ ...values, phoneNumber: value });
    if (value) {
      const l = formatPhoneNumberIntl(value);
      const coden = l.split(" ")[0];
      setCode(coden);
      const number = value.split(code)[1];
      setSnum(number);
    }
  };
  let Toogle = () => {
    setPasswordToggle(!PasswordToggle);
  };
  return (
    <div>
      <Container className="login-body-wrapper">
        <div class="login-wrapper d-flex align-items-center px-0">
          <Row className="w-100 mx-0">
            <Col md="8" className="mx-auto login-form">
              <div className="brand-logo">
                <img src={logo} />
              </div>
              <h4 class="mb-4">Sign Up</h4>
              <Form form="true" onSubmit={handleSubmit}>
                <Row>
                  <Col md="6">
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
                      />
                      <FormFeedback>
                        {errors.firstName && touched.firstName
                          ? errors.firstName
                          : ""}
                      </FormFeedback>
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label for="lastName">Last Name</Label>
                      <Input
                        type="text"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        invalid={
                          errors.lastName && touched.lastName ? true : false
                        }
                        values={values.lastName}
                        name="lastName"
                        id="lastname"
                        placeholder="Enter Last Name"
                      />
                      <FormFeedback>
                        {errors.lastName && touched.lastName
                          ? errors.lastName
                          : ""}
                      </FormFeedback>
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label for="email">Email*</Label>
                      <Input
                        type="email"
                        name="email"
                        disabled={mail[1] ? true : false}
                        id="email"
                        placeholder="Enter Email"
                        invalid={errors.email && touched.email ? true : false}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                      />
                      <FormFeedback>
                        {errors.email && touched.email ? errors.email : ""}
                      </FormFeedback>
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label for="userType">Role*</Label>
                      <Input
                        type="select"
                        name="userType"
                        id="userType"
                        disabled={mail[1] ? true : false}
                        placeholder="Select Role"
                        invalid={
                          errors.userType && touched.userType ? true : false
                        }
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={mail[1] ? "Supplier" : values.userType}
                      >
                        <option value="">----Select Role----</option>
                        <option value="Supplier">Supplier / Vendor</option>
                        <option value="Customer">Subscriber</option>
                      </Input>
                      <FormFeedback>
                        {errors.userType && touched.userType
                          ? errors.userType
                          : ""}
                      </FormFeedback>
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label for="exampleEmail">Phone Number</Label>
                      <PhoneInput
                        name="phoneNumber"
                        defaultCountry="US"
                        placeholder="Enter phone number"
                        value={values.phoneNumber}
                        onChange={phoneNumberChange}
                        error={
                          values.phoneNumber
                            ? isValidPhoneNumber(values.phoneNumber)
                              ? "correct"
                              : "Invalid phone number"
                            : ""
                        }
                      />
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label for="">Company Name*</Label>
                      <Input
                        type="text"
                        name="companyName"
                        onBlur={handleBlur}
                        invalid={
                          errors.companyName && touched.companyName
                            ? true
                            : false
                        }
                        value={values.companyName}
                        onChange={handleChange}
                        id=""
                        placeholder="Enter Company Name"
                      />
                      <FormFeedback>
                        {errors.companyName && touched.companyName
                          ? errors.companyName
                          : ""}
                      </FormFeedback>
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label for="exampleEmail">Password*</Label>
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
                            errors.password && touched.password
                              ? "block"
                              : "none",
                        }}
                      >
                        {errors.password && touched.password
                          ? errors.password
                          : ""}
                      </FormFeedback>
                    </FormGroup>
                  </Col>

                  <Col md="6">
                    <FormGroup>
                      <Label for="exampleEmail">Confirm Password*</Label>
                      <InputGroup>
                        <Input
                          type={PasswordToggle == true ? "password" : "text"}
                          onBlur={handleBlur}
                          name="confirmpassword"
                          invalid={
                            errors.confirmpassword && touched.confirmpassword
                              ? true
                              : false
                          }
                          onChange={handleChange}
                          values={values.confirmpassword}
                          placeholder="Enter Confirm Password"
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
                            errors.confirmpassword && touched.confirmpassword
                              ? "block"
                              : "none",
                        }}
                      >
                        {errors.confirmpassword && touched.confirmpassword
                          ? errors.confirmpassword
                          : ""}
                      </FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
                <Button
                  style={{
                    lineHeight: "2",
                    width: "fit-content",
                    margin: "auto",
                    display: "block",
                  }}
                  type="submit"
                  className="btn btn-primary mt-4"
                >
                  {loading && <Spinner color="light" />}SIGN UP{" "}
                </Button>
              </Form>
              <div>
                <h5>
                  Already have an account?<Link to={SIGNIN_ROUTE}>Signin</Link>
                </h5>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
