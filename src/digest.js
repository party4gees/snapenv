const crypto = require('crypto');
const { loadSnapshot } = require('./snapshot');

/**
 * Compute a SHA-256 digest of a snapshot's env vars.
 * @param {object} envVars - key/value env map
 * @returns {string} hex digest
 */
function computeDigest(envVars) {
  const sorted = Object.keys(envVars)
    .sort()
    .map(k => `${k}=${envVars[k]}`)
    .join('\n');
  return crypto.createHash('sha256').update(sorted).digest('hex');
}

/**
 * Get digest for a named snapshot.
 * @param {string} snapenvDir
 * @param {string} name
 * @returns {{ name: string, digest: string, keyCount: number }}
 */
function digestSnapshot(snapenvDir, name) {
  const envVars = loadSnapshot(snapenvDir, name);
  const digest = computeDigest(envVars);
  return { name, digest, keyCount: Object.keys(envVars).length };
}

/**
 * Compare digests of two snapshots.
 * @param {string} snapenvDir
 * @param {string} nameA
 * @param {string} nameB
 * @returns {{ match: boolean, digestA: string, digestB: string }}
 */
function compareDigests(snapenvDir, nameA, nameB) {
  const a = digestSnapshot(snapenvDir, nameA);
  const b = digestSnapshot(snapenvDir, nameB);
  return {
    match: a.digest === b.digest,
    digestA: a.digest,
    digestB: b.digest,
  };
}

/**
 * Format digest result for display.
 */
function formatDigestResult({ name, digest, keyCount }) {
  return [
    `Snapshot : ${name}`,
    `Keys     : ${keyCount}`,
    `SHA-256  : ${digest}`,
  ].join('\n');
}

module.exports = { computeDigest, digestSnapshot, compareDigests, formatDigestResult };
