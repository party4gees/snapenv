# snapenv mirror

Copy all environment variables from one snapshot into another, creating or overwriting the destination.

## Usage

```
snapenv mirror <source> <destination> [options]
```

## Arguments

| Argument      | Description                              |
|---------------|------------------------------------------|
| `source`      | Name of the snapshot to mirror from      |
| `destination` | Name of the snapshot to mirror into      |

## Options

| Flag          | Description                                              |
|---------------|----------------------------------------------------------|
| `--overwrite` | Overwrite destination if it already exists (default: false) |
| `--help`      | Show usage information                                   |

## Examples

### Mirror a snapshot

```
snapenv mirror production staging
```

Creates `staging` as an exact copy of `production`.

### Mirror with overwrite

```
snapenv mirror production staging --overwrite
```

If `staging` already exists, its contents are replaced with those from `production`.

## Output

```
Mirrored production -> staging (12 keys)
```

## Notes

- Without `--overwrite`, mirroring into an existing snapshot will fail with an error.
- The source snapshot must exist. If it does not, an error is shown and the command exits with code 1.
- Mirroring does not affect the source snapshot in any way.
- Use `snapenv diff <source> <destination>` after mirroring to verify the result.

## Related Commands

- [`snapenv copy`](./copy.md) — copy a snapshot under a new name
- [`snapenv diff`](./diff.md) — compare two snapshots
- [`snapenv compare`](./compare.md) — detailed comparison of two snapshots
