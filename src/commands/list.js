const { listSnapshotsWithMeta, formatSnapshotList } = require('../list');

function printListUsage() {
  console.log(`
Usage: snapenv list [options]

List all saved snapshots for the current project.

Options:
  --json    Output snapshot list as JSON
  --help    Show this help message
`.trim());
}

function runList(args = [], projectDir = process.cwd()) {
  if (args.includes('--help')) {
    printListUsage();
    return;
  }

  const useJson = args.includes('--json');

  let snapshots;
  try {
    snapshots = listSnapshotsWithMeta(projectDir);
  } catch (err) {
    console.error(`Error reading snapshots: ${err.message}`);
    process.exit(1);
  }

  if (useJson) {
    const output = snapshots.map(s => ({
      name: s.name,
      keyCount: s.keyCount,
      createdAt: s.createdAt ? s.createdAt.toISOString() : null,
    }));
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log(formatSnapshotList(snapshots));
}

module.exports = { runList, printListUsage };
