const fs = require('fs');
const path = require('path');
const os = require('os');
const { setHook, removeHook, getHook, loadHooks, formatHookList, HOOK_EVENTS } = require('./hook');

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-hook-'));
  fs.mkdirSync(path.join(dir, '.snapenv'), { recursive: true });
  return dir;
}

test('setHook stores a hook command for a valid event', () => {
  const dir = makeTmpDir();
  setHook('pre-snapshot', 'echo before', dir);
  const hooks = loadHooks(dir);
  expect(hooks['pre-snapshot']).toBe('echo before');
});

test('setHook throws for unknown event', () => {
  const dir = makeTmpDir();
  expect(() => setHook('invalid-event', 'echo hi', dir)).toThrow('Unknown hook event');
});

test('getHook returns null when no hook set', () => {
  const dir = makeTmpDir();
  expect(getHook('post-restore', dir)).toBeNull();
});

test('getHook returns command after setHook', () => {
  const dir = makeTmpDir();
  setHook('post-restore', 'npm run sync', dir);
  expect(getHook('post-restore', dir)).toBe('npm run sync');
});

test('removeHook deletes a hook', () => {
  const dir = makeTmpDir();
  setHook('pre-restore', 'echo pre', dir);
  removeHook('pre-restore', dir);
  expect(getHook('pre-restore', dir)).toBeNull();
});

test('removeHook throws if hook not set', () => {
  const dir = makeTmpDir();
  expect(() => removeHook('post-snapshot', dir)).toThrow('No hook set for event');
});

test('formatHookList returns message when no hooks', () => {
  const dir = makeTmpDir();
  const hooks = loadHooks(dir);
  expect(formatHookList(hooks)).toBe('No hooks configured.');
});

test('formatHookList lists all set hooks', () => {
  const dir = makeTmpDir();
  setHook('pre-snapshot', 'echo a', dir);
  setHook('post-restore', 'echo b', dir);
  const hooks = loadHooks(dir);
  const output = formatHookList(hooks);
  expect(output).toContain('pre-snapshot: echo a');
  expect(output).toContain('post-restore: echo b');
});

test('HOOK_EVENTS contains expected events', () => {
  expect(HOOK_EVENTS).toContain('pre-snapshot');
  expect(HOOK_EVENTS).toContain('post-snapshot');
  expect(HOOK_EVENTS).toContain('pre-restore');
  expect(HOOK_EVENTS).toContain('post-restore');
});
