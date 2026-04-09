# snapenv diff

Compare a saved snapshot against your current `.env` file to see what has changed.

## Usage

```bash
snapenv diff [snapshot-name] [env-file] [options]
```

## Arguments

| Argument        | Description                                              | Default        |
|-----------------|----------------------------------------------------------|----------------|
| `snapshot-name` | Name of the snapshot to compare against                  | latest snapshot|
| `env-file`      | Path to the env file to compare                          | `.env`         |

## Options

| Flag     | Description                        |
|----------|------------------------------------|
| `--json` | Output differences as JSON         |

## Output Format

By default, diff output uses the following symbols:

- `+` **added** — key exists in the current env but not in the snapshot
- `-` **removed** — key exists in the snapshot but not in the current env
- `~` **changed** — key exists in both but the value has changed

## Examples

**Compare latest snapshot against `.env`:**
```bash
snapenv diff
```

**Compare a named snapshot:**
```bash
snapenv diff pre-deploy
```

**Compare against a different env file:**
```bash
snapenv diff pre-deploy .env.local
```

**Get machine-readable JSON output:**
```bash
snapenv diff pre-deploy --json
```

## Notes

- If no snapshot name is provided, the most recently saved snapshot is used.
- If the env file does not exist, the command will exit with an error.
- If there are no differences, a message is printed and the command exits cleanly.
