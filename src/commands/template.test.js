const { runTemplate, printTemplateUsage } = require('./template');
const template = require('../template');
const snapshot = require('../snapshot');
const env = require('../env');
const fs = require('fs');

jest.mock('../template');
jest.mock('../snapshot');
jest.mock('../env');
jest.mock('fs');

describe('runTemplate', () => {
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

  test('prints usage when no args', async () => {
    await runTemplate([]);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });

  test('list shows message when no templates', async () => {
    template.listTemplates.mockResolvedValue([]);
    await runTemplate(['list']);
    expect(console.log).toHaveBeenCalledWith('No templates saved.');
  });

  test('list formats templates when present', async () => {
    template.listTemplates.mockResolvedValue([{ name: 'base' }]);
    template.formatTemplateList.mockReturnValue('base  1 var');
    await runTemplate(['list']);
    expect(console.log).toHaveBeenCalledWith('base  1 var');
  });

  test('save creates template from snapshot', async () => {
    fs.existsSync.mockReturnValue(true);
    snapshot.getSnapshotPath.mockReturnValue('/tmp/.snapenv/my-snap.env');
    env.parseEnvFile.mockReturnValue({ FOO: 'bar' });
    template.saveTemplate.mockResolvedValue();
    await runTemplate(['save', 'base-api', 'my-snap']);
    expect(template.saveTemplate).toHaveBeenCalledWith('base-api', { FOO: 'bar' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('base-api'));
  });

  test('save exits if snapshot not found', async () => {
    fs.existsSync.mockReturnValue(false);
    snapshot.getSnapshotPath.mockReturnValue('/tmp/.snapenv/missing.env');
    await expect(runTemplate(['save', 'base-api', 'missing'])).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  test('apply creates snapshot from template', async () => {
    template.getTemplate.mockResolvedValue({ name: 'base-api', vars: { FOO: 'bar' } });
    snapshot.saveSnapshot.mockResolvedValue();
    await runTemplate(['apply', 'base-api', 'new-snap']);
    expect(snapshot.saveSnapshot).toHaveBeenCalledWith('new-snap', { FOO: 'bar' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('new-snap'));
  });

  test('apply exits if template not found', async () => {
    template.getTemplate.mockResolvedValue(null);
    await expect(runTemplate(['apply', 'missing', 'new-snap'])).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  test('delete removes template', async () => {
    template.deleteTemplate.mockResolvedValue();
    await runTemplate(['delete', 'base-api']);
    expect(template.deleteTemplate).toHaveBeenCalledWith('base-api');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('deleted'));
  });

  test('unknown subcommand exits with error', async () => {
    await expect(runTemplate(['bogus'])).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unknown subcommand'));
  });
});
