import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Daily rotate file transport for all logs
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",  // Log file name pattern
      datePattern: "YYYY-MM-DD",                 // Daily rotation
      zippedArchive: true,                       // Compress archived logs
      maxSize: "20m",                            // Max size per log file before rotation
      maxFiles: "14d",                           // Keep logs for 14 days
      level: "info",                             // Logs at info level and above
    }),

    // Separate file for errors only
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      level: "error",                            // Only errors
    }),
  ],
});

// Always add console logging in Docker/Production to see logs via 'docker logs'
logger.add(
  new winston.transports.Console({
    format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  })
);

export default logger;
