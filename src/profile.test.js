const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getProfilesPath,
  loadProfiles,
  createProfile,
  deleteProfile,
  getProfile,
  listProfiles,
  formatProfileList,
} = require('./profile');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-profile-test-'));
}

test('getProfilesPath returns correct path', () => {
  const dir = makeTmpDir();
  expect(getProfilesPath(dir)).toBe(path.join(dir, 'profiles.json'));
});

test('loadProfiles returns empty object when file missing', () => {
  const dir = makeTmpDir();
  expect(loadProfiles(dir)).toEqual({});
});

test('createProfile creates a new profile', () => {
  const dir = makeTmpDir();
  const result = createProfile('dev', ['snap1', 'snap2'], dir);
  expect(result.snapshots).toEqual(['snap1', 'snap2']);
  expect(result.createdAt).toBeDefined();
});

test('createProfile throws if profile already exists', () => {
  const dir = makeTmpDir();
  createProfile('dev', ['snap1'], dir);
  expect(() => createProfile('dev', ['snap2'], dir)).toThrow("Profile 'dev' already exists");
});

test('createProfile throws if no name given', () => {
  const dir = makeTmpDir();
  expect(() => createProfile('', ['snap1'], dir)).toThrow('Profile name is required');
});

test('createProfile throws if no snapshots given', () => {
  const dir = makeTmpDir();
  expect(() => createProfile('dev', [], dir)).toThrow('At least one snapshot name is required');
});

test('getProfile returns correct profile', () => {
  const dir = makeTmpDir();
  createProfile('staging', ['s1'], dir);
  const p = getProfile('staging', dir);
  expect(p.snapshots).toEqual(['s1']);
});

test('getProfile returns null for missing profile', () => {
  const dir = makeTmpDir();
  expect(getProfile('nope', dir)).toBeNull();
});

test('deleteProfile removes profile', () => {
  const dir = makeTmpDir();
  createProfile('prod', ['p1'], dir);
  deleteProfile('prod', dir);
  expect(getProfile('prod', dir)).toBeNull();
});

test('deleteProfile throws if profile not found', () => {
  const dir = makeTmpDir();
  expect(() => deleteProfile('ghost', dir)).toThrow("Profile 'ghost' not found");
});

test('formatProfileList returns no-profiles message when empty', () => {
  expect(formatProfileList({})).toBe('No profiles defined.');
});

test('formatProfileList lists profiles', () => {
  const dir = makeTmpDir();
  createProfile('dev', ['a', 'b'], dir);
  const profiles = listProfiles(dir);
  const output = formatProfileList(profiles);
  expect(output).toContain('dev');
  expect(output).toContain('a, b');
});
