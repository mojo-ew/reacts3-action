import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  Modal,
  Button,
  ModalFooter,
  ModalBody,
  CardHeader,
  CardBody,
  Card,
  UncontrolledCollapse,
  FormGroup,
  Label,
  Input,
  Spinner,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  COMMENT_BY_ID_URL,
  COMMENT_LIST_URL,
  COMMENT_USER,
  CREATE_COMMENT_URL,
  DELETE_COMMENT_URL,
  GET_USERS,
  UPDATE_COMMENT_URL,
} from "../common/url";
import { authHeader, getAlert, getAlertToast } from "../common/mainfunctions";
import API from "../redux/API";
import Swal from "sweetalert2";
import {
  deCryptFun,
  enCryptFun,
  getLoginName,
  getProfilePic,
  getTeamID,
  getUserId,
} from "../common/functions";
import moment from "moment";
import ListBox from "react-listbox";
import "react-listbox/dist/react-listbox.css";
export default function ChatSection(props) {
  const { Toggle1, chatFun, chatFlag, invoiceID } = props;
  const [createLoading, setLoading] = useState(false);
  const [getLoading, setGetLoading] = useState(false);
  const [id, setId] = useState();
  const [userId, setUserId] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [count, setCount] = useState(0);
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const createComment = async (values) => {
    setLoading(true);
    const config = {
      method: id ? "PUT" : "POST",
      url: id ? UPDATE_COMMENT_URL : CREATE_COMMENT_URL,
      headers: authHeader(),
      // data: {
      //   postedBy: getUserId(),
      //   comment: commentValue,
      //   tagBy: userId ? userId.join(",") : 0,
      //   invoiceId: invoiceID,
      //   commentId: id ? id : "",
      // },
      data : {
webString: enCryptFun(
                  JSON.stringify({
                  postedBy: getUserId(),
        comment: commentValue,
        tagBy: userId ? userId.join(",") : 0,
        invoiceId: invoiceID,
        commentId: id ? id : "",
                  })
                ),
flutterString: ""
      }
       
    };
    try {
      const response = await API(config);
      //const { status, message } = response.data;
        let l = deCryptFun(response.data);
          const { status, message } = JSON.parse(l);
      Swal.fire(getAlertToast("success", message));
      getComment();
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlert("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    } finally {
      setLoading(false);
      setComment("");
      setId("");
      setUserId("");
    }
  };
  const [commentList, setList] = useState();
  const getComment = async (value) => {
    setGetLoading(true);
    const getconfig = {
      method: "GET",
      url: COMMENT_LIST_URL,
      headers: authHeader(),
      params: {
        // teamId: getTeamID(),
        // postedBy: value ? value : "",
        // invoiceId: invoiceID,
         webString: enCryptFun(
          JSON.stringify({
            teamId: getTeamID(),
        postedBy: value ? value : "",
        invoiceId: invoiceID,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(getconfig);
     // const { status, message, data, count } = response.data;
      let l = deCryptFun(response.data);
      const { status, message, data, count} = JSON.parse(l);
      setList(data);
      setCount(count);
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlert("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    } finally {
      setGetLoading(false);
    }
  };
  const getCommentById = async (commentid) => {
    const getconfigid = {
      method: "GET",
      url: COMMENT_BY_ID_URL,
      headers: authHeader(),
      params: {
       // commentId: commentid,
         webString: enCryptFun(
          JSON.stringify({
            commentId: commentid,
        
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(getconfigid);
     // const { status, message, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, message, data} = JSON.parse(l);
      const { comment } = data;
      setComment(comment);
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlert("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    }
  };
  useEffect(() => {
    getComment();
  }, []);
  const validationSchema = Yup.object().shape({
    // Comment: Yup.string().required("Required"),
  });
  const { handleSubmit, handleChange, values, handleBlur, errors, touched } =
    useFormik({
      initialValues: {
        Comment: "",
      },
      validationSchema,
      onSubmit: (values) => createComment(values),
    });
  const deleteRequest = async (commentid) => {
    const deleteconfig = {
      method: "DELETE",
      url: DELETE_COMMENT_URL,
      headers: authHeader(),
      params: {
       // commentId: commentid,
         webString: enCryptFun(
          JSON.stringify({
             commentId: commentid,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(deleteconfig);
     // const { status, message, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, message, data} = JSON.parse(l);
      Swal.fire(getAlertToast("Success", data));
      getComment();
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlert("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    }
  };
  const deleteCommentFun = async (e) => {
    const commentid = e.currentTarget.dataset.commentid;
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this comment?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.value) {
        deleteRequest(commentid);
      }
    });
  };
  const editFun = async (e) => {
    const commentid = e.currentTarget.dataset.commentid;
    getCommentById(commentid);
    setId(commentid);
  };
  const [commentValue, setComment] = useState();
  const [tagFlag, setTagFlag] = useState(false);
  const handleChangeFun = (e) => {
    setComment(e.target.value);
    if (!e.target.value) {
      setTagFlag(false);
    }
    if (e.target.value.slice(-1) == "@") {
      getUsers();
      setTagFlag(true);
    } else {
      const chkValue = e.target.value.split("@").pop();
      const result = userList.filter((record) => {
        let fullname = record.firstName.concat(" ", record.lastName);
        let ignoreCase = fullname.toLowerCase();
        return ignoreCase.startsWith(chkValue);
      });
      setUserList(result);
    }

    handleChange(e);
  };
  const cancelFun = () => {
    setId("");
    setComment("");
  };
  const [userList, setUserList] = useState();
  const getUsers = async () => {
    const userConfig = {
      method: "GET",
      url: COMMENT_USER,
      headers: authHeader(),
      params: {
        // invoiceId: invoiceID,
        // teamId: getTeamID(),
         webString: enCryptFun(
          JSON.stringify({
           invoiceId: invoiceID,
         teamId: getTeamID(),
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(userConfig);
      //const { status, message, data } = response.data;
      let l = deCryptFun(response.data);
      const { status, message, data} = JSON.parse(l);
      setUserList(data);
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
      // let { message } = data;
      // Swal.fire(getAlert("Error", message));
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
       // console.log("error data new",  v.message)
       Swal.fire(getAlert("Error", v.message));
      }
    }
  };
  useEffect(() => {
    getUsers();
  }, []);
  const userChange = (e) => {
    const firstname = e.currentTarget.dataset.firstname;
    const lastname = e.currentTarget.dataset.lastname;
    const fullname = firstname.concat(" ", lastname);
    setUserId([...userId, e.target.value]);

    const nr = commentValue.split("@").pop();
    const anew = commentValue.replace(nr, "");
    let newstr = "";
    if (anew) {
      newstr = anew.concat(fullname);
    }
    setComment(newstr);

    setTagFlag(false);
    getUsers();
  };
  return chatFlag === true ? (
    <div className="chat-screen">
      <div className="chat-header clearfix">
        <img
          // src="https://images.unsplash.com/photo-1520223297779-95bbd1ea79b7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=966&q=80"
          src={getProfilePic()}
          alt="avatar"
        />

        <div className="chat-about">
          <div className="chat-with">{getLoginName()}</div>
        </div>

        {/* <svg
            id="toggler"
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 0 24 24"
            width="24px"
            fill="#000000"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z" />
          </svg> */}
      </div>

      <div className="chat-history">
        {getLoading && <Spinner color="primary" />}
        <ul>
          {commentList &&
            commentList.map((record, index) => {
              const {
                comment,
                postDate,
                postedByName,
                postedByLogo,
                commentId,
              } = record;

              return (
                <>
                  {postedByName == getLoginName() ? (
                    // <div className="chat-history">

                    <li className="clearfix" key={index}>
                      <div className="message-data align-right">
                        <span className="message-data-time">
                          {moment
                            .parseZone(postDate)
                            .format("hh:mm A, MM/DD/YYYY")}
                        </span>
                        <span className="message-data-name">You</span>
                      </div>
                      <div className="message other-message float-right">
                        {comment}
                        <div className="actionbtn">
                          <Button
                            color="link"
                            onClick={deleteCommentFun}
                            data-commentid={commentId}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24px"
                              viewBox="0 0 24 24"
                              width="24px"
                              fill="#FFFFFF"
                            >
                              <path d="M0 0h24v24H0V0z" fill="none" />
                              <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
                            </svg>
                          </Button>
                          <Button
                            color="link"
                            onClick={editFun}
                            data-commentid={commentId}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24px"
                              viewBox="0 0 24 24"
                              width="24px"
                              fill="#FFFFFF"
                            >
                              <path d="M0 0h24v24H0V0z" fill="none" />
                              <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </li>
                  ) : (
                    <li>
                      <div className="message-data">
                        <span className="message-data-name">
                          {postedByName}
                        </span>
                        <span className="message-data-time">
                          {moment
                            .parseZone(postDate)
                            .format("hh:mm A, MM/DD/YYYY")}
                        </span>
                      </div>
                      <div className="message my-message">{comment}</div>
                    </li>
                  )}
                </>
              );
            })}
        </ul>
      </div>
      {/*  */}

      <div class="chat-message clearfix">
        <FormGroup>
          <Input
            type="textarea"
            name="comment"
            id="comment"
            onChange={handleChangeFun}
            value={commentValue}
          />
        </FormGroup>
        <Button color="primary" size="sm" type="submit" onClick={handleSubmit}>
          {createLoading && <Spinner color="light" />}
          {id ? "Update" : "Send"}
        </Button>
        <Button
          color="secondary"
          size="sm"
          className="mr-2"
          onClick={id ? cancelFun : chatFun}
        >
          {id ? "Cancel" : "Close"}
        </Button>
      </div>
      {tagFlag == true && userList.length > 0 ? (
        <Dropdown isOpen={tagFlag} toggle={tagFlag}>
          <DropdownToggle></DropdownToggle>
          <DropdownMenu
            style={{
              overflowY: "scroll",
              maxHeight: "170px",
              position: "left",
            }}
          >
            <DropdownItem header>Select Chat Person</DropdownItem>
            {userList &&
              userList.map((record, index) => {
                const { firstName, lastName, userId } = record;
                return (
                  <DropdownItem
                    key={`user_listing_${index}`}
                    onClick={userChange}
                    value={userId}
                    data-firstname={firstName}
                    data-lastname={lastName}
                  >
                    {firstName} {lastName}
                  </DropdownItem>
                );
              })}
          </DropdownMenu>
        </Dropdown>
      ) : (
        ""
      )}
    </div>
  ) : (
    ""
  );
  //       </CardBody>
  //     </Card>
  //   </ModalBody>
  // </Modal>
}
