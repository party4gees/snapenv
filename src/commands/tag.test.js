const { runTag, printTagUsage } = require('./tag');
const tag = require('../tag');

jest.mock('../tag');

describe('runTag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it('prints usage when no args given', async () => {
    await runTag([]);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });

  it('prints usage for --help flag', async () => {
    await runTag(['--help']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });

  it('adds a tag to a snapshot', async () => {
    tag.addTag.mockResolvedValue();
    await runTag(['add', 'my-snap', 'production']);
    expect(tag.addTag).toHaveBeenCalledWith('my-snap', 'production');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('production'));
  });

  it('errors if add is missing args', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    await runTag(['add', 'my-snap']);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('add requires'));
    mockExit.mockRestore();
  });

  it('removes a tag from a snapshot', async () => {
    tag.removeTag.mockResolvedValue();
    await runTag(['remove', 'my-snap', 'staging']);
    expect(tag.removeTag).toHaveBeenCalledWith('my-snap', 'staging');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('staging'));
  });

  it('errors if remove is missing args', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    await runTag(['remove']);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('remove requires'));
    mockExit.mockRestore();
  });

  it('lists tags for a specific snapshot', async () => {
    tag.getTagsForSnapshot.mockResolvedValue(['prod', 'stable']);
    await runTag(['list', 'my-snap']);
    expect(tag.getTagsForSnapshot).toHaveBeenCalledWith('my-snap');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('prod'));
  });

  it('lists all tags when no snapshot given', async () => {
    tag.listAllTags.mockResolvedValue({ 'snap1': ['prod'], 'snap2': ['dev'] });
    tag.formatTagList.mockReturnValue('snap1: prod\nsnap2: dev');
    await runTag(['list']);
    expect(tag.listAllTags).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('snap1: prod\nsnap2: dev');
  });

  it('exits on unknown subcommand', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    await runTag(['bogus']);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unknown subcommand'));
    mockExit.mockRestore();
  });
});
