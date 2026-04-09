# Export Command

Export snapshots to various formats for portability and integration with other tools.

## Usage

```bash
snapenv export <snapshot-name> [options]
```

## Options

- `-f, --format <format>` - Export format: `env`, `json`, or `shell` (default: `env`)
- `-o, --output <file>` - Output file path (default: stdout)
- `-h, --help` - Show help message

## Formats

### ENV Format (default)

Standard `.env` file format compatible with dotenv libraries:

```bash
snapenv export production
```

Output:
```
API_KEY=secret123
DATABASE_URL=postgres://localhost
DEBUG=true
```

### JSON Format

Structured JSON with metadata:

```bash
snapenv export production -f json
```

Output:
```json
{
  "name": "production",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "variables": {
    "API_KEY": "secret123",
    "DATABASE_URL": "postgres://localhost",
    "DEBUG": "true"
  }
}
```

### Shell Format

Shell export statements that can be sourced:

```bash
snapenv export production -f shell
```

Output:
```bash
export API_KEY='secret123'
export DATABASE_URL='postgres://localhost'
export DEBUG='true'
```

## Examples

### Export to stdout

Print snapshot in .env format:
```bash
snapenv export production
```

Print snapshot in JSON format:
```bash
snapenv export production -f json
```

### Export to file

Create a backup .env file:
```bash
snapenv export production -o .env.backup
```

Export as shell script:
```bash
snapenv export production -f shell -o vars.sh
chmod +x vars.sh
source vars.sh  # Load variables into current shell
```

Export as JSON for processing:
```bash
snapenv export production -f json -o config.json
```

## Use Cases

### Backup before changes
```bash
snapenv export current -o .env.backup
# Make changes to .env
# If needed, restore: cp .env.backup .env
```

### Share with team (non-sensitive)
```bash
snapenv export development -f json -o team-config.json
# Commit team-config.json to repo (ensure no secrets!)
```

### Load into shell session
```bash
snapenv export production -f shell -o /tmp/prod-vars.sh
source /tmp/prod-vars.sh
echo $API_KEY  # Variables now available in shell
```

### Integration with CI/CD
```bash
# Export to format expected by deployment tool
snapenv export staging -o .env.staging
docker run --env-file .env.staging myapp
```

## Notes

- Shell format escapes single quotes in values for safe sourcing
- JSON format includes snapshot metadata (name, timestamp)
- ENV format is compatible with most dotenv parsers
- When outputting to stdout, you can pipe to other commands:
  ```bash
  snapenv export prod | grep API_KEY
  snapenv export prod -f json | jq '.variables.DATABASE_URL'
  ```
