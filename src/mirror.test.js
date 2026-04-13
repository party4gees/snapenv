const fs = require('fs');
const os = require('os');
const path = require('path');
const { mirrorSnapshot, formatMirrorResult } = require('./mirror');
const { saveSnapshot } = require('./snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-mirror-'));
}

describe('mirrorSnapshot', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('mirrors snapshot vars into a new file', () => {
    saveSnapshot('mysnap', { API_KEY: 'abc', PORT: '3000' }, tmpDir);
    const target = path.join(tmpDir, '.env.mirror');
    const results = mirrorSnapshot('mysnap', [target], tmpDir);
    expect(results).toHaveLength(1);
    expect(results[0].applied).toBe(2);
    const written = fs.readFileSync(target, 'utf8');
    expect(written).toContain('API_KEY=abc');
    expect(written).toContain('PORT=3000');
  });

  test('preserves extra keys already in target file', () => {
    saveSnapshot('mysnap', { API_KEY: 'newval' }, tmpDir);
    const target = path.join(tmpDir, '.env');
    fs.writeFileSync(target, 'EXTRA=keep\nAPI_KEY=old\n');
    mirrorSnapshot('mysnap', [target], tmpDir);
    const written = fs.readFileSync(target, 'utf8');
    expect(written).toContain('EXTRA=keep');
    expect(written).toContain('API_KEY=newval');
  });

  test('mirrors to multiple targets', () => {
    saveSnapshot('multi', { X: '1' }, tmpDir);
    const t1 = path.join(tmpDir, '.env.a');
    const t2 = path.join(tmpDir, '.env.b');
    const results = mirrorSnapshot('multi', [t1, t2], tmpDir);
    expect(results).toHaveLength(2);
    expect(fs.existsSync(t1)).toBe(true);
    expect(fs.existsSync(t2)).toBe(true);
  });

  test('throws for missing snapshot', () => {
    expect(() => mirrorSnapshot('nope', ['/tmp/x'], tmpDir)).toThrow('not found');
  });
});

describe('formatMirrorResult', () => {
  test('returns summary string', () => {
    const results = [{ target: '/a/.env', applied: 3 }, { target: '/b/.env', applied: 3 }];
    const out = formatMirrorResult(results, 'snap1');
    expect(out).toContain('snap1');
    expect(out).toContain('/a/.env');
    expect(out).toContain('2 file(s)');
  });
});
