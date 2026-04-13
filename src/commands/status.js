import path from 'path';
import { getProjectEnvPath, getStatus, formatStatus } from '../status.js';

export function printStatusUsage() {
  console.log(`
snapenv status

Show the currently active snapshot and .env file status for the project.

Usage:
  snapenv status

Options:
  --dir <path>   Project directory (default: current working directory)
  --help         Show this help message
`.trim());
}

export async function runStatus(args = []) {
  if (args.includes('--help') || args.includes('-h')) {
    printStatusUsage();
    return;
  }

  const dirFlagIdx = args.indexOf('--dir');
  const projectDir = dirFlagIdx !== -1 ? args[dirFlagIdx + 1] : process.cwd();

  if (!projectDir) {
    console.error('Error: --dir requires a path argument');
    process.exit(1);
  }

  const envPath = getProjectEnvPath(projectDir);
  const status = getStatus(projectDir, envPath);
  console.log(formatStatus(status));
}
