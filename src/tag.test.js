const fs = require('fs');
const path = require('path');
const { addTag, removeTag, getTagsForSnapshot, getSnapshotsByTag, formatTagList } = require('./tag');

jest.mock('fs');
jest.mock('./snapshot', () => ({
  getSnapshotPath: (name) => `.snapenv/${name}.json`,
}));

describe('addTag', () => {
  beforeEach(() => {
    fs.existsSync.mockReset();
    fs.readFileSync.mockReset();
    fs.writeFileSync.mockReset();
    fs.mkdirSync.mockReset();
  });

  it('adds a tag to a snapshot', () => {
    fs.existsSync.mockImplementation((p) => p === '.snapenv/dev.json' || p === '.snapenv');
    fs.readFileSync.mockReturnValue(JSON.stringify({}));
    const result = addTag('dev', 'production');
    expect(result).toEqual({ added: true, tag: 'production', snapshotName: 'dev' });
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('returns added:false if tag already exists', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({ dev: ['production'] }));
    const result = addTag('dev', 'production');
    expect(result).toEqual({ added: false, tag: 'production', snapshotName: 'dev' });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('throws if snapshot does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => addTag('missing', 'mytag')).toThrow('Snapshot "missing" not found');
  });
});

describe('removeTag', () => {
  beforeEach(() => {
    fs.existsSync.mockReset();
    fs.readFileSync.mockReset();
    fs.writeFileSync.mockReset();
  });

  it('removes an existing tag', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({ dev: ['production', 'stable'] }));
    const result = removeTag('dev', 'production');
    expect(result).toEqual({ removed: true, tag: 'production', snapshotName: 'dev' });
  });

  it('returns removed:false if tag not present', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({ dev: ['stable'] }));
    const result = removeTag('dev', 'nope');
    expect(result).toEqual({ removed: false, tag: 'nope', snapshotName: 'dev' });
  });
});

describe('getSnapshotsByTag', () => {
  it('returns all snapshots with the given tag', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({ dev: ['stable'], prod: ['stable', 'live'] }));
    const result = getSnapshotsByTag('stable');
    expect(result).toEqual(['dev', 'prod']);
  });
});

describe('formatTagList', () => {
  it('formats tags nicely', () => {
    expect(formatTagList('dev', ['stable', 'v2'])).toBe('Tags for "dev": #stable, #v2');
  });

  it('handles empty tag list', () => {
    expect(formatTagList('dev', [])).toBe('No tags for "dev"');
  });
});
