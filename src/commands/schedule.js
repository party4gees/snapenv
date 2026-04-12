const {
  addSchedule,
  removeSchedule,
  listSchedules,
  formatScheduleList,
  getSchedule,
} = require('../schedule');

function printScheduleUsage() {
  console.log(`
snapenv schedule <subcommand> [options]

Subcommands:
  add <name> <snapshot> <cron> [--action restore]  Add a new schedule
  remove <name>                                     Remove a schedule
  list                                              List all schedules
  show <name>                                       Show schedule details

Examples:
  snapenv schedule add nightly prod-snap "0 2 * * *"
  snapenv schedule add weekly dev-snap "0 0 * * 0" --action restore
  snapenv schedule remove nightly
  snapenv schedule list
  snapenv schedule show nightly
  `);
}

function runSchedule(args, projectDir = process.cwd()) {
  const [subcommand, ...rest] = args;

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    printScheduleUsage();
    return;
  }

  if (subcommand === 'list') {
    const schedules = listSchedules(projectDir);
    console.log(formatScheduleList(schedules));
    return;
  }

  if (subcommand === 'add') {
    const [name, snapshotName, cronExpr, ...flags] = rest;
    if (!name || !snapshotName || !cronExpr) {
      console.error('Usage: snapenv schedule add <name> <snapshot> <cron> [--action restore]');
      process.exit(1);
    }
    const actionIdx = flags.indexOf('--action');
    const action = actionIdx !== -1 ? flags[actionIdx + 1] : 'restore';
    addSchedule(projectDir, name, snapshotName, cronExpr, action);
    console.log(`Schedule "${name}" added: ${action} ${snapshotName} at cron "${cronExpr}"`);
    return;
  }

  if (subcommand === 'remove') {
    const [name] = rest;
    if (!name) {
      console.error('Usage: snapenv schedule remove <name>');
      process.exit(1);
    }
    const removed = removeSchedule(projectDir, name);
    if (removed) {
      console.log(`Schedule "${name}" removed.`);
    } else {
      console.error(`Schedule "${name}" not found.`);
      process.exit(1);
    }
    return;
  }

  if (subcommand === 'show') {
    const [name] = rest;
    if (!name) {
      console.error('Usage: snapenv schedule show <name>');
      process.exit(1);
    }
    const schedule = getSchedule(projectDir, name);
    if (!schedule) {
      console.error(`Schedule "${name}" not found.`);
      process.exit(1);
    }
    console.log(`Name:      ${name}`);
    console.log(`Snapshot:  ${schedule.snapshotName}`);
    console.log(`Cron:      ${schedule.cron}`);
    console.log(`Action:    ${schedule.action}`);
    console.log(`Created:   ${schedule.createdAt}`);
    console.log(`Last run:  ${schedule.lastRun || 'never'}`);
    return;
  }

  console.error(`Unknown subcommand: ${subcommand}`);
  printScheduleUsage();
  process.exit(1);
}

module.exports = { printScheduleUsage, runSchedule };
