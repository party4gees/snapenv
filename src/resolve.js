// resolve.js — resolve snapshot names via aliases, tags, or direct name
const { loadAliases, resolveAlias } = require('./alias');
const { listSnapshotsWithMeta } = require('./list');
const { getTagsForSnapshot } = require('./tag');

/**
 * Resolve a user-provided identifier to a real snapshot name.
 * Checks: direct match, alias, or single-match by tag.
 */
async function resolveSnapshotName(identifier, snapenvDir) {
  if (!identifier) throw new Error('No snapshot identifier provided');

  // 1. Try direct match
  const snapshots = await listSnapshotsWithMeta(snapenvDir);
  const names = snapshots.map(s => s.name);

  if (names.includes(identifier)) {
    return { resolved: identifier, via: 'direct' };
  }

  // 2. Try alias
  const aliases = await loadAliases(snapenvDir);
  const aliasTarget = resolveAlias(aliases, identifier);
  if (aliasTarget && names.includes(aliasTarget)) {
    return { resolved: aliasTarget, via: 'alias', alias: identifier };
  }

  // 3. Try tag — find snapshots that have this tag
  const tagged = [];
  for (const snap of snapshots) {
    const tags = await getTagsForSnapshot(snapenvDir, snap.name);
    if (tags.includes(identifier)) {
      tagged.push(snap.name);
    }
  }

  if (tagged.length === 1) {
    return { resolved: tagged[0], via: 'tag', tag: identifier };
  }

  if (tagged.length > 1) {
    throw new Error(
      `Ambiguous tag "${identifier}" matches multiple snapshots: ${tagged.join(', ')}`
    );
  }

  throw new Error(`Cannot resolve snapshot "${identifier}": no match found`);
}

/**
 * Format a resolution result for display.
 */
function formatResolution(result) {
  if (result.via === 'direct') {
    return `Resolved: ${result.resolved}`;
  }
  if (result.via === 'alias') {
    return `Resolved: ${result.resolved} (via alias "${result.alias}")`;
  }
  if (result.via === 'tag') {
    return `Resolved: ${result.resolved} (via tag "${result.tag}")`;
  }
  return `Resolved: ${result.resolved}`;
}

module.exports = { resolveSnapshotName, formatResolution };
