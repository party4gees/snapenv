const { runPromote, printPromoteUsage } = require('./promote');
const { saveSnapshot, getSnapenvDir } = require('../snapshot');
const { promoteSnapshot } = require('../promote');

jest.mock('../promote');
jest.mock('../snapshot');

beforeEach(() => {
  jest.clearAllMocks();
  getSnapenvDir.mockReturnValue('/fake/dir');
});

test('prints usage with --help', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  runPromote(['--help']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Usage: snapenv promote'));
  spy.mockRestore();
});

test('exits with error when args missing', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => runPromote([])).toThrow('exit');
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('required'));
  spy.mockRestore();
  exitSpy.mockRestore();
});

test('calls promoteSnapshot with correct args', () => {
  promoteSnapshot.mockReturnValue({ srcName: 'dev', destName: 'prod', vars: { A: '1' }, overwrote: false });
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  runPromote(['dev', 'prod']);
  expect(promoteSnapshot).toHaveBeenCalledWith('dev', 'prod', '/fake/dir');
  logSpy.mockRestore();
});

test('shows overwrite warning without --force', () => {
  promoteSnapshot.mockReturnValue({ srcName: 'dev', destName: 'prod', vars: {}, overwrote: true });
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  runPromote(['dev', 'prod']);
  expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('overwritten'));
  warnSpy.mockRestore();
  logSpy.mockRestore();
});

test('no overwrite warning with --force', () => {
  promoteSnapshot.mockReturnValue({ srcName: 'dev', destName: 'prod', vars: {}, overwrote: true });
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  runPromote(['dev', 'prod', '--force']);
  expect(warnSpy).not.toHaveBeenCalled();
  warnSpy.mockRestore();
  logSpy.mockRestore();
});

test('handles promoteSnapshot error gracefully', () => {
  promoteSnapshot.mockImplementation(() => { throw new Error('Snapshot not found'); });
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => runPromote(['ghost', 'prod'])).toThrow('exit');
  expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
  errSpy.mockRestore();
  exitSpy.mockRestore();
});
