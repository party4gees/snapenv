import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runBatch } from './batch.js';
import * as snapshot from '../snapshot.js';
import * as restore from '../restore.js';

vi.mock('../snapshot.js');
vi.mock('../restore.js');

describe('runBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prints usage when no subcommand given', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runBatch([]);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Usage'));
    log.mockRestore();
  });

  it('runs snapshot for each name in batch save', async () => {
    snapshot.saveSnapshot = vi.fn().mockResolvedValue(undefined);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runBatch(['save', 'snap1', 'snap2']);
    expect(snapshot.saveSnapshot).toHaveBeenCalledTimes(2);
    expect(snapshot.saveSnapshot).toHaveBeenCalledWith('snap1', expect.any(String));
    expect(snapshot.saveSnapshot).toHaveBeenCalledWith('snap2', expect.any(String));
    log.mockRestore();
  });

  it('runs restore for each name in batch restore', async () => {
    restore.restoreSnapshot = vi.fn().mockResolvedValue({ restored: [], skipped: [] });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runBatch(['restore', 'snap1', 'snap2']);
    expect(restore.restoreSnapshot).toHaveBeenCalledTimes(2);
    log.mockRestore();
  });

  it('reports errors per snapshot without stopping', async () => {
    snapshot.saveSnapshot = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('disk full'));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    await runBatch(['save', 'snap1', 'snap2']);
    expect(err).toHaveBeenCalledWith(expect.stringContaining('snap2'), expect.stringContaining('disk full'));
    log.mockRestore();
    err.mockRestore();
  });

  it('prints unknown subcommand message', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runBatch(['nope', 'snap1']);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Unknown'));
    log.mockRestore();
  });
});
