/**
 * Command handler for the mirror command.
 * Mirrors a snapshot to another name/location.
 */

const { mirrorSnapshot, formatMirrorResult } = require('../mirror');
const { listSnapshots } = require('../snapshot');

function printMirrorUsage() {
  console.log(`
Usage: snapenv mirror <source> <destination> [options]

Mirror a snapshot to a new name, creating an exact copy.

Arguments:
  source         Name of the snapshot to mirror
  destination    Name for the mirrored snapshot

Options:
  --overwrite    Overwrite destination if it already exists
  --dry-run      Preview what would happen without making changes
  --help         Show this help message

Examples:
  snapenv mirror production staging
  snapenv mirror dev dev-backup --overwrite
  snapenv mirror feature-x feature-y --dry-run
`);
}

async function runMirror(args) {
  if (args.includes('--help') || args.includes('-h')) {
    printMirrorUsage();
    return;
  }

  const flags = args.filter(a => a.startsWith('--'));
  const positional = args.filter(a => !a.startsWith('--'));

  const overwrite = flags.includes('--overwrite');
  const dryRun = flags.includes('--dry-run');

  if (positional.length < 2) {
    console.error('Error: mirror requires both a source and destination name.');
    printMirrorUsage();
    process.exit(1);
  }

  const [source, destination] = positional;

  // Validate source exists
  const snapshots = await listSnapshots();
  if (!snapshots.includes(source)) {
    console.error(`Error: snapshot "${source}" does not exist.`);
    process.exit(1);
  }

  // Check destination conflict
  if (!overwrite && snapshots.includes(destination)) {
    console.error(
      `Error: snapshot "${destination}" already exists. Use --overwrite to replace it.`
    );
    process.exit(1);
  }

  if (dryRun) {
    console.log(`[dry-run] Would mirror "${source}" → "${destination}"`);
    if (overwrite && snapshots.includes(destination)) {
      console.log(`[dry-run] Would overwrite existing snapshot "${destination}"`);
    }
    return;
  }

  try {
    const result = await mirrorSnapshot(source, destination, { overwrite });
    const summary = formatMirrorResult(result);
    console.log(summary);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { printMirrorUsage, runMirror };
