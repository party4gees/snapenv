const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadHistory, saveHistory, recordAction, getHistory, clearHistory, formatHistory, getHistoryPath } = require('./history');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-history-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadHistory returns empty array when no file exists', () => {
  const result = loadHistory(tmpDir);
  expect(result).toEqual([]);
});

test('saveHistory and loadHistory round-trip', () => {
  const entries = [{ action: 'save', snapshotName: 'test', timestamp: '2024-01-01T00:00:00.000Z' }];
  saveHistory(entries, tmpDir);
  const loaded = loadHistory(tmpDir);
  expect(loaded).toEqual(entries);
});

test('recordAction writes an entry to history file', () => {
  const histPath = getHistoryPath(tmpDir);
  jest.spyOn(require('./history'), 'loadHistory').mockReturnValueOnce([]);
  jest.spyOn(require('./history'), 'saveHistory').mockImplementationOnce(() => {});

  const entry = { action: 'restore', snapshotName: 'mysnap', timestamp: expect.any(String) };
  const result = recordAction('restore', 'mysnap', {});
  expect(result.action).toBe('restore');
  expect(result.snapshotName).toBe('mysnap');
  expect(result.timestamp).toBeDefined();
});

test('getHistory returns limited entries', () => {
  const entries = Array.from({ length: 30 }, (_, i) => ({
    action: 'save',
    snapshotName: `snap-${i}`,
    timestamp: new Date().toISOString(),
  }));
  saveHistory(entries, tmpDir);
  jest.spyOn(require('./history'), 'loadHistory').mockReturnValueOnce(entries);
  const result = getHistory(5);
  expect(result.length).toBe(5);
});

test('clearHistory empties the history', () => {
  const entries = [{ action: 'save', snapshotName: 'test', timestamp: '2024-01-01T00:00:00.000Z' }];
  saveHistory(entries, tmpDir);
  jest.spyOn(require('./history'), 'saveHistory').mockImplementationOnce(() => {});
  clearHistory();
});

test('formatHistory returns message when empty', () => {
  expect(formatHistory([])).toBe('No history found.');
});

test('formatHistory formats entries correctly', () => {
  const entries = [
    { action: 'save', snapshotName: 'prod', timestamp: '2024-06-01T12:00:00.000Z' },
    { action: 'restore', snapshotName: 'dev', timestamp: '2024-06-02T08:30:00.000Z', envFile: '.env' },
  ];
  const result = formatHistory(entries);
  expect(result).toContain('SAVE prod');
  expect(result).toContain('RESTORE dev');
  expect(result).toContain('(.env)');
});
