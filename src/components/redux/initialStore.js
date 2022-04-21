export const userDetails = {
  profilePic: localStorage.getItem("PROFILE_PIC"),
};
export const teamDetails = {
  companyLogo: localStorage.getItem("BRAND_LOGO"),
};
export const sideBarFlag = {
  flag: false,
};
export const aprovalAmount = {
  amount: localStorage.getItem("APROVALAMOUNT"),
};
export const targetDatasetArray = [
  {
    fieldName: "",
    targetVariable: "invoiceNumber",
  },
  {
    fieldName: "",
    targetVariable: "dueDate",
  },
  {
    fieldName: "",
    targetVariable: "invoiceAmount",
  },
  {
    fieldName: "",
    targetVariable: "dueAmount",
  },
  {
    fieldName: "",
    targetVariable: "orderNumber",
  },
  {
    fieldName: "",
    targetVariable: "invoiceDate",
  },
  {
    fieldName: "",
    targetVariable: "taxTotal",
  },
];
