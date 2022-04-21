import React, { Fragment, useState, useEffect, useRef } from "react";
import {
  Container,
  Col,
  Table,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  Row,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
  UncontrolledCollapse,
  Badge,
} from "reactstrap";
import { authHeader, getAlertToast } from "../common/mainfunctions";
import {
  DELETE_SUPPLIER_REQUEST,
  SUPPLIER_LISTING,
  UPDATE_SUPPLIER_STATUS,
} from "../common/url";
import Swal from "sweetalert2";

import Sidebar from "../layout/Sidebar";
import API from "../redux/API";
import {
  deCryptFun,
  enCryptFun,
  getEmail,
  getRole,
  getSorting,
  getTeamID,
  stableSort,
} from "../common/functions";
import CustomTableEmptyRecord from "../common/CustomTableEmptyRecord";
import CustomTableLoader from "../common/CustomTableLoader";
import Pagination from "react-js-pagination";
import { RiArrowUpDownLine } from "react-icons/ri";
import { FaFilter, FaToggleOff, FaToggleOn, FaTrash } from "react-icons/fa";
import { debounce } from "underscore";
import AddRequest from "./AddRequest";
import { requestStatusStyleConfig } from "../../constants/HelperConstant";

export default function Request() {
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rowperpage, setRowPerPage] = useState(10);
  const [currentpage, setCurrentPage] = useState(0);
  const [totalrecords, setTotalRecords] = useState(0);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("companyLogo");
  const [companyName, setCompanyName] = useState("");
  const [requestedName, setRequestedName] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [requestModal, setRequestModal] = useState(false);
  const addToggle = () => setRequestModal(!requestModal);

  const onPageChange = (page) => {
    setCurrentPage(page - 1);
  };
  const RowHandler = (e) => {
    setCurrentPage(0);
    setRowPerPage(e.target.value);
  };
  const statusChange = async (e) => {
    const request_id = e.currentTarget.dataset.request_id;
    const config = {
      method: "PUT",
      url: UPDATE_SUPPLIER_STATUS,
      headers: authHeader(),
      data: {
        // requestId: request_id,
        // status: "Accepted",
       webString: enCryptFun(
          JSON.stringify({
            requestId: request_id,
       status: "Accepted",
          })
        ),
         flutterString: "",
      },
    };
    try {
      const response = await API(config);
      //const { status } = response.data;
       let l = deCryptFun(response.data);
      const {  status } = JSON.parse(l);
      if (status == "Success") {
        Swal.fire(getAlertToast("Success", " Status Updated Successfully"));
      }
      requestListing();
    } catch (error) {
      console.error(error);
    }
  };
  const requestListing = async (
    companyName,
    requestedName,
    requestStatus,
    supplierEmail,
    currentpage,
    rowperpage
  ) => {
    setLoading(true);

    const config = {
      method: "GET",
      url: SUPPLIER_LISTING,
      headers: authHeader(),
      params: {
      //   teamId: getRole() === "Supplier" ? 0 : getTeamID(),
      //   offset: rowperpage,
      //   count: currentpage,
      //   supplierCompanyName: companyName,
      //   requestedName: requestedName,
      //   requestStatus: requestStatus,
      //   supplierEmail: getRole() === "Supplier" ? getEmail() : supplierEmail,
      webString :  enCryptFun(
          JSON.stringify({
             teamId: getRole() === "Supplier" ? 0 : getTeamID(),
        offset: rowperpage,
        count: currentpage,
        supplierCompanyName: companyName,
        requestedName: requestedName,
        requestStatus: requestStatus,
        supplierEmail: getRole() === "Supplier" ? getEmail() : supplierEmail,
          })
        ),
         flutterString: "",
        },
    };
    try {
      const response = await API(config);
      //const { data, status, count } = response.data;
         let l = deCryptFun(response.data);
   
      const {  status, data, count  } = JSON.parse(l);
      setRequestData(data);
      setTotalRecords(count);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  // useEffect(() => {
  //   requestListing();
  // }, [rowperpage, currentpage]);
  const handleSortFunc = (event) => {
    const { sort_by } = event.currentTarget.dataset;
    const isAsc = orderBy === sort_by && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(sort_by);
  };
  const onHandleCompanyName = (e) => {
    setCurrentPage(0);

    const { value } = e.target;
    setCompanyName(value);
  };
  const onHandleRequestName = (e) => {
    setCurrentPage(0);

    const { value } = e.target;
    setRequestedName(value);
  };
  const onHandleRequestStatus = (e) => {
    setCurrentPage(0);

    const { value } = e.target;
    setRequestStatus(value);
  };
  const onHandleSupplierEmail = (e) => {
    setCurrentPage(0);

    const { value } = e.target;
    setSupplierEmail(value);
  };
  let ResetFilter = () => {
    setCompanyName("");
    setRequestedName("");
    setRequestStatus("");
    setSupplierEmail("");
  };
  const delaySearch = useRef(
    debounce(
      (
        companyName,
        requestedName,
        requestStatus,
        supplierEmail,
        rowperpage,
        currentpage
      ) =>
        requestListing(
          companyName,
          requestedName,
          requestStatus,
          supplierEmail,
          currentpage,
          rowperpage
        ),
      500
    )
  ).current;

  useEffect(() => {
    delaySearch(
      companyName,
      requestedName,
      requestStatus,
      supplierEmail,
      currentpage,
      rowperpage
    );
  }, [
    companyName,
    requestedName,
    requestStatus,
    supplierEmail,
    currentpage,
    rowperpage,
  ]);
  const successCallBack = () => {
    setRequestModal(false);
    requestListing();
  };
  const deleteRequest = async (supplierId, requeststatus) => {
    const configsupplier = {
      method: "PUT",
      url: UPDATE_SUPPLIER_STATUS,
      headers: authHeader(),
      data: {
        // requestId: supplierId,
        // status: requeststatus == "Deactivated" ? "Accepted" : "Deactivated",
      webString: enCryptFun(
          JSON.stringify({
           requestId: supplierId,
       status: requeststatus == "Deactivated" ? "Accepted" : "Deactivated",
          })
        ),
         flutterString: "",
      },
    };
    try {
      const response = await API(configsupplier);
     // const { status, data, message } = response.data;
  let l = deCryptFun(response.data);
      const {  status, data, message  } = JSON.parse(l);
      if (status === "Success") {
        Swal.fire(getAlertToast("success", message));

        requestListing();
      }
    } catch (error) {
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlertToast("Error", v.message));
      }
    }
  };
  const onClickDeleteRequest = async (e) => {
    const supplierId = e.currentTarget.dataset.id;
    const requeststatus = e.currentTarget.dataset.requeststatus;
   
    Swal.fire({
      title: "Are you sure?",
      text:
        requeststatus == "Deactivated"
          ? "Do you want to activate?"
          : "Do you want to deactivate?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.value) {
        deleteRequest(supplierId, requeststatus);
      }
    });
  };
  return (
    <Fragment>
      <div className="wrapper">
        <Sidebar />
        <div className="page-content-wrapper">
          <Container fluid={true}>
            <div className="page-title">
              <h3>
                {getRole() === "Supplier" ? "My Clients " : " Invite Supplier"}
                <Badge className="invoiceCount-Badge" color="info">
                  {totalrecords}
                </Badge>
              </h3>
              <div className="PageTopSearch">
                {getRole() != "Supplier" ? (
                  <Button color="primary" onClick={addToggle}>
                    + New Request
                  </Button>
                ) : (
                  ""
                )}
                <Button color="primary" className="filterBtn" id="toggler">
                  <FaFilter />
                </Button>
              </div>
            </div>
            <UncontrolledCollapse toggler="#toggler">
              <Card className="filterCard">
                <Row>
                  <Col md="2">
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
                  </Col>
                  {getRole() === "Supplier" ? (
                    <Col md="2">
                      <FormGroup>
                        <Input
                          type="text"
                          onChange={onHandleRequestName}
                          value={requestedName}
                          name=""
                          id=""
                          placeholder="Subscriber Name"
                        />
                      </FormGroup>
                    </Col>
                  ) : (
                    ""
                  )}
                  <Col md="2">
                    <FormGroup>
                      <Input
                        type="select"
                        onChange={onHandleRequestStatus}
                        value={requestStatus}
                        name="status"
                        id="status"
                      >
                        <option value={""}>Show All</option>
                        {["Accepted", "Pending"].map((i) => {
                          return (
                            <option key={`status_${i}`} value={i}>
                              {i}
                            </option>
                          );
                        })}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="2">
                    <FormGroup>
                      <Input
                        type="text"
                        onChange={onHandleSupplierEmail}
                        value={supplierEmail}
                        name=""
                        id="supplierEmail"
                        placeholder="Supplier Email"
                      />
                    </FormGroup>
                  </Col>

                  <Col md="4">
                    <Button color="primary" onClick={() => ResetFilter()}>
                      Reset
                    </Button>
                  </Col>
                </Row>
              </Card>
            </UncontrolledCollapse>{" "}
            <div className="cus-row">
              <Col md="12" >
                <Card>
                  <CardBody>
                    <Table hover>
                      <thead>
                        <tr>
                          {getRole() === "Supplier" ? (
                            <Fragment>
                              <th>
                                Company Name
                                <Button
                                  data-sort_by={"companyName"}
                                  onClick={handleSortFunc}
                                  className="sortBtn"
                                  color="link"
                                >
                                  <RiArrowUpDownLine color="primary" />
                                </Button>
                              </th>
                              <th>
                                Subscriber Name
                                <Button
                                  data-sort_by={"requestedName"}
                                  onClick={handleSortFunc}
                                  className="sortBtn"
                                  color="link"
                                >
                                  <RiArrowUpDownLine color="primary" />
                                </Button>
                              </th>
                              <th>
                                Subscriber Email
                                <Button
                                  data-sort_by={"requestedEmail"}
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
                                Company Name
                                <Button
                                  data-sort_by={"supplierCompanyName"}
                                  onClick={handleSortFunc}
                                  className="sortBtn"
                                  color="link"
                                >
                                  <RiArrowUpDownLine color="primary" />
                                </Button>
                              </th>
                              <th>
                                Supplier Email
                                <Button
                                  data-sort_by={"supplierEmail"}
                                  onClick={handleSortFunc}
                                  className="sortBtn"
                                  color="link"
                                >
                                  <RiArrowUpDownLine color="primary" />
                                </Button>
                              </th>
                            </Fragment>
                          )}
                          <th>Status</th>
                          {getRole() === "Admin" &&
                                requestStatus !== "Pending" && <th>Action</th> }
                        </tr>
                      </thead>
                      <tbody>
                        {requestData && requestData.length > 0 ? (
                          stableSort(
                            requestData,
                            getSorting(order, orderBy)
                          ).map((record, index) => {
                            const {
                              requestId,
                              teamId,
                              requestedBy,
                              supplierEmail,
                              requestStatus,
                              requestDate,
                              companyName,
                              companyLogo,
                              requestedName,
                              requestedEmail,
                              supplierCompanyName,
                            } = record;
                            return (
                              <tr key={`request_${index}`}>
                                {getRole() === "Supplier" ? (
                                  <Fragment>
                                    <td>{companyName}</td>
                                    <td>{requestedName}</td>
                                    <td>{requestedEmail}</td>
                                  </Fragment>
                                ) : (
                                  <Fragment>
                                    <td>{supplierCompanyName}</td>
                                    <td>{supplierEmail}</td>
                                  </Fragment>
                                )}
                                <td>
                                  <Badge
                                    color={
                                      requestStatusStyleConfig[requestStatus]
                                    }
                                  >
                                    {requestStatus}
                                  </Badge>
                                </td>
                                {getRole() === "Admin" &&
                                requestStatus !== "Pending" ? (
                                  <td>
                                    <Button
                                      color=""
                                      size="sm"
                                      className="actionBtn"
                                      onClick={(e) => onClickDeleteRequest(e)}
                                      data-id={requestId}
                                      data-requeststatus={requestStatus}
                                    >
                                      {requestStatus === "Deactivated" ? (
                                        <FaToggleOff></FaToggleOff>
                                      ) : (
                                        <FaToggleOn></FaToggleOn>
                                      )}
                                    </Button>
                                  </td>
                                ) : (
                                  ""
                                )}
                                {getRole() == "Supplier" ? (
                                  <td>
                                    {requestStatus == "Accepted" ||
                                    requestStatus == "Deactivated" ? (
                                      ""
                                    ) : (
                                      <UncontrolledDropdown setActiveFromChild>
                                        <DropdownToggle
                                          tag="a"
                                          className="nav-link"
                                          caret
                                        >
                                          Status Change
                                        </DropdownToggle>
                                        <DropdownMenu>
                                          <DropdownItem
                                            onClick={statusChange}
                                            data-request_id={requestId}
                                          >
                                            Accept
                                          </DropdownItem>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    )}
                                  </td>
                                ) : <td></td>}
                              </tr>
                            );
                          })
                        ) : (
                          <CustomTableEmptyRecord columnsCount={8} />
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
                            name="rowperpage"
                            id="exampleSelect"
                            onChange={RowHandler}
                            value={rowperpage}
                          >
                            {[10, 20, 30].map((i) => {
                              return (
                                <option key={`showing_${i}`} value={i}>
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
                  </CardBody>
                </Card>
              </Col>
            </div>
          </Container>
        </div>
      </div>
      {requestModal && (
        <AddRequest
          addToggle={addToggle}
          requestModal={requestModal}
          successCallBack={successCallBack}
        />
      )}
    </Fragment>
  );
}
