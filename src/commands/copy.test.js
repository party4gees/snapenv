import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runCopy } from './copy.js';
import { copySnapshot } from '../copy.js';

vi.mock('../copy.js');

describe('runCopy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should print usage when no args provided', async () => {
    await runCopy([]);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });

  it('should print usage when only one arg provided', async () => {
    await runCopy(['snap1']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });

  it('should call copySnapshot with source and destination', async () => {
    copySnapshot.mockResolvedValue({ source: 'snap1', destination: 'snap2', keys: 5 });
    await runCopy(['snap1', 'snap2']);
    expect(copySnapshot).toHaveBeenCalledWith('snap1', 'snap2');
  });

  it('should print summary after successful copy', async () => {
    copySnapshot.mockResolvedValue({ source: 'snap1', destination: 'snap2', keys: 5 });
    await runCopy(['snap1', 'snap2']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('snap1'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('snap2'));
  });

  it('should print error when copySnapshot throws', async () => {
    copySnapshot.mockRejectedValue(new Error('Snapshot not found'));
    await runCopy(['missing', 'dest']);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Snapshot not found'));
  });

  it('should handle --force flag', async () => {
    copySnapshot.mockResolvedValue({ source: 'snap1', destination: 'snap2', keys: 3 });
    await runCopy(['snap1', 'snap2', '--force']);
    expect(copySnapshot).toHaveBeenCalledWith('snap1', 'snap2', { force: true });
  });
});
