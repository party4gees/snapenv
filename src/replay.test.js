const path = require('path');
const fs = require('fs');
const os = require('os');
const { replaySnapshot, buildReplaySummary, formatReplayResult, getReplayWindow } = require('./replay');
const { saveSnapshot } = require('./snapshot');
const { ensureSnapenvDir } = require('./snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-replay-'));
}

describe('getReplayWindow', () => {
  const history = [
    { action: 'restore', timestamp: '2024-01-01T10:00:00.000Z' },
    { action: 'restore', timestamp: '2024-01-01T12:00:00.000Z' },
    { action: 'snapshot', timestamp: '2024-01-01T11:00:00.000Z' },
    { action: 'restore', timestamp: '2024-01-01T14:00:00.000Z' },
  ];

  test('filters restore actions within window', () => {
    const from = new Date('2024-01-01T09:00:00.000Z').getTime();
    const to = new Date('2024-01-01T13:00:00.000Z').getTime();
    const result = getReplayWindow(history, from, to);
    expect(result).toHaveLength(2);
  });

  test('excludes non-restore actions', () => {
    const from = new Date('2024-01-01T09:00:00.000Z').getTime();
    const to = new Date('2024-01-01T15:00:00.000Z').getTime();
    const result = getReplayWindow(history, from, to);
    expect(result.every(e => e.action === 'restore')).toBe(true);
  });
});

describe('replaySnapshot', () => {
  test('copies snapshot to new name', async () => {
    const dir = makeTmpDir();
    await ensureSnapenvDir(dir);
    await saveSnapshot(dir, 'original', { FOO: 'bar', BAZ: 'qux' });
    const result = await replaySnapshot(dir, 'original', 'replayed');
    expect(result.source).toBe('original');
    expect(result.target).toBe('replayed');
    expect(result.vars).toBe(2);
  });

  test('throws if source not found', async () => {
    const dir = makeTmpDir();
    await ensureSnapenvDir(dir);
    await expect(replaySnapshot(dir, 'missing', 'target')).rejects.toThrow('not found');
  });

  test('throws if target already exists', async () => {
    const dir = makeTmpDir();
    await ensureSnapenvDir(dir);
    await saveSnapshot(dir, 'src', { A: '1' });
    await saveSnapshot(dir, 'dst', { B: '2' });
    await expect(replaySnapshot(dir, 'src', 'dst')).rejects.toThrow('already exists');
  });
});

describe('buildReplaySummary', () => {
  test('returns summary object', () => {
    const s = buildReplaySummary({ source: 'a', target: 'b', vars: 5 });
    expect(s).toEqual({ source: 'a', target: 'b', varCount: 5 });
  });
});

describe('formatReplayResult', () => {
  test('includes source and target names', () => {
    const out = formatReplayResult({ source: 'prod', target: 'prod-copy', vars: 3 });
    expect(out).toContain('prod');
    expect(out).toContain('prod-copy');
    expect(out).toContain('3');
  });
});
