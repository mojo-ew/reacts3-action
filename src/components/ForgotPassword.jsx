import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { SIGNIN_ROUTE } from "../constants/RoutePaths";
import {
  Container,
  Row,
  FormFeedback,
  Spinner,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import logo from "../images/logo.png";
import { FORGET_PASSWORD } from "./common/url";
import Swal from "sweetalert2";
import { authHeader } from "./common/mainfunctions";
import API from "./redux/API";
import { useFormik } from "formik";
import * as Yup from "yup";
import { deCryptFun, enCryptFun } from "./common/functions";
export default function ForgotPassword() {
  const history = useHistory();
  const [loading, setloading] = useState(false);
  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
  });

  const { handleSubmit, handleChange, values, handleBlur, errors, touched } =
    useFormik({
      initialValues: {
        email: "",
      },
      validationSchema,
      onSubmit(values) {
        ForgetPassword(values);
      },
    });

  const ForgetPassword = async (values) => {
    setloading(true);
    const config = {
      method: "PUT",
      url: FORGET_PASSWORD,
      headers: authHeader(),
      // data: values,
   data: { webString: enCryptFun(
          JSON.stringify(values)
        ),
        flutterString: "",
}
    };
    try {
      const response = await API(config);
      //const { status } = response.data;
      let l = deCryptFun(response.data);
      const { status } = JSON.parse(l);
      if (status === "Success") {
        localStorage.setItem("EMAIL", values.email);
        Swal.fire(
          "Success",
          "Your new password has successfully been sent to your registered email address."
        );
        history.push(SIGNIN_ROUTE);
      } else {
        Swal.fire("error", "Invalid Data");
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(message);
       if (error.response) {
              let { data } = error.response;
              let decryptErr = deCryptFun(data);
              let parsedErr = JSON.parse(decryptErr);
              // console.log("error data new", parsedErr.message);
              Swal.fire("Error", parsedErr.message);
            }
    } finally {
      setloading(false);
    }
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
              <h4 class="mb-4">Forgot Password</h4>
              <Form form="true" onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="Email">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    invalid={errors.email && touched.email ? true : false}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    values={values.email}
                    id="Email"
                    placeholder="Enter your Email"
                  />
                  <FormFeedback>
                    {errors.email && touched.email ? errors.email : ""}
                  </FormFeedback>
                </FormGroup>
                <Button
                  style={{ lineHeight: "2" }}
                  className="btn btn-primary btn-block"
                  type="submit"
                >
                  {loading && <Spinner color="light" />}CREATE NEW PASSWORD
                </Button>
                {/* <Link style={{lineHeight:"2"}} className="btn btn-primary btn-block" to={UPDATE_PASSWORD_ROUTE} >CREATE NEW PASSWORD</Link> */}
                <Link
                  style={{ lineHeight: "2" }}
                  className="btn btn-outline-primary btn-block"
                  to={SIGNIN_ROUTE}
                >
                  BACK
                </Link>
              </Form>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
