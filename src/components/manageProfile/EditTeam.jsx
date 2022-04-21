import React, { useEffect, useState } from "react";
import {
  FormFeedback,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { GET_TEAMDETAILS_BY_ID, UPDATE_TEAM, UPLOAD_FILE } from "../common/url";
import { authHeader, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import Swal from "sweetalert2";
import defaultCompanyLogo from "../../images/logo-placeholder.jpg";
import { deCryptFun, enCryptFun, getRole, getTeamID } from "../common/functions";
import { UPDATE_COMPANY_LOGO } from "../redux/actionTypes";
import { useDispatch } from "react-redux";
function EditTeam() {
  const [teamData, setTeamData] = useState({
    companyName: "",
    autoApproval: "",
  });
  const [uplLoading, setUplLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const validationSchema = Yup.object({
    companyName: Yup.string().required("Required"),
    autoApproval: Yup.string().required("Required"),
    invoiceSenderEmail: Yup.string()
      .email("Invalid email")
      .required("Required"),
  });
  const { handleSubmit, handleChange, handleBlur, values, errors, touched } =
    useFormik({
      initialValues: teamData,
      enableReinitialize: true,
      validationSchema,
      onSubmit: (values) => UpdateTeam(values),
    });

  let UpdateTeam = async (values) => {
    let { teamId, companyName, autoApproval, invoiceSenderEmail, companyLogo } =
      values;
    const config = {
      method: "PUT",
      url: UPDATE_TEAM,
      data: {
        // teamId,
        // companyName,
        // autoApproval,
        // invoiceSenderEmail,
        // companyLogo,
         webString: enCryptFun(
          JSON.stringify({
            teamId,
        companyName,
        autoApproval,
        invoiceSenderEmail,
        companyLogo,
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
      const { status } = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", "Updated Successfully"));
        localStorage.setItem("BRAND_LOGO", companyLogo);
        dispatch({
          type: UPDATE_COMPANY_LOGO,
          payload: companyLogo,
        });
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
      setLoading(false);
    }
  };

  useEffect(() => {
    GetTeamById();
  }, []);

  const GetTeamById = async () => {
    const config = {
      method: "GET",
      url: GET_TEAMDETAILS_BY_ID,
      headers: authHeader(),
      params: {
       // teamId: getTeamID(),
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            
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
        setTeamData(data[0]);
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
    formdata.append("file", e.target.files[0]);
    try {
      setUplLoading(true);
      const option = {
        method: "POST",
        url: UPLOAD_FILE,
        data: formdata,
        //  uploadFileString: enCryptFun(
        //   JSON.stringify(
        //     formdata
        //   )
        // ),
        headers: authHeader(),
        "content-type": "multipart/form-data",
      };
      let response = await API(option);
      const { status, filePath, message } = response.data;
      // let l = deCryptFun(response.data);
      // const { status, filePath, message } = JSON.parse(l);
      if (status === "Success") {
        setTeamData({ ...values, companyLogo: filePath });
        Swal.fire(getAlertToast("Success", message));
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
  return (
    <div>
      <Row className="mt-5">
        <Col sm="12">
          <div className="uploadPic">
            <img
              className="brandlogoUplod"
              src={values.companyLogo || defaultCompanyLogo}
            />
            <div className="into">
              <h5>Upload your brand logo</h5>
              {/* <span>PNG or JPG no bigger than 500px350px wide and tall.</span> */}
              <span>PNG or JPG no larger than 500px wide and 350px tall</span>
            </div>
            <div className="upload-btn-pic">
              <button className="upload-btn ">
                {uplLoading && <Spinner color="light" />}Choose Logo
              </button>
              <input
                type="file"
                name="myfile"
                onChange={handleFileChange}
                accept=".JPEG,.PNG,.TIFF,.PSD,"
              />
            </div>
          </div>
        </Col>
      </Row>
      <hr />
      <Form form="true" onSubmit={handleSubmit}>
        <Row className="mt-5">
          <Col md="6">
            <FormGroup>
              <Label for="companyName">Company Name</Label>
              <Input
                type="text"
                onChange={handleChange}
                placeholder="Enter Company Name"
                invalid={
                  errors.companyName && touched.companyName ? true : false
                }
                value={values.companyName}
                name="companyName"
                id="companyName"
              />
              <FormFeedback>
                {errors.companyName && touched.companyName
                  ? errors.companyName
                  : ""}
              </FormFeedback>
            </FormGroup>
          </Col>

          {/* <Col md="6">
                    <FormGroup>
                    <Label for="invoiceSenderEmail">Invoice Sender Email</Label>
                    <Input type="text" onChange={handleChange}
                    value={values.invoiceSenderEmail} name="invoiceSenderEmail" id="" />
                    <FormFeedback >
                    {errors.invoiceSenderEmail}
                    </FormFeedback>
                    </FormGroup>
                    </Col> */}
          {getRole() !== "Supplier" ? (
            <Col md="6">
              <FormGroup>
                <Label for="autoApproval">Auto Approval Amount</Label>
                <InputGroup>
                  <Input
                    type="number"
                    onChange={handleChange}
                    placeholder="Enter Auto Approval Amount"
                    max={99999999}
                    step=".01"
                    invalid={
                      errors.autoApproval && touched.autoApproval ? true : false
                    }
                    value={values.autoApproval}
                    name="autoApproval"
                    id=""
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>$</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FormFeedback>{errors.autoApproval}</FormFeedback>
              </FormGroup>
            </Col>
          ) : (
            ""
          )}

          <Col md="12">
            <Button
              type="submit"
              id="1"
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

export default EditTeam;
