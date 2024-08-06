import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import env from "@/config/env";
import parsePhoneNumber from "libphonenumber-js";
import countryJson from "@/data/country.json";

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// format number to 100,000, 10,000,000, 1,000,000,000, etc
export function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = `${env.API_URL}/auth/logout`;
};

export const formatPhoneNumber = (input: string) => {
  if (input.length === 0) return input;
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, "");

  // Group digits in blocks of 3, except the last block of 4 if there are more than 6 digits
  const match = digits.match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
  if (!match) return digits;

  // Format the number with spaces
  const formattedValue = [match[1], match[2], match[3]]
    .filter((part) => part)
    .join(" ");

  return formattedValue;
};

export const formatNumber = (number: string) => {
  if (!number) return number;
  const phoneNumber = parsePhoneNumber(number);
  return phoneNumber?.formatInternational();
};

// validate phone number , make sure +1 is included
export const validatePhoneNumber = (phone: string) => {
  const pattern = new RegExp(/^\+1\d{10}$/);
  return !!pattern.test(phone);
};

export function maskPhoneNumber(phoneNumber: string) {
  const str = phoneNumber.toString();
  const masked = str.slice(0, -4).replace(/\d/g, "*") + str.slice(-4);
  return masked;
}

export const validateUrl = (url: string) => {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(url);
};

export function getCountryByCode(code: string) {
  return countryJson.find((c) => c.code === code);
}

export const formatDate = (date: string) => {
  const now = dayjs();
  const targetDate = dayjs(date);

  let formattedDate = targetDate.format("h:mmA"); // Format time as 11:20am

  if (targetDate.isSame(now, "day")) {
    formattedDate = formattedDate;
  } else if (targetDate.isSame(now.subtract(1, "day"), "day")) {
    formattedDate = formattedDate;
  } else if (targetDate.isSame(now.subtract(1, "week"), "week")) {
    formattedDate = targetDate.format("ddd, D MMM"); // Format as Sun, 21, month
  } else {
    formattedDate = targetDate.fromNow(); // E.g., "3 days ago"
  }

  return formattedDate;
};
