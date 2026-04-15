const { loadSnapshot } = require('./snapshot');
const { restoreSnapshot } = require('./restore');
const { recordAction } = require('./history');

/**
 * A pipeline is an ordered list of snapshot names to apply in sequence.
 * Each step can optionally specify a subset of keys to apply.
 */

function buildPipeline(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error('Pipeline must be a non-empty array of steps');
  }
  return steps.map((step, i) => {
    if (typeof step === 'string') return { name: step, keys: null };
    if (typeof step === 'object' && step.name) return { name: step.name, keys: step.keys || null };
    throw new Error(`Invalid pipeline step at index ${i}`);
  });
}

async function runPipeline(steps, envPath, opts = {}) {
  const pipeline = buildPipeline(steps);
  const results = [];

  for (const step of pipeline) {
    const snapshot = await loadSnapshot(step.name);
    if (!snapshot) {
      results.push({ name: step.name, status: 'missing' });
      if (!opts.continueOnError) throw new Error(`Snapshot not found: ${step.name}`);
      continue;
    }

    let vars = snapshot;
    if (step.keys) {
      vars = {};
      for (const k of step.keys) {
        if (k in snapshot) vars[k] = snapshot[k];
      }
    }

    await restoreSnapshot(step.name, envPath, { vars });
    await recordAction('pipeline-step', { snapshot: step.name, keys: step.keys });
    results.push({ name: step.name, status: 'applied', count: Object.keys(vars).length });
  }

  return results;
}

function formatPipelineResult(results) {
  const lines = ['Pipeline result:'];
  for (const r of results) {
    if (r.status === 'applied') {
      lines.push(`  ✔ ${r.name} — ${r.count} var(s) applied`);
    } else {
      lines.push(`  ✘ ${r.name} — ${r.status}`);
    }
  }
  return lines.join('\n');
}

module.exports = { buildPipeline, runPipeline, formatPipelineResult };
