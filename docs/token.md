# snapenv token

Manage access tokens for snapshots. Tokens can be used to reference a snapshot by an opaque ID, optionally with an expiry date.

## Usage

```
snapenv token <subcommand> [options]
```

## Subcommands

### create

Create a new token linked to a snapshot.

```
snapenv token create <label> <snapshot> [--expires <days>]
```

**Arguments:**
- `label` — Human-readable name for the token
- `snapshot` — Name of the snapshot this token grants access to
- `--expires <days>` — Optional number of days until the token expires

**Example:**
```
snapenv token create ci-deploy prod --expires 30
```

### revoke

Revoke a token by its ID so it can no longer be resolved.

```
snapenv token revoke <token-id>
```

**Example:**
```
snapenv token revoke a3f9c2b1...
```

### resolve

Resolve a token ID to its associated snapshot name. Returns an error if the token is expired or not found.

```
snapenv token resolve <token-id>
```

**Example:**
```
snapenv token resolve a3f9c2b1...
# Snapshot: prod
```

### list

List all tokens with their labels, linked snapshots, and expiry dates.

```
snapenv token list
```

**Example output:**
```
  a3f9c2b1d4e5...  label=ci-deploy  snapshot=prod  expires=2025-08-01T00:00:00.000Z
  7b2e1f3c9a0d...  label=local-dev  snapshot=dev   expires=never
```

## Storage

Tokens are stored in `.snapenv/tokens.json` within the snapenv directory.

## Notes

- Token IDs are 48-character hex strings generated with `crypto.randomBytes`.
- Expired tokens are not returned by `resolve` but remain in storage until revoked.
- Use `revoke` to clean up tokens that are no longer needed.
