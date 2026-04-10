const { validateSnapshot, validateSnapshotValues, formatValidationResult } = require('../validate');

function printValidateUsage() {
  console.log(`
Usage: snapenv validate <snapshot-name> [options]

Validate a snapshot against the current .env file.

Options:
  --env <path>     Path to env file (default: .env)
  --values         Also check for empty values in the snapshot
  --help           Show this help message
`);
}

function runValidate(args) {
  if (!args || args.length === 0 || args.includes('--help')) {
    printValidateUsage();
    return;
  }

  const snapshotName = args[0];
  const envIndex = args.indexOf('--env');
  const envFilePath = envIndex !== -1 ? args[envIndex + 1] : '.env';
  const checkValues = args.includes('--values');

  if (!snapshotName) {
    console.error('Error: snapshot name is required.');
    process.exit(1);
  }

  let hasError = false;

  try {
    const result = validateSnapshot(snapshotName, envFilePath);
    console.log(formatValidationResult(result));
    if (!result.valid) hasError = true;

    if (checkValues) {
      const valResult = validateSnapshotValues(snapshotName);
      if (!valResult.valid) {
        console.log(formatValidationResult({
          snapshotName,
          valid: false,
          emptyKeys: valResult.emptyKeys,
          missingFromEnv: [],
          missingFromSnapshot: [],
          envFilePath,
        }));
        hasError = true;
      }
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  if (hasError) process.exit(1);
}

module.exports = { printValidateUsage, runValidate };
