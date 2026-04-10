const { runEncrypt, printEncryptUsage } = require('./encrypt');
const { encryptSnapshot, decryptSnapshot, isEncrypted } = require('../encrypt');
const { loadSnapshot, saveSnapshot } = require('../snapshot');

jest.mock('../encrypt');
jest.mock('../snapshot');

describe('runEncrypt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prints usage when no args provided', async () => {
    await runEncrypt([]);
    expect(console.log).toHaveBeenCalled();
  });

  it('errors when snapshot name is missing', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(runEncrypt(['lock'])).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith('Error: snapshot name is required.');
    exitSpy.mockRestore();
  });

  it('errors when snapshot not found', async () => {
    loadSnapshot.mockReturnValue(null);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(runEncrypt(['lock', 'missing', '--passphrase', 'secret'])).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith('Error: snapshot "missing" not found.');
    exitSpy.mockRestore();
  });

  it('reports status as not encrypted', async () => {
    loadSnapshot.mockReturnValue({ vars: { FOO: 'bar' } });
    isEncrypted.mockReturnValue(false);
    await runEncrypt(['status', 'mysnap']);
    expect(console.log).toHaveBeenCalledWith('Snapshot "mysnap" is not encrypted.');
  });

  it('reports status as encrypted', async () => {
    loadSnapshot.mockReturnValue({ encrypted: true });
    isEncrypted.mockReturnValue(true);
    await runEncrypt(['status', 'mysnap']);
    expect(console.log).toHaveBeenCalledWith('Snapshot "mysnap" is encrypted.');
  });

  it('encrypts a snapshot with lock subcommand', async () => {
    const fakeData = { vars: { FOO: 'bar' } };
    const fakeEncrypted = { encrypted: true, data: 'abc' };
    loadSnapshot.mockReturnValue(fakeData);
    isEncrypted.mockReturnValue(false);
    encryptSnapshot.mockReturnValue(fakeEncrypted);
    await runEncrypt(['lock', 'mysnap', '--passphrase', 'secret']);
    expect(encryptSnapshot).toHaveBeenCalledWith(fakeData, 'secret');
    expect(saveSnapshot).toHaveBeenCalledWith('mysnap', fakeEncrypted);
    expect(console.log).toHaveBeenCalledWith('Snapshot "mysnap" encrypted successfully.');
  });

  it('decrypts a snapshot with unlock subcommand', async () => {
    const fakeEncrypted = { encrypted: true, data: 'abc' };
    const fakeDecrypted = { vars: { FOO: 'bar' } };
    loadSnapshot.mockReturnValue(fakeEncrypted);
    isEncrypted.mockReturnValue(true);
    decryptSnapshot.mockReturnValue(fakeDecrypted);
    await runEncrypt(['unlock', 'mysnap', '--passphrase', 'secret']);
    expect(decryptSnapshot).toHaveBeenCalledWith(fakeEncrypted, 'secret');
    expect(saveSnapshot).toHaveBeenCalledWith('mysnap', fakeDecrypted);
    expect(console.log).toHaveBeenCalledWith('Snapshot "mysnap" decrypted successfully.');
  });

  it('errors if locking already encrypted snapshot', async () => {
    loadSnapshot.mockReturnValue({ encrypted: true });
    isEncrypted.mockReturnValue(true);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(runEncrypt(['lock', 'mysnap', '--passphrase', 'secret'])).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith('Error: snapshot "mysnap" is already encrypted.');
    exitSpy.mockRestore();
  });
});
