import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runCompare } from './compare.js';
import { compareSnapshots, formatCompareResult } from '../compare.js';

vi.mock('../compare.js');

describe('runCompare', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prints usage if fewer than 2 snapshot names provided', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runCompare(['only-one']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Usage'));
    consoleSpy.mockRestore();
  });

  it('calls compareSnapshots with both names', async () => {
    compareSnapshots.mockResolvedValue({ added: {}, removed: {}, changed: {}, identical: true });
    formatCompareResult.mockReturnValue('identical output');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runCompare(['snap-a', 'snap-b']);

    expect(compareSnapshots).toHaveBeenCalledWith('snap-a', 'snap-b');
    consoleSpy.mockRestore();
  });

  it('prints formatted result after comparison', async () => {
    compareSnapshots.mockResolvedValue({ added: {}, removed: {}, changed: {}, identical: false });
    formatCompareResult.mockReturnValue('diff output here');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runCompare(['snap-a', 'snap-b']);

    expect(consoleSpy).toHaveBeenCalledWith('diff output here');
    consoleSpy.mockRestore();
  });

  it('logs error if compareSnapshots throws', async () => {
    compareSnapshots.mockRejectedValue(new Error('snapshot not found'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await runCompare(['snap-a', 'snap-b']);

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('snapshot not found'));
    errorSpy.mockRestore();
  });

  it('passes --no-color flag through to formatCompareResult', async () => {
    compareSnapshots.mockResolvedValue({ added: {}, removed: {}, changed: {}, identical: true });
    formatCompareResult.mockReturnValue('plain output');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runCompare(['snap-a', 'snap-b', '--no-color']);

    expect(formatCompareResult).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ color: false })
    );
    consoleSpy.mockRestore();
  });
});
