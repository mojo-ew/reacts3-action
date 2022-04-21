import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/layout/dashboard";
import PageNotFound from "./components/PageNotFount";
import Signin from "./components/Signin";
import SignUp from "./components/SignUp";
import ForgotPassword from "./components/ForgotPassword";
import Invoice from "./components/invoice/Invoice";
import UploadInvoice from "./components/invoice/UploadInvoice";
import UploadInvoiceNew from "./components/invoice/UploadInvoiceNew";
import RequiredField from "./components/invoice/RequiredField";
import InvoiceDetails from "./components/invoice/InvoiceDetails";
import MyTeam from "./components/MyTeam";
import Success from "./components/Success";
import ManageProfile from "./components/manageProfile/Index";
import Metrics from "./components/Report/Metrics";
import Scan from "./components/Scan";
import {
  SIGNIN_ROUTE,
  SIGNUP_ROUTE,
  FORGOT_PASSWORD_ROUTE,
  SUCCESS_ROUTE,
  INVOICE_ROUTE,
  UPLOAD_INVOICE_ROUTE,
  INVOICE_DETAILS_ROUTE,
  MY_TEAM_ROUTE,
  MANAGE_PROFILE_ROUTE,
  PAGE_NOT_FOUND_ROUTE,
  INITIAL_ROUTE,
  SCAN_ROUTE,
  UPDATE_PASSWORD_ROUTE,
  DASHBOARD_ROUTE,
  VERIFY_EMAIL_ROUTE,
  REQUIREDFIELD_ROUTE,
  REQUEST_ROUTE,
  PAID_SIGNUP_ROUTE,
  METRICS_ROUTE,
  SIGNUP_WITH_MAIL,
  INVOICE_DETAILS_NEW_ROUTE,
} from "./constants/RoutePaths";
import UpdatePassword from "./components/UpdatePassword";
import { PublicRoute, PrivateRoute } from "./components/common/mainfunctions";
import VerifyEmail from "./components/VerifyEmail";
import Request from "./components/request/Index";
import { useSelector } from "react-redux";
import PaidUserSignUp from "./components/PaidUserSignUp";
import InvoiceDetailsNew from "./components/invoice/InvoiceDetailsNew";

function App() {
  const { flag = false } = useSelector((state) => state.sideBarFlag);

  return (
    <div className={flag ? "sidebar-collabse" : ""}>
      <BrowserRouter>
        <Switch>
          <PublicRoute exact path={SIGNIN_ROUTE} component={Signin} />
          <PublicRoute exact path={SIGNUP_ROUTE} component={SignUp} />

          <PublicRoute
            exact
            path={`/signup?email=${"em"}`}
            component={SignUp}
          />
          <PublicRoute
            exact
            path={FORGOT_PASSWORD_ROUTE}
            component={ForgotPassword}
          />
          <Route path={UPDATE_PASSWORD_ROUTE} component={UpdatePassword} />
          <PrivateRoute exact path={INVOICE_ROUTE} component={Invoice} />
          <PrivateRoute
            path={`${UPLOAD_INVOICE_ROUTE}/:${"invoiceID"}`}
            component={UploadInvoice}
          />
          <PrivateRoute path={UPLOAD_INVOICE_ROUTE} component={UploadInvoice} />
          <PrivateRoute path={REQUIREDFIELD_ROUTE} component={RequiredField} />
          <PrivateRoute
            path={`${INVOICE_DETAILS_ROUTE}/:${"invoiceID"}`}
            component={InvoiceDetails}
          />
          <PrivateRoute
            path={`${INVOICE_DETAILS_NEW_ROUTE}/:${"invoiceID"}`}
            component={InvoiceDetailsNew}
          />
          <PrivateRoute exact path={REQUEST_ROUTE} component={Request} />
          <PrivateRoute exact path={SCAN_ROUTE} component={Scan} />
          <PrivateRoute path={MY_TEAM_ROUTE} component={MyTeam} />
          <PrivateRoute
            exact
            path={MANAGE_PROFILE_ROUTE}
            component={ManageProfile}
          />
          <PublicRoute exact path={SUCCESS_ROUTE} component={Success} />
          <PublicRoute
            exact
            path={VERIFY_EMAIL_ROUTE}
            component={VerifyEmail}
          />
          <PrivateRoute exact path={INITIAL_ROUTE} component={Dashboard} />
          <PrivateRoute exact path={DASHBOARD_ROUTE} component={Dashboard} />
          <PrivateRoute exact path={METRICS_ROUTE} component={Metrics} />
          <PublicRoute
            exact
            path={PAID_SIGNUP_ROUTE}
            component={PaidUserSignUp}
          />
          <Route exact path={PAGE_NOT_FOUND_ROUTE} component={PageNotFound} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
