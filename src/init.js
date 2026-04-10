const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir } = require('./snapshot');

const DEFAULT_CONFIG = {
  defaultEnvFile: '.env',
  snapshotDir: '.snapenv',
  maxSnapshots: 50,
  autoTag: false
};

const getConfigPath = (projectDir = process.cwd()) =>
  path.join(projectDir, '.snapenv', 'config.json');

function loadConfig(projectDir = process.cwd()) {
  const configPath = getConfigPath(projectDir);
  if (!fs.existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(config, projectDir = process.cwd()) {
  ensureSnapenvDir(projectDir);
  const configPath = getConfigPath(projectDir);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

function initProject(options = {}, projectDir = process.cwd()) {
  ensureSnapenvDir(projectDir);
  const existing = loadConfig(projectDir);
  const merged = { ...existing, ...options };
  saveConfig(merged, projectDir);
  return merged;
}

function isInitialized(projectDir = process.cwd()) {
  return fs.existsSync(path.join(projectDir, '.snapenv'));
}

function formatInitSummary(config, alreadyExisted) {
  const lines = [];
  lines.push(alreadyExisted ? 'snapenv already initialized — config updated.' : 'snapenv initialized successfully.');
  lines.push(`  env file   : ${config.defaultEnvFile}`);
  lines.push(`  snapshot dir: ${config.snapshotDir}`);
  lines.push(`  max snapshots: ${config.maxSnapshots}`);
  return lines.join('\n');
}

module.exports = { getConfigPath, loadConfig, saveConfig, initProject, isInitialized, formatInitSummary, DEFAULT_CONFIG };
