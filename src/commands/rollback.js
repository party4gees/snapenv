const { rollbackSnapshot, formatRollbackResult } = require('../rollback');
const { ensureSnapenvDir } = require('../snapshot');
const { recordAction } = require('../history');
const path = require('path');

function printRollbackUsage() {
  console.log(`
Usage: snapenv rollback <snapshot-name> [options]

Roll back to the snapshot that was active before <snapshot-name> was restored.

Options:
  --env <path>   Path to .env file (default: .env)
  --help         Show this help message

Examples:
  snapenv rollback production
  snapenv rollback staging --env .env.staging
`);
}

function runRollback(args) {
  if (args.includes('--help') || args.includes('-h')) {
    printRollbackUsage();
    return;
  }

  const snapshotName = args.find((a) => !a.startsWith('--'));
  if (!snapshotName) {
    console.error('Error: snapshot name is required.');
    printRollbackUsage();
    process.exit(1);
  }

  const envIndex = args.indexOf('--env');
  const envFilePath = envIndex !== -1 ? args[envIndex + 1] : '.env';

  const snapenvDir = ensureSnapenvDir(process.cwd());
  const result = rollbackSnapshot(snapshotName, path.resolve(envFilePath), snapenvDir);

  console.log(formatRollbackResult(result));

  if (result.success) {
    recordAction(snapenvDir, {
      action: 'rollback',
      snapshot: snapshotName,
      rolledBackTo: result.rolledBackTo
    });
  } else {
    process.exit(1);
  }
}

module.exports = { printRollbackUsage, runRollback };
