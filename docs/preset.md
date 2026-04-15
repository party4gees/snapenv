# snapenv preset

Manage named presets — collections of snapshots grouped under a single name for quick reference or batch operations.

## Usage

```
snapenv preset <subcommand> [options]
```

## Subcommands

### save

Save a named preset referencing one or more existing snapshots.

```
snapenv preset save <name> <snap1> [snap2...]
```

All snapshot names must already exist. The preset stores their names and a creation timestamp.

**Example:**
```
snapenv preset save staging-stack base-config feature-flags
```

### get

Display the snapshots associated with a preset.

```
snapenv preset get <name>
```

**Example:**
```
snapenv preset get staging-stack
# Preset "staging-stack": base-config, feature-flags
```

### delete

Remove a preset by name. Does not delete the underlying snapshots.

```
snapenv preset delete <name>
```

**Example:**
```
snapenv preset delete staging-stack
```

### list

List all saved presets with their snapshot members and creation dates.

```
snapenv preset list
```

**Example output:**
```
  staging-stack: [base-config, feature-flags] (created 2024-06-01)
  dev-defaults: [dev] (created 2024-05-20)
```

## Storage

Presets are stored in `.snapenv/presets.json` within your project directory.

## Notes

- Presets are references only — renaming or deleting a snapshot will not automatically update presets that reference it.
- Use `snapenv preset list` to audit stale references before cleanup operations.
