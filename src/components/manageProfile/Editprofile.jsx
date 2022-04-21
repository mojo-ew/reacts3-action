import React, { useEffect, useState } from "react";
import {
  FormFeedback,
  Row,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  GET_USER_BY_ID,
  VERIFY_OTP,
  GENERATE_OTP,
  UPDATE_USER,
  UPLOAD_FILE,
} from "../common/url";
import { authHeader, getAlert } from "../common/mainfunctions";
import API from "../redux/API";
import Swal from "sweetalert2";
import { getAlertToast } from "../common/mainfunctions";
import defaultProfile from "../../images/placeholder-profile.jpg";
import { deCryptFun, enCryptFun, getUserId } from "../common/functions";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
import { UPDATE_USER_PROFILE } from "../redux/actionTypes";
import { useDispatch } from "react-redux";
import "react-phone-number-input/style.css";
import PhoneInput, {
  isValidPhoneNumber,
  formatPhoneNumberIntl,
} from "react-phone-number-input";
function Editprofile() {
  const [uplLoading, setUplLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const verifytoggle = () => {
    setVerifyModal(!verifyModal);
  };
  const [reCall, setreCall] = useState(0);
  const [confirmModal, setconfirmModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [code, setCode] = useState("");
  const dispatch = useDispatch();
  const phoneRegExp =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
  const [snum, setSnum] = useState();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    userId: getUserId(),
    profileLogo: "",
  });
  const validationSchema = Yup.object({
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required").nullable(),
    // phoneNumber: Yup.string().required("Required"),
    // .matches(phoneRegExp, "Invalid"),
  });

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    setValues,
    errors,
    touched,
  } = useFormik({
    enableReinitialize: true,
    initialValues: { ...profileData },
    validationSchema,
    onSubmit(values) {
      EditUser(values);
    },
  });

  let EditUser = async (values) => {
    let {
      userId,
      firstName,
      lastName,
      phoneNumber,
      profileLogo,
      approvalAmountFrom,
      approvalAmountTo,
      countryCode,
    } = values;
    // if (!phoneNumber) {
    //   Swal.fire(getAlert("error", "Phone number required"));
    // } else {
    if (phoneNumber) {
      if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
        const config = {
          method: "PUT",
          url: UPDATE_USER,
          data: {
            // userId,
            // firstName: firstName.trim(),
            // countryCode: code,
            // lastName: lastName.trim(),
            // phoneNumber: snum,
            // profileLogo,
            // approvalAmountFrom,
            // approvalAmountTo,
           webString: enCryptFun(
          JSON.stringify({
            userId,
            firstName: firstName.trim(),
            countryCode: code,
            lastName: lastName.trim(),
            phoneNumber: snum,
            profileLogo,
            approvalAmountFrom,
            approvalAmountTo,
          })
        ),
        flutterString: "",
          },
          headers: authHeader(),
        };
        try {
          setLoading(true);
          const response = await API(config);
          //const { status } = response.data;
          let l = deCryptFun(response.data);
      const { status} = JSON.parse(l);
          if (status === "Success") {
            dispatch({
              type: UPDATE_USER_PROFILE,
              payload: profileLogo,
            });
            localStorage.setItem("PROFILE_PIC", profileLogo);
            Swal.fire(getAlertToast("Success", "Updated Successfully"));
          }
        } catch (error) {
          // let errorObj = Object.assign({}, error);
          // let { data } = errorObj.response;
          // let { message } = data;
          // Swal.fire("Error", message);
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
      } else {
        Swal.fire(getAlert("error", "Please fill valid Phone number"));
      }
    } else {
      const config1 = {
        method: "PUT",
        url: UPDATE_USER,
        data: {
          // userId,
          // firstName: firstName.trim(),
          // countryCode: "",
          // lastName: lastName.trim(),
          // phoneNumber: "",
          // profileLogo,
          // approvalAmountFrom,
          // approvalAmountTo,
          webString:enCryptFun(
          JSON.stringify({
            userId,
          firstName: firstName.trim(),
          countryCode: "",
          lastName: lastName.trim(),
          phoneNumber: "",
          profileLogo,
          approvalAmountFrom,
          approvalAmountTo,
          })
        ),
        flutterString: "",
        },
        headers: authHeader(),
      };
      try {
        setLoading(true);
        const response = await API(config1);
      //  const { status } = response.data;
        let l = deCryptFun(response.data);
      const { status} = JSON.parse(l);
        if (status === "Success") {
          dispatch({
            type: UPDATE_USER_PROFILE,
            payload: profileLogo,
          });
          localStorage.setItem("PROFILE_PIC", profileLogo);
          Swal.fire(getAlertToast("Success", "Updated Successfully"));
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
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    GetUserById();
  }, [reCall]);

  const GetUserById = async () => {
    const config = {
      method: "GET",
      url: GET_USER_BY_ID,
      headers: authHeader(),
      params: {
       //userId: getUserId(),
        webString: enCryptFun(
          JSON.stringify({
            userId: getUserId(),
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      //const { status, data, message } = response.data;
      let l = deCryptFun(response.data);
      const { status, data, message} = JSON.parse(l);
      if (status === "Success") {
        setCode(data[0].countryCode);
        setSnum(data[0].phoneNumber);

        data[0].phoneNumber = data[0].countryCode + "" + data[0].phoneNumber;
        setProfileData(data[0]);
      } else {
        Swal.fire("Error", message);
      }
    } catch (error) {
     // Swal.fire("Error", error);
      if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    } finally {
      //  setLoading(false);
    }
  };
  const handleFileChange = async (e) => {
    let formdata = new FormData();
     if (!e.target.files[0].name.match(/.(jpg|jpeg|png)$/i))
     {Swal.fire("Alert !", "Please upload jpeg,jpg,png file format only.");
    }
    else
    {
    // console.log("filename",  e.target.files[0])
    formdata.append("file", e.target.files[0]);
    try {
      setUplLoading(true);
      const option = {
        method: "POST",
        url: UPLOAD_FILE,
        data: formdata,
        //  uploadFileString: enCryptFun(
        //   JSON.stringify({
        //      formdata
        //   })
        // ),
        headers: authHeader(),
        "content-type": "multipart/form-data",
      };
      let response = await API(option);
      const { status, filePath, message } = response.data;
      //  let l = deCryptFun(response.data);
      // const { status, filePath, message } = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", message));
        setProfileData({ ...values, profileLogo: filePath });
      }
    } catch (error) {
      //Swal.fire("error", "Error");
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    } finally {
      setUplLoading(false);
    }
  }
  };

  let OtpHandle = (e) => {
    setOtp(e.target.value);
  };
  const [pn, setpn] = useState();

  const phoneNumberChange = (value) => {
    setValues({ ...values, phoneNumber: value });
    if (value) {
      const l = formatPhoneNumberIntl(value);
      const coden = l.split(" ")[0];
      setCode(coden);
      const number = value.split(coden)[1];
      setSnum(number);
    }
  };
  const GetOtp = async (values) => {
    const { phoneNumber, countryCode } = values;
    const Number = phoneNumber.split(code)[1];
    const config = {
      method: "POST",
      url: GENERATE_OTP,
      headers: authHeader(),
      data: {
        // otpType: "Phone",
        // otpTo: Number,
        // countryCode: code,
         webString: enCryptFun(
          JSON.stringify({
              otpType: "Phone",
        otpTo: Number,
        countryCode: code,
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
        Swal.fire(getAlertToast("Success", "Otp Send Successfully"));
        setconfirmModal(true);
      } else {
        Swal.fire("Error", message);
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
      //  setLoading(false);
    }
  };

  const VerifyOtp = async (values) => {
    const { phoneNumber, countryCode } = values;
    const Number = phoneNumber.split(code)[1];
    const config = {
      method: "PUT",
      url: VERIFY_OTP,
      headers: authHeader(),
      data: {
        // otpType: "Phone",
        // otpValue: otp,
        // otpTo: Number,
        // countryCode: code,
         webString: enCryptFun(
          JSON.stringify({
            otpType: "Phone",
        otpValue: otp,
        otpTo: Number,
        countryCode: code,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      //const { status } = response.data;
       let l = deCryptFun(response.data);
      const { status} = JSON.parse(l);
      if (status === "Success") {
        setreCall(reCall + 1);
        setVerifyModal(false);
        Swal.fire(getAlertToast("Success", "Otp Verified Successfully"));
      }
    } catch (error) {
     // Swal.fire("Error", error);
      if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    } finally {
      //  setLoading(false);
    }
  };

  return (
    <div>
      <Form form="true" onSubmit={handleSubmit}>
        <Row className="mt-5">
          <Col sm="12">
            <div className="uploadPic">
              <img src={values.profileLogo || defaultProfile} />
              <div className="into">
                <h5>Edit profile picture</h5>
                {/* <span>PNG or JPG no bigger than 1000px wide and tall.</span> */}
                <span>PNG or JPG no larger than 1000px tall and wide</span>
              </div>
              <div className="upload-btn-pic">
                <button className="upload-btn ">
                  {uplLoading && <Spinner color="light" />}Choose Profile Picture
                </button>
                <input
                  type="file"
                  name="myfile"
                  onChange={handleFileChange}
                  accept="image/png, image/gif, image/jpeg"
                />
              </div>
            </div>
          </Col>
        </Row>
        <hr />

        <Row className="mt-5">
          <Col md="6">
            <FormGroup>
              <Label for="firstName">First Name</Label>
              <Input
                type="text"
                onChange={handleChange}
                placeholder="Enter First Name"
                value={values.firstName}
                invalid={errors.firstName && touched.firstName ? true : false}
                onBlur={handleBlur}
                name="firstName"
                id="firstName"
              />
              <FormFeedback>
                {errors.firstName && touched.firstName ? errors.firstName : ""}
              </FormFeedback>
            </FormGroup>
          </Col>

          <Col md="6">
            <FormGroup>
              <Label for="lastName">Last Name</Label>
              <Input
                type="text"
                onChange={handleChange}
                placeholder="Enter Last Name"
                onBlur={handleBlur}
                invalid={errors.lastName && touched.lastName ? true : false}
                value={values.lastName}
                name="lastName"
                id="lastName"
              />
              <FormFeedback>
                {errors.lastName && touched.lastName ? errors.lastName : ""}
              </FormFeedback>
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label for="email">Email</Label>
              <Input
                type="text"
                disabled="true"
                value={values.email}
                name="email"
                id="email"
              />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label for="phoneNumber">Phone Number</Label>
              <Row>
                <Col md="8">
                  <PhoneInput
                    name="phoneNumber"
                    placeholder="Enter phone number"
                    value={values.phoneNumber}
                    onChange={phoneNumberChange}
                    international="false"
                    error={
                      values.phoneNumber
                        ? isValidPhoneNumber(values.phoneNumber)
                          ? "correct"
                          : "Invalid phone number"
                        : "Phone number required"
                    }
                  />

                  {/* <PhoneInput
                    inputProps={{
                      name: "phoneNumber",
                      required: true,
                      autoFocus: true,
                    }}
                    isValid={
                      snum
                        ? (value, country) => {
                            if (
                              value.match(phoneRegExp)
                              //  &&
                              // snum &&
                              // snum.length === 10
                            ) {
                              return true;
                            } else {
                              return "invalid";
                            }
                          }
                        : true
                    }
                    country={"us"}
                    autoFormat="true"
                    disabled={values.isPhoneVerified == 1}
                    // name="phoneNumber"

                    id="phoneNumber"
                    onChange={phoneNumberChange}
                    value={values.phoneNumber}
                    invalid={
                      errors.phoneNumber && touched.phoneNumber ? true : false
                    }
                  />
                  <FormFeedback>
                    {errors.phoneNumber && touched.phoneNumber
                      ? errors.phoneNumber
                      : ""}
                  </FormFeedback> */}
                </Col>
                <Col md="4">
                  {values.isPhoneVerified == 0 ? (
                    <Button block onClick={verifytoggle} color="primary">
                      Verify
                    </Button>
                  ) : (
                    ""
                  )}
                </Col>
              </Row>
            </FormGroup>
          </Col>

          <Modal isOpen={verifyModal}>
            <ModalHeader>
              {confirmModal
                ? "Verify Your OTP"
                : "Do you want to verify Mobile Number ?"}
            </ModalHeader>
            <ModalBody>
              {confirmModal ? (
                <Input onChange={OtpHandle} placeholder="Enter OTP" />
              ) : (
                ""
              )}
            </ModalBody>
            <ModalFooter>
              {confirmModal ? (
                <Button color="primary" onClick={() => VerifyOtp(values)}>
                  Verify
                </Button>
              ) : (
                <Button color="primary" onClick={() => GetOtp(values)}>
                  Yes
                </Button>
              )}
              <Button color="primary" onClick={verifytoggle}>
                {" "}
                Cancel{" "}
              </Button>
            </ModalFooter>
          </Modal>

          <Col md="12">
            <Button
              type="submit"
              color="primary"
              className="mobBolckBtn"
              disabled={loading}
            >
              {loading && <Spinner color="light" />}Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default Editprofile;
