const { restoreSnapshot, formatRestoreSummary } = require('../restore');
const { listSnapshots } = require('../snapshot');

/**
 * Command: snapenv restore <name> [--env <path>]
 *
 * Restores a named snapshot to the target .env file.
 */
function runRestore(args) {
  const nameIndex = args.indexOf('restore') + 1;
  const snapshotName = args[nameIndex];

  if (!snapshotName || snapshotName.startsWith('--')) {
    console.error('Error: snapshot name is required.');
    console.error('Usage: snapenv restore <name> [--env <path>]');
    process.exit(1);
  }

  const envFlagIndex = args.indexOf('--env');
  const envFilePath = envFlagIndex !== -1 ? args[envFlagIndex + 1] : '.env';

  if (!envFilePath || envFilePath.startsWith('--')) {
    console.error('Error: --env flag requires a file path.');
    process.exit(1);
  }

  // Check snapshot exists before attempting restore
  const available = listSnapshots();
  if (!available.includes(snapshotName)) {
    console.error(`Error: snapshot "${snapshotName}" does not exist.`);
    if (available.length > 0) {
      console.error(`Available snapshots: ${available.join(', ')}`);
    } else {
      console.error('No snapshots found. Use `snapenv save <name>` to create one.');
    }
    process.exit(1);
  }

  try {
    const summary = restoreSnapshot(snapshotName, envFilePath);
    console.log(formatRestoreSummary(summary));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { runRestore };
