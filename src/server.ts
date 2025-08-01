import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './utils/logger';
import { config, getKey, toggleStreamingMode } from './config/index';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', streamingMode: config.streamingMode });
});

// Get a key
app.get('/keys/:name', (req, res) => {
  const { name } = req.params;
  const value = getKey(name);

  if (!value) {
    return res.status(404).json({ error: `Key '${name}' not found.` });
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
  logger.info(`🚀 SecureStream Key Server MVP is running!`);
  logger.info(`      • Local: http://localhost:${PORT}`);
  logger.info(`      • Mode:  ${config.streamingMode ? 'STREAMING STREAMING' : 'Development'}`);
  logger.info(`      • Keys Loaded: ${Object.keys(config.keys).length}`);
  logger.info(`\nHealth check available at http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully.');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully.');
    process.exit(0);
}); 