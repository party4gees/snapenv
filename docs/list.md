# snapenv list

List all saved snapshots for the current project, with metadata like creation time and number of keys.

## Usage

```
snapenv list [options]
```

## Options

| Flag | Description |
|------|-------------|
| `--help` | Show help for the list command |

## Output

Each snapshot is displayed with:
- **Name** — the label given at snapshot time
- **Created** — timestamp when the snapshot was saved
- **Keys** — number of environment variables stored

## Examples

### List all snapshots

```
$ snapenv list

NAME        CREATED              KEYS
before-v2   2024-03-10 14:22     12
dev-local   2024-03-11 09:05     8
staging     2024-03-12 16:44     15
```

### No snapshots found

```
$ snapenv list
No snapshots found. Run `snapenv snapshot <name>` to create one.
```

## Notes

- Snapshots are stored in `.snapenv/` in the current directory
- Snapshots are listed in order of creation (oldest first)
- Use `snapenv prune` to remove old or unused snapshots

## Related Commands

- [`snapenv snapshot`](./snapshot.md) — create a new snapshot
- [`snapenv restore`](./restore.md) — restore a snapshot
- [`snapenv prune`](./prune.md) — delete old snapshots
