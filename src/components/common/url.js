export const CORS_BYPASS = "https://cors-anywhere.herokuapp.com/";
// dev url
export const BASE_API_URL = "https://dev-api-v3.ezcloud123.io";
// live url
// export const BASE_API_URL = "https://apiv3.ezcloud.co";
//trail url
// export const BASE_API_URL = " https://trial-apiv3.ezcloud.co/";
//test url
//export const BASE_API_URL = "https://dev-api-v3.ezcloud123.io";


export const LOGIN_URL = BASE_API_URL + "/user/login";
export const CREATE_CUSTOMER = BASE_API_URL + "/user/customerRegistration";
export const CREATE_PREMIUM_CUSTOMER = BASE_API_URL + "/user/createCustomer";
export const CREATE_TEAM_USER = BASE_API_URL + "/user/createTeamUser";
export const GET_INVOICE = BASE_API_URL + "/invoice/getInvoice";
export const GET_USERS = BASE_API_URL + "/user/getUsers";
export const GET_TEAMDETAILS_BY_ID = BASE_API_URL + "/team/getTeamDetailsById";
export const FORGET_PASSWORD = BASE_API_URL + "/user/forGetPassword";
export const UPDATE_PASSWORD = BASE_API_URL + "/user/updatePassword";
export const GET_USER_BY_ID = BASE_API_URL + "/user/getUserById";
export const UPDATE_USER = BASE_API_URL + "/user/updateUser";
export const UPDATE_TEAM = BASE_API_URL + "/team/updateTeam";
export const UPLOAD_FILE = BASE_API_URL + "/uploadFile/uploadFile";
export const GET_INVOICE_DETAILS = BASE_API_URL + "/invoice/getInvoiceById";
export const GUPDATE_INVOICE_DETAILS = BASE_API_URL + "/invoice/getInvoiceById";
export const DASHBOARD = BASE_API_URL + "/dashboard/getDashboard";
export const UPDATE_INVOICE = BASE_API_URL + "/invoice/updateInvoice";
export const UPDATE_INVOICE_STATUS =
  BASE_API_URL + "/invoice/updateInvoiceStatus";
export const ACCESS_S3_FILE = BASE_API_URL + "​/uploadFile/accessS3File";
export const TEAM_MEMBER_ASSIGN =
  BASE_API_URL + "​/team/assignTeamMemberToSupplier";
export const GET_ASSIGNER_LIST = BASE_API_URL + "/team/getAssingerList";
export const GET_ASSIGNED_TEAM_LIST =
  BASE_API_URL + "/team/getAssingedTeamList";
//upload url for dev
export const REUPLOAD_URL =
  "https://to77qk4lxa.execute-api.us-east-1.amazonaws.com/GetStartedLambdaProxyIntegration";
// upload url for live
// export const REUPLOAD_URL =
//   "https://kzewnk2xf5.execute-api.us-east-1.amazonaws.com/default/ezcloud-file-upload-handler";
//trail url
// export const REUPLOAD_URL =
// "https://6b7t38qpn0.execute-api.us-east-1.amazonaws.com/default/ezcloud-file-upload-handler";
//upload url for Test environment
// export const REUPLOAD_URL =
//   "https://ee54uzpoug.execute-api.us-east-1.amazonaws.com/ezcloud-file-upload-handler";

export const VERIFY_EMAIL_URL = BASE_API_URL + "/user/verifyCustomerEmail";
export const NEXT_INVOICE_URL = BASE_API_URL + "/invoice/getNextInvoice";
export const INVOICE_LINE_LISTING = BASE_API_URL + "/invoice/getInvoiceLine";
export const GET_TABLE_VALUES_BY_ID =
  BASE_API_URL + "/invoice/getTableValuesById";
export const INVOICELINE_CREATE_URL =
  BASE_API_URL + "/invoice/createInvoiceLine";
export const INVOICE_LINE_DELETE_URL =
  BASE_API_URL + "/invoice/deleteInvoiceLine";
export const INVOICE_LINE_UPDATE_URL =
  BASE_API_URL + "/invoice/updateInvoiceLine";
export const LOCK_INVOICE_URL = BASE_API_URL + "/invoice/lockInvoice";
export const UNLOCK_INVOICE_URL = BASE_API_URL + "/invoice/unLockInvoice";
export const GET_INVOICE_FIELDS = BASE_API_URL + "/invoice/getInvoiceFieldList";
export const GET_KEYVALUES_BY_SUPPLIERNAME =
  BASE_API_URL + "/invoice/getKeyValuesBySupplierName";
export const UPDATE_INVOICE_FIELDS =
  BASE_API_URL + "/invoice/saveInvoiceFieldList";
export const GENERATE_OTP = BASE_API_URL + "/user/generateOTP";
export const VERIFY_OTP = BASE_API_URL + "/user/verifyOTP";

export const UPDATE_SUPPLIER_STATUS =
  BASE_API_URL + "/supplier/updateSupplierStatus";
export const SUPPLIER_LISTING = BASE_API_URL + "/supplier/getSupplierRequest";
export const ADD_SUPPLIER_REQUEST_URL =
  BASE_API_URL + "/supplier/sendSupplierRequest";
export const USER_SIGN_OUT_URL = BASE_API_URL + "/user/signOut";
export const USER_EMAIL_LIST_URL = BASE_API_URL + "/user/getEntityUser";
export const NOTIFY_SUPPLIER_URL =
  BASE_API_URL + "/supplier/sendPixelatedEmail";
//enhancement
export const DELETE_INVOICE_URL = BASE_API_URL + "/invoice/deleteInvoice";
export const PRE_SIGNED_URL = BASE_API_URL + "/uploadFile/preSignedS3Url";
export const DELETE_SUPPLIER_REQUEST =
  BASE_API_URL + "/supplier/deleteSupplierRequest";
export const DELETE_TEAM_MEMBER = BASE_API_URL + "/user/deleteUser";

//report
export const REPORT_URL = BASE_API_URL + "/report/getInvoiceReport";
export const STANDARD_DEVIATION_URL =
  BASE_API_URL + "/report/getDeviationAmount";
export const MONTH_WISE_DEVIATION_URL =
  BASE_API_URL + "/report/getMonthlyWiseDeviation";
export const ROUNDED_INVOICES_URL =
  BASE_API_URL + "/report/getInvoiceRoundedAmounts";
//Comment

export const CREATE_COMMENT_URL = BASE_API_URL + "/comment/createComment";
export const UPDATE_COMMENT_URL = BASE_API_URL + "/comment/updateComment";
export const COMMENT_LIST_URL = BASE_API_URL + "/comment/getComments";
export const DELETE_COMMENT_URL = BASE_API_URL + "/comment/deleteComment";
export const COMMENT_BY_ID_URL = BASE_API_URL + "/comment/getCommentById";
export const COMMENT_USER = BASE_API_URL + "/comment/getChatUser";
//audits
export const GET_AUDIT_URL = BASE_API_URL + "/invoice/getAudits";

export const IS_NEW_USER_URL = BASE_API_URL + "/user/checkIsNewSupplier";

export const FORMAT_SETTING_URL = BASE_API_URL + "/invoice/saveSettings";
export const GET_FORMAT_SETTING_URL = BASE_API_URL + "/invoice/getSettings";

//Cron
export const SAVE_CRON_DETAILS = BASE_API_URL + "/crone/saveCronDetails";
export const UPDATE_CRON_DETAILS = BASE_API_URL + "/crone/updateCronDetails";
export const GET_CRONE_DETAILS = BASE_API_URL + "/crone/getCroneDetails";
export const GET_EXPORTED_LIST = BASE_API_URL + "/crone/getExportedList";
export const GET_INSTANT_EXPORT = BASE_API_URL + "/crone/getInstantExport";

//new extraction
export const EXTRACTION_FORM_URL = BASE_API_URL + "/invoice/getFormValuesById";
export const TRAINING_DATASET_URL =
  BASE_API_URL + "/entityDataset/saveEntityTrainingDataset";
// approve call dev environment
export const SAVE_TRAINING_DATASET_URL =
  "https://65yo73d1ye.execute-api.us-east-1.amazonaws.com/default/update-entity-dataset-handler";
// approve call test environment
// export const SAVE_TRAINING_DATASET_URL =
//   "https://wfflv84kd5.execute-api.us-east-1.amazonaws.com/default/update-entity-dataset-handler";

//when update call dev environment
export const TRAINING_DATA_STORAGE_URL =
  "https://u56g45ubji.execute-api.us-east-1.amazonaws.com/ManualStage/update-detected-entity-handler";

//when update call test environment
// export const TRAINING_DATA_STORAGE_URL =
//   "https://vuptrpaxtk.execute-api.us-east-1.amazonaws.com/default/update-detected-entity-handler";

//resubmit
export const RESUBMIT_INITIALIZED_INVOICE_URL =
  "https://9zxe9c3651.execute-api.us-east-1.amazonaws.com/default/enqueue-invoice-process-handler";

export const GET_TRAINED_DATASET_URL =
  BASE_API_URL + "/invoice/getInvoiceLabels";

export const GET_SUPPLIER_LIST_URL =
  BASE_API_URL + "/uploadFile/getSupplierList";

export const GET_EXCEPTION_HANDLER_ROLE_URL =
  BASE_API_URL + "/user/getExceptionHandlerRole";

export const GET_EXCEPTION_HANDLER_DETAILS =
  BASE_API_URL + "/user/getExceptionHandlerDetails";

export const SAVE_INVOICE_EXCEPTION =
  BASE_API_URL + "/team/saveInvoiceException";

export const GET_INVOICE_EXCEPTION_LIST =
  BASE_API_URL + "/team/getExceptionInvoice";

export const IMPORT_GLCODE = BASE_API_URL + "/GLcode/importGLcode";

export const GET_TAG_VALUE = BASE_API_URL + "/GLcode/getTagValue";

export const SAVE_GLCODE_TAGVALUE = BASE_API_URL + "/GLcode/glCodeTagValue";

export const GET_ASSIGNED_GLCODE_VALUE =
  BASE_API_URL + "/GLcode/getAssignedGLcodeValue";

export const GET_GLCODE = BASE_API_URL + "/GLcode/generateGlCode";
export const DELETE_GLCODE = BASE_API_URL + "/GLcode/deleteGLcode";
