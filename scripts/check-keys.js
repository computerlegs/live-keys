#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const keysConfigPath = path.join(process.cwd(), 'keys.json');

if (!fs.existsSync(keysConfigPath)) {
  console.error('❌ Error: keys.json not found. Please run `npm install` or `npm run setup` first.');
  process.exit(1);
}

const keysConfig = JSON.parse(fs.readFileSync(keysConfigPath, 'utf-8'));
const keys = keysConfig.keys || {};
const keyNames = Object.keys(keys);

const report = [];
let establishedKeysCount = 0;

for (const name of keyNames) {
  const keyData = keys[name];
  const isEstablished = keyData && keyData.real && !keyData.real.includes('REPLACE_WITH');
  if (isEstablished) establishedKeysCount++;

  const truncate = (str) => (str.length > 20 ? str.substring(0, 8) + '...' + str.substring(str.length - 8) : str);

  report.push({
    name,
    status: isEstablished ? '✅ Established' : '🟡 Template',
    realSnippet: truncate(keyData.real || ''),
    placeholderSnippet: truncate(keyData.placeholder || ''),
  });
}

// Calculate column widths for formatting
const colWidths = {
  name: Math.max('Key Name'.length, ...report.map(r => r.name.length)),
  status: Math.max('Status'.length, ...report.map(r => r.status.length)),
  realSnippet: Math.max('Real Snippet'.length, ...report.map(r => r.realSnippet.length)),
};

const printRow = (name, status, real, placeholder) => {
  const nameCol = name.padEnd(colWidths.name);
  const statusCol = status.padEnd(colWidths.status);
  const realCol = real.padEnd(colWidths.realSnippet);
  console.log(`| ${nameCol} | ${statusCol} | ${realCol} | ${placeholder}`);
};

const printDivider = () => {
  const nameDiv = '-'.repeat(colWidths.name);
  const statusDiv = '-'.repeat(colWidths.status);
  const realDiv = '-'.repeat(colWidths.realSnippet);
  const placeholderDiv = '-'.repeat(Math.max('Placeholder Snippet'.length, ...report.map(r => r.placeholderSnippet.length)));
  console.log(`|-${nameDiv}-|-${statusDiv}-|-${realDiv}-|-${placeholderDiv}-|`);
};

console.log('\n--- 🕵️ live-keys Key Status Report ---\n');
console.log(`📊 Found ${establishedKeysCount} of ${keyNames.length} established key(s).\n`);

printRow('Key Name', 'Status', 'Real Snippet', 'Placeholder Snippet');
printDivider();
report.forEach(r => printRow(r.name, r.status, r.realSnippet, r.placeholderSnippet));

console.log(''); // Final newline for spacing 