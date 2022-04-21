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
//import { deCryptFun, enCryptFun, getRole, getTeamID } from "../common/functions";
import {
  deCryptFun,
  enCryptFun,
  getRole,
  getTeamID,
} from "../common/functions";
import API from "../redux/API";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { debounce } from "@material-ui/core";
import Swal from "sweetalert2";
import { CSVLink } from "react-csv";
import { getMonth, getYear } from 'date-fns';
import range from "lodash/range";
import {years,months} from './ReportInvoice'

export default function TeamMember() {
  const [reportData, setReportData] = useState();
  const [rowperpage, setRowPerPage] = useState(10);
  const [currentpage, setCurrentPage] = useState(0);
  const [totalrecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState();
  const [selectedDate, setSelecteDate] = useState();
  const [selectedDate1, setSelecteDate1] = useState();
  const [name, setName] = useState();
  const [nameData, setNameData] = useState();
  const [totalAmount, setAmount] = useState();
  const [showexport, setShowExport] = useState(false)
   const [recordsCsvData, setRecordsCsvData] = useState([])

  const RowHandler = (e) => {
    setCurrentPage(0);
    setRowPerPage(e.target.value);
  };
  const onPageChange = (page) => {
    setCurrentPage(page - 1);
  };
  const getReport = async (
    currentpage,
    rowperpage,
    name,
    selectedDate,
    selectedDate1
  ) => {
    // console.log("name", name, "currentpage", currentpage, "rowPerPage", rowperpage , "selectedDate", selectedDate ? moment(selectedDate).format("MM/DD/YYYY")
    //         : "", "selectedDate1", selectedDate1 ? moment(selectedDate1).format("MM/DD/YYYY")
    //         : "")
    const config = {
      method: "GET",
      url: REPORT_URL,
      headers: authHeader(),
      params: {
        // teamId: getTeamID(),
        // approvedByRole: "Team Member",
        // status: "Approved",
                // count: rowperpage,
        // offset: currentpage,
        // createdFromDate: selectedDate
        //   ? moment(selectedDate).format("YYYY/MM/DD")
        //   : "",
        // createdToDate: selectedDate1
        //   ? moment(selectedDate1).format("YYYY/MM/DD")
        //   : "",
        // approvedBy: name,
      webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
        approvedByRole: "Team Member",
        status: "Approved",
        count: rowperpage,
        offset: currentpage,
        createdFromDate: selectedDate
          ? moment(selectedDate).format("YYYY/MM/DD")
          : "",
        createdToDate: selectedDate1
          ? moment(selectedDate1).format("YYYY/MM/DD")
          : "",
        approvedBy: name,
          })
        ),
         flutterString: "",
      },
    };
    try {
      setLoading(true);
      const response = await API(config);
      //const { status, data, count, invoiceAmount } = response.data;
let l = deCryptFun(response.data);
      const { status, data, count, invoiceAmount} = JSON.parse(l);
      if (status === "Success") {
        setReportData(data);
        setTotalRecords(count);
        setAmount(invoiceAmount);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


const fetchCsvData = async () => {
   
    const config = {
      method: "GET",
      url: REPORT_URL,
      headers: authHeader(),
      params: {
      //  teamId: getTeamID(),
      //   approvedByRole: "Team Member",
      //   status: "Approved",
      //   count: totalrecords,
      //   offset: currentpage,
      //   createdFromDate: selectedDate
      //     ? moment(selectedDate).format("YYYY/MM/DD")
      //     : "",
      //   createdToDate: selectedDate1
      //     ? moment(selectedDate1).format("YYYY/MM/DD")
      //     : "",
      //   approvedBy: name,
     webString: enCryptFun(
          JSON.stringify({
             teamId: getTeamID(),
        approvedByRole: "Team Member",
        status: "Approved",
        count: totalrecords,
        offset: currentpage,
        createdFromDate: selectedDate
          ? moment(selectedDate).format("YYYY/MM/DD")
          : "",
        createdToDate: selectedDate1
          ? moment(selectedDate1).format("YYYY/MM/DD")
          : "",
        approvedBy: name,
          })
        ),
         flutterString: "",
    },
    };

     try {
     setLoading(true);

      const response = await API(config);
  // const { status, data, count, invoiceAmount } = response.data;
 let l = deCryptFun(response.data);
      const {  status, data, count, invoiceAmount, standardDeviationAmount} = JSON.parse(l);
      if (status === "Success") {
      
       setRecordsCsvData(data)
       setShowExport(true)
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
     //  ref.current.link.click()
      
     
    }
  };



  useEffect(() => {
    getReport();
  }, []);


useEffect(()=>{
    if(totalrecords){
       fetchCsvData()
    }
  }, [totalrecords,setTotalRecords])


  const delaySearch = useRef(
    debounce((currentpage, rowperpage, name, selectedDate, selectedDate1) =>
      getReport(currentpage, rowperpage, name, selectedDate, selectedDate1)
    )
  ).current;

  useEffect(() => {
    delaySearch(currentpage, rowperpage, name, selectedDate, selectedDate1);
  }, [currentpage, rowperpage, name, selectedDate, selectedDate1]);
  const current = new Date();

  // it returns a timestamp
  const prior = new Date().setDate(current.getDate() - 30);
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
  const onHandleName = (e) => {
    const { value } = e.target;
    setName(value);
  };
  var currentTime = new Date();
  var maxDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), -1);
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
  let GetMember = async () => {
    const config = {
      method: "GET",
      url: GET_USERS,
      headers: authHeader(),
      params: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            userRole: "Team Member",
          })
        ),
         flutterString: "",
      },
      // params:{
      //    teamId: getTeamID(),
      //       userRole: "Team Member",
      // }
    };
    try {
      // setLoading(true)
      const response = await API(config);
      let l = deCryptFun(response.data);

      const { status, data, count } = JSON.parse(l);
      // const { status, data, count } = response.data;
      if (status === "Success") {
        setNameData(data);
        // setLoading(false)
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
  useEffect(() => {
    GetMember();
  }, []);

  const headers = [
    { label: "Invoice Number", key: "invoiceNumber" },
    { label: "Supplier Name", key: "name" },
    { label: "Company", key: "supplierCompanyName" },
    { label: "Amount", key: "invoiceAmount" },
    { label: "Invoice Status", key: "status" },
  ];
  const getDownloadFileName = () => {
    return "MemeberReport";
  };
  let ResetFilter = () => {
    setDuration("");
    setSelecteDate("");
    setSelecteDate1("");
    setName("");
  };
  return (
    <Fragment>
      <Card body className="mt-3">
        <Row>
          <Col sm="6" md="4" lg="3">
            <FormGroup>
              <Label for="exampleEmail">Select one</Label>
              <Input type="select" name="select" id="exampleSelect">
                <option>Number of Approvals</option>
              </Input>
            </FormGroup>
          </Col>
          <Col sm="6" md="4" lg="3">
            <FormGroup>
              <Label for="exampleEmail">Select team member</Label>
              <Input
                type="select"
                name="name"
                id="name"
                onChange={onHandleName}
                value={name}
              >
                <option>Select</option>
                {nameData &&
                  nameData.map((record, i) => {
                    const { userId, firstName, lastName } = record;
                    return (
                      <option key={i} value={userId}>
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
                    renderCustomHeader={({
                      date,
                      changeYear,
                      changeMonth,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => (
                      <div
                        style={{
                          margin: 10,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                          {"<"}
                        </button>
                        <select
                          value={getYear(date)}
                          onChange={({ target: { value } }) => changeYear(value)}
                        >
                          {years.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
              
                        <select
                          value={months[getMonth(date)]}
                          onChange={({ target: { value } }) =>
                            changeMonth(months.indexOf(value))
                          }
                        >
                          {months.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
              
                        <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                          {">"}
                        </button>
                      </div>
                    )}
                  autoComplete="off"
                selected={selectedDate}
                minDate={duration === "Single Month" ? new Date(prior) : ""}
                maxDate={new Date()}
                name="createdToDate"
                id="createdToDate"
                onSelect={handleDateChange}
                placeholderText="From Date"
              />
            </FormGroup>
          </Col>
          <Col sm="6" md="4" lg="3">
            <FormGroup>
              <Label for="createdToDate">To date</Label>
              <DatePicker
              renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div
                  style={{
                    margin: 10,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                    {"<"}
                  </button>
                  <select
                    value={getYear(date)}
                    onChange={({ target: { value } }) => changeYear(value)}
                  >
                    {years.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
        
                  <select
                    value={months[getMonth(date)]}
                    onChange={({ target: { value } }) =>
                      changeMonth(months.indexOf(value))
                    }
                  >
                    {months.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
        
                  <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                    {">"}
                  </button>
                </div>
              )}
            autoComplete="off"
                selected={selectedDate1}
                minDate={duration === "Single Month" ? new Date(prior) : ""}
                maxDate={new Date()}
                name="createdToDate"
                id="createdToDate"
                onSelect={handleDateChange1}
                placeholderText="To Date"
              />
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

      <Card body className="mt-3">
        <CardTitle tag="h5" className="item-center">
          Number of Approvals by each team member
          {reportData && (
            <CSVLink
              className="ml-auto"
               key={recordsCsvData ? `csv_${recordsCsvData.length}`:""}
                  data={recordsCsvData}
              headers={headers}
              filename={`${getDownloadFileName()}.csv`}
              target="_blank"
            >
              <Button color="primary" size="sm"
               disabled={showexport===false}
               >
                Export
              </Button>
            </CSVLink>
          )}
        </CardTitle>
        <Table>
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Supplier Name</th>
              <th>Company</th>
              <th>Amount</th>
              <th>Invoice Status</th>
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
                } = record;
                return (
                  <tr key={index}>
                    <td>{invoiceNumber?invoiceNumber:"N/A"}</td>
                    <td>{name?name:"N/A"}</td>
                    <td>{supplierCompanyName? supplierCompanyName:"N/A"}</td>
                    <td>{invoiceAmount?invoiceAmount:"N/A"}</td>
                    <td>
                      <Badge color="primary">{status}</Badge>
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
        </div>
      </Card>
    </Fragment>
  );
}
