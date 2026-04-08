# snapenv

> CLI tool to snapshot and restore local environment variables across projects

---

## Installation

```bash
npm install -g snapenv
```

---

## Usage

Snapshot your current environment variables:

```bash
snapenv save --name myproject
```

Restore a previously saved snapshot:

```bash
snapenv restore --name myproject
```

List all saved snapshots:

```bash
snapenv list
```

Delete a snapshot:

```bash
snapenv delete --name myproject
```

Snapshots are stored locally in `~/.snapenv/` and are scoped by name, making it easy to switch between project environments without manually managing `.env` files.

---

## Example Workflow

```bash
# Save current environment before switching projects
snapenv save --name project-a

# Switch to another project and restore its environment
snapenv restore --name project-b
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)