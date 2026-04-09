# Import Command

Import environment variables from external files into snapenv snapshots.

## Usage

```bash
snapenv import <file> <snapshot-name> [options]
```

## Arguments

- `<file>` - Path to the file to import from
- `<snapshot-name>` - Name for the snapshot to create or update

## Options

- `--format <format>` - Specify input format: `dotenv`, `json`, `shell`, or `auto` (default: auto)
- `--merge` - Merge with existing snapshot instead of replacing
- `--overwrite` - Allow overwriting existing snapshot (without merge)

## Supported Formats

### Dotenv (.env)

```env
NODE_ENV=production
API_KEY=secret123
PORT=3000
```

### JSON

```json
{
  "NODE_ENV": "production",
  "API_KEY": "secret123",
  "PORT": "3000"
}
```

### Shell Export

```bash
export NODE_ENV="production"
export API_KEY="secret123"
export PORT="3000"
```

## Examples

### Import from .env file

```bash
snapenv import .env.production prod-config
```

### Import JSON file

```bash
snapenv import config.json dev-config --format json
```

### Import and merge with existing snapshot

```bash
snapenv import additional-vars.env my-config --merge
```

### Import shell export file

```bash
snapenv import exports.sh shell-config --format shell
```

## Auto-detection

By default, snapenv automatically detects the file format based on:

1. File extension (`.env`, `.json`, `.sh`)
2. Content analysis (JSON parsing, export statements)

You can override auto-detection with the `--format` option.

## Merge Behavior

When using `--merge`:

- Existing variables in the snapshot are preserved
- New variables from the file are added
- Conflicting variables are overwritten with values from the file
- A summary shows what was added, updated, and unchanged

## Error Handling

- File not found: Clear error message with file path
- Invalid format: Suggestions for correct format
- Parse errors: Detailed information about what went wrong
- Duplicate snapshot: Requires `--overwrite` or `--merge` flag
