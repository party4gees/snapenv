# snapenv share

Create, inspect, revoke, and list shareable snapshot bundles. A share bundle packages a snapshot's variables into a portable JSON file identified by a unique token.

## Usage

```
snapenv share <subcommand> [options]
```

## Subcommands

### create

```
snapenv share create <snapshot> [--ttl <hours>] [--note <text>]
```

Packages the named snapshot into a share bundle and prints the token.

**Options:**

| Flag | Description |
|------|-------------|
| `--ttl <hours>` | Optional expiry in hours from now |
| `--note <text>` | Optional human-readable note |

**Example:**

```bash
snapenv share create production --ttl 24 --note "share with ops team"
# Token:    a3f9c2b1d4e7f0a1b2c3
# Snapshot: production
# Created:  2024-06-01T10:00:00.000Z
# Expires:  2024-06-02T10:00:00.000Z
# Note:     share with ops team
```

### resolve

```
snapenv share resolve <token>
```

Displays metadata and contents associated with a share token. Warns if the bundle has expired.

**Example:**

```bash
snapenv share resolve a3f9c2b1d4e7f0a1b2c3
```

### revoke

```
snapenv share revoke <token>
```

Deletes the share bundle file and removes it from the share index.

**Example:**

```bash
snapenv share revoke a3f9c2b1d4e7f0a1b2c3
# Revoked share bundle a3f9c2b1d4e7f0a1b2c3.
```

### list

```
snapenv share list
```

Lists all active share bundles with their tokens, snapshot names, and expiry info.

**Example:**

```bash
snapenv share list
# a3f9c2b1d4e7f0a1b2c3  production  (expires 2024-06-02T10:00:00.000Z)  share with ops team
```

## Share bundle format

Bundles are stored as JSON files in the `.snapenv/` directory:

```json
{
  "token": "a3f9c2b1d4e7f0a1b2c3",
  "snapshotName": "production",
  "vars": { "API_KEY": "...", "DB_URL": "..." },
  "createdAt": "2024-06-01T10:00:00.000Z",
  "expiresAt": "2024-06-02T10:00:00.000Z",
  "note": "share with ops team"
}
```

> **Note:** Share bundles contain plaintext variable values. Avoid sharing sensitive secrets over untrusted channels. Consider using `snapenv encrypt` before sharing.
