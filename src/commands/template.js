const { getTemplate, listTemplates, saveTemplate, deleteTemplate, formatTemplateList } = require('../template');
const { saveSnapshot, getSnapshotPath } = require('../snapshot');
const { parseEnvFile } = require('../env');
const path = require('path');
const fs = require('fs');

function printTemplateUsage() {
  console.log(`
Usage: snapenv template <subcommand> [options]

Subcommands:
  list                        List all saved templates
  save <name> <snapshot>      Save a snapshot as a template
  apply <name> <snapshot>     Create a new snapshot from a template
  delete <name>               Delete a template

Examples:
  snapenv template list
  snapenv template save base-api my-snapshot
  snapenv template apply base-api new-snapshot
  snapenv template delete base-api
`);
}

async function runTemplate(args) {
  const [subcommand, ...rest] = args;

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    printTemplateUsage();
    return;
  }

  if (subcommand === 'list') {
    const templates = await listTemplates();
    if (templates.length === 0) {
      console.log('No templates saved.');
    } else {
      console.log(formatTemplateList(templates));
    }
    return;
  }

  if (subcommand === 'save') {
    const [templateName, snapshotName] = rest;
    if (!templateName || !snapshotName) {
      console.error('Usage: snapenv template save <name> <snapshot>');
      process.exit(1);
    }
    const snapshotPath = getSnapshotPath(snapshotName);
    if (!fs.existsSync(snapshotPath)) {
      console.error(`Snapshot "${snapshotName}" not found.`);
      process.exit(1);
    }
    const vars = parseEnvFile(snapshotPath);
    await saveTemplate(templateName, vars);
    console.log(`Template "${templateName}" saved from snapshot "${snapshotName}".`);
    return;
  }

  if (subcommand === 'apply') {
    const [templateName, newSnapshotName] = rest;
    if (!templateName || !newSnapshotName) {
      console.error('Usage: snapenv template apply <name> <snapshot>');
      process.exit(1);
    }
    const template = await getTemplate(templateName);
    if (!template) {
      console.error(`Template "${templateName}" not found.`);
      process.exit(1);
    }
    await saveSnapshot(newSnapshotName, template.vars);
    console.log(`Snapshot "${newSnapshotName}" created from template "${templateName}".`);
    return;
  }

  if (subcommand === 'delete') {
    const [templateName] = rest;
    if (!templateName) {
      console.error('Usage: snapenv template delete <name>');
      process.exit(1);
    }
    await deleteTemplate(templateName);
    console.log(`Template "${templateName}" deleted.`);
    return;
  }

  console.error(`Unknown subcommand: ${subcommand}`);
  printTemplateUsage();
  process.exit(1);
}

module.exports = { printTemplateUsage, runTemplate };
