import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger';
import { getStreamingMode } from './state-service';

interface KeyPair {
  real: string;
  placeholder: string;
}

interface KeyConfig {
  keys: Record<string, KeyPair>;
}

interface FeatureConfig {
  strictMode: boolean;
  features: {
    gitHook: {
      enabled: boolean;
      mode: string;
    }
  }
}

const keysConfigPath = path.join(process.cwd(), 'keys.json');
const featureConfigPath = path.join(process.cwd(), 'securestream.config.json');

const readJsonFile = <T>(filePath: string): T | null => {
  try {
    const rawConfig = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawConfig);
  } catch (error) {
    logger.error(`❌ FATAL: Could not read or parse ${path.basename(filePath)}.`);
    logger.error('    Please ensure the file exists and is valid JSON.');
    process.exit(1);
  }
};

const keyConfig = readJsonFile<KeyConfig>(keysConfigPath);
export const featureConfig = readJsonFile<FeatureConfig>(featureConfigPath);

export const config = {
  ...keyConfig,
  strictMode: featureConfig?.strictMode ?? false
};

export const getKey = (name: string): string | undefined => {
  const keyPair = config.keys?.[name];
  if (!keyPair) {
    return undefined;
  }
  
  const isStreaming = getStreamingMode();

  if (!isStreaming) {
    logger.warn(`[DEBUG - REAL KEY] Providing real key for '${name}'. If an auth error occurs next in your app, this is the key that was used. 🕵️`);
  }

  return isStreaming ? keyPair.placeholder : keyPair.real;
}; 