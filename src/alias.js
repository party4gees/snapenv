const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath } = require('./snapshot');

function getAliasesPath(projectDir = process.cwd()) {
  const snapenvDir = path.join(projectDir, '.snapenv');
  return path.join(snapenvDir, 'aliases.json');
}

function loadAliases(projectDir = process.cwd()) {
  const aliasesPath = getAliasesPath(projectDir);
  if (!fs.existsSync(aliasesPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(aliasesPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveAliases(aliases, projectDir = process.cwd()) {
  ensureSnapenvDir(projectDir);
  const aliasesPath = getAliasesPath(projectDir);
  fs.writeFileSync(aliasesPath, JSON.stringify(aliases, null, 2));
}

function addAlias(alias, snapshotName, projectDir = process.cwd()) {
  const snapshotPath = getSnapshotPath(snapshotName, projectDir);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${snapshotName}" does not exist`);
  }
  const aliases = loadAliases(projectDir);
  if (aliases[alias]) {
    throw new Error(`Alias "${alias}" already exists (points to "${aliases[alias]}")`);
  }
  aliases[alias] = snapshotName;
  saveAliases(aliases, projectDir);
  return aliases;
}

function removeAlias(alias, projectDir = process.cwd()) {
  const aliases = loadAliases(projectDir);
  if (!aliases[alias]) {
    throw new Error(`Alias "${alias}" does not exist`);
  }
  delete aliases[alias];
  saveAliases(aliases, projectDir);
  return aliases;
}

function resolveAlias(nameOrAlias, projectDir = process.cwd()) {
  const aliases = loadAliases(projectDir);
  return aliases[nameOrAlias] || nameOrAlias;
}

function getAliasesForSnapshot(snapshotName, projectDir = process.cwd()) {
  const aliases = loadAliases(projectDir);
  return Object.entries(aliases)
    .filter(([, target]) => target === snapshotName)
    .map(([alias]) => alias);
}

function formatAliasList(aliases) {
  const entries = Object.entries(aliases);
  if (entries.length === 0) return 'No aliases defined.';
  return entries.map(([alias, target]) => `  ${alias} -> ${target}`).join('\n');
}

module.exports = {
  getAliasesPath,
  loadAliases,
  saveAliases,
  addAlias,
  removeAlias,
  resolveAlias,
  getAliasesForSnapshot,
  formatAliasList,
};
