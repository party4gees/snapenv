const {
  stampSnapshot,
  removeStamp,
  getStampsForSnapshot,
  findSnapshotsByStamp,
  formatStampList,
} = require('../stamp');

function printStampUsage() {
  console.log(`
Usage: snapenv stamp <subcommand> [options]

Subcommands:
  add <snapshot> <label>     Add a stamp label to a snapshot
  remove <snapshot> <label>  Remove a stamp label from a snapshot
  list <snapshot>            List all stamps on a snapshot
  find <label>               Find snapshots with a given stamp label

Examples:
  snapenv stamp add dev release-1.0
  snapenv stamp remove dev release-1.0
  snapenv stamp list dev
  snapenv stamp find release-1.0
`.trim());
}

function runStamp(args, baseDir = process.cwd()) {
  const [sub, ...rest] = args;

  if (!sub || sub === '--help' || sub === '-h') {
    printStampUsage();
    return;
  }

  if (sub === 'add') {
    const [name, label] = rest;
    if (!name || !label) {
      console.error('Usage: snapenv stamp add <snapshot> <label>');
      process.exit(1);
    }
    try {
      const entry = stampSnapshot(name, label, baseDir);
      console.log(`Stamped "${name}" with label "${label}" at ${entry.stampedAt}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'remove') {
    const [name, label] = rest;
    if (!name || !label) {
      console.error('Usage: snapenv stamp remove <snapshot> <label>');
      process.exit(1);
    }
    const removed = removeStamp(name, label, baseDir);
    if (removed) {
      console.log(`Removed stamp "${label}" from "${name}".`);
    } else {
      console.log(`Stamp "${label}" not found on "${name}".`);
    }
    return;
  }

  if (sub === 'list') {
    const [name] = rest;
    if (!name) {
      console.error('Usage: snapenv stamp list <snapshot>');
      process.exit(1);
    }
    const stamps = getStampsForSnapshot(name, baseDir);
    console.log(formatStampList(name, stamps));
    return;
  }

  if (sub === 'find') {
    const [label] = rest;
    if (!label) {
      console.error('Usage: snapenv stamp find <label>');
      process.exit(1);
    }
    const found = findSnapshotsByStamp(label, baseDir);
    if (!found.length) {
      console.log(`No snapshots found with stamp "${label}".`);
    } else {
      console.log(`Snapshots with stamp "${label}":\n${found.map(n => `  ${n}`).join('\n')}`);
    }
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printStampUsage();
  process.exit(1);
}

module.exports = { printStampUsage, runStamp };
