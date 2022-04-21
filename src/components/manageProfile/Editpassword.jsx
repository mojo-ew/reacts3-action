import React, { useState } from "react";
import {
  FormFeedback,
  InputGroupText,
  InputGroup,
  Button,
  InputGroupAddon,
  FormText,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Spinner,
} from "reactstrap";
import { useFormik } from "formik";
import { UPDATE_PASSWORD } from "../common/url";
import { authHeader } from "../common/mainfunctions";
import API from "../redux/API";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { deCryptFun, enCryptFun, getEmail } from "../common/functions";
import { useHistory } from "react-router";
import { getAlertToast } from "../common/mainfunctions";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { PASSWORD_REGEX } from "../common/constants";
import { SIGNIN_ROUTE } from "../../constants/RoutePaths";
const initialValues = {
  oldPassword: "",
  newPassword: "",
  confirmnewPassword: "",
};
function Editpassword() {
  let history = useHistory();
  const [formData, setFormData] = useState(initialValues);
  const [NewPasswordToggle, setNewPasswordToggle] = useState(false);
  const [ConfirmPasswordToggle, setConfirmPasswordToggle] = useState(false);
  const [OldPasswordToggle, setOldPasswordToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Required"),
    newPassword: Yup.string()
      .test(
        "passwords-match",
        "Password should not be old password",
        function (value) {
          return this.parent.oldPassword !== value;
        }
      )

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

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    resetForm,
    errors,
    touched,
  } = useFormik({
    initialValues: formData,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => UpdatePassword(values),
  });

  let UpdatePassword = async (values) => {
    values.email = getEmail();
    const config = {
      method: "PUT",
      url: UPDATE_PASSWORD,
      headers: authHeader(),
     data: //values, 
     { webString: enCryptFun(
          JSON.stringify(values)
        ),
      flutterString: "",
      }
    };
    try {
      setLoading(true);
      const response = await API(config);
     // const { status } = response.data;
       let l = deCryptFun(response.data);
      const { status} = JSON.parse(l);
      if (status === "Success") {
        resetForm({});
        Swal.fire(getAlertToast("Success", "Update Successfully"));
        // localStorage.clear();
        // history.push(SIGNIN_ROUTE);
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
      setLoading(false);
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
  // let CleanForm=()=>
  // {
  //   console.log("work");
  //   setFormData(initialValues)
  //   console.log(formData,"data");
  // }

  return (
    <Row className="mt-5">
      <Col md="6">
        <Form form="true" onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="exampleEmail">Change your password</Label>
            <FormText color="muted">
              {/* We will email you a confirmation when changing your password, so
              please expect that email after submitting. */}
              An email will be sent to your account's registered email address.
            </FormText>
          </FormGroup>

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
                id="oldPassword"
              />
              <InputGroupAddon onClick={() => OldToogle()} addonType="append">
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
                id="newPassword"
              />
              <InputGroupAddon onClick={() => NewToogle()} addonType="append">
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
                id="confirmnewPassword"
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
          <Button color="primary" id="2" type="submit" block disabled={loading}>
            {loading && <Spinner color="light" />}Save Changes
          </Button>
        </Form>
      </Col>
    </Row>
  );
}

export default Editpassword;
