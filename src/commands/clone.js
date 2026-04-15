const { cloneSnapshot, formatCloneResult } = require('../clone');

function printCloneUsage() {
  console.log(`
snapenv clone <source> <dest> [options]

Clone an existing snapshot to a new name.

Arguments:
  source    Name of the snapshot to clone
  dest      Name for the new cloned snapshot

Options:
  --force   Overwrite destination if it already exists
  --help    Show this help message
`.trim());
}

async function runClone(args) {
  if (args.includes('--help') || args.length === 0) {
    printCloneUsage();
    return;
  }

  const [source, dest, ...rest] = args;

  if (!source || !dest) {
    console.error('Error: both <source> and <dest> are required.');
    printCloneUsage();
    process.exit(1);
  }

  const force = rest.includes('--force');

  try {
    const summary = await cloneSnapshot(source, dest, { force });
    console.log(formatCloneResult(summary));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { printCloneUsage, runClone };
