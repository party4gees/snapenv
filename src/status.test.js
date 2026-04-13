import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  getProjectEnvPath,
  getActiveSnapshot,
  setActiveSnapshot,
  clearActiveSnapshot,
  getStatus,
  formatStatus
} from './status.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-status-'));
}

describe('status', () => {
  let tmpDir;
  let origHome;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    origHome = process.env.HOME;
    process.env.HOME = tmpDir;
  });

  afterEach(() => {
    process.env.HOME = origHome;
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('getProjectEnvPath returns path based on cwd', () => {
    const p = getProjectEnvPath(tmpDir);
    expect(p).toContain('.env');
  });

  it('getActiveSnapshot returns null when no active snapshot set', () => {
    const result = getActiveSnapshot(tmpDir);
    expect(result).toBeNull();
  });

  it('setActiveSnapshot and getActiveSnapshot round-trip', () => {
    setActiveSnapshot('my-snapshot', tmpDir);
    const result = getActiveSnapshot(tmpDir);
    expect(result).toBe('my-snapshot');
  });

  it('clearActiveSnapshot removes the active snapshot', () => {
    setActiveSnapshot('my-snapshot', tmpDir);
    clearActiveSnapshot(tmpDir);
    expect(getActiveSnapshot(tmpDir)).toBeNull();
  });

  it('getStatus returns status object with active and envExists', () => {
    setActiveSnapshot('dev', tmpDir);
    const envPath = path.join(tmpDir, '.env');
    fs.writeFileSync(envPath, 'FOO=bar\n');
    const status = getStatus(tmpDir, envPath);
    expect(status.active).toBe('dev');
    expect(status.envExists).toBe(true);
  });

  it('getStatus envExists false when no .env file', () => {
    const status = getStatus(tmpDir, path.join(tmpDir, '.env'));
    expect(status.envExists).toBe(false);
    expect(status.active).toBeNull();
  });

  it('formatStatus includes active snapshot name', () => {
    setActiveSnapshot('production', tmpDir);
    const status = getStatus(tmpDir, path.join(tmpDir, '.env'));
    const out = formatStatus(status);
    expect(out).toContain('production');
  });

  it('formatStatus shows no active snapshot message', () => {
    const status = getStatus(tmpDir, path.join(tmpDir, '.env'));
    const out = formatStatus(status);
    expect(out).toMatch(/no active/i);
  });
});
