const path = require('path');
const { saveSnapshot, listSnapshots, getSnapshotPath } = require('../snapshot');
const { parseEnvFile } = require('../env');
const fs = require('fs');

async function runSnapshot(args) {
  const [subcommand, ...rest] = args;

  if (!subcommand || subcommand === 'help') {
    printSnapshotUsage();
    return;
  }

  if (subcommand === 'save') {
    const [name] = rest;
    if (!name) {
      console.error('Error: snapshot name is required');
      console.error('Usage: snapenv snapshot save <name> [--env <file>]');
      process.exit(1);
    }

    const envFlag = rest.indexOf('--env');
    const envFile = envFlag !== -1 ? rest[envFlag + 1] : '.env';

    if (!fs.existsSync(envFile)) {
      console.error(`Error: env file not found: ${envFile}`);
      process.exit(1);
    }

    const vars = parseEnvFile(envFile);
    await saveSnapshot(name, vars);
    console.log(`Snapshot "${name}" saved from ${envFile} (${Object.keys(vars).length} variables)`);
    return;
  }

  if (subcommand === 'list') {
    const snapshots = await listSnapshots();
    if (snapshots.length === 0) {
      console.log('No snapshots found.');
    } else {
      console.log('Available snapshots:');
      snapshots.forEach(s => console.log(`  - ${s}`));
    }
    return;
  }

  if (subcommand === 'delete') {
    const [name] = rest;
    if (!name) {
      console.error('Error: snapshot name is required');
      process.exit(1);
    }
    const snapshotPath = getSnapshotPath(name);
    if (!fs.existsSync(snapshotPath)) {
      console.error(`Error: snapshot "${name}" not found`);
      process.exit(1);
    }
    fs.unlinkSync(snapshotPath);
    console.log(`Snapshot "${name}" deleted.`);
    return;
  }

  console.error(`Unknown subcommand: ${subcommand}`);
  printSnapshotUsage();
  process.exit(1);
}

function printSnapshotUsage() {
  console.log('Usage:');
  console.log('  snapenv snapshot save <name> [--env <file>]');
  console.log('  snapenv snapshot list');
  console.log('  snapenv snapshot delete <name>');
}

module.exports = { runSnapshot };
