const { promoteSnapshot, buildPromoteSummary, formatPromoteResult } = require('../promote');
const { getSnapenvDir } = require('../snapshot');

function printPromoteUsage() {
  console.log('Usage: snapenv promote <src> <dest> [options]');
  console.log('');
  console.log('Promote a snapshot by copying it under a new name.');
  console.log('');
  console.log('Arguments:');
  console.log('  src   Name of the source snapshot');
  console.log('  dest  Name of the destination snapshot');
  console.log('');
  console.log('Options:');
  console.log('  --force   Overwrite destination without prompting');
  console.log('  --help    Show this help message');
}

function runPromote(args) {
  if (args.includes('--help') || args.includes('-h')) {
    printPromoteUsage();
    return;
  }

  const positional = args.filter(a => !a.startsWith('--'));
  const [srcName, destName] = positional;

  if (!srcName || !destName) {
    console.error('Error: src and dest snapshot names are required.');
    printPromoteUsage();
    process.exit(1);
  }

  const force = args.includes('--force');
  const snapenvDir = getSnapenvDir();

  try {
    const result = promoteSnapshot(srcName, destName, snapenvDir);
    if (result.overwrote && !force) {
      console.warn(`Warning: destination snapshot '${destName}' already existed and was overwritten.`);
    }
    const summary = buildPromoteSummary(result);
    console.log(formatPromoteResult(summary));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { printPromoteUsage, runPromote };
