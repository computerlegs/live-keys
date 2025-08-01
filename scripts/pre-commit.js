#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Find project root by locating package.json
const findProjectRoot = (dir) => {
  const packageJsonPath = path.join(dir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    return dir;
  }
  const parentDir = path.dirname(dir);
  if (parentDir === dir) {
    return null; // Reached the root directory without finding package.json
  }
  return findProjectRoot(parentDir);
};

const projectRoot = findProjectRoot(__dirname);
const featureConfigPath = path.join(projectRoot, 'live-keys.config.json');
const keysConfigPath = path.join(projectRoot, 'keys.json');

const readJsonFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error(`🔴 Error: File not found at ${filePath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

let featureConfig = { gitHook: { enabled: false, mode: 'warn' } };

if (fs.existsSync(featureConfigPath)) {
  featureConfig = readJsonFile(featureConfigPath);
}

if (!featureConfig.gitHook || !featureConfig.gitHook.enabled) {
  console.log('✅ Git hook is disabled. Skipping check.');
  process.exit(0);
}

const keysConfig = readJsonFile(keysConfigPath);

const realKeys = Object.values(keysConfig.keys).map(k => k.real);

if (realKeys.length === 0 || (realKeys.length === 1 && realKeys[0].startsWith('REPLACE_WITH'))) {
    console.log('✅ No real keys found in keys.json. Skipping pre-commit check.');
    process.exit(0);
}

const getStagedFiles = () => {
  return execSync('git diff --cached --name-only').toString().split('\n').filter(Boolean);
};

const stagedFiles = getStagedFiles();
let foundIssues = false;

console.log('🔍 Running live-keys pre-commit hook...');

for (const file of stagedFiles) {
  const filePath = path.join(projectRoot, file);
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf-8');

  for (const realKey of realKeys) {
    if (content.includes(realKey)) {
      console.error(`❌ DANGER: Real API key found in staged file: ${file}`);
      foundIssues = true;
    }
  }
}

if (foundIssues) {
  console.error('\n-----------------------------------------------------');
  console.error('  Your commit contains real API keys. Please remove them before committing.');
  console.error('-----------------------------------------------------\n');
  if (featureConfig.gitHook.mode === 'block') {
    console.error('🚫 Commit blocked by live-keys hook (mode: block).');
    process.exit(1);
  } else {
    console.warn('⚠️  Commit allowed, but with warnings (mode: warn).');
    process.exit(0);
  }
} else {
  console.log('✅ No secrets found in staged files. Commit approved!');
  process.exit(0);
} 