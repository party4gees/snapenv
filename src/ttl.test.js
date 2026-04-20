const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getTtlPath,
  loadTtl,
  setTtl,
  removeTtl,
  getTtl,
  isExpired,
  getExpiredSnapshots,
  formatTtlStatus,
} = require('./ttl');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-ttl-'));
}

describe('ttl', () => {
  let dir;
  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => fs.rmSync(dir, { recursive: true }));

  test('loadTtl returns empty object when no file exists', () => {
    expect(loadTtl(dir)).toEqual({});
  });

  test('setTtl persists entry with expiresAt', () => {
    const before = Date.now();
    const entry = setTtl('snap1', 60000, dir);
    expect(entry.expiresAt).toBeGreaterThanOrEqual(before + 60000);
    expect(loadTtl(dir)['snap1']).toBeDefined();
  });

  test('getTtl returns entry for known snapshot', () => {
    setTtl('snap1', 5000, dir);
    const entry = getTtl('snap1', dir);
    expect(entry).not.toBeNull();
    expect(entry.expiresAt).toBeDefined();
  });

  test('getTtl returns null for unknown snapshot', () => {
    expect(getTtl('ghost', dir)).toBeNull();
  });

  test('removeTtl deletes entry and returns true', () => {
    setTtl('snap1', 5000, dir);
    expect(removeTtl('snap1', dir)).toBe(true);
    expect(getTtl('snap1', dir)).toBeNull();
  });

  test('removeTtl returns false for missing entry', () => {
    expect(removeTtl('nope', dir)).toBe(false);
  });

  test('isExpired returns false for future TTL', () => {
    setTtl('snap1', 60000, dir);
    expect(isExpired('snap1', dir)).toBe(false);
  });

  test('isExpired returns true for past TTL', () => {
    setTtl('snap1', -1000, dir);
    expect(isExpired('snap1', dir)).toBe(true);
  });

  test('isExpired returns false when no TTL set', () => {
    expect(isExpired('snap1', dir)).toBe(false);
  });

  test('getExpiredSnapshots returns only expired names', () => {
    setTtl('old', -1000, dir);
    setTtl('fresh', 60000, dir);
    const expired = getExpiredSnapshots(dir);
    expect(expired).toContain('old');
    expect(expired).not.toContain('fresh');
  });

  test('formatTtlStatus shows no TTL message when missing', () => {
    expect(formatTtlStatus('snap1', null)).toMatch(/no TTL set/);
  });

  test('formatTtlStatus shows expired when past', () => {
    const entry = { expiresAt: Date.now() - 1000 };
    expect(formatTtlStatus('snap1', entry)).toMatch(/expired/);
  });

  test('formatTtlStatus shows remaining time', () => {
    const entry = { expiresAt: Date.now() + 3600000 };
    expect(formatTtlStatus('snap1', entry)).toMatch(/expires in/);
  });
});
