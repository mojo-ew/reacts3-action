import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
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
import { ROUNDED_INVOICES_URL, USER_EMAIL_LIST_URL } from "../common/url";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../redux/API";
import { debounce } from "underscore";
import moment from "moment";
import Pagination from "react-js-pagination";

export default function RoundedInvoices() {
  const [name, setName] = useState("");
  const [nameData, setNameData] = useState();
  const [duration, setDuration] = useState();
  const [selectedDate, setSelecteDate] = useState();
  const [selectedDate1, setSelecteDate1] = useState();
  const [roundedData, setRoundedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowperpage, setRowPerPage] = useState(10);
  const [currentpage, setCurrentPage] = useState(0);
  const [totalrecords, setTotalRecords] = useState(0);
  const [notRoundedAvg, setNotRoundedAvg] = useState(0);
  const [roundedAvg, setRoundedAvg] = useState(0);
  const [showAverage , setShowAvg] = useState(false);
  const onHandleName = (e) => {
    const { value } = e.target;
    setName(value);
  };

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
      //const { status, data, count } = response.data;
       let l = deCryptFun(response.data);
      const {  status, data, count } = JSON.parse(l);
      if (status === "Success") {
       // console.log("Supplierdata", data)
        setNameData(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
  };
  useEffect(() => {
    GetMember();
  }, []);

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
  const handleDateChange = (e) => {
   // console.log("startDateEEE", e)
    const d = e.getMonth();
   // console.log("startDateDDDD", d)
    const month = d + 1;
    setSelecteDate(e);
  };
  const handleDateChange1 = (e) => {
    // console.log("endDateEEE", e)
    const d = e.getMonth();
   // console.log("endDateDDDD", d)
    const month = d + 1;
    setSelecteDate1(e);
  };
  let ResetFilter = () => {
    setDuration("");
    setSelecteDate("");
    setSelecteDate1("");
    setName("");
    setShowAvg(false);
  };

  const getAllRoundedAmount = async (
    name,
    selectedDate,
    selectedDate1,
    currentpage,
    invoicetotalCount
 ) => {
   //console.log("name", name, "selectedDate", selectedDate, "selectedDate1", selectedDate1, "currentpage", currentpage, "invoicetotalCount", invoicetotalCount)
    
    setLoading(true);
    const rconfig = {
      method: "GET",
      url: ROUNDED_INVOICES_URL,
      headers: authHeader(),
      params: {
        // teamId: getTeamID(),
        // supplierEmail: name,
        // offset: currentpage,
        // count: rowperpage,
        // fromDate: selectedDate ? moment(selectedDate).format("YYYY-MM-DD") : "",
        // toDate: selectedDate1 ? moment(selectedDate1).format("YYYY-MM-DD") : "",
      webString: enCryptFun(
          JSON.stringify({
             teamId: getTeamID(),
        supplierEmail: name,
        //offset: currentpage,
        count: invoicetotalCount,
        fromDate: selectedDate ? moment(selectedDate).format("YYYY/MM/DD") : "",
        toDate: selectedDate1 ? moment(selectedDate1).format("YYYY/MM/DD") : "",
          })
        ),
       flutterString: "",
      },
    };
    try {
      const response = await API(rconfig);
    
    //  const { status, data, invoiceCount } = response.data;
let l = deCryptFun(response.data);
      const { status, data, invoiceCount } = JSON.parse(l);
      if (status == "Success") {
       let notrounded = data.filter(el=> {return el.isRoundedAmount == 0})
      // console.log("notroundedcount", notrounded.length)
      
      let totalnotrounded = notrounded.length
      //console.log((totalnotrounded/invoiceCount)*100)
      let notroundedavg = ((totalnotrounded/invoiceCount)*100).toFixed()
      setNotRoundedAvg(notroundedavg)
      let rounded = data.filter(el => {return el.isRoundedAmount == 1})
      let totalrounded = rounded.length
     // console.log((totalrounded/invoiceCount)*100)
      let roundedavg = ((totalrounded/invoiceCount)*100).toFixed()
      //console.log("totalCount", invoiceCount,"rounded",totalrounded, "notRounded", totalnotrounded, "rounded avg", roundedavg, "notrounded avg", notroundedavg)
      setRoundedAvg(roundedavg)
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setShowAvg(true);
    }
  };


  const getRoundedAmount = async (
    name,
    selectedDate,
    selectedDate1,
    currentpage,
    rowperpage
  ) => {
    // console.log("name", name, "selectedDate", selectedDate ? moment(selectedDate).format("MM/DD/YYYY") : "", "selectedDate1", selectedDate1 ? moment(selectedDate1).format("MM/DD/YYYY") : "", "currentpage", currentpage)
    setLoading(true);
    const rconfig = {
      method: "GET",
      url: ROUNDED_INVOICES_URL,
      headers: authHeader(),
      params: {
        // teamId: getTeamID(),
        // supplierEmail: name,
        // offset: currentpage,
        // count: rowperpage,
        // fromDate: selectedDate ? moment(selectedDate).format("YYYY-MM-DD") : "",
        // toDate: selectedDate1 ? moment(selectedDate1).format("YYYY-MM-DD") : "",
      webString: enCryptFun(
          JSON.stringify({
             teamId: getTeamID(),
        supplierEmail: name,
        offset: currentpage,
        count: rowperpage,
        fromDate: selectedDate ? moment(selectedDate).format("YYYY-MM-DD") : "",
        toDate: selectedDate1 ? moment(selectedDate1).format("YYYY-MM-DD") : "",
          })
        ),
       flutterString: "",
      },
    };
    try {
      const response = await API(rconfig);
    
    //  const { status, data, invoiceCount } = response.data;
let l = deCryptFun(response.data);
      const { status, data, invoiceCount } = JSON.parse(l);
      if (status == "Success") {
        console.log("rounded data", data)
        setRoundedData(data);
        setTotalRecords(invoiceCount);
          if(data.length){
        getAllRoundedAmount( name,
    selectedDate,
    selectedDate1,
    currentpage,
    invoiceCount)
        } else{
           setRoundedAvg(0);
           setNotRoundedAvg(0);
        }
      }
     
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRoundedAmount();
  }, []);

  const delaySearch = useRef(
    debounce((name, selectedDate, selectedDate1, currentpage, rowperpage) =>
      getRoundedAmount(
        name,
        selectedDate,
        selectedDate1,
        currentpage,
        rowperpage
      )
    )
  ).current;

  useEffect(() => {
    delaySearch(name, selectedDate, selectedDate1, currentpage, rowperpage);
  }, [name, selectedDate, selectedDate1, currentpage, rowperpage]);
  

  const RowHandler = (e) => {
    setCurrentPage(0);
    setRowPerPage(e.target.value);
  };
  const onPageChange = (page) => {
    setCurrentPage(page - 1);
  };
  return (
    <Fragment>
      <Card body className="mt-3">
        <Row>
          <Col sm="6" md="4" lg="2">
            <FormGroup>
              <Label for="exampleEmail">Supplier</Label>
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

          <Col sm="6" md="4" lg="2">
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
          <Col sm="6" md="4" lg="2">
            <FormGroup>
              <Label for="createdFromDate">From date</Label>
              <DatePicker
                selected={selectedDate}
                minDate={duration === "Single Month" ? new Date(prior) : ""}
                maxDate={duration === "Single Month" ? new Date() : ""}
                name="createdToDate"
                id="createdToDate"
                onSelect={handleDateChange}
                placeholderText="Select"
              />
            </FormGroup>
          </Col>
          <Col sm="6" md="4" lg="2">
            <FormGroup>
              <Label for="createdToDate">To date</Label>
              <DatePicker
                selected={selectedDate1}
                minDate={duration === "Single Month" ? new Date(prior) : ""}
                maxDate={duration === "Single Month" ? new Date() : ""}
                name="createdToDate"
                id="createdToDate"
                onSelect={handleDateChange1}
                placeholderText="Select"
              />
            </FormGroup>
          </Col>
          <Col sm="6" md="4" lg="2">
            <Button color="primary" onClick={() => ResetFilter()} className="mt-4">
              Reset
            </Button>
          </Col>
        </Row>
        
       
       <Row className="mt-5">
         <Col md="3"> <p>Rounded InvoiceCount Average:</p> </Col> <Col md="2"><Badge color="success" pill>{roundedAvg}%</Badge></Col> <Col md="7"/>
          <Col md="3"><p>Not Rounded InvoiceCount Average:</p> </Col> <Col md="2"> <Badge color="danger" pill>{notRoundedAvg}%</Badge></Col> 
      </Row> 
       
      </Card>

      <Card body className="mt-3">
        <Table>
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Supplier</th>
              <th>Invoice Date</th>
              <th>Amount</th>
              <th>Rounded Invoice</th>
            </tr>
          </thead>
          <tbody>
            {loading ? null : roundedData.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <center>No Record Found !</center>
                </td>
              </tr>
            ) : (
              <>
                {roundedData &&
                  roundedData.map((record, index) => {
                    const {
                      invoiceId = "",
                      senderEmail = "",
                      invoiceAmount = "",
                      isRoundedAmount = "",
                      invoiceDate = "",
                      invoiceNumber="",
                      supplierName=""
                    } = record;
                  
                    return (
                      <tr key={`round_${index}`}>
                        <td>{invoiceNumber? invoiceNumber :"N/A"}</td>
                        <td>{supplierName? supplierName : "N/A"}</td>
                        <td>
                          {invoiceDate
                            ? moment.utc(invoiceDate).format("MM/DD/YYYY")
                            : ""}
                        </td>
                        <td>{invoiceAmount ? invoiceAmount : "N/A"}</td>
                        <td>{isRoundedAmount === 1 ? <Badge color="success" pill>Rounded</Badge> : <Badge color="danger" pill>Not Rounded</Badge>}</td>
                      </tr>
                    );
                  })}
              </>
            )}
          </tbody>
        </Table>
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
        </div>{" "}
      </Card>
    </Fragment>
  );
}
