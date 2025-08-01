import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger';

interface KeyPair {
  real: string;
  placeholder: string;
}

interface KeyConfig {
  streamingMode: boolean;
  keys: Record<string, KeyPair>;
}

const configPath = path.join(process.cwd(), 'keys.json');

let keyConfig: KeyConfig;

try {
  const rawConfig = fs.readFileSync(configPath, 'utf-8');
  keyConfig = JSON.parse(rawConfig);
  logger.info('Loaded keys.json configuration.');
} catch (error) {
  logger.error('Failed to load or parse keys.json:', error);
  process.exit(1);
}

export const config = keyConfig;

export const toggleStreamingMode = (): boolean => {
  config.streamingMode = !config.streamingMode;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  logger.info(`Streaming mode set to: ${config.streamingMode}`);
  return config.streamingMode;
};

export const getKey = (name: string): string | undefined => {
  const keyPair = config.keys[name];
  if (!keyPair) {
    return undefined;
  }
  return config.streamingMode ? keyPair.placeholder : keyPair.real;
}; 