const { initProject, isInitialized, formatInitSummary } = require('../init');

function printInitUsage() {
  console.log(`
snapenv init — initialize snapenv in the current project

Usage:
  snapenv init [options]

Options:
  --env-file <file>      default env file to use (default: .env)
  --max-snapshots <n>    maximum snapshots to keep (default: 50)
  --auto-tag             automatically tag snapshots on save
  --help                 show this help message

Examples:
  snapenv init
  snapenv init --env-file .env.local
  snapenv init --max-snapshots 20
  `);
}

function runInit(args = []) {
  if (args.includes('--help')) {
    printInitUsage();
    return;
  }

  const options = {};

  const envFileIdx = args.indexOf('--env-file');
  if (envFileIdx !== -1 && args[envFileIdx + 1]) {
    options.defaultEnvFile = args[envFileIdx + 1];
  }

  const maxIdx = args.indexOf('--max-snapshots');
  if (maxIdx !== -1 && args[maxIdx + 1]) {
    const n = parseInt(args[maxIdx + 1], 10);
    if (!isNaN(n) && n > 0) options.maxSnapshots = n;
  }

  if (args.includes('--auto-tag')) {
    options.autoTag = true;
  }

  const alreadyExisted = isInitialized();
  const config = initProject(options);
  console.log(formatInitSummary(config, alreadyExisted));
}

module.exports = { printInitUsage, runInit };
