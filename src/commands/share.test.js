const fs = require('fs');
const os = require('os');
const path = require('path');
const { runShare } = require('./share');
const { saveSnapshot } = require('../snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-cmd-share-'));
}

beforeEach(() => { process.exitCode = 0; });

test('runShare with no args prints usage', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  runShare([], makeTmpDir());
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

test('runShare create produces a token', () => {
  const dir = makeTmpDir();
  saveSnapshot(dir, 'testsnap', { FOO: 'bar' });
  const logs = [];
  const spy = jest.spyOn(console, 'log').mockImplementation(m => logs.push(m));
  runShare(['create', 'testsnap'], dir);
  spy.mockRestore();
  expect(logs.some(l => l.includes('testsnap'))).toBe(true);
  expect(process.exitCode).toBe(0);
});

test('runShare create with --ttl and --note', () => {
  const dir = makeTmpDir();
  saveSnapshot(dir, 'snap2', { X: '1' });
  const logs = [];
  const spy = jest.spyOn(console, 'log').mockImplementation(m => logs.push(m));
  runShare(['create', 'snap2', '--ttl', '12', '--note', 'testing'], dir);
  spy.mockRestore();
  expect(logs.some(l => l.includes('testing'))).toBe(true);
});

test('runShare create without snapshot name sets exitCode', () => {
  const dir = makeTmpDir();
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  runShare(['create'], dir);
  spy.mockRestore();
  expect(process.exitCode).toBe(1);
});

test('runShare resolve shows bundle info', () => {
  const dir = makeTmpDir();
  saveSnapshot(dir, 'snap3', { A: 'b' });
  let token;
  const createLogs = [];
  const spy1 = jest.spyOn(console, 'log').mockImplementation(m => createLogs.push(m));
  runShare(['create', 'snap3'], dir);
  spy1.mockRestore();
  const tokenLine = createLogs.find(l => l.startsWith('Token:'));
  token = tokenLine.split('Token:')[1].trim();

  const resolveLogs = [];
  const spy2 = jest.spyOn(console, 'log').mockImplementation(m => resolveLogs.push(m));
  runShare(['resolve', token], dir);
  spy2.mockRestore();
  expect(resolveLogs.some(l => l.includes('snap3'))).toBe(true);
});

test('runShare revoke removes share', () => {
  const dir = makeTmpDir();
  saveSnapshot(dir, 'snap4', { Z: '9' });
  const createLogs = [];
  const spy1 = jest.spyOn(console, 'log').mockImplementation(m => createLogs.push(m));
  runShare(['create', 'snap4'], dir);
  spy1.mockRestore();
  const tokenLine = createLogs.find(l => l.startsWith('Token:'));
  const token = tokenLine.split('Token:')[1].trim();

  const revokeLogs = [];
  const spy2 = jest.spyOn(console, 'log').mockImplementation(m => revokeLogs.push(m));
  runShare(['revoke', token], dir);
  spy2.mockRestore();
  expect(revokeLogs[0]).toContain('Revoked');
});

test('runShare list shows entries', () => {
  const dir = makeTmpDir();
  saveSnapshot(dir, 'snap5', { M: 'n' });
  jest.spyOn(console, 'log').mockImplementation(() => {});
  runShare(['create', 'snap5'], dir);
  jest.restoreAllMocks();

  const listLogs = [];
  const spy = jest.spyOn(console, 'log').mockImplementation(m => listLogs.push(m));
  runShare(['list'], dir);
  spy.mockRestore();
  expect(listLogs.some(l => l.includes('snap5'))).toBe(true);
});

test('runShare unknown subcommand sets exitCode', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  runShare(['badcmd'], makeTmpDir());
  spy.mockRestore();
  expect(process.exitCode).toBe(1);
});
