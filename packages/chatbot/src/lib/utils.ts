import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import WIDGET_CONFIG from "@/config/widget";

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string) => {
  const now = dayjs();
  const targetDate = dayjs(date);

  let formattedDate = targetDate.format("h:mmA"); // Format time as 11:20am

  if (targetDate.isSame(now, "day")) {
    formattedDate = `Today at ${formattedDate}`;
  } else if (targetDate.isSame(now.subtract(1, "day"), "day")) {
    formattedDate = `Yesterday at ${formattedDate}`;
  } else if (targetDate.isSame(now.subtract(1, "week"), "week")) {
    formattedDate = `Last week at ${formattedDate}`;
  } else {
    formattedDate = targetDate.fromNow(); // E.g., "3 days ago"
  }

  return formattedDate;
};

export const capitalizeFirstChar = (str: string) => {
  if (!str) return "";
  let final = "";
  str.split(" ").forEach((c) => {
    final += c.charAt(0).toUpperCase() + c.slice(1) + " ";
  });
  return final;
};

export const sendMessageToParentIframe = (data: any) => {
  window.parent.postMessage(
    data,
    "*" // Use the dynamically determined parent origin
  );
};
