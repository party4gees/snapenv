const { cleanupSnapshots, formatCleanupResult } = require('../cleanup');
const { ensureSnapenvDir } = require('../snapshot');
const { loadConfig } = require('../init');
const path = require('path');

function printCleanupUsage() {
  console.log(`
snapenv cleanup — remove snapshots in bulk

Usage:
  snapenv cleanup [options]

Options:
  --dry-run          Preview what would be removed without deleting
  --only-untagged    Only remove snapshots with no tags
  --include-pinned   Also remove pinned snapshots (default: skip pinned)
  --help             Show this help message
`);
}

function runCleanup(args, cwd = process.cwd()) {
  if (args.includes('--help')) {
    printCleanupUsage();
    return;
  }

  const dryRun = args.includes('--dry-run');
  const onlyUntagged = args.includes('--only-untagged');
  const skipPinned = !args.includes('--include-pinned');

  const config = loadConfig(cwd);
  const snapenvDir = config.snapenvDir || path.join(cwd, '.snapenv');
  ensureSnapenvDir(snapenvDir);

  const result = cleanupSnapshots(snapenvDir, { dryRun, onlyUntagged, skipPinned });
  console.log(formatCleanupResult(result));
}

module.exports = { printCleanupUsage, runCleanup };
