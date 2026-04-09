const fs = require('fs');
const path = require('path');
const { renameSnapshot, buildRenameSummary, formatRenameSummary } = require('./rename');
const snapshot = require('./snapshot');

jest.mock('./snapshot');
jest.mock('fs');

describe('renameSnapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    snapshot.getSnapshotPath.mockImplementation((name) => `/tmp/.snapenv/${name}.json`);
    snapshot.loadSnapshot.mockReturnValue({ FOO: 'bar', BAZ: '123' });
    snapshot.saveSnapshot.mockReturnValue(undefined);
    fs.existsSync.mockReturnValue(true);
    fs.unlinkSync.mockReturnValue(undefined);
  });

  it('throws if oldName is missing', () => {
    expect(() => renameSnapshot('', 'new')).toThrow('Both oldName and newName are required');
  });

  it('throws if newName is missing', () => {
    expect(() => renameSnapshot('old', '')).toThrow('Both oldName and newName are required');
  });

  it('throws if oldName equals newName', () => {
    expect(() => renameSnapshot('same', 'same')).toThrow('must be different');
  });

  it('throws if old snapshot does not exist', () => {
    fs.existsSync.mockReturnValueOnce(false);
    expect(() => renameSnapshot('missing', 'new')).toThrow('does not exist');
  });

  it('throws if new snapshot exists without force', () => {
    fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(true);
    expect(() => renameSnapshot('old', 'existing')).toThrow('already exists');
  });

  it('overwrites if new snapshot exists with force', () => {
    fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(true);
    const summary = renameSnapshot('old', 'existing', { force: true });
    expect(snapshot.saveSnapshot).toHaveBeenCalledWith('existing', { FOO: 'bar', BAZ: '123' });
    expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/.snapenv/old.json');
    expect(summary.newName).toBe('existing');
  });

  it('renames successfully', () => {
    fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);
    const summary = renameSnapshot('old', 'new');
    expect(snapshot.saveSnapshot).toHaveBeenCalledWith('new', { FOO: 'bar', BAZ: '123' });
    expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/.snapenv/old.json');
    expect(summary.oldName).toBe('old');
    expect(summary.newName).toBe('new');
  });
});

describe('formatRenameSummary', () => {
  it('formats summary correctly', () => {
    const summary = buildRenameSummary('alpha', 'beta');
    const output = formatRenameSummary(summary);
    expect(output).toContain('alpha');
    expect(output).toContain('beta');
    expect(output).toContain('→');
  });
});
