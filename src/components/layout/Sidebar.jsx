import React, { Fragment, useState, useEffect } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarText,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
} from "reactstrap";
import {
  SIGNIN_ROUTE,
  INVOICE_ROUTE,
  MY_TEAM_ROUTE,
  MANAGE_PROFILE_ROUTE,
  DASHBOARD_ROUTE,
  UPLOAD_INVOICE_ROUTE,
  REQUIREDFIELD_ROUTE,
  REQUEST_ROUTE,
  INITIAL_ROUTE,
  METRICS_ROUTE,
} from "../../constants/RoutePaths";
import Swal from "sweetalert2";
import logo from "../../images/logo.png";
import fav from "../../images/appIcon.png";
import defaultCompanyLogo from "../../images/logo-placeholder.jpg";
import defaultProfile from "../../images/placeholder-profile.jpg";
import { AiFillHome } from "react-icons/ai";
import { IoPeople } from "react-icons/io5";
import { RiFileSettingsFill } from "react-icons/ri";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { deCryptFun, enCryptFun, getRole, getUserId } from "../common/functions";
import { authHeader, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import { GET_USER_BY_ID, USER_SIGN_OUT_URL,UNLOCK_INVOICE_URL } from "../common/url";
import { useDispatch, useSelector } from "react-redux";
import { sideBarFlag } from "../redux/initialStore";
import { UPDATE_SIDEBAR_FLAG } from "../redux/actionTypes";
import { UncontrolledTooltip } from "reactstrap";
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [responsiveClass, setResponsiveClass] = useState("");
  const [sidebarflag, setSidebarFlag] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  let history = useHistory();
  const [activeMenu, setActiveItem] = useState("/");
  const { profilePic = "" } = useSelector((state) => state.userDetails);
  const { companyLogo = "" } = useSelector((state) => state.teamDetails);
  const dispatch = useDispatch();
  let location = useLocation();
  useEffect(() => {
    let currentActive = window.location.pathname.split("/")[1] || "/";
    setActiveItem(currentActive);
  }, [location]);

  let onLogoClick = () => {
    history.push(INVOICE_ROUTE);
  };
  const toggleSideBar = () => {
    dispatch({
      type: UPDATE_SIDEBAR_FLAG,
    });
  };
  const onClickMenuBtn = () => {
    if (responsiveClass === "") {
      setResponsiveClass("responsiveMenu");
    } else {
      setResponsiveClass("");
    }
  };
  const logOutFun = async () => {
    const config = {
      method: "PUT",
      url: USER_SIGN_OUT_URL,
      headers: authHeader(),
      data: {// userId: getUserId(),
        webString: enCryptFun(
          JSON.stringify({
           userId: getUserId(),
          })
        ),
        flutterString: "",
      },
    };
    try {
      console.log("from logout")
      const response = await API(config);
     // const { status } = response.data;
       let l = deCryptFun(response.data);
      const { status} = JSON.parse(l);
      if (status == "Success") {
        Swal.fire(getAlertToast("success", "logout successful"));
        localStorage.clear();
        history.push(SIGNIN_ROUTE);
      }
    } catch (error) {
      console.error(error);
    }
  };




 

  let unLockInvoice = async () =>{
  
    const config = {
      method: "DELETE",
      url: UNLOCK_INVOICE_URL,
      headers: authHeader(),
      params: {
        // invoiceId: invoiceID,
        // lockedBy: getUserId(),
        webString: enCryptFun(
          JSON.stringify({
             invoiceId: localStorage.getItem("ID"),
            lockedBy: getUserId(),
          })
        ),
        flutterString: "",
      },
    };
    try {
      console.log("scuccess")
      const response = await API(config);
      //const { status } = response.data;
      let l = deCryptFun(response.data);
      const { status ,message} = JSON.parse(l);
      if (message == "Success") {
        logOutFun();
        console.error("success");
      }
    } catch (error) {
      console.log("error")
      if (error.response) {
        let { data } = error.response

        let p = deCryptFun(data);
        let v = JSON.parse(p)
       console.log("error data new",  v.message)
        // Swal.fire(getAlert("Error", v.message));
      }
    } 

  }
  let Logout = () => {
   let editStatus= localStorage.getItem("EDIT_IN_PROESS")
   console.log(editStatus,"testedit")
   
    Swal.fire({
      title: "Are you sure?",
      text: "You want to signout",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        {editStatus == false || editStatus == null ? logOutFun() : unLockInvoice()}
        
        // if(editStatus == false){
        // logOutFun();
        // }
        // else if(getRole() !='Admin'){
        //   logOutFun();
        // }
        // else{
        //  // logOutFun();
        //    unLockInvoice()
        // }
      }
    });
  
  };
  const { flag = false } = useSelector((state) => state.sideBarFlag);
  // let amount;
  const [amount, setAmount] = useState();
  const amountFun = async () => {
    const configuser = {
      method: "GET",
      url: GET_USER_BY_ID,
      headers: authHeader(),
      params: {
       // userId: getUserId(),
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
     // const { status, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, data } = JSON.parse(l);
      if (status === "Success") {
        const { approvalAmountTo } = data[0];
        setAmount(approvalAmountTo);
        // amount = approvalAmountTo;
      }
    } catch (error) {
      Swal.fire("Error", error);
    }
  };
  useEffect(() => {
    amountFun();
  }, []);
  return (
    <Fragment>
      <div className={`responsiveMenuTop ${responsiveClass}`}>
        <Navbar
          className="mobNavbar"
          color="white"
          light
          expand="lg"
          sticky={"top"}
        >
          <Button
            className="MenuCollabseBtn"
            color="link"
            onClick={onClickMenuBtn}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15.022"
              height="12.759"
              viewBox="0 0 15.022 12.759"
            >
              <g
                id="Icon_feather-menu"
                data-name="Icon feather-menu"
                transform="translate(-3.5 -8)"
              >
                <path
                  id="Path_82"
                  data-name="Path 82"
                  d="M4.5,18H17.522"
                  transform="translate(0 -3.621)"
                  fill="none"
                  stroke="#575757"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  id="Path_83"
                  data-name="Path 83"
                  d="M4.5,9H17.522"
                  transform="translate(0)"
                  fill="none"
                  stroke="#575757"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  id="Path_84"
                  data-name="Path 84"
                  d="M4.5,27H17.522"
                  transform="translate(0 -7.241)"
                  fill="none"
                  stroke="#575757"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </g>
            </svg>
          </Button>

          <NavbarBrand href="/">
            <img src={logo} />
          </NavbarBrand>
          <NavbarText className="d-flex mob-drop">
            <Button color="link" onClick={() => onLogoClick()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18.029"
                height="18.029"
                viewBox="0 0 18.029 18.029"
              >
                <g
                  id="Icon_feather-search"
                  data-name="Icon feather-search"
                  transform="translate(-3.5 -3.5)"
                >
                  <path
                    id="Path_85"
                    data-name="Path 85"
                    d="M18.379,11.44A6.94,6.94,0,1,1,11.44,4.5,6.94,6.94,0,0,1,18.379,11.44Z"
                    fill="none"
                    stroke="#575757"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    id="Path_86"
                    data-name="Path 86"
                    d="M28.748,28.748l-3.773-3.773"
                    transform="translate(-8.634 -8.634)"
                    fill="none"
                    stroke="#575757"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </g>
              </svg>
            </Button>

            <UncontrolledDropdown setActiveFromChild>
              <DropdownToggle tag="a" className="nav-link p-0" caret>
                <img
                  className="mobUserIcon"
                  // alt="Profile"
                  // src="https://images.unsplash.com/photo-1601935111741-ae98b2b230b0?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1350&q=80"
                  src={
                    profilePic === "null" || !profilePic
                      ? defaultProfile
                      : profilePic
                  }
                />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem tag="a" onClick={() => Logout()}>
                  Logout
                  <svg
                    className="ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="15.656"
                    height="15.656"
                    viewBox="0 0 15.656 15.656"
                  >
                    <g
                      id="Icon_feather-log-out"
                      data-name="Icon feather-log-out"
                      transform="translate(-3.65 -3.65)"
                    >
                      <path
                        id="Path_303"
                        data-name="Path 303"
                        d="M9.152,18.456h-3.1A1.551,1.551,0,0,1,4.5,16.905V6.051A1.551,1.551,0,0,1,6.051,4.5h3.1"
                        fill="none"
                        stroke="#868686"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                      />
                      <path
                        id="Path_304"
                        data-name="Path 304"
                        d="M24,18.253l3.877-3.877L24,10.5"
                        transform="translate(-9.421 -2.899)"
                        fill="none"
                        stroke="#868686"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                      />
                      <path
                        id="Path_305"
                        data-name="Path 305"
                        d="M22.8,18H13.5"
                        transform="translate(-4.348 -6.522)"
                        fill="none"
                        stroke="#868686"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                      />
                    </g>
                  </svg>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </NavbarText>
        </Navbar>
        <div className="sidebar-wrapper">
          <div className="sidebarLogo">
            <Link to={INITIAL_ROUTE}>
              <img src={logo} className="logo" />
              <img src={fav} className="fav" />
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30.066"
                height="26.195"
                viewBox="0 0 30.066 26.195"
                onClick={toggleSideBar}
              >
                <path
                  id="Icon_open-menu"
                  data-name="Icon open-menu"
                  d="M0,0V3.758H30.066V0ZM0,11.162V14.92H30.066V11.162ZM0,22.437V26.2H30.066V22.437Z"
                />
              </svg> */}
            </Link>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30.066"
              height="26.195"
              viewBox="0 0 30.066 26.195"
              onClick={toggleSideBar}
            >
              <path
                id="Icon_open-menu"
                data-name="Icon open-menu"
                d="M0,0V3.758H30.066V0ZM0,11.162V14.92H30.066V11.162ZM0,22.437V26.2H30.066V22.437Z"
              />
            </svg>
          </div>

          {/* <div className={flag ? "sidebar-collabse" : ""}> */}
          {/* {sidebarflag ? ( */}
          <ul className="sidebar-nav">
            <li id="dashboardTooltip">
              <Link
                className={
                  ["/", "dashboard"].includes(activeMenu) ? "active" : ""
                }
                to={DASHBOARD_ROUTE}
              >
                <AiFillHome style={{ fontSize: 30 }} />
                <span>Dashboard</span>
              </Link>
              {flag ? (
                <UncontrolledTooltip
                  placement="right"
                  target="dashboardTooltip"
                >
                  Dashboard
                </UncontrolledTooltip>
              ) : (
                ""
              )}
            </li>
            <li>
              <Link
                id="invoiceTooltip"
                className={activeMenu === "invoice" ? "active" : ""}
                to={INVOICE_ROUTE}
              >
                <FaFileInvoiceDollar style={{ fontSize: 30 }} />
                <span>Invoices</span>
              </Link>
              {flag ? (
                <UncontrolledTooltip placement="right" target="invoiceTooltip">
                  Invoice
                </UncontrolledTooltip>
              ) : (
                ""
              )}
            </li>

            <li id="newinvoiceTooltip">
              <Link
                className={activeMenu === "upload-invoice" ? "active" : ""}
                to={UPLOAD_INVOICE_ROUTE}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23.344"
                  height="29.18"
                  viewBox="0 0 23.344 29.18"
                >
                  <path
                    id="Icon_material-note-add"
                    data-name="Icon material-note-add"
                    d="M20.59,3H8.918a2.914,2.914,0,0,0-2.9,2.918L6,29.262A2.914,2.914,0,0,0,8.9,32.18H26.426a2.927,2.927,0,0,0,2.918-2.918V11.754Zm2.918,20.426H19.131V27.8H16.213V23.426H11.836V20.508h4.377V16.131h2.918v4.377h4.377ZM19.131,13.213V5.189l8.025,8.025Z"
                    transform="translate(-6 -3)"
                  />
                </svg>

                <span>New Invoice</span>
              </Link>
            </li>
            {flag ? (
              <UncontrolledTooltip placement="right" target="newinvoiceTooltip">
                New Invoice
              </UncontrolledTooltip>
            ) : (
              ""
            )}

            {getRole() === "Admin" ? (
              <li id="teamTooltip">
                <Link
                  className={activeMenu === "my-team" ? "active" : ""}
                  to={MY_TEAM_ROUTE}
                >
                  <IoPeople style={{ fontSize: 30 }} />
                  <span>My Team</span>
                </Link>
                {flag ? (
                  <UncontrolledTooltip placement="right" target="teamTooltip">
                    My Team
                  </UncontrolledTooltip>
                ) : (
                  ""
                )}
              </li>
            ) : (
              ""
            )}

            <li id="profileTooltip">
              <Link
                className={activeMenu === "manage-profile" ? "active" : ""}
                to={MANAGE_PROFILE_ROUTE}
              >
                <svg
                  width="30"
                  height="30"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                >
                  <path d="M610.5 373.3c2.6-14.1 2.6-28.5 0-42.6l25.8-14.9c3-1.7 4.3-5.2 3.3-8.5-6.7-21.6-18.2-41.2-33.2-57.4-2.3-2.5-6-3.1-9-1.4l-25.8 14.9c-10.9-9.3-23.4-16.5-36.9-21.3v-29.8c0-3.4-2.4-6.4-5.7-7.1-22.3-5-45-4.8-66.2 0-3.3.7-5.7 3.7-5.7 7.1v29.8c-13.5 4.8-26 12-36.9 21.3l-25.8-14.9c-2.9-1.7-6.7-1.1-9 1.4-15 16.2-26.5 35.8-33.2 57.4-1 3.3.4 6.8 3.3 8.5l25.8 14.9c-2.6 14.1-2.6 28.5 0 42.6l-25.8 14.9c-3 1.7-4.3 5.2-3.3 8.5 6.7 21.6 18.2 41.1 33.2 57.4 2.3 2.5 6 3.1 9 1.4l25.8-14.9c10.9 9.3 23.4 16.5 36.9 21.3v29.8c0 3.4 2.4 6.4 5.7 7.1 22.3 5 45 4.8 66.2 0 3.3-.7 5.7-3.7 5.7-7.1v-29.8c13.5-4.8 26-12 36.9-21.3l25.8 14.9c2.9 1.7 6.7 1.1 9-1.4 15-16.2 26.5-35.8 33.2-57.4 1-3.3-.4-6.8-3.3-8.5l-25.8-14.9zM496 400.5c-26.8 0-48.5-21.8-48.5-48.5s21.8-48.5 48.5-48.5 48.5 21.8 48.5 48.5-21.7 48.5-48.5 48.5zM224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm201.2 226.5c-2.3-1.2-4.6-2.6-6.8-3.9l-7.9 4.6c-6 3.4-12.8 5.3-19.6 5.3-10.9 0-21.4-4.6-28.9-12.6-18.3-19.8-32.3-43.9-40.2-69.6-5.5-17.7 1.9-36.4 17.9-45.7l7.9-4.6c-.1-2.6-.1-5.2 0-7.8l-7.9-4.6c-16-9.2-23.4-28-17.9-45.7.9-2.9 2.2-5.8 3.2-8.7-3.8-.3-7.5-1.2-11.4-1.2h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c10.1 0 19.5-3.2 27.2-8.5-1.2-3.8-2-7.7-2-11.8v-9.2z" />
                </svg>

                <span>Manage Profile</span>
              </Link>
              {flag ? (
                <UncontrolledTooltip placement="right" target="profileTooltip">
                  Manage Profile
                </UncontrolledTooltip>
              ) : (
                ""
              )}
            </li>
            {getRole() === "Admin" ||
            // amount === -1 ||
            getRole() === "Super Admin" ? (
              <li id="settingTooltip">
                <Link
                  className={activeMenu === "required" ? "active" : ""}
                  to={REQUIREDFIELD_ROUTE}
                >
                  <svg
                    width="25"
                    height="25"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" />
                  </svg>

                  <span>Settings</span>
                </Link>
                {flag ? (
                  <UncontrolledTooltip
                    placement="right"
                    target="settingTooltip"
                  >
                    Settings
                  </UncontrolledTooltip>
                ) : (
                  ""
                )}
              </li>
            ) : (
              ""
            )}
            <li id="inviteTooltip">
              <Link
                className={activeMenu === "request" ? "active" : ""}
                to={REQUEST_ROUTE}
              >
                <svg
                  width="27"
                  height="30"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path d="M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z" />
                </svg>
                <span>
                  {getRole() === "Supplier" ? "My Clients" : "Invite Suppliers"}{" "}
                </span>
              </Link>
              {flag ? (
                <UncontrolledTooltip placement="right" target="inviteTooltip">
                  {getRole() === "Supplier" ? "My Clients" : "Invite Suppliers"}{" "}
                </UncontrolledTooltip>
              ) : (
                ""
              )}
            </li>
            {getRole() === "Admin" ? (
              <li id="newinvoiceTooltip">
                <Link
                  className={activeMenu === "metrics" ? "active" : ""}
                  to={METRICS_ROUTE}
                >
                  <svg
                    width="23.344"
                    height="29.18"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                  >
                    <path d="M377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-153 31V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm-96 299.2c0 6.4-6.4 12.8-12.8 12.8H76.8c-6.4 0-12.8-6.4-12.8-12.8v-70.4c0-6.4 6.4-12.8 12.8-12.8h38.4c6.4 0 12.8 6.4 12.8 12.8v70.4zm96 0c0 6.4-6.4 12.8-12.8 12.8h-38.4c-6.4 0-12.8-6.4-12.8-12.8V236.8c0-6.4 6.4-12.8 12.8-12.8h38.4c6.4 0 12.8 6.4 12.8 12.8v198.4zm32-134.4c0-6.4 6.4-12.8 12.8-12.8h38.4c6.4 0 12.8 6.4 12.8 12.8v134.4c0 6.4-6.4 12.8-12.8 12.8h-38.4c-6.4 0-12.8-6.4-12.8-12.8V300.8z" />
                  </svg>

                  <span>Metrics</span>
                </Link>
              </li>
            ) : (
              ""
            )}
          </ul>
          {/* ) : (
              ""
            )} */}
          {/* </div> */}
          <div className="sideUser-info">
            <Button onClick={() => onLogoClick()} color="link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17.098"
                height="17.098"
                viewBox="0 0 17.098 17.098"
              >
                <g
                  id="Icon_feather-search"
                  data-name="Icon feather-search"
                  transform="translate(-3.5 -3.5)"
                >
                  <path
                    id="Path_11"
                    data-name="Path 11"
                    d="M17.552,11.026A6.526,6.526,0,1,1,11.026,4.5,6.526,6.526,0,0,1,17.552,11.026Z"
                    fill="none"
                    stroke="#868686"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    id="Path_12"
                    data-name="Path 12"
                    d="M28.523,28.523l-3.548-3.548"
                    transform="translate(-9.34 -9.34)"
                    fill="none"
                    stroke="#868686"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </g>
              </svg>
            </Button>
            <img
              alt="Profile"
              src={
                profilePic === "null" || !profilePic
                  ? defaultProfile
                  : profilePic
              }
            />
            <Button onClick={() => Logout()} color="link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15.656"
                height="15.656"
                viewBox="0 0 15.656 15.656"
              >
                <g
                  id="Icon_feather-log-out"
                  data-name="Icon feather-log-out"
                  transform="translate(-3.65 -3.65)"
                >
                  <path
                    id="Path_303"
                    data-name="Path 303"
                    d="M9.152,18.456h-3.1A1.551,1.551,0,0,1,4.5,16.905V6.051A1.551,1.551,0,0,1,6.051,4.5h3.1"
                    fill="none"
                    stroke="#868686"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                  <path
                    id="Path_304"
                    data-name="Path 304"
                    d="M24,18.253l3.877-3.877L24,10.5"
                    transform="translate(-9.421 -2.899)"
                    fill="none"
                    stroke="#868686"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                  <path
                    id="Path_305"
                    data-name="Path 305"
                    d="M22.8,18H13.5"
                    transform="translate(-4.348 -6.522)"
                    fill="none"
                    stroke="#868686"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                </g>
              </svg>
            </Button>
            <Badge color="primary">
              {getRole() === "Supplier" ? "Supplier" : "Subscriber"}
            </Badge>
          </div>
          <div className="user-brand">
            <img
              alt="Profile"
              src={
                companyLogo === "null" || !companyLogo
                  ? defaultCompanyLogo
                  : companyLogo
              }
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
}
