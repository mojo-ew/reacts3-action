import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { Provider, useSelector } from "react-redux";
import store from "./components/redux/store";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
let path = window.location.pathname;
let mail = "";
mail = window.location.search.split("=");
console.log("path", mail[0]);
if (
  !isMobile ||
  path === "/verifyemail" ||
  mail[0] === "?email" ||
  path === "/success"
) {
  ReactDOM.render(
    <Provider store={store}>
      {/* <div className="sidebar-collabse"> */}
      {/* <BrowserView> */}
      <App />
      {/* </BrowserView> */}
    </Provider>,
    document.getElementById("root")
  );
} else if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
  window.location.href =
    "https://play.google.com/store/apps/details?id=com.ezcloud.ezcloud";
} else if (navigator.userAgent.toLowerCase().indexOf("tablet") > -1) {
  window.location.href =
    "https://play.google.com/store/apps/details?id=com.ezcloud.ezcloud";
} else if (navigator.userAgent.toLowerCase().indexOf("iphone") > -1) {
  window.location.href = "https://apps.apple.com/in/app/ez-cloud/id1585003635";
} else if (navigator.userAgent.toLowerCase().indexOf("iPad") > -1) {
  window.location.href = "https://apps.apple.com/in/app/ez-cloud/id1585003635";
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
