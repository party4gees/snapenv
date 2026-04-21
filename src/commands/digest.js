const { digestSnapshot, compareDigests, formatDigestResult } = require('../digest');
const { ensureSnapenvDir } = require('../snapshot');

function printDigestUsage() {
  console.log(`
Usage: snapenv digest <snapshot>           Print SHA-256 digest of a snapshot
       snapenv digest <snapshotA> <snapshotB>  Compare digests of two snapshots

Options:
  --help    Show this help message

Examples:
  snapenv digest dev
  snapenv digest dev staging
`.trim());
}

function runDigest(args, options = {}) {
  if (options.help || args.length === 0) {
    printDigestUsage();
    return;
  }

  const snapenvDir = ensureSnapenvDir();

  if (args.length === 1) {
    const [name] = args;
    try {
      const result = digestSnapshot(snapenvDir, name);
      console.log(formatDigestResult(result));
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
    return;
  }

  if (args.length >= 2) {
    const [nameA, nameB] = args;
    try {
      const result = compareDigests(snapenvDir, nameA, nameB);
      console.log(`Snapshot A : ${nameA}`);
      console.log(`  SHA-256  : ${result.digestA}`);
      console.log(`Snapshot B : ${nameB}`);
      console.log(`  SHA-256  : ${result.digestB}`);
      console.log(`Match      : ${result.match ? 'yes ✓' : 'no ✗'}`);
      if (!result.match) process.exitCode = 1;
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
  }
}

module.exports = { printDigestUsage, runDigest };
