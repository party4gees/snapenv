const { runToken, printTokenUsage } = require('./token');
const tokenModule = require('../token');

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test('printTokenUsage prints help text', () => {
  printTokenUsage();
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('snapenv token'));
});

test('runToken with no args prints usage', () => {
  runToken([]);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('snapenv token'));
});

test('runToken create calls createToken and prints id', () => {
  const fake = { id: 'abc123def456', label: 'ci', snapshotName: 'prod', expiresAt: null };
  jest.spyOn(tokenModule, 'createToken').mockReturnValue(fake);
  runToken(['create', 'ci', 'prod']);
  expect(tokenModule.createToken).toHaveBeenCalledWith('ci', 'prod', null);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('abc123def456'));
});

test('runToken create with --expires passes days', () => {
  const fake = { id: 'tok1', label: 'x', snapshotName: 'dev', expiresAt: Date.now() + 86400000 };
  jest.spyOn(tokenModule, 'createToken').mockReturnValue(fake);
  runToken(['create', 'x', 'dev', '--expires', '1']);
  expect(tokenModule.createToken).toHaveBeenCalledWith('x', 'dev', 1);
});

test('runToken revoke calls revokeToken', () => {
  jest.spyOn(tokenModule, 'revokeToken').mockReturnValue(true);
  runToken(['revoke', 'tok123']);
  expect(tokenModule.revokeToken).toHaveBeenCalledWith('tok123');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('revoked'));
});

test('runToken revoke not found message', () => {
  jest.spyOn(tokenModule, 'revokeToken').mockReturnValue(false);
  runToken(['revoke', 'missing']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('not found'));
});

test('runToken resolve prints snapshot name', () => {
  jest.spyOn(tokenModule, 'resolveToken').mockReturnValue({ snapshotName: 'staging' });
  runToken(['resolve', 'tok999']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('staging'));
});

test('runToken list calls formatTokenList', () => {
  jest.spyOn(tokenModule, 'listTokens').mockReturnValue([]);
  jest.spyOn(tokenModule, 'formatTokenList').mockReturnValue('No tokens found.');
  runToken(['list']);
  expect(console.log).toHaveBeenCalledWith('No tokens found.');
});

test('runToken unknown subcommand exits', () => {
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => runToken(['bogus'])).toThrow('exit');
  exitSpy.mockRestore();
});
