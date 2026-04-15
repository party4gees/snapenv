# snapenv pipeline

Apply multiple snapshots in sequence to your `.env` file. Each snapshot in the pipeline is applied in order, with later snapshots overwriting overlapping keys from earlier ones.

## Usage

```
snapenv pipeline <step1> [step2 ...] [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `step1, step2, ...` | One or more snapshot names to apply in order |

## Options

| Flag | Description |
|------|-------------|
| `--env <path>` | Path to target `.env` file (default: `.env`) |
| `--keys <k1,k2,...>` | Only apply these keys from the **last** step |
| `--continue-on-error` | Skip missing snapshots instead of aborting |
| `--help` | Show usage information |

## Examples

### Apply two snapshots in order

```bash
snapenv pipeline base dev
```

Applies `base` first, then overlays `dev` on top.

### Target a specific env file

```bash
snapenv pipeline base dev --env .env.local
```

### Apply only specific keys from the last snapshot

```bash
snapenv pipeline base dev --keys PORT,DATABASE_URL
```

All keys from `base` are applied, but only `PORT` and `DATABASE_URL` are taken from `dev`.

### Continue past missing snapshots

```bash
snapenv pipeline base staging prod --continue-on-error
```

If `staging` doesn't exist, it is skipped and the pipeline continues.

## Output

```
Pipeline result:
  ✔ base — 5 var(s) applied
  ✔ dev  — 3 var(s) applied
```

## Notes

- Each step is recorded in the action history.
- The `--keys` filter applies only to the **last** named snapshot.
- Use `snapenv restore` for single-snapshot workflows.
