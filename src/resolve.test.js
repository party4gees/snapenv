const { resolveSnapshotName, formatResolution } = require('./resolve');

jest.mock('./alias');
jest.mock('./list');
jest.mock('./tag');

const { loadAliases, resolveAlias } = require('./alias');
const { listSnapshotsWithMeta } = require('./list');
const { getTagsForSnapshot } = require('./tag');

const fakeSnaps = [
  { name: 'prod' },
  { name: 'staging' },
  { name: 'dev' },
];

beforeEach(() => {
  listSnapshotsWithMeta.mockResolvedValue(fakeSnaps);
  loadAliases.mockResolvedValue({});
  resolveAlias.mockReturnValue(null);
  getTagsForSnapshot.mockResolvedValue([]);
});

test('resolves direct snapshot name', async () => {
  const result = await resolveSnapshotName('prod', '/tmp/snapenv');
  expect(result).toEqual({ resolved: 'prod', via: 'direct' });
});

test('resolves via alias', async () => {
  loadAliases.mockResolvedValue({ p: 'prod' });
  resolveAlias.mockReturnValue('prod');
  const result = await resolveSnapshotName('p', '/tmp/snapenv');
  expect(result).toEqual({ resolved: 'prod', via: 'alias', alias: 'p' });
});

test('resolves via tag when exactly one match', async () => {
  getTagsForSnapshot.mockImplementation(async (dir, name) =>
    name === 'staging' ? ['release'] : []
  );
  const result = await resolveSnapshotName('release', '/tmp/snapenv');
  expect(result).toEqual({ resolved: 'staging', via: 'tag', tag: 'release' });
});

test('throws on ambiguous tag', async () => {
  getTagsForSnapshot.mockResolvedValue(['shared']);
  await expect(resolveSnapshotName('shared', '/tmp/snapenv')).rejects.toThrow(
    'Ambiguous tag'
  );
});

test('throws when nothing matches', async () => {
  await expect(resolveSnapshotName('ghost', '/tmp/snapenv')).rejects.toThrow(
    'Cannot resolve snapshot'
  );
});

test('throws when no identifier provided', async () => {
  await expect(resolveSnapshotName(null, '/tmp/snapenv')).rejects.toThrow(
    'No snapshot identifier provided'
  );
});

test('formatResolution direct', () => {
  expect(formatResolution({ resolved: 'prod', via: 'direct' })).toBe('Resolved: prod');
});

test('formatResolution alias', () => {
  expect(formatResolution({ resolved: 'prod', via: 'alias', alias: 'p' })).toBe(
    'Resolved: prod (via alias "p")'
  );
});

test('formatResolution tag', () => {
  expect(formatResolution({ resolved: 'staging', via: 'tag', tag: 'release' })).toBe(
    'Resolved: staging (via tag "release")'
  );
});
