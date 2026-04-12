const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath } = require('./snapshot');

function getNotesPath(baseDir) {
  return path.join(ensureSnapenvDir(baseDir), 'notes.json');
}

function loadNotes(baseDir) {
  const notesPath = getNotesPath(baseDir);
  if (!fs.existsSync(notesPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(notesPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveNotes(baseDir, notes) {
  const notesPath = getNotesPath(baseDir);
  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
}

function setNote(baseDir, snapshotName, text) {
  const snapshotPath = getSnapshotPath(baseDir, snapshotName);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${snapshotName}" not found`);
  }
  const notes = loadNotes(baseDir);
  notes[snapshotName] = { text, updatedAt: new Date().toISOString() };
  saveNotes(baseDir, notes);
  return notes[snapshotName];
}

function getNote(baseDir, snapshotName) {
  const notes = loadNotes(baseDir);
  return notes[snapshotName] || null;
}

function removeNote(baseDir, snapshotName) {
  const notes = loadNotes(baseDir);
  if (!notes[snapshotName]) return false;
  delete notes[snapshotName];
  saveNotes(baseDir, notes);
  return true;
}

function formatNote(snapshotName, note) {
  if (!note) return `No note for snapshot "${snapshotName}".`;
  return `Note for "${snapshotName}" (${note.updatedAt}):\n  ${note.text}`;
}

module.exports = { getNotesPath, loadNotes, saveNotes, setNote, getNote, removeNote, formatNote };
