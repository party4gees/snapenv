const { runList, printListUsage } = require('./list');
const { listSnapshotsWithMeta, formatSnapshotList } = require('../list');

jest.mock('../list');

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('printListUsage', () => {
  it('prints usage info', () => {
    printListUsage();
    expect(mockConsoleLog).toHaveBeenCalled();
    const output = mockConsoleLog.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/list/);
  });
});

describe('runList', () => {
  it('lists snapshots with formatted output', async () => {
    const fakeMeta = [
      { name: 'backup', createdAt: new Date('2024-01-01'), keyCount: 5 },
      { name: 'dev', createdAt: new Date('2024-02-01'), keyCount: 3 }
    ];
    listSnapshotsWithMeta.mockResolvedValue(fakeMeta);
    formatSnapshotList.mockReturnValue('backup\ndev');

    await runList({ args: [], flags: {} });

    expect(listSnapshotsWithMeta).toHaveBeenCalled();
    expect(formatSnapshotList).toHaveBeenCalledWith(fakeMeta);
    expect(mockConsoleLog).toHaveBeenCalledWith('backup\ndev');
  });

  it('shows message when no snapshots exist', async () => {
    listSnapshotsWithMeta.mockResolvedValue([]);
    formatSnapshotList.mockReturnValue('');

    await runList({ args: [], flags: {} });

    const output = mockConsoleLog.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/no snapshots/i);
  });

  it('prints help when --help flag is passed', async () => {
    await runList({ args: [], flags: { help: true } });
    const output = mockConsoleLog.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/list/);
    expect(listSnapshotsWithMeta).not.toHaveBeenCalled();
  });

  it('handles errors gracefully', async () => {
    listSnapshotsWithMeta.mockRejectedValue(new Error('disk error'));

    await runList({ args: [], flags: {} });

    expect(mockConsoleError).toHaveBeenCalled();
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
});
