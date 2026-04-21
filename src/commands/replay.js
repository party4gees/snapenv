const { replaySnapshot, formatReplayResult } = require('../replay');
const { ensureSnapenvDir } = require('../snapshot');
const path = require('path');

function printReplayUsage() {
  console.log(`
snapenv replay <source> <target>

Replay (re-apply) a snapshot by copying it under a new name.

Arguments:
  source   Name of the snapshot to replay
  target   Name for the new snapshot copy

Examples:
  snapenv replay prod prod-backup
  snapenv replay staging staging-20240601
`.trim());
}

async function runReplay(args, options = {}) {
  const [source, target] = args;

  if (!source || !target) {
    printReplayUsage();
    process.exit(1);
  }

  if (source === target) {
    console.error('Error: source and target names must differ');
    process.exit(1);
  }

  const snapenvDir = options.snapenvDir || path.join(process.cwd(), '.snapenv');

  try {
    await ensureSnapenvDir(snapenvDir);
    const result = await replaySnapshot(snapenvDir, source, target);
    console.log(formatReplayResult(result));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { printReplayUsage, runReplay };
