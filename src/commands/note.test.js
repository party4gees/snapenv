const fs = require('fs');
const os = require('os');
const path = require('path');
const { runNote } = require('./note');
const { setNote, getNote } = require('../note');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-cmd-note-'));
}

function makeSnapshot(baseDir, name) {
  const snapDir = path.join(baseDir, '.snapenv');
  fs.mkdirSync(snapDir, { recursive: true });
  fs.writeFileSync(path.join(snapDir, `${name}.json`), JSON.stringify({ KEY: 'val' }));
}

let logs, errors;
beforeEach(() => {
  logs = [];
  errors = [];
  jest.spyOn(console, 'log').mockImplementation(msg => logs.push(msg));
  jest.spyOn(console, 'error').mockImplementation(msg => errors.push(msg));
  jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});
afterEach(() => jest.restoreAllMocks());

test('set subcommand saves note and prints confirmation', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'prod');
  runNote(['set', 'prod', 'production', 'env'], dir);
  expect(logs[0]).toContain('Note saved');
  expect(getNote(dir, 'prod').text).toBe('production env');
});

test('get subcommand prints note', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'prod');
  setNote(dir, 'prod', 'my note text');
  runNote(['get', 'prod'], dir);
  expect(logs[0]).toContain('my note text');
});

test('get subcommand prints no-note message when absent', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'prod');
  runNote(['get', 'prod'], dir);
  expect(logs[0]).toContain('No note');
});

test('remove subcommand deletes existing note', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'prod');
  setNote(dir, 'prod', 'to delete');
  runNote(['remove', 'prod'], dir);
  expect(logs[0]).toContain('removed');
  expect(getNote(dir, 'prod')).toBeNull();
});

test('remove prints message when no note found', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'prod');
  runNote(['remove', 'prod'], dir);
  expect(logs[0]).toContain('No note found');
});

test('set exits with error when snapshot missing', () => {
  const dir = makeTmpDir();
  fs.mkdirSync(path.join(dir, '.snapenv'), { recursive: true });
  expect(() => runNote(['set', 'ghost', 'text'], dir)).toThrow('exit');
  expect(errors[0]).toContain('Error');
});

test('unknown subcommand exits with error', () => {
  const dir = makeTmpDir();
  expect(() => runNote(['zap', 'prod'], dir)).toThrow('exit');
  expect(errors[0]).toContain('Unknown subcommand');
});
