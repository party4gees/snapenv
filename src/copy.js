import { getSnapshotPath, loadSnapshot, saveSnapshot, listSnapshots } from './snapshot.js';
import path from 'path';
import fs from 'fs/promises';

export async function copySnapshot(source, destination, options = {}) {
  const { force = false } = options;

  const sourceData = await loadSnapshot(source);
  if (!sourceData) {
    throw new Error(`Snapshot "${source}" not found`);
  }

  const existing = await listSnapshots();
  if (existing.includes(destination) && !force) {
    throw new Error(
      `Snapshot "${destination}" already exists. Use --force to overwrite.`
    );
  }

  await saveSnapshot(destination, sourceData);

  return {
    source,
    destination,
    keys: Object.keys(sourceData).length,
  };
}

export function formatCopySummary({ source, destination, keys }) {
  return [
    `Copied snapshot "${source}" → "${destination}"`,
    `  ${keys} variable${keys !== 1 ? 's' : ''} copied`,
  ].join('\n');
}
