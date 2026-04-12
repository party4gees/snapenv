const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  loadTemplates,
  saveTemplate,
  getTemplate,
  deleteTemplate,
  applyTemplate,
  formatTemplateList,
} = require('./template');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-template-'));
}

describe('saveTemplate / getTemplate', () => {
  it('saves and retrieves a template', () => {
    const dir = makeTmpDir();
    saveTemplate(dir, 'backend', ['DB_HOST', 'DB_PORT', 'DB_NAME']);
    const tpl = getTemplate(dir, 'backend');
    expect(tpl).not.toBeNull();
    expect(tpl.keys).toEqual(['DB_HOST', 'DB_PORT', 'DB_NAME']);
    expect(tpl.createdAt).toBeDefined();
  });

  it('returns null for missing template', () => {
    const dir = makeTmpDir();
    expect(getTemplate(dir, 'nope')).toBeNull();
  });

  it('throws on empty template name', () => {
    const dir = makeTmpDir();
    expect(() => saveTemplate(dir, '', ['KEY'])).toThrow();
  });

  it('throws on empty keys array', () => {
    const dir = makeTmpDir();
    expect(() => saveTemplate(dir, 'empty', [])).toThrow();
  });
});

describe('deleteTemplate', () => {
  it('deletes an existing template', () => {
    const dir = makeTmpDir();
    saveTemplate(dir, 'frontend', ['API_URL']);
    deleteTemplate(dir, 'frontend');
    expect(getTemplate(dir, 'frontend')).toBeNull();
  });

  it('throws when deleting non-existent template', () => {
    const dir = makeTmpDir();
    expect(() => deleteTemplate(dir, 'ghost')).toThrow(/not found/);
  });
});

describe('applyTemplate', () => {
  const envVars = { DB_HOST: 'localhost', DB_PORT: '5432', SECRET: 'abc', OTHER: 'x' };

  it('filters env vars to template keys', () => {
    const tpl = { keys: ['DB_HOST', 'DB_PORT'] };
    expect(applyTemplate(envVars, tpl)).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('ignores keys not present in env', () => {
    const tpl = { keys: ['DB_HOST', 'MISSING_KEY'] };
    const result = applyTemplate(envVars, tpl);
    expect(result).toEqual({ DB_HOST: 'localhost' });
  });

  it('throws on invalid template', () => {
    expect(() => applyTemplate(envVars, null)).toThrow();
    expect(() => applyTemplate(envVars, { keys: 'bad' })).toThrow();
  });
});

describe('formatTemplateList', () => {
  it('returns message when no templates', () => {
    expect(formatTemplateList({})).toMatch(/No templates/);
  });

  it('lists templates with key counts', () => {
    const templates = {
      db: { keys: ['DB_HOST', 'DB_PORT'], createdAt: '2024-01-01' },
    };
    const output = formatTemplateList(templates);
    expect(output).toContain('db');
    expect(output).toContain('2 keys');
    expect(output).toContain('DB_HOST');
  });
});
