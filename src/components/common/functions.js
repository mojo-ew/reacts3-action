const crypto = require("crypto");
const masterKey = "EZCloud@123!";
const encryptiontype = "aes-256-cbc";
const encodingtype = "utf8";

export function Name(key, order = "asc") {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      return 0;
    }

    const varA = typeof a[key] === "string" ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === "string" ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return order === "desc" ? comparison * -1 : comparison;
  };
}

export function getEmail() {
  const email = localStorage.getItem("EMAIL");
  return email;
}

export function getSenderEmail() {
  const email = localStorage.getItem("SENDER_EMAIL");
  return email;
}

export function getUserId() {
  const userId = localStorage.getItem("User_ID");
  return userId;
}
export function getSubTeamId() {
  const Id = localStorage.getItem("TEAM_SUB_ID");
  return Id;
}
export function getProfilePic() {
  const pic = localStorage.getItem("PROFILE_PIC");
  return pic;
}

export function getTeamID() {
  const teamId = localStorage.getItem("Team_ID");
  return teamId;
}

export function getBrandLogo() {
  const brandLogo = localStorage.getItem("BRAND_LOGO");
  return brandLogo;
}

export function getRole() {
  const role = localStorage.getItem("USER_ROLE");
  return role;
}
export function getLoginName() {
  const name = localStorage.getItem("LOGIN_NAME");
  return name;
}
export function getFullYear() {
  return new Date().getFullYear();
}

export function getInvoiceCount() {
  const count = localStorage.getItem("INVOICE_COUNT");
  return parseInt(count);
}

export function getApprovalAmount() {
  const count = localStorage.getItem("APPROVAL_AMOUNT");
  return parseInt(count);
}

// Common Table Sorting Method
const desc = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

export const stableSort = (array, cmp) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

export const getSorting = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
};

export function enCryptFun(text) {
  var cipher = crypto.createCipher(encryptiontype, masterKey);
  var crypted = cipher.update(text, encodingtype, "hex");
  crypted += cipher.final("hex");
  return crypted;
}

export function deCryptFun(text) {
  var decipher = crypto.createDecipher(encryptiontype, masterKey);
  var decrypted = decipher.update(text, "hex", encodingtype);
  decrypted += decipher.final(encodingtype);
  return decrypted;
}
