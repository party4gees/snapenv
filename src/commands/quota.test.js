const { runQuota, printQuotaUsage } = require('./quota');
const quota = require('../quota');

jest.mock('../quota');

describe('runQuota', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it('prints usage when no subcommand given', async () => {
    const result = await runQuota([]);
    expect(result.success).toBe(true);
    expect(console.log).toHaveBeenCalled();
  });

  it('prints usage when --help flag passed', async () => {
    const result = await runQuota(['status'], { help: true });
    expect(result.success).toBe(true);
  });

  it('sets quota with valid bytes', async () => {
    quota.setQuota.mockResolvedValue(undefined);
    const result = await runQuota(['set', '5242880']);
    expect(quota.setQuota).toHaveBeenCalledWith(5242880);
    expect(result.success).toBe(true);
    expect(result.bytes).toBe(5242880);
  });

  it('returns error for invalid bytes in set', async () => {
    const result = await runQuota(['set', 'notanumber']);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/invalid/);
    expect(quota.setQuota).not.toHaveBeenCalled();
  });

  it('returns error for zero bytes in set', async () => {
    const result = await runQuota(['set', '0']);
    expect(result.success).toBe(false);
  });

  it('shows status', async () => {
    const fakeResult = { used: 1024, limit: 10240, withinQuota: true };
    quota.checkQuota.mockResolvedValue(fakeResult);
    quota.formatQuotaStatus.mockReturnValue('Usage: 1024 / 10240 bytes');
    const result = await runQuota(['status']);
    expect(quota.checkQuota).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.result).toEqual(fakeResult);
  });

  it('clears quota limit', async () => {
    quota.loadQuota.mockResolvedValue({ limit: 5000 });
    quota.saveQuota.mockResolvedValue(undefined);
    const result = await runQuota(['clear']);
    expect(quota.saveQuota).toHaveBeenCalledWith({ limit: null });
    expect(result.success).toBe(true);
  });

  it('returns error for unknown subcommand', async () => {
    const result = await runQuota(['unknown']);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/unknown subcommand/);
  });
});
