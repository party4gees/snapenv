const { getAuditLog, clearAuditLog, formatAuditLog } = require('../audit');

function printAuditUsage() {
  console.log(`
Usage: snapenv audit [options]

Options:
  --snapshot <name>   Filter by snapshot name
  --action <action>   Filter by action (save, restore, delete, etc.)
  --limit <n>         Show only the last N entries
  --clear             Clear the audit log
  --help              Show this help message

Examples:
  snapenv audit
  snapenv audit --snapshot dev
  snapenv audit --action restore --limit 10
  snapenv audit --clear
`.trim());
}

function runAudit(args, projectDir = process.cwd()) {
  if (args.includes('--help')) {
    printAuditUsage();
    return;
  }

  if (args.includes('--clear')) {
    clearAuditLog(projectDir);
    console.log('Audit log cleared.');
    return;
  }

  const snapshotIdx = args.indexOf('--snapshot');
  const snapshotName = snapshotIdx !== -1 ? args[snapshotIdx + 1] : undefined;

  const actionIdx = args.indexOf('--action');
  const action = actionIdx !== -1 ? args[actionIdx + 1] : undefined;

  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : undefined;

  if (snapshotIdx !== -1 && !snapshotName) {
    console.error('Error: --snapshot requires a name.');
    process.exitCode = 1;
    return;
  }

  if (actionIdx !== -1 && !action) {
    console.error('Error: --action requires a value.');
    process.exitCode = 1;
    return;
  }

  if (limitIdx !== -1 && (isNaN(limit) || limit <= 0)) {
    console.error('Error: --limit must be a positive integer.');
    process.exitCode = 1;
    return;
  }

  const entries = getAuditLog(projectDir, { snapshotName, action, limit });
  console.log(formatAuditLog(entries));
}

module.exports = { printAuditUsage, runAudit };
