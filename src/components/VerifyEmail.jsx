import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { SIGNIN_ROUTE } from "../constants/RoutePaths";
import { Container, Row, Col, Button, Spinner } from "reactstrap";
import success from "../images/success.png";
import { VERIFY_EMAIL_URL } from "./common/url";
import Swal from "sweetalert2";
import { getAlertToast } from "./common/mainfunctions";
import API from "./redux/API";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
import { deCryptFun, enCryptFun } from "./common/functions";
export default function VerifyEmail() {
  let location = useLocation();
  var searchParams = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState("");

  useEffect(() => {
    VerifyEmail();
  }, []);

  const VerifyEmail = async () => {
    let emailvalue = searchParams.get('email')
let newEmailValue = decodeURIComponent(emailvalue.replace(" ","+"));
    const config = {
      method: "PUT",
      url: VERIFY_EMAIL_URL,
      data: {
        // email: searchParams.get("email"),
        // hashKey: searchParams.get("hashKey"),
        webString: enCryptFun(
          JSON.stringify({
            email: newEmailValue,
        hashKey: searchParams.get("hashKey"),
          })
        ),
        flutterString: ""
      },
    };
    try {
      const response = await API(config);
      //const { status, message } = response.data;
      let l = deCryptFun(response.data);
      const { status, message } = JSON.parse(l);
      if (status === "Success") {
        setData(
          "Thank you. You have successfully verified your email address with us"
        );
        Swal.fire(getAlertToast("success", "Email Verified Successfully"));
      } else {
        setData(message);
        Swal.fire(getAlertToast(message));
      }
    } catch (error) {
      // let errorObj = Object.assign({}, error);
      // let { data } = errorObj.response;
       if (error.response) {
        let { data } = error.response
        
       let p = deCryptFun(data);
        let  v = JSON.parse(p)
         setData(v.message);
       // console.log("error data new",  v.message)
       Swal.fire("Error", v.message);
      }
    }
  };

  return (
    <div>
      <Container className="login-body-wrapper">
        <Row className="w-100">
          {loading ? (
            <Spinner color="primary" />
          ) : (
            <Col
              sm="12"
              md={{ size: 8, offset: 2 }}
              className="item-center justifyCenter"
            >
              <div className="successful-signup">
                <img src={success} />
                <h4> {data} </h4>
                {isMobile ? (
                  ""
                ) : (
                  <Link to={SIGNIN_ROUTE}>
                    <Button color="primary" className="mt-4">
                      SIGN IN
                    </Button>{" "}
                  </Link>
                )}
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
}
