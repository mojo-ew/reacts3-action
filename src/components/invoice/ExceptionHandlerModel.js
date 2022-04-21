import React, { useState, useEffect } from 'react'
import {
    Button,
    Form,
    FormGroup,
    FormFeedback,
    Label,
    Input,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter


} from "reactstrap";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    GET_EXCEPTION_HANDLER_ROLE_URL,
    GET_EXCEPTION_HANDLER_DETAILS,
    SAVE_INVOICE_EXCEPTION,
    UPDATE_INVOICE_STATUS,
    BASE_API_URL




} from '../common/url';
import {
    INVOICE_DETAILS_NEW_ROUTE,
    INVOICE_ROUTE

} from "../../constants/RoutePaths";
import {
    Name,
    getTeamID,
    getUserId,
    stableSort,
    enCryptFun,
    deCryptFun,
    getEmail,
} from "../common/functions";
import API from "../redux/API";
import Swal from "sweetalert2";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import { useHistory } from "react-router-dom";



function ExceptionHandlerModel(props) {
    const {
        exceptionFlagOn,
        exceptionaFlagOff,
        invoiceId,
        screenDisable

    } = props
    const history = useHistory();
    const urlOfInvoice = BASE_API_URL + INVOICE_DETAILS_NEW_ROUTE + "/" + invoiceId
    const [handlerRoles, setHandlerRoles] = useState([])
    const [handlerUserList, setHandlerUserList] = useState([])

    const validationSchema =
        Yup.object(
            {
                handlerType: Yup.string().required('required'),
                comments: Yup.string().required('required')
            })
    const animatedComponents = makeAnimated();
    const { errors, touched, handleSubmit, values, handleChange, setFieldValue, handleBlur, setValues } =
        useFormik({
            initialValues: {
                "handlerType": "",
                "comments": ""
            },
            //validationSchema,
            onSubmit: (values) => postToHandler(values)

        })

    const {
        handlerType = '',
        handlerUsers = '',
        comments = ''
    } = values



    //API CALL
    const getExceptionHandlerRoles = async () => {
        const config = {
            method: "GET",
            url: GET_EXCEPTION_HANDLER_ROLE_URL,
            Headers: authHeader(),
            params: {
                webString: enCryptFun(
                    JSON.stringify({
                        "role": "role"
                    })
                ),
                flutterString: "",
            },
        }
        try {
            const response = await API(config)
            let response_decrypt = deCryptFun(response.data);
            const { data, status } = JSON.parse(response_decrypt);
            if (status == "Success") {
                setHandlerRoles(data)
            }

        } catch (error) {
            if (error.response) {
                let { data } = error.response
                let p = deCryptFun(data);
                let v = JSON.parse(p)
                Swal.fire(getAlert("Error", v.message));

            }

        }
    }
    const getExceptionHandlerDetails = async (selectedhandlerType) => {
        const config = {
            method: "GET",
            url: GET_EXCEPTION_HANDLER_DETAILS,
            Headers: authHeader(),
            params: {
                webString: enCryptFun(
                    JSON.stringify({
                        "teamId": getTeamID(),
                        "exceptionRoleId": selectedhandlerType
                    })
                ),
                flutterString: "",
            },
        }
        try {
            const response = await API(config)
            let response_decrypt = deCryptFun(response.data);
            const { data, status } = JSON.parse(response_decrypt);
            if (status == "Success") {
                setHandlerUserList(data.map((listOfusers, i) => {
                    const {
                        exceptionDetailId,
                        userName,
                        userId
                    } = listOfusers
                    let list = { value: userId, label: userName }
                    return list;
                }))
            }

        } catch (error) {

        }
    }

    const saveExceptionInvoice = async () => {
        const config = {
            method: "POST",
            url: SAVE_INVOICE_EXCEPTION,
            Headers: authHeader(),
            data: {
                webString: enCryptFun(
                    JSON.stringify({
                        "invoiceId": invoiceId,
                        "teamId": getTeamID(),
                        "userId": handlerUsers,
                        "raisedBy": getUserId(),
                        "comments": comments,
                        "exceptionRoleId": handlerType,
                        "hyperLink": urlOfInvoice
                    })
                ),
                flutterString: "",
            },
        }

        try {
            let response = await API(config)
            let response_decrypt = deCryptFun(response.data);
            const { data, status } = JSON.parse(response_decrypt);
            if (status == "Success") {
                updateInvoiceStatus();
                exceptionaFlagOff()
                screenDisable(true)
                Swal.fire(getAlertToast("Success", "Exception Raised"));


            }

        } catch (error) {
            // let { data } = error.response;
            // let decryptErr = deCryptFun(data);
            // let parsedErr = JSON.parse(decryptErr);
            // Swal.fire("Error", parsedErr.message);



        }

    }


    const updateInvoiceStatus = async () => {
        const config = {
            method: "PUT",
            url: UPDATE_INVOICE_STATUS,
            headers: authHeader(),
            data: {
                webString: enCryptFun(
                    JSON.stringify({
                        userId: getUserId(),
                        invoiceId: invoiceId,
                        status: getExceptionRole(),
                    })
                ),
                flutterString: "",
            },
        };
        try {
            const response = await API(config);
            //const { status } = response.data;
            let l = deCryptFun(response.data);
            const { status } = JSON.parse(l);
            if (status === "Success") {
                //Swal.fire(getAlertToast("Success", "Approved Successfully"));
                history.push(INVOICE_ROUTE);

            }
        } catch (error) {

            if (error.response) {
                let { data } = error.response
                let p = deCryptFun(data);
                let v = JSON.parse(p)
                // console.log("error data new",  v.message)
                Swal.fire(getAlert("Error", v.message));
            }
        }
    }


    useEffect(() => {
        getExceptionHandlerRoles();

    }, [])

    useEffect(() => {
        if (handlerType) {
            getExceptionHandlerDetails(handlerType)

        }
    }, [handlerType])

    const postToHandler = (values) => {
        saveExceptionInvoice()

    }
    const getExceptionRole = () => {
        let roletoStatus = handlerRoles.find(role => role.exceptionRoleId == handlerType).exceptionRole;
        return roletoStatus;

    }



    const multiSelectHandler = (value) => {
        let selectedUsers = value.map((data, i) => {
            return data.value
        })
        let selectedUserFormat = selectedUsers.toString()
        setFieldValue('handlerUsers', selectedUserFormat)
    }



    return (

        <Modal isOpen={exceptionFlagOn} toggle={exceptionaFlagOff}>
            <ModalHeader> Assign to Handler </ModalHeader>
            <ModalBody>
                <Form form="true" onSubmit={handleSubmit}>

                    <FormGroup>
                        <Label for="exceptionType">Select Exception Type</Label>
                        <Input type="select"
                            name="handlerType"
                            id="handlerType"
                            onBlur={handleBlur}
                            onChange={(e) => {
                                handleChange(e)
                                //  setFieldValue("handlerUsers","")
                            }}
                            value={handlerType} >

                            <option value="">Select Handler</option>
                            {handlerRoles.map((role, i) => {
                                const {
                                    exceptionRoleId,
                                    exceptionRole

                                } = role
                                return (
                                    <option key={i} value={exceptionRoleId}>{exceptionRole}</option>
                                );
                            })}
                        </Input>
                        <FormFeedback>
                            {errors.handlerType && touched.handlerType
                                ? errors.handlerType
                                : ""}
                        </FormFeedback>
                    </FormGroup>
                    <FormGroup>
                        <Label for="exceptionUser">Select User</Label>
                        <Select
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            name="handlerUsers"
                            id="handlerUsers"
                            // defaultValue={[colorOptions[4], colorOptions[5]]}
                            isMulti
                            options={handlerUserList}
                            onChange={multiSelectHandler}


                        />
                    </FormGroup>

                    <FormGroup>
                        <Label for="comments">Comments</Label>
                        <Input type="textarea"
                            name="comments"
                            id="comments"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            invalid={
                                errors.comments && touched.comments
                                    ? true
                                    : false
                            }
                            value={comments} />


                        {/* <FormFeedback>

                            {errors.comments && touched.comments ? errors.comments : ""}
                        </FormFeedback> */}



                    </FormGroup>
               
           
            <ModalFooter>
                <Button color="danger" size="sm" className="mr-2" onClick={exceptionaFlagOff}>
                    Close
                </Button>
                <Button type="submit"
                    color="primary">
                    Save
                </Button>

            </ModalFooter>
            </Form>
            </ModalBody>

        </Modal>
    )
}

export default ExceptionHandlerModel