const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getAuditPath,
  loadAuditLog,
  recordAuditEntry,
  getAuditLog,
  clearAuditLog,
  formatAuditLog,
} = require('./audit');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-audit-'));
}

describe('audit', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('loadAuditLog returns empty array when no file exists', () => {
    expect(loadAuditLog(tmpDir)).toEqual([]);
  });

  test('recordAuditEntry adds an entry with expected fields', () => {
    const entry = recordAuditEntry(tmpDir, 'save', 'dev');
    expect(entry.action).toBe('save');
    expect(entry.snapshotName).toBe('dev');
    expect(entry.timestamp).toBeDefined();
    expect(entry.id).toBeDefined();
    expect(entry.user).toBeDefined();
  });

  test('multiple entries accumulate', () => {
    recordAuditEntry(tmpDir, 'save', 'dev');
    recordAuditEntry(tmpDir, 'restore', 'dev');
    recordAuditEntry(tmpDir, 'save', 'prod');
    expect(loadAuditLog(tmpDir)).toHaveLength(3);
  });

  test('getAuditLog filters by snapshotName', () => {
    recordAuditEntry(tmpDir, 'save', 'dev');
    recordAuditEntry(tmpDir, 'save', 'prod');
    const results = getAuditLog(tmpDir, { snapshotName: 'dev' });
    expect(results).toHaveLength(1);
    expect(results[0].snapshotName).toBe('dev');
  });

  test('getAuditLog filters by action', () => {
    recordAuditEntry(tmpDir, 'save', 'dev');
    recordAuditEntry(tmpDir, 'restore', 'dev');
    const results = getAuditLog(tmpDir, { action: 'restore' });
    expect(results).toHaveLength(1);
    expect(results[0].action).toBe('restore');
  });

  test('getAuditLog respects limit', () => {
    for (let i = 0; i < 5; i++) recordAuditEntry(tmpDir, 'save', `snap-${i}`);
    const results = getAuditLog(tmpDir, { limit: 2 });
    expect(results).toHaveLength(2);
  });

  test('clearAuditLog empties the log', () => {
    recordAuditEntry(tmpDir, 'save', 'dev');
    clearAuditLog(tmpDir);
    expect(loadAuditLog(tmpDir)).toEqual([]);
  });

  test('formatAuditLog returns message when empty', () => {
    expect(formatAuditLog([])).toBe('No audit entries found.');
  });

  test('formatAuditLog formats entries', () => {
    recordAuditEntry(tmpDir, 'save', 'dev', { details: 'initial save' });
    const entries = loadAuditLog(tmpDir);
    const output = formatAuditLog(entries);
    expect(output).toContain('SAVE');
    expect(output).toContain('dev');
    expect(output).toContain('initial save');
  });
});
