# snapenv snapshot

Manage environment variable snapshots — save, list, and delete named snapshots of your `.env` files.

## Usage

```
snapenv snapshot <subcommand> [options]
```

## Subcommands

### `save <name>`

Save the current environment variables as a named snapshot.

```bash
snapenv snapshot save dev
```

By default, reads from `.env` in the current directory. Use `--env` to specify a different file:

```bash
snapenv snapshot save staging --env .env.staging
```

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `--env <file>` | Path to the env file to snapshot | `.env` |

---

### `list`

List all saved snapshots for the current project.

```bash
snapenv snapshot list
```

Example output:

```
Available snapshots:
  - dev
  - staging
  - prod
```

---

### `delete <name>`

Delete a saved snapshot by name.

```bash
snapenv snapshot delete staging
```

---

## Examples

```bash
# Save your current dev environment
snapenv snapshot save dev

# Save a staging config from a separate file
snapenv snapshot save staging --env .env.staging

# See what snapshots you have
snapenv snapshot list

# Clean up an old snapshot
snapenv snapshot delete old-feature-branch
```

## Notes

- Snapshots are stored in the `.snapenv/` directory at your project root.
- Snapshot files are JSON and can be inspected or committed to version control.
- Use `snapenv restore <name>` to apply a snapshot back to your `.env` file.
