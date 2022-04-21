export const NUMBER_REGEX = /^[0-9\b]+$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])[a-zA-Zd]/;
export const EMAIL_REGEX =
  /^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(ezcloud)\.io$/;
export const VALID_DATE_MMDDYYYY_REGEX =
  /(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}/;
export const VALID_DATE_DDMMYYYY_REGEX =
  /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;
