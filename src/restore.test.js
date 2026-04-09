const fs = require('fs');
const path = require('path');
const { buildRestoreSummary, formatRestoreSummary } = require('./restore');

describe('buildRestoreSummary', () => {
  test('detects added keys', () => {
    const summary = buildRestoreSummary({}, { NEW_KEY: 'val' }, 'snap1', '.env');
    expect(summary.added).toEqual(['NEW_KEY']);
    expect(summary.removed).toEqual([]);
    expect(summary.changed).toEqual([]);
  });

  test('detects removed keys', () => {
    const summary = buildRestoreSummary({ OLD_KEY: 'val' }, {}, 'snap1', '.env');
    expect(summary.removed).toEqual(['OLD_KEY']);
    expect(summary.added).toEqual([]);
  });

  test('detects changed keys', () => {
    const summary = buildRestoreSummary(
      { FOO: 'old' },
      { FOO: 'new' },
      'snap1',
      '.env'
    );
    expect(summary.changed).toEqual(['FOO']);
    expect(summary.added).toEqual([]);
    expect(summary.removed).toEqual([]);
  });

  test('detects unchanged keys', () => {
    const summary = buildRestoreSummary(
      { FOO: 'same' },
      { FOO: 'same' },
      'snap1',
      '.env'
    );
    expect(summary.unchanged).toEqual(['FOO']);
    expect(summary.changed).toEqual([]);
  });

  test('handles mixed changes', () => {
    const prev = { A: '1', B: '2', C: '3' };
    const next = { A: '1', B: 'changed', D: 'new' };
    const summary = buildRestoreSummary(prev, next, 'mysnap', '.env');
    expect(summary.unchanged).toContain('A');
    expect(summary.changed).toContain('B');
    expect(summary.removed).toContain('C');
    expect(summary.added).toContain('D');
  });
});

describe('formatRestoreSummary', () => {
  test('includes snapshot name and file path', () => {
    const summary = { snapshotName: 'dev', envFilePath: '.env', added: [], removed: [], changed: [], unchanged: ['X'] };
    const output = formatRestoreSummary(summary);
    expect(output).toContain('dev');
    expect(output).toContain('.env');
  });

  test('shows no changes message when nothing changed', () => {
    const summary = { snapshotName: 'dev', envFilePath: '.env', added: [], removed: [], changed: [], unchanged: ['A'] };
    const output = formatRestoreSummary(summary);
    expect(output).toContain('No changes');
  });

  test('lists added keys', () => {
    const summary = { snapshotName: 'dev', envFilePath: '.env', added: ['NEW'], removed: [], changed: [], unchanged: [] };
    const output = formatRestoreSummary(summary);
    expect(output).toContain('Added');
    expect(output).toContain('NEW');
  });
});
