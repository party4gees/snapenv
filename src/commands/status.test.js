import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { runStatus, printStatusUsage } from './status.js';
import * as statusModule from '../status.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-cmd-status-'));
}

describe('commands/status', () => {
  let tmpDir;
  let origHome;
  let consoleSpy;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    origHome = process.env.HOME;
    process.env.HOME = tmpDir;
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.HOME = origHome;
    fs.rmSync(tmpDir, { recursive: true });
    vi.restoreAllMocks();
  });

  it('prints usage with --help', async () => {
    await runStatus(['--help']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('snapenv status'));
  });

  it('prints usage with -h', async () => {
    await runStatus(['-h']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('snapenv status'));
  });

  it('printStatusUsage outputs usage info', () => {
    printStatusUsage();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });

  it('runStatus calls formatStatus and prints result', async () => {
    const formatSpy = vi.spyOn(statusModule, 'formatStatus').mockReturnValue('Status: no active snapshot');
    vi.spyOn(statusModule, 'getStatus').mockReturnValue({ active: null, envExists: false });
    vi.spyOn(statusModule, 'getProjectEnvPath').mockReturnValue(path.join(tmpDir, '.env'));

    await runStatus(['--dir', tmpDir]);

    expect(formatSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Status: no active snapshot');
  });

  it('runStatus with active snapshot shows snapshot name', async () => {
    vi.spyOn(statusModule, 'getProjectEnvPath').mockReturnValue(path.join(tmpDir, '.env'));
    vi.spyOn(statusModule, 'getStatus').mockReturnValue({ active: 'staging', envExists: true });
    vi.spyOn(statusModule, 'formatStatus').mockReturnValue('Active snapshot: staging');

    await runStatus(['--dir', tmpDir]);

    expect(consoleSpy).toHaveBeenCalledWith('Active snapshot: staging');
  });

  it('exits with error if --dir flag has no value', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(runStatus(['--dir'])).rejects.toThrow('exit');
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('--dir'));
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });
});
