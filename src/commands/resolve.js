const { loadSnapshot } = require('../snapshot');
const { parseEnvFile } = require('../env');
const { formatResolution } = require('../resolve');
const fs = require('fs');
const path = require('path');

function printResolveUsage() {
  console.log(`
Usage: snapenv resolve <snapshot> [options]

Resolve conflicts between a snapshot and the current .env file.

Options:
  --env <file>       Path to env file (default: .env)
  --strategy <s>     Conflict resolution strategy: snapshot|env|interactive (default: snapshot)
  --dry-run          Show what would change without applying
  --help             Show this help

Examples:
  snapenv resolve my-snapshot
  snapenv resolve my-snapshot --strategy env
  snapenv resolve my-snapshot --env .env.local --dry-run
`);
}

async function runResolve(args) {
  const [snapshotName, ...rest] = args;

  if (!snapshotName || snapshotName === '--help') {
    printResolveUsage();
    return;
  }

  const envFlag = rest.indexOf('--env');
  const envFile = envFlag !== -1 ? rest[envFlag + 1] : '.env';

  const strategyFlag = rest.indexOf('--strategy');
  const strategy = strategyFlag !== -1 ? rest[strategyFlag + 1] : 'snapshot';

  const dryRun = rest.includes('--dry-run');

  const validStrategies = ['snapshot', 'env', 'interactive'];
  if (!validStrategies.includes(strategy)) {
    console.error(`Unknown strategy: ${strategy}. Use one of: ${validStrategies.join(', ')}`);
    process.exit(1);
  }

  let snapshotVars;
  try {
    snapshotVars = loadSnapshot(snapshotName);
  } catch (err) {
    console.error(`Snapshot not found: ${snapshotName}`);
    process.exit(1);
  }

  let envVars = {};
  const envPath = path.resolve(envFile);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    envVars = parseEnvFile(content);
  }

  const result = formatResolution(snapshotVars, envVars, strategy);

  if (result.conflicts.length === 0) {
    console.log('No conflicts found.');
    return;
  }

  console.log(`Found ${result.conflicts.length} conflict(s):`);
  console.log(result.summary);

  if (dryRun) {
    console.log('\n[dry-run] No changes applied.');
    return;
  }

  console.log(`\nResolved using strategy: ${strategy}`);
}

module.exports = { printResolveUsage, runResolve };
