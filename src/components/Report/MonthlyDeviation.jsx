import React, { useEffect, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import {
  Button,
  Card,
  Col,
  Collapse,
  FormGroup,
  Input,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  LineChart,
  Line,
} from "recharts";
import { debounce } from "underscore";
import { deCryptFun, enCryptFun, getTeamID } from "../common/functions";
import { authHeader } from "../common/mainfunctions";
import { MONTH_WISE_DEVIATION_URL } from "../common/url";
import API from "../redux/API";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addMonths } from 'date-fns';

export default function MonthlyDeviation(props) {
  const { deviationValue = "", nameData = [] } = props;
  const [sdev, setSdev] = useState(0);
  const [period, setPeriod] = useState();
  const [numMonth, setNum] = useState(1);
  const [endto, setNumend] = useState(12);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [startDateMonth, setStartDateMonth] = useState();
  const [startDateYear, setStartDateYear] = useState();
  const [startDateMonthly, setStartDateMonthly] = useState();
  const [monthlyFlag, setMonthlyFlag] = useState(false);
  const [radioBtnValue, setRadioBtnValue] = useState('');
  const [value, setValue] = useState("");
  const [data, setData] = useState([])
  const [filterId, setId] = useState(false);
  const [monthData, setMonthData] = useState({});

  const marks1 = [
 {
      value: 1,
      label: "Level 1",
    },
    {
      value: 2,
      label: "Level 2",
    },
    {
      value: 3,
      label: "Level 3",
    },
  ];
  const onHandleName = (e) => {
   // const { value } = e.target;
    setName(e.target.value);
     if(!value){
     setValue(1)
   }
  };

  const onValueChange = (e) => {
    
     setRadioBtnValue(e.target.value)
    if(e.target.value === "monthly"){
       setStartDateMonth(null)
    } else if(e.target.value === "quarterly"){
       setStartDateMonthly(null)
    }
    
  }

     const handleQuaterChange =(date) => {
      // console.log("quarter", new Date(date).getMonth())
           setStartDateMonth(date)
           selectMonth(new Date(date).getMonth())
    }

 const handleYearChange = (date) =>{
   //console.log("year", date)
       setStartDateYear(date)
       if(startDateMonth){
         setStartDateMonth(null)
       }
      // console.log("startDateYear", new Date(date).getFullYear())
     }

const handleMonthChange = (date) => {
  setStartDateMonthly(date)
  selectMonthly(new Date(date).getMonth())
}

 const ResetFilter = () => {
    //setFilter({ email: "", firstName: "", lastName: "" });
    setName("")
    setNum(1)
    setNumend(12)
    setStartDateMonth(null)
    setStartDateYear(null)
    //setStartDateMonthly(null)
    //setRadioBtnValue("")
    setValue("")
  };
  const selectMonth = (month) => {
    const tar = month;
   // console.log("target", tar)
   // setPeriod(month);
     if (tar == 0) {
      setNum(1);
      setNumend(3);
    } else if (tar == 3) {
      setNum(4);
      setNumend(6);
    } else if (tar == 6) {
      setNum(7);
      setNumend(9);
    } else if (tar == 9) {
      setNum(10);
      setNumend(12);
    }
  };

const selectMonthly = (monthData) => {
  setNum(monthData+1)
  setNumend("")
}

const handleChangeFun = (e) => {
    const { value } = e.target;
    setValue(value);
    //console.log(value)
    }


  const devChange = (e) => {
    setSdev(e.target.value);
  };
  useEffect(() => {
    setSdev(deviationValue);
  }, [deviationValue]);
  // const data = [
  //   {
  //     supplier: "",
  //     month: "Jan",
  //     mean: 0,
  //   },
  //   {
  //     supplier: name,
  //     month: "Jun",
  //     mean: sdev,
  //   },
  //   {
  //     supplier: "",
  //     month: "Dec",
  //     mean: 0,
  //   },
  // ];

  
  const filterToggle = () => {
    setId(!filterId);
  };
  
 //console.log("monthData outer", monthData)

  const getMonthDeviationAmount = async (startDateYear, numMonth, endto, name, value) => {
    console.log("on call", startDateYear, numMonth, endto, name, value, "getTeamId", getTeamID())
    const config = {
      method: "GET",
      url: MONTH_WISE_DEVIATION_URL,
      headers: authHeader(),
      params: {
        // teamId: getTeamID(),
        // monthFrom: parseInt(numMonth),
        // monthTo: parseInt(endto),
        // year: new Date().getFullYear(),
        // supplierEmail: name,
        webString: enCryptFun(
          JSON.stringify({
           teamId: getTeamID(),
        monthFrom: parseInt(numMonth),
        monthTo: parseInt(endto),
        year: startDateYear ? startDateYear.getFullYear() : new Date().getFullYear(),
        supplierEmail: name,
          })
        ),
        flutterString: "",
      },
    };
     setLoading(true);
    try {
      const response = await API(config);
     
      //const { status, data = "" } = response.data;
      let l = deCryptFun(response.data);
     // console.log("tryyyy", JSON.parse(l))
      const { status, data} = JSON.parse(l);
      console.log("json", JSON.parse(l))
      
      if (status == "success") {
        setMonthData(data);
        
        let level_1 = data.level_1 ;
        let level_2 = data.level_2 ;
        let level_3 = data.level_3 ;
        if (Object.values(data)) {
         // console.log("average", data[0].average)
         if(level_1 == 0 || level_2 == 0 || level_3 == 0){
 setSdev(0);
          setData([])
         } else{
          if (value == 1){
     
       setData([{
       supplier: "",
      mean: "",
    },
    {
       supplier: "",
      mean: "",
    },
    {
      supplier: level_1.substring(0, level_1.indexOf("t")),
      mean: "0",
    },
    
    {
      supplier: 0,
      mean: data.avarage,
    },
    
    {
      supplier: level_1.substring(level_1.indexOf("o")+1, level_1.length),
      mean: "0",
    },
    {
      supplier: "",
      mean: "",
    },
    {
       supplier: "",
      mean: "",
    }])
    }
    else if(value == 2){
    
        setData([
    {
       supplier: "",
      mean: "",
    },
    {
      supplier: level_2.substring(0, level_2.indexOf("t")),
      mean: "0",
    },
    
    {
      supplier: 0,
      mean:data.avarage,
    },
    
    {
      supplier: level_2.substring(level_2.indexOf("o")+1, level_2.length),
      mean: "0",
    },
    {
      supplier: "",
      mean: "",
    }
  ])
    }
    else if(value == 3){
     
        setData([
    {
      supplier: level_3.substring(0, level_3.indexOf("t")),
      mean: "0",
    },
    
    {
      supplier: 0,
      mean:data.avarage,
    },
    
    {
      supplier: level_3.substring(level_3.indexOf("o")+1, level_3.length),
      mean: "0",
    }
  ])
    }
        else {
          setSdev(0);
          setData([])
        }  
         // setSdev(data[0].avarage);
        } 
      }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const delaySearch = useRef(
    debounce((startDateYear, numMonth, endto, name, value) =>
      getMonthDeviationAmount(startDateYear, numMonth, endto, name, value)
    )
  ).current;

  useEffect(() => {
    delaySearch(startDateYear, numMonth, endto, name, value);
  }, [startDateYear, numMonth, endto, name, value]);

 
 
  return (
    <>
      <Row>
        <Col sm="6" md="4" lg="3">
          <FormGroup>
            <b>
              {" "}
              <span>Supplier </span>
            </b>
            <Input
              type="select"
              name="name"
              id="name"
              onChange={onHandleName}
              value={name}
            >
              <option>Select</option>
              <option value="jeyabaskaranm@apptomate.co">Jeya Baskaran</option>
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
            <b>
              <span>Deviation range</span>
            </b>
            
             <Input
              type="select"
             // name="name"
              id="standarddeviation"
             onChange={handleChangeFun}
              value={value}
            >
              <option value="select">Select</option>
              {
                marks1.map((record, i) => {
                  const { value,label } = record;
                  return (
                    <option key={i} value={value}>
                      {label}
                    </option>
                  );
                })}
            </Input>
          </FormGroup>
        </Col>
        <Col sm="6" md="4" lg="3">
          {/* <FormGroup>
            <b>
              <span>Select Month :</span>
            </b>
            <Input
              type="select"
              name="monthst"
              id="monthst"
              onChange={selectMonth}
              value={period}
            >
              {["Jan - Dec", "Jan - Apr", "May - Aug", "Sep - Dec"].map((i) => {
                return (
                  <option key={`monthst_${i}`} value={i}>
                    {i}
                  </option>
                );
              })}
            </Input>
          </FormGroup> */}
           <FormGroup>
            <b>
              <span>Year</span>
            </b>
          <DatePicker
          placeholderText="Select"
      selected={startDateYear}
      onChange={(date) => handleYearChange(date)}
      showYearPicker
      dateFormat="yyyy"
      //minDate={startDateMonth? startDateMonth : null}
      //maxDate={startDateMonth? startDateMonth : new Date()}
      maxDate = {new Date()}
    />
          </FormGroup>
        </Col>

         {/* {startDateYear &&<Col sm="6" md="4" lg="3">
         <FormGroup>
                                           <b>
              <span>Select Monthly/Quarterly</span>
            </b>
                                          <Input
                                            type="select"
                                            name="monthlyorquarterly"
                                            onChange={onValueChange}
                                            value={radioBtnValue}
                                          >
                                            <option> Select </option>
                                           <option value={'quarterly'}>
                                              Quarterly
                                            </option>
                                            <option value={'monthly'}>
                                              Monthly
                                            </option>
                                          </Input>
                                        </FormGroup>
              </Col>} */}

              {/* {radioBtnValue==="monthly" && <Col sm="6" md="4" lg="3">
 <FormGroup>
           <b>
              <span>Select Monthly</span>
            </b>
           <DatePicker
        selected={startDateMonthly}
        onChange={(date) => handleMonthChange(date)}
        //selectsStart
        // startDate={startDate}
        // endDate={endDate}
        dateFormat="MM/yyyy"
        showMonthYearPicker
      />
         </FormGroup>
                </Col>} */}
              {startDateYear &&<Col sm="6" md="4" lg="3">
                 <FormGroup>
            <b>
              <span>Select Quarter</span>
            </b>
         <DatePicker
      selected={startDateMonth}
      placeholderText="Select"
      onChange={(date) => handleQuaterChange(date)}
      dateFormat="yyyy, QQQ"
      showQuarterYearPicker
      minDate={startDateYear}
      maxDate={startDateYear && startDateYear.getFullYear() === new Date().getFullYear() ? startDateYear : addMonths(startDateYear, 11)}
     //maxDate = {startDateYear}
    />
          </FormGroup>
                </Col>}
     {/* {startDateYear && <Col sm="6" md="4" lg="3">
         <FormGroup>
            <b>
              <span>Select Quarter</span>
            </b>
         <DatePicker
      selected={startDateMonth}
      placeholderText="Select"
      onChange={(date) => handleQuaterChange(date)}
      dateFormat="yyyy, QQQ"
      showQuarterYearPicker
      minDate={startDateYear}
      maxDate={startDateYear.getFullYear() === new Date().getFullYear() ? startDateYear : addMonths(startDateYear, 11)}
    />
          </FormGroup>
        </Col> 
        
       
       
        }
        {
          startDateYear &&  <Col sm="6" md="4" lg="3">
         <FormGroup>
           <b>
              <span>Select Monthly</span>
            </b>
           <DatePicker
        selected={startDateMonthly}
        onChange={(date) => handleMonthChange(date)}
        //selectsStart
        // startDate={startDate}
        // endDate={endDate}
        dateFormat="MM/yyyy"
        showMonthYearPicker
      />
         </FormGroup>
        </Col>
        }
         */}
        <Col md="3">
                      <Button color="primary" onClick={() => ResetFilter()} className="mt-3">
                        Reset
                      </Button>
                    </Col>
      </Row>
      <FormGroup>
        <Row>
          <Col md="3">
            {/* <Button
              color="primary"
              className="filterBtn"
              onClick={filterToggle}
            >
              <FaFilter />
            </Button> */}
          </Col>
        </Row>
        <Collapse isOpen={filterId}>
          <Card className="filterCard">
            <Row>
              <Col md="4">
                <FormGroup>
                  <Input
                    type="text"
                    name=""
                    id="name"
                    placeholder=" Deviation Range"
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Input type="text" name="" id="name" placeholder="Supplier" />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Input
                    type="text"
                    name=""
                    id="name"
                    placeholder="Invoice Count"
                  />
                </FormGroup>
              </Col>
            </Row>
          </Card>
        </Collapse>
      </FormGroup>
      <br />
      <div>
        { loading ? <center> <Spinner color="primary" /> </center> : <Row>
          <Col md="6">
            {/* <center> {loading ? <Spinner color="primary" /> : ""}</center> */}
            { name ? 
           <Table hover responsive>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Standard Deviation</th>
                  <th>Invoice Received</th>
                </tr>
              </thead>
              <tbody>
                {loading ? null : Object.values(monthData).length != 0? (
                   <tr >
                            <td>{monthData.senderEmail}</td>
                            <td>{monthData.stdDeviationAmount}</td>
                            <td>{monthData.invoiceCount}</td>
                          </tr>
                 
                ) : (
                  <>
                   <tr>
                    <td colSpan={3}>
                      <center>No Record Found !</center>
                    </td>
                  </tr>
                    {/* {monthData &&
                      monthData.map((record, index) => {
                        const {
                          senderEmail = "",
                          stdDeviationAmount = "",
                          invoiceCount = "",
                        } = record;
                        return (
                         
                        );
                      })} */}
                  </>
                )}
              </tbody>
            </Table> : <center>Select Supplier to view records</center>}
          </Col>
          <Col md="6">
            {name ? Object.values(monthData).length!=0 ? data.length? <LineChart
              width={500}
              height={300}
              // data={devData}
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              {/* <XAxis dataKey="senderEmail"> */}
              <XAxis dataKey="supplier">
                <Label value="" offset={0} position="insideBottom" />
              </XAxis>
              <YAxis
                label={{
                  value: "Amount",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Line
                type="monotone"
                // dataKey="stdDeviationAmount"
                dataKey="mean"
                stroke="#fd7e14"
                fill="#fd7e14"
              />
            </LineChart> :<center><img src="http://siliconangle.com/files/2013/02/no-data.png" alt="nodata" height="150px" width="150px" className="mt-3" /></center>: <center><img src="http://siliconangle.com/files/2013/02/no-data.png" alt="nodata" height="150px" width="150px" className="mt-3" /></center> :  null}
          </Col>
        </Row>}
      </div>
      {/* <div>
        <center> {loading ? <Spinner color="primary" /> : ""}</center>
      </div> */}
    </>
  );
}
