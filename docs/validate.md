# snapenv validate

Validate the contents of a snapshot to check for common issues such as empty values, suspicious patterns, or malformed variable names.

## Usage

```bash
snapenv validate <snapshot-name>
```

## Arguments

| Argument        | Description                        |
|-----------------|------------------------------------|
| `snapshot-name` | Name of the snapshot to validate   |

## What It Checks

- **Empty values** — variables with no value set
- **Whitespace-only values** — values that contain only spaces or tabs
- **Invalid variable names** — names that don't conform to standard shell variable naming rules (must start with a letter or `_`, followed by letters, digits, or `_`)
- **Suspicious patterns** — values that look like unresolved template placeholders (e.g. `${VAR}` or `__PLACEHOLDER__`)

## Examples

### Validate a snapshot

```bash
snapenv validate production
```

Output on success:

```
✔ Snapshot "production" is valid. 12 variable(s) checked, 0 issue(s) found.
```

Output on failure:

```
✖ Snapshot "production" has 2 issue(s):
  - EMPTY_VAR: value is empty
  - 1INVALID_NAME: variable name does not conform to naming rules
```

## Exit Codes

| Code | Meaning                        |
|------|--------------------------------|
| `0`  | Snapshot is valid              |
| `1`  | Validation failed or error     |

## Related Commands

- [`snapenv inspect`](./inspect.md) — view the contents of a snapshot
- [`snapenv diff`](./diff.md) — compare two snapshots or a snapshot against your current `.env`
- [`snapenv restore`](./restore.md) — apply a snapshot to your `.env` file
