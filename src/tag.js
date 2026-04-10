const fs = require('fs');
const path = require('path');
const { getSnapshotPath, loadSnapshot, saveSnapshot } = require('./snapshot');

const TAGS_FILE = '.snapenv/tags.json';

function loadTagsFile() {
  if (!fs.existsSync(TAGS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(TAGS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveTagsFile(tags) {
  const dir = path.dirname(TAGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TAGS_FILE, JSON.stringify(tags, null, 2));
}

function addTag(snapshotName, tag) {
  const snapshotPath = getSnapshotPath(snapshotName);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${snapshotName}" not found`);
  }
  const tags = loadTagsFile();
  if (!tags[snapshotName]) tags[snapshotName] = [];
  if (tags[snapshotName].includes(tag)) {
    return { added: false, tag, snapshotName };
  }
  tags[snapshotName].push(tag);
  saveTagsFile(tags);
  return { added: true, tag, snapshotName };
}

function removeTag(snapshotName, tag) {
  const tags = loadTagsFile();
  if (!tags[snapshotName] || !tags[snapshotName].includes(tag)) {
    return { removed: false, tag, snapshotName };
  }
  tags[snapshotName] = tags[snapshotName].filter(t => t !== tag);
  if (tags[snapshotName].length === 0) delete tags[snapshotName];
  saveTagsFile(tags);
  return { removed: true, tag, snapshotName };
}

function getTagsForSnapshot(snapshotName) {
  const tags = loadTagsFile();
  return tags[snapshotName] || [];
}

function getSnapshotsByTag(tag) {
  const tags = loadTagsFile();
  return Object.entries(tags)
    .filter(([, tagList]) => tagList.includes(tag))
    .map(([name]) => name);
}

function formatTagList(snapshotName, tagList) {
  if (tagList.length === 0) return `No tags for "${snapshotName}"`;
  return `Tags for "${snapshotName}": ${tagList.map(t => `#${t}`).join(', ')}`;
}

module.exports = {
  addTag,
  removeTag,
  getTagsForSnapshot,
  getSnapshotsByTag,
  formatTagList,
  loadTagsFile,
};
