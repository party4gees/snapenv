const {
  archiveSnapshot,
  listArchived,
  restoreFromArchive,
  getArchiveDir,
} = require('../archive');
const { ensureSnapenvDir } = require('../snapshot');

function printArchiveUsage() {
  console.log(`
Usage: snapenv archive <subcommand> [options]

Subcommands:
  add <name>        Archive a snapshot by name
  list              List all archived snapshots
  restore <name>    Restore a snapshot from the archive

Examples:
  snapenv archive add my-snapshot
  snapenv archive list
  snapenv archive restore my-snapshot
`);
}

async function runArchive(args) {
  const subcommand = args[0];

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    printArchiveUsage();
    return;
  }

  await ensureSnapenvDir();

  if (subcommand === 'add') {
    const name = args[1];
    if (!name) {
      console.error('Error: snapshot name is required');
      process.exit(1);
    }
    const result = await archiveSnapshot(name);
    console.log(`Archived snapshot "${result.name}" → ${result.archivePath}`);
    return;
  }

  if (subcommand === 'list') {
    const archived = await listArchived();
    if (archived.length === 0) {
      console.log('No archived snapshots found.');
      return;
    }
    console.log('Archived snapshots:');
    archived.forEach((entry) => {
      const date = new Date(entry.archivedAt).toLocaleString();
      console.log(`  ${entry.name}  (archived: ${date})`);
    });
    return;
  }

  if (subcommand === 'restore') {
    const name = args[1];
    if (!name) {
      console.error('Error: snapshot name is required');
      process.exit(1);
    }
    const result = await restoreFromArchive(name);
    console.log(`Restored "${result.name}" from archive.`);
    return;
  }

  console.error(`Unknown archive subcommand: ${subcommand}`);
  printArchiveUsage();
  process.exit(1);
}

module.exports = { printArchiveUsage, runArchive };
