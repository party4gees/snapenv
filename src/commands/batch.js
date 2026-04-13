const { batchDelete, batchRestore, formatBatchResult } = require('../batch');
const { ensureSnapenvDir } = require('../snapshot');
const path = require('path');

function printBatchUsage() {
  console.log(`
snapenv batch <operation> <name1> [name2 ...]

Operations:
  delete   Delete multiple snapshots
  restore  Restore multiple snapshots in sequence

Options:
  --env <path>   Path to .env file (default: .env)
  --dir <path>   Snapenv directory (default: .snapenv)
  --help         Show this help message

Examples:
  snapenv batch delete old-snap backup-snap
  snapenv batch restore staging-base staging-overrides
  `);
}

async function runBatch(args) {
  if (!args.length || args[0] === '--help') {
    printBatchUsage();
    return;
  }

  const operation = args[0];
  const rest = args.slice(1);

  const envIndex = rest.indexOf('--env');
  const envPath = envIndex !== -1 ? rest[envIndex + 1] : path.resolve('.env');

  const dirIndex = rest.indexOf('--dir');
  const snapenvDir = dirIndex !== -1 ? rest[dirIndex + 1] : path.resolve('.snapenv');

  const names = rest.filter((a) => !a.startsWith('--') && a !== envPath && a !== snapenvDir);

  if (!names.length) {
    console.error('Error: at least one snapshot name is required');
    process.exit(1);
  }

  await ensureSnapenvDir(snapenvDir);

  let results;
  if (operation === 'delete') {
    results = await batchDelete(names, snapenvDir);
    console.log(formatBatchResult(results, 'deleted'));
  } else if (operation === 'restore') {
    results = await batchRestore(names, envPath, snapenvDir);
    console.log(formatBatchResult(results, 'restored'));
  } else {
    console.error(`Unknown batch operation: ${operation}`);
    printBatchUsage();
    process.exit(1);
  }

  const anyFailed = results.some((r) => !r.success);
  if (anyFailed) process.exit(1);
}

module.exports = { printBatchUsage, runBatch };
