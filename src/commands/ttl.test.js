import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runTtl, parseDuration } from './ttl.js';

vi.mock('../ttl.js', () => ({
  setTtl: vi.fn(),
  removeTtl: vi.fn(),
  getTtl: vi.fn(),
  listExpired: vi.fn(),
  isExpired: vi.fn(),
  loadTtl: vi.fn(),
}));

vi.mock('../snapshot.js', () => ({
  listSnapshots: vi.fn(),
  loadSnapshot: vi.fn(),
}));

vi.mock('../prune.js', () => ({
  deleteSnapshot: vi.fn(),
}));

import * as ttlModule from '../ttl.js';
import * as snapshotModule from '../snapshot.js';
import * as pruneModule from '../prune.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('parseDuration', () => {
  it('parses days', () => {
    expect(parseDuration('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('parses hours', () => {
    expect(parseDuration('24h')).toBe(24 * 60 * 60 * 1000);
  });

  it('parses minutes', () => {
    expect(parseDuration('30m')).toBe(30 * 60 * 1000);
  });

  it('returns null for invalid input', () => {
    expect(parseDuration('abc')).toBeNull();
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('99x')).toBeNull();
  });
});

describe('runTtl set', () => {
  it('sets ttl on a snapshot', async () => {
    ttlModule.loadTtl.mockResolvedValue({});
    ttlModule.setTtl.mockResolvedValue(undefined);

    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runTtl(['set', 'mysnap', '7d']);

    expect(ttlModule.setTtl).toHaveBeenCalledWith(
      expect.any(String),
      'mysnap',
      expect.any(Number)
    );
    expect(log).toHaveBeenCalledWith(expect.stringContaining('mysnap'));
    log.mockRestore();
  });

  it('errors on invalid duration', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(runTtl(['set', 'mysnap', 'bad'])).rejects.toThrow('exit');
    expect(err).toHaveBeenCalledWith(expect.stringContaining('Invalid duration'));

    err.mockRestore();
    exit.mockRestore();
  });
});

describe('runTtl remove', () => {
  it('removes ttl from a snapshot', async () => {
    ttlModule.removeTtl.mockResolvedValue(undefined);

    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runTtl(['remove', 'mysnap']);

    expect(ttlModule.removeTtl).toHaveBeenCalledWith(expect.any(String), 'mysnap');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('removed'));
    log.mockRestore();
  });
});

describe('runTtl get', () => {
  it('shows ttl for a snapshot', async () => {
    ttlModule.getTtl.mockResolvedValue(Date.now() + 86400000);

    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runTtl(['get', 'mysnap']);

    expect(ttlModule.getTtl).toHaveBeenCalledWith(expect.any(String), 'mysnap');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('mysnap'));
    log.mockRestore();
  });

  it('reports no ttl set', async () => {
    ttlModule.getTtl.mockResolvedValue(null);

    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runTtl(['get', 'mysnap']);

    expect(log).toHaveBeenCalledWith(expect.stringContaining('No TTL'));
    log.mockRestore();
  });
});

describe('runTtl expire', () => {
  it('deletes expired snapshots', async () => {
    ttlModule.listExpired.mockResolvedValue(['old1', 'old2']);
    pruneModule.deleteSnapshot.mockResolvedValue(undefined);

    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runTtl(['expire']);

    expect(pruneModule.deleteSnapshot).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('2'));
    log.mockRestore();
  });

  it('reports nothing to expire', async () => {
    ttlModule.listExpired.mockResolvedValue([]);

    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runTtl(['expire']);

    expect(pruneModule.deleteSnapshot).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining('No expired'));
    log.mockRestore();
  });
});
