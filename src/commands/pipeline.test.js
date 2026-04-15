const { runPipelineCommand, printPipelineUsage } = require('./pipeline');
const pipeline = require('../pipeline');

jest.mock('../pipeline', () => ({
  buildPipeline: jest.fn(),
  runPipeline: jest.fn(),
  formatPipelineResult: jest.fn(() => 'Pipeline result:\n  ✔ base — 2 var(s) applied'),
}));

jest.mock('../init', () => ({ loadConfig: jest.fn().mockResolvedValue({}) }));

const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
  pipeline.runPipeline.mockResolvedValue([{ name: 'base', status: 'applied', count: 2 }]);
});

describe('runPipelineCommand', () => {
  test('prints usage when no args', async () => {
    await runPipelineCommand([]);
    expect(consoleSpy).toHaveBeenCalled();
    expect(pipeline.runPipeline).not.toHaveBeenCalled();
  });

  test('prints usage on --help', async () => {
    await runPipelineCommand(['--help']);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('runs pipeline with single snapshot', async () => {
    await runPipelineCommand(['base']);
    expect(pipeline.runPipeline).toHaveBeenCalledWith(
      ['base'],
      expect.any(String),
      expect.objectContaining({ continueOnError: false })
    );
  });

  test('runs pipeline with multiple snapshots', async () => {
    await runPipelineCommand(['base', 'dev']);
    expect(pipeline.runPipeline).toHaveBeenCalledWith(
      ['base', 'dev'],
      expect.any(String),
      expect.anything()
    );
  });

  test('applies --keys to last step', async () => {
    await runPipelineCommand(['base', 'dev', '--keys', 'PORT,HOST']);
    const call = pipeline.runPipeline.mock.calls[0][0];
    expect(call[1]).toEqual({ name: 'dev', keys: ['PORT', 'HOST'] });
    expect(call[0]).toBe('base');
  });

  test('passes continueOnError flag', async () => {
    await runPipelineCommand(['base', '--continue-on-error']);
    expect(pipeline.runPipeline).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ continueOnError: true })
    );
  });

  test('handles pipeline error gracefully', async () => {
    pipeline.runPipeline.mockRejectedValue(new Error('Snapshot not found: ghost'));
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(runPipelineCommand(['ghost'])).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Pipeline failed'));
    exitSpy.mockRestore();
  });
});
