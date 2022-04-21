import React, { useEffect, useState } from "react";
import {
  Button,
  FormGroup,
  Label,
  Input,
  Col,
  Row,
  Table,
  UncontrolledCollapse,
  CardBody,
  Card,
} from "reactstrap";
import {Dialog, DialogActions,DialogTitle } from "@material-ui/core";

import CustomTableEmptyRecord from "../../common/CustomTableEmptyRecord";
import CustomTableHeader from "../../common/CustomTableHeader";
import {
  authHeader,
  getAlert,
  getAlertToast,
} from "../../common/mainfunctions";
import {
  INVOICE_LINE_DELETE_URL,
  GET_INVOICE_FIELDS,
  INVOICE_LINE_LISTING,
  GET_TABLE_VALUES_BY_ID,
  TRAINING_DATA_STORAGE_URL,
  SAVE_TRAINING_DATASET_URL,
  UPDATE_INVOICE_STATUS,
} from "../../common/url";
import API from "../../redux/API";
import Create from "./Create";
import { FaEdit, FaTrash,FaRegEye } from "react-icons/fa";
import Swal from "sweetalert2";
import Update from "./Update";
import {
  deCryptFun,
  enCryptFun,
  getRole,
  getSorting,
  getSubTeamId,
  getTeamID,
  getUserId,
  stableSort,
} from "../../common/functions";
import { Fragment } from "react";
import { detect, values } from "underscore";
const initialValue = {
  operatingUnit: "",
  invoiceLineNumber: "",
  invoiceLineType: "",
  GLDate:"",
  glAccount:"",
  extendedPrice:"",
  unitOfMeasure:"",
  invoiceId:"",
  itemDescription:"",
  itemNumber:"",
  poLineNumber:"",
  poNumber:"",
  quantity:"",
  unitPrice:"",
  
};
export default function List(props) {
  const [createInvoiceModal, setcreateInvoiceModal] = useState(false);
  const invoiceToggle = () => setcreateInvoiceModal(!createInvoiceModal);
  const [updateInvoiceModal, setupdateInvoiceModal] = useState(false);
  const updateinvoiceToggle = () => setupdateInvoiceModal(!updateInvoiceModal);
  const [selectedInvoice, setSelectedInvoice] = useState();
  const [requiredFieldList, setRequiredFieldList] = useState([]);
  const [flag, setflag] = useState(true);
  const [formData, setformData] = useState(initialValue);
  const [dialogueView, setDialogueView] = useState("");
  const [tableDropdown, setTableDropdown] = useState([])
  const [selectedTableTitle, setSelectedTableTitle] = useState({});
  const [selectedOption, setSelectedOption] = useState({})
  const [open,setOpen] = useState(false)
  const subTeamId = getSubTeamId();
  const [selectedDropdown, setSelectedDropdown] = useState("");
  const [edit, setEdit] = useState(false)
  const [tableList, setTableList] = useState([])
  const [approveLoading, setApproveLoading] = useState(false);
  const [fieldArray, setFieldArray] = useState([
   {
      fieldName: "",
      targetVariable: "quantity",
    },
    {
      fieldName: "",
      targetVariable: "unitOfMeasure",
    },
    {
      fieldName: "",
      targetVariable: "unitPrice",
    },
    {
      fieldName: "",
      targetVariable: "operatingUnit",
    },
    {
      fieldName: "",
      targetVariable: "glAccount",
    },
    {
      fieldName: "",
      targetVariable: "GLDate",
    },
    {
      fieldName: "",
      targetVariable: "extendedPrice",
    },
    {
      fieldName: "",
      targetVariable: "itemDescription",
    },
    {
      fieldName: "",
      targetVariable: "poLineNumber",
    },
    {
      fieldName: "",
      targetVariable: "poNumber",
    },
    {
      fieldName: "",
      targetVariable: "invoiceLineType",
    },
    {
      fieldName: "",
      targetVariable: "invoiceLineNumber",
    },
    {
      fieldName: "",
      targetVariable: "itemNumber",
    },
  ])

  
  const invoiceTitle = [
    { title: "#" },
    { title: "Operating Unit" },
    { title: "Invoice Line Number" },
    { title: "Invoice Line Type" },
    { title: "Actions" },
  ];
  const [invoiceList, setInvoiceList] = useState(initialValue);
  const { invoiceID, status, detectedTableData, getPreSelectValues, type , GlCode } = props;

  //console.log("detectedTableData", detectedTableData)

  // let detectedTableData = {invoiceDate: {
  //     label: "ORDER DATE",
  //     detectedLabel: "ORDER DATE"
  //   },
  //   invoiceNumber: {
  //     label: "NUMBER",
  //     detectedLabel: "NUMBER"
  //   },
  //   orderNumber: {
  //     label: "P.O. NUMBER",
  //     detectedLabel: "P.O. NUMBER"
  //   },
  //   taxTotal: {
  //     label: "Sales Tax",
  //     detectedLabel: "Sales Tax"
  //   },
  //   invoiceAmount: {
  //     label: "TOTAL DUE",
  //     detectedLabel: "TOTAL DUE"
  //   },
  //   itemDescription: {
  //     label: "DESCRIPTION",
  //     detectedLabel: "DESCRIPTION"
  //   },
  //   extendedPrice: {
  //     label: "EXTENDED PRICE",
  //     detectedLabel: "EXTENDED PRICE"
  //   },
  //   itemNumber: {
  //     label: "PART NO.",
  //     detectedLabel: "PART NO."
  //   },
  //   quantity: {
  //     label: "QUANTITY SHIPPED",
  //     detectedLabel: "QUANTITY SHIPPED"
  //   },
  //   unitOfMeasure: {
  //     label: "UNIT",
  //     detectedLabel: "UNIT"
  //   },
  //   unitPrice: {
  //     label: "UNIT PRICE",
  //     detectedLabel: "UNIT PRICE"
  //   },
  // }

  useEffect(()=>{
  setSelectedOption({
      ...selectedOption, [detectedTableData.quantity?.label || ""]: "quantity",
      [detectedTableData.unitOfMeasure?.label || ""]: "unitOfMeasure",
      [detectedTableData.unitPrice?.label || ""]: "unitPrice",
      [detectedTableData.operatingUnit?.label || "" ]:"operatingUnit",
      [detectedTableData.glAccount?.label || ""]: "glAccount" ,
      [detectedTableData.GLDate?.label || ""]: "GLDate",
      [detectedTableData.extendedPrice?.label || ""]: "extendedPrice",
       [detectedTableData.itemDescription?.label || ""]:"itemDescription" ,
      [detectedTableData.poLineNumber?.label || ""]: "poLineNumber",
      [detectedTableData.poNumber?.label || ""]: "poNumber",
      [detectedTableData.invoiceLineType?.label || ""]:"invoiceLineType" ,
      [detectedTableData.invoiceLineNumber?.label || ""]: "invoiceLineNumber",
      [detectedTableData.itemNumber?.label || ""]: "itemNumber" ,
    })
    
    let newTemp =  fieldArray.map((el,i) => { 
   //let initialVal = ""
   let target = el.targetVariable;
   if(target in detectedTableData){
    return { ...el,["fieldName"]: detectedTableData[target].label}
   } else{
     return {...el}
   }
})
 //console.log("newTemp", newTemp)
 setFieldArray(newTemp)

  }, [detectedTableData])




const onClickEditTable = (columnName,fieldName,isRequired) => {
  if(edit == true && fieldName != "glCode"){
  // console.log("columnName", {
  //     "columnName": columnName, "fieldName": fieldName, "isRequired" : isRequired
  //   })
  // console.log("selectDropDown", selectedDropdown, )
  // console.log("detectedTableData[columnNAme]", detectedTableData[columnName])
  
  //console.log("fieldArray", fieldArray)
  let filteredData = fieldArray.filter(el=>{return el.targetVariable == columnName})
  //console.log("filteredData", filteredData)
  let selectedVal = filteredData[0].fieldName
  //console.log("fieldName", selectedVal);
   setSelectedDropdown(selectedVal)
  //}

    // let assignField = fieldArray.find(
    //     (element) => element.targetVariable == columnName
    //   ).fieldName = detectedTableData[columnName].label;
    // console.log("assignField", assignField)
    setSelectedTableTitle({
      "columnName": columnName, "fieldName": fieldName, "isRequired" : isRequired
    })
    setOpen(true);
  } else return null;
  };

  const handleClose = () => {
    setOpen(false);
  };

  //console.log("tableList", tableList, "invoiceList", invoiceList)


const rowHandlerSelect = (e) => {
//console.log("e.target.value", e.target.value)

let val = e.target.value;
//console.log("selectedTableTitle", selectedTableTitle.columnName)
setSelectedDropdown(val)
//console.log("selectedTableTitle",selectedTableTitle, "tableList", tableList, "invoiceList", invoiceList)
//console.log("detectedDataTable", detectedTableData, "selectedOption", selectedOption)
let temp2 = fieldArray;
    // console.log("temp2 before", temp2)
    let fafind = temp2.find(
      (element) => element.targetVariable == selectedTableTitle.columnName
    );
    if (fafind) {
      temp2.find(
        (element) => element.targetVariable == selectedTableTitle.columnName
      ).fieldName = val;
    }
   // console.log("temp2 after", temp2)
   setFieldArray(temp2);
   
 let newVal =  invoiceList.map((ld,j) => { 
   //let initialVal = ""
 let matchedObj = tableList[j]
   if(val in matchedObj){
    // console.log("matchedObj[val]",matchedObj[val])
    return { ...ld,[selectedTableTitle.columnName]: val!=""?matchedObj[val] : ""}
   }
//console.log('matchedObj', matchedObj, "val", val );
})
 // console.log("newVal", newVal)

  setInvoiceList(newVal)

//console.log("newStructuredData", newVal)
}

const onClickEditHandle = () => {
  setEdit(true)
}

  const getIvoiceListing = async () => {
    const config = {
      method: "GET",
      url: INVOICE_LINE_LISTING,
      headers: authHeader(),
      params: {
        // invoiceId: invoiceID,
        // invoiceLineId: selectedInvoice,
        webString: enCryptFun(
          JSON.stringify({
           invoiceId: invoiceID,
        invoiceLineId: selectedInvoice,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
     // const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
     // console.log("invoice Line data", data)
      setInvoiceList(data);
    } catch (error) {
     // console.error(error);
      if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    }
  };

  const getEditInvoice = (editinvoiceId) => {
     //console.log("invoiceLineId", editinvoiceId)
    // console.log("invoiceLiat", invoiceList)
     let filterEditData = invoiceList.filter(el=>{
       return editinvoiceId == el.invoiceLineId
     })
    // console.log("filtered invoices", filterEditData)
    setformData(filterEditData[0])
    // console.log("filterData", filterEditData)
  }

 

  // const getSingleIvoiceListing = async (invoiceLineId) => {
  //   const config = {
  //     method: "GET",
  //     url: INVOICE_LINE_LISTING,
  //     headers: authHeader(),
  //     params: {
  //       // invoiceId: invoiceID,
  //       // invoiceLineId: invoiceLineId,
  //       webString: enCryptFun(
  //         JSON.stringify({
  //          invoiceId: invoiceID,
  //       invoiceLineId: invoiceLineId,
  //         })
  //       ),
  //       flutterString: "",
  //     },
  //   };
  //   try {
  //     const response = await API(config);
  //    // const { status, data } = response.data;
  //     let l = deCryptFun(response.data);
  //     const { status, data } = JSON.parse(l);
  //     setformData(data[0]);
  //   } catch (error) {
  //     //console.error(error);
  //      if (error.response) {
  //       let { data } = error.response
        
  //      let p = deCryptFun(data);
  //       let  v = JSON.parse(p)
  //      // console.log("error data new",  v.message)
  //      Swal.fire(getAlert("Error", v.message));
  //     }
  //   }
  // };

  const submitCallBack = () => {
    invoiceToggle();
    getIvoiceListing(invoiceID);
  };

  useEffect(() => {
    getIvoiceListing(invoiceID);
    getTableValuesById();
  }, []);
  const addInvoiceLine = () => {
    setformData({
      operatingUnit: "",
      invoiceLineNumber: "",
      invoiceLineType: "",
    });
    invoiceToggle();
    setflag(true);
  };

  const editInvoiceLine = async (event) => {
    //console.log("dialog", event.currentTarget.dataset.title)
    setflag(false);
    const invoiceLineId = event.currentTarget.dataset.invoiceline_id;
    setDialogueView(event.currentTarget.dataset.title)
   // getSingleIvoiceListing(invoiceLineId);
   getEditInvoice(invoiceLineId)
    invoiceToggle();
  };

   const viewInvoiceLine = async(event)=>{
      //console.log("dialog", event.currentTarget.dataset.title)
      //console.log("iddddddd",event.currentTarget.dataset.invoiceline_id)
     setflag(false);
    const invoiceLineId = event.currentTarget.dataset.invoiceline_id;
    setDialogueView(event.currentTarget.dataset.title)
   // getSingleIvoiceListing(invoiceLineId);
   getEditInvoice(invoiceLineId)
    invoiceToggle();
  }

  const onClickDeleteInvoiceLine = (e) => {
    e.stopPropagation();
    let invoiceLineId = parseInt(e.currentTarget.dataset.invoiceline_id);
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this asset?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.value) {
        deleteInvoiceLine(invoiceLineId);
      }
    });
  };

  const deleteInvoiceLine = async (invoiceLineID) => {
    const config = {
      method: "DELETE",
      url: INVOICE_LINE_DELETE_URL,
      headers: authHeader(),
      params: { // invoiceLineId: invoiceLineID ,
        webString: enCryptFun(
          JSON.stringify({
           invoiceLineId: invoiceLineID ,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
     // const { status } = response.data;
       let l = deCryptFun(response.data);
      const { status } = JSON.parse(l);
      if (status == "Success") {
        Swal.fire(
          getAlertToast("Success", "Invoice Line deleted Successfully")
        );
        getIvoiceListing();
      } else {
        Swal.fire(getAlert("error", "error"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const GetRequiredValues = async () => {
    const config = {
      method: "GET",
      url: GET_INVOICE_FIELDS,
      params: { // teamId: getRole() == "Supplier" ? subTeamId : getTeamID() ,
      webString: enCryptFun(
          JSON.stringify({
           teamId: getRole() == "Supplier" ? subTeamId : getTeamID() ,
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
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        // let requiredFields = data.filter((d) => { return d.isMandatory === 1});
        setRequiredFieldList(data);
       console.log("required values", data)
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
  };

 const getTableValuesById = async () => {
    const config = {
      method: "GET",
      url: GET_TABLE_VALUES_BY_ID,
      params: { // teamId: getRole() == "Supplier" ? subTeamId : getTeamID() ,
      webString: enCryptFun(
          JSON.stringify({
            invoiceId: invoiceID
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
      const { status, lineItems } = JSON.parse(l);
     // console.log("getTableValues", JSON.parse(l))
      if (status === "Success") {
        // let requiredFields = data.filter((d) => { return d.isMandatory === 1});
       // console.log("getTableValues", lineItems)
        let arrayofItems = Object.keys(lineItems[0])
        setTableDropdown(arrayofItems)
        setTableList(lineItems)
       // console.log("arrayofItems",arrayofItems)
      }
    } catch (error) {
      // Swal.fire("Error", error);
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
        console.log("error data new",  v.message)
       //Swal.fire("Error", v.message);
      }
    }
  };

  const updateInvoiceLineItems = async() => {
    setEdit(false)
    // const keycongigure = {
    //   method: "POST",
    //   url: TRAINING_DATA_STORAGE_URL,
    //   headers: authHeader(),
    //   data: {
    //     invoiceId: parseInt(invoiceID),
    //     entityDatasetDetails: fieldArray,

    //   },
    // };
    // try {
    //   const response = await API(keycongigure);
    //   console.log("updateLineItems", response)
    //   getIvoiceListing(invoiceID);
    //   getTableValuesById();
    //   getPreSelectValues();
    // } catch (error) {
    //   console.log("error", error);
    // } finally {
    //   setEdit(false);
    // }
    
  }

  const cancelInvoiceLineItems = () => {
   setEdit(false)
  }

  
  
//   const approveInvoice = async() => {
   
//      setApproveLoading(true);

//     // if (keyChangeFlag == true) {

//     let filteredArray = fieldArray.filter((element) => element.fieldName != "");
//     const keycongigure = {
//       method: "POST",
//       url: SAVE_TRAINING_DATASET_URL,
//       headers: authHeader(),
//       data: {
//         supplierName: values.name,
//         entityDataset: filteredArray,
//         invoiceId: invoiceID,
//       },
//     };
//     try {
//       const response = await API(keycongigure);

//     } catch (error) {
//       console.log("error", error);
//     } finally {
     
//     }
//     // }
//     const config = {
//       method: "PUT",
//       url: UPDATE_INVOICE_STATUS,
//       headers: authHeader(),
//       data: {
//         // userId: getUserId(),
//         // invoiceId: invoiceID,
//         // status: "Approved",
//         webString: enCryptFun(
//           JSON.stringify({
//             userId: getUserId(),
//             invoiceId: invoiceID,
//             status: "Approved",
//           })
//         ),
//         flutterString: "",
//       },
//     };
//     try {
//       const response = await API(config);
//       //const { status } = response.data;
//       let l = deCryptFun(response.data);
//       const { status } = JSON.parse(l);
//       if (status === "Success") {
//         Swal.fire(getAlertToast("Success", "Approved Successfully"));
//        // setFormValues({ ...formValues, status: "Approved" });
//       }
//     } catch (error) {

//       if (error.response) {
//         let { data } = error.response
//         let p = deCryptFun(data);
//         let v = JSON.parse(p)
//         // console.log("error data new",  v.message)
//         Swal.fire(getAlert("Error", v.message));
//       }
//     } finally {
//       setApproveLoading(false);
//        setEdit(false)
//     }
//  }

  useEffect(() => {
    GetRequiredValues();
  }, [subTeamId]);


  return (
    <div className="invoice-line-details">
      <div className="d-flow">
        <h5>Invoice Line Item</h5>
        {status == "Approved" ? (
          ""
        ) : (
          <Button
            id="line"
            className="btn-left"
            color="primary"
            size="sm"
            onClick={addInvoiceLine}
          >
            + Add
          </Button>
        )}
      </div>

      <Table
      aria-disabled = {true}
      responsive>
        <thead>
          <tr>
            {/* <CustomTableHeader tableColumns={invoiceTitle} /> */}
            <th>#</th>
            {requiredFieldList &&
              stableSort(
                requiredFieldList.filter((i) => i.moduleName == "Invoice Line"  ),
                getSorting("asc", "fieldOrder")
              ).map((record, index) => {
                const { columnName, fieldName, isRequired } = record;
                
                return requiredFieldList.filter(
                  
                  (element) =>
                    element.columnName === columnName && element.isVisible === 1 && element.columnName != "glAccount"
                ).length == 1 ?  (
                 // requiredFieldList. filter((el) => el.fieldName == "Invoice Line Amount" || el.fieldName == "Invoice Line Type" || el.fieldName == "Operating Unit" || el.fieldName == "Invoice Line Number").map(
                  <th style={{cursor:"pointer"}}  onClick={()=>{onClickEditTable(columnName,fieldName,isRequired)}}>{fieldName}</th>
                  
                ) : (
                  ""
                );
              })}
              {type=="nonpo" && requiredFieldList && 
             requiredFieldList.filter(
                  (element) =>
                    element.columnName ==="glAccount" && element.moduleName == "Invoice Line"
                ).length == 1 ? 
              (<th>{requiredFieldList.find(
                  (element) =>
                   element.columnName ==="glAccount"
                ).fieldName}</th>):"" }
                
            {/* <th>Operating Unit</th>
            <th>Invoice Line Amount</th>
            <th>Invoice Line Number</th>
            <th>Invoice Line Type</th> */}
            {edit==true && <th id="pf" headers="p">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {/* <tr> {requiredFieldList &&
                    stableSort(
                      requiredFieldList.filter(
                        (i) =>
                          i.moduleName == "Invoice Line" && i.isVisible == 1
                      ),
                      getSorting("asc", "fieldOrder")
                    ).map((record, index) => { 
                       const { fieldName } = record;
                      return (
                    <td key={fieldName}>
                      
                       <Input type="select">
                  <option>1</option>
                  <option>2</option>
                </Input> </td>
                )})  } </tr> */}

          {invoiceList && invoiceList.length > 0 ? (
            invoiceList &&
            invoiceList.map((record, index) => {
              const {
                invoiceLineNumber,
                invoiceLineType,
                operatingUnit,
                invoiceLineId,
                GLDate,
                glAccount,
                extendedPrice,
                unitOfMeasure,
                itemDescription,
                itemNumber,
                poLineNumber,
                poNumber,
                quantity,
                unitPrice,
                glCode,
              } = record;
              return (
                

              //  <td>
              //     <Input
              //               type="select"
              //               //required={record.isRequired===1}
              //               name={record.fieldName}
              //               id={record.fieldName}
              //               data-labname={record.fieldName}
              //               data-exaval={record.columnName}
              //               onChange={(e) => RowHandlerChk(e)}
              //               value={
              //                detectedTableData[record.columnName].label ? detectedTableData[record.columnName].label : ""
              //               }
              //             >
              //               <option value={""}></option>

              //               {tableDropdown.map((i) => {
              //                 return (
              //                   <option
              //                     //style={{ display: Object.keys(selectedOption).length && Object.values(selectedOption).includes(i.label) ? "none" : "inherit" }}
              //                     key={`col_${i}`}
              //                     value={i}
              //                     data-va={i}
              //                    // disabled={Object.keys(selectedOption).length && Object.values(selectedOption).includes(i.label)}
              //                   >
              //                     {i}
              //                   </option>
              //                 );
              //               })}
              //             </Input>
              //  </td>

                <>
                
                <tr key={`invoice_list_${index}`}>
                  <td>{index + 1}</td>
                  {requiredFieldList &&
                    stableSort(
                      requiredFieldList.filter(
                        (i) =>
                          i.moduleName == "Invoice Line" && i.isVisible == 1
                      ),
                      getSorting("asc", "fieldOrder")
                    ).map((record, index) => {
                      //console.log("record", record)
                      const { fieldName } = record;
                      return  fieldName == "Invoice Line Type" ? (
                        <td>{invoiceLineType}</td>
                      ) : fieldName == "Operating Unit" ? (
                        <td>{operatingUnit}</td>
                      ) : fieldName == "Invoice Line Number" ? (
                        <td>{invoiceLineNumber}</td>
                      ) :
                      // :fieldName == "GL Account" ? (
                      //   type =="nonpo" ?

          
                      //   <td>{  glAccount ?glAccount:GlCode}</td>:
                      //   ''
                      // ): 
                      fieldName == "GL Date" ? (
                        <td>{GLDate}</td>
                      ): fieldName == "Extended Price" ? (
                        <td>{extendedPrice}</td>
                      ): fieldName == "Unit Price" ? (
                        <td>{unitPrice}</td>
                      ): fieldName == "Quantity" ? (
                        <td>{quantity}</td>
                      ): fieldName == "Unit of Measure" ? (
                        <td>{unitOfMeasure}</td>
                      ): fieldName == "Item Description" ? (
                        <td>{itemDescription}</td>
                      ): fieldName == "Item Number" ? (
                        <td>{itemNumber}</td>
                      ): fieldName == "PO Line Number" ? (
                        <td>{poLineNumber}</td>
                      ): fieldName == "PO Number" ? (
                        <td>{poNumber}</td>
                      )
                      :("")
                    })}
                   {type=="nonpo" && <td>{glAccount == null || glAccount == "" ? GlCode : glAccount }</td>}
                  {/* <td>{invoiceLineAmount}</td>
                  <td>{invoiceLineNumber}</td>
                  <td>{invoiceLineType}</td> */}
                 {edit==true && <td headers="p pf" style={{ display: "flex" }}>
                    {status == "Approved" ? (
                      ""
                    ) : (
                      <Fragment>
                        <Button
                          color=""
                          size="sm"
                          className="actionBtn"
                          onClick={editInvoiceLine}
                          data-invoiceline_id={invoiceLineId}
                //           data-invoice_ounit={operatingUnit}
                //           data-invoice_line={invoiceLineNumber}
                //           data-invoice_type={invoiceLineType}
                //           data-invoice_GLDate = {GLDate}
                //           data-invoice_glAccount = {glAccount}
                //          data-invoice_extendedPrice =   {extendedPrice}
                // data-invoice_unitOfMeasure =  {unitOfMeasure}
                // data-invoice_itemDescription =  {itemDescription}
                // data-invoice_itemNumber =  {itemNumber}
                // data-invoice_poLineNumber =  {poLineNumber}
                // data-invoice_poNumber =  {poNumber}
                // data-invoice_quantity =  {quantity}
                // data-invoice_unitPrice =  {unitPrice}
                data-title = "editLineItem"
                          // disabled={status == "Approved" ? true : false}
                        >
                          <FaEdit></FaEdit>
                        </Button>
                        <Button
                          color=""
                          size="sm"
                          className="actionBtn"
                          onClick={onClickDeleteInvoiceLine}
                          data-invoiceline_id={invoiceLineId}
                        >
                          <FaTrash></FaTrash>
                        </Button>
                        <Button
                          color=""
                          size="sm"
                          className="actionBtn"
                          onClick={viewInvoiceLine}
                          data-invoiceline_id={invoiceLineId}
                //           data-invoice_ounit={operatingUnit}
                //           data-invoice_line={invoiceLineNumber}
                //           data-invoice_type={invoiceLineType}
                //            data-invoice_GLDate = {GLDate}
                //             data-invoice_glAccount = {glAccount}
                //          data-invoice_extendedPrice =   {extendedPrice}
                // data-invoice_unitOfMeasure =  {unitOfMeasure}
                // data-invoice_itemDescription =  {itemDescription}
                // data-invoice_itemNumber =  {itemNumber}
                // data-invoice_poLineNumber =  {poLineNumber}
                // data-invoice_poNumber =  {poNumber}
                // data-invoice_quantity =  {quantity}
                // data-invoice_unitPrice =  {unitPrice}
                data-title = "viewLineItem"
                          // disabled={status == "Approved" ? true : false}
                        >
                          <FaRegEye></FaRegEye>
                        </Button>
                      </Fragment>
                    )}
                  </td>}
                </tr>
                </>
              );
            })
          ) : (
            <CustomTableEmptyRecord columnsCount={invoiceTitle.length} />
          )}
        </tbody>
      </Table>
      {edit == false &&<> <Row style={{justifyContent:"center"}} className="mt-3">
       <div>
      <Button
      // className="mr-2"
       outline
      color="primary"
      onClick={()=>{onClickEditHandle()}}
      >
      Edit Invoice
      </Button>
      </div>
      </Row>
      <Row style={{justifyContent:"center"}} className="mt-2">
     <Button
     // outline
      color="primary"
      //onClick={()=>{approveInvoice()}}
      >
      Approve      
      </Button>
      </Row></>}
      {edit == true &&
      <>
      <Row style={{justifyContent:"center"}} className="mt-2">
      <Button
      // className="mr-2"
      // outline
      color="primary"
      onClick={()=>{updateInvoiceLineItems()}}
      >
      Update
      </Button>
      <Button
       className="ml-2"
      outline
      color="primary"
      onClick={()=>{cancelInvoiceLineItems()}}
      >
      Cancel      
      </Button>
      </Row>
      
      </>}
      <Create
        flag={flag}
        formData={formData}
        createInvoiceModal={createInvoiceModal}
        invoiceToggle={invoiceToggle}
        submitCallBack={submitCallBack}
        invoiceID={invoiceID}
        GlCode = {GlCode}
        type={type}
        selectedInvoice={selectedInvoice}
        dialogueView = {dialogueView}
      />
      <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={"sm"}>
        <Card>
          <CardBody>
        <DialogTitle>Select Label</DialogTitle>
        <Input
                            type="select"
                            //required={record.isRequired===1}
                            // name={Object.values(selectedTableTitle).length > 0 && selectedTableTitle.fieldName} 
                            // id={Object.values(selectedTableTitle).length > 0 && selectedTableTitle.fieldName}
                            // data-labname={Object.values(selectedTableTitle).length > 0 && selectedTableTitle.fieldName}
                            // data-exaval={Object.values(selectedTableTitle).length > 0 && selectedTableTitle.columnName}
                            onChange={(e) => rowHandlerSelect(e)}
                            value={
                            //  detectedTableData[selectedTableTitle.columnName]?detectedTableData[selectedTableTitle.columnName].label: ""
                             selectedDropdown
                            }
                          >
                            <option value={""}></option>

                            {tableDropdown.map((i) => {
                              return (
                                <option
                                  //style={{ display: Object.keys(selectedOption).length && Object.values(selectedOption).includes(i.label) ? "none" : "inherit" }}
                                  key={`col_${i}`}
                                  value={i}
                                  data-va={i}
                                 // disabled={Object.keys(selectedOption).length && Object.values(selectedOption).includes(i.label)}
                                >
                                  {i}
                                </option>
                              );
                            })}
                          </Input>
                          </CardBody>
                          </Card>
      </Dialog>

    </div>
  );
}
