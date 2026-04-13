# snapenv status

Show the currently active snapshot and `.env` file status for the current project.

## Usage

```
snapenv status [--dir <path>]
```

## Options

| Flag | Description |
|------|-------------|
| `--dir <path>` | Project directory to check (default: current working directory) |
| `--help` | Show help message |

## Output

The `status` command displays:

- **Active snapshot**: The name of the snapshot currently applied to the project, or a message indicating none is active.
- **Env file**: Whether a `.env` file exists in the project directory.

## Examples

### Check status in current directory

```
$ snapenv status
Active snapshot : dev
Env file        : exists (.env)
```

### No active snapshot

```
$ snapenv status
Active snapshot : (none)
Env file        : missing
```

### Check a specific project directory

```
$ snapenv status --dir ~/projects/myapp
Active snapshot : production
Env file        : exists (.env)
```

## Notes

- The active snapshot is tracked per project directory using a local state file inside the snapenv data directory.
- Switching snapshots via `snapenv restore` automatically updates the active snapshot.
- Use `snapenv clear` to deactivate the current snapshot without restoring a new one.
