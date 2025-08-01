import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('user-agent') || 'unknown';
  
  const start = process.hrtime();

  res.on('finish', () => {
    const { statusCode } = res;
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationInMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(3);
    
    const message = `${method} ${originalUrl} ${statusCode} ${durationInMs}ms - ${userAgent} ${ip}`;

    if (statusCode >= 500) {
      logger.error(message);
    } else if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });

  next();
}; 