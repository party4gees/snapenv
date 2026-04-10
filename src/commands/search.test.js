const { runSearch, printSearchUsage } = require('./search');
const { searchByKey, searchByValue, formatSearchResults } = require('../search');
const { ensureSnapenvDir } = require('../snapshot');

jest.mock('../search');

beforeEach(() => {
  jest.clearAllMocks();
  ensureSnapenvDir.mockReturnValue('/fake/.snapenv');
  formatSearchResults.mockReturnValue('formatted output');
  searchByKey.mockResolvedValue([]);
  searchByValue.mockResolvedValue([]);
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

test('prints usage with --help flag', async () => {
  await runSearch(['--help']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage: snapenv search'));
});

test('exits with error if no pattern provided', async () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(runSearch([])).rejects.toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('pattern is required'));
  mockExit.mockRestore();
});

test('calls searchByKey by default', async () => {
  await runSearch(['DATABASE']);
  expect(searchByKey).toHaveBeenCalledWith('/fake/.snapenv', 'DATABASE');
  expect(searchByValue).not.toHaveBeenCalled();
});

test('calls searchByValue with --value flag', async () => {
  await runSearch(['--value', 'localhost']);
  expect(searchByValue).toHaveBeenCalledWith('/fake/.snapenv', 'localhost');
  expect(searchByKey).not.toHaveBeenCalled();
});

test('calls searchByValue with -v shorthand', async () => {
  await runSearch(['-v', 'localhost']);
  expect(searchByValue).toHaveBeenCalledWith('/fake/.snapenv', 'localhost');
});

test('logs formatted output', async () => {
  await runSearch(['NODE_ENV']);
  expect(formatSearchResults).toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith('formatted output');
});

test('handles search error gracefully', async () => {
  searchByKey.mockRejectedValue(new Error('disk error'));
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(runSearch(['FOO'])).rejects.toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('disk error'));
  mockExit.mockRestore();
});
