const { savePreset, getPreset, deletePreset, listPresets, formatPresetList } = require('../preset');
const { loadSnapshot } = require('../snapshot');

function printPresetUsage() {
  console.log(`
Usage: snapenv preset <subcommand> [options]

Subcommands:
  save <name> <snap1> [snap2...]   Save a named preset of snapshots
  get <name>                       Show snapshots in a preset
  delete <name>                    Delete a preset
  list                             List all presets

Examples:
  snapenv preset save mypreset dev base
  snapenv preset get mypreset
  snapenv preset delete mypreset
  snapenv preset list
`);
}

function runPreset(args) {
  const [sub, ...rest] = args;

  if (!sub || sub === '--help' || sub === '-h') {
    printPresetUsage();
    return;
  }

  if (sub === 'save') {
    const [name, ...snapshots] = rest;
    if (!name || snapshots.length === 0) {
      console.error('Usage: snapenv preset save <name> <snap1> [snap2...]');
      process.exit(1);
    }
    // Validate snapshots exist
    for (const s of snapshots) {
      const data = loadSnapshot(s);
      if (!data) {
        console.error(`Snapshot not found: ${s}`);
        process.exit(1);
      }
    }
    const preset = savePreset(name, snapshots);
    console.log(`Preset "${name}" saved with snapshots: ${preset.snapshots.join(', ')}`);
    return;
  }

  if (sub === 'get') {
    const [name] = rest;
    if (!name) { console.error('Preset name required'); process.exit(1); }
    const preset = getPreset(name);
    if (!preset) { console.error(`Preset not found: ${name}`); process.exit(1); }
    console.log(`Preset "${name}": ${preset.snapshots.join(', ')}`);
    return;
  }

  if (sub === 'delete') {
    const [name] = rest;
    if (!name) { console.error('Preset name required'); process.exit(1); }
    const ok = deletePreset(name);
    if (!ok) { console.error(`Preset not found: ${name}`); process.exit(1); }
    console.log(`Preset "${name}" deleted.`);
    return;
  }

  if (sub === 'list') {
    const all = listPresets();
    console.log(formatPresetList(all));
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printPresetUsage();
  process.exit(1);
}

module.exports = { printPresetUsage, runPreset };
