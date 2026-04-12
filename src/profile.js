const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath } = require('./snapshot');

function getProfilesPath(baseDir) {
  return path.join(baseDir || ensureSnapenvDir(), 'profiles.json');
}

function loadProfiles(baseDir) {
  const filePath = getProfilesPath(baseDir);
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveProfiles(profiles, baseDir) {
  const filePath = getProfilesPath(baseDir);
  fs.writeFileSync(filePath, JSON.stringify(profiles, null, 2));
}

function createProfile(name, snapshotNames, baseDir) {
  if (!name || typeof name !== 'string') throw new Error('Profile name is required');
  if (!Array.isArray(snapshotNames) || snapshotNames.length === 0) {
    throw new Error('At least one snapshot name is required');
  }
  const profiles = loadProfiles(baseDir);
  if (profiles[name]) throw new Error(`Profile '${name}' already exists`);
  profiles[name] = { snapshots: snapshotNames, createdAt: new Date().toISOString() };
  saveProfiles(profiles, baseDir);
  return profiles[name];
}

function deleteProfile(name, baseDir) {
  const profiles = loadProfiles(baseDir);
  if (!profiles[name]) throw new Error(`Profile '${name}' not found`);
  delete profiles[name];
  saveProfiles(profiles, baseDir);
  return true;
}

function getProfile(name, baseDir) {
  const profiles = loadProfiles(baseDir);
  return profiles[name] || null;
}

function listProfiles(baseDir) {
  return loadProfiles(baseDir);
}

function formatProfileList(profiles) {
  const entries = Object.entries(profiles);
  if (entries.length === 0) return 'No profiles defined.';
  return entries
    .map(([name, data]) => `  ${name}: [${data.snapshots.join(', ')}]  (created ${data.createdAt.slice(0, 10)})`)
    .join('\n');
}

module.exports = {
  getProfilesPath,
  loadProfiles,
  saveProfiles,
  createProfile,
  deleteProfile,
  getProfile,
  listProfiles,
  formatProfileList,
};
