# Restore Command

Restore environment variables from a snapshot to your `.env` file.

## Usage

```bash
snapenv restore <snapshot-name> [options]
```

## Arguments

- `<snapshot-name>` - Name of the snapshot to restore from

## Options

- `--env-file <path>` - Path to .env file (default: `.env`)
- `--merge` - Merge with existing .env instead of replacing
- `--backup` - Create backup of existing .env before restoring
- `--dry-run` - Show what would be restored without making changes

## Examples

### Basic restore

```bash
snapenv restore prod-config
```

Restores `prod-config` snapshot to `.env`, replacing existing content.

### Restore with backup

```bash
snapenv restore prod-config --backup
```

Creates `.env.backup` before restoring.

### Merge restore

```bash
snapenv restore additional-vars --merge
```

Merges snapshot variables with existing `.env` file:
- Keeps existing variables not in snapshot
- Updates variables that exist in both
- Adds new variables from snapshot

### Restore to custom file

```bash
snapenv restore dev-config --env-file .env.local
```

### Dry run

```bash
snapenv restore prod-config --dry-run
```

Shows what changes would be made without modifying files.

## Restore Summary

After restoring, snapenv shows:

- Number of variables restored
- List of variable names
- Whether merge or replace was performed
- Path to the .env file

## Safety Features

- **Backup option**: Preserve your current .env
- **Dry run**: Preview changes before applying
- **Merge mode**: Combine snapshots without losing existing variables
- **Confirmation**: Shows summary of what was restored

## Common Workflows

### Switch between environments

```bash
# Save current state
snapenv snapshot dev-current

# Switch to production
snapenv restore prod-config --backup

# Switch back
snapenv restore dev-current
```

### Safe production deployment

```bash
# Preview changes
snapenv restore prod-config --dry-run

# Apply with backup
snapenv restore prod-config --backup
```
