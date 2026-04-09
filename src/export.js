const fs = require('fs');
const path = require('path');
const { loadSnapshot } = require('./snapshot');
const { serializeEnvVars } = require('./env');

/**
 * Export a snapshot to various formats
 * @param {string} snapshotName - Name of the snapshot to export
 * @param {string} format - Export format (env, json, shell)
 * @returns {string} Exported content
 */
function exportSnapshot(snapshotName, format = 'env') {
  const snapshot = loadSnapshot(snapshotName);
  
  if (!snapshot) {
    throw new Error(`Snapshot '${snapshotName}' not found`);
  }

  switch (format.toLowerCase()) {
    case 'json':
      return exportToJson(snapshot);
    case 'shell':
    case 'sh':
      return exportToShell(snapshot);
    case 'env':
    case 'dotenv':
    default:
      return exportToDotenv(snapshot);
  }
}

/**
 * Export to .env format
 */
function exportToDotenv(snapshot) {
  return serializeEnvVars(snapshot.vars);
}

/**
 * Export to JSON format
 */
function exportToJson(snapshot) {
  return JSON.stringify({
    name: snapshot.name,
    timestamp: snapshot.timestamp,
    variables: snapshot.vars
  }, null, 2);
}

/**
 * Export to shell export format
 */
function exportToShell(snapshot) {
  const lines = Object.entries(snapshot.vars).map(([key, value]) => {
    // Escape single quotes in value
    const escapedValue = value.replace(/'/g, "'\\''");
    return `export ${key}='${escapedValue}'`;
  });
  return lines.join('\n');
}

/**
 * Write exported snapshot to file
 */
function exportToFile(snapshotName, outputPath, format = 'env') {
  const content = exportSnapshot(snapshotName, format);
  fs.writeFileSync(outputPath, content, 'utf8');
  return {
    snapshot: snapshotName,
    format,
    output: outputPath,
    size: content.length
  };
}

/**
 * Format export summary for display
 */
function formatExportSummary(summary) {
  return [
    `Exported snapshot '${summary.snapshot}' to ${summary.format.toUpperCase()}`,
    `Output: ${summary.output}`,
    `Size: ${summary.size} bytes`
  ].join('\n');
}

module.exports = {
  exportSnapshot,
  exportToDotenv,
  exportToJson,
  exportToShell,
  exportToFile,
  formatExportSummary
};
