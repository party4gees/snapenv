const { buildPipeline, runPipeline, formatPipelineResult } = require('../pipeline');
const { loadConfig } = require('../init');
const path = require('path');

function printPipelineUsage() {
  console.log(`
snapenv pipeline <step1> [step2 ...] [options]

Apply multiple snapshots in sequence to the current .env file.

Options:
  --env <path>          Path to .env file (default: .env)
  --keys <k1,k2,...>    Comma-separated keys to apply from the LAST step only
  --continue-on-error   Skip missing snapshots instead of aborting
  --help                Show this help

Examples:
  snapenv pipeline base dev
  snapenv pipeline base dev --env .env.local
  snapenv pipeline base --keys PORT,HOST
  `);
}

async function runPipelineCommand(args) {
  if (args.includes('--help') || args.length === 0) {
    printPipelineUsage();
    return;
  }

  const steps = [];
  let envPath = '.env';
  let continueOnError = false;
  let pendingKeys = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--env') { envPath = args[++i]; continue; }
    if (args[i] === '--continue-on-error') { continueOnError = true; continue; }
    if (args[i] === '--keys') { pendingKeys = args[++i].split(','); continue; }
    steps.push(args[i]);
  }

  if (steps.length === 0) {
    console.error('Error: at least one snapshot name is required.');
    process.exit(1);
  }

  // Apply --keys only to the last step
  const pipelineInput = steps.map((s, i) =>
    i === steps.length - 1 && pendingKeys ? { name: s, keys: pendingKeys } : s
  );

  const config = await loadConfig().catch(() => ({}));
  const resolvedEnv = path.resolve(config.envPath || envPath);

  try {
    const results = await runPipeline(pipelineInput, resolvedEnv, { continueOnError });
    console.log(formatPipelineResult(results));
  } catch (err) {
    console.error(`Pipeline failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { printPipelineUsage, runPipelineCommand };
