const { setNote, getNote, removeNote, formatNote } = require('../note');
const path = require('path');

function printNoteUsage() {
  console.log(`
Usage: snapenv note <subcommand> <snapshot> [text]

Subcommands:
  set <snapshot> <text>   Attach a note to a snapshot
  get <snapshot>          Show the note for a snapshot
  remove <snapshot>       Remove the note from a snapshot

Examples:
  snapenv note set my-snap "Used for staging deployments"
  snapenv note get my-snap
  snapenv note remove my-snap
  `);
}

function runNote(args, baseDir = process.cwd()) {
  const [sub, snapshotName, ...rest] = args;

  if (!sub || !snapshotName) {
    printNoteUsage();
    process.exit(1);
  }

  if (sub === 'set') {
    const text = rest.join(' ');
    if (!text) {
      console.error('Error: note text is required for set subcommand');
      process.exit(1);
    }
    try {
      setNote(baseDir, snapshotName, text);
      console.log(`Note saved for "${snapshotName}".`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  } else if (sub === 'get') {
    const note = getNote(baseDir, snapshotName);
    console.log(formatNote(snapshotName, note));
  } else if (sub === 'remove') {
    const removed = removeNote(baseDir, snapshotName);
    if (removed) {
      console.log(`Note removed from "${snapshotName}".`);
    } else {
      console.log(`No note found for "${snapshotName}".`);
    }
  } else {
    console.error(`Unknown subcommand: ${sub}`);
    printNoteUsage();
    process.exit(1);
  }
}

module.exports = { printNoteUsage, runNote };
