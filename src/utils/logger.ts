import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const consoleFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    consoleFormat
  ),
  transports: [new winston.transports.Console()],
}); 