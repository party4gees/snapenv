const { runHook, printHookUsage } = require('./hook');
const hookModule = require('../hook');

jest.mock('../hook', () => ({
  ...jest.requireActual('../hook'),
  loadHooks: jest.fn(),
  setHook: jest.fn(),
  removeHook: jest.fn(),
  formatHookList: jest.fn(),
  HOOK_EVENTS: ['pre-snapshot', 'post-snapshot', 'pre-restore', 'post-restore'],
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

test('list subcommand calls loadHooks and formatHookList', () => {
  hookModule.loadHooks.mockReturnValue({ 'pre-snapshot': 'echo hi' });
  hookModule.formatHookList.mockReturnValue('  pre-snapshot: echo hi');
  runHook(['list']);
  expect(hookModule.loadHooks).toHaveBeenCalled();
  expect(hookModule.formatHookList).toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith('  pre-snapshot: echo hi');
});

test('set subcommand calls setHook with event and command', () => {
  runHook(['set', 'pre-snapshot', 'npm', 'run', 'lint']);
  expect(hookModule.setHook).toHaveBeenCalledWith('pre-snapshot', 'npm run lint', undefined);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Hook set'));
});

test('set subcommand exits if event or command missing', () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => runHook(['set', 'pre-snapshot'])).toThrow('exit');
  expect(console.error).toHaveBeenCalled();
  mockExit.mockRestore();
});

test('remove subcommand calls removeHook', () => {
  runHook(['remove', 'post-restore']);
  expect(hookModule.removeHook).toHaveBeenCalledWith('post-restore', undefined);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Hook removed'));
});

test('remove subcommand exits if no event given', () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => runHook(['remove'])).toThrow('exit');
  mockExit.mockRestore();
});

test('unknown subcommand exits with error', () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => runHook(['bogus'])).toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unknown subcommand'));
  mockExit.mockRestore();
});

test('no args prints usage', () => {
  runHook([]);
  expect(console.log).toHaveBeenCalled();
});
