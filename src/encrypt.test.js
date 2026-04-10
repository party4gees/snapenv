const { encryptSnapshot, decryptSnapshot, isEncrypted } = require('./encrypt');

const sampleVars = {
  API_KEY: 'super-secret-123',
  DB_URL: 'postgres://localhost:5432/mydb',
  NODE_ENV: 'production'
};

test('encryptSnapshot returns encrypted payload with expected fields', () => {
  const result = encryptSnapshot(sampleVars, 'mypassphrase');
  expect(result.encrypted).toBe(true);
  expect(result.iv).toBeDefined();
  expect(result.tag).toBeDefined();
  expect(result.data).toBeDefined();
  expect(result.data).not.toContain('super-secret-123');
});

test('decryptSnapshot recovers original vars', () => {
  const payload = encryptSnapshot(sampleVars, 'mypassphrase');
  const recovered = decryptSnapshot(payload, 'mypassphrase');
  expect(recovered).toEqual(sampleVars);
});

test('decryptSnapshot throws on wrong passphrase', () => {
  const payload = encryptSnapshot(sampleVars, 'correctpass');
  expect(() => decryptSnapshot(payload, 'wrongpass')).toThrow(
    'Decryption failed: invalid passphrase or corrupted data'
  );
});

test('decryptSnapshot throws if payload is not encrypted', () => {
  expect(() => decryptSnapshot({ encrypted: false }, 'pass')).toThrow(
    'Snapshot is not encrypted'
  );
});

test('isEncrypted returns true for encrypted payload', () => {
  const payload = encryptSnapshot(sampleVars, 'pass');
  expect(isEncrypted(payload)).toBe(true);
});

test('isEncrypted returns false for plain object', () => {
  expect(isEncrypted({ API_KEY: 'abc' })).toBe(false);
  expect(isEncrypted(null)).toBe(false);
});

test('each encryption produces unique iv', () => {
  const p1 = encryptSnapshot(sampleVars, 'pass');
  const p2 = encryptSnapshot(sampleVars, 'pass');
  expect(p1.iv).not.toBe(p2.iv);
});
