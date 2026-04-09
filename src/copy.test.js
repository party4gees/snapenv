const { copySnapshot, formatCopySummary } = require('./copy');
const { loadSnapshot, saveSnapshot } = require('./snapshot');

jest.mock('./snapshot');

describe('copySnapshot', () => {
  beforeEach(() => jest.clearAllMocks());

  it('copies vars from source to dest', async () => {
    const vars = { FOO: 'bar', BAZ: '123' };
    loadSnapshot.mockResolvedValue(vars);
    saveSnapshot.mockResolvedValue();

    const result = await copySnapshot('dev', 'dev-backup', '/proj');

    expect(loadSnapshot).toHaveBeenCalledWith('dev', '/proj');
    expect(saveSnapshot).toHaveBeenCalledWith('dev-backup', vars, '/proj');
    expect(result).toEqual({ source: 'dev', dest: 'dev-backup', keyCount: 2 });
  });

  it('throws if source and dest are the same', async () => {
    await expect(copySnapshot('dev', 'dev')).rejects.toThrow(
      'Source and destination snapshot names must be different'
    );
  });

  it('throws if source snapshot is missing or empty', async () => {
    loadSnapshot.mockResolvedValue({});
    await expect(copySnapshot('ghost', 'copy', '/proj')).rejects.toThrow(
      'Snapshot "ghost" not found or is empty'
    );
  });

  it('throws if names are missing', async () => {
    await expect(copySnapshot('', 'dest')).rejects.toThrow(
      'Both source and destination snapshot names are required'
    );
  });
});

describe('formatCopySummary', () => {
  it('formats summary correctly', () => {
    const result = { source: 'dev', dest: 'dev-backup', keyCount: 5 };
    const summary = formatCopySummary(result);
    expect(summary).toContain('dev');
    expect(summary).toContain('dev-backup');
    expect(summary).toContain('5 variable(s) copied');
  });
});
