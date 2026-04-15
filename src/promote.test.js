const path = require('path');
const os = require('os');
const fs = require('fs');
const { promoteSnapshot, buildPromoteSummary, formatPromoteResult } = require('./promote');
const { saveSnapshot, loadSnapshot } = require('./snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-promote-'));
}

test('promotes a snapshot to a new name', () => {
  const dir = makeTmpDir();
  saveSnapshot('dev', { API_URL: 'http://dev.example.com', PORT: '3000' }, dir);
  const result = promoteSnapshot('dev', 'staging', dir);
  expect(result.srcName).toBe('dev');
  expect(result.destName).toBe('staging');
  expect(result.overwrote).toBe(false);
  const loaded = loadSnapshot('staging', dir);
  expect(loaded.API_URL).toBe('http://dev.example.com');
});

test('overwrote flag is true when dest already exists', () => {
  const dir = makeTmpDir();
  saveSnapshot('dev', { KEY: 'val1' }, dir);
  saveSnapshot('staging', { KEY: 'old' }, dir);
  const result = promoteSnapshot('dev', 'staging', dir);
  expect(result.overwrote).toBe(true);
});

test('throws when source snapshot does not exist', () => {
  const dir = makeTmpDir();
  expect(() => promoteSnapshot('ghost', 'prod', dir)).toThrow("Snapshot 'ghost' not found");
});

test('buildPromoteSummary returns correct shape', () => {
  const result = { srcName: 'dev', destName: 'prod', vars: { A: '1', B: '2' }, overwrote: false };
  const summary = buildPromoteSummary(result);
  expect(summary.keyCount).toBe(2);
  expect(summary.overwrote).toBe(false);
});

test('formatPromoteResult includes overwrite warning', () => {
  const summary = { srcName: 'dev', destName: 'prod', keyCount: 3, overwrote: true };
  const output = formatPromoteResult(summary);
  expect(output).toContain("'dev' → 'prod'");
  expect(output).toContain('overwritten');
});

test('formatPromoteResult no warning when not overwriting', () => {
  const summary = { srcName: 'dev', destName: 'prod', keyCount: 1, overwrote: false };
  const output = formatPromoteResult(summary);
  expect(output).not.toContain('overwritten');
});
