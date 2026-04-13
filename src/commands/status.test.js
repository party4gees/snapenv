import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runStatus } from './status.js';
import * as status from '../status.js';

vi.mock('../status.js');

const mockStatus = {
  active: 'my-snapshot',
  envFile: '.env',
  projectDir: '/home/user/project',
  snapshotCount: 5,
  lastSaved: '2024-01-15T10:30:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process, 'exit').mockImplementation(() => {});
});

describe('runStatus', () => {
  it('prints status when active snapshot exists', async () => {
    status.getStatus.mockResolvedValue(mockStatus);
    status.formatStatus.mockReturnValue('Status: my-snapshot active');

    await runStatus({});

    expect(status.getStatus).toHaveBeenCalled();
    expect(status.formatStatus).toHaveBeenCalledWith(mockStatus);
    expect(console.log).toHaveBeenCalledWith('Status: my-snapshot active');
  });

  it('prints status when no active snapshot', async () => {
    const noActiveStatus = { ...mockStatus, active: null };
    status.getStatus.mockResolvedValue(noActiveStatus);
    status.formatStatus.mockReturnValue('No active snapshot');

    await runStatus({});

    expect(console.log).toHaveBeenCalledWith('No active snapshot');
  });

  it('handles --json flag', async () => {
    status.getStatus.mockResolvedValue(mockStatus);

    await runStatus({ json: true });

    expect(console.log).toHaveBeenCalledWith(JSON.stringify(mockStatus, null, 2));
    expect(status.formatStatus).not.toHaveBeenCalled();
  });

  it('handles --quiet flag — prints only active name', async () => {
    status.getStatus.mockResolvedValue(mockStatus);

    await runStatus({ quiet: true });

    expect(console.log).toHaveBeenCalledWith('my-snapshot');
    expect(status.formatStatus).not.toHaveBeenCalled();
  });

  it('prints nothing with --quiet when no active snapshot', async () => {
    status.getStatus.mockResolvedValue({ ...mockStatus, active: null });

    await runStatus({ quiet: true });

    expect(console.log).not.toHaveBeenCalled();
  });

  it('exits with code 1 on error', async () => {
    status.getStatus.mockRejectedValue(new Error('read error'));

    await runStatus({});

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('read error'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
