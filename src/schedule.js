const fs = require('fs');
const path = require('path');
const { getSnapenvDir } = require('./snapshot');

function getSchedulePath(projectDir) {
  return path.join(getSnapenvDir(projectDir), 'schedules.json');
}

function loadSchedules(projectDir) {
  const schedulePath = getSchedulePath(projectDir);
  if (!fs.existsSync(schedulePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveSchedules(projectDir, schedules) {
  const schedulePath = getSchedulePath(projectDir);
  fs.writeFileSync(schedulePath, JSON.stringify(schedules, null, 2));
}

function addSchedule(projectDir, name, snapshotName, cronExpr, action = 'restore') {
  const schedules = loadSchedules(projectDir);
  schedules[name] = {
    snapshotName,
    cron: cronExpr,
    action,
    createdAt: new Date().toISOString(),
    lastRun: null,
  };
  saveSchedules(projectDir, schedules);
  return schedules[name];
}

function removeSchedule(projectDir, name) {
  const schedules = loadSchedules(projectDir);
  if (!schedules[name]) return false;
  delete schedules[name];
  saveSchedules(projectDir, schedules);
  return true;
}

function getSchedule(projectDir, name) {
  const schedules = loadSchedules(projectDir);
  return schedules[name] || null;
}

function listSchedules(projectDir) {
  const schedules = loadSchedules(projectDir);
  return Object.entries(schedules).map(([name, data]) => ({ name, ...data }));
}

function formatScheduleList(schedules) {
  if (schedules.length === 0) return 'No schedules defined.';
  return schedules
    .map(s => `  ${s.name}  [${s.cron}]  ${s.action} -> ${s.snapshotName}  (last run: ${s.lastRun || 'never'})`)
    .join('\n');
}

module.exports = {
  getSchedulePath,
  loadSchedules,
  saveSchedules,
  addSchedule,
  removeSchedule,
  getSchedule,
  listSchedules,
  formatScheduleList,
};
