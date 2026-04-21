const { loadSnapshot } = require('./snapshot');
const { parseEnvFile } = require('./env');
const path = require('path');
const fs = require('fs');

/**
 * Check which required keys from a snapshot are missing in the current env file.
 */
function checkMissingKeys(snapshotVars, envVars) {
  const missing = [];
  for (const key of Object.keys(snapshotVars)) {
    if (!(key in envVars)) {
      missing.push(key);
    }
  }
  return missing;
}

/**
 * Check which keys have different values between snapshot and env file.
 */
function checkMismatchedValues(snapshotVars, envVars) {
  const mismatched = [];
  for (const key of Object.keys(snapshotVars)) {
    if (key in envVars && envVars[key] !== snapshotVars[key]) {
      mismatched.push({ key, expected: snapshotVars[key], actual: envVars[key] });
    }
  }
  return mismatched;
}

/**
 * Run an env health check comparing a snapshot against a .env file.
 */
function envCheck(snapshotVars, envVars) {
  const missing = checkMissingKeys(snapshotVars, envVars);
  const mismatched = checkMismatchedValues(snapshotVars, envVars);
  const ok = missing.length === 0 && mismatched.length === 0;
  return { ok, missing, mismatched };
}

/**
 * Format the result of an env check into a human-readable string.
 */
function formatEnvCheckResult(result, snapshotName) {
  const lines = [];
  lines.push(`Env check against snapshot "${snapshotName}":`);
  if (result.ok) {
    lines.push('  ✓ All keys present and matching.');
    return lines.join('\n');
  }
  if (result.missing.length > 0) {
    lines.push(`  Missing keys (${result.missing.length}):`);
    for (const key of result.missing) {
      lines.push(`    - ${key}`);
    }
  }
  if (result.mismatched.length > 0) {
    lines.push(`  Mismatched values (${result.mismatched.length}):`);
    for (const { key, expected, actual } of result.mismatched) {
      lines.push(`    ~ ${key}: expected "${expected}", got "${actual}"`);
    }
  }
  return lines.join('\n');
}

module.exports = { checkMissingKeys, checkMismatchedValues, envCheck, formatEnvCheckResult };
