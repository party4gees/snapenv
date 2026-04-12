const {
  createGroup,
  deleteGroup,
  addSnapshotToGroup,
  removeSnapshotFromGroup,
  listGroups,
  getGroup,
  formatGroupList
} = require('../group');

function printGroupUsage() {
  console.log(`
Usage: snapenv group <subcommand> [options]

Subcommands:
  create <name> [snap1 snap2 ...]  Create a new group
  delete <name>                    Delete a group
  add <group> <snapshot>           Add snapshot to group
  remove <group> <snapshot>        Remove snapshot from group
  list                             List all groups
  show <name>                      Show snapshots in a group
  `.trim());
}

function runGroup(args) {
  const [sub, ...rest] = args;

  if (!sub || sub === '--help' || sub === '-h') {
    printGroupUsage();
    return;
  }

  if (sub === 'create') {
    const [name, ...snapshots] = rest;
    if (!name) { console.error('Error: group name required'); process.exit(1); }
    try {
      createGroup(name, snapshots);
      console.log(`Group "${name}" created with ${snapshots.length} snapshot(s).`);
    } catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
    return;
  }

  if (sub === 'delete') {
    const [name] = rest;
    if (!name) { console.error('Error: group name required'); process.exit(1); }
    try {
      deleteGroup(name);
      console.log(`Group "${name}" deleted.`);
    } catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
    return;
  }

  if (sub === 'add') {
    const [groupName, snapshotName] = rest;
    if (!groupName || !snapshotName) { console.error('Error: group and snapshot name required'); process.exit(1); }
    try {
      addSnapshotToGroup(groupName, snapshotName);
      console.log(`Added "${snapshotName}" to group "${groupName}".`);
    } catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
    return;
  }

  if (sub === 'remove') {
    const [groupName, snapshotName] = rest;
    if (!groupName || !snapshotName) { console.error('Error: group and snapshot name required'); process.exit(1); }
    try {
      removeSnapshotFromGroup(groupName, snapshotName);
      console.log(`Removed "${snapshotName}" from group "${groupName}".`);
    } catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
    return;
  }

  if (sub === 'list') {
    const groups = listGroups();
    console.log(formatGroupList(groups));
    return;
  }

  if (sub === 'show') {
    const [name] = rest;
    if (!name) { console.error('Error: group name required'); process.exit(1); }
    const g = getGroup(name);
    if (!g) { console.error(`Error: Group "${name}" not found`); process.exit(1); }
    if (g.snapshots.length === 0) { console.log(`Group "${name}" is empty.`); return; }
    console.log(`Group "${name}":`);
    g.snapshots.forEach(s => console.log(`  - ${s}`));
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printGroupUsage();
  process.exit(1);
}

module.exports = { printGroupUsage, runGroup };
