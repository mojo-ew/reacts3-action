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
  Table,
  Col,
  Row

} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CREATE_TEAM_USER, UPDATE_USER } from "./common/url";
import API from "./redux/API";
import Swal from "sweetalert2";
import { authHeader, getAlert, getAlertToast } from "./common/mainfunctions";
import { useDispatch } from "react-redux";
import { Fragment } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { deCryptFun, enCryptFun, getUserId } from "./common/functions";
import { PASSWORD_REGEX } from "./common/constants";
// import PhoneInput from "react-phone-input-2";
import { invalid } from "moment";
import "react-phone-number-input/style.css";

import PhoneInput, {
  isValidPhoneNumber,
  formatPhoneNumberIntl,
} from "react-phone-number-input";
import { UPDATE_APROVAL_AMOUNT } from "./redux/actionTypes";
const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

export default function Addmember(props) {
  const [loading, setloading] = useState(false);

  const {
    formValues,
    member,
    CloseToggle,
    successCallBack,
    flag,
    teamDetails,
    codeandNum,
    handlerRoles
  } = props;

  const [code, setCode] = useState();

  const { autoApproval = 1 } = teamDetails;
  const [PasswordToggle, setPasswordToggle] = useState(true);
  const [ConfirmPasswordToggle, setConfirmPasswordToggle] = useState(true);
  const [snum, setSnum] = useState();
  const [exceptionFlagValues, setExceptionFlagValues] = useState(["select Role", "Team Member", "Exception Handler"])
  const Role = exceptionFlagValues.map(Role => Role)
  const [exceptionFlag, setExceptionFlag] = useState("")
  const [exceptionTypes, setExceptionTypes] = useState([]);
  // const exceptionFlagValues = [
  //   {
  //     name: 'select Role',
  //     key: '0',
  //   },
  //   {
  //     name: 'Team Member',
  //     key: '1',
  //   },
  //   {
  //     name: 'Exception Handler',
  //     key: '2',
  //   }
  // ];
  const dispatch = useDispatch();
  let Add = async (values) => {
    const {
      firstName,
      userId,
      profileLogo,
      lastName,
      phoneNumber,
      approvalAmountFrom,
      approvalAmountTo,
      password,
      email,
      address,
      userRole,
      exceptionRoleIdList


    } = values;
    // const num = phoneNumber.split(code)[1];

    let l, coden, number;
    if (phoneNumber) {
      l = formatPhoneNumberIntl(phoneNumber);
      coden = l.split(" ")[0];
      setCode(coden);
      number = phoneNumber.split(coden)[1];
    }
    // if (!phoneNumber) {
    //   Swal.fire(getAlert("error", "Phone number required"));
    // } else {

    if (code && snum) {
      if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
        if (approvalAmountTo != -1 && approvalAmountTo <= autoApproval) {
          Swal.fire(
            getAlert(
              "error",
              "Maximum Range must be greater than" + autoApproval
            )
          );
        } else {
          setloading(true);
          const config = {
            method: flag ? "PUT" : "POST",
            url: flag ? UPDATE_USER : CREATE_TEAM_USER,

            // data: {
            //   firstName: firstName.trim(),
            //   userId,
            //   profileLogo,
            //   lastName: lastName.trim(),
            //   approvalAmountFrom,
            //   approvalAmountTo,
            //   password,
            //   countryCode: coden,
            //   phoneNumber: number,
            //   createdBy: getUserId(),
            //   email,
            //   address: address,
            // },

            data: {
              webString: enCryptFun(
                JSON.stringify({
                  firstName: firstName.trim(),
                  userId,
                  profileLogo,
                  lastName: lastName.trim(),
                  approvalAmountFrom,
                  approvalAmountTo,
                  password,
                  countryCode: coden,
                  phoneNumber: number,
                  createdBy: getUserId(),
                  email,
                  address: address,
                  userRole:exceptionFlag,
                exceptionRoleIdList:`${exceptionTypes}`

                })
              ),
              flutterString: "",
            },

            headers: authHeader(),
          };
          try {
            const response = await API(config);
            // const { status } = response.data;
            let l = deCryptFun(response.data);
            const { status } = JSON.parse(l);
            if (status === "Success") {
              Swal.fire(
                getAlertToast(
                  "Success",
                  flag
                    ? "Team member updated successfully"
                    : "Team member added successfully"
                )
              );
              dispatch({
                type: UPDATE_APROVAL_AMOUNT,
                payload: approvalAmountTo,
              });
              successCallBack();
              setloading(false);
            }
          } catch (error) {
            // let errorObj = Object.assign({}, error);
            // let { data } = errorObj.response;
            // Swal.fire("Error", data.message);
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
        }
      } else {
        Swal.fire(getAlert("error", "Please input a valid phone number"));
      }
      // }
    } else {
      if (approvalAmountTo != -1 && approvalAmountTo <= autoApproval) {
        Swal.fire(
          getAlert("error", "Maximum Range must be greater than" + autoApproval)
        );
      } else {
        setloading(true);
        const config = {
          method: flag ? "PUT" : "POST",
          url: flag ? UPDATE_USER : CREATE_TEAM_USER,
          // data: {
          //   firstName: firstName.trim(),
          //   userId,
          //   profileLogo,
          //   lastName: lastName.trim(),
          //   approvalAmountFrom,
          //   approvalAmountTo,
          //   password,
          //   countryCode: coden ? coden : "",
          //   phoneNumber: coden ? number : "",
          //   createdBy: getUserId(),
          //   email,
          //   address: address,
          // },
          data: {
            webString: enCryptFun(
              JSON.stringify({
                firstName: firstName.trim(),
                userId,
                profileLogo,
                lastName: lastName.trim(),
                approvalAmountFrom,
                approvalAmountTo,
                password,
                countryCode: coden ? coden : "",
                phoneNumber: coden ? number : "",
                createdBy: getUserId(),
                email,
                address: address,
                userRole:exceptionFlag,
                exceptionRoleIdList:`${exceptionTypes}`                                                                           
                
              })
            ),
            flutterString: "",
          },
          

          headers: authHeader(),
        };
        try {
          const response = await API(config);
          // const { status } = response.data;
          let l = deCryptFun(response.data);
          const { status } = JSON.parse(l);
          if (status === "Success") {
            Swal.fire(
              getAlertToast(
                "Success",
                flag
                  ? "Team member updated successfully"
                  : "Team member added successfully"
              )
            );
            dispatch({
              type: UPDATE_APROVAL_AMOUNT,
              payload: approvalAmountTo,
            });
            successCallBack();
            setloading(false);
          }
        } catch (error) {
          // let errorObj = Object.assign({}, error);
          // let { data } = errorObj.response;
          // Swal.fire("Error", data.message);
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
      }
    }
  };

  const validationSchema = () =>
 
    Yup.object().shape(
      {
        firstName: Yup.string()
          .min(2, "Too Short!")
          .max(50, "Too Long!")
          .required("Required"),
        lastName: Yup.string()
          .min(2, "Too Short!")
          .max(50, "Too Long!")
          .required("Required"),

        email: Yup.string().email("Invalid email").required("Required"),
       

        // address: Yup.string().required("Address Required"),
        password: Yup.string().when([], {
          is: () => !flag,
          then: Yup.string()
            .required("Required")
            .matches(
              PASSWORD_REGEX,
              "Invalid Password !,Must contain one lowercase and one uppercase"
            )
            .min(
              "6",
              "Invalid Password !,Password must be longer than 6 characters"
            ),
          otherwise: Yup.string().notRequired(),
        }),
        confirmpassword: Yup.string()
          .oneOf([Yup.ref("password"), null], "Passwords must match")
          .when([], {
            is: () => !flag,
            then: Yup.string().required("Required"),
            otherwise: Yup.string().notRequired(),
          }),
        approvalAmountTo: Yup.string().required("Required"),

        // .required("Required")
        // .positive()
        // .integer()

        // .when("approvalAmountTo", (approvalAmountTo, value) => {
        //   if (value !== -1)
        //     return Yup.number()
        //       .required("Required")
        //       .min(autoApproval, "Minimum amount is " + autoApproval);
        // }),
        // is: (approvalAmountTo) => {
        // function (value) {
        //   console.error("apam", value);
        // return approvalAmountTo == -1;
        // },
        // then: Yup.number().required("Required"),
        // otherwise: Yup.number()
        //   .required("Required")
        //   .min(autoApproval, "Minimum amount is " + autoApproval),
        // }),
      },
      [["approvalAmountTo", "autoApproval"]]
    );

  const {
    handleSubmit,
    handleChange,
    values,
    handleBlur,
    setValues,
    errors,
    touched,
  } = useFormik({
    initialValues: { ...formValues, phoneNumber: codeandNum },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => Add(values),
    //onSubmit:(values)=>testValues(values)
  });



  let Toggle = () => {
    setPasswordToggle(!PasswordToggle);
  };
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



  const exceptionHandleChange = (e) => {
    // setExceptionFlag(exceptionFlagValues[e.target.value])
    // console.log('values flag',exceptionFlagValues)
    // console.log('flag',exceptionFlag);
    console.log(e.target.value)
  }

  const handleExceptionTypes = (event, id) => {
    if (event.target.checked === true) {

    setExceptionTypes(
        [...exceptionTypes,
        id]
      );
      console.log("checkedItems: ", exceptionTypes);
    }
    else{
      // console.log(exceptionTypes.filter((el)=>{
      //   return(
      //   el!=id)
      // }))
      setExceptionTypes(exceptionTypes.filter((el)=>{
        return(
        el!=id
        )
      }))
    }

    //console.log(id)

  }

  let ConfirmToggle = () => {
    setConfirmPasswordToggle(!ConfirmPasswordToggle);
  };
  return (
    <Modal isOpen={member} toggle={CloseToggle}>
      <ModalHeader>{flag ? "Update Member" : "Add Member"}</ModalHeader>
      <ModalBody>
        <Form form="true" onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="firstName">First Name</Label>
            <Input
              type="text"
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              invalid={errors.firstName && touched.firstName ? true : false}
              onBlur={handleBlur}
              placeholder="Enter First Name"
            />
            <FormFeedback>
              {errors.firstName && touched.firstName ? errors.firstName : ""}{" "}
            </FormFeedback>
          </FormGroup>

          <FormGroup>
            <Label for="lastName">Last Name</Label>
            <Input
              type="text"
              invalid={errors.lastName && touched.lastName ? true : false}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.lastName}
              name="lastName"
              id="lastName"
              placeholder="Enter Last Name"
            />
            <FormFeedback>
              {errors.lastName && touched.lastName ? errors.lastName : ""}{" "}
            </FormFeedback>
          </FormGroup>

          <FormGroup>
            <Label for="approvalAmountTo">Maximum Range ($)</Label>
            <Input
              type="number"
              // min={1}
              max={99999999}
              step=".01"
              invalid={
                errors.approvalAmountTo && touched.approvalAmountTo
                  ? true
                  : false
              }
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.approvalAmountTo}
              name="approvalAmountTo"
              id="approvalAmountTo"
              placeholder="Maximum Range"
            />
            <FormFeedback>
              {errors.approvalAmountTo && touched.approvalAmountTo
                ? errors.approvalAmountTo
                : ""}{" "}
            </FormFeedback>
          </FormGroup>

          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              type="email"
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={errors.email && touched.email ? true : false}
              value={values.email}
              name="email"
              id=""
              placeholder="Enter Email"
              disabled={flag}
            />
            <FormFeedback>
              {errors.email && touched.email ? errors.email : ""}
            </FormFeedback>
          </FormGroup>

          <FormGroup>
            <Label for="phoneNumber">Phone Number</Label>
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
          <FormGroup>
            <Label for="address">Address</Label>
            <Input
              type="text"
              invalid={errors.address && touched.address ? true : false}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.address}
              name="address"
              id="address"
              placeholder="Enter Address"
            />
            <FormFeedback>
              {errors.address && touched.address ? errors.address : ""}{" "}
            </FormFeedback>
          </FormGroup>
          {!flag && (
            <Fragment>
              <FormGroup>
                <Label for="Password">Password</Label>
                <InputGroup>
                  <Input
                    type={PasswordToggle == true ? "password" : "text"}
                    onBlur={handleBlur}
                    name="password"
                    invalid={errors.password && touched.password ? true : false}
                    onChange={handleChange}
                    value={values.password}
                    placeholder="Enter Password"
                  />
                  <InputGroupAddon onClick={() => Toggle()} addonType="append">
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

              <FormGroup>
                <Label for="confirmpassword">Confirm Password</Label>
                <InputGroup>
                  <Input
                    type={ConfirmPasswordToggle == true ? "password" : "text"}
                    onBlur={handleBlur}
                    name="confirmpassword"
                    invalid={
                      errors.confirmpassword && touched.confirmpassword
                        ? true
                        : false
                    }
                    onChange={handleChange}
                    value={values.confirmpassword}
                    placeholder="Enter Confirm Password"
                  />
                  <InputGroupAddon
                    onClick={() => ConfirmToggle()}
                    addonType="append"
                  >
                    <InputGroupText>
                      {ConfirmPasswordToggle == true ? (
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


              <FormGroup>
              <Label for="role">Select Role</Label>
                <Input 
                type="select"
                name="userRole"
                id="userRole"
                onChange={(e)=>setExceptionFlag(e.target.value)}>
               
                 {
                Role.map((address, key) => <option key={key} value={address}>{address} 
                   </option>)
            }
                </Input>
                
              </FormGroup>


              {exceptionFlag == 'Exception Handler' ?
                <FormGroup>
                  <div>
                    

                    <Label for="exptypes">Select Exception </Label> <br></br>
                    <div style={{ marginLeft: '10%' }}>



                      {handlerRoles.map(item => (
                        <>
                          <Input type='checkbox' key={item.exceptionRoleId} name={item.exceptionRole} 
                            // checked={exceptionTypes[item.key]} 
                            onChange={(e) => handleExceptionTypes(e, item.exceptionRoleId)}
                          />
                          <Label >
                            {item.exceptionRole}</Label>
                          <br />

                        </>

                      ))}

                    </div>



                  </div>
                </FormGroup> : ''}
            </Fragment>
          )}
          <ModalFooter>
            <Button color="danger" onClick={CloseToggle}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              {flag ? "Update" : "ADD"}
              {loading && <Spinner color="light" />}
            </Button>
          </ModalFooter>
        </Form>
      </ModalBody>
    </Modal>
  );
}
