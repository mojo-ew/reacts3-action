import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Container,
  Card,
  Button,
  CardHeader,
  CardBody,
  CardTitle,
  FormGroup,
  Label,
  Row,
  Col,
  Input,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Table,
  Badge,
  PaginationItem,
  PaginationLink,
  Spinner,
} from "reactstrap";
import Pagination from "react-js-pagination";

import classnames from "classnames";
import moment from "moment";

import Sidebar from "../layout/Sidebar";
import { GET_USERS, REPORT_URL } from "../common/url";
import { authHeader } from "../common/mainfunctions";
import { deCryptFun, enCryptFun, getRole, getTeamID } from "../common/functions";
import API from "../redux/API";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { debounce } from "@material-ui/core";
import Swal from "sweetalert2";
import { CSVLink } from "react-csv";
import StandardDeviation from "./StandardDeviation";
import MonthlyDeviation from "./MonthlyDeviation";
import RoundedInvoices from "./RoundedInvoices";
import { getAllByAltText } from "@testing-library/react";

export default function MatchingAddress(props) {
  const { nameData = [] } = props;
  const [duration, setDuration] = useState();
  const [selectedDate, setSelecteDate] = useState();
  const [selectedDate1, setSelecteDate1] = useState();
  const [totalAmount, setAmount] = useState();
  const [selectedStatus, setStatus] = useState("");
  const [selectedStatus1, setStatus1] = useState("");
  const [rowperpage, setRowPerPage] = useState(10);
  const [currentpage, setCurrentPage] = useState(0);
  const [totalrecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState();
  const [name, setName] = useState();
  const [matchAddress, setMatchAddress] = useState("");

  const [deviationValue, setDeviaionValue] = useState(0);
  const headers = [
    { label: "Invoice Number", key: "invoiceNumber" },
    { label: "Supplier Name", key: "name" },
    { label: "Company", key: "supplierCompanyName" },
    { label: "Amount", key: "invoiceAmount" },
    { label: "Invoice Status", key: "status" },
  ];
  const getDownloadFileName = () => {
    return "InvoiceReport";
  };

  const handleDateChange = (e) => {
    const d = e.getMonth();
    const month = d + 1;
    setSelecteDate(e);
  };
  const handleDateChange1 = (e) => {
    const d = e.getMonth();
    const month = d + 1;
    setSelecteDate1(e);
  };
  const RowHandler = (e) => {
    setCurrentPage(0);
    setRowPerPage(e.target.value);
  };
  const onPageChange = (page) => {
    setCurrentPage(page - 1);
  };
  const current = new Date();
  const prior = new Date().setDate(current.getDate() - 30);
  // const prior = new Date().setDate(current.getDate() - 30);

  const onHandleDuration = (e) => {
    const { value } = e.target;
    if (value == "Single Month") {
      setDuration(value);
      setSelecteDate(new Date(prior));
      setSelecteDate1(new Date());
    } else {
      setDuration(value);
      setSelecteDate("");
      setSelecteDate1("");
    }
  };





  // it returns a timestamp
  const getReport = async (
    currentpage,
    rowperpage,
    selectedDate,
    selectedDate1,
    selectedStatus,
    name,
    matchAddress
  ) => {
   
    const config = {
      method: "GET",
      url: REPORT_URL,
      headers: authHeader(),
      params: {
        // teamId: getTeamID(),
        // count: rowperpage,
        // offset: currentpage,
        // status:
        //   selectedStatus === "All" ||
        //   selectedStatus == "Potential Duplicate Invoices"
        //     ? ""
        //     : selectedStatus == "Within 3% of Approval Limit"
        //     ? "Approved"
        //     : selectedStatus == "Beyond due date"
        //     ? "Pending"
        //     : selectedStatus == "Standard Deviation"
        //     ? ""
        //     : selectedStatus,
        // createdFromDate:
        //   selectedDate && selectedStatus != "Beyond due date"
        //     ? moment(selectedDate).format("YYYY/MM/DD")
        //     : "",
        // createdToDate:
        //   selectedDate1 && selectedStatus !== "Beyond due date"
        //     ? moment(selectedDate1).format("YYYY/MM/DD")
        //     : "",
        // dueFromDate:
        //   selectedDate && selectedStatus === "Beyond due date"
        //     ? moment(selectedDate).format("YYYY/MM/DD")
        //     : "",
        // dueToDate:
        //   selectedDate1 && selectedStatus === "Beyond due date"
        //     ? moment(selectedDate1).format("YYYY/MM/DD")
        //     : "",
        // is3PercentageRange:
        //   selectedStatus === "Within 3% of Approval Limit" ? "true" : "",
        // isDuplicate:
        //   selectedStatus === "Potential Duplicate Invoices" ? "true" : "",
        // standardDeviation:
        //   selectedStatus === "Standard Deviation" ? "true" : "",
        //    senderEmail: name,
     
     
      webString: enCryptFun(
          JSON.stringify({
              teamId: getTeamID(),
        count: rowperpage,
        offset: currentpage,
        // status:
        //   selectedStatus === "All" ||
        //   selectedStatus == "Potential Duplicate Invoices"
        //     ? ""
        //     : selectedStatus == "Within 3% of Approval Limit"
        //     ? "Approved"
        //     : selectedStatus == "Beyond due date"
        //     ? "Pending"
        //     : selectedStatus == "Standard Deviation"
        //     ? ""
        //     : selectedStatus,
        status: "Approved",
        createdFromDate:
          selectedDate && selectedStatus != "Beyond due date"
            ? moment(selectedDate).format("YYYY/MM/DD")
            : "",
        createdToDate:
          selectedDate1 && selectedStatus !== "Beyond due date"
            ? moment(selectedDate1).format("YYYY/MM/DD")
            : "",
        dueFromDate:
          selectedDate && selectedStatus === "Beyond due date"
            ? moment(selectedDate).format("YYYY/MM/DD")
            : "",
        dueToDate:
          selectedDate1 && selectedStatus === "Beyond due date"
            ? moment(selectedDate1).format("YYYY/MM/DD")
            : "",
        is3PercentageRange:
          selectedStatus === "Within 3% of Approval Limit" ? "true" : "",
        isDuplicate:
          selectedStatus === "Potential Duplicate Invoices" ? "true" : "",
        standardDeviation:
          selectedStatus === "Standard Deviation" ? "true" : "",
      senderEmail: name,
      isMatching: matchAddress,
          })
        ),
        flutterString: "",
        //isMatching: matchAddress,
    }
    };

    try {
      setLoading(true);

      const response = await API(config);
     // const { status, data, count, invoiceAmount, standardDeviationAmount } =
      //  response.data;
 let l = deCryptFun(response.data);
      const { status, data, count, invoiceAmount, standardDeviationAmount } = JSON.parse(l);
      if (status === "Success") {
     
        setReportData(data);
        setTotalRecords(count);
        setAmount(invoiceAmount);
        setDeviaionValue(standardDeviationAmount);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getReport();
  }, []);
  const delaySearch = useRef(
    debounce(
      (
        currentpage,
        rowperpage,
        selectedDate,
        selectedDate1,
        selectedStatus,
        name,
        matchAddress
      ) =>
        getReport(
          currentpage,
          rowperpage,
          selectedDate,
          selectedDate1,
          selectedStatus,
          name,
          matchAddress
        )
    )
  ).current;

  useEffect(() => {
    delaySearch(
      currentpage,
      rowperpage,
      selectedDate,
      selectedDate1,
      selectedStatus,
      name,
      matchAddress
    );
  }, [
    currentpage,
    rowperpage,
    selectedDate,
    selectedDate1,
    selectedStatus,
    name,
    matchAddress
  ]);
  const handleStatusChange = (e) => {
    const { value } = e.target;
    // if (value == "Beyond due date") {
    // setStatus1(value);
    // } else {
    setStatus(value);
    // }
  };
  let ResetFilter = () => {
    setDuration("");
    setSelecteDate("");
    setSelecteDate1("");
    setStatus("");
    setStatus1("");
    setName("");
    setMatchAddress("")
  };

  const onHandleName = (e) => {
    const { value } = e.target;
    setName(value);
  };

const onHandleMatchAddress = (e) => {
  //console.log("e", e.target.value)
  setMatchAddress(e.target.value)
}

  return (
    <Fragment>
      <Card body className="mt-3">
        <Row>
          <Col sm="6" md="4" lg="3">
            <FormGroup>
              {/* <b>
                <span>Select Supplier</span>
              </b> */}
               <Label for="name">Select Supplier</Label>
              <Input
                type="select"
                name="name"
                id="name"
                onChange={onHandleName}
                value={name}
              >
                <option>Select</option>
                <option value = "jeyabaskaranm@apptomate.co">Jeya Baskaran</option>
                {nameData &&
                  nameData.map((record, i) => {
                    const { userId, firstName, lastName, email } = record;
                    return (
                      <option key={i} value={email}>
                        {firstName} {lastName}
                      </option>
                    );
                  })}
              </Input>
            </FormGroup>
          </Col>
          <Col sm="6" md="4" lg="3">
            <FormGroup>
              <Label for="exampleEmail">Duration</Label>
              <Input
                type="select"
                name="duration"
                id="duration"
                onChange={onHandleDuration}
                value={duration}
              >
                <option value={""}>Select</option>
                {["Custom Date Range", "Single Month"].map((i) => {
                  return (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  );
                })}
              </Input>
            </FormGroup>
          </Col>

          <Col sm="6" md="4" lg="3">
            <FormGroup>
              <Label for="createdFromDate">From date</Label>
              <DatePicker
                selected={selectedDate}
                minDate={duration === "Single Month" ? new Date(prior) : ""}
                maxDate={new Date()}
                name="createdToDate"
                id="createdToDate"
                onSelect={handleDateChange}
                placeholderText="Select"
              />
            </FormGroup>
          </Col>
          <Col sm="6" md="4" lg="3">
            <FormGroup>
              <Label for="createdToDate">To date</Label>
              <DatePicker
                selected={selectedDate1}
                minDate={duration === "Single Month" ? new Date(prior) : ""}
                maxDate={new Date()}
                name="createdToDate"
                id="createdToDate"
                onSelect={handleDateChange1}
                placeholderText="Select"
              />
            </FormGroup>
          </Col>
           <Col sm="6" md="4" lg="3">
            <FormGroup>
              {/* <b>
                <span>Matching Address</span>
              </b> */}
               <Label for="matchingAddress">Matching Address</Label>
              <Input
                type="select"
                name="matchingAddress"
                id="matchingAddress"
                 onChange={onHandleMatchAddress}
                 value={matchAddress}
              >
                <option>Select</option>
                <option value = "true">Matched</option>
                <option value = "false">Not Matched</option>
              </Input>
            </FormGroup>
          </Col>

          <Col sm="6" md="4" lg="3">
            <Button color="primary" onClick={() => ResetFilter()} className="mt-4">
              Reset
            </Button>
          </Col>
        </Row>
      </Card>
      <Row className="mt-3">
        <Col md="4">
          <Card body className="dash-count">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="43.261"
              viewBox="0 0 37.007 43.261"
            >
              <path
                id="Icon_payment-invoice-sign-alt-o"
                data-name="Icon payment-invoice-sign-alt-o"
                d="M46.8,25.559a6.107,6.107,0,0,1,1.183,1.775,5.061,5.061,0,0,1,.422,2.112V57.329a2.024,2.024,0,0,1-.676,1.6,2.191,2.191,0,0,1-1.6.677H13.678a2.186,2.186,0,0,1-1.6-.676,2.019,2.019,0,0,1-.676-1.6V18.63a2.02,2.02,0,0,1,.676-1.6,2.189,2.189,0,0,1,1.6-.676H35.309a5.029,5.029,0,0,1,2.112.507,6.359,6.359,0,0,1,1.858,1.1l7.521,7.6ZM45.364,56.484V31.812H35.309a2.186,2.186,0,0,1-1.6-.676,2.12,2.12,0,0,1-.676-1.69V19.476H14.439V56.484H45.364ZM20.607,35.7a.815.815,0,0,1,.253-.592.728.728,0,0,1,.507-.253H38.436a.731.731,0,0,1,.507.253.813.813,0,0,1,.253.592V37.22q0,.424-.253.507a.733.733,0,0,1-.508.253H21.367a.732.732,0,0,1-.507-.253q-.253-.083-.253-.507V35.7Zm17.828,5.408a.692.692,0,0,1,.507.169.813.813,0,0,1,.253.592v1.521a.813.813,0,0,1-.253.592,1.288,1.288,0,0,1-.507.169H21.368a1.275,1.275,0,0,1-.507-.169.811.811,0,0,1-.253-.592V41.867a.815.815,0,0,1,.253-.592.688.688,0,0,1,.507-.169Zm0,6.168a1.3,1.3,0,0,1,.507.169.813.813,0,0,1,.253.592v1.521a.813.813,0,0,1-.253.592,1.288,1.288,0,0,1-.507.169H21.368a1.275,1.275,0,0,1-.507-.169.811.811,0,0,1-.253-.592V48.035a.815.815,0,0,1,.253-.592,1.29,1.29,0,0,1,.507-.169ZM36.07,19.645v9.041H45.2a1.55,1.55,0,0,0-.592-.929l-7.52-7.6a2.768,2.768,0,0,0-1.014-.507Z"
                transform="translate(-11.398 -16.35)"
                fill="#ff7619"
              />
            </svg>
            Total Invoices
            <span>{loading ? <Spinner color="primary" /> : totalrecords}</span>
          </Card>
        </Col>

        <Col md="4">
          <Card body className="dash-count">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="39"
              viewBox="0 0 24.689 47.419"
            >
              <path
                id="Icon_metro-dollar2"
                data-name="Icon metro-dollar2"
                d="M34.647,33.56a10.067,10.067,0,0,1-2.633,6.973,11.364,11.364,0,0,1-6.84,3.612v4.631a.815.815,0,0,1-.847.847H20.754a.859.859,0,0,1-.847-.847V44.145a16.68,16.68,0,0,1-3.374-.82,17.764,17.764,0,0,1-2.686-1.178,17.824,17.824,0,0,1-1.958-1.27,15.082,15.082,0,0,1-1.23-.992q-.331-.318-.463-.476a.8.8,0,0,1-.053-1.085l2.726-3.572a.823.823,0,0,1,.609-.318.656.656,0,0,1,.635.238l.053.053a13.818,13.818,0,0,0,6.43,3.308,9.243,9.243,0,0,0,1.958.212,6.416,6.416,0,0,0,3.771-1.138,3.707,3.707,0,0,0,1.627-3.228,2.683,2.683,0,0,0-.4-1.4,4.958,4.958,0,0,0-.887-1.111,7.263,7.263,0,0,0-1.548-.992q-1.058-.542-1.746-.847t-2.117-.86Q20.225,28.241,19.63,28T18,27.3q-1.032-.463-1.654-.82t-1.5-.939a9.318,9.318,0,0,1-1.416-1.125,16.493,16.493,0,0,1-1.151-1.3,6.474,6.474,0,0,1-.939-1.535,10.613,10.613,0,0,1-.556-1.76,9.184,9.184,0,0,1-.225-2.064,9.048,9.048,0,0,1,2.593-6.4,12.108,12.108,0,0,1,6.748-3.546V3.05a.859.859,0,0,1,.847-.847h3.572a.815.815,0,0,1,.847.847V7.707a14.718,14.718,0,0,1,2.924.609,16.953,16.953,0,0,1,2.3.886,12.749,12.749,0,0,1,1.68.992q.794.556,1.032.767t.4.37a.766.766,0,0,1,.132,1.006L31.5,16.2a.721.721,0,0,1-.609.423.843.843,0,0,1-.714-.185q-.079-.079-.384-.318t-1.032-.7a13.655,13.655,0,0,0-1.548-.847,11.818,11.818,0,0,0-1.971-.688,8.828,8.828,0,0,0-2.262-.3,6.877,6.877,0,0,0-4.1,1.138,3.557,3.557,0,0,0-1.363,4.207,2.978,2.978,0,0,0,.781,1.1,11.66,11.66,0,0,0,1.045.873,9.32,9.32,0,0,0,1.482.82q.992.463,1.6.714t1.852.728q1.4.529,2.143.834t2.011.926a15.986,15.986,0,0,1,2,1.125,16.894,16.894,0,0,1,1.641,1.323,6.851,6.851,0,0,1,1.4,1.68,9.589,9.589,0,0,1,.834,2.024,8.73,8.73,0,0,1,.344,2.487Z"
                transform="translate(-9.957 -2.203)"
                fill="#ff7619"
              />
            </svg>
            Total Amount
            <span>
              {loading ? <Spinner color="primary" /> : totalAmount || 0}
            </span>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md="12">
          <Card body className="mt-3">
            <CardTitle tag="h5" className="item-center">
              Received Invoices
              {reportData && (
                <CSVLink
                  className="ml-auto"
                  key={`csv_${reportData.length}`}
                  data={reportData}
                  headers={headers}
                  filename={`${getDownloadFileName()}.csv`}
                  target="_blank"
                >
                  <Button color="primary" size="sm">
                    Export
                  </Button>
                </CSVLink>
              )}
            </CardTitle>
            <Table className="responsive-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Supplier Name</th>
                  
                  <th>Amount</th>
                  <th>Invoice Status</th>
                  <th>Approved By</th>
                  <th>Matching Address</th>
                </tr>
              </thead>
              <tbody>
                {loading ? null : reportData && reportData.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <center>No Record Found</center>
                    </td>
                  </tr>
                ) : (
                  reportData &&
                  reportData.map((record, index) => {
                    const {
                      invoiceId,
                      invoiceNumber,
                      senderEmail,
                      supplierCompanyName,
                      name,
                      dueAmount,
                      invoiceAmount,
                      status,
                      approvedByName,
                      isMatchingAddress,
                    } = record;
                    return (
                      <tr className="tablebody-cell" key={index}>
                        <td>{invoiceNumber}</td>
                        <td>{name}</td>
                       
                        <td>{invoiceAmount}</td>
                        <td>
                          <Badge color="primary">{status}</Badge>
                        </td>
                        <td>{approvedByName}</td>
                        <td>
                          {isMatchingAddress === 0 ? <Badge color="danger" pill>Not Matched</Badge> : isMatchingAddress===1 && <Badge color="success" pill>Matched</Badge> || "N/A"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
            <br />
            <div className="table-spinner">
              {" "}
              {loading ? <Spinner color="primary" /> : ""}
            </div>
            <div className="pagenationSetion">
              {/* page filters */}
              <div className="filtersPage">
                Showing {rowperpage * currentpage + 1} to{" "}
                {rowperpage * (currentpage + 1)} of {totalrecords} rows
                <FormGroup style={{ width: "fit-" }}>
                  <Input
                    type="select"
                    name="rowPerPage"
                    id="exampleSelect"
                    onChange={RowHandler}
                    value={rowperpage}
                  >
                    {[10, 20, 30].map((i) => {
                      return (
                        <option key={`rowHandler_${i}`} value={i}>
                          {i}
                        </option>
                      );
                    })}
                  </Input>
                </FormGroup>
                rows per page
              </div>
              <br />
              <div className="d-flex flex-row py-4 justify-content-end">
                <Pagination
                  itemClass="page-item"
                  linkClass="page-link"
                  activePage={currentpage + 1}
                  itemsCountPerPage={rowperpage}
                  totalItemsCount={totalrecords}
                  onChange={onPageChange}
                />
              </div>
            </div>{" "}
          </Card>
        </Col>
        {/* <Col md="5">
          <br />
          <Card>
            <CardHeader>Invoice Standard Deviation</CardHeader>
            <CardBody>
              <StandardDeviation deviationValue={deviationValue} />
            </CardBody>
          </Card>
          <br />
          <Card>
            <CardHeader>Month Wise Standard Deviation</CardHeader>
            <CardBody>
              <MonthlyDeviation deviationValue={deviationValue} />
            </CardBody>
          </Card>
        </Col> */}
      </Row>
      {/* <Card>
        <CardHeader>Rounded Invoices Deviation</CardHeader>
        <CardBody>
          <RoundedInvoices />
        </CardBody>
      </Card> */}
    </Fragment>
  );
}
