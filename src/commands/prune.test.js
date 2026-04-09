const { runPrune, printPruneUsage } = require('./prune');

jest.mock('../prune', () => ({
  deleteSnapshot: jest.fn(),
  pruneByAge: jest.fn(),
  pruneKeepLatest: jest.fn(),
  formatPruneSummary: jest.fn(() => 'summary output'),
}));

const { deleteSnapshot, pruneByAge, pruneKeepLatest, formatPruneSummary } = require('../prune');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  process.exit.mockRestore();
});

test('prints usage when no args given', () => {
  runPrune([]);
  expect(console.log).toHaveBeenCalled();
});

test('delete subcommand calls deleteSnapshot', () => {
  deleteSnapshot.mockReturnValue({ deleted: ['snap-a'] });
  runPrune(['delete', 'snap-a']);
  expect(deleteSnapshot).toHaveBeenCalledWith('snap-a');
  expect(console.log).toHaveBeenCalledWith('summary output');
});

test('delete subcommand exits if no name given', () => {
  expect(() => runPrune(['delete'])).toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('name required'));
});

test('delete subcommand handles error from deleteSnapshot', () => {
  deleteSnapshot.mockImplementation(() => { throw new Error('not found'); });
  expect(() => runPrune(['delete', 'ghost'])).toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
});

test('old subcommand calls pruneByAge with correct ms', () => {
  pruneByAge.mockReturnValue({ deleted: [] });
  runPrune(['old', '--days', '7']);
  expect(pruneByAge).toHaveBeenCalledWith(7 * 24 * 60 * 60 * 1000);
});

test('old subcommand exits if days is missing', () => {
  expect(() => runPrune(['old'])).toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('--days'));
});

test('keep subcommand calls pruneKeepLatest', () => {
  pruneKeepLatest.mockReturnValue({ deleted: ['snap-b'] });
  runPrune(['keep', '--latest', '3']);
  expect(pruneKeepLatest).toHaveBeenCalledWith(3);
});

test('keep subcommand exits if count is missing', () => {
  expect(() => runPrune(['keep'])).toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('--latest'));
});

test('unknown subcommand exits with error', () => {
  expect(() => runPrune(['nuke'])).toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unknown prune subcommand'));
});
