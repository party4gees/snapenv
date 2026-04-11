const { printWatchUsage, runWatch } = require('./watch');

describe('printWatchUsage', () => {
  test('prints usage info', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printWatchUsage();
    expect(spy).toHaveBeenCalled();
    const output = spy.mock.calls.flat().join(' ');
    expect(output).toContain('watch');
    expect(output).toContain('snapshot-name');
    spy.mockRestore();
  });
});

describe('runWatch', () => {
  test('prints usage when --help is passed', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    runWatch(['--help']);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('prints usage when no args', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    runWatch([]);
    spy.mockRestore();
  });

  test('exits with error when snapshot name is missing', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    expect(() => runWatch([])).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);

    errSpy.mockRestore();
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test('exits with error when env file does not exist', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    expect(() => runWatch(['my-snap', '--file', '/no/such/.env'])).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);

    errSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
