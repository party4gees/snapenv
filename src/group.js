const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath } = require('./snapshot');

function getGroupsPath(dir) {
  return path.join(dir || ensureSnapenvDir(), 'groups.json');
}

function loadGroups(dir) {
  const filePath = getGroupsPath(dir);
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveGroups(groups, dir) {
  const filePath = getGroupsPath(dir);
  fs.writeFileSync(filePath, JSON.stringify(groups, null, 2));
}

function createGroup(name, snapshots, dir) {
  const groups = loadGroups(dir);
  if (groups[name]) throw new Error(`Group "${name}" already exists`);
  groups[name] = { snapshots: snapshots || [], createdAt: new Date().toISOString() };
  saveGroups(groups, dir);
  return groups[name];
}

function deleteGroup(name, dir) {
  const groups = loadGroups(dir);
  if (!groups[name]) throw new Error(`Group "${name}" not found`);
  delete groups[name];
  saveGroups(groups, dir);
}

function addSnapshotToGroup(groupName, snapshotName, dir) {
  const groups = loadGroups(dir);
  if (!groups[groupName]) throw new Error(`Group "${groupName}" not found`);
  if (groups[groupName].snapshots.includes(snapshotName)) return groups[groupName];
  groups[groupName].snapshots.push(snapshotName);
  saveGroups(groups, dir);
  return groups[groupName];
}

function removeSnapshotFromGroup(groupName, snapshotName, dir) {
  const groups = loadGroups(dir);
  if (!groups[groupName]) throw new Error(`Group "${groupName}" not found`);
  groups[groupName].snapshots = groups[groupName].snapshots.filter(s => s !== snapshotName);
  saveGroups(groups, dir);
  return groups[groupName];
}

function getGroup(name, dir) {
  const groups = loadGroups(dir);
  return groups[name] || null;
}

function listGroups(dir) {
  return loadGroups(dir);
}

function formatGroupList(groups) {
  const names = Object.keys(groups);
  if (names.length === 0) return 'No groups defined.';
  return names.map(name => {
    const g = groups[name];
    const count = g.snapshots.length;
    return `  ${name} (${count} snapshot${count !== 1 ? 's' : ''})`;
  }).join('\n');
}

module.exports = {
  getGroupsPath,
  loadGroups,
  saveGroups,
  createGroup,
  deleteGroup,
  addSnapshotToGroup,
  removeSnapshotFromGroup,
  getGroup,
  listGroups,
  formatGroupList
};
