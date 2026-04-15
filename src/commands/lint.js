const { lintSnapshot, formatLintResult } = require('../lint');
const { ensureSnapenvDir } = require('../snapshot');

function printLintUsage() {
  console.log([
    'Usage: snapenv lint <snapshot>',
    '',
    'Lint a snapshot for common issues.',
    '',
    'Checks performed:',
    '  no_empty_value       - warns if any variable has an empty value',
    '  no_whitespace_key    - warns if a key contains whitespace',
    '  no_quotes_in_value   - warns if a value is wrapped in quotes',
    '',
    'Options:',
    '  --strict             - exit with code 1 if any warnings are found',
    '  --help               - show this help message',
  ].join('\n'));
}

function runLint(args) {
  if (!args || args.includes('--help')) {
    printLintUsage();
    return;
  }

  const strict = args.includes('--strict');
  const filtered = args.filter(a => !a.startsWith('--'));
  const name = filtered[0];

  if (!name) {
    console.error('Error: snapshot name is required.');
    printLintUsage();
    process.exitCode = 1;
    return;
  }

  try {
    const snapenvDir = ensureSnapenvDir();
    const warnings = lintSnapshot(name, snapenvDir);
    console.log(formatLintResult(name, warnings));
    if (strict && warnings.length > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exitCode = 1;
  }
}

module.exports = { printLintUsage, runLint };
