import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './utils/logger';
import { config, getKey } from './config/index';
import { addLogEntry, getLogHistory } from './log-service';
import { getStreamingMode, toggleStreamingMode } from './state-service';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    streamingMode: getStreamingMode(),
    keyRequestHistory: getLogHistory(),
  });
});

// Get a key
app.get('/keys/:name', (req, res) => {
  const { name } = req.params;
  addLogEntry(name); // Log the request
  const value = getKey(name);

  if (!value) {
    logger.warn(`🟡 Key Not Found: A request for key '${name}' was made, but it does not exist in keys.json. Check for typos! 🤔`);
    
    if (config.strictMode) {
      return res.status(404).json({ error: `Key '${name}' not found.` });
    }
    
    return res.status(200).json({ 
      key: name, 
      value: null, 
      message: `Key '${name}' not found. It does not exist in your keys.json file.` 
    });
  }
  res.status(200).json({ key: name, value });
});

// Toggle streaming mode
app.post('/stream-mode/toggle', (_req, res) => {
  const newMode = toggleStreamingMode();
  res.status(200).json({ streamingMode: newMode });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  const keys = config.keys || {};
  const totalKeys = Object.keys(keys).length;
  const establishedKeys = Object.values(keys).filter(k => k && k.real && !k.real.includes('REPLACE_WITH')).length;

  logger.info(`🚀 live-keys v1.0 is running!`);
  logger.info(`
    ---------------------------------------------------
    • Server running at: http://localhost:${PORT}
    • Streaming Mode:    ${getStreamingMode() ? 'STREAMING' : 'Development'}
    • Established Keys:  ${establishedKeys} of ${totalKeys}
    ---------------------------------------------------
    • Main Config:       keys.json
    • Feature Config:    securestream.config.json
    • Request Log:       key-request-log.json
    ---------------------------------------------------
    • Commands:
        - npm run dev           (Start Server)
        - npm run check-keys    (Check Key Status)
        - npx husky add ...   (Setup Git Hook)
    ---------------------------------------------------
  `);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`👋 ${signal} received. Shutting down the key server...`);
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); 