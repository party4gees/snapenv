const { pinSnapshot, unpinSnapshot, listPinnedSnapshots, formatPinList } = require('../pin');

function printPinUsage() {
  console.log(`
Usage: snapenv pin <subcommand> [snapshot]

Subcommands:
  add <name>     Pin a snapshot to protect it from pruning
  remove <name>  Unpin a snapshot
  list           List all pinned snapshots

Examples:
  snapenv pin add production
  snapenv pin remove production
  snapenv pin list
`);
}

function runPin(args) {
  const [subcommand, name] = args;

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    printPinUsage();
    return;
  }

  if (subcommand === 'list') {
    const pinned = listPinnedSnapshots();
    console.log(formatPinList(pinned));
    return;
  }

  if (!name) {
    console.error(`Error: snapshot name required for "pin ${subcommand}"`);
    process.exit(1);
  }

  if (subcommand === 'add') {
    try {
      pinSnapshot(name);
      console.log(`📌 Pinned snapshot "${name}".`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (subcommand === 'remove') {
    try {
      unpinSnapshot(name);
      console.log(`🔓 Unpinned snapshot "${name}".`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  console.error(`Unknown pin subcommand: "${subcommand}"`);
  printPinUsage();
  process.exit(1);
}

module.exports = { printPinUsage, runPin };
