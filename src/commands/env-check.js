const { loadSnapshot } = require('../snapshot');
const { parseEnvFile } = require('../env');
const { envCheck, formatEnvCheckResult } = require('../env-check');
const path = require('path');
const fs = require('fs');

function printEnvCheckUsage() {
  console.log(`
Usage: snapenv env-check <snapshot-name> [env-file]

Check whether the current .env file satisfies all keys defined in a snapshot.

Arguments:
  snapshot-name   Name of the snapshot to check against
  env-file        Path to .env file (default: .env)

Options:
  --strict        Exit with non-zero code if any issues found
  --help          Show this help message

Examples:
  snapenv env-check production
  snapenv env-check production .env.local
  snapenv env-check staging --strict
  `);
}

function runEnvCheck(args) {
  if (!args || args.length === 0 || args.includes('--help')) {
    printEnvCheckUsage();
    return;
  }

  const strict = args.includes('--strict');
  const filteredArgs = args.filter(a => !a.startsWith('--'));
  const [snapshotName, envFilePath = '.env'] = filteredArgs;

  if (!snapshotName) {
    console.error('Error: snapshot name is required.');
    process.exit(1);
  }

  let snapshotVars;
  try {
    snapshotVars = loadSnapshot(snapshotName);
  } catch (err) {
    console.error(`Error: could not load snapshot "${snapshotName}": ${err.message}`);
    process.exit(1);
  }

  let envVars = {};
  const resolvedPath = path.resolve(envFilePath);
  if (fs.existsSync(resolvedPath)) {
    envVars = parseEnvFile(resolvedPath);
  } else {
    console.warn(`Warning: env file not found at ${resolvedPath}, treating as empty.`);
  }

  const result = envCheck(snapshotVars, envVars);
  console.log(formatEnvCheckResult(result, snapshotName));

  if (strict && !result.ok) {
    process.exit(1);
  }
}

module.exports = { printEnvCheckUsage, runEnvCheck };
