const path = require('path');
const { ensureSnapenvDir } = require('../snapshot');
const {
  createShareBundle,
  resolveShareBundle,
  revokeShareBundle,
  listShares,
  formatShareSummary
} = require('../share');

function printShareUsage() {
  console.log(`
snapenv share <subcommand> [options]

Subcommands:
  create <snapshot> [--ttl <hours>] [--note <text>]   Create a share bundle
  resolve <token>                                      Show bundle info
  revoke <token>                                       Revoke a share bundle
  list                                                 List all shares

Examples:
  snapenv share create mysnap --ttl 24 --note "for teammate"
  snapenv share resolve abc123def456
  snapenv share revoke abc123def456
  snapenv share list
`.trim());
}

function runShare(argv, snapenvDir) {
  const dir = snapenvDir || ensureSnapenvDir();
  const sub = argv[0];

  if (!sub || sub === '--help' || sub === '-h') {
    printShareUsage();
    return;
  }

  if (sub === 'create') {
    const snapshotName = argv[1];
    if (!snapshotName) {
      console.error('Error: snapshot name required');
      process.exitCode = 1;
      return;
    }
    const ttlIdx = argv.indexOf('--ttl');
    const noteIdx = argv.indexOf('--note');
    const options = {};
    if (ttlIdx !== -1) options.ttlHours = parseFloat(argv[ttlIdx + 1]);
    if (noteIdx !== -1) options.note = argv[noteIdx + 1];

    try {
      const { token, bundle } = createShareBundle(dir, snapshotName, options);
      console.log('Share bundle created.');
      console.log(formatShareSummary(token, bundle));
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
    return;
  }

  if (sub === 'resolve') {
    const token = argv[1];
    if (!token) { console.error('Error: token required'); process.exitCode = 1; return; }
    const result = resolveShareBundle(dir, token);
    if (!result) { console.error('Share bundle not found.'); process.exitCode = 1; return; }
    if (result.expired) { console.warn('Warning: this share bundle has expired.'); }
    console.log(formatShareSummary(token, result.bundle));
    return;
  }

  if (sub === 'revoke') {
    const token = argv[1];
    if (!token) { console.error('Error: token required'); process.exitCode = 1; return; }
    const removed = revokeShareBundle(dir, token);
    console.log(removed ? `Revoked share bundle ${token}.` : 'Share bundle not found.');
    return;
  }

  if (sub === 'list') {
    const index = listShares(dir);
    const entries = Object.entries(index);
    if (entries.length === 0) { console.log('No share bundles found.'); return; }
    entries.forEach(([token, meta]) => {
      const exp = meta.expiresAt ? `expires ${meta.expiresAt}` : 'no expiry';
      console.log(`${token}  ${meta.snapshotName}  (${exp})${meta.note ? '  ' + meta.note : ''}`);
    });
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  process.exitCode = 1;
}

module.exports = { printShareUsage, runShare };
