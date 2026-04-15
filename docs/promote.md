# snapenv promote

Promote a snapshot by copying it to a new name. Useful for advancing environment configurations through a pipeline (e.g. `dev` → `staging` → `production`).

## Usage

```
snapenv promote <src> <dest> [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `src`    | Name of the source snapshot to promote from |
| `dest`   | Name of the destination snapshot to promote into |

## Options

| Flag      | Description |
|-----------|-------------|
| `--force` | Overwrite destination snapshot without a warning |
| `--help`  | Show usage information |

## Examples

### Promote dev snapshot to staging

```bash
snapenv promote dev staging
```

### Promote staging to production, overwriting silently

```bash
snapenv promote staging production --force
```

## Output

```
Promoted 'dev' → 'staging'
  Keys copied : 5
```

If the destination snapshot already exists and `--force` is not set, a warning is printed:

```
Warning: destination snapshot 'staging' already existed and was overwritten.
```

## Notes

- The source snapshot is **not** deleted after promotion. Use `snapenv rename` if you want to move instead of copy.
- Promoting does not merge — the destination is fully replaced by the source.
- Use `snapenv diff <src> <dest>` before promoting to review changes.
