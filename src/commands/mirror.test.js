import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runMirror } from './mirror.js';
import * as mirrorModule from '../mirror.js';
import * as snapshotModule from '../snapshot.js';

vi.mock('../mirror.js');
vi.mock('../snapshot.js');

describe('runMirror', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => {});
  });

  it('prints usage when no args provided', async () => {
    await runMirror([]);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });

  it('prints usage when only one snapshot name given', async () => {
    await runMirror(['snap-a']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });

  it('mirrors source to destination snapshot', async () => {
    snapshotModule.loadSnapshot = vi.fn().mockResolvedValue({ FOO: 'bar', BAZ: '1' });
    snapshotModule.saveSnapshot = vi.fn().mockResolvedValue();
    mirrorModule.mirrorSnapshot = vi.fn().mockResolvedValue({ source: 'snap-a', destination: 'snap-b', keys: 2 });
    mirrorModule.formatMirrorResult = vi.fn().mockReturnValue('Mirrored snap-a -> snap-b (2 keys)');

    await runMirror(['snap-a', 'snap-b']);

    expect(mirrorModule.mirrorSnapshot).toHaveBeenCalledWith('snap-a', 'snap-b', expect.any(Object));
    expect(console.log).toHaveBeenCalledWith('Mirrored snap-a -> snap-b (2 keys)');
  });

  it('passes --overwrite flag correctly', async () => {
    snapshotModule.loadSnapshot = vi.fn().mockResolvedValue({ FOO: 'bar' });
    snapshotModule.saveSnapshot = vi.fn().mockResolvedValue();
    mirrorModule.mirrorSnapshot = vi.fn().mockResolvedValue({ source: 'a', destination: 'b', keys: 1 });
    mirrorModule.formatMirrorResult = vi.fn().mockReturnValue('done');

    await runMirror(['a', 'b', '--overwrite']);

    expect(mirrorModule.mirrorSnapshot).toHaveBeenCalledWith('a', 'b', expect.objectContaining({ overwrite: true }));
  });

  it('logs error and exits when mirror throws', async () => {
    mirrorModule.mirrorSnapshot = vi.fn().mockRejectedValue(new Error('source not found'));

    await runMirror(['missing', 'dest']);

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('source not found'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
