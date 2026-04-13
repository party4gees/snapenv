const { batchOperate, batchDelete, batchRestore, formatBatchResult } = require('./batch');

describe('batchOperate', () => {
  it('collects success results', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const results = await batchOperate(['a', 'b'], fn);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ name: 'a', success: true, result: 'ok' });
    expect(results[1]).toEqual({ name: 'b', success: true, result: 'ok' });
  });

  it('captures errors without throwing', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('not found'));
    const results = await batchOperate(['x'], fn);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toBe('not found');
  });

  it('handles mixed success and failure', async () => {
    const fn = jest.fn()
      .mockResolvedValueOnce('done')
      .mockRejectedValueOnce(new Error('oops'));
    const results = await batchOperate(['good', 'bad'], fn);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
  });

  it('returns empty array for empty names', async () => {
    const fn = jest.fn();
    const results = await batchOperate([], fn);
    expect(results).toEqual([]);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('formatBatchResult', () => {
  it('shows counts and names', () => {
    const results = [
      { name: 'snap1', success: true, result: {} },
      { name: 'snap2', success: false, error: 'missing' },
    ];
    const out = formatBatchResult(results, 'deleted');
    expect(out).toContain('1 succeeded');
    expect(out).toContain('1 failed');
    expect(out).toContain('✓ snap1');
    expect(out).toContain('✗ snap2: missing');
  });

  it('uses default operation label', () => {
    const out = formatBatchResult([], undefined);
    expect(out).toContain('operated on');
  });

  it('all success case', () => {
    const results = [
      { name: 'a', success: true },
      { name: 'b', success: true },
    ];
    const out = formatBatchResult(results, 'restored');
    expect(out).toContain('2 succeeded, 0 failed');
  });
});
