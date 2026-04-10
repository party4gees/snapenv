import { compareSnapshots, formatCompareResult, printCompareUsage } from '../compare.js';

export { printCompareUsage };

/**
 * runCompare(['snap-a', 'snap-b', ...flags])
 * Compares two snapshots and prints a formatted diff.
 */
export async function runCompare(args = []) {
  const flags = args.filter((a) => a.startsWith('--'));
  const names = args.filter((a) => !a.startsWith('--'));

  if (names.length < 2) {
    printCompareUsage();
    return;
  }

  const [nameA, nameB] = names;
  const color = !flags.includes('--no-color');

  try {
    const result = await compareSnapshots(nameA, nameB);
    const output = formatCompareResult(result, { color });
    console.log(output);

    if (result.identical) {
      console.log(`Snapshots "${nameA}" and "${nameB}" are identical.`);
    }
  } catch (err) {
    console.error(`Error comparing snapshots: ${err.message}`);
    process.exitCode = 1;
  }
}
