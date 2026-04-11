# snapenv watch

Watch a `.env` file for changes and automatically save a snapshot whenever the file is modified.

## Usage

```bash
snapenv watch <snapshot-name> [options]
```

## Arguments

| Argument        | Description                              |
|-----------------|------------------------------------------|
| `snapshot-name` | Name of the snapshot to auto-save into   |

## Options

| Flag            | Default | Description                              |
|-----------------|---------|------------------------------------------|
| `--file, -f`    | `.env`  | Path to the env file to watch            |
| `--debounce`    | `500`   | Debounce delay in milliseconds           |
| `--verbose`     | off     | Log each auto-save event to stdout       |
| `--help, -h`    |         | Show help message                        |

## Examples

Watch the default `.env` and save to a snapshot named `dev`:

```bash
snapenv watch dev
```

Watch a custom file with verbose logging:

```bash
snapenv watch staging --file .env.staging --verbose
```

Reduce debounce delay for faster saves:

```bash
snapenv watch dev --debounce 200
```

## Notes

- The watcher uses Node.js `fs.watch` under the hood.
- Changes are debounced to avoid duplicate saves on rapid edits.
- Each auto-save is recorded in the snapenv history.
- Press `Ctrl+C` to stop watching.
