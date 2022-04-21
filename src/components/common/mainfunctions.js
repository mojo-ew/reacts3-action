import React from "react";
import { Route, Redirect } from "react-router-dom";

export function PublicRoute({ component, ...rest }) {
  const token = localStorage.getItem("AUTH_TOKEN");
  if (!token) return <Route {...rest} component={component} />;
  else return <Redirect to={{ pathname: "/dashboard" }} />;
}

export function PrivateRoute({ component, ...rest }) {
  const token = localStorage.getItem("AUTH_TOKEN");
  if (token) return <Route {...rest} component={component} />;
  else return <Redirect to={"/signin"} />;
}
export function authHeader() {
  const token = localStorage.getItem("AUTH_TOKEN");
  return { Authorization: token };
}
export const getAlertToast = (type = "success", text = "", timer = 5000) => ({
  toast: true,
  position: "bottom",
  titleText: text,
  type: type,
  showConfirmButton: false,
  timer: timer,
});

export const getAlert = (type = "success", text = "") => ({
  position: "center",
  type: type,
  text: text,
  customClass: {
    confirmButton: "btn-shadow btn btn-primary btn-lg",
  },
  buttonsStyling: false,
  confirmButtonColor: "#000",
});

export const getCommentToast = (text = "") => ({
  position: "center",
  text: text,
  customClass: {
    confirmButton: "btn-shadow btn btn-primary btn-lg",
  },
  buttonsStyling: false,
  confirmButtonColor: "#000",
});
