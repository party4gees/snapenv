import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInspect, printInspectUsage } from './inspect.js';
import * as inspectModule from '../inspect.js';

vi.mock('../inspect.js');

const mockVars = { FOO: 'bar', DB_HOST: 'localhost', DB_PASS: 'secret' };

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  inspectModule.inspectSnapshot.mockResolvedValue(mockVars);
  inspectModule.filterVars.mockImplementation((vars, prefix) =>
    prefix ? Object.fromEntries(Object.entries(vars).filter(([k]) => k.startsWith(prefix))) : vars
  );
  inspectModule.formatInspect.mockReturnValue('Snapshot: mysnap\nFOO=bar\n2 variables');
});

describe('runInspect', () => {
  it('prints usage when --help is passed', async () => {
    await runInspect(['--help']);
    expect(console.log).toHaveBeenCalled();
  });

  it('exits with error when no name provided', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(runInspect([])).rejects.toThrow('exit');
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('calls inspectSnapshot with snapshot name', async () => {
    await runInspect(['mysnap']);
    expect(inspectModule.inspectSnapshot).toHaveBeenCalledWith('mysnap', expect.any(String));
  });

  it('outputs formatted inspect result', async () => {
    await runInspect(['mysnap']);
    expect(inspectModule.formatInspect).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  it('outputs JSON when --json flag is passed', async () => {
    await runInspect(['mysnap', '--json']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('FOO'));
    expect(inspectModule.formatInspect).not.toHaveBeenCalled();
  });

  it('passes filter prefix to filterVars', async () => {
    await runInspect(['mysnap', '--filter', 'DB_']);
    expect(inspectModule.filterVars).toHaveBeenCalledWith(mockVars, 'DB_');
  });

  it('handles error from inspectSnapshot gracefully', async () => {
    inspectModule.inspectSnapshot.mockRejectedValue(new Error('snapshot missing'));
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(runInspect(['ghost'])).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('snapshot missing'));
    expect(exit).toHaveBeenCalledWith(1);
  });
});
