import React, { Fragment, useEffect, useState, useRef } from "react";
import {
  Container,
  Button,
  CardHeader,
  Card,
  Table,
  Spinner,
  CardBody,
  FormGroup,
  Input,
  Row,
  Col,
  UncontrolledCollapse,
  CustomInput,
  NavLink,
  Nav,
  NavItem,
  TabContent,
  TabPane,
  Label,
  Form,
  FormFeedback,
} from "reactstrap";
import Sidebar from "./layout/Sidebar";
import Addmember from "./Addmember";
import Pagination from "react-js-pagination";
import {
  GET_USER_BY_ID,
  GET_USERS,
  GET_TEAMDETAILS_BY_ID,
  DELETE_TEAM_MEMBER,
  GET_SUPPLIER_LIST_URL,
  TEAM_MEMBER_ASSIGN,
  USER_EMAIL_LIST_URL,
  GET_ASSIGNED_TEAM_LIST,
  GET_EXCEPTION_HANDLER_ROLE_URL
} from "./common/url";
import { authHeader, getAlertToast } from "./common/mainfunctions";
import API from "./redux/API";
import {
  Name,
  getTeamID,
  getUserId,
  stableSort,
  enCryptFun,
  deCryptFun,
  getEmail,
} from "./common/functions";
import { MdModeEdit } from "react-icons/md";
import { RiArrowUpDownLine } from "react-icons/ri";
import Swal from "sweetalert2";
import { FaFilter, FaToggleOff, FaToggleOn, FaTrash } from "react-icons/fa";
import { debounce, filter } from "underscore";
import classnames from "classnames";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from 'react-select'


var initialValues = {
  userId: "",
  firstName: "",
  lastName: "",
  approvalAmountTo: "",
  password: "",
  confirmpassword: "",
  email: "",
  phoneNumber: "",
  profileLogo: "",
};

export default function MyTeam() {
  const [member, setMember] = useState(false);
  const [Data, setData] = useState([]);
  const [teamData, setTeamData] = useState([])
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState(false);
  const [Sort, setSort] = useState(false);
  const [totalrecords, setTotalRecords] = useState(0);
  const [rowperpage, setRowPerPage] = useState(10);
  const [currentpage, setCurrentPage] = useState(0);
  const [formValues, setFormValues] = useState(initialValues);
  const [teamDetails, setTeamDetails] = useState({});
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("firstName");
  const [cnum, setCodeNum] = useState();
  const [activeTab, setActiveTab] = useState("1");
  const [supplierList, setSupplierList] = useState([])
  const [suppName, setSuppName] = useState("")
  const [teamMemberList, setTeamMemberList] = useState([])
  const [assignedTeamList, setAssignedTeamList] = useState([])
  const [viewMembers , setViewMembers]=useState(true)

  const [teamUserId, setTeamUserId] = useState(null)
  const[exHandlerRole,SetExHandlerRole]=useState([]);
  //filter section
  const [filter, setFilter] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });

  const tabToggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  //Debounce
  const delayedQuery = useRef(
    debounce(
      (filter, rowperpage, currentpage) =>
        GetMember({ ...filter, count: rowperpage, offset: currentpage }),
      500
    )
  ).current;

  //Onchange filter
  const onChangeFilterHandler = ({ target: { name, value } }) => {
    setCurrentPage(0);
    setFilter({ ...filter, [name]: value });
  };

  const ResetFilter = () => {
    setFilter({ email: "", firstName: "", lastName: "" });
  };
  //end  filter section

  const RowHandler = (e) => {
    setCurrentPage(0);
    setRowPerPage(e.target.value);
  };

  const onPageChange = (page) => {
    setCurrentPage(page - 1);
  };

  let addToggle = () => {
    setFlag(false);
    setMember(!member);
    const { autoApproval } = teamDetails;
    setFormValues({
      userId: "",
      firstName: "",
      lastName: "",
      approvalAmountTo: "",
      password: "",
      confirmpassword: "",
      email: "",
      phoneNumber: "",
      profileLogo: "",
      address: "",
      userRole:"",
      exceptionRoleIdList:""
    });
    setCodeNum("");
  };

  const successCallBack = () => {
    GetMember();
    const { autoApproval } = teamDetails;
    setFormValues({
      userId: "",
      firstName: "",
      lastName: "",
      approvalAmountTo: "",
      password: "",
      confirmpassword: "",
      email: "",
      phoneNumber: "",
      profileLogo: "",
      address: "",
    });
    setCodeNum("");
    setMember(false);
  };

  let CloseToggle = () => {
    setMember(false);
  };

  //Sorting
  const handleSortFunc = (event) => {
    const { sort_by } = event.currentTarget.dataset;

    Data.sort(Name(sort_by, Sort == true ? "desc" : "asc"));
    setSort(!Sort);
    setData([...Data]);
  };



  const validationSchema = Yup.object().shape({
    supplierName: Yup.string().email("Invalid email").required("Required"),
    teamMemberName: Yup.string().required("Required"),
  });

  const { handleSubmit, handleChange, values, handleBlur, errors, touched } =
    useFormik({
      initialValues: {
        supplierName: "",
        teamMemberName: "",
      },
      // validationSchema,
      onSubmit: (values) => saveFormValues(values),
    });


  const saveFormValues = (values) => {
    console.log("formvalues", values)
  }

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
      const { status, data: initialResponse = [] } = JSON.parse(l);
      if (status === "Success") {
        setTeamDetails(initialResponse[0]);
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

  // let getSupplierList = async () => {
  //   const config = {
  //     method: "GET",
  //     url: USER_EMAIL_LIST_URL,
  //     headers: authHeader(),
  //     params: {
  //       // entityType: "Supplier",
  //       // offset: 0,
  //       // count: 1000,
  //       // teamId: getTeamID(),
  //       webString: enCryptFun(
  //         JSON.stringify({
  //           //email:getEmail(),
  //           entityType: "Supplier",
  //           offset: 0,
  //           count: 1000,
  //           teamId: getTeamID(),
  //         })
  //       ),
  //       flutterString: "",
  //     },
  //   };
  //   try {
  //     const response = await API(config);
  //     // const { status, data, count } = response.data;
  //     let l = deCryptFun(response.data);
  //     const { status, data, count } = JSON.parse(l);
  //     console.log("jsonParsed", JSON.parse(l))
  //     if (status === "Success") {

  //       setSupplierList(data);

  //     }
  //   } catch (error) {
  //     console.error(error);
  //     if (error.response) {
  //       let { data } = error.response

  //       let p = deCryptFun(data);
  //       let v = JSON.parse(p)
  //       // console.log("error data new",  v.message)
  //       // Swal.fire("Error", v.message);
  //     }
  //   } finally {
  //   }
  // };

  const getSupplierList = async () => {
    console.log("supplier call")
    const config = {
      method: "GET",
      url: GET_SUPPLIER_LIST_URL,
      headers: authHeader(),
      params: {
        webString: enCryptFun(
          JSON.stringify({
            supplierId: getEmail()
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      // const { data } = response.data;
      let l = deCryptFun(response.data);
      const { data } = JSON.parse(l);
      console.log("supplier data", data)
      setSupplierList(data);
    } catch (error) {
      console.error(error);
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        //Swal.fire(getAlert("Error", v.message));
      }
    }
  };

  let GetMember = async (filterparams) => {
    console.log("filterparams", filterparams)
    const config = {
      method: "GET",
      url: GET_USERS,
      headers: authHeader(),
      params: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            userRole: "Team Member",
            ...filterparams,
          })
        ),
        flutterString: ""
      },
      // params:{
      //    teamId: getTeamID(),
      //       userRole: "Team Member",
      //       ...filterparams,
      // }
    };
    try {
      // setLoading(true)
      const response = await API(config);

      let l = deCryptFun(response.data);


      const { status, data, count } = JSON.parse(l);
      // const { status, data, count } = response.data;
      if (status === "Success") {
        setData(data);
        console.log("getMemberData", data)
        setTotalRecords(count);
        console.log("count", count)
        // setLoading(false)
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
      //  setLoading(false);
    }
  };

  let GetTeamMember = async () => {
    const config = {
      method: "GET",
      url: GET_USERS,
      headers: authHeader(),
      params: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            userRole: "Team Member",
            count: totalrecords,
            offset:0
          })
        ),
        flutterString: ""
      },
      // params:{
      //    teamId: getTeamID(),
      //       userRole: "Team Member",
      //       ...filterparams,
      // }
    };
    try {
      // setLoading(true)
      const response = await API(config);

      let l = deCryptFun(response.data);


      const { status, data, count } = JSON.parse(l);
      // const { status, data, count } = response.data;
      if (status === "Success") {
        //setData(data);
        console.log("getAllMemberData", data)
       // setTotalRecords(count);
       setTeamData(data)
        console.log("count", count)
        // setLoading(false)
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
      //  setLoading(false);
    }
  };

  

  let UpdateUser = async (userId) => {
    setMember(true);
    const config = {
      method: "GET",
      url: GET_USER_BY_ID,
      headers: authHeader(),
      params: {
        // userId: userId,
        webString: enCryptFun(
          JSON.stringify({
            userId: userId,
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

      if (status === "Success") {
        const { countryCode, phoneNumber } = data[0];

        setFormValues(data[0]);
        const codeandNum = countryCode + phoneNumber;
        setCodeNum(codeandNum);
        setFlag(true);
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
      //  setLoading(false);
    }
  };

  const getExceptionHandlerRoles = async () => {
    // console.log("handler roles")
    const config = {
        method: "GET",
        url: GET_EXCEPTION_HANDLER_ROLE_URL,
        Headers: authHeader(),
        params: {
            webString: enCryptFun(
                JSON.stringify({
                    "role": "role"
                })
            ),
            flutterString: "",
        },


    }
    try {
        const response = await API(config)
        let response_decrypt = deCryptFun(response.data);
        const { data,status } = JSON.parse(response_decrypt);

        
        if (status == "Success") {
          SetExHandlerRole(data)
        }

    } catch (error) {

    }
}

  useEffect(() => {
    getTeamDetailsById();
    getExceptionHandlerRoles();

    setFlag(false);
  }, []);

  useEffect(() => {
    GetTeamMember();
  }, [totalrecords])

  useEffect(() => {
    GetMember();
    getSupplierList();
  }, []);
  useEffect(() => {
    delayedQuery(filter, rowperpage, currentpage);
  }, [filter, rowperpage, currentpage]);

  const { email, firstName, lastName } = filter;
  const [status, setStatus] = useState();

  const deleteMember = async (memberId, isactive) => {
    let activeVal = isactive == 1 ? 0 : 1;
    const configmember = {
      method: "DELETE",
      url: DELETE_TEAM_MEMBER,
      headers: authHeader(),
      params: {
        // userId: memberId,
        // isActive: isactive == 1 ? 0 : 1,
        webString: enCryptFun(
          JSON.stringify({
            userId: memberId,
            isActive: activeVal,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(configmember);
      //const { status, data, message } = response.data;
      let l = deCryptFun(response.data);
      const { status, data, message } = JSON.parse(l);

      if (status === "Success") {
        // if (isactive == 1) {
        //   Swal.fire(getAlertToast("success", "User deactivated successfully"));
        // } else {
        //   Swal.fire(getAlertToast("success", "User reactivated successfully"));
        // }
        Swal.fire(getAlertToast("success", message));

        GetMember();
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      //Swal.fire(getAlertToast("error", message));
      if (error.response) {
        let { data } = error.response;
        let decryptErr = deCryptFun(data);
        let parsedErr = JSON.parse(decryptErr);
        // console.log("error data new", parsedErr.message);
        Swal.fire("Error", parsedErr.message);
      }
    }
  };
  const onClickDeleteMember = (e) => {
    const memberId = e.currentTarget.dataset.id;
    const isactive = e.currentTarget.dataset.isactive;
    setStatus(0);
    Swal.fire({
      title: "Are you sure?",
      text:
        isactive == 1
          ? "Do you want to deactivate this user?"
          : "Do you want to activate this user?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.value) {
        deleteMember(memberId, isactive);
      }
    });
  };

  const assignTeamMember = async () => {
    let newStructuredData = teamMemberList.map(el => {
      let properties = {}
      properties = {
        "assignSupplierId": 0,
        "teamUserId": el.teamUserId,
        "supplierName": suppName,
        "isDeleted": el.isDeleted
      }
      return properties;
    })
    console.log("onSaving", {
      teamId: getTeamID(),
      teamList: newStructuredData
    })
    const config = {
      method: "POST",
      url: TEAM_MEMBER_ASSIGN,
      headers: authHeader(),
      data: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            teamList: newStructuredData
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      // const { data } = response.data;
      let l = deCryptFun(response.data);
      const { data } = JSON.parse(l);
      console.log("saved data", data)
      Swal.fire(
        getAlertToast(
          "Success",
          "Team member added successfully"
        )
      )
      console.log("Before call suppname", suppName)
      getAssignedTeamList(suppName)
      // setSupplierList(data);
    } catch (error) {
      console.error(error);
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        //Swal.fire(getAlert("Error", v.message));
      }
    }

  }

  const getAssignedTeamList = async (suppname) => {
    setTeamMemberList([])
    console.log("team list call")
    const config = {
      method: "GET",
      url: GET_ASSIGNED_TEAM_LIST,
      headers: authHeader(),
      params: {
        webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
            supplierName: suppname
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      // const { data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      console.log("assigned team list data", JSON.parse(l))
      // setSupplierList(data);
      if (status == "Success") {
        console.log("assigned team list data", data)
        setAssignedTeamList(data)
        let teammemberobject = data.map(el => {
          let properties = {}
          properties = { "teamUserId": el.teamUserId, "isDeleted": el.isDeleted }
          return properties
        })
        console.log("teammember", teammemberobject)
        // setTeamMemberList(teammemberobject)
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        //Swal.fire(getAlert("Error", v.message));
      }
    }
  }

  const handlesupplierNameChange = (e) => {
    setSuppName(e.target.value);
    console.log("supplier name", e.target.value)
    if(e.target.value === ""){
      setAssignedTeamList([])
    } else{
    getAssignedTeamList(e.target.value)
    }
  }

  const teamMemberhandleChange = (e, userId) => {
    console.log("eeeee", e.target.checked, userId)
    if (e.target.checked === true) {
      //let isDeleted=0
      let newlist = { teamUserId: userId, isDeleted: 0 }
      // teamMemberList.teamUserId=[userId]
      setTeamMemberList([...teamMemberList, newlist])
      console.log("ghghh", teamMemberList)

    }
    // else if(teamMemberList.includes(userId)){
    //   console.log("teamMemberListinside")
    //    setTeamMemberList( teamMemberList.filter((el)=>{
    //       return el != userId
    //     }))

    // }
    else if (teamMemberList.map(el => {
      return el.teamUserId === userId
    })) {
      setTeamMemberList(teamMemberList.filter((el) => {
        return el.teamUserId != userId
      }))

    }
  }

  const deleteTeamMemberfromSupplier = async(teamid, assignSupplierId) => {
  let deletedData = [{
      "assignSupplierId": assignSupplierId,
      "teamUserId": teamid,
      "supplierName": suppName,
      "isDeleted": 1
    }]
  console.log("ondelete", {
             teamId: getTeamID(),
  teamList: deletedData
          })
    const config = {
      method: "POST",
      url:TEAM_MEMBER_ASSIGN,
      headers: authHeader(),
      data: {
        webString: enCryptFun(
          JSON.stringify({
             teamId: getTeamID(),
  teamList: deletedData
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(config);
      // const { data } = response.data;
      let l = deCryptFun(response.data);
      const { data } = JSON.parse(l);
      console.log("saved data", data)
      Swal.fire(
                getAlertToast(
                  "Success",
                   "Team member removed from supplier successfully"
                )
              )
              console.log("Before call suppname", suppName)
        getAssignedTeamList(suppName)
     // setSupplierList(data);
    } catch (error) {
      console.error(error);
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
        // console.log("error data new",  v.message)
        //Swal.fire(getAlert("Error", v.message));
      }
    }
  
  }

  const teamMemberhandledelete=(teamid,assignSupplierId)=>{
  //const teamUserId 
    //const isactive = e.currentTarget.dataset.isactive;
  console.log('ondelete call', teamid,assignSupplierId)
  Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this user?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.value) {
        deleteTeamMemberfromSupplier(teamid,assignSupplierId)
      }
    });
 

  }

  const viewMemberAction =() =>{
    setViewMembers(!viewMembers)
    console.log(viewMembers);
  }

  console.log("teamMemberList", teamMemberList)
  return (
    <Fragment>
      <div className="wrapper">
        <Sidebar />
        <div className="page-content-wrapper">
          <Container fluid={true}>
            <div className="page-title">
              <h3 className="ml-3">My Team</h3>
            </div>

            <Card>
              {/* <CardHeader> */}
              {/* Accounts Payable Team */}
              <Nav tabs className="mt-3 mb-4 ml-4 mr-4">
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "1" })}
                    onClick={() => {
                      tabToggle("1");
                    }}
                  >
                    Accounts Payable Team
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => {
                      tabToggle("2");
                    }}
                  >
                    Approver Assignment
                  </NavLink>
                </NavItem>
              </Nav>
              {activeTab === "1" && <div className="team-filterBtn">
                <Button
                  color="primary"
                  className="filterBtn mr-2"
                  id="toggler"
                >
                  <FaFilter />
                </Button>
                <Button onClick={() => addToggle()} color="primary">
                  ADD
                </Button>
              </div>}
              {/* </CardHeader> */}
             {activeTab === "1" &&  <UncontrolledCollapse toggler="#toggler">
                <Card className="filterCard">
                  <Row>
                    <Col md="3">
                      <FormGroup>
                        <Input
                          type="text"
                          onChange={onChangeFilterHandler}
                          value={email}
                          name="email"
                          id="email"
                          placeholder="Email"
                        />
                      </FormGroup>
                    </Col>

                    <Col md="3">
                      <FormGroup>
                        <Input
                          type="text"
                          onChange={onChangeFilterHandler}
                          value={firstName}
                          name="firstName"
                          id="firstName"
                          placeholder="First Name"
                        />
                      </FormGroup>
                    </Col>

                    <Col md="3">
                      <FormGroup>
                        <Input
                          type="text"
                          onChange={onChangeFilterHandler}
                          value={lastName}
                          name="lastName"
                          id="lastName"
                          placeholder="Last Name"
                        />
                      </FormGroup>
                    </Col>

                    <Col md="3">
                      <Button color="primary" onClick={() => ResetFilter()}>
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </UncontrolledCollapse>}
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <CardBody>
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>
                            First Name
                            <Button
                              data-sort_by={"firstName"}
                              onClick={handleSortFunc}
                              className="sortBtn"
                              color="link"
                            >
                              <RiArrowUpDownLine color="primary" />
                            </Button>
                          </th>
                          <th>
                            Last Name
                            <Button
                              data-sort_by={"lastName"}
                              onClick={handleSortFunc}
                              className="sortBtn"
                              color="link"
                            >
                              <RiArrowUpDownLine color="primary" />
                            </Button>
                          </th>
                          <th>
                            Email{" "}
                            <Button
                              data-sort_by={"email"}
                              onClick={handleSortFunc}
                              className="sortBtn"
                              color="link"
                            >
                              <RiArrowUpDownLine color="primary" />
                            </Button>{" "}
                          </th>
                          <th>
                            Phone Number
                            <Button
                              data-sort_by={"phoneNumber"}
                              onClick={handleSortFunc}
                              className="sortBtn"
                              color="link"
                            >
                              <RiArrowUpDownLine color="primary" />
                            </Button>
                          </th>
                          <th>
                            Maximum Range
                            <Button
                              data-sort_by={"approvalAmountTo"}
                              onClick={handleSortFunc}
                              className="sortBtn"
                              color="link"
                            >
                              <RiArrowUpDownLine color="primary" />
                            </Button>
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          ""
                        ) : Data.length === 0 ? (
                          <tr>
                            <td colSpan={7}>
                              <center>No Record Found</center>
                            </td>
                          </tr>
                        ) : (
                          <>
                            {Data.map((data, index) => {
                              const {
                                userId,
                                firstName,
                                lastName,
                                email,
                                phoneNumber,
                                approvalAmountTo,
                                userRole,
                                isActive,
                              } = data;
                              return (
                                <tr key={`listing_${index}`}>
                                  <td>{firstName}</td>
                                  <td>{lastName}</td>
                                  <td>{email}</td>
                                  <td>{phoneNumber}</td>
                                  <td>${approvalAmountTo}</td>
                                  <td>
                                    {/* {parseInt(getUserId()) !== parseInt(userId) && ( */}
                                    <Button
                                      className="table-btn"
                                      onClick={() => UpdateUser(userId)}
                                      color="link"
                                    >
                                      <MdModeEdit />
                                    </Button>
                                    {/* )} */}
                                    {userRole === "Team Member" ? (
                                      <Button
                                        className="table-btn"
                                        size="lg"
                                        onClick={(e) => onClickDeleteMember(e)}
                                        color="link"
                                        data-id={userId}
                                        data-isactive={isActive}
                                      >
                                        {isActive === 1 ? (
                                          <FaToggleOn></FaToggleOn>
                                        ) : (
                                          <FaToggleOff></FaToggleOff>
                                        )}
                                      </Button>
                                    ) : (
                                      ""
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        )}
                      </tbody>
                    </Table>

                    <div className="teamSipScroll">
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
                </TabPane>
                <TabPane tabId="2">
                  <Form >
                    <Row>

                      <Col md="6">
                        <Label>Supplier</Label>
                        <Input
                          type="select"
                          name="supplierName"
                          id="supplierName"
                          onChange={handlesupplierNameChange}
                          value={suppName}
                        >
                          <option value={""}>Select</option>
                          {supplierList.map((el, i) => {
                            const {
                              supplierName

                            } = el
                            return (
                              <option key={i} value={supplierName}>
                                {supplierName}
                              </option>
                            );
                          })}
                        </Input>
                        </Col>
                        <Col md="3">
                         {suppName !="" &&
                        <Button
                          style={{ margin: '30px' }}
                          id="line"
                          //className="btn-left"
                          color="primary"
                          size="sm"
                           onClick={viewMemberAction}
                        >
                          {viewMembers ? 'Add Member' : 'View Team'}
                         
                          
                        </Button>
}
                        
                        <FormFeedback
                        >
                          {errors.supplierName && touched.supplierName ? errors.supplierName : ""}
                        </FormFeedback>

                      </Col>
                      <Col md="3">

                     
                      </Col>

                    </Row>
                   
                      <Row>
                        {viewMembers ? (
                         <Col md="12" className="mt-3">
                     Assigned Team Members
                     <Table hover responsive>
                       <thead>
                         <tr>

                           <th>
                             First Name
                             <Button
                               data-sort_by={"firstName"}
                               onClick={handleSortFunc}
                               className="sortBtn"
                               color="link"
                             >
                               <RiArrowUpDownLine color="primary" />
                             </Button>
                           </th>
                           <th>
                             Last Name
                             <Button
                               data-sort_by={"firstName"}
                               onClick={handleSortFunc}
                               className="sortBtn"
                               color="link"
                             >
                               <RiArrowUpDownLine color="primary" />
                             </Button>
                           </th>
                           <th>
                             Email{" "}
                             <Button
                               data-sort_by={"email"}
                               onClick={handleSortFunc}
                               className="sortBtn"
                               color="link"
                             >
                               <RiArrowUpDownLine color="primary" />
                             </Button>{" "}
                           </th>
                           <th>
                             Approval Amount
                             <Button
                               data-sort_by={"firstName"}
                               onClick={handleSortFunc}
                               className="sortBtn"
                               color="link"
                             >
                               <RiArrowUpDownLine color="primary" />
                             </Button>
                           </th>
                           <th>
                             Delete

                           </th>
                         </tr>
                       </thead>
                       <tbody>
                         {(assignedTeamList.length === 0 ) ? (
                           <tr>
                             <td colSpan={5}>
                               <center>No Record Found</center>
                             </td>
                           </tr>
                         ) : (
                           <>
                             {assignedTeamList && assignedTeamList.map((data, index) => {
                               const {
                                 assignSupplierId,
                                 teamUserId,
                                 isDeleted,
                               } = data;
                               let teamMemberData = (teamData.filter(el => { return el.userId === teamUserId }))
                               console.log("teamMemberData", teamMemberData)
                               return (
                                 <>
                                 { teamMemberData[0] && <tr key={`listing_${index}`}>

                                   <td>{teamMemberData[0].firstName}</td>
                                   <td>{teamMemberData[0].lastName}</td>
                                   <td>{teamMemberData[0].email}</td>
                                   <td>{teamMemberData[0].approvalAmountTo}</td>
                                    <td>
                                     <Button
                                      className="table-btn"
                                      onClick={() => teamMemberhandledelete(teamUserId,assignSupplierId)}
                                      color="link"
                                    >
                                      <FaTrash />
                                    </Button>
                                   </td> 
                                 </tr>}
                                 </>
                               );
                             })}
                           </>
                         )}
                       </tbody>



                     </Table>

                   </Col>):
                        (<Col md="12" className="mt-3">
                          <div style={{display:"flex", justifyContent:"space-between"}}>
                         Add Team Member
                          
                          { viewMembers ? '':
                        <div className="mb-2"><Button
                        //style={{ margin: '30px' }}
                        id="line"
                       
                        color="primary"
                        size="sm"
                        onClick={()=>assignTeamMember()}
                      >
                        Save
                      </Button></div>}
                          </div>
                          <Table hover responsive>


                            <thead>
                              <tr>
                               
                                <th>
                                  First Name
                                  <Button
                                    data-sort_by={"firstName"}
                                    onClick={handleSortFunc}
                                    className="sortBtn"
                                    color="link"
                                  >
                                    <RiArrowUpDownLine color="primary" />
                                  </Button>
                                </th>
                                <th>
                             Last Name
                             <Button
                               data-sort_by={"firstName"}
                               onClick={handleSortFunc}
                               className="sortBtn"
                               color="link"
                             >
                               <RiArrowUpDownLine color="primary" />
                             </Button>
                           </th>
                                <th>
                                  Email{" "}
                                  <Button
                                    data-sort_by={"email"}
                                    onClick={handleSortFunc}
                                    className="sortBtn"
                                    color="link"
                                  >
                                    <RiArrowUpDownLine color="primary" />
                                  </Button>{" "}
                                </th>
                                <th>
                                 Approval Amount
                                  <Button
                                    data-sort_by={"firstName"}
                                    onClick={handleSortFunc}
                                    className="sortBtn"
                                    color="link"
                                  >
                                    <RiArrowUpDownLine color="primary" />
                                  </Button>
                                </th>
                                 <th>
                                  Action

                                </th>
                              </tr>
                            </thead>
                            <tbody>



                              {loading ? (
                                ""
                              ) : Data.length === 0 ? (
                                <tr>
                                  <td colSpan={5}>
                                    <center>No Record Found</center>
                                  </td>
                                </tr>
                              ) : (
                                <>
                                  {
                                    (Data.filter(function (cv) {
                                      return !assignedTeamList.find(function (e) {
                                        return e.teamUserId == cv.userId;
                                      });
                                    })).map((data, index) => {
                                      const {
                                        userId,
                                        firstName,
                                        lastName,
                                        email,
                                        phoneNumber,
                                        approvalAmountTo,
                                        userRole,
                                        isActive,
                                      } = data;
                                      return (
                                        <tr key={`listing_${index}`}>
                                         
                                          <td>{firstName}</td>
                                          <td>{lastName}</td>
                                          <td>{email}</td>
                                          <td>
                                            {approvalAmountTo}
                                          </td>
                                           <td> <Input
                                            type="checkbox"
                                            //checked={teamMemberList.includes(userId)}
                                            checked={(teamMemberList.map(function (obj) {
                                              return obj.teamUserId;
                                            })).includes(userId)}
                                            onChange={(e) =>
                                              teamMemberhandleChange(e, userId)}
                                          /></td>
                                        </tr>
                                      );
                                    })}
                                </>
                              )}
                            </tbody>



                          </Table>
                          <div className="pagenationSetion">
                             {/* page filters  */}
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
                        </Col>)
                        
                      }
                      </Row>
                  </Form>
                 

                </TabPane>
              </TabContent>
            </Card>
          </Container>
        </div>
      </div>
      {/* model */}
      {member && (
        <Addmember
          formValues={formValues}
          codeandNum={cnum}
          CloseToggle={CloseToggle}
          member={member}
          successCallBack={successCallBack}
          flag={flag}
          teamDetails={teamDetails}
          handlerRoles={exHandlerRole}
        />
      )}
      {/* end model */}
    </Fragment>
  );
}
