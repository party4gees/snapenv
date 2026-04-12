const {
  createProfile,
  deleteProfile,
  getProfile,
  listProfiles,
  formatProfileList,
} = require('../profile');

function printProfileUsage() {
  console.log(`
Usage: snapenv profile <subcommand> [options]

Subcommands:
  create <name> <snap1> [snap2 ...]   Create a profile grouping named snapshots
  delete <name>                       Delete a profile
  show <name>                         Show snapshots in a profile
  list                                List all profiles

Examples:
  snapenv profile create dev base feature-x
  snapenv profile show dev
  snapenv profile delete dev
  snapenv profile list
`);
}

function runProfile(args) {
  const [sub, ...rest] = args;

  if (!sub || sub === '--help' || sub === '-h') {
    printProfileUsage();
    return;
  }

  if (sub === 'create') {
    const [name, ...snapshots] = rest;
    if (!name || snapshots.length === 0) {
      console.error('Usage: snapenv profile create <name> <snap1> [snap2 ...]');
      process.exit(1);
    }
    try {
      const profile = createProfile(name, snapshots);
      console.log(`Profile '${name}' created with snapshots: ${profile.snapshots.join(', ')}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'delete') {
    const [name] = rest;
    if (!name) { console.error('Usage: snapenv profile delete <name>'); process.exit(1); }
    try {
      deleteProfile(name);
      console.log(`Profile '${name}' deleted.`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'show') {
    const [name] = rest;
    if (!name) { console.error('Usage: snapenv profile show <name>'); process.exit(1); }
    const profile = getProfile(name);
    if (!profile) { console.error(`Profile '${name}' not found.`); process.exit(1); }
    console.log(`Profile '${name}':`);
    profile.snapshots.forEach(s => console.log(`  - ${s}`));
    return;
  }

  if (sub === 'list') {
    const profiles = listProfiles();
    console.log(formatProfileList(profiles));
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printProfileUsage();
  process.exit(1);
}

module.exports = { printProfileUsage, runProfile };
