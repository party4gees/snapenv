import { printBatchUsage, formatBatchResult } from '../batch.js';
import { saveSnapshot, loadSnapshot } from '../snapshot.js';
import { restoreSnapshot } from '../restore.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export async function runBatch(args) {
  if (!args || args.length === 0) {
    printBatchUsage();
    return;
  }

  const [subcommand, ...names] = args;

  if (!['save', 'restore', 'delete'].includes(subcommand)) {
    console.log(`Unknown batch subcommand: "${subcommand}". Use save, restore, or delete.`);
    return;
  }

  if (names.length === 0) {
    console.log(`No snapshot names provided for batch ${subcommand}.`);
    return;
  }

  const results = [];

  for (const name of names) {
    try {
      if (subcommand === 'save') {
        const envPath = resolve(process.cwd(), '.env');
        let content = '';
        try { content = readFileSync(envPath, 'utf8'); } catch {}
        await saveSnapshot(name, content);
        results.push({ name, status: 'saved' });
      } else if (subcommand === 'restore') {
        const summary = await restoreSnapshot(name);
        results.push({ name, status: 'restored', summary });
      } else if (subcommand === 'delete') {
        const { deleteSnapshot } = await import('../prune.js');
        await deleteSnapshot(name);
        results.push({ name, status: 'deleted' });
      }
    } catch (err) {
      console.error(`[batch] Failed for ${name}:`, err.message);
      results.push({ name, status: 'error', error: err.message });
    }
  }

  console.log(formatBatchResult(results));
}
