const { copySnapshot, formatCopySummary } = require('../copy');

function printCopyUsage() {
  console.log(`
snapenv copy <source> <dest>

Copy an existing snapshot to a new name.

Arguments:
  source    Name of the snapshot to copy from
  dest      Name of the new snapshot

Examples:
  snapenv copy dev dev-backup
  snapenv copy staging staging-2024
`.trim());
}

async function runCopy(args) {
  if (!args || args.length < 2 || args.includes('--help') || args.includes('-h')) {
    printCopyUsage();
    return;
  }

  const [source, dest] = args;
  const projectDir = process.cwd();

  try {
    const result = await copySnapshot(source, dest, projectDir);
    console.log(formatCopySummary(result));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { printCopyUsage, runCopy };
