const fs = require('fs');
const { pinSnapshot, unpinSnapshot, isPinned, listPinnedSnapshots, formatPinList, loadPinsFile } = require('./pin');

jest.mock('fs');
jest.mock('./snapshot', () => ({
  ensureSnapenvDir: jest.fn(),
  getSnapshotPath: jest.fn(name => `.snapenv/${name}.json`),
}));

beforeEach(() => {
  jest.clearAllMocks();
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockReturnValue('{}');
  fs.writeFileSync.mockImplementation(() => {});
});

test('pinSnapshot pins a snapshot', () => {
  const result = pinSnapshot('mysnap');
  expect(result).toHaveProperty('pinnedAt');
  expect(fs.writeFileSync).toHaveBeenCalled();
});

test('pinSnapshot throws if snapshot does not exist', () => {
  fs.existsSync.mockImplementation(p => !p.includes('mysnap'));
  expect(() => pinSnapshot('mysnap')).toThrow('does not exist');
});

test('pinSnapshot throws if already pinned', () => {
  fs.readFileSync.mockReturnValue(JSON.stringify({ mysnap: { pinnedAt: '2024-01-01' } }));
  expect(() => pinSnapshot('mysnap')).toThrow('already pinned');
});

test('unpinSnapshot removes a pin', () => {
  fs.readFileSync.mockReturnValue(JSON.stringify({ mysnap: { pinnedAt: '2024-01-01' } }));
  unpinSnapshot('mysnap');
  const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
  expect(written).not.toHaveProperty('mysnap');
});

test('unpinSnapshot throws if not pinned', () => {
  expect(() => unpinSnapshot('ghost')).toThrow('not pinned');
});

test('isPinned returns true for pinned snapshot', () => {
  fs.readFileSync.mockReturnValue(JSON.stringify({ mysnap: { pinnedAt: '2024-01-01' } }));
  expect(isPinned('mysnap')).toBe(true);
});

test('isPinned returns false for unpinned snapshot', () => {
  expect(isPinned('other')).toBe(false);
});

test('listPinnedSnapshots returns array of pinned entries', () => {
  fs.readFileSync.mockReturnValue(JSON.stringify({ a: { pinnedAt: '2024-01-01' }, b: { pinnedAt: '2024-02-01' } }));
  const list = listPinnedSnapshots();
  expect(list).toHaveLength(2);
  expect(list[0]).toHaveProperty('name', 'a');
});

test('formatPinList returns message when empty', () => {
  expect(formatPinList([])).toBe('No pinned snapshots.');
});

test('formatPinList formats pinned list', () => {
  const result = formatPinList([{ name: 'snap1', pinnedAt: '2024-01-01T00:00:00.000Z' }]);
  expect(result).toContain('snap1');
  expect(result).toContain('📌');
});
