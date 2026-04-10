import { inspectSnapshot, filterVars, formatInspect } from '../inspect.js';

export function printInspectUsage() {
  console.log(`
Usage: snapenv inspect <name> [options]

Inspect the contents of a snapshot.

Arguments:
  name              Name of the snapshot to inspect

Options:
  --filter <prefix> Only show variables matching the given prefix
  --json            Output as JSON
  --help            Show this help message

Examples:
  snapenv inspect mysnap
  snapenv inspect mysnap --filter DB_
  snapenv inspect mysnap --json
`);
}

export async function runInspect(args) {
  if (args.includes('--help') || args.includes('-h')) {
    printInspectUsage();
    return;
  }

  const name = args[0];
  if (!name) {
    console.error('Error: snapshot name is required.');
    printInspectUsage();
    process.exit(1);
  }

  const filterIdx = args.indexOf('--filter');
  const prefix = filterIdx !== -1 ? args[filterIdx + 1] : null;
  const asJson = args.includes('--json');

  const project = process.env.SNAPENV_PROJECT || process.cwd().split('/').pop();

  try {
    const vars = await inspectSnapshot(name, project);
    const filtered = filterVars(vars, prefix);

    if (asJson) {
      console.log(JSON.stringify(filtered, null, 2));
    } else {
      console.log(formatInspect(name, filtered));
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
