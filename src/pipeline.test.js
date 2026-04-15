const { buildPipeline, formatPipelineResult } = require('./pipeline');

describe('buildPipeline', () => {
  test('accepts array of strings', () => {
    const result = buildPipeline(['base', 'dev']);
    expect(result).toEqual([
      { name: 'base', keys: null },
      { name: 'dev', keys: null },
    ]);
  });

  test('accepts array of objects with keys', () => {
    const result = buildPipeline([{ name: 'base', keys: ['FOO', 'BAR'] }]);
    expect(result[0]).toEqual({ name: 'base', keys: ['FOO', 'BAR'] });
  });

  test('accepts mixed array', () => {
    const result = buildPipeline(['base', { name: 'dev', keys: ['PORT'] }]);
    expect(result).toHaveLength(2);
    expect(result[1].keys).toEqual(['PORT']);
  });

  test('throws on empty array', () => {
    expect(() => buildPipeline([])).toThrow();
  });

  test('throws on invalid step', () => {
    expect(() => buildPipeline([42])).toThrow('Invalid pipeline step at index 0');
  });

  test('defaults keys to null for object without keys', () => {
    const result = buildPipeline([{ name: 'prod' }]);
    expect(result[0].keys).toBeNull();
  });
});

describe('formatPipelineResult', () => {
  test('formats applied steps', () => {
    const out = formatPipelineResult([
      { name: 'base', status: 'applied', count: 3 },
      { name: 'dev', status: 'applied', count: 1 },
    ]);
    expect(out).toContain('✔ base');
    expect(out).toContain('3 var(s)');
    expect(out).toContain('✔ dev');
  });

  test('formats missing steps', () => {
    const out = formatPipelineResult([{ name: 'ghost', status: 'missing' }]);
    expect(out).toContain('✘ ghost');
    expect(out).toContain('missing');
  });

  test('includes header line', () => {
    const out = formatPipelineResult([{ name: 'x', status: 'applied', count: 0 }]);
    expect(out.startsWith('Pipeline result:')).toBe(true);
  });
});
