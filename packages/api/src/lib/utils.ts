import SUPPORTED_COUNTRIES from "../config/supported-countries.js";

// verify US number
export const validateUsNumber = (phone: string) => {
  // +1-615-988-2082
  const startWithCode = phone.startsWith("+1");
  if (startWithCode) {
    phone = phone.split("-").slice(1).join("-");
  }
  const reg = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
  return reg.test(phone);
};

export const formatPhoneNumber = (phone: string) => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
};

export const countryExists = (country: string) => {
  return SUPPORTED_COUNTRIES.find((c) => c.code === country);
};
