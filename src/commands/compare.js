const { compareTwoSnapshots, formatCompareResult } = require('../compare');

function printCompareUsage() {
  console.log(`
Usage: snapenv compare <snapshotA> <snapshotB> [options]

Compare two snapshots side by side.

Options:
  --json       Output result as JSON
  --help       Show this help message

Examples:
  snapenv compare dev prod
  snapenv compare staging-2024-01 staging-2024-02 --json
`);
}

async function runCompare(args) {
  if (args.includes('--help') || args.includes('-h')) {
    printCompareUsage();
    return;
  }

  const positional = args.filter(a => !a.startsWith('--'));
  const useJson = args.includes('--json');

  if (positional.length < 2) {
    console.error('Error: two snapshot names are required.');
    printCompareUsage();
    process.exit(1);
  }

  const [nameA, nameB] = positional;

  try {
    const result = await compareTwoSnapshots(nameA, nameB);

    if (useJson) {
      console.log(JSON.stringify({ snapshotA: nameA, snapshotB: nameB, ...result }, null, 2));
      return;
    }

    console.log(formatCompareResult(nameA, nameB, result));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { printCompareUsage, runCompare };
