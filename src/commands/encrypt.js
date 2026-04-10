const { encryptSnapshot, decryptSnapshot, isEncrypted } = require('../encrypt');
const { loadSnapshot, saveSnapshot } = require('../snapshot');

function printEncryptUsage() {
  console.log(`
Usage: snapenv encrypt <command> <snapshot> [options]

Commands:
  encrypt lock <snapshot>    Encrypt a snapshot with a passphrase
  encrypt unlock <snapshot>  Decrypt a snapshot with a passphrase
  encrypt status <snapshot>  Check if a snapshot is encrypted

Options:
  --passphrase <pass>  Passphrase to use (not recommended; use prompt instead)
  --help               Show this help message
`);
}

async function runEncrypt(args) {
  const [subcommand, snapshotName, ...rest] = args;

  if (!subcommand || subcommand === '--help') {
    printEncryptUsage();
    return;
  }

  if (!snapshotName) {
    console.error('Error: snapshot name is required.');
    process.exit(1);
  }

  const passphraseFlag = rest.indexOf('--passphrase');
  let passphrase = passphraseFlag !== -1 ? rest[passphraseFlag + 1] : null;

  if (!passphrase && subcommand !== 'status') {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    passphrase = await new Promise((resolve) => {
      rl.question('Passphrase: ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  const data = loadSnapshot(snapshotName);
  if (!data) {
    console.error(`Error: snapshot "${snapshotName}" not found.`);
    process.exit(1);
  }

  if (subcommand === 'status') {
    const encrypted = isEncrypted(data);
    console.log(`Snapshot "${snapshotName}" is ${encrypted ? 'encrypted' : 'not encrypted'}.`);
    return;
  }

  if (subcommand === 'lock') {
    if (isEncrypted(data)) {
      console.error(`Error: snapshot "${snapshotName}" is already encrypted.`);
      process.exit(1);
    }
    const encrypted = encryptSnapshot(data, passphrase);
    saveSnapshot(snapshotName, encrypted);
    console.log(`Snapshot "${snapshotName}" encrypted successfully.`);
    return;
  }

  if (subcommand === 'unlock') {
    if (!isEncrypted(data)) {
      console.error(`Error: snapshot "${snapshotName}" is not encrypted.`);
      process.exit(1);
    }
    const decrypted = decryptSnapshot(data, passphrase);
    saveSnapshot(snapshotName, decrypted);
    console.log(`Snapshot "${snapshotName}" decrypted successfully.`);
    return;
  }

  console.error(`Unknown subcommand: ${subcommand}`);
  printEncryptUsage();
  process.exit(1);
}

module.exports = { printEncryptUsage, runEncrypt };
