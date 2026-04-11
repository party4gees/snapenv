const { runArchive, printArchiveUsage } = require('./archive');
const archive = require('../archive');
const snapshot = require('../snapshot');

jest.mock('../archive');
jest.mock('../snapshot');

describe('runArchive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    snapshot.ensureSnapenvDir.mockResolvedValue();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it('prints usage when no subcommand given', async () => {
    await runArchive([]);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });

  it('prints usage for --help flag', async () => {
    await runArchive(['--help']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Subcommands'));
  });

  it('archives a snapshot by name', async () => {
    archive.archiveSnapshot.mockResolvedValue({
      name: 'prod',
      archivePath: '/some/path/prod.json',
    });
    await runArchive(['add', 'prod']);
    expect(archive.archiveSnapshot).toHaveBeenCalledWith('prod');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Archived snapshot "prod"'));
  });

  it('errors when archive add missing name', async () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(runArchive(['add'])).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('name is required'));
    exit.mockRestore();
  });

  it('lists archived snapshots', async () => {
    archive.listArchived.mockResolvedValue([
      { name: 'prod', archivedAt: new Date('2024-01-15').toISOString() },
      { name: 'staging', archivedAt: new Date('2024-02-10').toISOString() },
    ]);
    await runArchive(['list']);
    expect(archive.listArchived).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('prod'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('staging'));
  });

  it('shows message when no archived snapshots', async () => {
    archive.listArchived.mockResolvedValue([]);
    await runArchive(['list']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No archived'));
  });

  it('restores a snapshot from archive', async () => {
    archive.restoreFromArchive.mockResolvedValue({ name: 'prod' });
    await runArchive(['restore', 'prod']);
    expect(archive.restoreFromArchive).toHaveBeenCalledWith('prod');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Restored "prod"'));
  });

  it('errors on unknown subcommand', async () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(runArchive(['nope'])).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unknown archive subcommand'));
    exit.mockRestore();
  });
});
