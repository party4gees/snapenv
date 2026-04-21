const { loadSnapshot } = require('../snapshot');
const { buildPivotTable, formatPivotTable } = require('../pivot');

function printPivotUsage() {
  console.log(`
snapenv pivot <snapshot1> <snapshot2> [snapshot3...]

Compare multiple snapshots side-by-side in a pivot table.
Rows are environment variable keys; columns are snapshot names.

Examples:
  snapenv pivot dev prod
  snapenv pivot dev staging prod
`.trim());
}

async function runPivot(args) {
  const flags = args.filter((a) => a.startsWith('--'));
  const names = args.filter((a) => !a.startsWith('--'));

  if (flags.includes('--help') || flags.includes('-h')) {
    printPivotUsage();
    return;
  }

  if (names.length < 2) {
    console.error('Error: pivot requires at least two snapshot names.');
    printPivotUsage();
    process.exit(1);
  }

  const snapshots = [];

  for (const name of names) {
    let snap;
    try {
      snap = await loadSnapshot(name);
    } catch (err) {
      console.error(`Error: snapshot "${name}" not found.`);
      process.exit(1);
    }
    snapshots.push({ name, vars: snap.vars || snap });
  }

  const table = buildPivotTable(snapshots);
  console.log(formatPivotTable(table));
}

module.exports = { printPivotUsage, runPivot };
