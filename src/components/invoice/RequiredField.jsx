import React, { Fragment, useState, useEffect } from "react";
import {
  Container,
  Col,
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  Row,
  CustomInput,
  ListGroup,
  ListGroupItem,
  DropdownItem,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Table,
} from "reactstrap";
import Swal from "sweetalert2";
import { deCryptFun, enCryptFun, getEmail, getRole, getSenderEmail, getTeamID } from "../common/functions";
import {
  FORMAT_SETTING_URL,
  GET_CRONE_DETAILS,
  GET_EXPORTED_LIST,
  GET_FORMAT_SETTING_URL,
  GET_INSTANT_EXPORT,
  GET_INVOICE_FIELDS,
  GET_SUPPLIER_LIST_URL,
  GET_TEAMDETAILS_BY_ID,
  SAVE_CRON_DETAILS,
  UPDATE_CRON_DETAILS,
  UPDATE_INVOICE_FIELDS,
  UPDATE_TEAM,
} from "../common/url";
import classnames from "classnames";
import Sidebar from "../layout/Sidebar";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import CustomButtonLoader from "../common/CustomButtonLoader";
import { useFormik } from "formik";
import arrayMove from "array-move";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from "react-sortable-hoc";
import { TimePicker } from "antd";
import 'antd/dist/antd.css';
import moment from 'moment';
import { Link, useHistory } from "react-router-dom";
import GlcodeImport from "./GlcodeImport";
import GlCodeSettings from "./GlCodeSettings"

export default function RequiredField() {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fieldList, setFieldList] = useState([]);
  const [initialValue, setInitialValues] = useState({});
  const [initialValueLine, setInitialValuesLine] = useState({});
  const [invoiceLineList, setInvoiceLine] = useState([]);
  const [invoiceList, setInvoice] = useState([]);
  const [type, setType] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const [activeTab, setActiveTab] = useState("1");
 const [cronJobChoise, setCronJobChoise] = useState("");
 const [everyDayTime, setEveryDayTime] = useState("00:00");
 const [weekDay, setWeekDay] = useState(0)
 const [monthDay, setMonthDay] = useState(0)
 const [exportData, setExportData] = useState([])
const [editFlag, setEditFlag] = useState(false)
const [cronId, setCronId] = useState(0)
const [exceptionToEmail, setExceptionToEmail] = useState("")
const [timeChanged, setTimeChanged] = useState(false)
const [exportCheckList, setExportCheckList] = useState([])
const [supplierList, setSupplierList] = useState([]);
const history = useHistory();

  const format = 'h:mm a';

let cronScheduleType = [
  {label:"Monthly", value:"Monthly"},
  {label:"Weekly", value:"Weekly"},
  {label:"Everyday", value:"Daily"}
]

let weekDayData = [
  {label:"Monday", value:1},
{label:"Tuesday", value:2},
{label:"Wednesday", value:3},
{label:"Thursday", value:4},
{label:"Friday", value:5},
{label:"Saturday", value:6},
{label:"Sunday", value:7},
]

let MonthlyData = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]
const tabToggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const GetRequiredValues = async () => {
    setLoading(true);
    const config = {
      method: "GET",
      url: GET_INVOICE_FIELDS,
      params: { // teamId: getTeamID(),
      webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
           })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };
    try {
      const response = await API(config);
     // const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
      if (status === "Success") {
        data
          .filter((list) => list.isMandatory === 1)
          .map((e, i) => {
            setInitialValues((initialValue) => ({
              ...initialValue,
              [e.fieldListId]: true,
            }));
          });
        setExportCheckList(data)
        setFieldList(data);
        
       
        const data1 = data.filter((list) => list.moduleName == "Invoice Line");
        //console.log("invoiceLine Data", data1)
        // .map((e, i) => {
        //   setInitialValuesLine((initialValueLine) => ({
        //     ...initialValueLine,
        //     [e.fieldListId]: true,
        //   }));
        // });
        setInvoiceLine(data1);
        const data2 = data.filter((list) => list.moduleName == "Invoice");
        setInvoice(data2);
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // Swal.fire("Error", data.message);
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
      // Swal.fire("Error", v.message);
      console.log("Error", v.message)
      }
    } finally {
      setLoading(false);
    }
  };

  const getSupplierList = async () => {
    const config = {
      method: "GET",
      url: GET_SUPPLIER_LIST_URL,
      headers: authHeader(),
      params: {
        webString: enCryptFun(
          JSON.stringify({
            supplierId: getEmail(),
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      let decrpt_response = deCryptFun(response.data);
      const { data } = JSON.parse(decrpt_response);
     
      setSupplierList(
        data.map((el) => {
          let properties = { label: el.supplierName, value: el.supplierName };
          return properties;
        })
      );
    } catch (error) {
      console.error(error);
      if (error.response) {
        let { data } = error.response;

        let p = deCryptFun(data);
        let v = JSON.parse(p);
        // console.log("error data new",  v.message)
        //Swal.fire(getAlert("Error", v.message));
      }
    }
  };


const getTeamDetailsById = async () => {
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
        flutterString: ""
      },
    };
    try {
      const response = await API(config);
      // const { status, data: initialResponse = [] } = response.data;
      let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
     
      if (status === "Success") {
       // setTeamDetails(initialResponse[0]);
      setExceptionToEmail(data[0].supplierMaintenanceEmail)
      }
    } catch (error) {
      // Swal.fire("Error", error);
      if (error.response) {
        let { data } = error.response;
        let decryptErr = deCryptFun(data);
        let parsedErr = JSON.parse(decryptErr);
        // console.log("error data new", parsedErr.message);
        Swal.fire("Error", parsedErr.message);
      }
    } finally {
    }
  };

let updateTeamDetails = async (values) => {
    //let { teamId, companyName, autoApproval, invoiceSenderEmail, companyLogo } =
  
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
            teamId:getTeamID(),
            supplierMaintenanceEmail:exceptionToEmail
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
        Swal.fire(getAlertToast("Success", "Added Successfully"));
       
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



const getCroneScheduleDetails = async() => {
    setLoading(true);
    const config = {
      method: "GET",
      url: GET_CRONE_DETAILS,
      params: { // teamId: getTeamID(),
      webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
           })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };
    try {
      const response = await API(config);
     // const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
      if (status === "success") {
     
      if (data){
        setEditFlag(true)
      let convert24Time = moment(data.exportTime, ["HH.mm"]).format("hh:mm a");
        setEveryDayTime(convert24Time)
        setMonthDay(data.exportedDay)
        setWeekDay(data.exportedDay)
        setCronJobChoise(data.exportType)
        setCronId(data.csvExportId)
      }
        }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // Swal.fire("Error", data.message);
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
}

const getExportedList = async() => {
 
    setLoading(true);
    const config = {
      method: "GET",
      url: GET_EXPORTED_LIST,
      params: { // teamId: getTeamID(),
      webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
           })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };
    try {
      const response = await API(config);
     // const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
     
      if (status === "success") {
    
      //setExportUrl(url)
     
      setExportData(data)
    
        }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // Swal.fire("Error", data.message);
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
}



  useEffect(() => {
    GetRequiredValues();
    getTeamDetailsById();
    getSupplierList();
  }, []);

  useEffect(()=>{
    getCroneScheduleDetails()
    getExportedList();
  },[])
  // const { handleSubmit, handleChange } = useFormik({
  //   initialValues: initialValue,
  //   enableReinitialize: true,
  //   onSubmit: (values) => {
  //     console.log("sub valu", values);
  //     let ids = Object.keys(values).filter((key) => values[key] === true);
  //     console.log("ids", ids);
  //     saveFormValues(ids.join(","));
  //   },
  // });
  const getdateFormatSetting = async () => {
    const configget = {
      method: "GET",
      url: GET_FORMAT_SETTING_URL,
      params: {
       // teamId: getTeamID(),
         webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
           
          })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };

    try {
      const response = await API(configget);
     // const { message, data } = response.data;
      let l = deCryptFun(response.data);
      const { message, data, count } = JSON.parse(l);
      if (message === "Success") {
        const { dateFormat = "" } = data;
        setType(dateFormat);
      }
    } catch (error) {
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    }
  };
  useEffect(() => {
    getdateFormatSetting(getTeamID());
  }, []);
  const dateFormatSetting = async () => {
    const configset = {
      method: "POST",
      url: FORMAT_SETTING_URL,
      data: {
        // teamId: getTeamID(),
        // dateFormat: type || "MM/dd/yyyy",
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
        dateFormat: type || "MM/dd/yyyy",
          })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };

    try {
      const response = await API(configset);
      //const { status } = response.data;
       let l = deCryptFun(response.data);
      const { status } = JSON.parse(l);
      if (status === "Success") {
      }
    } catch (error) {
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    }
  };
  const saveFormValues = async (values) => {
    const mergeResult = [].concat(invoiceList, invoiceLineList);
    
    setSubmitLoading(true);
    dateFormatSetting();
    const config = {
      method: "POST",
      url: UPDATE_INVOICE_FIELDS,
      data: {
       // teamId: getTeamID(),
        // fieldListId: values,
       // fieldList: mergeResult,
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
         fieldList: mergeResult,
          })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };

    try {
      const response = await API(config);
      //const { status, data } = response.data;
       let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
      if (status === "Success") {
        console.error(data);
        Swal.fire(getAlertToast("success", "Updated Successfully"));
        GetRequiredValues()
      }
    } catch (error) {
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    } finally {
      setSubmitLoading(false);
    }

    // else {
    //             Swal.fire("Error", "Select Atleast One field");

    // }
  };
  // const handleChange1 = (e) => {
  //   console.log("val", e, e.target.value);
  //   handleChange(e);
  // };

const handleCronJobChange = (e) => {
const { value } = e.target;
console.log("cron", value)
setCronJobChoise(value)
}

const handleTimeChange = (time,timeString) => {
setTimeChanged(true)
 console.log("time",time,"timeString", timeString)
setEveryDayTime(timeString)
}





const handleWeekDayChange = (e) => {
  const { value } = e.target;
console.log("weekday", value)
setWeekDay(value)
}

const handleMonthDayChange = (e) => {
   const { value } = e.target;
console.log("Monthday", value)
setMonthDay(value)
}

  const handleChangeFormat = (e) => {
    setType(e.target.value);
  };

const saveCronDetailsApi = async() =>{
  setEditFlag(true)
  console.log("cronType", cronJobChoise, "everydayTime", everyDayTime, "monthday", monthDay, "weekday", weekDay)
  let convertedTime = moment(everyDayTime, 'hh:mm A').format('HH:mm')
  console.log("convertedTime", convertedTime)
   const config = {
      method: "POST",
      url: SAVE_CRON_DETAILS,
      data:{
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
         exportType: cronJobChoise,
         exportedDay: cronJobChoise === "Monthly" ? monthDay : cronJobChoise === "Weekly" ? weekDay : 0,
         exportTime: convertedTime
          })
        ),
        flutterString: "",
      } ,
      headers: authHeader(),
    };
    console.log("data payload", {
            teamId: getTeamID(),
         exportType: cronJobChoise,
         exportedDay:cronJobChoise === "Monthly" ? monthDay : cronJobChoise === "Weekly" ? weekDay : 0,
         exportTime: convertedTime
          })
console.log("before try config", config)
    try {
      const response = await API(config);
      //const { status, data } = response.data;
       let l = deCryptFun(response.data);
      const { id,status, data} = JSON.parse(l);
      console.log("jsonParsed", JSON.parse(l))
      if (status === "Success") {
       // setEditFlag(true)
       setCronId(id)
        console.error(data);
       Swal.fire(getAlertToast("success", "Saved Successfully"));
       getCroneScheduleDetails()
       getExportedList()
      }
    } catch (error) {
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    } finally {
      setSubmitLoading(false);
      setTimeChanged(false)
    }
}

const saveCronDetails = (e) => {
  // const cronType = e.currentTarget.dataset.type;
  // console.log("save", cronType)
  let checkExport = exportCheckList.filter(el=> {
  return el.isExport === 1
});
if(checkExport.length > 0){
  saveCronDetailsApi()
}
else{
   Swal.fire({
      title: "Please select fields to export !",
      icon: "Info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ok",
    }).then((result) => {
      if (result.isConfirmed) {
        setActiveTab("1")
      }
    })
}
  saveCronDetailsApi()
}


const updateCronDetails = async() => {
  console.log("cronId", cronId)
//  console.log("editFlag", editFlag)
   console.log("cronType", cronJobChoise, "everydayTime", everyDayTime, "monthday", monthDay, "weekday", weekDay)
   let convertedTime = moment(everyDayTime, 'hh:mm A').format('HH:mm')
   const config = {
      method: "PUT",
      url: UPDATE_CRON_DETAILS,
      data: {
        webString: enCryptFun(
          JSON.stringify({
            csvExportId: cronId,
            teamId: getTeamID(),
         exportType: cronJobChoise,
         exportedDay:cronJobChoise === "Monthly" ? monthDay : cronJobChoise === "Weekly" ? weekDay : 0,
         exportTime:convertedTime,
          })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };
    console.log("data payload on update", {
            teamId: getTeamID(),
            csvExportId: cronId,
         exportType: cronJobChoise,
         exportedDay:cronJobChoise === "Monthly" ? monthDay : cronJobChoise === "Weekly" ? weekDay : 0,
         exportTime:convertedTime,
          } )
console.log("before try config", config)
    try {
      const response = await API(config);
      //const { status, data } = response.data;
       let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
      console.log("jsonParsed", JSON.parse(l))
      if (status === "success") {
        console.error(data);
        Swal.fire(getAlertToast("success", "Updated Successfully"));
          getCroneScheduleDetails()
          getExportedList()
         
      }
    } catch (error) {
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    } finally {
      setSubmitLoading(false);
      setTimeChanged(false)
    }
}

const updateCron = (e) => {
  // const cronJobChoise = e.currentTarget.dataset.type;
  // console.log("save", cronType)
 let checkExport = exportCheckList.filter(el=> {
  return el.isExport === 1
});
console.log("checkExport", checkExport, "length", checkExport.length)
if(checkExport.length > 0){
   Swal.fire({
      title:  "Do you want to change the fields to export?" ,
      icon: "Info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText:"Update"
    }).then((result) => {
      if (result.isConfirmed) {
      setActiveTab("1")
      }
      else if(result.isDenied){
      updateCronDetails()
      }
    })
}
else{
   Swal.fire({
      title: "Please select fields to export !",
      icon: "Info",
      // showCancelButton: true,
      // confirmButtonColor: "#3085d6",
      // cancelButtonColor: "#d33",
      confirmButtonText: "ok",
    }).then((result) => {
      if (result.isConfirmed) {
        setActiveTab("1")
      }
    })
}
 //updateCronDetails()

}

  const getInstantReport = async () => {
    console.log("senderEmail", getSenderEmail())
    const configset = {
      method: "GET",
      url:GET_INSTANT_EXPORT,
      params: {
        // teamId: getTeamID(),
        // dateFormat: type || "MM/dd/yyyy",
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
        subscriberEmail: getSenderEmail(),
          })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };

    try {
      const response = await API(configset);
      //const { status } = response.data;
       let l = deCryptFun(response.data);
      const { status,message } = JSON.parse(l);
      console.log("JSON Parsed", JSON.parse(l))
      if (status === "Success" && message=='Report generated successfully') {
      getExportedList()
      }
      else{
        Swal.fire( message)
      }
    } catch (error) {
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    }
  };



const exportDataDownload = (e) => {
  console.log("Report to download")
}

  const handleChange = (e) => {
    fieldList.find(
      (record) => parseInt(record.fieldListId) === parseInt(e.target.value)
    ).isVisible = e.target.checked ? 1 : 0;

    setFieldList([...fieldList]);
  };
  const handleChange1 = (e) => {
    fieldList.find(
      (record) => parseInt(record.fieldListId) === parseInt(e.target.value)
    ).isRequired = e.target.checked ? 1 : 0;

    setFieldList([...fieldList]);
  };

  const handleChange2 = (e) => {
    fieldList.find(
      (record) => parseInt(record.fieldListId) === parseInt(e.target.value)
    ).isExport = e.target.checked ? 1 : 0;

    setFieldList([...fieldList]);
  };

  const SortableContainer = sortableContainer(({ children }) => {
    return <div>{children}</div>;
  });

  const changeSortOrder = async ({ oldIndex, newIndex }) => {
    let fieldArray = invoiceLineList;

    fieldArray = arrayMove(fieldArray, oldIndex, newIndex);
    const len = invoiceList.length;
    fieldArray.forEach((element, index) => (element.fieldOrder = index + 1));

    setInvoiceLine([...fieldArray]);
  };
  const handleSortStart = ({ node }) => {
    const tds = document.getElementsByClassName("SortableHelper")[0].childNodes;
    node.childNodes.forEach(
      (node, idx) => (tds[idx].style.width = `${node.offsetWidth}px`)
    );
  };
  const changeSortOrderInvoice = async ({ oldIndex, newIndex }) => {
    let fieldArray = invoiceList;

    fieldArray = arrayMove(fieldArray, oldIndex, newIndex);
    fieldArray.forEach((element, index) => (element.fieldOrder = index + 1));

    setInvoice([...fieldArray]);
  };
  const handleSortStartInvoice = ({ node }) => {
    const tds = document.getElementsByClassName("SortableHelper")[0].childNodes;
    node.childNodes.forEach(
      (node, idx) => (tds[idx].style.width = `${node.offsetWidth}px`)
    );
  };

 // console.log("editFlag", editFlag)

const sortData = (exportData) =>{
  exportData.sort((a,b) => new moment(b.exportedDate).format('YYYYMMDD') - new moment(a.exportedDate).format('YYYYMMDD'))
}

  const handleChangeEmail = (e) => {
    console.log("emailTo", e.target.value)
    setExceptionToEmail(e.target.value)
  }

  const DragHandle = sortableHandle(() => (
    <span style={{ cursor: "grab", marginRight: "10px" }}>
      <i className="fas fa-arrows-alt" />
    </span>
  ));
  const SortableItem = sortableElement(({ data }) => {
    const {
      isMandatory,
      fieldName,
      fieldListId,
      isVisible,
      isRequired,
      fieldOrder,
      isActive,
      isExport,
    } = data;
    return (
      <div className="form-check">
        <Label>{fieldName}</Label>
        <div className="switch-sec">
          <CustomInput
            className="mr-3"
            type="switch"
            id={`exampleCustomSwitch_${fieldName}`}
            name={fieldListId}
            // label="show"
            defaultChecked={isVisible === 1 ? true : false}
            onChange={handleChange}
            value={fieldListId}
          />
          {isVisible == 1 ? (
            <CustomInput
              type="switch"
              id={`exampleCustomSwitch_line${fieldName}`}
              name={fieldListId}
              // label="Required"
              defaultChecked={isRequired === 1 ? true : false}
              onChange={handleChange1}
              value={fieldListId}
              style={{borderRight: "1px solid rgba(107, 107, 107, 0.5)"}}
            />
          ) : (
            ""
          )}
          {isVisible == 1 ? (
            <CustomInput
              type="switch"
              id={`exampleCustomSwitch_line_new${fieldName}`}
              name={fieldListId}
              // label="Required"
              defaultChecked={isExport === 1 ? true : false}
              onChange={handleChange2}
              value={fieldListId}
              style={{borderLeft: "1px #6b6b6b80 solid", paddingLeft:"3rem"}}
            />
          ) : (
            ""
          )}
        </div>
      </div>
    );
  });
  const InvoiceSortableItem = sortableElement(({ data }) => {
    const {
      isMandatory,
      fieldName,
      fieldListId,
      isVisible,
      isRequired,
      fieldOrder,
      isActive,
      dataFormat,
      isExport,
    } = data;
    return (
      <div className="form-check">
        <Label>{fieldName}</Label>
        <div className="switch-sec"
        >
          <CustomInput
            className="mr-3"
            type="switch"
            id={`exampleCustomSwitch_${fieldName}`}
            name={fieldListId}
            // label="show"
            defaultChecked={isVisible === 1 ? true : false}
            onChange={handleChange}
            value={fieldListId}
            
          />
          {isVisible == 1 ? (
            <CustomInput
            className="mr-3"
              type="switch"
              id={`exampleCustomSwitch_line${fieldName}`}
              name={fieldListId}
              // label="Required"
              defaultChecked={isRequired === 1 ? true : false}
              onChange={handleChange1}
              value={fieldListId}
              //style={{borderRight: "1px solid rgba(107, 107, 107, 0.5)"}}
            />
          ) : (
            ""
          )}
          {isVisible == 1 ? (
            <CustomInput
              type="switch"
              id={`exampleCustomSwitch_line_new${fieldName}`}
              name={fieldListId}
              // label="Required"
              defaultChecked={isExport === 1 ? true : false}
              onChange={handleChange2}
              value={fieldListId}
              
            />
          ) : (
            ""
          )}

          
        </div>

        {/* {fieldName == "Invoice Date" || fieldName == "Due Date" ? (
          <>
            <div
              className="switch-sec"
              style={{ color: "#007bff", fontSize: "10px" }}
            >
              <Input
                type="radio"
                name={fieldListId}
                id={`exampledate_invoice${fieldName}`}
                checked={dataFormat === "MM/DD/yyyy" ? true : false}
                onChange={onMMRadioChange}
                value={fieldListId}
              />
              MM/DD
            </div>
            <div
              className="switch-sec"
              style={{ color: "#007bff", fontSize: "10px" }}
            >
              <Input
                type="radio"
                name={fieldListId}
                id={`exampledate_due${fieldName}`}
                checked={dataFormat === "DD/MM/yyyy" ? true : false}
                onChange={onDDRadioChange}
                value={fieldListId}
              />
              DD/MM
            </div>
          </>
        ) : (
          ""
        )} */}
      </div>
    );
  });

  return (
    <Fragment>
      <div className="wrapper">
        <Sidebar />
        <div className="page-content-wrapper">
          <Nav tabs className="mt-3 mb-4 ml-4 mr-4">
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "1" })}
                          onClick={() => {
                            tabToggle("1");
                          }}
                        >
                         Mandatory Invoice Data
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "2" })}
                          onClick={() => {
                            tabToggle("2");
                          }}
                        >
                        Export Invoice Data
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "3" })}
                          onClick={() => {
                            tabToggle("3");
                          }}
                        >
                        GL Code
                        </NavLink>
                      </NavItem>
                    </Nav>
                    <Container fluid={true}>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId="1">
                     
            {/* <div className="page-title">
              <h3>Mandatory Invoice Data</h3>
            </div> */}

            <div className="cus-row">
              <Col md="12">
                <Card>
                  <CardBody>
                    {loading ? (
                      <Spinner color="primary" />
                    ) : (
                      <Form
                        className="requiredForm"
                        //   form="true"
                        //   onSubmit={handleSubmit}
                      >
                        <>
                          <Row>
                            <Col md="4" sm="12">
                              <Label className="lableTitle">
                                Invoice{" "}
                                <div className="right-head">
                                  <span>Visibility</span>
                                  <span style={{ borderRight: "1px #6b6b6b80 solid"}}> Mandatory </span>
                                  <span>Export</span>
                                 
                                </div>
                              </Label>
                              <SortableContainer
                                onSortEnd={changeSortOrderInvoice}
                                // useDragHandle
                                distance={20}
                                helperClass="SortableHelper"
                                onSortStart={handleSortStartInvoice}
                                disableAutoscroll="false"
                              >
                                {invoiceList
                                  // fieldList
                                  //   .filter((i) => i.moduleName == "Invoice Line")
                                  .map((data, index) => (
                                    <InvoiceSortableItem
                                      key={`item-${index}`}
                                      index={index}
                                      data={data}
                                    />
                                  ))}
                              </SortableContainer>
                              {/* <Label>Date Format</Label>
                              <br />
                              <div className="invoice-radio-bg">
                                <Input
                                  type="radio"
                                  name="type"
                                  id="po"
                                  checked={type === "MM/DD/yyyy" ? true : false}
                                  onChange={onMMRadioChange}
                                />
                                MM/DD/YYYY
                              </div>
                              <div className="invoice-radio-bg">
                                <Input
                                  type="radio"
                                  name="type"
                                  id="po"
                                  checked={type === "DD/MM/yyyy" ? true : false}
                                  onChange={onDDRadioChange}
                                />
                                DD/MM/YYYY
                              </div> */}
                            </Col>
                            <Col md="4" sm="12">
                              <Label className="lableTitle">
                                Invoice Line Item{" "}
                                <div className="right-head">
                                  <span>Visibility</span>
                                  <span style={{ borderRight: "1px #6b6b6b80 solid"}}>Mandatory </span>
                                  <span>Export</span>
                                  
                                </div>
                              </Label>
                              <SortableContainer
                                onSortEnd={changeSortOrder}
                                // useDragHandle
                                distance={20}
                                helperClass="SortableHelper"
                                onSortStart={handleSortStart}
                                disableAutoscroll="false"
                              >
                                {invoiceLineList
                                  // fieldList
                                  //   .filter((i) => i.moduleName == "Invoice Line")
                                  .map((data, index) => (
                                    <SortableItem
                                      key={`item-${index}`}
                                      index={index}
                                      data={data}
                                    />
                                  ))}
                              </SortableContainer>
                            </Col>
                            <Col md="4" sm="12">
                              <Row>
                              <Label className="lableTitle">
                                Preferred Date Format
                              </Label>
                              <Label>Select Date Format</Label>
                              <Input
                                type="select"
                                onChange={handleChangeFormat}
                                value={type}
                                name="email"
                                id="email"
                                placeholder="To Email"
                              >
                                <option value="" disabled>
                                  Please select
                                </option>
                                <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                                <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                              </Input>
                              </Row>
                              { getRole() === "Admin" && <Row className="mt-3">
                                <Label className="lableTitle">
                                Supplier Maintenance Email
                              </Label>
                               <FormGroup>
          <Label for="exampleEmail">Email</Label>
          <Input type="email" name="email" id="exampleEmail" onChange={(e)=>handleChangeEmail(e)} value={exceptionToEmail} placeholder="Email" />
        </FormGroup>
                              <Button type="button" color="primary" onClick={()=>{updateTeamDetails()}}>Add</Button>
                              </Row>}
                            </Col>
                          </Row>

                          <Button
                            color="primary"
                            type="button"
                            onClick={saveFormValues}
                          >
                            {submitLoading && <CustomButtonLoader />}
                            Update
                          </Button>
                        </>
                      </Form>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </div>
         
          </TabPane>
             <TabPane tabId="2">
                <div className="cus-row">
              <Col md="12">
                <Card>
                  <CardBody>
                <Row>
                  <Col md="3" lg="2" sm="6"><p style={{fontSize:"medium", fontWeight:"bold"}}>Export Data Schedule</p></Col>
                  <Col md="6" lg="8"></Col>
                  <Col md="3" lg="2" sm="5" className="">
               <Button
                                    color="primary"
                                    size="sm"
                                    className="actionBtn"
                                    onClick={() =>getInstantReport()}
                                    //data-type={cronJobChoise === "Monthly" ? "Monthly" : cronJobChoise === ""}
                                   // disabled={timeChanged===false}
                                    //disabled = {true}
                                    style={{padding: "10px 10px 10px 10px"}}
                                  >
                                 Generate Now
                                  </Button>
             </Col>
                  </Row>  
                
            
            <Row>
             <Col sm="6" md="3" lg="2">
            <FormGroup>
              <Label for="exampleEmail">
                Detailed Report
              </Label>
              <Input
                type="select"
                name="status"
                id="exampleSelect"
                value={cronJobChoise}
                onChange={handleCronJobChange}
              >
                <option value={""}>Select</option>
                {cronScheduleType.map((el,i) => {
                  return (
                    <option key={i} value={el.value}>
                      {el.label}
                    </option>
                  );
                })}

                {/* <option>Extraction rate</option> */}
              </Input>
            </FormGroup>
          </Col>
           {cronJobChoise === "Daily" && <Col sm="6" md="3" lg="2">
             {/* <FormGroup>
          <Label for="exampleTime">Time</Label>
          <Input type="time" name="time" value={everyDayTime} id="exampleTime" placeholder="Time" onChange={handleTimeChange}/>
        </FormGroup> */}
        <FormGroup>
           <Label for="exampleTime">Time</Label>
           <div>
           <TimePicker 
           //defaultValue={moment(everyDayTime, format)}  
          defaultValue={moment(everyDayTime, format)}
          needsConfirmation={false}
         // value={everyDayTime}
          use12Hours
          placeholder ="Select"
           onChange={(time,timeString) => {handleTimeChange(time,timeString)}} 
           format={format} 
           size="large"
           style={{borderRadius:"24px", paddingTop:"8px", paddingBottom:"8px"}}
           />
           </div>
        </FormGroup>
        
             </Col>}
           
             {
               cronJobChoise === "Weekly" &&  
            <Col sm="6" md="3" lg="2">
             <FormGroup>
          <Label for="exampleTime">Day</Label>
         <Input
                type="select"
                name="status"
                id="exampleSelect"
                value={weekDay}
                onChange={handleWeekDayChange}
              >
                <option value={""}>Select</option>
                {weekDayData.map((el) => {
                  return (
                    <option key={el.value} value={el.value}>
                      {el.label}
                    </option>
                  );
                })}

                {/* <option>Extraction rate</option> */}
              </Input>
        </FormGroup>
             </Col>
             }
             {
               cronJobChoise === "Weekly" && 
               <Col sm="6" md="3" lg="2"><FormGroup>
           <Label for="exampleTime">Time</Label>
           <div>
           <TimePicker 
           //defaultValue={moment(everyDayTime, format)}  
          defaultValue={moment(everyDayTime, format)}
         // value={everyDayTime}
          use12Hours
          placeholder ="Select"
           onChange={(time,timeString) => {handleTimeChange(time,timeString)}} 
           format={format} 
           size="large"
           style={{borderRadius:"24px", paddingTop:"8px", paddingBottom:"8px"}}

           />
           </div>
        </FormGroup>
        </Col>
             }

               
             {
               cronJobChoise === "Monthly" &&  
            <Col sm="6" md="3" lg="2">
             <FormGroup>
          <Label for="exampleTime">Date</Label>
         <Input
                type="select"
                name="monthDay"
                id="exampleSelect"
                value={monthDay}
                onChange={handleMonthDayChange}
              >
                <option value={""}>Select</option>
                {MonthlyData.map((i) => {
                  return (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  );
                })}

                {/* <option>Extraction rate</option> */}
              </Input>
        </FormGroup>
             </Col>
             }{
               cronJobChoise === "Monthly" && 
               <Col sm="6" md="3" lg="2">
               <FormGroup>
           <Label for="exampleTime">Time</Label>
           <div>
           <TimePicker 
           //defaultValue={moment(everyDayTime, format)}  
          defaultValue={moment(everyDayTime, format)}
         // value={everyDayTime}
          use12Hours
          placeholder ="Select"
           onChange={(time,timeString) => {handleTimeChange(time,timeString)}} 
           format={format} 
           size="large"
           style={{borderRadius:"24px", paddingTop:"8px", paddingBottom:"8px"}}

           />
           </div>
        </FormGroup>
        </Col>
             }
              <Col sm="6" md="3" lg="2" className="mt-4" >
             <FormGroup className="mt-2">
          <Button
                                    color="primary"
                                    size="sm"
                                    className="actionBtn"
                                    onClick={(e) =>editFlag===true ? updateCron(e) : saveCronDetails(e)}
                                    //data-type={cronJobChoise === "Monthly" ? "Monthly" : cronJobChoise === ""}
                                    disabled={timeChanged===false}
                                    //disabled = {true}
                                    style={{padding: "10px 10px 10px 10px"}}
                                  >
                                  {editFlag ? "Update" : "Save"}
                                  </Button>
        </FormGroup>
             </Col>
             
             
            </Row>
            
              {editFlag === true && <div className="mt-4">
                <p style={{fontSize:"medium", fontWeight:"bold"}}>Exported Data List</p>
              </div>}

             {editFlag === true && <Row>
              
        <Table hover>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Time Stamp</th>
            <th>Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {exportData.length === 0 && <tr>
                <td colSpan={3}>
                  <center>No Record Found !</center>
                </td>
              </tr>}
          {exportData.length>0 && exportData.map((el,i)=>{
          const {
                      fileName = "",
                      exportedTime = "",
                      url = "",
                      exportedDate = "",
                      exportType = "",
                    } = el;
         
     
      let convert12Time = moment(exportedTime, 'HH:mm').format('hh:mm A')
          return(<tr key ={fileName}>
           <td>{i+1}</td>
            {/* <td>{`${datestamp}(${convert12Time})`}</td> */}
            <td>{exportedDate} <br/> {convert12Time}</td>
            <td>{exportType}</td>
            <td><Button
                                    color="primary"
                                    size="sm"
                                    className="actionBtn"
                                    //onClick={(e) => exportDataDownload(e)}
                                    //data-id={invoiceId}
                                    //disabled={status != "Initializing"}
                                    //disabled = {true}
                                    style={{padding: "5px 6px 5px 10px"}}
                                  >
                                   <a style={{color:"white"}} href={url}>Download</a>
                                  </Button></td>
          </tr>);
        })}
        
          
        </tbody>
      </Table>
              </Row>}
            
            </CardBody>
            </Card>
            </Col>
            </div>
             </TabPane>
             <TabPane tabId="3">
               {/* <GlcodeImport supplierList ={supplierList}>
                 
               </GlcodeImport> */}
               <GlCodeSettings supplierList ={supplierList}>
                 </GlCodeSettings>

             </TabPane>
              </TabContent>
              </Container>
        </div>
      </div>
    </Fragment>
  );
}
