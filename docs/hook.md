# snapenv hook

Manage lifecycle hooks that run shell commands automatically before or after snapshot and restore operations.

## Usage

```
snapenv hook <subcommand> [options]
```

## Subcommands

### `set <event> <command>`

Register a shell command to run when the specified event fires.

```bash
snapenv hook set pre-snapshot "npm run validate"
snapenv hook set post-restore "source .env && echo Env restored"
```

### `remove <event>`

Remove the hook for the given event.

```bash
snapenv hook remove pre-snapshot
```

### `list`

Display all currently configured hooks.

```bash
snapenv hook list
```

## Events

| Event | Fires |
|---|---|
| `pre-snapshot` | Before a snapshot is saved |
| `post-snapshot` | After a snapshot is saved |
| `pre-restore` | Before a snapshot is restored |
| `post-restore` | After a snapshot is restored |

## Hook Context

Hooks are executed with the current environment variables plus any context variables set by the triggering command. The hook command runs via `execSync` with `stdio: inherit` so output is visible in the terminal.

## Storage

Hooks are stored in `.snapenv/hooks.json` in the project directory.

## Examples

```bash
# Run tests before every snapshot
snapenv hook set pre-snapshot "npm test"

# Notify after restore
snapenv hook set post-restore "echo Done restoring env"

# Check all hooks
snapenv hook list

# Clean up a hook
snapenv hook remove post-restore
```

## Notes

- If a hook command exits with a non-zero code, the result is reported but the main operation continues.
- Hook commands are plain shell strings and can chain commands with `&&` or `;`.
