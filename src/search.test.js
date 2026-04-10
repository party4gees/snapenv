const { searchByKey, searchByValue, formatSearchResults } = require('./search');
const { listSnapshotsWithMeta } = require('./list');
const { loadSnapshot } = require('./snapshot');

jest.mock('./list');
jest.mock('./snapshot');

const mockSnapshots = [
  { name: 'dev', createdAt: new Date() },
  { name: 'prod', createdAt: new Date() },
];

const mockVarsDev = { DATABASE_URL: 'postgres://localhost', NODE_ENV: 'development' };
const mockVarsProd = { DATABASE_URL: 'postgres://prod-host', NODE_ENV: 'production', SECRET_KEY: 'abc' };

beforeEach(() => {
  listSnapshotsWithMeta.mockResolvedValue(mockSnapshots);
  loadSnapshot.mockImplementation((dir, name) => {
    if (name === 'dev') return Promise.resolve(mockVarsDev);
    if (name === 'prod') return Promise.resolve(mockVarsProd);
    return Promise.resolve({});
  });
});

test('searchByKey finds snapshots containing matching key', async () => {
  const results = await searchByKey('/fake', 'DATABASE');
  expect(results).toHaveLength(2);
  expect(results[0].snapshot).toBe('dev');
  expect(results[0].keys).toContain('DATABASE_URL');
});

test('searchByKey returns empty when no match', async () => {
  const results = await searchByKey('/fake', 'NONEXISTENT_KEY');
  expect(results).toHaveLength(0);
});

test('searchByKey is case-insensitive', async () => {
  const results = await searchByKey('/fake', 'secret');
  expect(results).toHaveLength(1);
  expect(results[0].snapshot).toBe('prod');
});

test('searchByValue finds snapshots with matching value', async () => {
  const results = await searchByValue('/fake', 'production');
  expect(results).toHaveLength(1);
  expect(results[0].snapshot).toBe('prod');
});

test('searchByValue returns empty when no match', async () => {
  const results = await searchByValue('/fake', 'zzznomatch');
  expect(results).toHaveLength(0);
});

test('formatSearchResults shows message when no results', () => {
  const output = formatSearchResults([], 'FOO');
  expect(output).toMatch(/No snapshots found/);
});

test('formatSearchResults lists snapshot names and keys', () => {
  const results = [{ snapshot: 'dev', keys: ['DATABASE_URL'] }];
  const output = formatSearchResults(results, 'DATABASE');
  expect(output).toMatch('dev');
  expect(output).toMatch('DATABASE_URL');
});
