const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath } = require('./snapshot');

function getAuditPath(projectDir) {
  return path.join(ensureSnapenvDir(projectDir), 'audit.json');
}

function loadAuditLog(projectDir) {
  const auditPath = getAuditPath(projectDir);
  if (!fs.existsSync(auditPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  } catch {
    return [];
  }
}

function saveAuditLog(projectDir, entries) {
  const auditPath = getAuditPath(projectDir);
  fs.writeFileSync(auditPath, JSON.stringify(entries, null, 2));
}

function recordAuditEntry(projectDir, action, snapshotName, meta = {}) {
  const entries = loadAuditLog(projectDir);
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    action,
    snapshotName,
    timestamp: new Date().toISOString(),
    user: process.env.USER || process.env.USERNAME || 'unknown',
    ...meta,
  };
  entries.push(entry);
  saveAuditLog(projectDir, entries);
  return entry;
}

function getAuditLog(projectDir, { snapshotName, action, limit } = {}) {
  let entries = loadAuditLog(projectDir);
  if (snapshotName) entries = entries.filter(e => e.snapshotName === snapshotName);
  if (action) entries = entries.filter(e => e.action === action);
  if (limit && limit > 0) entries = entries.slice(-limit);
  return entries;
}

function clearAuditLog(projectDir) {
  saveAuditLog(projectDir, []);
}

function formatAuditLog(entries) {
  if (!entries.length) return 'No audit entries found.';
  return entries.map(e => {
    const ts = new Date(e.timestamp).toLocaleString();
    const meta = e.details ? ` — ${e.details}` : '';
    return `[${ts}] ${e.action.toUpperCase()} "${e.snapshotName}" by ${e.user}${meta}`;
  }).join('\n');
}

module.exports = {
  getAuditPath,
  loadAuditLog,
  saveAuditLog,
  recordAuditEntry,
  getAuditLog,
  clearAuditLog,
  formatAuditLog,
};
