const path = require('path');
const os = require('os');
const fs = require('fs');
const { chainSnapshots, saveChain, formatChainResult } = require('./chain');
const { saveSnapshot, loadSnapshot } = require('./snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-chain-'));
}

describe('chainSnapshots', () => {
  it('merges two snapshots in order', () => {
    const dir = makeTmpDir();
    saveSnapshot('base', { FOO: 'foo', BAR: 'bar' }, dir);
    saveSnapshot('override', { BAR: 'baz', QUX: 'qux' }, dir);
    const { merged, loaded } = chainSnapshots(['base', 'override'], dir);
    expect(merged.FOO).toBe('foo');
    expect(merged.BAR).toBe('baz');
    expect(merged.QUX).toBe('qux');
    expect(loaded).toEqual(['base', 'override']);
  });

  it('handles a single snapshot', () => {
    const dir = makeTmpDir();
    saveSnapshot('only', { A: '1' }, dir);
    const { merged } = chainSnapshots(['only'], dir);
    expect(merged.A).toBe('1');
  });

  it('throws when no names provided', () => {
    const dir = makeTmpDir();
    expect(() => chainSnapshots([], dir)).toThrow();
  });
});

describe('saveChain', () => {
  it('saves merged result as new snapshot', () => {
    const dir = makeTmpDir();
    saveSnapshot('a', { X: '1' }, dir);
    saveSnapshot('b', { Y: '2' }, dir);
    const result = saveChain('combined', ['a', 'b'], dir);
    expect(result.targetName).toBe('combined');
    expect(result.count).toBe(2);
    const loaded = loadSnapshot('combined', dir);
    expect(loaded.X).toBe('1');
    expect(loaded.Y).toBe('2');
  });
});

describe('formatChainResult', () => {
  it('formats output correctly', () => {
    const result = { targetName: 'final', sources: ['a', 'b', 'c'], count: 5 };
    const output = formatChainResult(result);
    expect(output).toContain('final');
    expect(output).toContain('3 snapshot(s)');
    expect(output).toContain('Total keys: 5');
  });
});
