const fs = require('fs');
const path = require('path');

/**
 * Parse a .env file into a key-value object
 * @param {string} filePath - path to .env file
 * @returns {Object} parsed env vars
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return parseEnvString(content);
}

/**
 * Parse a raw .env string into a key-value object
 * @param {string} content - raw .env content
 * @returns {Object} parsed env vars
 */
function parseEnvString(content) {
  const result = {};

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Serialize a key-value object to .env file format
 * @param {Object} vars - env vars object
 * @returns {string} .env formatted string
 */
function serializeEnvVars(vars) {
  return Object.entries(vars)
    .map(([key, value]) => {
      const needsQuotes = /\s|#|"/.test(value);
      const serializedValue = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
      return `${key}=${serializedValue}`;
    })
    .join('\n') + '\n';
}

/**
 * Write env vars to a .env file
 * @param {string} filePath - destination path
 * @param {Object} vars - env vars to write
 */
function writeEnvFile(filePath, vars) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, serializeEnvVars(vars), 'utf8');
}

module.exports = { parseEnvFile, parseEnvString, serializeEnvVars, writeEnvFile };
