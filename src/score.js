const { listSnapshotsWithMeta } = require('./list');
const { getTagsForSnapshot } = require('./tag');
const { getNote } = require('./note');
const { isPinned } = require('./pin');

/**
 * Score a snapshot based on usage signals.
 * Higher score = more "important" or "active" snapshot.
 */
function scoreSnapshot(meta, tags = [], hasNote = false, pinned = false) {
  let score = 0;

  // Recency: newer snapshots score higher (up to 40 pts)
  const ageMs = Date.now() - new Date(meta.createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  score += Math.max(0, 40 - Math.floor(ageDays));

  // Tags: each tag adds 10 pts (up to 30)
  score += Math.min(30, tags.length * 10);

  // Has a note: +15 pts
  if (hasNote) score += 15;

  // Pinned: +20 pts
  if (pinned) score += 20;

  return score;
}

async function rankSnapshots(snapenvDir) {
  const snapshots = await listSnapshotsWithMeta(snapenvDir);

  const ranked = await Promise.all(
    snapshots.map(async (meta) => {
      const tags = await getTagsForSnapshot(snapenvDir, meta.name).catch(() => []);
      const note = await getNote(snapenvDir, meta.name).catch(() => null);
      const pinned = await isPinned(snapenvDir, meta.name).catch(() => false);
      const score = scoreSnapshot(meta, tags, !!note, pinned);
      return { ...meta, score, tags, hasNote: !!note, pinned };
    })
  );

  return ranked.sort((a, b) => b.score - a.score);
}

function formatScoreList(ranked) {
  if (ranked.length === 0) return 'No snapshots found.';

  const lines = ['Snapshot scores (highest first):', ''];
  for (const s of ranked) {
    const flags = [
      s.pinned ? '[pinned]' : '',
      s.hasNote ? '[note]' : '',
      s.tags.length ? `[tags: ${s.tags.join(', ')}]` : ''
    ].filter(Boolean).join(' ');
    lines.push(`  ${s.name.padEnd(30)} score: ${String(s.score).padStart(3)}  ${flags}`);
  }
  return lines.join('\n');
}

module.exports = { scoreSnapshot, rankSnapshots, formatScoreList };
