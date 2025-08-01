import fs from 'fs/promises';
import path from 'path';
import { logger } from './utils/logger';

const stateFilePath = path.join(process.cwd(), '.securestream.state.json');

interface AppState {
  streamingMode: boolean;
}

let appState: AppState = { streamingMode: false };

const persistState = async () => {
  try {
    await fs.writeFile(stateFilePath, JSON.stringify(appState, null, 2));
  } catch (error) {
    logger.error('❌ Failed to write to .securestream.state.json:', error);
  }
};

// Initialize state at startup
const initializeState = async () => {
  try {
    const data = await fs.readFile(stateFilePath, 'utf-8');
    appState = JSON.parse(data);
    logger.info('✅ Loaded application state from .securestream.state.json.');
  } catch (err) {
    const error = err as { code?: string };
    if (error.code === 'ENOENT') {
      logger.info('🟡 State file not found. Creating default state at .securestream.state.json.');
      await persistState();
    } else {
      logger.error('❌ Could not read .securestream.state.json:', error);
    }
  }
};

initializeState();

export const getStreamingMode = (): boolean => {
  return appState.streamingMode;
};

export const toggleStreamingMode = (): boolean => {
  appState.streamingMode = !appState.streamingMode;
  persistState();
  
  if (!appState.streamingMode) {
    logger.warn('❌❌❌ WARNING: STREAMING MODE IS OFF - REAL KEYS ARE LIVE! ❌❌❌');
  }
  
  logger.info(`Streaming mode set to: ${appState.streamingMode}`);
  return appState.streamingMode;
}; 