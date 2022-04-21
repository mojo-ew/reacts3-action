import React, { useEffect, useRef, useState } from "react";
import { Button, Col, FormGroup, Input, Row, Spinner, Table } from "reactstrap";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import { deCryptFun, enCryptFun, getTeamID } from "../common/functions";
import { authHeader } from "../common/mainfunctions";
import { STANDARD_DEVIATION_URL } from "../common/url";
import API from "../redux/API";
import Slider from "@material-ui/core/Slider";
import { debounce } from "underscore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addMonths } from 'date-fns';

export default function StandardDeviation(props) {
  const { nameData = [] } = props;
   const [startDateMonth, setStartDateMonth] = useState();
   const [startDateYear, setStartDateYear] = useState();
   const [devData, setDevData] = useState(0);
   const [totalData, setTotalData] = useState([]);
 // const [supp, setSupp] = useState("N/A");
 const [supp, setSupp] = useState("");
  const [value, setValue] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

//console.log("data to graph", data)


  const onHandleName = (e) => {
    setName(e.target.value);
    setSupp(e.target.value);
   //console.log("value on name", value)
   if(!value){
     setValue(1)
   }
  };

  //get amount

  const getDeviationAmount = async (supp,value) => {

    const config = {
      method: "GET",
      url: STANDARD_DEVIATION_URL,
      headers: authHeader(),
      params: {
        // teamId: getTeamID(),
        // isRange: value,
        // supplierEmail: supp,
      webString: enCryptFun(
          JSON.stringify({
           teamId: getTeamID(),
          isRange: "",
        supplierEmail: supp,
          })
        ),
         flutterString: "",
      },
    }
  
    try {
        setLoading(true)
      const response = await API(config);
     // const { status, data } = response.data;
        let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
      if (status == "Success") {
        //console.log("standard deviation data", data, level_1, level_2, level_3)
       console.log(data)
       setTotalData(data)
       let level_1 = data[0].level_1 ;
       let level_2 = data[0].level_2 ;
       let level_3 = data[0].level_3;

       
       if (value == 1){
       // console.log("called value1", value)
       
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
      supplier: supp,
      mean:data && data[0].avarage,
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
       } else if(value == 2){
        
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
      supplier: supp,
      mean:data && data[0].avarage,
    },
    
    {
      supplier:level_2.substring(level_2.indexOf("o")+1, level_2.length),
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
      supplier: supp,
      mean:data && data[0].avarage,
    },
    
    {
      supplier:level_3.substring(level_3.indexOf("o")+1, level_3.length),
      mean: "0",
    }
  ])
       } else {
           setData([])
       }
       //console.log("exammmm", example2)
      //  const result = data.filter((rec) => parseInt(rec.isRange) === value);
      //       if (result.length > 0) {
      //       setDevData(result[0].avarage)
      //     } else {
      //      setDevData(0);
      //     }
        }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false)
    }
  };

  const delaySearch = useRef(
    debounce((supp,value) => getDeviationAmount(supp,value))
  ).current;

  useEffect(() => {
    delaySearch(supp,value);
  }, [supp,value]);
  function valuetext(value) {
    return value;
  }
  const marks1 = [
    // {
    //   value: -3,
    //   label: "-3",
    // },
    // {
    //   value: -2,
    //   label: "-2",
    // },
    // {
    //   value: -1,
    //   label: "-1",
    // },
    // {
    //   value: 0,
    //   label: "0",
    // },
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
  // const handleChangeFun = (e, newValue) => {
  //   setValue(newValue);
  // };

  const handleChangeFun = (e) => {
    const { value } = e.target;
    setValue(value);
    }

 const handleQuaterChange =(date) => {
           setStartDateMonth(date)
        
    }

 const handleYearChange = (date) =>{
       setStartDateYear(date)
      
 }

 const ResetFilter = () => {
   setValue("");
   setSupp("");
   setName("")
 }

 
  return (
    <>
      <Row>
        <Col md="3">
 <FormGroup>
            <b>
              <span>Supplier</span>
            </b>
            <Input
              type="select"
              name="name"
              id="name"
              onChange={onHandleName}
              value={name}
            >
              <option value="">Select</option>
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
        <Col md="3">
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
         <Col md="3">
                      <Button color="primary" onClick={() => ResetFilter()} className="mt-3">
                        Reset
                      </Button>
                    </Col>
        {/* <Col md="3">
           <FormGroup>
            <b>
              <span>Year</span>
            </b>
          <DatePicker
     selected={startDateYear}
      placeholderText="Select"
      onChange={(date) => handleYearChange(date)}
      showYearPicker
      dateFormat="yyyy"
       minDate={startDateMonth? startDateMonth : null}
      maxDate={startDateMonth? startDateMonth : new Date()}
    />
          </FormGroup>
        </Col>

        {startDateYear && <Col md="3">
         <FormGroup>
            <b>
              <span>Quater month</span>
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
        </Col>} */}
      </Row>
      <br />
      {loading ? <center> <Spinner color="primary" /></center>
  :     <Row>
       <Col md="6">
         <Table hover responsive>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Standard Deviation</th>
                  <th>Invoice Received</th>
                </tr>
              </thead>
              <tbody>
                {loading ? null : totalData.length > 0 ? (
                  <>
                  {
                      totalData.map((record, index) => {
                        const {
                          senderEmail = "",
                          stdDeviationAmount = "",
                          invoiceCount = "",
                        } = record;
                        return (
                          <tr key={`month_${index}`}>
                            <td>{senderEmail}</td>
                            <td>{stdDeviationAmount}</td>
                            <td>{invoiceCount}</td>
                          </tr>
                        );
                      })}
                      </>
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <center>No Record Found !</center>
                    </td>
                  </tr>
                    
                
                )}
              </tbody>
            </Table>
       </Col>
       <Col md="6">
         <center>
        {supp ? totalData.length ? data.length ? ( <LineChart
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
              //value: "Invoice Amount",
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
        </LineChart>):<img src="http://siliconangle.com/files/2013/02/no-data.png" alt="nodata" height="150px" width="150px" className="mt-3" />: <img src="http://siliconangle.com/files/2013/02/no-data.png" alt="nodata" height="150px" width="150px" className="mt-3" /> : "Select supplier to view deviation chart !"}
     </center>
     </Col>
     </Row>  
     }
    </>
  );
}
