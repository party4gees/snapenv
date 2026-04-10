const { getHistory, clearHistory, formatHistory } = require('../history');

function printHistoryUsage() {
  console.log(`
snapenv history [options]

Show a log of recent snapenv actions.

Options:
  --limit <n>   Number of entries to show (default: 20)
  --clear       Clear all history
  --help        Show this help message
`.trim());
}

function runHistory(args = []) {
  if (args.includes('--help')) {
    printHistoryUsage();
    return;
  }

  if (args.includes('--clear')) {
    clearHistory();
    console.log('History cleared.');
    return;
  }

  let limit = 20;
  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1) {
    const val = parseInt(args[limitIdx + 1], 10);
    if (!isNaN(val) && val > 0) {
      limit = val;
    } else {
      console.error('Invalid --limit value. Must be a positive integer.');
      process.exit(1);
    }
  }

  const entries = getHistory(limit);
  console.log(formatHistory(entries));
}

module.exports = { printHistoryUsage, runHistory };
