import Axios from "axios";
import Swal from "sweetalert2";
const API = Axios.create();
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("error", error);
    const { status, data } = error.response;
    if (status === 401) {
      localStorage.clear();
      if (!window.location.href.includes("signin")) {
        window.location.replace("/signin");
      }
    }
    return Promise.reject(error);
  }
);
export default API;
