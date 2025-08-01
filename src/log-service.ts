import fs from 'fs/promises';
import path from 'path';
import { logger } from './utils/logger';

const logFilePath = path.join(process.cwd(), 'key-request-log.json');
const MAX_LOG_ENTRIES = 15;

interface LogEntry {
  timestamp: string;
  keyName: string;
}

interface RequestLog {
  history: LogEntry[];
}

let requestLog: RequestLog = { history: [] };

// Initialize: Read the log file into memory at startup
(async () => {
  try {
    const data = await fs.readFile(logFilePath, 'utf-8');
    requestLog = JSON.parse(data);
    logger.info('✅ Loaded key request history from key-request-log.json.');
  } catch (err) {
    const error = err as { code?: string };
    if (error.code === 'ENOENT') {
      logger.info('🟡 key-request-log.json not found. A new one will be created on the first key request.');
    } else {
      logger.error('❌ Could not read key-request-log.json:', error);
    }
  }
})();

const persistLog = async () => {
  try {
    await fs.writeFile(logFilePath, JSON.stringify(requestLog, null, 2));
  } catch (error) {
    logger.error('❌ Failed to write to key-request-log.json:', error);
  }
};

export const addLogEntry = (keyName: string) => {
  const newEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    keyName,
  };

  requestLog.history.unshift(newEntry);
  requestLog.history = requestLog.history.slice(0, MAX_LOG_ENTRIES);

  persistLog(); 
};

export const getLogHistory = (): LogEntry[] => {
  return requestLog.history;
}; 