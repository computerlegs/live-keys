#!/usr/bin/env node

console.log('\n--- 📜 Available `live-keys` Commands ---\n');

const commands = [
  { cmd: 'npm run dev', desc: 'Starts the server in development mode with auto-reloading.' },
  { cmd: 'npm run status', desc: 'Checks the live status of the running server.' },
  { cmd: 'npm run check-keys', desc: 'Validates your keys.json file on disk.' },
  { cmd: 'npm run stream:on', desc: 'Turns streaming mode ON.' },
  { cmd: 'npm run stream:off', desc: 'Turns streaming mode OFF.' },
  { cmd: 'npm run stream:toggle', desc: 'Toggles the current streaming mode.' },
  { cmd: 'npm run setup', desc: 'Manually runs the initial setup process.' }
];

const maxCmdLength = Math.max(...commands.map(c => c.cmd.length));

commands.forEach(({ cmd, desc }) => {
  console.log(`  ${cmd.padEnd(maxCmdLength)}   - ${desc}`);
});

console.log('\n----------------------------------------\n'); 