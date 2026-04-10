const fs = require('fs');
const path = require('path');
const { getSnapshotPath } = require('./snapshot');

const HISTORY_FILE = '.snapenv_history.json';

function getHistoryPath(dir = process.cwd()) {
  return path.join(dir, HISTORY_FILE);
}

function loadHistory(dir = process.cwd()) {
  const historyPath = getHistoryPath(dir);
  if (!fs.existsSync(historyPath)) return [];
  try {
    const raw = fs.readFileSync(historyPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveHistory(entries, dir = process.cwd()) {
  const historyPath = getHistoryPath(dir);
  fs.writeFileSync(historyPath, JSON.stringify(entries, null, 2), 'utf8');
}

function recordAction(action, snapshotName, meta = {}) {
  const entries = loadHistory();
  const entry = {
    action,
    snapshotName,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  entries.unshift(entry);
  const trimmed = entries.slice(0, 100);
  saveHistory(trimmed);
  return entry;
}

function getHistory(limit = 20) {
  const entries = loadHistory();
  return entries.slice(0, limit);
}

function clearHistory() {
  saveHistory([]);
}

function formatHistory(entries) {
  if (entries.length === 0) return 'No history found.';
  return entries
    .map((e, i) => {
      const ts = new Date(e.timestamp).toLocaleString();
      const meta = e.envFile ? ` (${e.envFile})` : '';
      return `${String(i + 1).padStart(3)}. [${ts}] ${e.action.toUpperCase()} ${e.snapshotName}${meta}`;
    })
    .join('\n');
}

module.exports = { getHistoryPath, loadHistory, saveHistory, recordAction, getHistory, clearHistory, formatHistory };
