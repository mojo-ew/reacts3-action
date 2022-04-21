import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { deCryptFun, enCryptFun, getTeamID } from "../common/functions";
import { authHeader } from "../common/mainfunctions";
import { USER_EMAIL_LIST_URL } from "../common/url";
import API from "../redux/API";
import MatchingAddress from "./MatchingAddress";
import MonthlyDeviation from "./MonthlyDeviation";
import ReportInvoice from "./ReportInvoice";
import RoundedInvoices from "./RoundedInvoices";
import StandardDeviation from "./StandardDeviation";
export default function Deviations() {
  const [period, setPeriod] = useState(10);
  const [nameData, setNameData] = useState();

  const selectType = (e) => {
   // console.log("e", e.target.value);
    setPeriod(e.target.value);
  };
 // console.log("pp", period);

  let GetMember = async () => {
    const config = {
      method: "GET",
      url: USER_EMAIL_LIST_URL,
      headers: authHeader(),
      params: {
        // entityType: "Supplier",
        // offset: 0,
        // count: 1000,
        // teamId: getTeamID(),
        webString: enCryptFun(
          JSON.stringify({
           entityType: "Supplier",
        offset: 0,
        count: 1000,
        teamId: getTeamID(),
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
     // const { status, data, count } = response.data;
      let l = deCryptFun(response.data);
      const { status, data, count } = JSON.parse(l);
      if (status === "Success") {
      
        setNameData(data);
      }
    } catch (error) {
      console.error(error);
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
      // Swal.fire("Error", v.message);
      }
    } finally {
    }
  };
  useEffect(() => {
    GetMember();
  }, []);
  return (
    <>
      <br />
      <Row>
        <Col md="3">
          <span>
            <b>Select the metric type:</b>
          </span>
        </Col>
        <Col md="6">
          <Input
            type="select"
            name="devtype"
            id="devtype"
            onChange={selectType}
            value={period}
          >
            <option>{"Select"}</option>
            {[
              "Invoice Amount",
              "Invoice Received",
              "Invoice Rounded Amount",
              "Invoice Address",
            ].map((rec, i) => {
              return (
                <option key={`type_${i}`} value={i}>
                  {rec}
                </option>
              );
            })}
          </Input>
        </Col>
      </Row>
      <br />
      {period == 10 ? (
        <Card>
          <center>
            <CardBody>{"Select the metric type"}</CardBody>
          </center>
        </Card>
      ) : (
        ""
      )}
      <br />
      {period == 0 ? (
        <Card>
          <CardHeader>Invoice Amount</CardHeader>
          <CardBody>
            <StandardDeviation nameData={nameData} />
          </CardBody>
        </Card>
      ) : (
        ""
      )}
      <br />
      {period == 1 ? (
        <Card>
          <CardHeader>Invoice Received</CardHeader>
          <CardBody>
            <MonthlyDeviation nameData={nameData} />
          </CardBody>
        </Card>
      ) : (
        ""
      )}
      <Row>
        <Col md="12">
        {period == 2 ? (
          <Card>
            <CardHeader>Invoice Rounded Amount</CardHeader>
            <CardBody>
              <RoundedInvoices />
            </CardBody>
          </Card>
        ) : (
          ""
        )}
        </Col>
      </Row>
      <Row>
        <Col md="12">
        {period == 3 ? (
          <Card>
            <CardHeader>Invoice Address</CardHeader>
            <CardBody>
              <MatchingAddress nameData={nameData} />
            </CardBody>
          </Card>
        ) : (
          ""
        )}
        </Col>
      </Row>
    </>
  );
}
