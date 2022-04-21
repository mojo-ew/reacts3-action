import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { SIGNIN_ROUTE } from "../constants/RoutePaths";
import { Container, Row, Col, Button } from "reactstrap";
import success from "../images/success.png";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
export default function Success(props) {
  let msgFlag;
  if (props.location.state) {
    let { flag } = props.location.state;
    msgFlag = flag;
  }

  console.error("success");
  return (
    <div>
      <Container className="login-body-wrapper">
        <Row className="w-100">
          <Col
            sm="12"
            md={{ size: 8, offset: 2 }}
            className="item-center justifyCenter"
          >
            <div className="successful-signup">
              <img src={success} />
              {msgFlag === true ? (
                <div>
                  <h4>
                    {" "}
                    You have successfully registered with us, Please check the
                    email we have sent to you for Credentials
                  </h4>
                  <h6>
                    Please check your spam/junk folder if you do not see any
                    messages from EZ Cloud in your inbox.
                  </h6>
                </div>
              ) : (
                <div>
                  <h4>
                    {" "}
                    You have successfully registered with EZ Cloud. We have sent
                    you a confirmation email at your registered email address.
                    To log into your account, you will need to click the
                    provided link in the email received.
                  </h4>
                  <h6>
                    Please check your spam/junk folder if you do not see any
                    messages from EZ Cloud in your inbox.
                  </h6>
                </div>
              )}
              {isMobile ? (
                <Fragment>
                  <h6>Please click the link to download the app</h6>
                  <a href="https://play.google.com/store/apps/details?id=com.ezcloud.ezcloud">
                    Click Here
                  </a>
                </Fragment>
              ) : (
                <Link to={SIGNIN_ROUTE}>
                  <Button color="primary" className="mt-4">
                    SIGN IN
                  </Button>{" "}
                </Link>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
