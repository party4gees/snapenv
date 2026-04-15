const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir } = require('./snapshot');

function getNotifyConfigPath(baseDir) {
  const dir = ensureSnapenvDir(baseDir);
  return path.join(dir, 'notify.json');
}

function loadNotifyConfig(baseDir) {
  const filePath = getNotifyConfigPath(baseDir);
  if (!fs.existsSync(filePath)) {
    return { events: [], channels: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return { events: [], channels: {} };
  }
}

function saveNotifyConfig(baseDir, config) {
  const filePath = getNotifyConfigPath(baseDir);
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
}

function enableEvent(baseDir, event) {
  const config = loadNotifyConfig(baseDir);
  if (!config.events.includes(event)) {
    config.events.push(event);
    saveNotifyConfig(baseDir, config);
  }
  return config;
}

function disableEvent(baseDir, event) {
  const config = loadNotifyConfig(baseDir);
  config.events = config.events.filter(e => e !== event);
  saveNotifyConfig(baseDir, config);
  return config;
}

function setChannel(baseDir, name, value) {
  const config = loadNotifyConfig(baseDir);
  config.channels[name] = value;
  saveNotifyConfig(baseDir, config);
  return config;
}

function removeChannel(baseDir, name) {
  const config = loadNotifyConfig(baseDir);
  delete config.channels[name];
  saveNotifyConfig(baseDir, config);
  return config;
}

function shouldNotify(baseDir, event) {
  const config = loadNotifyConfig(baseDir);
  return config.events.includes(event);
}

function formatNotifyConfig(config) {
  const lines = [];
  lines.push('Notify config:');
  if (config.events.length === 0) {
    lines.push('  Events: (none)');
  } else {
    lines.push(`  Events: ${config.events.join(', ')}`);
  }
  const channelKeys = Object.keys(config.channels);
  if (channelKeys.length === 0) {
    lines.push('  Channels: (none)');
  } else {
    lines.push('  Channels:');
    channelKeys.forEach(k => lines.push(`    ${k}: ${config.channels[k]}`));
  }
  return lines.join('\n');
}

module.exports = {
  getNotifyConfigPath,
  loadNotifyConfig,
  saveNotifyConfig,
  enableEvent,
  disableEvent,
  setChannel,
  removeChannel,
  shouldNotify,
  formatNotifyConfig,
};
