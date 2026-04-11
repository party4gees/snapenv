const path = require('path');
const { watchEnvFile, formatWatchStatus } = require('../watch');

function printWatchUsage() {
  console.log(`
Usage: snapenv watch <snapshot-name> [options]

Watch a .env file and auto-save to a snapshot on change.

Arguments:
  snapshot-name   Name of the snapshot to auto-save into

Options:
  --file, -f      Path to env file (default: .env)
  --debounce      Debounce delay in ms (default: 500)
  --verbose       Log each auto-save event
  --help, -h      Show this help message
`);
}

function runWatch(args) {
  if (!args || args.includes('--help') || args.includes('-h')) {
    printWatchUsage();
    return;
  }

  const snapshotName = args[0];
  if (!snapshotName) {
    console.error('Error: snapshot-name is required.');
    printWatchUsage();
    process.exit(1);
  }

  const fileIdx = args.findIndex(a => a === '--file' || a === '-f');
  const envPath = fileIdx !== -1 ? args[fileIdx + 1] : '.env';

  const debounceIdx = args.indexOf('--debounce');
  const debounce = debounceIdx !== -1 ? parseInt(args[debounceIdx + 1], 10) : 500;

  const verbose = args.includes('--verbose');

  try {
    const watcher = watchEnvFile(path.resolve(envPath), snapshotName, { debounce, verbose });
    console.log(formatWatchStatus(envPath, snapshotName));

    process.on('SIGINT', () => {
      watcher.close();
      console.log('\n[watch] Stopped.');
      process.exit(0);
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { printWatchUsage, runWatch };
