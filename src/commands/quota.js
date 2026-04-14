const { getQuotaPath, loadQuota, saveQuota, setQuota, checkQuota, formatQuotaStatus } = require('../quota');

function printQuotaUsage() {
  console.log(`
Usage: snapenv quota <subcommand> [options]

Subcommands:
  set <bytes>     Set maximum storage quota in bytes
  status          Show current usage vs quota
  clear           Remove quota limit

Examples:
  snapenv quota set 10485760    # 10MB limit
  snapenv quota status
  snapenv quota clear
`);
}

async function runQuota(args, options = {}) {
  const subcommand = args[0];

  if (!subcommand || options.help) {
    printQuotaUsage();
    return { success: true };
  }

  if (subcommand === 'set') {
    const bytes = parseInt(args[1], 10);
    if (isNaN(bytes) || bytes <= 0) {
      console.error('Error: quota set requires a positive integer (bytes)');
      return { success: false, error: 'invalid bytes value' };
    }
    await setQuota(bytes);
    console.log(`Quota set to ${bytes} bytes (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
    return { success: true, bytes };
  }

  if (subcommand === 'status') {
    const result = await checkQuota();
    console.log(formatQuotaStatus(result));
    return { success: true, result };
  }

  if (subcommand === 'clear') {
    const quota = await loadQuota();
    quota.limit = null;
    await saveQuota(quota);
    console.log('Quota limit cleared.');
    return { success: true };
  }

  console.error(`Unknown subcommand: ${subcommand}`);
  printQuotaUsage();
  return { success: false, error: `unknown subcommand: ${subcommand}` };
}

module.exports = { printQuotaUsage, runQuota };
