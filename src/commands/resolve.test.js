const { runResolve, printResolveUsage } = require('./resolve');
const snapshot = require('../snapshot');
const env = require('../env');
const resolve = require('../resolve');
const fs = require('fs');

jest.mock('../snapshot');
jest.mock('../env');
jest.mock('../resolve');
jest.mock('fs');

describe('runResolve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it('prints usage when no args given', async () => {
    await runResolve([]);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
  });

  it('prints usage when --help passed', async () => {
    await runResolve(['--help']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
  });

  it('exits if snapshot not found', async () => {
    snapshot.loadSnapshot.mockImplementation(() => { throw new Error('not found'); });
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    await runResolve(['missing-snap']);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Snapshot not found'));
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it('exits on invalid strategy', async () => {
    snapshot.loadSnapshot.mockReturnValue({ FOO: 'bar' });
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    await runResolve(['my-snap', '--strategy', 'bogus']);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unknown strategy'));
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it('reports no conflicts when none exist', async () => {
    snapshot.loadSnapshot.mockReturnValue({ FOO: 'bar' });
    fs.existsSync.mockReturnValue(false);
    resolve.formatResolution.mockReturnValue({ conflicts: [], summary: '' });
    await runResolve(['my-snap']);
    expect(console.log).toHaveBeenCalledWith('No conflicts found.');
  });

  it('shows conflicts and dry-run message', async () => {
    snapshot.loadSnapshot.mockReturnValue({ FOO: 'snap' });
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('FOO=env');
    env.parseEnvFile.mockReturnValue({ FOO: 'env' });
    resolve.formatResolution.mockReturnValue({
      conflicts: [{ key: 'FOO', snapshotVal: 'snap', envVal: 'env' }],
      summary: 'FOO: snap vs env'
    });
    await runResolve(['my-snap', '--dry-run']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('1 conflict'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('dry-run'));
  });

  it('resolves with env strategy', async () => {
    snapshot.loadSnapshot.mockReturnValue({ FOO: 'snap' });
    fs.existsSync.mockReturnValue(false);
    resolve.formatResolution.mockReturnValue({
      conflicts: [{ key: 'FOO' }],
      summary: 'FOO conflict'
    });
    await runResolve(['my-snap', '--strategy', 'env']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('strategy: env'));
  });
});

describe('printResolveUsage', () => {
  it('prints usage info', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printResolveUsage();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('snapenv resolve'));
    spy.mockRestore();
  });
});
