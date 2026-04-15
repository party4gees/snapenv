const { createToken, revokeToken, resolveToken, listTokens, formatTokenList } = require('../token');

function printTokenUsage() {
  console.log(`
snapenv token <subcommand> [options]

Subcommands:
  create <label> <snapshot> [--expires <days>]  Create a new access token
  revoke <token-id>                              Revoke a token by ID
  resolve <token-id>                             Resolve a token to its snapshot
  list                                           List all tokens

Examples:
  snapenv token create ci-deploy prod --expires 30
  snapenv token revoke abc123
  snapenv token resolve abc123
  snapenv token list
`);
}

function runToken(args) {
  const sub = args[0];

  if (!sub || sub === '--help' || sub === '-h') {
    printTokenUsage();
    return;
  }

  if (sub === 'create') {
    const label = args[1];
    const snapshot = args[2];
    if (!label || !snapshot) {
      console.error('Usage: snapenv token create <label> <snapshot> [--expires <days>]');
      process.exit(1);
    }
    const expiresIdx = args.indexOf('--expires');
    const expiresInDays = expiresIdx !== -1 ? parseInt(args[expiresIdx + 1], 10) : null;
    const token = createToken(label, snapshot, expiresInDays);
    console.log(`Token created: ${token.id}`);
    console.log(`  Label:    ${token.label}`);
    console.log(`  Snapshot: ${token.snapshotName}`);
    console.log(`  Expires:  ${token.expiresAt ? new Date(token.expiresAt).toISOString() : 'never'}`);
    return;
  }

  if (sub === 'revoke') {
    const id = args[1];
    if (!id) { console.error('Token ID required.'); process.exit(1); }
    const ok = revokeToken(id);
    console.log(ok ? `Token ${id} revoked.` : `Token not found: ${id}`);
    return;
  }

  if (sub === 'resolve') {
    const id = args[1];
    if (!id) { console.error('Token ID required.'); process.exit(1); }
    const token = resolveToken(id);
    if (!token) { console.error('Token not found or expired.'); process.exit(1); }
    console.log(`Snapshot: ${token.snapshotName}`);
    return;
  }

  if (sub === 'list') {
    const tokens = listTokens();
    console.log(formatTokenList(tokens));
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  process.exit(1);
}

module.exports = { printTokenUsage, runToken };
