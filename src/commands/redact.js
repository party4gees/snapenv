import { loadSnapshot, saveSnapshot } from '../snapshot.js';
import { redactEnvVars, formatRedactSummary } from '../redact.js';

export function printRedactUsage() {
  console.log(`
Usage: snapenv redact <snapshot> [options]

Redact sensitive values in a snapshot in-place or preview them.

Options:
  --dry-run       Show what would be redacted without modifying the snapshot
  --placeholder   Custom placeholder string (default: [REDACTED])
  --help          Show this help message

Examples:
  snapenv redact mysnap
  snapenv redact mysnap --dry-run
  snapenv redact mysnap --placeholder=***
`);
}

export async function runRedact(args) {
  const [name, ...flags] = args;

  if (!name || flags.includes('--help')) {
    printRedactUsage();
    return;
  }

  const dryRun = flags.includes('--dry-run');
  const placeholderFlag = flags.find(f => f.startsWith('--placeholder='));
  const placeholder = placeholderFlag ? placeholderFlag.split('=')[1] : '[REDACTED]';

  let snapshot;
  try {
    snapshot = await loadSnapshot(name);
  } catch {
    console.error(`Snapshot "${name}" not found.`);
    process.exit(1);
  }

  const original = snapshot.vars || {};
  const redacted = redactEnvVars(original, placeholder);
  const summary = formatRedactSummary(original, redacted);

  if (dryRun) {
    console.log('[dry-run] No changes written.');
    console.log(summary);
    return;
  }

  await saveSnapshot(name, { ...snapshot, vars: redacted });
  console.log(`Snapshot "${name}" updated.`);
  console.log(summary);
}
