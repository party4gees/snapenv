const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  loadNotifyConfig,
  enableEvent,
  disableEvent,
  setChannel,
  removeChannel,
  shouldNotify,
  formatNotifyConfig,
} = require('./notify');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-notify-'));
}

test('loadNotifyConfig returns defaults when no file exists', () => {
  const dir = makeTmpDir();
  const config = loadNotifyConfig(dir);
  expect(config.events).toEqual([]);
  expect(config.channels).toEqual({});
});

test('enableEvent adds event to config', () => {
  const dir = makeTmpDir();
  enableEvent(dir, 'snapshot.save');
  const config = loadNotifyConfig(dir);
  expect(config.events).toContain('snapshot.save');
});

test('enableEvent does not duplicate events', () => {
  const dir = makeTmpDir();
  enableEvent(dir, 'snapshot.restore');
  enableEvent(dir, 'snapshot.restore');
  const config = loadNotifyConfig(dir);
  expect(config.events.filter(e => e === 'snapshot.restore').length).toBe(1);
});

test('disableEvent removes event from config', () => {
  const dir = makeTmpDir();
  enableEvent(dir, 'snapshot.delete');
  disableEvent(dir, 'snapshot.delete');
  const config = loadNotifyConfig(dir);
  expect(config.events).not.toContain('snapshot.delete');
});

test('setChannel stores channel value', () => {
  const dir = makeTmpDir();
  setChannel(dir, 'slack', 'https://hooks.slack.com/test');
  const config = loadNotifyConfig(dir);
  expect(config.channels.slack).toBe('https://hooks.slack.com/test');
});

test('removeChannel deletes channel', () => {
  const dir = makeTmpDir();
  setChannel(dir, 'webhook', 'https://example.com/hook');
  removeChannel(dir, 'webhook');
  const config = loadNotifyConfig(dir);
  expect(config.channels.webhook).toBeUndefined();
});

test('shouldNotify returns true when event is enabled', () => {
  const dir = makeTmpDir();
  enableEvent(dir, 'snapshot.save');
  expect(shouldNotify(dir, 'snapshot.save')).toBe(true);
  expect(shouldNotify(dir, 'snapshot.delete')).toBe(false);
});

test('formatNotifyConfig shows events and channels', () => {
  const dir = makeTmpDir();
  enableEvent(dir, 'snapshot.save');
  setChannel(dir, 'email', 'dev@example.com');
  const config = loadNotifyConfig(dir);
  const output = formatNotifyConfig(config);
  expect(output).toContain('snapshot.save');
  expect(output).toContain('email');
  expect(output).toContain('dev@example.com');
});

test('formatNotifyConfig shows none when empty', () => {
  const dir = makeTmpDir();
  const config = loadNotifyConfig(dir);
  const output = formatNotifyConfig(config);
  expect(output).toContain('(none)');
});
