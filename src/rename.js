const { getSnapshotPath, loadSnapshot, saveSnapshot } = require('./snapshot');
const fs = require('fs');
const path = require('path');

/**
 * Rename a snapshot from oldName to newName.
 * Returns a summary object describing the result.
 */
function renameSnapshot(oldName, newName, options = {}) {
  if (!oldName || !newName) {
    throw new Error('Both oldName and newName are required');
  }

  if (oldName === newName) {
    throw new Error('Old name and new name must be different');
  }

  const oldPath = getSnapshotPath(oldName);
  const newPath = getSnapshotPath(newName);

  if (!fs.existsSync(oldPath)) {
    throw new Error(`Snapshot "${oldName}" does not exist`);
  }

  if (fs.existsSync(newPath) && !options.force) {
    throw new Error(`Snapshot "${newName}" already exists. Use --force to overwrite`);
  }

  const data = loadSnapshot(oldName);

  saveSnapshot(newName, data);
  fs.unlinkSync(oldPath);

  return buildRenameSummary(oldName, newName);
}

function buildRenameSummary(oldName, newName) {
  return {
    oldName,
    newName,
    renamedAt: new Date().toISOString(),
  };
}

function formatRenameSummary(summary) {
  return `Renamed snapshot "${summary.oldName}" → "${summary.newName}"\n` +
    `  At: ${summary.renamedAt}`;
}

module.exports = { renameSnapshot, buildRenameSummary, formatRenameSummary };
