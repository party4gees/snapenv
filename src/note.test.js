const fs = require('fs');
const os = require('os');
const path = require('path');
const { setNote, getNote, removeNote, formatNote, loadNotes } = require('./note');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-note-test-'));
}

function makeSnapshot(baseDir, name) {
  const snapDir = path.join(baseDir, '.snapenv');
  fs.mkdirSync(snapDir, { recursive: true });
  fs.writeFileSync(path.join(snapDir, `${name}.json`), JSON.stringify({ FOO: 'bar' }));
}

test('setNote saves a note for a snapshot', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'my-snap');
  const note = setNote(dir, 'my-snap', 'This is a test note');
  expect(note.text).toBe('This is a test note');
  expect(note.updatedAt).toBeDefined();
});

test('getNote returns saved note', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'my-snap');
  setNote(dir, 'my-snap', 'hello world');
  const note = getNote(dir, 'my-snap');
  expect(note.text).toBe('hello world');
});

test('getNote returns null for missing note', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'my-snap');
  expect(getNote(dir, 'my-snap')).toBeNull();
});

test('setNote throws if snapshot does not exist', () => {
  const dir = makeTmpDir();
  fs.mkdirSync(path.join(dir, '.snapenv'), { recursive: true });
  expect(() => setNote(dir, 'ghost', 'nope')).toThrow('not found');
});

test('removeNote deletes a note and returns true', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'my-snap');
  setNote(dir, 'my-snap', 'to be removed');
  expect(removeNote(dir, 'my-snap')).toBe(true);
  expect(getNote(dir, 'my-snap')).toBeNull();
});

test('removeNote returns false if no note exists', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'my-snap');
  expect(removeNote(dir, 'my-snap')).toBe(false);
});

test('formatNote returns formatted string', () => {
  const note = { text: 'staging config', updatedAt: '2024-01-01T00:00:00.000Z' };
  const result = formatNote('staging', note);
  expect(result).toContain('staging');
  expect(result).toContain('staging config');
});

test('formatNote handles missing note', () => {
  expect(formatNote('missing-snap', null)).toContain('No note');
});
