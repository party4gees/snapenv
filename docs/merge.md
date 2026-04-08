# `snapenv merge` — Merge a Snapshot into Your `.env`

The `merge` command lets you combine an existing snapshot with your current `.env` file, giving you fine-grained control over how conflicts are resolved.

## Usage

```bash
snapenv merge <snapshot-name> [--strategy <ours|theirs>] [--env-file <path>]
```

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--strategy` | `theirs` | How to resolve conflicting keys |
| `--env-file` | `.env` | Path to the env file to merge into |

## Strategies

### `theirs` (default)
Values from the snapshot overwrite your current `.env` on conflict.

```bash
snapenv merge production --strategy theirs
```

### `ours`
Your current `.env` values are preserved on conflict; only **new** keys from the snapshot are added.

```bash
snapenv merge production --strategy ours
```

## Examples

```bash
# Merge snapshot "staging" using default strategy
snapenv merge staging

# Keep your local overrides, only pull in new keys
snapenv merge staging --strategy ours

# Merge into a custom env file
snapenv merge ci --env-file .env.local
```

## Output

```
2 conflict(s) resolved (snapshot value used):
  ~ DATABASE_URL
  ~ REDIS_URL
Merged snapshot "staging" into /project/.env
```

## Notes

- If no `.env` file exists, a new one is created from the snapshot.
- The merge does **not** remove keys that exist in your current `.env` but not in the snapshot.
- Use `snapenv diff <snapshot>` first to preview changes before merging.
