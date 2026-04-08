const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock the home directory to avoid polluting real ~/.snapenv
const MOCK_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-test-'));
jest.mock('os', () => ({ homedir: () => MOCK_HOME }));

const { saveSnapshot, loadSnapshot, listSnapshots, deleteSnapshot } = require('./snapshot');

const TEST_ENV = { NODE_ENV: 'test', API_KEY: 'abc123', PORT: '3000' };

afterAll(() => {
  fs.rmSync(MOCK_HOME, { recursive: true, force: true });
});

describe('saveSnapshot', () => {
  it('saves a snapshot file and returns its path', () => {
    const snapshotPath = saveSnapshot('myproject', TEST_ENV);
    expect(fs.existsSync(snapshotPath)).toBe(true);
  });

  it('stores the correct env vars', () => {
    saveSnapshot('envcheck', TEST_ENV);
    const snap = loadSnapshot('envcheck');
    expect(snap.env).toEqual(TEST_ENV);
  });
});

describe('loadSnapshot', () => {
  it('loads a previously saved snapshot', () => {
    saveSnapshot('loadtest', TEST_ENV);
    const snap = loadSnapshot('loadtest');
    expect(snap.name).toBe('loadtest');
    expect(snap.env.API_KEY).toBe('abc123');
  });

  it('throws if snapshot does not exist', () => {
    expect(() => loadSnapshot('nonexistent')).toThrow('Snapshot "nonexistent" not found.');
  });
});

describe('listSnapshots', () => {
  it('returns a list of saved snapshots', () => {
    saveSnapshot('proj-a', TEST_ENV);
    saveSnapshot('proj-b', TEST_ENV);
    const list = listSnapshots();
    const names = list.map((s) => s.name);
    expect(names).toContain('proj-a');
    expect(names).toContain('proj-b');
  });

  it('each entry has name and createdAt', () => {
    const list = listSnapshots();
    list.forEach((s) => {
      expect(s).toHaveProperty('name');
      expect(s).toHaveProperty('createdAt');
    });
  });
});

describe('deleteSnapshot', () => {
  it('removes the snapshot file', () => {
    saveSnapshot('todelete', TEST_ENV);
    deleteSnapshot('todelete');
    expect(() => loadSnapshot('todelete')).toThrow();
  });

  it('throws if snapshot does not exist', () => {
    expect(() => deleteSnapshot('ghost')).toThrow('Snapshot "ghost" not found.');
  });
});
