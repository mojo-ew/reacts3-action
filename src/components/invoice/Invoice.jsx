import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Button,
  FormGroup,
  Badge,
  Card,
  Table,
  Input,
  Collapse,
  NavLink,
  Nav,
  NavItem,
  TabContent,
  TabPane
} from "reactstrap";
import classnames from "classnames";
import Sidebar from "../layout/Sidebar";
import {
  INVOICE_DETAILS_NEW_ROUTE,
  INVOICE_DETAILS_ROUTE,
} from "../../constants/RoutePaths";
import {
  deCryptFun,
  enCryptFun,
  getEmail,
  getRole,
  getSenderEmail,
  getTeamID,
  getUserId,
} from "../common/functions";
import { ACCESS_S3_FILE, DELETE_INVOICE_URL, GET_INVOICE, GET_INVOICE_DETAILS, 
  GET_USER_BY_ID, RESUBMIT_INITIALIZED_INVOICE_URL, 
  REUPLOAD_URL, UPDATE_INVOICE,GET_INVOICE_EXCEPTION_LIST } from "../common/url";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import { debounce, initial } from "underscore";
import Pagination from "react-js-pagination";
import Swal from "sweetalert2";
import { RiArrowUpDownLine } from "react-icons/ri";
import { FaEdit, FaFilter, FaTrash } from "react-icons/fa";
import {
  statusStyleConfig,
  validationStatusConfig,
} from "../../constants/HelperConstant";
import {
  getSorting,
  stableSort,
  Name,
} from "../../components/common/functions";
import { useSelector } from "react-redux";
import Axios from "axios";


const BUCKET_NAME = "inbox-ezcloud123";
var folderName = "dashboard_uploads";

export default function Invoice(props) {
  var fileDownload = require("js-file-download");
  const [currentSort, setcurrentSort] = useState(null);
  const [Sort, setSort] = useState(false);
  const [search, setSearch] = useState("");
  const [Data, setData] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [supplierCompanyName, setSupplierCompanyName] = useState("");
  const [name, setName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [totalrecords, setTotalRecords] = useState(0);
  const [invoiceStatus, setinvoiceStatus] = useState("");
  const [rowperpage, setRowPerPage] = useState(10);
  const [currentpage, setCurrentPage] = useState(0);
  const [InvoiceEmail, setInvoiceEmail] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterId, setId] = useState(false);
  const [clickMessage, setClickMessage] = useState("")
  const [resubmitted,setResubmitted] = useState(false)
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [exceptionInvoiceList,setExceptionInvoiceList]=useState([]);


  useEffect(() => {
    if (props.location.state) {
      let { selectedStatus } = props.location.state;
      setinvoiceStatus(selectedStatus);
      setId(true);
    }
  }, []);
  let Get = async (
    search,
    invoiceAmount,
    InvoiceEmail,
    invoiceStatus,
    companyName,
    currentpage,
    rowperpage,
    name,
    senderEmail,
    supplierCompanyName,
    receiverEmail,
  ) => {
   
    let addtionalFilters = {};

    // const { approvalAmountTo } = JSON.parse(
    //   localStorage.getItem("AUTH_USER_DETAILS")
    // );
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
      //const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        const { approvalAmountTo } = data[0];
        console.log("approvalAmountTo", approvalAmountTo)
        localStorage.setItem("APPROVAL_AMOUNT", approvalAmountTo);
        amount = approvalAmountTo;
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
    }

    if (getRole() === "Team Member" && amount != -1) {
      addtionalFilters = {
        // approvalAmountTo,
        approvalAmountTo: amount,
        userId: getUserId(),

      };
    }


    const config = {
      method: "GET",
      url: GET_INVOICE,
      headers: authHeader(),
      params: {
        // teamId: getRole() != "Supplier" ? getTeamID() : 0,
        // senderEmail: getRole() == "Supplier" ? getSenderEmail() : senderEmail,
        webString: enCryptFun(
          JSON.stringify({
           
            teamId: getRole() != "Supplier" ? getTeamID() : 0,
        senderEmail: getRole() == "Supplier" ? getSenderEmail() : senderEmail,
           offset: currentpage,
        invoiceNumber: search,
        invoiceAmount: invoiceAmount,
        companyName: companyName,
        supplierCompanyName: supplierCompanyName,
        count: rowperpage,
        email: InvoiceEmail,
        status: invoiceStatus,
        name: name,
        receiverEmail: receiverEmail,
        ...addtionalFilters,
          })
        ),
        flutterString: "",
        // supplierEmail: senderEmail,
        // offset: currentpage,
        // invoiceNumber: search,
        // invoiceAmount: invoiceAmount,
        // companyName: companyName,
        // supplierCompanyName: supplierCompanyName,
        // count: rowperpage,
        // email: InvoiceEmail,
        // status: invoiceStatus,
        // name: name,
        // receiverEmail: receiverEmail,
        // ...addtionalFilters,
      },
    };
    try {
      setLoading(true);
      const response = await API(config);
     // const { status, data, count } = response.data;
      let l = deCryptFun(response.data);
     
      const { status, data, count } = JSON.parse(l);
      if (status === "Success") {
        console.log("invoice List", data)
        setData(data);
        setTotalRecords(count);
        setLoading(false);
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
      setLoading(false);
    }
  };
const getinvoiceExceptionList= async()=>{
  const configuser = {
    method: "GET",
    url: GET_INVOICE_EXCEPTION_LIST,
    headers: authHeader(),
    params: {
      //userId: getUserId(),
      webString: enCryptFun(
        JSON.stringify({
          userId: getUserId()
         
        })
      ),
      flutterString: "",
    },
  };
  try {
    const response = await API(configuser);
    //const { status, data } = response.data;
    let l = deCryptFun(response.data);
    const { status, data } = JSON.parse(l);
    if(status=="Success"){
      setExceptionInvoiceList(data)
    }
  }
  catch(error){

  }
}


  const onPageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const onHandleChange = (e) => {
    setCurrentPage(0);

    const { value } = e.target;
    setSearch(value);
  };

  const onHandleAmount = (e) => {
    setCurrentPage(0);
    const { value } = e.target;
    setInvoiceAmount(value);
  };

  const onHandleCompanyName = (e) => {
    setCurrentPage(0);

    const { value } = e.target;
    setCompanyName(value);
  };

const onHandleSupplierCompanyName = (e) => {
 setCurrentPage(0);
  
    const { value } = e.target;
    
    setSupplierCompanyName(value);
}

  const onHandleName = (e) => {
    setCurrentPage(0);

    const { value } = e.target;
    setName(value);
  };
  const onHandleInvoiceEmail = (e) => {
    const { value } = e.target;
    setSenderEmail(value);
  };

   const onHandleReceiverEmail = (e) => {
    const { value } = e.target;
    setReceiverEmail(value);
  };


  const delaySearch = useRef(
    debounce(
      (
        search,
        InvoiceEmail,
        invoiceStatus,
        invoiceAmount,
        companyName,
        currentpage,
        rowperpage,
        name,
        senderEmail,
        supplierCompanyName,
        receiverEmail,
      ) =>
        Get(
          search,
          InvoiceEmail,
          invoiceStatus,
          invoiceAmount,
          companyName,
          currentpage,
          rowperpage,
          name,
          senderEmail,
          supplierCompanyName,
          receiverEmail,
        )
    )
  ).current;
useEffect(()=>{
  getinvoiceExceptionList()
},[])
  useEffect(() => {
    delaySearch(
      search,
      invoiceAmount,
      InvoiceEmail,
      invoiceStatus,
      companyName,
      currentpage,
      rowperpage,
      name,
      senderEmail,
      supplierCompanyName,
    receiverEmail,
    );
  }, [
    search,
    invoiceAmount,
    InvoiceEmail,
    invoiceStatus,
    companyName,
    currentpage,
    rowperpage,
    name,
    senderEmail,
    supplierCompanyName,
    receiverEmail,
  ]);

  const downloadPdf = async(file, invoiceNum) => {
console.log("fileName", file)
  if (file) {
      const config = {
        method: "POST",
        url: ACCESS_S3_FILE,
        data: { filePath: file,
        },
        headers: authHeader(),
      };
      try {
        const response = await API(config);
        const { status, url } = response.data;
      
        if (status === "Success") {
         // setDownloadURL(url);
         
            Axios.get(url, {
              responseType: "blob",
            }).then((res) => {
              fileDownload(res.data, invoiceNum!='N/A' ? `invoice${invoiceNum}.pdf` : `${Date.now()}.pdf`);
            });
         
          
        }
      } catch (error) {
        
         let errorObj = Object.assign({}, error);
            let { data } = errorObj.response;
            let { message } = data;
            Swal.fire(getAlertToast("Error", message));
      }
    } else {
      Swal.fire(getAlertToast("error", "No file is found!"));
    }
  }

  const RowHandler = (e) => {
    setCurrentPage(0);
    setRowPerPage(e.target.value);
  };

  let Amount = (totalAmount) => {
    if (totalAmount > 0) {
      return <>${totalAmount}</>;
    }
  };

  let onHandleStatus = (e) => {
    setCurrentPage(0);
    const { value } = e.target;
    setinvoiceStatus(value);
  };

  let ResetFilter = () => {
    setInvoiceEmail("");
    setinvoiceStatus("");
    setInvoiceAmount("");
    setCompanyName("");
    setSupplierCompanyName("");
    setName("");
    setSenderEmail("");
    setReceiverEmail("")
  };

  let Refresh = () => {
    setSearch("");
    Get(
      search,
      invoiceAmount,
      InvoiceEmail,
      invoiceStatus,
      companyName,
      currentpage,
      rowperpage,
      name,
      senderEmail,
      supplierCompanyName,
      receiverEmail,
    );
  };

  //Sorting
  const handleSortFunc = (event) => {
    const { sort_by } = event.currentTarget.dataset;
    const isAsc = orderBy === sort_by && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(sort_by);
  };
  const filterToggle = () => {
    setId(!filterId);
  };
  const chkFun = async (e) => {
    const invoiceId = e.currentTarget.dataset.id;
    console.log("invoiceId", invoiceId, "data", Data)
    let targetInvoice = Data.filter(el=> {return invoiceId == el.invoiceId})
    console.log("targetInvoice",targetInvoice)
    const status = e.currentTarget.dataset.status;
    if (status === "Initializing" ) {
     // Swal.fire(getAlert("error", "Invoice is being processed, please wait."));
      Swal.fire({
      title: "Invoice is being processed, Do you want to download the file?",
      icon: "Info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
      console.log("download",targetInvoice[0].filePath )
       downloadPdf(targetInvoice[0].filePath, targetInvoice[0].invoiceNumber)
      }
    })
    } 
    else if(status === "Reprocessing"){
      Swal.fire(getAlert("error", "Invoice is being processed, please wait."));
    }

    else if(status === "Specialist Exception"){
      console.log("exception raised")
    }
    else {
      // window.open(`${INVOICE_DETAILS_ROUTE}/${invoiceId}`);
      window.open(`${INVOICE_DETAILS_NEW_ROUTE}/${invoiceId}`);
    }
  };
  const [isDelete, setDelete] = useState(false);
  const onClickDeleteInvoice = async (e) => {
    e.stopPropagation();
    // setDelete(true);
    const deleteId = e.currentTarget.dataset.id;

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this invoice?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.value) {
        deleteInvoice(deleteId);
      }
    });
  };
  const deleteInvoice = async (deleteId) => {
    const deleteConfig = {
      method: "DELETE",
      url: DELETE_INVOICE_URL,
      headers: authHeader(),
      params: { //invoiceId: deleteId ,
      webString: enCryptFun(
          JSON.stringify({
            invoiceId: deleteId ,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(deleteConfig);
     
      //const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("success", data));
        Get();
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlertToast("error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    }
  };

const get_url_extension = ( url ) => {
    return url.split(/[#?]/)[0].split('.').pop().trim();
}



// let getInvoiceDetails = async(resubmitInvoiceId) =>{
//   console.log("fun call")
//     const config = {
//       method: "GET",
//       url: GET_INVOICE_DETAILS,
//       headers: authHeader(),
//       params: {
//        // invoiceId: invoiceID,
//           webString: enCryptFun(
//           JSON.stringify({
//             invoiceId: resubmitInvoiceId,
//           })
//         ),
//         flutterString: "",
//       },
//     };
//     setLoading(true)
//     try {
//       // window.setTimeout(
//       //   () => Swal.fire(getAlertToast("success", "Loading....")),
//       //   1000
//       // );
//       console.log("try")
//       const response = await API(config);
//       //const { status, data } = response.data;
//       let l = deCryptFun(response.data);
//       const { status, data} = JSON.parse(l);
//       console.log("parsed", JSON.parse(l) )
//       if (status === "Success") {
//         const initialData = data[0];
//         const { senderEmail, filePath, validationResponse } = initialData;
       
//          let invoicesuppliername =  JSON.parse(validationResponse).data[0].Suppliername
//          console.log("supplier Name", invoicesuppliername )
//       // let uniqueKey = `${Date.now()}`;
       
      
//     //let extension = FileExtensions[sourceType] || "pdf";

//     //let fileName = `${uniqueKey}.${extension}`;

//     //let documentName = folderName + "/" + fileName;

//       let emailId = getEmail()
//     const constructFileName = (emailId) => {
//     let uniqueKey = `${Date.now()}`;

//     let extension = get_url_extension( filePath ) || "pdf";

//     let fileName = `${uniqueKey}.${extension}`;

//     // Upload the file to S3
//     let documentName = folderName + "/" + fileName;

//     if (emailId) {
//       // Mail from folder isolation
//       let mail_from_username = emailId.split("@")[0];
//       let mail_from_fulldomain = emailId.split("@")[1];
//       let mail_from_folder = mail_from_fulldomain.split(".")[0];
//       folderName = `${mail_from_folder}/${mail_from_username}_${mail_from_folder}`;
//       documentName = `${mail_from_folder}/${mail_from_username}_${mail_from_folder}/${fileName}`;
//     }
//     console.log("documentName", documentName, "folderName", folderName, "fileName", fileName, "extension", extension)
//     return { documentName, folderName, fileName, extension };
//   };

//        if(initialData){
//        console.log("if initial")
//        const { documentName, folderName, fileName, extension } = constructFileName(emailId);
//          let  s3FileUrl =
//           "https://" + BUCKET_NAME + ".s3.amazonaws.com/" + documentName;
//          const config = {
//             method: "POST",
//             url: REUPLOAD_URL,
//            params: {
//             action: !resubmitInvoiceId ? "Insert" : "Update",
//             uploadBy: getRole() === "Supplier" ? "Supplier" : "Customer",
//             invoiceId: resubmitInvoiceId,
//             s3FileUrl: s3FileUrl,
//             fileType: extension,
//             emailId: getEmail(),
//             documentName: documentName,
//             fileName: fileName,
//             folderName: folderName,
//             supplierName: invoicesuppliername,
//             toEmailId: ""
//           },
//             headers: { ...authHeader(), "Content-Type": "application/json" },
//           };
//           try {
//             let response = await API(config);
//         const { success, errorMsg = "" } = response.data;
//         if (success) {
//           Swal.fire(getAlertToast("Success", "Resubmitted sucessfully."));
//           //history.push(INVOICE_ROUTE);
//         } else {
//           Swal.fire(getAlertToast("error", errorMsg));
//         }
//           } catch (error) {
//             let errorObj = Object.assign({}, error);
//             let { data } = errorObj.response;
//             let { message } = data;
//             Swal.fire(getAlertToast("Error", message));
     
//           }
//        }
//       }
//     } catch (error) {
//        if (error.response) {
//         let { data } = error.response
        
//        let p = deCryptFun(data);
//         let  v = JSON.parse(p)
//      Swal.fire("Error", v.message);
//     }
//     } finally {
//         setLoading(false);
//     }
// }
const updateInvoiceDetails = async(restructData,id) =>{
console.log( "on update", restructData )
  const config = {
      method: "PUT",
      url: UPDATE_INVOICE,
      headers: authHeader(),
     
      data: {
          webString: enCryptFun(
          JSON.stringify(restructData)
        ),
        flutterString: "",
      },
    };

  try {
      const response = await API(config);
     // const { status } = response.data;
       let l = deCryptFun(response.data);
      const { status} = JSON.parse(l);
      console.log("resubmitttt", JSON.parse(l))
      if (status === "Success") {
        if(response.status == 200){
      Swal.fire({
      title: "Are you sure?",
      text: "Thanks for resubmitting, your invoice is processing !",
      type: "warning",
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ok",
    }).then((result) => {
      if (result.value) {
        getResubmitInvoiceDetails(id)
      }
    });
    }
     
      }
    } catch (error) {
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    }
}


const getResubmitInvoiceDetails = async(id) => {
  const keyconfigure = {
      method: "POST",
      url: RESUBMIT_INITIALIZED_INVOICE_URL,
      headers: authHeader(),
      params: {
        invoiceId: id,
      },
    };
    try {
      const response = await API(keyconfigure);
      console.log("resubmit response", response)
    if(response.status == 200){
        Refresh()
    }
    } catch (error) {
      console.log("error", error);
    }
   
}


const getInvoiceByresubmitId = async(id) =>{
const config = {
      method: "GET",
      url: GET_INVOICE_DETAILS,
      headers: authHeader(),
      params: {
       // invoiceId: invoiceID,
          webString: enCryptFun(
          JSON.stringify({
            invoiceId: id,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
     
      //const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data} = JSON.parse(l);
      if (status === "Success") {
        console.log("invoicedatares", data)
        let now = new Date()
       let restructuredData = data[0]
         restructuredData.resubmitedDate = String(now)
       console.log("restructuredData", restructuredData)
        updateInvoiceDetails(restructuredData,id)
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlertToast("error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    }
}

const onClickResubmitInvoice = (e) => {
e.stopPropagation();
setResubmitted(true)
  const resubmitInvoiceId = e.currentTarget.dataset.id;
 getInvoiceByresubmitId(resubmitInvoiceId)
  
 console.log("resubmit", resubmitInvoiceId)
 //
 //getResubmitInvoiceDetails(resubmitInvoiceId)
}
const tabToggle = (tab) => {
  if (activeTab !== tab) setActiveTab(tab);
};

  return (
    <Fragment>
      {/* navbar */}
      <div className="wrapper">
        <Sidebar />
        <div className="page-content-wrapper">
          <Container fluid={true}>
            <div className="page-title">
              <h3>
                Invoices{" "}
                <Badge className="invoiceCount-Badge" color="info">
                  {totalrecords}
                </Badge>
              </h3>

              
              {/* <Link className="ml-2" to={UPLOAD_INVOICE_ROUTE}><Button color="primary">New Invoice</Button></Link> */}
              <div className="PageTopSearch">
                {/* <IoMdRefresh onClick={Refresh} color="primary" style={{  fontSize: 44, marginRight: 16, fill: '#2c7be5' }} /> */}
                <svg
                  onClick={Refresh}
                  className="mr-3"
                  xmlns="http://www.w3.org/2000/svg"
                  width="22.292"
                  height="22.319"
                  viewBox="0 0 22.292 22.319"
                >
                  <path
                    id="Icon_open-reload"
                    data-name="Icon open-reload"
                    d="M11.16,0a11.16,11.16,0,1,0,7.923,19.083l-2.009-2.009A8.376,8.376,0,1,1,11.132,2.79a8.116,8.116,0,0,1,5.831,2.539L13.922,8.37h8.37V0l-3.32,3.32A11.1,11.1,0,0,0,11.132,0Z"
                    fill="#ff7619"
                  />
                </svg>

                <Input
                  autoFocus
                  value={search}
                  onChange={onHandleChange}
                  placeholder="search Invoice Number..."
                />

                <Button
                  color="primary"
                  className="filterBtn"
                  onClick={filterToggle}
                >
                  <FaFilter />
                </Button>
              </div>
            </div>
            <Nav tabs className="mt-3 mb-4 ml-4 mr-4">
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "1" })}
                    onClick={() => {
                      tabToggle("1");
                    }}
                  >
                    Invoices
                  </NavLink>
                </NavItem>
                { getRole()=="Exception Handler" ?
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => {
                      tabToggle("2");
                    }}
                  >
                   Exceptions
                  </NavLink>
                </NavItem> :""
                }
              </Nav>
            <Collapse isOpen={filterId}>
              <Card className="invoice-filterCard">
                <Row>
                  {getRole() != "Supplier" ? (
                    <Col md="3">
                      <FormGroup>
                        <Input
                          type="text"
                          onChange={onHandleName}
                          value={name}
                          name=""
                          id="name"
                          placeholder="Supplier Name"
                        />
                      </FormGroup>
                    </Col>
                  ) : (
                    ""
                  )}
                    
                  { getRole() === "Supplier" ? ( <Col md="3">
                    <FormGroup>
                      <Input
                        type="text"
                        onChange={onHandleCompanyName}
                        value={companyName}
                        name=""
                        id="companyName"
                        placeholder="Company Name"
                      />
                    </FormGroup>
                  </Col> ) : (<Col md="3">
                    <FormGroup>
                      <Input
                        type="text"
                        onChange={onHandleSupplierCompanyName}
                        value={supplierCompanyName}
                        name=""
                        id="supplierCompanyName"
                        placeholder="Company Name"
                      />
                    </FormGroup>
                  </Col>) }

                  <Col md="3">
                    <FormGroup>
                      <Input
                        type="select"
                        onChange={onHandleStatus}
                        value={invoiceStatus}
                        name="status"
                        id="status"
                      >
                        <option value={""}>All</option>
                        {[
                          "Approved",
                          "Pending",
                          "Auto Approved",
                          // "Validation Failure",
                          "Rejected",
                          "Initializing",
                          "Reprocessing",
                        ].map((i) => {
                          return (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          );
                        })}
                      </Input>
                    </FormGroup>
                  </Col>
{getRole() !== "Supplier" ? (
                  <Col md="3">
                    <FormGroup>
                      <Input
                        type="text"
                        onChange={onHandleInvoiceEmail}
                        value={senderEmail}
                        name="email"
                        id="email"
                        placeholder="Email"
                      />
                    </FormGroup>
                  </Col> ) :( <Col md="3">
                    <FormGroup>
                      <Input
                        type="text"
                        onChange={onHandleReceiverEmail}
                        value={receiverEmail}
                        name="email"
                        id="email"
                        placeholder="Email"
                      />
                    </FormGroup>
                  </Col>)}
                 
                  <Col md="3" className={ getRole() === "Supplier" ? "": "mt-2" }>
                    <FormGroup>
                      <Input
                        type="number"
                        onChange={onHandleAmount}
                        value={invoiceAmount}
                        name="invoiceAmount"
                        id="invoiceAmount"
                        placeholder="Invoice Amount"
                        min="0"
                        onKeyDown={(e) =>
                          (e.key === "e" ||
                            e.key === "E" ||
                          //  e.key === "." ||
                            e.key === "-") &&
                          e.preventDefault()
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col md="2" className={"mt-2"}>
                    <Button color="primary" onClick={() => ResetFilter()}>
                      Reset
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Collapse>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  
            <Card body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>
                      Invoice Number
                      <Button
                        data-sort_by={"invoiceNumber"}
                        onClick={handleSortFunc}
                        className="sortBtn"
                        color="link"
                      >
                        <RiArrowUpDownLine color="primary" />
                      </Button>
                    </th>
                    {getRole() !== "Supplier" ? (
                      <Fragment>
                        <th>
                          Supplier Name
                          <Button
                            data-sort_by={"name"}
                            onClick={handleSortFunc}
                            className="sortBtn"
                            color="link"
                          >
                            <RiArrowUpDownLine color="primary" />
                          </Button>
                        </th>
                        <th>
                          Email
                          <Button
                            data-sort_by={"senderEmail"}
                            onClick={handleSortFunc}
                            className="sortBtn"
                            color="link"
                          >
                            <RiArrowUpDownLine color="primary" />
                          </Button>
                        </th>
                        <th>
                          Company
                          <Button
                            data-sort_by={"supplierCompanyName"}
                            onClick={handleSortFunc}
                            className="sortBtn"
                            color="link"
                          >
                            <RiArrowUpDownLine color="primary" />
                          </Button>
                        </th>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <th>
                          Email
                          <Button
                            data-sort_by={"receiverEmail"}
                            onClick={handleSortFunc}
                            className="sortBtn"
                            color="link"
                          >
                            <RiArrowUpDownLine color="primary" />
                          </Button>
                        </th>
                        <th>
                          Company
                          <Button
                            data-sort_by={"companyName"}
                            onClick={handleSortFunc}
                            className="sortBtn"
                            color="link"
                          >
                            <RiArrowUpDownLine color="primary" />
                          </Button>
                        </th>
                      </Fragment>
                    )}
                    <th>
                      Amount
                      <Button
                        data-sort_by={"invoiceAmount"}
                        onClick={handleSortFunc}
                        className="sortBtn"
                        color="link"
                      >
                        <RiArrowUpDownLine color="primary" />
                      </Button>
                    </th>
                    <th>Invoice Status</th>
                    <th>Validation Status (Invoice/Supplier/PO)</th>
                    
                    <th>Action</th>
                  </tr>
                </thead>
                
                <tbody>
                  {loading ? null : Data.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <center>No Record Found</center>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {stableSort(Data, getSorting(order, orderBy)).map(
                        (data, index) => {
                          const {
                            dueAmount,
                            invoiceAmount,
                            invoiceNumber,
                            status,
                            invoiceId,
                            companyName,
                            name,
                            senderEmail,
                            supplierStatus,
                            invoiceStatus,
                            invoicePOStatus,
                            receiverEmail,
                            supplierCompanyName,
                            isResubmited,
                          } = data;
                          return (
                            <tr
                              key={`sort_${index}`}
                              data-id={invoiceId}
                              data-status={status}
                              data-invoiceAmt={invoiceAmount}
                              onClick={chkFun}
                              // disabled={isDelete}
                            >
                              {/* <td>{rowperpage * currentpage + (index + 1)}</td> */}
                              <td>{invoiceNumber}</td>
                              {getRole() !== "Supplier" ? (
                                <Fragment>
                                  <td>{name}</td>
                                  <td>{senderEmail}</td>
                                  <td>{supplierCompanyName}</td>
                                </Fragment>
                              ) : (
                                <Fragment>
                                  <td>{receiverEmail}</td>
                                  <td>{companyName}</td>
                                </Fragment>
                              )}
                              <td>{Amount(invoiceAmount)}</td>
                              <td>
                                <Badge color={statusStyleConfig[status]}>
                                  {status}
                                </Badge>
                              </td>
                              <td className="statustd">
                                <Badge
                                  color={validationStatusConfig[invoiceStatus]}
                                >
                                  {invoiceStatus}
                                </Badge>
                                <Badge
                                  color={validationStatusConfig[supplierStatus]}
                                >
                                  {supplierStatus}
                                </Badge>
                                <Badge
                                  color={
                                    validationStatusConfig[invoicePOStatus]
                                  }
                                >
                                  {invoicePOStatus}
                                </Badge>
                              </td>
                              <td><Button
                                    color="primary"
                                    size="sm"
                                    className="actionBtn"
                                    onClick={(e) => onClickResubmitInvoice(e)}
                                    data-id={invoiceId}
                                    disabled={status !="Initializing" || isResubmited===1}
                                    //disabled = {true}
                                    style={{padding: "4px 6px 4px 10px"}}
                                  >
                                   {status === "Initializing" && isResubmited === 1 && resubmitted===true ? "Resubmitted" : "Resubmit"}
                                  </Button></td>
                              {/* {getRole() === "Admin" ||
                              getRole() === "Super Admin" ? (
                                <td>
                                  <Button
                                    color=""
                                    size="sm"
                                    className="actionBtn"
                                    onClick={(e) => onClickDeleteInvoice(e)}
                                    data-id={invoiceId}
                                  >
                                    <FaTrash></FaTrash>
                                  </Button>
                                </td>
                              ) : (
                                ""
                              )} */}
                              {/* <td>
                                  <Button
                                    className="table-btn"
                                    color="link"
                                    disabled={
                                      status === "Initializing" ||
                                      status === "Reprocessing"
                                        ? true
                                        : false
                                    }
                                  >
                                    <Link
                                      target="_blank"
                                      to={`${INVOICE_DETAILS_ROUTE}/${invoiceId}`}
                                    >
                                      <AiFillEye />
                                    </Link>
                                  </Button>
                                </td> */}
                            </tr>
                          );
                        }
                      )}
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
              </div>
            </Card>
            </TabPane>
            </TabContent>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="2">
                <Table>
                  <thead>
                    <tr>
                      <th>Invoice Number</th>
                      <th> Supplier Name
                      <Button
                            data-sort_by={"name"}
                            onClick={handleSortFunc}
                            className="sortBtn"
                            color="link"
                          >
                            <RiArrowUpDownLine color="primary" />
                          </Button>
                      </th>
                      <th>Amount
                      <Button
                        data-sort_by={"invoiceAmount"}
                        onClick={handleSortFunc}
                        className="sortBtn"
                        color="link"
                      >
                        <RiArrowUpDownLine color="primary" />
                      </Button>
                      </th>

                      <th>status</th>


                    </tr>

                  </thead>
                  <tbody>
                  {stableSort(exceptionInvoiceList, getSorting(order, orderBy)).map(
                        (dataException, index) => {
                //  { exceptionInvoiceList.map((el,i)=>{
                 const {
                  invoiceId,
                  invoiceNumber,
                  status,
                  name,
                  invoiceAmount,
 
                 }=dataException
                 return(
                   <>
                   <tr
                   data-id={invoiceId}
                   data-status={status}
                   data-invoiceAmt={invoiceAmount}
                   onClick={chkFun}>
                 <td>{invoiceNumber}</td>
                 <td>{name}</td>
                
                 <td>{invoiceAmount}</td>
                 <td>{status}</td>
                
                 </tr>
                 </>

                   );
                    
                  })}
                      
                    </tbody>
                </Table>
                  </TabPane>
                  </TabContent>

          </Container>
        </div>
      </div>
    </Fragment>
  );
}
