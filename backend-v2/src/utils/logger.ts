// src/utils/logger.ts
import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ timestamp, level, message }) => {
  return `[${timestamp}] [${level}]: ${message}`;
});

const logger = createLogger({
  level: "debug",
  format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(
        timestamp(),
        printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        })
      ),
    }),
    new transports.File({
      filename: "logs/combined.log",
      format: combine(
        timestamp(),
        printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        })
      ),
    }),
  ],
});

export default logger;
