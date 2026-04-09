const { renameSnapshot, buildRenameSummary, formatRenameSummary } = require('../rename');

function printRenameUsage() {
  console.log(`
Usage: snapenv rename <old-name> <new-name>

Rename an existing snapshot.

Arguments:
  old-name    Name of the snapshot to rename
  new-name    New name for the snapshot

Examples:
  snapenv rename my-snapshot my-snapshot-v2
  snapenv rename dev production
`);
}

async function runRename(args) {
  if (!args || args.length < 2) {
    console.error('Error: rename requires two arguments: <old-name> <new-name>');
    printRenameUsage();
    process.exit(1);
  }

  const [oldName, newName] = args;

  if (!oldName || !oldName.trim()) {
    console.error('Error: old snapshot name cannot be empty');
    process.exit(1);
  }

  if (!newName || !newName.trim()) {
    console.error('Error: new snapshot name cannot be empty');
    process.exit(1);
  }

  if (oldName === newName) {
    console.error('Error: old and new names must be different');
    process.exit(1);
  }

  try {
    const result = await renameSnapshot(oldName.trim(), newName.trim());
    const summary = buildRenameSummary(result);
    console.log(formatRenameSummary(summary));
  } catch (err) {
    if (err.code === 'SNAPSHOT_NOT_FOUND') {
      console.error(`Error: snapshot "${oldName}" not found`);
    } else if (err.code === 'SNAPSHOT_EXISTS') {
      console.error(`Error: snapshot "${newName}" already exists`);
    } else {
      console.error(`Error: ${err.message}`);
    }
    process.exit(1);
  }
}

module.exports = { printRenameUsage, runRename };
