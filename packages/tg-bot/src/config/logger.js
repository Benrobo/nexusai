import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
  if (typeof message === "object") {
    return `${timestamp} [${level}] : ${JSON.stringify(message)}`;
  }
  return `${timestamp} [${level}] : ${message}`;
});

const logger = createLogger({
  level: "debug",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss A",
    }),
    process.env.NODE_ENV !== "production"
      ? format.colorize()
      : format.uncolorize(),
    customFormat
  ),
  transports: [new transports.Console()],
});

export default logger;
