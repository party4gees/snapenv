const fs = require('fs');
const path = require('path');
const { getSnapshotPath, loadSnapshot, listSnapshots } = require('./snapshot');

const ARCHIVE_DIR = '.snapenv/archive';

function getArchiveDir(baseDir = process.cwd()) {
  return path.join(baseDir, ARCHIVE_DIR);
}

function ensureArchiveDir(baseDir = process.cwd()) {
  const dir = getArchiveDir(baseDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function archiveSnapshot(name, baseDir = process.cwd()) {
  const snapshotPath = getSnapshotPath(name, baseDir);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${name}" not found`);
  }

  const archiveDir = ensureArchiveDir(baseDir);
  const timestamp = Date.now();
  const archiveName = `${name}.${timestamp}.json`;
  const archivePath = path.join(archiveDir, archiveName);

  fs.copyFileSync(snapshotPath, archivePath);
  fs.unlinkSync(snapshotPath);

  return { name, archiveName, archivedAt: new Date(timestamp).toISOString() };
}

function listArchived(baseDir = process.cwd()) {
  const archiveDir = getArchiveDir(baseDir);
  if (!fs.existsSync(archiveDir)) return [];

  return fs.readdirSync(archiveDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const match = f.match(/^(.+)\.(\d+)\.json$/);
      if (!match) return null;
      const [, name, ts] = match;
      return { name, archiveName: f, archivedAt: new Date(Number(ts)).toISOString() };
    })
    .filter(Boolean)
    .sort((a, b) => a.archivedAt.localeCompare(b.archivedAt));
}

function restoreFromArchive(archiveName, baseDir = process.cwd()) {
  const archiveDir = getArchiveDir(baseDir);
  const archivePath = path.join(archiveDir, archiveName);
  if (!fs.existsSync(archivePath)) {
    throw new Error(`Archived snapshot "${archiveName}" not found`);
  }

  const match = archiveName.match(/^(.+)\.(\d+)\.json$/);
  if (!match) throw new Error(`Invalid archive filename: ${archiveName}`);
  const [, name] = match;

  const destPath = getSnapshotPath(name, baseDir);
  if (fs.existsSync(destPath)) {
    throw new Error(`Snapshot "${name}" already exists. Delete or rename it first.`);
  }

  fs.copyFileSync(archivePath, destPath);
  fs.unlinkSync(archivePath);

  return { name, restoredFrom: archiveName };
}

function formatArchiveList(entries) {
  if (entries.length === 0) return 'No archived snapshots found.';
  const lines = entries.map(e => `  ${e.name.padEnd(24)} archived: ${e.archivedAt}  (${e.archiveName})`);
  return `Archived snapshots (${entries.length}):\n${lines.join('\n')}`;
}

module.exports = {
  getArchiveDir,
  ensureArchiveDir,
  archiveSnapshot,
  listArchived,
  restoreFromArchive,
  formatArchiveList,
};
