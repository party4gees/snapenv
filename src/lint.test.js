const { lintSnapshot, formatLintResult } = require('./lint');
const { saveSnapshot } = require('./snapshot');
const fs = require('fs');
const os = require('os');
const path = require('path');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-lint-'));
}

describe('lintSnapshot', () => {
  let dir;
  beforeEach(() => { dir = makeTmpDir(); });
  afterEach(() => fs.rmSync(dir, { recursive: true }));

  test('returns no warnings for clean snapshot', () => {
    saveSnapshot('clean', { NODE_ENV: 'production', PORT: '3000' }, dir);
    const warnings = lintSnapshot('clean', dir);
    expect(warnings).toHaveLength(0);
  });

  test('warns on empty value', () => {
    saveSnapshot('empty', { API_KEY: '' }, dir);
    const warnings = lintSnapshot('empty', dir);
    expect(warnings.some(w => w.rule === 'no_empty_value')).toBe(true);
  });

  test('warns on quoted value', () => {
    saveSnapshot('quoted', { SECRET: '"myvalue"' }, dir);
    const warnings = lintSnapshot('quoted', dir);
    expect(warnings.some(w => w.rule === 'no_quotes_in_value')).toBe(true);
  });

  test('throws if snapshot not found', () => {
    expect(() => lintSnapshot('missing', dir)).toThrow("Snapshot 'missing' not found");
  });
});

describe('formatLintResult', () => {
  test('shows pass message when no warnings', () => {
    const out = formatLintResult('mysnap', []);
    expect(out).toContain('passed all lint checks');
  });

  test('shows warning count and details', () => {
    const warnings = [{ key: 'FOO', rule: 'no_empty_value', message: "'FOO' has an empty value" }];
    const out = formatLintResult('mysnap', warnings);
    expect(out).toContain('1 lint warning');
    expect(out).toContain('no_empty_value');
    expect(out).toContain("'FOO' has an empty value");
  });
});
