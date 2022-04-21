import React, { useEffect, useState } from "react";
import CSVReader from "react-csv-reader";

import {
  IMPORT_GLCODE,
  GET_TAG_VALUE,
  GET_SUPPLIER_LIST_URL,
  SAVE_GLCODE_TAGVALUE,
  GET_ASSIGNED_GLCODE_VALUE,
  DELETE_GLCODE,
} from "../common/url";
import {
  deCryptFun,
  enCryptFun,
  getRole,
  getSenderEmail,
  getTeamID,
  getEmail,
} from "../common/functions";

import {
  Modal,
  ModalFooter,
  ModalBody,
  CardHeader,
  CardBody,
  Card,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Row,
  Col,
  InputGroup,
  InputGroupText,
  Button,
  Table,
} from "reactstrap";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import produce from "@reduxjs/toolkit/node_modules/immer";
import { endOfISOWeek, set } from "date-fns";

function GlCodeSettings(props) {
  const handleForce = (data, fileInfo) => newcsv(data);
  const [supplierLists, setSupplierLists] = useState();
  const [updateFlag, setUpdateFlag] = useState(false);
  const [tagList, settagList] = useState([]);
  const [tagValues, settagValues] = useState();
  let { supplierList } = props;
  // console.log("supplierprops", supplierList);
  const [taggedData, setTaggedData] = useState([
    {
      tagName: "suppliername",
      tagedTo: "",
      glCode: [],
      glCodeSelected: "",
      id: Date.now(),
      //dropDownValues: [supplierList],
    },
  ]);
  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase().replace(/\W/g, "_"),
  };

  const newcsv = (fileData) => {
    if (fileData.length > 0) {
      let findKeys = fileData[0];
      //  console.log("findKeys", fileData);
      let keyColumn = Object.keys(findKeys);
      let dataList = keyColumn.map((columnNam, i) => {
        let valueColumn = fileData.map((el, i) => {
          return el[columnNam];
        });
        let properties = {
          ["tagName"]: columnNam,
          ["glCode"]: valueColumn.toString(),
        };
        return properties;
      });
      settagList(dataList);
    }
  };

  const importglcode = async () => {
    const config = {
      method: "POST",
      url: IMPORT_GLCODE,
      data: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            tagList: tagList,
          })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };
    try {
      const response = await API(config);
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", "Imported successfully"));
        getTagValue();
      }
    } catch (error) {
      //   let { data } = error.response;

      //   let p = deCryptFun(data);
      //   let v = JSON.parse(p);
      //   // console.log("error data new",  v.message)
      //   Swal.fire(getAlert("Info", v.message));
      console.log(error);
    }
  };

  const getAssignedGlcode = async (value, id) => {
    //console.log("assignedCall", value, id);

    const config = {
      method: "GET",
      url: GET_ASSIGNED_GLCODE_VALUE,
      params: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            tagName: "suppliername",
          })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };
    try {
      const response = await API(config);
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        // console.log("supplierDataontagged", data);
        setSupplierLists(data);
      }
    } catch (error) {
      //   let { data } = error.response;
      console.log("error", error);
    }
  };
  const getTagValue = async () => {
    const config = {
      method: "GET",
      url: GET_TAG_VALUE,
      params: {
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
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        // console.log("tagList", data);
        let tagNameArray = data.map(function (obj) {
          if (obj.tagName == "suppliername") {
            //  console.log(obj.glCode)
            return obj.glCode;
          }
        });
        let tagSplit = JSON.parse(tagNameArray[0] || "[]");
        let newTagArray = tagSplit.map((el) => {
          return el.glCode;
        });
        // console.log("tagNameArray", JSON.parse(tagNameArray[0] || '[]'));
        // setTagNameList(tagNameArray);
        // console.log("newTagArray", newTagArray);
        settagValues(newTagArray);
      }
    } catch (error) {
      //   let { data } = error.response;

      //   let p = deCryptFun(data);
      //   let v = JSON.parse(p);
      //   // console.log("error data new",  v.message)
      //   Swal.fire(getAlert("Info", v.message));
      console.log(error);
    }
  };

  const updateTags = async () => {
    console.log("updateCalled");
    let savedData = taggedData.map((el) => {
      let properties = {
        tagName: el.tagName,
        tagedTo: el.tagedTo,
        glCode: el.glCodeSelected,
      };
      return properties;
    });
    // console.log("savedData", savedData);
    const config = {
      method: "POST",
      url: SAVE_GLCODE_TAGVALUE,
      data: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            tagList: savedData,
          })
        ),
        flutterString: "",
      },
      headers: authHeader(),
    };
    try {
      const response = await API(config);
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", "Saved successfully"));
        setUpdateFlag(!updateFlag);
      }
    } catch (error) {
      console.log("inside catch", error);
    }
  };

  const handletagChange = (e) => {
    //console.log("e.target", e.target);
    const { id, value, name } = e.target;
    const values = produce(taggedData, (draft) => {
      const index = draft.findIndex((todo) => todo.id == id);
      if (index !== -1) draft[index][name] = value;
    });
    // console.log("handleChange", values);
    setTaggedData(values);
  };

  useEffect(() => {
    if (
      (tagValues && tagValues.length === 0) ||
      (supplierList && supplierList.length === 0) ||
      (supplierLists && supplierLists.length === 0)
    ) {
      //  console.log("No tagvalues");
    } else {
      console.log(
        "tagValues useEffect",
        tagValues,
        supplierList,
        supplierLists
      );
      let redesignedMap = supplierList.map((el, i) => {
        let filterGlCodeSelected = supplierLists.filter((supp) => {
          return supp.tagName == "suppliername" && supp.tagedTo == el.label;
        });

        let selected =
          filterGlCodeSelected && filterGlCodeSelected.length > 0
            ? filterGlCodeSelected[0].glCode
            : "";

        let properties = {
          tagName: "suppliername",
          tagedTo: el.label,
          glCode: tagValues,
          glCodeSelected: selected,
          id: Date.now() + i * 2,
        };
        return properties;
      });
      // console.log("redesignedArray", redesignedMap);
      setTaggedData(redesignedMap);
    }
  }, [supplierList, tagValues, supplierLists]);

  useEffect(() => {
    getAssignedGlcode();
    getTagValue();
  }, [updateFlag]);

  useEffect(() => {
    if (tagList && tagList.length > 0) {
      importglcode();
    }
  }, [tagList]);

  return (
    <div>
      <Row className="mb-5">
        <Col md="10">
          <div className="glcode-import-btn ">
            <CSVReader
              cssClass="react-csv-input"
              label="Import File"
              onFileLoaded={handleForce}
              parserOptions={papaparseOptions}
            />
          </div>
        </Col>
      </Row>
      <Row
        className="mb-3"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        
      </Row>
      <Row>
       <Col md="9" className="btn-upload-glcode">
      <Button color="primary" onClick={updateTags}>
          {" "}
          Update{" "}
        </Button>
        </Col>
        {/* <Col
          md="3"
          style={{
            paddingRight: "unset",
            background: "#fffbed",
            paddingLeft: "unset",
          }}
        > */}
          <Table>
            {/* <thead>
              <tr>
                <th style={{ background: "cornsilk" }}>Tag Name</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supplier Name </td>
              </tr>
            </tbody> */}
          </Table>
        {/* </Col> */}
        <Col md="9" style={{ paddingLeft: "unset" }}>
          <Form form="true">
            <FormGroup>
              <Table style={{border: "solid 1px #efefef",margin:0}}>
                <thead>
                  <tr>
                    <th style={{ background: "#EAEAEA" ,textAlign:"left"}}>Suppiler Name</th>
                    <th style={{ background: "#EAEAEA",textAlign:"left" }}>GL Code</th>
                  </tr>
                </thead>
                <tbody>
                  {taggedData &&
                    taggedData.length > 0 &&
                    taggedData.map((lists, i) => {
                      const { tagName, tagedTo, glCode, glCodeSelected, id } =
                        lists;
                      // console.log("glCode", glCode);
                      return (
                        <tr>
                          <td style={{textAlign:"left"}}>{tagedTo}</td>
                          <td style={{textAlign:"left"}}>
                            <Input
                              type="select"
                              id={id}
                              name="glCodeSelected"
                              onChange={handletagChange}
                              value={glCodeSelected}
                              className="glcode-dropdown"
                            >
                              <option value={""}></option>
                              {glCode.map((valueData, i) => {
                                return (
                                  <option value={valueData}>{valueData}</option>
                                );
                              })}
                            </Input>
                          </td>
                        </tr>
                      );
                    })}
                  {/* {supplierLists && supplierLists.map((listsupplier,i)=>{
                            {listsupplier.}
                        })} */}
                </tbody>
              </Table>
            </FormGroup>
          </Form>
        </Col>
      </Row>
    </div>
  );
}

export default GlCodeSettings;
