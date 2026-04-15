const fs = require('fs');
const os = require('os');
const path = require('path');
const { savePreset, getPreset, deletePreset, listPresets, formatPresetList, getPresetsPath } = require('./preset');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-preset-'));
}

test('savePreset stores preset with snapshots and createdAt', () => {
  const dir = makeTmpDir();
  const result = savePreset('mypreset', ['snap1', 'snap2'], dir);
  expect(result.snapshots).toEqual(['snap1', 'snap2']);
  expect(result.createdAt).toBeDefined();
});

test('getPreset returns saved preset', () => {
  const dir = makeTmpDir();
  savePreset('alpha', ['a', 'b'], dir);
  const p = getPreset('alpha', dir);
  expect(p).not.toBeNull();
  expect(p.snapshots).toEqual(['a', 'b']);
});

test('getPreset returns null for missing preset', () => {
  const dir = makeTmpDir();
  expect(getPreset('nope', dir)).toBeNull();
});

test('deletePreset removes preset and returns true', () => {
  const dir = makeTmpDir();
  savePreset('todelete', ['x'], dir);
  expect(deletePreset('todelete', dir)).toBe(true);
  expect(getPreset('todelete', dir)).toBeNull();
});

test('deletePreset returns false for missing preset', () => {
  const dir = makeTmpDir();
  expect(deletePreset('ghost', dir)).toBe(false);
});

test('listPresets returns all presets', () => {
  const dir = makeTmpDir();
  savePreset('p1', ['s1'], dir);
  savePreset('p2', ['s2', 's3'], dir);
  const all = listPresets(dir);
  expect(Object.keys(all)).toHaveLength(2);
});

test('savePreset throws on missing name', () => {
  const dir = makeTmpDir();
  expect(() => savePreset('', ['s1'], dir)).toThrow();
});

test('savePreset throws on empty snapshots', () => {
  const dir = makeTmpDir();
  expect(() => savePreset('p', [], dir)).toThrow();
});

test('formatPresetList returns no presets message when empty', () => {
  const dir = makeTmpDir();
  const out = formatPresetList(listPresets(dir));
  expect(out).toMatch(/No presets/);
});

test('formatPresetList lists preset names and snapshots', () => {
  const dir = makeTmpDir();
  savePreset('env-set', ['dev', 'base'], dir);
  const out = formatPresetList(listPresets(dir));
  expect(out).toMatch('env-set');
  expect(out).toMatch('dev');
});
