const fs = require('fs');
const path = require('path');
const { loadSnapshot } = require('./snapshot');

/**
 * Validate that all keys in a snapshot exist in the current env file.
 * Returns an object with missing and extra keys.
 */
function validateSnapshot(snapshotName, envFilePath = '.env') {
  const snapshot = loadSnapshot(snapshotName);

  let currentVars = {};
  if (fs.existsSync(envFilePath)) {
    const { parseEnvFile } = require('./env');
    currentVars = parseEnvFile(envFilePath);
  }

  const snapshotKeys = Object.keys(snapshot);
  const currentKeys = Object.keys(currentVars);

  const missingFromEnv = snapshotKeys.filter(k => !currentKeys.includes(k));
  const missingFromSnapshot = currentKeys.filter(k => !snapshotKeys.includes(k));

  return {
    snapshotName,
    envFilePath,
    missingFromEnv,
    missingFromSnapshot,
    valid: missingFromEnv.length === 0 && missingFromSnapshot.length === 0,
  };
}

/**
 * Check that all values in a snapshot are non-empty strings.
 */
function validateSnapshotValues(snapshotName) {
  const snapshot = loadSnapshot(snapshotName);
  const emptyKeys = Object.entries(snapshot)
    .filter(([, v]) => v === '' || v === null || v === undefined)
    .map(([k]) => k);

  return {
    snapshotName,
    emptyKeys,
    valid: emptyKeys.length === 0,
  };
}

/**
 * Format a validation result into a human-readable string.
 */
function formatValidationResult(result) {
  const lines = [];
  if (result.valid) {
    lines.push(`✔  Snapshot "${result.snapshotName}" is valid.`);
  } else {
    lines.push(`✖  Snapshot "${result.snapshotName}" has issues:`);
    if (result.missingFromEnv && result.missingFromEnv.length > 0) {
      lines.push(`  Keys in snapshot missing from env file (${result.envFilePath}):`);
      result.missingFromEnv.forEach(k => lines.push(`    - ${k}`));
    }
    if (result.missingFromSnapshot && result.missingFromSnapshot.length > 0) {
      lines.push(`  Keys in env file not in snapshot:`);
      result.missingFromSnapshot.forEach(k => lines.push(`    - ${k}`));
    }
    if (result.emptyKeys && result.emptyKeys.length > 0) {
      lines.push(`  Keys with empty values:`);
      result.emptyKeys.forEach(k => lines.push(`    - ${k}`));
    }
  }
  return lines.join('\n');
}

module.exports = { validateSnapshot, validateSnapshotValues, formatValidationResult };
