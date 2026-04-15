const fs = require('fs');
const path = require('path');
const { parseEnvFile, parseEnvString } = require('./env');
const { saveSnapshot } = require('./snapshot');

/**
 * Import environment variables from various formats into a snapshot
 * @param {string} sourcePath - Path to the file to import
 * @param {string} format - Format of the source file (auto, dotenv, json, shell)
 * @returns {Object} Parsed environment variables
 */
function importFromFile(sourcePath, format = 'auto') {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file not found: ${sourcePath}`);
  }

  const content = fs.readFileSync(sourcePath, 'utf8');
  const ext = path.extname(sourcePath).toLowerCase();

  // Auto-detect format based on extension if not specified
  if (format === 'auto') {
    if (ext === '.json') {
      format = 'json';
    } else if (ext === '.sh' || ext === '.bash') {
      format = 'shell';
    } else {
      format = 'dotenv';
    }
  }

  return parseImportFormat(content, format);
}

/**
 * Parse content based on format
 * @param {string} content - File content
 * @param {string} format - Format type
 * @returns {Object} Parsed environment variables
 */
function parseImportFormat(content, format) {
  switch (format) {
    case 'json':
      return parseJsonFormat(content);
    case 'shell':
      return parseShellFormat(content);
    case 'dotenv':
    default:
      return parseEnvString(content);
  }
}

/**
 * Parse JSON format
 * @param {string} content - JSON content
 * @returns {Object} Environment variables
 * @throws {Error} If content is not valid JSON or does not contain an object
 */
function parseJsonFormat(content) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${e.message}`);
  }

  if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
    throw new Error('JSON import must be an object');
  }

  // Handle both {"KEY": "value"} and {"env": {"KEY": "value"}}
  const vars = parsed.env || parsed;

  if (typeof vars !== 'object' || Array.isArray(vars) || vars === null) {
    throw new Error('JSON import must contain an object of key-value pairs');
  }

  return vars;
}

/**
 * Parse shell export format
 * @param {string} content - Shell script content
 * @returns {Object} Environment variables
 */
function parseShellFormat(content) {
  const envVars = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Match: export KEY=value or export KEY="value"
    const match = trimmed.match(/^export\s+([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2];
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  }

  return envVars;
}

module.exports = {
  importFromFile,
  parseImportFormat,
  parseJsonFormat,
  parseShellFormat
};
