const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, listSnapshots } = require('./snapshot');

const DEFAULT_MAX_SNAPSHOTS = 50;
const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function getQuotaPath(baseDir) {
  return path.join(baseDir || ensureSnapenvDir(), 'quota.json');
}

function loadQuota(baseDir) {
  const quotaPath = getQuotaPath(baseDir);
  if (!fs.existsSync(quotaPath)) {
    return { maxSnapshots: DEFAULT_MAX_SNAPSHOTS, maxSizeBytes: DEFAULT_MAX_SIZE_BYTES };
  }
  return JSON.parse(fs.readFileSync(quotaPath, 'utf8'));
}

function saveQuota(quota, baseDir) {
  const quotaPath = getQuotaPath(baseDir);
  fs.writeFileSync(quotaPath, JSON.stringify(quota, null, 2));
}

function setQuota(options, baseDir) {
  const current = loadQuota(baseDir);
  const updated = {
    maxSnapshots: options.maxSnapshots !== undefined ? Number(options.maxSnapshots) : current.maxSnapshots,
    maxSizeBytes: options.maxSizeBytes !== undefined ? Number(options.maxSizeBytes) : current.maxSizeBytes,
  };
  saveQuota(updated, baseDir);
  return updated;
}

function getSnapshotsDirSize(baseDir) {
  const dir = baseDir || ensureSnapenvDir();
  let total = 0;
  if (!fs.existsSync(dir)) return 0;
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) total += stat.size;
    } catch (_) {}
  }
  return total;
}

function checkQuota(baseDir) {
  const quota = loadQuota(baseDir);
  const snapshots = listSnapshots(baseDir);
  const totalSize = getSnapshotsDirSize(baseDir);
  const violations = [];

  if (snapshots.length >= quota.maxSnapshots) {
    violations.push(`Snapshot count (${snapshots.length}) has reached the limit of ${quota.maxSnapshots}`);
  }
  if (totalSize >= quota.maxSizeBytes) {
    violations.push(`Snapshots directory size (${totalSize} bytes) has reached the limit of ${quota.maxSizeBytes} bytes`);
  }

  return { ok: violations.length === 0, violations, count: snapshots.length, totalSize, quota };
}

function formatQuotaStatus(status) {
  const lines = [
    `Snapshots: ${status.count} / ${status.quota.maxSnapshots}`,
    `Size:      ${status.totalSize} / ${status.quota.maxSizeBytes} bytes`,
  ];
  if (!status.ok) {
    lines.push('');
    lines.push('Violations:');
    for (const v of status.violations) lines.push(`  ! ${v}`);
  } else {
    lines.push('Status: OK');
  }
  return lines.join('\n');
}

module.exports = { getQuotaPath, loadQuota, saveQuota, setQuota, getSnapshotsDirSize, checkQuota, formatQuotaStatus };
