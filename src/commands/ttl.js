const { setTtl, removeTtl, getTtl, getExpiredSnapshots, formatTtlStatus, loadTtl } = require('../ttl');
const { listSnapshots } = require('../snapshot');

function printTtlUsage() {
  console.log('Usage: snapenv ttl <subcommand> [options]');
  console.log('');
  console.log('Subcommands:');
  console.log('  set <name> <duration>   Set TTL for a snapshot (e.g. 1h, 30m, 3600s)');
  console.log('  remove <name>           Remove TTL from a snapshot');
  console.log('  status <name>           Show TTL status for a snapshot');
  console.log('  list                    List all snapshots with TTL set');
  console.log('  expired                 List all expired snapshots');
}

function parseDuration(str) {
  const match = str.match(/^(\d+)(h|m|s)$/);
  if (!match) throw new Error(`Invalid duration: ${str}. Use format like 1h, 30m, 3600s`);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 'h') return value * 3600000;
  if (unit === 'm') return value * 60000;
  return value * 1000;
}

function runTtl(args) {
  const [sub, name, durationStr] = args;

  if (!sub || sub === '--help' || sub === '-h') {
    printTtlUsage();
    return;
  }

  if (sub === 'set') {
    if (!name || !durationStr) {
      console.error('Usage: snapenv ttl set <name> <duration>');
      process.exit(1);
    }
    let ms;
    try {
      ms = parseDuration(durationStr);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
    const entry = setTtl(name, ms);
    console.log(`TTL set for "${name}": expires at ${new Date(entry.expiresAt).toISOString()}`);
    return;
  }

  if (sub === 'remove') {
    if (!name) { console.error('Usage: snapenv ttl remove <name>'); process.exit(1); }
    const removed = removeTtl(name);
    if (removed) console.log(`TTL removed from "${name}".`);
    else console.log(`No TTL found for "${name}".`);
    return;
  }

  if (sub === 'status') {
    if (!name) { console.error('Usage: snapenv ttl status <name>'); process.exit(1); }
    const entry = getTtl(name);
    console.log(formatTtlStatus(name, entry));
    return;
  }

  if (sub === 'list') {
    const ttl = loadTtl();
    const entries = Object.entries(ttl);
    if (entries.length === 0) { console.log('No snapshots have a TTL set.'); return; }
    entries.forEach(([n, entry]) => console.log(formatTtlStatus(n, entry)));
    return;
  }

  if (sub === 'expired') {
    const expired = getExpiredSnapshots();
    if (expired.length === 0) { console.log('No expired snapshots.'); return; }
    console.log('Expired snapshots:');
    expired.forEach(n => console.log(`  - ${n}`));
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printTtlUsage();
  process.exit(1);
}

module.exports = { printTtlUsage, runTtl, parseDuration };
