const path = require('path');
const { ensureSnapenvDir } = require('../snapshot');
const { searchByKey, searchByValue, formatSearchResults } = require('../search');

function printSearchUsage() {
  console.log(`
Usage: snapenv search [options] <pattern>

Search across all snapshots for matching keys or values.

Options:
  --value, -v    Search by value instead of key name
  --help, -h     Show this help message

Examples:
  snapenv search DATABASE
  snapenv search --value localhost
`);
}

async function runSearch(args) {
  if (args.includes('--help') || args.includes('-h')) {
    printSearchUsage();
    return;
  }

  const byValue = args.includes('--value') || args.includes('-v');
  const filtered = args.filter(a => !['--value', '-v'].includes(a));
  const pattern = filtered[0];

  if (!pattern) {
    console.error('Error: search pattern is required.');
    printSearchUsage();
    process.exit(1);
  }

  const snapenvDir = ensprocess.cwd());

  try {
    const results = byValue
      ? await searchByValue(snapenvDir, pattern)
      : await searchByKey(snapenvDir, pattern) formatSearchResults(results, pattern);
    console.log(output);
  } catch (err) {
    console.error(`Error running search: ${err.message}`);
    process.exit(1);
  }
}

module.exports =SearchUsage, runSearch };
