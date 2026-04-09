const fs = require('fs');
const path = require('path');
const { importFromFile } = require('../import');
const { saveSnapshot } = require('../snapshot');

function printImportUsage() {
  console.log(`
Usage: snapenv import [options] <source-file> <snapshot-name>

Import environment variables from a file into a snapshot

Arguments:
  source-file      Path to the file to import from
  snapshot-name    Name for the new snapshot

Options:
  --format <type>  Format of source file (auto, dotenv, json, shell)
                   Default: auto (detects from file extension)
  --help           Show this help message

Examples:
  snapenv import .env.production prod
  snapenv import config.json staging --format json
  snapenv import exports.sh dev --format shell
`);
}

async function runImport(args) {
  // Parse arguments
  let format = 'auto';
  const positionalArgs = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help') {
      printImportUsage();
      return;
    } else if (arg === '--format') {
      format = args[++i];
      if (!['auto', 'dotenv', 'json', 'shell'].includes(format)) {
        throw new Error(`Invalid format: ${format}. Must be one of: auto, dotenv, json, shell`);
      }
    } else if (!arg.startsWith('--')) {
      positionalArgs.push(arg);
    }
  }

  if (positionalArgs.length !== 2) {
    console.error('Error: Missing required arguments');
    printImportUsage();
    process.exit(1);
  }

  const [sourcePath, snapshotName] = positionalArgs;

  // Validate snapshot name
  if (!/^[a-zA-Z0-9_-]+$/.test(snapshotName)) {
    throw new Error('Snapshot name must contain only letters, numbers, hyphens, and underscores');
  }

  // Import from file
  console.log(`Importing from ${sourcePath}...`);
  const envVars = importFromFile(sourcePath, format);
  const varCount = Object.keys(envVars).length;

  if (varCount === 0) {
    console.warn('Warning: No environment variables found in source file');
  }

  // Save as snapshot
  await saveSnapshot(snapshotName, envVars);
  console.log(`✓ Imported ${varCount} variable(s) to snapshot '${snapshotName}'`);
}

module.exports = {
  printImportUsage,
  runImport
};
