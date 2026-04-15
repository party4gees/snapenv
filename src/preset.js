const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath } = require('./snapshot');

function getPresetsPath(dir) {
  return path.join(dir || ensureSnapenvDir(), 'presets.json');
}

function loadPresets(dir) {
  const p = getPresetsPath(dir);
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function savePresets(presets, dir) {
  const p = getPresetsPath(dir);
  fs.writeFileSync(p, JSON.stringify(presets, null, 2));
}

function savePreset(name, snapshotNames, dir) {
  if (!name || typeof name !== 'string') throw new Error('Preset name is required');
  if (!Array.isArray(snapshotNames) || snapshotNames.length === 0) {
    throw new Error('At least one snapshot name is required');
  }
  const presets = loadPresets(dir);
  presets[name] = { snapshots: snapshotNames, createdAt: new Date().toISOString() };
  savePresets(presets, dir);
  return presets[name];
}

function getPreset(name, dir) {
  const presets = loadPresets(dir);
  return presets[name] || null;
}

function deletePreset(name, dir) {
  const presets = loadPresets(dir);
  if (!presets[name]) return false;
  delete presets[name];
  savePresets(presets, dir);
  return true;
}

function listPresets(dir) {
  return loadPresets(dir);
}

function formatPresetList(presets) {
  const names = Object.keys(presets);
  if (names.length === 0) return 'No presets defined.';
  return names.map(n => {
    const p = presets[n];
    return `  ${n}: [${p.snapshots.join(', ')}] (created ${p.createdAt.slice(0, 10)})`;
  }).join('\n');
}

module.exports = {
  getPresetsPath,
  loadPresets,
  savePresets,
  savePreset,
  getPreset,
  deletePreset,
  listPresets,
  formatPresetList,
};
