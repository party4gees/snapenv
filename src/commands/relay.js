const path = require('path');
const { ensureSnapenvDir } = require('../snapshot');
const {
  setRelay,
  removeRelay,
  getRelay,
  listRelays,
  resolveRelaySnapshot,
  formatRelayList,
} = require('../relay');
const { writeEnvFile } = require('../env');

function printRelayUsage() {
  console.log(`
Usage: snapenv relay <subcommand> [options]

Subcommands:
  set <name> <targetProject>   Link a snapshot name to another project's snapshot
  remove <name>                Remove a relay link
  get <name>                   Show relay info
  list                         List all relays
  apply <name> [envFile]       Fetch and apply relay snapshot to local env file

Examples:
  snapenv relay set staging /projects/myapp
  snapenv relay apply staging .env
  snapenv relay list
  snapenv relay remove staging
`);
}

function runRelay(args, options = {}) {
  const snapenvDir = ensureSnapenvDir(options.cwd || process.cwd());
  const [sub, name, extra] = args;

  if (!sub || sub === '--help' || sub === '-h') {
    printRelayUsage();
    return;
  }

  if (sub === 'set') {
    if (!name || !extra) {
      console.error('Usage: snapenv relay set <name> <targetProject>');
      process.exitCode = 1;
      return;
    }
    const relay = setRelay(snapenvDir, name, extra);
    console.log(`Relay '${name}' -> ${relay.targetProject}`);
    return;
  }

  if (sub === 'remove') {
    if (!name) { console.error('Provide relay name.'); process.exitCode = 1; return; }
    const ok = removeRelay(snapenvDir, name);
    console.log(ok ? `Removed relay '${name}'.` : `Relay '${name}' not found.`);
    return;
  }

  if (sub === 'get') {
    if (!name) { console.error('Provide relay name.'); process.exitCode = 1; return; }
    const relay = getRelay(snapenvDir, name);
    if (!relay) { console.error(`Relay '${name}' not found.`); process.exitCode = 1; return; }
    console.log(`${name} -> ${relay.targetProject} (created ${relay.createdAt.slice(0, 10)})`);
    return;
  }

  if (sub === 'list') {
    const relays = listRelays(snapenvDir);
    console.log(formatRelayList(relays));
    return;
  }

  if (sub === 'apply') {
    if (!name) { console.error('Provide relay name.'); process.exitCode = 1; return; }
    const envFile = extra || '.env';
    try {
      const vars = resolveRelaySnapshot(snapenvDir, name);
      writeEnvFile(envFile, vars);
      console.log(`Applied relay '${name}' to ${envFile} (${Object.keys(vars).length} vars).`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  process.exitCode = 1;
}

module.exports = { printRelayUsage, runRelay };
