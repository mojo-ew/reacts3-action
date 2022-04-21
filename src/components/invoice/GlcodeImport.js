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
} from "reactstrap";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import produce from "@reduxjs/toolkit/node_modules/immer";
import { endOfISOWeek, set } from "date-fns";

function GlcodeImport(props) {
  // const [fileData,setFileData]=useState([]);
  const handleForce = (data, fileInfo) => newcsv(data);
  const [tagList, settagList] = useState([]);
  const [tagNameList, setTagNameList] = useState([]);
  const [deleteTagList, setDeleteTagList] = useState([]);
  const [deleteGlCodeList, setDeleteGlCodeList] = useState([]);
  const [tagValues, settagValues] = useState();
  const [taggedData, setTaggedData] = useState([
    {
      tagName: "",
      tagedTo: "",
      glCode: "",
      glCodeSelected: "",
      id: Date.now(),
      dropDownValues: [],
    },
  ]);
  const [glCodeList, setglCodeList] = useState([]);
  const [deleteFlag, setDeleteFlag] = useState(false);
  const [tagNameSelected, SetTagNameSelected] = useState("");

  const { supplierList } = props;

  let invoiceAmountList = [
    { label: "0-20,000", values: "0-20,000" },
    { label: "20,000-40,000", values: "20,000-40,000" },
    { label: "40,000-60,000", value: "40,000-60,000" },
    { label: "60,000-80,000", value: "60,000-80,000" },
    { label: "80,000-1,00,000", value: "80,000-1,00,000" },
  ];
  let invoiceCurrencyList = [
    { label: "INR", value: "INR" },
    { label: "USD", value: "USD" },
  ];

  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase().replace(/\W/g, "_"),
  };

  const newcsv = (fileData) => {
    if (fileData.length > 0) {
      let findKeys = fileData[0];
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

  //API functions

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
        console.log("tagList", data);
        let tagNameArray = data.map(function (obj) {
          return obj.tagName;
        });
        console.log("tagNameArray", tagNameArray);
        setTagNameList(tagNameArray);
        settagValues(data);
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

  //Api call
  useEffect(() => {
    if (tagList.length > 0) {
      importglcode();
    }
  }, [tagList]);

  useEffect(() => {
    //getSupplierList();
    getTagValue();
  }, []);

  useEffect(() => {
    if (tagValues) {
      let structuredtagvalues = tagValues.map((el, i) => {
        let dropDownValues =
          el.tagName == "invoicecurrency"
            ? invoiceCurrencyList
            : el.tagName == "invoiceamount"
            ? invoiceAmountList
            : el.tagName == "suppliername"
            ? supplierList
            : "";

        let properties = {};
        properties = {
          glCode: el.glCode,
          tagName: el.tagName,
          teamId: el.teamId,
          dropDownValues: dropDownValues,
          id: Date.now() + i * 1,
        };

        return properties;
      });
      setTaggedData(structuredtagvalues);
    }
  }, [tagValues, supplierList]);

  const PostGLCodes = async (savedData) => {
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
      }
    } catch (error) {
      console.log("inside catch", error);
    }
  };

  const saveGLCodes = () => {
    let savedData = taggedData.map((el) => {
      let properties = {
        tagName: el.tagName,
        tagedTo: el.tagedTo,
        glCode: el.glCodeSelected,
      };
      return properties;
    });
    const validation = savedData.every(
      (item) => item.tagName && item.tagedTo && item.glCode
    );
    if (validation == false) {
      Swal.fire("Error", "Please fill all the fields");
    } else {
      PostGLCodes(savedData);
    }
  };

  const getAssignedGlcode = async (value, id) => {
    //console.log("assignedCall", value, id);
    let filtertagged = taggedData.filter((el) => el.id == id);

    let filteredTagName = filtertagged[0].tagName;
    const config = {
      method: "GET",
      url: GET_ASSIGNED_GLCODE_VALUE,
      params: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            tagName: filteredTagName,
            tagedTo: value,
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
        const values = produce(taggedData, (draft) => {
          const index = draft.findIndex(
            (todo) => todo.tagName == filteredTagName
          );
          if (index !== -1)
            draft[index]["glCodeSelected"] =
              Object.keys(data).length === 0 ? "" : data.glCode;
          draft[index]["tagedTo"] = value;
        });
        setTaggedData(values);
      }
    } catch (error) {
      //   let { data } = error.response;
      console.log("error", error);
      //   let p = deCryptFun(data);
      //   let v = JSON.parse(p);
      //   // console.log("error data new",  v.message)
      //   Swal.fire(getAlert("Info", v.message));
    }
  };

  const deleteGlCodes = async () => {
    console.log("ondelete", deleteGlCodeList.toString());
    const config = {
      method: "DELETE",
      url: DELETE_GLCODE,
      params: {
        webString: enCryptFun(
          JSON.stringify({
            glCodeId: deleteGlCodeList.toString(),
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
      console.log("deleteParsed", JSON.parse(l));
      if (status === "Success") {
        Swal.fire(getAlertToast("Success", "Deleted successfully"));
        setDeleteFlag(!deleteFlag);
        setDeleteGlCodeList([]);
        setDeleteTagList([]);
        getTagValue();
        SetTagNameSelected("");
      }
    } catch (error) {
      console.log("inside catch", error);
    }
  };

  const handleglCodeChange = (e) => {
    //console.log("e.target", e.target);
    const { id, value, name } = e.target;
    const values = produce(taggedData, (draft) => {
      const index = draft.findIndex((todo) => todo.id == id);
      if (index !== -1) draft[index][name] = value;
    });
    setTaggedData(values);
    if (name === "tagedTo") {
      getAssignedGlcode(value, id);
    }
  };

  const onClickDeletePopUp = () => {
    setDeleteFlag(true);
  };
  const callBack = () => {
    setDeleteFlag(!deleteFlag);
  };

  const handleTagNameChange = (e) => {
    console.log("tagNameSelected", e.target.value);
    SetTagNameSelected(e.target.value);
  };

  const deleteChecked = (e, glCodeId) => {
    console.log("e,glCodeId", e, glCodeId);
    if (deleteGlCodeList.includes(glCodeId)) {
      console.log(
        "if uncheck",
        deleteGlCodeList.filter((item) => item != glCodeId)
      );
      setDeleteGlCodeList(deleteGlCodeList.filter((item) => item != glCodeId));
    } else {
      console.log("if checked", [...deleteGlCodeList, glCodeId]);
      setDeleteGlCodeList([...deleteGlCodeList, glCodeId]);
    }
  };

  useEffect(() => {
    console.log("UseEffecttagNAme", tagNameSelected);
    if (tagNameSelected == "" || tagNameSelected == null) {
      console.log("if");
    } else {
      console.log("else");
      let filteredTags = tagValues.filter((el) => {
        return el.tagName == tagNameSelected;
      });
      let glCodemap = filteredTags[0].glCode;
      let parsedGlCode = JSON.parse(glCodemap || "[]");
      console.log("parsedGL", parsedGlCode);
      setDeleteTagList(parsedGlCode);
      console.log("filteredTags", filteredTags);
    }
  }, [tagNameSelected, tagNameList]);

  return (
    <div>
      <Row>
        <Col md="10">
          <div className="fileUpload btn btn-primary">
            <CSVReader
              cssClass="react-csv-input"
              label="Import File"
              onFileLoaded={handleForce}
              parserOptions={papaparseOptions}
            />
          </div>
        </Col>
      </Row>
      {tagValues && tagValues.length == 0 && (
        <Row style={{ justifyContent: "center" }} className="mt-5">
          No record found. Please import file!
        </Row>
      )}

      {tagValues && tagValues.length > 0 && (
        <Form form="true">
          <Row className="mt-5 mb-4">
            <Col md="2">
              <Label style={{ fontWeight: "bold" }}>Tag Name</Label>
            </Col>
            <Col md="3">
              <Label style={{ fontWeight: "bold" }}>Tagged To</Label>
            </Col>
            <Col md="3">
              <Label style={{ fontWeight: "bold" }}>GL Code</Label>
            </Col>
          </Row>
          {taggedData &&
            taggedData.map((valueData, i) => {
              const {
                tagName,
                glCode,
                glCodeSelected,
                dropDownValues,
                id,
                tagedTo,
              } = valueData;
              let splitglCode = JSON.parse(glCode || "[]");
              console.log("splittt", splitglCode);
              return (
                <FormGroup>
                  <Row xs={i} className="mt-2">
                    <Col md="2">
                      <Label for={tagName}>{tagName}</Label>
                    </Col>

                    <Col md="3">
                      <Input
                        type="select"
                        name="tagedTo"
                        id={id}
                        onChange={handleglCodeChange}
                        value={tagedTo}
                      >
                        <option value={""}>Select</option>
                        {dropDownValues.map((el, i) => {
                          const { label, value } = el;
                          return (
                            <option key={i} value={value}>
                              {label}
                            </option>
                          );
                        })}
                      </Input>
                    </Col>

                    <Col md="3">
                      <Input
                        type="select"
                        name="glCodeSelected"
                        id={id}
                        onChange={handleglCodeChange}
                        value={glCodeSelected}
                      >
                        <option value="">Select</option>
                        {splitglCode.map((el, i) => {
                          return (
                            <option value={el.glCode}> {el.glCode} </option>
                          );
                        })}
                      </Input>
                    </Col>
                  </Row>
                </FormGroup>
              );
            })}
        </Form>
      )}
      {tagValues && tagValues.length > 0 && (
        <Row style={{ justifyContent: "center" }}>
          <Button color="primary" onClick={() => saveGLCodes()}>
            Save
          </Button>
        </Row>
      )}
      {deleteFlag && (
        <Modal size="md" isOpen={deleteFlag} toggle={callBack}>
          <ModalBody>
            <Card>
              <CardBody>
                <CardHeader>Delete GL Code</CardHeader>
                <Row>
                  <Col md="7">
                    <Label>TagName</Label>
                    <Input
                      type="select"
                      name="tagName"
                      //id={id}
                      onChange={handleTagNameChange}
                      value={tagNameSelected}
                    >
                      <option value={""}>Select</option>
                      {tagNameList.map((el, i) => {
                        return (
                          <option key={i} value={el}>
                            {el}
                          </option>
                        );
                      })}
                    </Input>
                  </Col>
                </Row>

                <div>
                  {deleteTagList &&
                    deleteTagList.length > 0 &&
                    deleteTagList.map((el, i) => {
                      const { glCode, glCodeId } = el;
                      return (
                        <Row className="mt-3 ml-5">
                          <p>{glCode}</p>
                          <Input
                            type="checkbox"
                            checked={deleteGlCodeList.includes(glCodeId)}
                            onChange={(e) => deleteChecked(e, glCodeId)}
                          />
                        </Row>
                      );
                    })}
                </div>
              </CardBody>
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              size="sm"
              className="mr-2"
              onClick={callBack}
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default GlcodeImport;
