import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import env from "@/config/env";

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
  return number.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
};
