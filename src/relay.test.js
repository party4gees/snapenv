const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getRelayPath,
  loadRelayConfig,
  setRelay,
  removeRelay,
  getRelay,
  listRelays,
  formatRelayList,
} = require('./relay');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-relay-'));
}

describe('relay', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  test('getRelayPath returns correct path', () => {
    expect(getRelayPath(tmpDir)).toBe(path.join(tmpDir, 'relay.json'));
  });

  test('loadRelayConfig returns empty object when file missing', () => {
    expect(loadRelayConfig(tmpDir)).toEqual({});
  });

  test('setRelay creates a relay entry', () => {
    const result = setRelay(tmpDir, 'staging', '/projects/other');
    expect(result.targetProject).toBe('/projects/other');
    expect(result.createdAt).toBeDefined();
  });

  test('getRelay retrieves existing relay', () => {
    setRelay(tmpDir, 'prod', '/projects/prod');
    const relay = getRelay(tmpDir, 'prod');
    expect(relay).not.toBeNull();
    expect(relay.targetProject).toBe('/projects/prod');
  });

  test('getRelay returns null for missing relay', () => {
    expect(getRelay(tmpDir, 'nonexistent')).toBeNull();
  });

  test('removeRelay deletes an existing relay', () => {
    setRelay(tmpDir, 'dev', '/projects/dev');
    const removed = removeRelay(tmpDir, 'dev');
    expect(removed).toBe(true);
    expect(getRelay(tmpDir, 'dev')).toBeNull();
  });

  test('removeRelay returns false for missing relay', () => {
    expect(removeRelay(tmpDir, 'ghost')).toBe(false);
  });

  test('listRelays returns all relays', () => {
    setRelay(tmpDir, 'a', '/pa');
    setRelay(tmpDir, 'b', '/pb');
    const relays = listRelays(tmpDir);
    expect(Object.keys(relays)).toHaveLength(2);
  });

  test('formatRelayList shows message when empty', () => {
    expect(formatRelayList({})).toBe('No relays configured.');
  });

  test('formatRelayList formats entries', () => {
    setRelay(tmpDir, 'staging', '/projects/staging');
    const relays = listRelays(tmpDir);
    const output = formatRelayList(relays);
    expect(output).toContain('staging');
    expect(output).toContain('/projects/staging');
  });
});
