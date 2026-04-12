const fs = require('fs');
const path = require('path');
const { loadConfig } = require('./init');

const HOOK_EVENTS = ['pre-snapshot', 'post-snapshot', 'pre-restore', 'post-restore'];

function getHooksPath(projectDir) {
  const dir = projectDir || process.cwd();
  return path.join(dir, '.snapenv', 'hooks.json');
}

function loadHooks(projectDir) {
  const hooksPath = getHooksPath(projectDir);
  if (!fs.existsSync(hooksPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveHooks(hooks, projectDir) {
  const hooksPath = getHooksPath(projectDir);
  fs.writeFileSync(hooksPath, JSON.stringify(hooks, null, 2));
}

function setHook(event, command, projectDir) {
  if (!HOOK_EVENTS.includes(event)) {
    throw new Error(`Unknown hook event: ${event}. Valid events: ${HOOK_EVENTS.join(', ')}`);
  }
  const hooks = loadHooks(projectDir);
  hooks[event] = command;
  saveHooks(hooks, projectDir);
  return hooks;
}

function removeHook(event, projectDir) {
  const hooks = loadHooks(projectDir);
  if (!hooks[event]) throw new Error(`No hook set for event: ${event}`);
  delete hooks[event];
  saveHooks(hooks, projectDir);
  return hooks;
}

function getHook(event, projectDir) {
  const hooks = loadHooks(projectDir);
  return hooks[event] || null;
}

function runHook(event, context, projectDir) {
  const command = getHook(event, projectDir);
  if (!command) return { ran: false, event };
  const { execSync } = require('child_process');
  const env = { ...process.env, ...context };
  try {
    execSync(command, { env, stdio: 'inherit' });
    return { ran: true, event, command, success: true };
  } catch (err) {
    return { ran: true, event, command, success: false, error: err.message };
  }
}

function formatHookList(hooks) {
  if (Object.keys(hooks).length === 0) return 'No hooks configured.';
  return HOOK_EVENTS
    .filter(e => hooks[e])
    .map(e => `  ${e}: ${hooks[e]}`)
    .join('\n');
}

module.exports = {
  HOOK_EVENTS,
  getHooksPath,
  loadHooks,
  saveHooks,
  setHook,
  removeHook,
  getHook,
  runHook,
  formatHookList,
};
