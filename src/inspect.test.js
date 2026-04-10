import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inspectSnapshot, filterVars, formatInspect } from './inspect.js';
import { loadSnapshot } from './snapshot.js';

vi.mock('./snapshot.js');

describe('inspectSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns parsed vars from a snapshot', async () => {
    loadSnapshot.mockResolvedValue('FOO=bar\nBAZ=qux\n');
    const result = await inspectSnapshot('mysnap', 'testproject');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('throws if snapshot not found', async () => {
    loadSnapshot.mockRejectedValue(new Error('not found'));
    await expect(inspectSnapshot('missing', 'testproject')).rejects.toThrow('not found');
  });
});

describe('filterVars', () => {
  const vars = { FOO: 'bar', DB_HOST: 'localhost', DB_PASS: 'secret', NODE_ENV: 'dev' };

  it('returns all vars when no filter given', () => {
    expect(filterVars(vars, null)).toEqual(vars);
  });

  it('filters by prefix', () => {
    expect(filterVars(vars, 'DB_')).toEqual({ DB_HOST: 'localhost', DB_PASS: 'secret' });
  });

  it('returns empty object when no match', () => {
    expect(filterVars(vars, 'AWS_')).toEqual({});
  });

  it('is case-sensitive', () => {
    expect(filterVars(vars, 'foo')).toEqual({});
  });
});

describe('formatInspect', () => {
  it('formats vars as key=value lines', () => {
    const vars = { FOO: 'bar', BAZ: 'qux' };
    const output = formatInspect('mysnap', vars);
    expect(output).toContain('mysnap');
    expect(output).toContain('FOO=bar');
    expect(output).toContain('BAZ=qux');
  });

  it('shows count of variables', () => {
    const vars = { A: '1', B: '2', C: '3' };
    const output = formatInspect('snap1', vars);
    expect(output).toContain('3');
  });

  it('handles empty vars gracefully', () => {
    const output = formatInspect('empty', {});
    expect(output).toContain('empty');
    expect(output).toContain('0');
  });
});
