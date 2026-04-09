import { copySnapshot, formatCopySummary } from '../copy.js';

export function printCopyUsage() {
  console.log(`
Usage: snapenv copy <source> <destination> [options]

Copy an existing snapshot to a new name.

Arguments:
  source       Name of the snapshot to copy from
  destination  Name of the new snapshot

Options:
  --force      Overwrite destination if it already exists
  --help       Show this help message

Examples:
  snapenv copy production staging
  snapenv copy main backup-before-deploy --force
`);
}

export async function runCopy(args) {
  if (!args || args.length < 2 || args.includes('--help')) {
    printCopyUsage();
    return;
  }

  const [source, destination, ...flags] = args;
  const force = flags.includes('--force');

  try {
    const result = await copySnapshot(source, destination, { force });
    console.log(formatCopySummary(result));
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}
