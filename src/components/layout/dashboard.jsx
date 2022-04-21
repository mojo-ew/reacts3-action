import React, { Fragment, useEffect, useState } from "react";
import {
  Container,
  Card,
  Button,
  CardHeader,
  CardBody,
  Spinner,
  Row,
  Col,
  Input,
} from "reactstrap";
import Sidebar from "./Sidebar";
import emptyImg from "../../images/empty.png";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Legend,
  ResponsiveContainer,
  Label,
  Text,
  LabelList,
} from "recharts";
import { Link } from "react-router-dom";
import {
  INVOICE_ROUTE,
  UPLOAD_INVOICE_ROUTE,
} from "../../constants/RoutePaths";
import { BsFileEarmarkPlus, BsFileEarmarkMinus } from "react-icons/bs";
import { authHeader } from "../common/mainfunctions";
import API from "../redux/API";
import { DASHBOARD, GET_USER_BY_ID } from "../common/url";
import Swal from "sweetalert2";
import {
  getFullYear,
  getTeamID,
  getInvoiceCount,
  getRole,
  getEmail,
  getUserId,
  enCryptFun,
  deCryptFun,
} from "../common/functions";
import { grey } from "@material-ui/core/colors";
import noDataImg from "../../images/nodata.png";
const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

export default function Dashboard() {
  const [pieChartData, setPieChartData] = useState([]);
  const [data, setdata] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [Pending, setPending] = useState("");
  const [Approved, setApproved] = useState("");
  const [AutoApproved, setAutoApproved] = useState("");
  const [SpinnerToggle, setSpinnerToggle] = useState(false);
  const [year, setYear] = useState(parseInt(getFullYear()));
  const [filterFlag, setFlag] = useState(false);
  let currentYear = parseInt(getFullYear());

  useEffect(() => {
    GetDashBoard(year);
  }, [year]);

  let GetDashBoard = async (year) => {
    setSpinnerToggle(true);
    let amount;
    const configuser = {
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
      const response = await API(configuser);
    //  const { status, data } = response.data;
       let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
      if (status === "Success") {
        const { approvalAmountTo } = data[0];

        amount = approvalAmountTo;
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
    const config = {
      method: "GET",
      url: DASHBOARD,
      headers: authHeader(),
      params: {
        // teamId: getRole() === "Admin" || amount === -1 ? getTeamID() : 0,
        // year: year,
        // senderEmail: getRole() === "Supplier" ? getEmail() : "",
        // userId: getRole() === "Team Member" && amount !== -1 ? getUserId() : 0,
     webString: enCryptFun(
          JSON.stringify({
            teamId: getRole() === "Admin" || amount === -1 ? getTeamID() : 0,
        year: year,
        senderEmail: getRole() === "Supplier" ? getEmail() : "",
        userId: getRole() === "Team Member" && amount !== -1 ? getUserId() : 0,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      // const {
      //   status,
      //   approved,
      //   invoiceStatusCount,
      //   pending,
      //   invoiceMonthVSAmount,
      //   autoApproved,
      //   MonthvsAmount,
      // } = response.data;
      let l = deCryptFun(response.data);
      const { status,
        approved,
        invoiceStatusCount,
        pending,
        invoiceMonthVSAmount,
        autoApproved,
        MonthvsAmount,} = JSON.parse(l);
      if (status === "Success") {
        setPending(pending);
        setApproved(approved);
        setAutoApproved(autoApproved);
        const PieData = invoiceStatusCount.map((i) => ({
          name: i.statusName,
          value: i.totalCount,
        }));
        setPieChartData(PieData);
        setdata(MonthvsAmount);
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
      setSpinnerToggle(false);
    }
  };

  const onYearChange = (e) => {
    setYear(e.target.value);
    setFlag(true);
  };

  const toggle = () => setIsOpen(!isOpen);

  const CustomTooltip = ({ active, payload, value }) => {
    if (active) {
      const { name, value } = payload[0];
      return (
        <div className="custom-tooltip" style={{ backgroundColor: grey }}>
          <p className="label">{`${name} : ${value}`}</p>
        </div>
      );
    }

    return null;
  };
  const checkdata = [
    {
      name: "Page A",
      uv: 10,
      pv: 100,
      amt: 1000,
    },
    {
      name: "Page B",
      uv: 1020,
      pv: 12547789812899,
      amt: 2000,
    },
    {
      name: "Page C",
      uv: 125477898128997,
      pv: 300.25,
      amt: 3000,
    },
  ];
  return (
    <Fragment>
      {/* navbar */}
      <div className="wrapper">
        <Sidebar />
        <div className="page-content-wrapper">
          <Container
            fluid={true}
            style={
              getInvoiceCount() !== 0
                ? { display: "block" }
                : { display: "none" }
            }
          >
            {/* <div className="welcomeText">
             <h4> Welcome <span>{ getRole() } !</span></h4>
              </div> */}

            <div className="page-title">
              <h3>Dashboard</h3>
            </div>

            <Row className="mb-5">
              <Col md="4">
                <Link
                  to={INVOICE_ROUTE}
                  to={{
                    pathname: INVOICE_ROUTE,
                    state: { selectedStatus: "Approved" },
                  }}
                >
                  <Card body className="dash-count">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32.121"
                      height="42.828"
                      viewBox="0 0 32.121 42.828"
                    >
                      <path
                        id="file-check"
                        d="M30.945,8.193,23.928,1.176A4.015,4.015,0,0,0,21.089,0H4.015A4.015,4.015,0,0,0,0,4.015v34.8a4.015,4.015,0,0,0,4.015,4.015H28.106a4.015,4.015,0,0,0,4.015-4.015V11.032a4.015,4.015,0,0,0-1.176-2.839Zm-1.893,1.893a1.329,1.329,0,0,1,.351.622H21.414V2.718a1.328,1.328,0,0,1,.622.351Zm-.946,30.066H4.015a1.338,1.338,0,0,1-1.338-1.338V4.015A1.338,1.338,0,0,1,4.015,2.677H18.737v8.7a2.008,2.008,0,0,0,2.008,2.008h8.7V38.813A1.338,1.338,0,0,1,28.106,40.151ZM25.223,22.506,13.948,33.69a1,1,0,0,1-1.419,0L6.894,28.036a1,1,0,0,1,0-1.421l.711-.709a1,1,0,0,1,1.421,0l4.219,4.231L23.1,20.366a1,1,0,0,1,1.421.006l.707.713a1,1,0,0,1-.006,1.421Z"
                        fill="#ff7619"
                      />
                    </svg>
                    Approved Invoices
                    {SpinnerToggle && !filterFlag ? (
                      <Spinner className="m-auto" />
                    ) : (
                      <span>{Approved}</span>
                    )}
                  </Card>
                </Link>
              </Col>
              <Col md="4" className="dash-count">
                <Link
                  to={INVOICE_ROUTE}
                  to={{
                    pathname: INVOICE_ROUTE,
                    state: { selectedStatus: "Auto Approved" },
                  }}
                >
                  <Card body>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32.121"
                      height="42.828"
                      viewBox="0 0 32.121 42.828"
                    >
                      <g
                        id="Group_38"
                        data-name="Group 38"
                        transform="translate(-702 -166)"
                      >
                        <path
                          id="file-check"
                          d="M30.945,8.193,23.928,1.176A4.015,4.015,0,0,0,21.089,0H4.015A4.015,4.015,0,0,0,0,4.015v34.8a4.015,4.015,0,0,0,4.015,4.015H28.106a4.015,4.015,0,0,0,4.015-4.015V11.032a4.015,4.015,0,0,0-1.176-2.839Zm-1.893,1.893a1.329,1.329,0,0,1,.351.622H21.414V2.718a1.328,1.328,0,0,1,.622.351Zm-.946,30.066H4.015a1.338,1.338,0,0,1-1.338-1.338V4.015A1.338,1.338,0,0,1,4.015,2.677H18.737v8.7a2.008,2.008,0,0,0,2.008,2.008h8.7V38.813A1.338,1.338,0,0,1,28.106,40.151Z"
                          transform="translate(702 166)"
                          fill="#ff7619"
                        />
                        <path
                          id="Icon_material-autorenew"
                          data-name="Icon material-autorenew"
                          d="M13.256,6.035V8.756l3.628-3.628L13.256,1.5V4.221A7.243,7.243,0,0,0,7.125,15.34l1.324-1.324a5.324,5.324,0,0,1-.635-2.539A5.446,5.446,0,0,1,13.256,6.035Zm6.131,1.578L18.062,8.937a5.433,5.433,0,0,1-4.807,7.981V14.2L9.628,17.825l3.628,3.628V18.732A7.243,7.243,0,0,0,19.387,7.613Z"
                          transform="translate(704.733 180.414)"
                          fill="#ff7619"
                        />
                      </g>
                    </svg>
                    Auto Approved Invoices
                    {SpinnerToggle && !filterFlag ? (
                      <Spinner className="m-auto" />
                    ) : (
                      <span>{AutoApproved}</span>
                    )}
                  </Card>
                </Link>
              </Col>
              <Col md="4" className="dash-count">
                <Link
                  to={INVOICE_ROUTE}
                  to={{
                    pathname: INVOICE_ROUTE,
                    state: { selectedStatus: "Pending" },
                  }}
                >
                  <Card body>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="31.994"
                      height="42.667"
                      viewBox="0 0 31.994 42.667"
                    >
                      <g
                        id="Group_37"
                        data-name="Group 37"
                        transform="translate(-702 -166)"
                      >
                        <path
                          id="file-minus"
                          d="M30.819,8.065l-6.99-6.99A4,4,0,0,0,21-.1H4A4.013,4.013,0,0,0,0,3.908v34.66a4,4,0,0,0,4,4h24a4,4,0,0,0,4-4V10.9A4.018,4.018,0,0,0,30.819,8.065ZM28.936,9.956a1.311,1.311,0,0,1,.35.617H21.329V2.616a1.311,1.311,0,0,1,.617.35ZM27.995,39.9H4a1.333,1.333,0,0,1-1.333-1.333V3.908A1.333,1.333,0,0,1,4,2.574H18.663v8.665a1.995,1.995,0,0,0,2,2h8.665V38.567A1.333,1.333,0,0,1,27.995,39.9Z"
                          transform="translate(702 166.1)"
                          fill="#ff7619"
                        />
                        <g
                          id="Icon_ionic-md-time"
                          data-name="Icon ionic-md-time"
                          transform="translate(706.743 180.333)"
                        >
                          <path
                            id="Path_306"
                            data-name="Path 306"
                            d="M11.25,3.375a7.883,7.883,0,1,0,7.89,7.883A7.88,7.88,0,0,0,11.25,3.375Zm.008,14.189a6.306,6.306,0,1,1,6.306-6.306A6.306,6.306,0,0,1,11.258,17.564Z"
                            fill="#ff7619"
                          />
                          <path
                            id="Path_307"
                            data-name="Path 307"
                            d="M17.72,10.688H16.538v4.73L20.676,17.9l.591-.97-3.547-2.1Z"
                            transform="translate(-6.068 -3.371)"
                            fill="#ff7619"
                          />
                        </g>
                      </g>
                    </svg>
                    Pending Invoices
                    {SpinnerToggle && !filterFlag ? (
                      <Spinner className="m-auto" />
                    ) : (
                      <span>{Pending}</span>
                    )}
                  </Card>
                </Link>
              </Col>
            </Row>
            <Row>
              <Col md="8">
                <Card>
                  <CardHeader>
                    {" "}
                    Yearly Invoice Stats - {year}
                    <Input
                      className="ChartSelectBtn"
                      type="select"
                      name="year"
                      id="year"
                      onChange={onYearChange}
                      value={year}
                    >
                      {[
                        currentYear,
                        currentYear - 1,
                        currentYear - 2,
                        currentYear - 3,
                        currentYear - 4,
                      ].map((y) => {
                        return (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        );
                      })}
                    </Input>
                  </CardHeader>
                  <CardBody>
                    <ResponsiveContainer width={"100%"} height={300}>
                      {SpinnerToggle ? (
                        <Spinner className="m-auto d-block" />
                      ) : data.length > 0 ? (
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="Month" />
                          <YAxis
                            // domain={[0, 99999999]}
                            allowDataOverflow={true}
                            padding={{ top: 12 }}
                            orientation="left"
                            label={
                              <Text
                                x={0}
                                y={0}
                                dx={13}
                                dy={210}
                                offset={0}
                                angle={-90}
                              >
                                Amount ($)
                              </Text>
                            }
                          />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Approved" fill="#0088FE" />
                          <Bar dataKey="Auto Approved" fill="#00C49F" />
                          <Bar dataKey="Pending" fill="#FF8042" />
                          {/* <Bar dataKey="uv" fill="#0088FE" />
                          <Bar dataKey="pv" fill="#00C49F" />
                          <Bar dataKey="amt" fill="#FF8042" /> */}
                        </BarChart>
                      ) : (
                        <img src={noDataImg} className="tableNodata-img" />
                      )}
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              </Col>
              <Col md="4">
                <Card>
                  <CardHeader>Invoice Analysis Overall</CardHeader>
                  <CardBody>
                    <ResponsiveContainer width={"100%"} height={300}>
                      {SpinnerToggle && !filterFlag ? (
                        <Spinner className="m-auto d-block" />
                      ) : pieChartData.length > 0 ? (
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="40%"
                            innerRadius={80}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          {/* <Tooltip content={<CustomTooltip />} /> */}
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      ) : (
                        <img src={noDataImg} className="tableNodata-img" />
                      )}
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
          <Container
            style={
              getInvoiceCount() === 0
                ? { display: "block" }
                : { display: "none" }
            }
          >
            <div className="empty-invoice">
              <img src={emptyImg} />
              <h4>You do not have any invoices yet!</h4>
              <p>Upload your first invoice from here</p>
              <div className="upload-option">
                <Link to={UPLOAD_INVOICE_ROUTE}>
                  <Button color="primary" block>
                    NEW INVOICE
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </Fragment>
  );
}
