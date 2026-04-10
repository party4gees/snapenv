import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runValidate, printValidateUsage } from './validate.js';
import * as validate from '../validate.js';
import * as snapshot from '../snapshot.js';

vi.mock('../validate.js');
vi.mock('../snapshot.js');

describe('runValidate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prints usage when no snapshot name provided', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runValidate([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('validates a snapshot and prints result', async () => {
    const mockVars = { NODE_ENV: 'production', PORT: '3000' };
    snapshot.loadSnapshot.mockResolvedValue(mockVars);
    validate.validateSnapshot.mockReturnValue({ valid: true, issues: [] });
    validate.formatValidationResult.mockReturnValue('All variables valid.');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runValidate(['mysnap']);

    expect(snapshot.loadSnapshot).toHaveBeenCalledWith('mysnap');
    expect(validate.validateSnapshot).toHaveBeenCalledWith(mockVars);
    expect(consoleSpy).toHaveBeenCalledWith('All variables valid.');
    consoleSpy.mockRestore();
  });

  it('exits with code 1 when validation fails', async () => {
    const mockVars = { EMPTY_VAR: '' };
    snapshot.loadSnapshot.mockResolvedValue(mockVars);
    validate.validateSnapshot.mockReturnValue({ valid: false, issues: ['EMPTY_VAR is empty'] });
    validate.formatValidationResult.mockReturnValue('Validation failed: 1 issue(s) found.');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    await runValidate(['mysnap']);

    expect(exitSpy).toHaveBeenCalledWith(1);
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('handles missing snapshot gracefully', async () => {
    snapshot.loadSnapshot.mockRejectedValue(new Error('Snapshot not found'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    await runValidate(['nonexistent']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Snapshot not found'));
    expect(exitSpy).toHaveBeenCalledWith(1);
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('printValidateUsage outputs usage info', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    printValidateUsage();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('validate'));
    consoleSpy.mockRestore();
  });
});
