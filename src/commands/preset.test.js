const { runPreset, printPresetUsage } = require('./preset');
const preset = require('../preset');
const snapshot = require('../snapshot');

jest.mock('../preset');
jest.mock('../snapshot');

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

test('prints usage with no args', () => {
  runPreset([]);
  expect(console.log).toHaveBeenCalled();
});

test('save calls savePreset and logs success', () => {
  snapshot.loadSnapshot.mockReturnValue({ KEY: 'val' });
  preset.savePreset.mockReturnValue({ snapshots: ['snap1'], createdAt: '2024-01-01T00:00:00.000Z' });
  runPreset(['save', 'mypreset', 'snap1']);
  expect(preset.savePreset).toHaveBeenCalledWith('mypreset', ['snap1']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('mypreset'));
});

test('save exits if snapshot not found', () => {
  snapshot.loadSnapshot.mockReturnValue(null);
  expect(() => runPreset(['save', 'p', 'missing'])).toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
});

test('save exits if no name given', () => {
  expect(() => runPreset(['save'])).toThrow('exit');
});

test('get prints preset snapshots', () => {
  preset.getPreset.mockReturnValue({ snapshots: ['a', 'b'], createdAt: '2024-01-01T00:00:00.000Z' });
  runPreset(['get', 'mypreset']);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('a'));
});

test('get exits if preset not found', () => {
  preset.getPreset.mockReturnValue(null);
  expect(() => runPreset(['get', 'nope'])).toThrow('exit');
});

test('delete calls deletePreset and logs', () => {
  preset.deletePreset.mockReturnValue(true);
  runPreset(['delete', 'mypreset']);
  expect(preset.deletePreset).toHaveBeenCalledWith('mypreset');
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('deleted'));
});

test('delete exits if preset not found', () => {
  preset.deletePreset.mockReturnValue(false);
  expect(() => runPreset(['delete', 'ghost'])).toThrow('exit');
});

test('list calls listPresets and formatPresetList', () => {
  preset.listPresets.mockReturnValue({});
  preset.formatPresetList.mockReturnValue('No presets defined.');
  runPreset(['list']);
  expect(preset.listPresets).toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith('No presets defined.');
});

test('unknown subcommand exits with error', () => {
  expect(() => runPreset(['bogus'])).toThrow('exit');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unknown'));
});
