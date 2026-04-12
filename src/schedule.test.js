const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getSchedulePath,
  loadSchedules,
  addSchedule,
  removeSchedule,
  getSchedule,
  listSchedules,
  formatScheduleList,
} = require('./schedule');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-schedule-test-'));
}

jest.mock('./snapshot', () => ({
  getSnapenvDir: (dir) => path.join(dir, '.snapenv'),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('loadSchedules returns empty object when file missing', () => {
  const dir = makeTmpDir();
  expect(loadSchedules(dir)).toEqual({});
});

test('addSchedule creates a schedule entry', () => {
  const dir = makeTmpDir();
  fs.mkdirSync(path.join(dir, '.snapenv'), { recursive: true });
  const result = addSchedule(dir, 'nightly', 'prod-snap', '0 2 * * *');
  expect(result.snapshotName).toBe('prod-snap');
  expect(result.cron).toBe('0 2 * * *');
  expect(result.action).toBe('restore');
  expect(result.lastRun).toBeNull();
});

test('addSchedule persists to disk', () => {
  const dir = makeTmpDir();
  fs.mkdirSync(path.join(dir, '.snapenv'), { recursive: true });
  addSchedule(dir, 'weekly', 'dev-snap', '0 0 * * 0', 'restore');
  const loaded = loadSchedules(dir);
  expect(loaded['weekly']).toBeDefined();
  expect(loaded['weekly'].snapshotName).toBe('dev-snap');
});

test('getSchedule returns null for unknown name', () => {
  const dir = makeTmpDir();
  expect(getSchedule(dir, 'nonexistent')).toBeNull();
});

test('removeSchedule deletes a schedule', () => {
  const dir = makeTmpDir();
  fs.mkdirSync(path.join(dir, '.snapenv'), { recursive: true });
  addSchedule(dir, 'daily', 'snap1', '0 8 * * *');
  const removed = removeSchedule(dir, 'daily');
  expect(removed).toBe(true);
  expect(getSchedule(dir, 'daily')).toBeNull();
});

test('removeSchedule returns false for unknown name', () => {
  const dir = makeTmpDir();
  expect(removeSchedule(dir, 'ghost')).toBe(false);
});

test('listSchedules returns array of schedules', () => {
  const dir = makeTmpDir();
  fs.mkdirSync(path.join(dir, '.snapenv'), { recursive: true });
  addSchedule(dir, 'a', 'snap-a', '0 1 * * *');
  addSchedule(dir, 'b', 'snap-b', '0 2 * * *');
  const list = listSchedules(dir);
  expect(list).toHaveLength(2);
  expect(list.map(s => s.name)).toContain('a');
});

test('formatScheduleList shows empty message when none', () => {
  expect(formatScheduleList([])).toBe('No schedules defined.');
});

test('formatScheduleList formats schedule entries', () => {
  const schedules = [{ name: 'nightly', cron: '0 2 * * *', action: 'restore', snapshotName: 'prod', lastRun: null }];
  const output = formatScheduleList(schedules);
  expect(output).toContain('nightly');
  expect(output).toContain('0 2 * * *');
  expect(output).toContain('prod');
});
