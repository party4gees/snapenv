const fs = require('fs');
const path = require('path');
const { exportToFile, formatExportSummary } = require('../export');

const VALID_FORMATS = ['env', 'json', 'shell'];

function printExportUsage() {
  console.log(`
Usage: snapenv export <snapshot-name> [options]

Export a snapshot to various formats

Options:
  -f, --format <format>    Export format: env, json, shell (default: env)
  -o, --output <file>      Output file path (default: stdout)
  -h, --help              Show this help message

Examples:
  snapenv export production                    # Print to stdout in .env format
  snapenv export production -f json            # Print to stdout in JSON format
  snapenv export production -o .env.backup     # Export to .env.backup file
  snapenv export production -f shell -o vars.sh # Export as shell script
`);
}

function runExport(args) {
  if (args.includes('-h') || args.includes('--help')) {
    printExportUsage();
    return;
  }

  const snapshotName = args[0];
  if (!snapshotName) {
    console.error('Error: Snapshot name is required');
    printExportUsage();
    process.exit(1);
  }

  // Parse options
  let format = 'env';
  let outputFile = null;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '-f' || args[i] === '--format') {
      format = args[++i];
    } else if (args[i] === '-o' || args[i] === '--output') {
      outputFile = args[++i];
    }
  }

  if (!VALID_FORMATS.includes(format)) {
    console.error(`Error: Invalid format "${format}". Valid formats are: ${VALID_FORMATS.join(', ')}`);
    process.exit(1);
  }

  try {
    if (outputFile) {
      // Export to file
      const summary = exportToFile(snapshotName, outputFile, format);
      console.log(formatExportSummary(summary));
    } else {
      // Export to stdout
      const { exportSnapshot } = require('../export');
      const content = exportSnapshot(snapshotName, format);
      console.log(content);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  printExportUsage,
  runExport
};
