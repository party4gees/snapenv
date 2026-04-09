const { loadSnapshot, listSnapshots } = require('../snapshot');
const { parseEnvFile } = require('../env');
const { diffSnapshotAgainstEnv, formatDiff } = require('../diff');
const path = require('path');
const fs = require('fs');

async function diffCommand(snapshotName, envFilePath = '.env', options = {}) {
  const snapshots = await listSnapshots();

  if (snapshots.length === 0) {
    console.error('No snapshots found. Run `snapenv save <name>` first.');
    process.exit(1);
  }

  const targetSnapshot = snapshotName || snapshots[snapshots.length - 1];

  let snapshotVars;
  try {
    snapshotVars = await loadSnapshot(targetSnapshot);
  } catch (err) {
    console.error(`Snapshot "${targetSnapshot}" not found.`);
    console.error(`Available snapshots: ${snapshots.join(', ')}`);
    process.exit(1);
  }

  const resolvedEnvPath = path.resolve(process.cwd(), envFilePath);

  if (!fs.existsSync(resolvedEnvPath)) {
    console.error(`Env file not found: ${resolvedEnvPath}`);
    process.exit(1);
  }

  const currentVars = parseEnvFile(resolvedEnvPath);
  const diffs = diffSnapshotAgainstEnv(snapshotVars, currentVars);

  if (diffs.length === 0) {
    console.log(`No differences between snapshot "${targetSnapshot}" and ${envFilePath}`);
    return;
  }

  if (options.json) {
    console.log(JSON.stringify(diffs, null, 2));
    return;
  }

  console.log(`Diff: snapshot "${targetSnapshot}" vs ${envFilePath}\n`);
  console.log(formatDiff(diffs));
}

module.exports = { diffCommand };
