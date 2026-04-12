const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath } = require('./snapshot');

const TEMPLATES_FILE = 'templates.json';

function getTemplatesPath(baseDir) {
  return path.join(ensureSnapenvDir(baseDir), TEMPLATES_FILE);
}

function loadTemplates(baseDir) {
  const filePath = getTemplatesPath(baseDir);
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveTemplates(baseDir, templates) {
  const filePath = getTemplatesPath(baseDir);
  fs.writeFileSync(filePath, JSON.stringify(templates, null, 2));
}

function saveTemplate(baseDir, templateName, keys) {
  if (!templateName || typeof templateName !== 'string') {
    throw new Error('Template name must be a non-empty string');
  }
  if (!Array.isArray(keys) || keys.length === 0) {
    throw new Error('Template must include at least one key');
  }
  const templates = loadTemplates(baseDir);
  templates[templateName] = { keys, createdAt: new Date().toISOString() };
  saveTemplates(baseDir, templates);
  return templates[templateName];
}

function getTemplate(baseDir, templateName) {
  const templates = loadTemplates(baseDir);
  return templates[templateName] || null;
}

function deleteTemplate(baseDir, templateName) {
  const templates = loadTemplates(baseDir);
  if (!templates[templateName]) {
    throw new Error(`Template "${templateName}" not found`);
  }
  delete templates[templateName];
  saveTemplates(baseDir, templates);
}

function applyTemplate(envVars, template) {
  if (!template || !Array.isArray(template.keys)) {
    throw new Error('Invalid template');
  }
  const result = {};
  for (const key of template.keys) {
    if (Object.prototype.hasOwnProperty.call(envVars, key)) {
      result[key] = envVars[key];
    }
  }
  return result;
}

function formatTemplateList(templates) {
  const names = Object.keys(templates);
  if (names.length === 0) return 'No templates saved.';
  return names
    .map(name => `  ${name} (${templates[name].keys.length} keys): ${templates[name].keys.join(', ')}`)
    .join('\n');
}

module.exports = {
  getTemplatesPath,
  loadTemplates,
  saveTemplates,
  saveTemplate,
  getTemplate,
  deleteTemplate,
  applyTemplate,
  formatTemplateList,
};
