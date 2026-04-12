const { setHook, removeHook, loadHooks, formatHookList, HOOK_EVENTS } = require('../hook');

function printHookUsage() {
  console.log(`
snapenv hook <subcommand> [options]

Manage lifecycle hooks for snapshot and restore events.

Subcommands:
  set <event> <command>   Set a shell command to run on the given event
  remove <event>          Remove the hook for an event
  list                    List all configured hooks

Events:
  ${HOOK_EVENTS.join(', ')}

Examples:
  snapenv hook set pre-snapshot "npm run lint"
  snapenv hook set post-restore "source .env && echo restored"
  snapenv hook remove pre-snapshot
  snapenv hook list
  `);
}

function runHook(args) {
  const [sub, ...rest] = args;

  if (!sub || sub === '--help' || sub === '-h') {
    printHookUsage();
    return;
  }

  if (sub === 'list') {
    const hooks = loadHooks();
    console.log(formatHookList(hooks));
    return;
  }

  if (sub === 'set') {
    const [event, ...cmdParts] = rest;
    if (!event || cmdParts.length === 0) {
      console.error('Usage: snapenv hook set <event> <command>');
      process.exit(1);
    }
    const command = cmdParts.join(' ');
    try {
      setHook(event, command);
      console.log(`Hook set: ${event} => ${command}`);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
    return;
  }

  if (sub === 'remove') {
    const [event] = rest;
    if (!event) {
      console.error('Usage: snapenv hook remove <event>');
      process.exit(1);
    }
    try {
      removeHook(event);
      console.log(`Hook removed: ${event}`);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printHookUsage();
  process.exit(1);
}

module.exports = { printHookUsage, runHook };
