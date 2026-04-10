const { addTag, removeTag, getTagsForSnapshot, listAllTags, formatTagList } = require('../tag');

function printTagUsage() {
  console.log(`
Usage: snapenv tag <subcommand> [options]

Subcommands:
  add <snapshot> <tag>     Add a tag to a snapshot
  remove <snapshot> <tag>  Remove a tag from a snapshot
  list [snapshot]          List tags (for a snapshot or all)

Examples:
  snapenv tag add my-snapshot production
  snapenv tag remove my-snapshot staging
  snapenv tag list
  snapenv tag list my-snapshot
`);
}

async function runTag(args) {
  const [subcommand, ...rest] = args;

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    printTagUsage();
    return;
  }

  if (subcommand === 'add') {
    const [snapshotName, tag] = rest;
    if (!snapshotName || !tag) {
      console.error('Error: add requires a snapshot name and a tag');
      process.exit(1);
    }
    await addTag(snapshotName, tag);
    console.log(`Tag "${tag}" added to snapshot "${snapshotName}"`);
    return;
  }

  if (subcommand === 'remove') {
    const [snapshotName, tag] = rest;
    if (!snapshotName || !tag) {
      console.error('Error: remove requires a snapshot name and a tag');
      process.exit(1);
    }
    await removeTag(snapshotName, tag);
    console.log(`Tag "${tag}" removed from snapshot "${snapshotName}"`);
    return;
  }

  if (subcommand === 'list') {
    const [snapshotName] = rest;
    if (snapshotName) {
      const tags = await getTagsForSnapshot(snapshotName);
      if (tags.length === 0) {
        console.log(`No tags found for snapshot "${snapshotName}"`);
      } else {
        console.log(`Tags for "${snapshotName}": ${tags.join(', ')}`);
      }
    } else {
      const all = await listAllTags();
      console.log(formatTagList(all));
    }
    return;
  }

  console.error(`Unknown subcommand: ${subcommand}`);
  printTagUsage();
  process.exit(1);
}

module.exports = { printTagUsage, runTag };
