const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./env');
const { saveSnapshot } = require('./snapshot');
const { recordAction } = require('./history');

const DEFAULT_DEBOUNCE_MS = 500;

function watchEnvFile(envPath, snapshotName, options = {}) {
  const debounceMs = options.debounce ?? DEFAULT_DEBOUNCE_MS;
  const verbose = options.verbose ?? false;

  if (!fs.existsSync(envPath)) {
    throw new Error(`Env file not found: ${envPath}`);
  }

  let debounceTimer = null;

  const watcher = fs.watch(envPath, (eventType) => {
    if (eventType !== 'change') return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const vars = parseEnvFile(envPath);
        await saveSnapshot(snapshotName, vars);
        await recordAction('watch-auto-save', snapshotName, { source: envPath });
        if (verbose) {
          console.log(`[watch] Auto-saved snapshot "${snapshotName}" from ${envPath}`);
        }
      } catch (err) {
        console.error(`[watch] Failed to auto-save: ${err.message}`);
      }
    }, debounceMs);
  });

  return watcher;
}

function formatWatchStatus(envPath, snapshotName) {
  return [
    `Watching: ${path.resolve(envPath)}`,
    `Auto-save target: "${snapshotName}"`,
    `Press Ctrl+C to stop.`,
  ].join('\n');
}

module.exports = { watchEnvFile, formatWatchStatus };
