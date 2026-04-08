#!/usr/bin/env node
'use strict';

const path = require('path');
const { saveSnapshot, loadSnapshot, listSnapshots } = require('./snapshot');
const { parseEnvFile, writeEnvFile } = require('./env');

const [,, command, ...args] = process.argv;
const DEFAULT_ENV_FILE = path.join(process.cwd(), '.env');

function printUsage() {
  console.log(`
snapenv — snapshot and restore local environment variables

Usage:
  snapenv save <name> [envFile]     Save current .env as a named snapshot
  snapenv restore <name> [envFile]  Restore a snapshot into .env
  snapenv list                      List all saved snapshots
  snapenv help                      Show this help message
`);
}

async function cmdSave(name, envFilePath) {
  if (!name) {
    console.error('Error: snapshot name is required.');
    process.exit(1);
  }
  const filePath = envFilePath || DEFAULT_ENV_FILE;
  try {
    const vars = parseEnvFile(filePath);
    await saveSnapshot(name, vars);
    console.log(`✔ Snapshot "${name}" saved from ${filePath}`);
  } catch (err) {
    console.error(`Error saving snapshot: ${err.message}`);
    process.exit(1);
  }
}

async function cmdRestore(name, envFilePath) {
  if (!name) {
    console.error('Error: snapshot name is required.');
    process.exit(1);
  }
  const filePath = envFilePath || DEFAULT_ENV_FILE;
  try {
    const vars = await loadSnapshot(name);
    writeEnvFile(filePath, vars);
    console.log(`✔ Snapshot "${name}" restored to ${filePath}`);
  } catch (err) {
    console.error(`Error restoring snapshot: ${err.message}`);
    process.exit(1);
  }
}

async function cmdList() {
  try {
    const snapshots = await listSnapshots();
    if (snapshots.length === 0) {
      console.log('No snapshots found.');
    } else {
      console.log('Saved snapshots:');
      snapshots.forEach(s => console.log(`  - ${s}`));
    }
  } catch (err) {
    console.error(`Error listing snapshots: ${err.message}`);
    process.exit(1);
  }
}

(async () => {
  switch (command) {
    case 'save':    await cmdSave(args[0], args[1]); break;
    case 'restore': await cmdRestore(args[0], args[1]); break;
    case 'list':    await cmdList(); break;
    case 'help':
    default:        printUsage(); break;
  }
})();
