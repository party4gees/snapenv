const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getGroupsPath,
  loadGroups,
  createGroup,
  deleteGroup,
  addSnapshotToGroup,
  removeSnapshotFromGroup,
  getGroup,
  listGroups,
  formatGroupList
} = require('./group');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-group-'));
}

test('loadGroups returns empty object when file missing', () => {
  const dir = makeTmpDir();
  expect(loadGroups(dir)).toEqual({});
});

test('createGroup creates a new group', () => {
  const dir = makeTmpDir();
  const g = createGroup('prod', ['snap1', 'snap2'], dir);
  expect(g.snapshots).toEqual(['snap1', 'snap2']);
  expect(g.createdAt).toBeDefined();
});

test('createGroup throws if group already exists', () => {
  const dir = makeTmpDir();
  createGroup('prod', [], dir);
  expect(() => createGroup('prod', [], dir)).toThrow('already exists');
});

test('deleteGroup removes a group', () => {
  const dir = makeTmpDir();
  createGroup('staging', [], dir);
  deleteGroup('staging', dir);
  expect(getGroup('staging', dir)).toBeNull();
});

test('deleteGroup throws if group not found', () => {
  const dir = makeTmpDir();
  expect(() => deleteGroup('nope', dir)).toThrow('not found');
});

test('addSnapshotToGroup adds snapshot', () => {
  const dir = makeTmpDir();
  createGroup('dev', [], dir);
  const g = addSnapshotToGroup('dev', 'snap-a', dir);
  expect(g.snapshots).toContain('snap-a');
});

test('addSnapshotToGroup does not duplicate', () => {
  const dir = makeTmpDir();
  createGroup('dev', ['snap-a'], dir);
  addSnapshotToGroup('dev', 'snap-a', dir);
  const g = getGroup('dev', dir);
  expect(g.snapshots.filter(s => s === 'snap-a').length).toBe(1);
});

test('removeSnapshotFromGroup removes snapshot', () => {
  const dir = makeTmpDir();
  createGroup('dev', ['snap-a', 'snap-b'], dir);
  removeSnapshotFromGroup('dev', 'snap-a', dir);
  const g = getGroup('dev', dir);
  expect(g.snapshots).not.toContain('snap-a');
  expect(g.snapshots).toContain('snap-b');
});

test('formatGroupList returns message when empty', () => {
  expect(formatGroupList({})).toBe('No groups defined.');
});

test('formatGroupList formats groups correctly', () => {
  const groups = {
    prod: { snapshots: ['a', 'b'], createdAt: '' },
    dev: { snapshots: [], createdAt: '' }
  };
  const result = formatGroupList(groups);
  expect(result).toContain('prod (2 snapshots)');
  expect(result).toContain('dev (0 snapshots)');
});
