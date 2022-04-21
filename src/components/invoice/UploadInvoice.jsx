import React, { Fragment, useState, useEffect } from "react";
import {
  Container,
  Col,
  Button,
  CardHeader,
  Card,
  CardBody,
  Row,
  FormGroup,
  Label,
  Input,
  Form,
  FormFeedback,
  Alert,
} from "reactstrap";
import Sidebar from "../layout/Sidebar";
import {
  INVOICE_DETAILS_NEW_ROUTE,
  INVOICE_DETAILS_ROUTE,
  INVOICE_ROUTE,
} from "../../constants/RoutePaths";
import { Link, useParams, useHistory } from "react-router-dom";
import {
  GET_INVOICE_DETAILS,
  GET_SUPPLIER_LIST_URL,
  PRE_SIGNED_URL,
  REUPLOAD_URL,
  USER_EMAIL_LIST_URL,
} from "../common/url";

import Scanner from "../common/Scanner";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import Swal from "sweetalert2";
import Preview from "./Preview";
import {
  deCryptFun,
  enCryptFun,
  getEmail,
  getRole,
  getSenderEmail,
  getTeamID,
} from "../common/functions";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Credentials } from "aws-sdk";
import axios from "axios";

// dev 
const BUCKET_NAME = "inbox-ezcloud123";
// test
//const BUCKET_NAME = "test-inbox-ezcloud";

var folderName = "dashboard_uploads";
const FileExtensions = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/tiff": "tiff",
};

var uploadAPICall = null;

export default function UploadInvoice() {
  let { invoiceID } = useParams();
  const history = useHistory();
  const [filePath, setFilePath] = useState("");
  const [Toggle, setToggle] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [emailList, setEmailList] = useState([]);
  const [sourceType, setType] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPercentage, setUploadingPercentage] = useState(0);
  const [cancelFlag, setCancelFlag] = useState(false);

  const [uploadOrScan, setUploadOrScan] = useState(null);

  const handleUploadOrScanCancel = () => setUploadOrScan(null);
  const handleSetUpload = () => setUploadOrScan("upload");
  const handleSetScan = () => setUploadOrScan("scan");

  const handleBlobChange = (blob) => {
    setSelectedFile(blob);
  };
  let name1 = "No file Selected !";

  let DetailsToggle = () => {
    setToggle(!Toggle);
  };
  useEffect(() => {
    if (invoiceID) {
      GetDetails();
    }
  }, []);

  const constructFileName = (emailId) => {
    let uniqueKey = `${Date.now()}`;

    let extension = FileExtensions[sourceType] || "pdf";

    let fileName = `${uniqueKey}.${extension}`;

    // Upload the file to S3
    let documentName = folderName + "/" + fileName;

    if (emailId) {
      // Mail from folder isolation
      let mail_from_username = emailId.split("@")[0];
      let mail_from_fulldomain = emailId.split("@")[1];
      let mail_from_folder = mail_from_fulldomain.split(".")[0];
      folderName = `${mail_from_folder}/${mail_from_username}_${mail_from_folder}`;
      documentName = `${mail_from_folder}/${mail_from_username}_${mail_from_folder}/${fileName}`;
    }
    return { documentName, folderName, fileName };
  };

  let GetDetails = async () => {
    const config = {
      method: "GET",
      url: GET_INVOICE_DETAILS,
      headers: authHeader(),
      params: {
        //invoiceId: invoiceID,
         webString: enCryptFun(
          JSON.stringify({
              invoiceId: invoiceID,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
     // const { status, data } = response.data;
       let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
      if (status === "Success") {
        setFilePath(data[0].filePath);
      }
    } catch (error) {
      //Swal.fire("Error", error);
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    }
  };

  const handleFileChange = async (e) => {
    let file = e.target.files[0];
    if (file) {
      const filesize = Math.round(file.size / 1024);
      const { type } = file;
     
      setType(type);
      if (
        type === "image/png" ||
        type === "image/jpeg" ||
        type === "image/jpg"
      ) {
        if (filesize >= 10367) {
          Swal.fire(
            getAlert(
              "error",
              "File size exceeds. It should follow the below criteria, it must not exceed 10MB"
            )
          );
          return;
        }
      }
      if (type === "image/tiff") {
        if (filesize >= 518350) {
          Swal.fire(
            getAlert(
              "error",
              "File size exceeds. It should follow the below criteria, it must not exceed 500MB"
            )
          );
          return;
        }
      }
      if (type === "application/pdf") {
        if (filesize >= 30720) {
          Swal.fire(
            getAlert(
              "error",
              "File size exceeds. It should follow the below criteria, it must not exceed 30MB"
            )
          );
          return;
        }
      }

      if (
        type === "application/pdf" ||
        type === "image/png" ||
        type === "image/jpeg" ||
        type === "image/jpg" ||
        type === "image/tiff"
      ) {
        setSelectedFile(e.target.files[0]);
      } else {
        Swal.fire(
          getAlert("error", "Please upload PDF,PNG,JPEG,TIFF file format only.")
        );
      }
    }
  };

  const UploadInvoiceSubmit = async (values) => {
    if (cancelFlag) {
      setCancelFlag(false);
      return;
    }
    if (!selectedFile) {
      Swal.fire(getAlertToast("error", "Please upload file!"));
    } else {
      Swal.fire(getAlertToast("Success", "Uploading..."));
      setIsSubmitting(true);
      let s3FileUrl = "";
      let emailId = invoiceID ? "" : getEmail();
      //  getRole() !== "Supplier"
      // ? values.email
      // : getEmail();
     
      // Getting pre signed url
      const { documentName, folderName, fileName } = constructFileName(emailId);
      try {
        const config = {
          method: "POST",
          url: PRE_SIGNED_URL,
          headers: authHeader(),
          data: {
            // name: documentName,
            // type: sourceType,
      webString: enCryptFun(
          JSON.stringify({
             name: documentName,
            type: sourceType,
          })
        ),
        flutterString: "",
          },
        };

        const response = await API(config);
        //const { status, url } = response.data;
         let l = deCryptFun(response.data);
      const { status, url } = JSON.parse(l);
        if (status === "Success") {
          uploadAPICall = axios.CancelToken.source();

          let options = {
            headers: {
              "Content-Type": sourceType,
            },
            onUploadProgress: function (progressEvent) {
              var percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadingPercentage(percentCompleted);
            },
            cancelToken: uploadAPICall.token,
          };
          
          await axios.put(url, selectedFile, options);

          s3FileUrl =
            "https://" + BUCKET_NAME + ".s3.amazonaws.com/" + documentName;
        }
      } catch (error) {
        console.log(error);
        console.log(JSON.stringify(error?.response));
        alert("Error uploading file");
        setIsSubmitting(false);
        setUploadingPercentage(0);
        setSubmitting(false); // formik
        return;
      }
      if (!s3FileUrl) {
        setIsSubmitting(false);
        return;
      }
      // making api call to lambda
      console.log("supplier name on upload", values.email)
      try {
        const option = {
          method: "POST",
          url: REUPLOAD_URL,
          params: {
            action: !invoiceID ? "Insert" : "Update",
            uploadBy: getRole() === "Supplier" ? "Supplier" : "Customer",
            invoiceId: invoiceID,
            s3FileUrl: s3FileUrl,
            fileType: FileExtensions[sourceType],
            emailId: emailId,
            documentName: documentName,
            fileName: fileName,
            folderName: folderName,
            supplierName: values.email,
            toEmailId: invoiceID
              ? ""
              : getRole() !== "Supplier"
              ? getSenderEmail()
              : values.email,

              
          },
          headers: { ...authHeader(), "Content-Type": "application/json" },
        };
        let response = await API(option);
        const { success, errorMsg = "" } = response.data;
        if (success) {
          Swal.fire(getAlertToast("Success", "Uploaded sucessfully."));
          history.push(INVOICE_ROUTE);
        } else {
          Swal.fire(getAlertToast("error", errorMsg));
        }
      } catch (error) {
        Swal.fire("error", "Error");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().when([], {
      is: () => !invoiceID && getRole() === "Supplier",
      then: Yup.string().required("Required"),
      otherwise: Yup.string().notRequired(),
    }),
  });

  const {
    handleSubmit,
    handleChange,
    setSubmitting,
    values,
    handleBlur,
    errors,
    touched,
  } = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: (values) => UploadInvoiceSubmit(values),
  });
  const getEmailList = async () => {
    const config = {
      method: "GET",
      url:
        getRole() === "Supplier" ? USER_EMAIL_LIST_URL : GET_SUPPLIER_LIST_URL,
      headers: authHeader(),
      params: 
        getRole() === "Supplier"
          ?{  webString: enCryptFun(
          JSON.stringify({
              entityType: getRole() === "Supplier" ? "Customer" : "Supplier",
              offset: 0,
              count: 1000,
              teamId: getTeamID(),
               })
        ),
        flutterString: "",
            }
          : { webString:  enCryptFun(
          JSON.stringify({
              supplierId: getEmail()
              })
        ),
        flutterString: "",
            },
    };
    try {
      const response = await API(config);
     // const { data } = response.data;
      let l = deCryptFun(response.data);
      const { data  } = JSON.parse(l);

      setEmailList(data);
    } catch (error) {
      console.error(error);
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       //Swal.fire(getAlert("Error", v.message));
      }
    }
  };
  const onClickSubmittingAPICancel = () => {
    try {
      console.log(uploadAPICall);
      let flag = window.confirm("Are you sure to cancel this upload?");
      if (!flag) return;
      if (uploadAPICall) {
        uploadAPICall.cancel("Upload cancelled");
        setUploadingPercentage(0);
        setCancelFlag(true); // formik wierd  - retries upload on cancelled api. so setting a flag and returning submit when true
        setIsSubmitting(false); // usestate
        setSubmitting(false); // formik
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getEmailList();
  }, []);

  if (selectedFile) {
    const { name } = selectedFile;
    name1 = name;
  }

  return (
    <Fragment>
      <div className="wrapper">
        <Sidebar />
        <div className="page-content-wrapper">
          <Container fluid={true}>
            <div className="page-title">
              <h3>Upload Invoice</h3>
              <div className="rightside">
                <Link
                  to={
                    invoiceID
                      ? INVOICE_DETAILS_NEW_ROUTE + "/" + invoiceID
                      : INVOICE_ROUTE
                  }
                >
                  <Button outline color="secondary">
                    Back
                  </Button>
                </Link>
                {invoiceID && (
                  <Button
                    className="ml-2"
                    color="primary"
                    onClick={DetailsToggle}
                  >
                    View PDF
                  </Button>
                )}
              </div>
            </div>
            <div className="cus-row">
              <Col md={{ size: 6, offset: 3 }}>
                <Card>
                  <CardHeader>File upload</CardHeader>
                  <CardBody>
                    <Alert color="warning">
                      Please ensure that your invoice document should follow the
                      below criteria
                      <br />
                      1. If PDF, it must not exceed 30MB <br />
                      2. If PNG/JPG, it must not exceed 10MB
                      <br />
                      3. If TIFF, it must not exceed 500MB
                    </Alert>
                    <Form form="true" onSubmit={handleSubmit}>
                      {!invoiceID && (
                        <FormGroup>
                          <Label for="ToEmail">
                            {getRole() === "Supplier"
                              ? "Select the Subscriber"
                              : "Select the supplier"}
                          </Label>
                          <Input
                            type="select"
                            invalid={
                              errors.email && touched.email ? true : false
                            }
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.email}
                            name="email"
                            id="email"
                            placeholder="To Email"
                          >
                            <option value="" disabled>
                              Please select
                            </option>
                            {getRole() == "Supplier"
                              ? emailList &&
                                emailList.map((record, index) => {
                                  return (
                                    <option
                                      key={`listing_${index}`}
                                      value={record.email}
                                    >
                                      {record.companyName}
                                    </option>
                                  );
                                })
                              : emailList &&
                                emailList.map((record, index) => {
                                  return (
                                    <option
                                      key={`listing_${index}`}
                                      value={record.supplierName}
                                    >
                                      {record.supplierName}
                                    </option>
                                  );
                                })}
                          </Input>
                          <FormFeedback>
                            {errors.email && touched.email ? errors.email : ""}{" "}
                          </FormFeedback>
                        </FormGroup>
                      )}
                      {!isSubmitting && uploadOrScan === "upload" && (
                        <>
                          <div className="upload-btn-wrapper">
                            <div>
                              <p>Drag a file here to upload</p>
                              <button className="Upload-btn">
                                <input
                                  type="file"
                                  name="myfile"
                                  onChange={handleFileChange}
                                  // accept=".pdf,.png,.jpeg"
                                  // inputProps={{ accept: ".pdf" }}
                                />
                                Upload a file
                              </button>
                            </div>
                          </div>

                          <Row>
                            <Col sm="12" md={{ size: 6, offset: 3 }}>
                              <div className="upload-list">
                                <div className="list">
                                  <svg
                                    viewBox="64 64 896 896"
                                    focusable="false"
                                    data-icon="paper-clip"
                                    width="1em"
                                    height="1em"
                                    fill="currentColor"
                                    aria-hidden="true"
                                  >
                                    <path d="M779.3 196.6c-94.2-94.2-247.6-94.2-341.7 0l-261 260.8c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0012.7 0l261-260.8c32.4-32.4 75.5-50.2 121.3-50.2s88.9 17.8 121.2 50.2c32.4 32.4 50.2 75.5 50.2 121.2 0 45.8-17.8 88.8-50.2 121.2l-266 265.9-43.1 43.1c-40.3 40.3-105.8 40.3-146.1 0-19.5-19.5-30.2-45.4-30.2-73s10.7-53.5 30.2-73l263.9-263.8c6.7-6.6 15.5-10.3 24.9-10.3h.1c9.4 0 18.1 3.7 24.7 10.3 6.7 6.7 10.3 15.5 10.3 24.9 0 9.3-3.7 18.1-10.3 24.7L372.4 653c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0012.7 0l215.6-215.6c19.9-19.9 30.8-46.3 30.8-74.4s-11-54.6-30.8-74.4c-41.1-41.1-107.9-41-149 0L463 364 224.8 602.1A172.22 172.22 0 00174 724.8c0 46.3 18.1 89.8 50.8 122.5 33.9 33.8 78.3 50.7 122.7 50.7 44.4 0 88.8-16.9 122.6-50.7l309.2-309C824.8 492.7 850 432 850 367.5c.1-64.6-25.1-125.3-70.7-170.9z"></path>
                                  </svg>
                                  <p>{name1}</p>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </>
                      )}

                      {!isSubmitting && !uploadOrScan && (
                        <Row className="justify-content-center">
                          { getRole() === "Supplier" ? null : <Button color="primary" onClick={handleSetScan}>
                            Scan
                          </Button> }
                          { getRole() === "Supplier" ? null : <p
                            style={{
                              margin: "revert",
                              marginRight: "10px",
                              marginLeft: "10px",
                            }}
                          >
                            {" "}
                            or{" "}
                          </p>  }
                          <Button color="primary" onClick={handleSetUpload}>
                            Upload
                          </Button>
                        </Row>
                      )}
                      {!isSubmitting && uploadOrScan === "scan" && (
                        <>
                          <Scanner handleBlobChange={handleBlobChange} />
                        </>
                      )}
                      {!isSubmitting && uploadOrScan && (
                        <p
                          style={{
                            margin: "1rem",
                            textAlign: "center",
                            cursor: "pointer",
                          }}
                          onClick={handleUploadOrScanCancel}
                        >
                          Cancel
                        </p>
                      )}
                      {isSubmitting && (
                        <div style={{ textAlign: "center" }}>
                          <h3>Uploading...</h3>
                          <h5>{uploadingPercentage} % </h5>
                          {/* <p onClick={onClickSubmittingAPICancel}>Cancel</p> */}
                        </div>
                      )}
                      <Button
                        type={isSubmitting ? "button" : "submit"}
                        color="primary"
                        className="mt-4"
                        onClick={
                          isSubmitting ? onClickSubmittingAPICancel : () => {}
                        }
                        block
                      >
                        {isSubmitting ? "Cancel" : "Submit"}
                      </Button>
                      {/* <Scanner /> */}
                    </Form>
                  </CardBody>
                </Card>
              </Col>
            </div>
          </Container>
        </div>
      </div>
      {Toggle && (
        <Preview
          filePath={filePath}
          Toggle={Toggle}
          DetailsToggle={DetailsToggle}
        />
      )}
    </Fragment>
  );
}
