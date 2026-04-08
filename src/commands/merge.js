/**
 * CLI command: snapenv merge <snapshot-name> [--strategy ours|theirs]
 */
const path = require('path');
const { loadSnapshot } = require('../snapshot');
const { parseEnvFile, serializeEnvVars, writeEnvFile } = require('../env');
const { mergeEnvVars, formatMergeSummary } = require('../merge');

const DEFAULT_ENV_FILE = path.resolve(process.cwd(), '.env');

/**
 * @param {string} snapshotName
 * @param {object} options
 * @param {'ours'|'theirs'} [options.strategy='theirs']
 * @param {string} [options.envFile]
 */
async function mergeCommand(snapshotName, options = {}) {
  const strategy = options.strategy || 'theirs';
  const envFile = options.envFile || DEFAULT_ENV_FILE;

  if (!['ours', 'theirs'].includes(strategy)) {
    console.error(`Invalid strategy "${strategy}". Use "ours" or "theirs".`);
    process.exit(1);
  }

  let snapshotVars;
  try {
    snapshotVars = await loadSnapshot(snapshotName);
  } catch (err) {
    console.error(`Could not load snapshot "${snapshotName}": ${err.message}`);
    process.exit(1);
  }

  let currentVars = {};
  try {
    currentVars = await parseEnvFile(envFile);
  } catch (err) {
    // No existing .env is fine — start from empty
    if (err.code !== 'ENOENT') {
      console.error(`Error reading env file: ${err.message}`);
      process.exit(1);
    }
  }

  const { merged, conflicts } = mergeEnvVars(currentVars, snapshotVars, strategy);
  const summary = formatMergeSummary(conflicts, strategy);

  await writeEnvFile(envFile, serializeEnvVars(merged));

  console.log(summary);
  console.log(`Merged snapshot "${snapshotName}" into ${envFile}`);
}

module.exports = { mergeCommand };
