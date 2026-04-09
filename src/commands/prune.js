const { deleteSnapshot, pruneByAge, pruneKeepLatest, formatPruneSummary } = require('../prune');

function printPruneUsage() {
  console.log(`
Usage: snapenv prune <command> [options]

Commands:
  delete <name>          Delete a specific snapshot
  old --days <n>         Remove snapshots older than N days
  keep --latest <n>      Keep only the N most recent snapshots

Examples:
  snapenv prune delete my-snapshot
  snapenv prune old --days 30
  snapenv prune keep --latest 5
`.trim());
}

function runPrune(args) {
  const [subcommand, ...rest] = args;

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    printPruneUsage();
    return;
  }

  if (subcommand === 'delete') {
    const name = rest[0];
    if (!name) {
      console.error('Error: snapshot name required');
      process.exit(1);
    }
    try {
      const result = deleteSnapshot(name);
      console.log(formatPruneSummary(result));
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (subcommand === 'old') {
    const daysIdx = rest.indexOf('--days');
    const days = daysIdx !== -1 ? parseInt(rest[daysIdx + 1], 10) : NaN;
    if (isNaN(days) || days <= 0) {
      console.error('Error: --days must be a positive integer');
      process.exit(1);
    }
    const result = pruneByAge(days * 24 * 60 * 60 * 1000);
    console.log(formatPruneSummary(result));
    return;
  }

  if (subcommand === 'keep') {
    const latestIdx = rest.indexOf('--latest');
    const count = latestIdx !== -1 ? parseInt(rest[latestIdx + 1], 10) : NaN;
    if (isNaN(count) || count <= 0) {
      console.error('Error: --latest must be a positive integer');
      process.exit(1);
    }
    const result = pruneKeepLatest(count);
    console.log(formatPruneSummary(result));
    return;
  }

  console.error(`Unknown prune subcommand: ${subcommand}`);
  printPruneUsage();
  process.exit(1);
}

module.exports = { printPruneUsage, runPrune };
