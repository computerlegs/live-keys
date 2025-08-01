import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs/promises';
import path from 'path';
import winston from 'winston';

// --- Logger Setup ---
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [new winston.transports.Console()],
});

// --- File Paths ---
const keysConfigPath = path.join(process.cwd(), 'keys.json');
const stateFilePath = path.join(process.cwd(), '.securestream.state.json');
const logFilePath = path.join(process.cwd(), 'key-request-log.json');
const featureConfigPath = path.join(process.cwd(), 'securestream.config.json');


// --- Interfaces ---
interface KeyPair { real: string; placeholder: string; }
interface KeyConfig { keys: Record<string, KeyPair>; }
interface AppState { streamingMode: boolean; }
interface FeatureConfig { strictMode: boolean; }
interface LogEntry { 
    timestamp: string; 
    keyName: string;
    mode: 'Streaming' | 'Development';
    keyType: 'real' | 'placeholder';
}
interface RequestLog { history: LogEntry[]; }


// --- State & Config Management ---
let state: AppState = { streamingMode: false };
let keyConfig: KeyConfig = { keys: {} };
let featureConfig: FeatureConfig = { strictMode: false };
let requestLog: RequestLog = { history: [] };

async function loadFile<T>(filePath: string, defaultData: T): Promise<T> {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        const error = err as { code?: string };
        if (error.code === 'ENOENT') {
            logger.info(`🟡 ${path.basename(filePath)} not found. Using default.`);
            if (filePath.endsWith('.json')) { // Persist default for state/log
                await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
            }
            return defaultData;
        }
        logger.error(`❌ Could not read ${path.basename(filePath)}:`, error);
        process.exit(1);
    }
}

async function initialize() {
    keyConfig = await loadFile(keysConfigPath, { keys: {} });
    state = await loadFile(stateFilePath, { streamingMode: false });
    featureConfig = await loadFile(featureConfigPath, { strictMode: false, features: { gitHook: { enabled: false, mode: 'warn' } } });
    requestLog = await loadFile(logFilePath, { history: [] });
    startServer();
}


// --- Core Logic ---
const persistState = () => fs.writeFile(stateFilePath, JSON.stringify(state, null, 2));
const persistLog = () => fs.writeFile(logFilePath, JSON.stringify(requestLog, null, 2));

const addLogEntry = (keyName: string, mode: 'Streaming' | 'Development', keyType: 'real' | 'placeholder') => {
    requestLog.history.unshift({ timestamp: new Date().toISOString(), keyName, mode, keyType });
    requestLog.history = requestLog.history.slice(0, 15);
    persistLog();
};

const setStreamingMode = (newState?: boolean) => {
    if (newState === undefined) {
        state.streamingMode = !state.streamingMode;
    } else {
        state.streamingMode = newState;
    }
    persistState();
    const mode = state.streamingMode;
    logger.info(`Streaming mode set to: ${mode}`);
    if (!mode) {
        logger.warn('❌❌❌ WARNING: STREAMING MODE IS OFF - REAL KEYS ARE LIVE! ❌❌❌');
    }
    return mode;
};

// --- Server ---
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

function startServer() {
    app.get('/health', (_req, res) => {
        return res.status(200).json({
            status: 'ok',
            streamingMode: state.streamingMode,
            keyRequestHistory: requestLog.history,
        });
    });

    app.post('/stream-mode/toggle', (req, res) => {
        const { mode } = req.body; // Expects 'on' or 'off'
        let newState: boolean | undefined;

        if (mode === 'on') newState = true;
        if (mode === 'off') newState = false;
        
        const finalMode = setStreamingMode(newState);
        return res.status(200).json({ streamingMode: finalMode });
    });
    
    app.get('/config-check', (_req, res) => {
        const keyNames = Object.keys(keyConfig.keys || {});
        const total = keyNames.length;
        let established = 0;
        const report = keyNames.map(name => {
            const keyData = keyConfig.keys[name];
            const isEstablished = keyData && keyData.real && !keyData.real.includes('REPLACE_WITH');
            if (isEstablished) established++;
            return { name, isEstablished };
        });

        return res.status(200).json({ total, established, keys: report });
    });

    app.get('/keys/:name', (req, res) => {
        const { name } = req.params;
        const keyPair = keyConfig.keys?.[name];
        const isStreaming = state.streamingMode;
        const mode = isStreaming ? 'Streaming' : 'Development';
    
        if (!keyPair) {
            addLogEntry(name, mode, 'placeholder'); // Still log the attempt
            if (featureConfig.strictMode) {
                return res.status(404).json({ error: `Key '${name}' not found.` });
            }
            return res.status(200).json({ key: name, value: null, message: `Key '${name}' not found.` });
        }
        
        const keyType = isStreaming ? 'placeholder' : 'real';
        addLogEntry(name, mode, keyType);

        const value = isStreaming ? keyPair.placeholder : keyPair.real;
        return res.status(200).json({ key: name, value });
    });

    const PORT = process.env.PORT || 3666;
    app.listen(PORT, () => {
        const totalKeys = Object.keys(keyConfig.keys).length;
        const establishedKeys = Object.values(keyConfig.keys).filter(k => k && k.real && !k.real.includes('REPLACE_WITH')).length;
        logger.info(`🚀 live-keys v1.1 is running!`);
        logger.info(`    • Server running at: http://localhost:${PORT}`);
        logger.info(`    • Streaming Mode:    ${state.streamingMode ? 'STREAMING' : 'Development'}`);
        logger.info(`    • Established Keys:  ${establishedKeys} of ${totalKeys}`);
    });
}

initialize();

const gracefulShutdown = (signal: string) => {
  logger.info(`👋 ${signal} received. Shutting down the key server...`);
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); 