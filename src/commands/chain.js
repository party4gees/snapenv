const { saveChain, chainSnapshots, formatChainResult } = require('../chain');
const { getSnapshotPath } = require('../snapshot');
const path = require('path');

function printChainUsage() {
  console.log(`
Usage: snapenv chain <snap1> <snap2> [..snapN] --into <name>

Merge multiple snapshots in order into a new snapshot.
Later snapshots override earlier ones on key conflicts.

Options:
  --into <name>   Name for the resulting merged snapshot (required)
  --dry-run       Preview merged result without saving
  --help          Show this help message

Examples:
  snapenv chain base production --into final
  snapenv chain defaults local --into merged --dry-run
  `);
}

function runChain(args, snapenvDir) {
  if (args.includes('--help') || args.length === 0) {
    printChainUsage();
    return;
  }

  const intoIdx = args.indexOf('--into');
  const dryRun = args.includes('--dry-run');

  if (intoIdx === -1 || !args[intoIdx + 1]) {
    console.error('Error: --into <name> is required');
    process.exit(1);
  }

  const targetName = args[intoIdx + 1];
  const names = args.filter((a, i) => {
    return !a.startsWith('--') && i !== intoIdx + 1;
  });

  if (names.length < 2) {
    console.error('Error: at least two snapshot names are required');
    process.exit(1);
  }

  try {
    if (dryRun) {
      const { merged, loaded } = chainSnapshots(names, snapenvDir);
      console.log(`[dry-run] Would chain: ${loaded.join(' -> ')} -> "${targetName}"`);
      console.log(`[dry-run] Result would have ${Object.keys(merged).length} key(s)`);
      return;
    }

    const result = saveChain(targetName, names, snapenvDir);
    console.log(formatChainResult(result));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { printChainUsage, runChain };
