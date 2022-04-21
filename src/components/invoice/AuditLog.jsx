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
  Table,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { GET_AUDIT_URL } from "../common/url";
import { authHeader, getAlert } from "../common/mainfunctions";
import { deCryptFun, enCryptFun, getTeamID } from "../common/functions";
import API from "../redux/API";
import Swal from "sweetalert2";
import moment from "moment";

export default function AuditLog(props) {
  const { auditFlag, invoiceId, callBack } = props;
  const [list, setList] = useState();
  const getAudit = async (value) => {
    // setGetLoading(true);
    const getconfig = {
      method: "GET",
      url: GET_AUDIT_URL,
      headers: authHeader(),
      params: {
        //invoiceId: invoiceId,
        webString: enCryptFun(
          JSON.stringify({
           invoiceId: invoiceId,
          })
        ),
        flutterString: "",
      },
    };
    try {
      const response = await API(getconfig);
     // const { status, message, data } = response.data;
       let l = deCryptFun(response.data);
      const { status, message, data} = JSON.parse(l);
      setList(data);
      console.log(response);
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
       Swal.fire(getAlert("Error",  v.message));
      }
    } finally {
      // setGetLoading(false);
    }
  };
  useEffect(() => {
    getAudit();
  }, []);
  return (
    <Modal
      size="lg"
      isOpen={auditFlag}
       toggle={callBack}
    >
      <ModalBody>
        <Card>
          <CardHeader>Audit</CardHeader>
          <CardBody>
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Action</th>
                  <th>Action Date</th>
                </tr>
              </thead>
              <tbody>
                {list &&
                  list.map((record, index) => {
                    return (
                      <tr>
                        <td>{record.actionName}</td>
                        <td>{record.comment}</td>
                        <td>
                          {moment
                            .parseZone(record.actionDate)
                            .format("hh:mm A, MM/DD/YYYY")}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" size="sm" className="mr-2" onClick={callBack}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
