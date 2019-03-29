const program = require("commander");
const { resolve, parse } = require("path");
const fs = require("fs");
const uuid = require("uuid");
const request = require("request-promise");
const aesjs = require("aes-js");
const chalk = require('chalk');

const buildUrl = (id, key) => {
  return `https://codypaste.io/view/${id}?key=${key}`;
};

const generate256BitKey = () => {
  const u = uuid.v4();
  const normalized = u
    .split("")
    .filter(char => char !== "-")
    .join("");
  const key = normalized.split("").map(char => char.charCodeAt(0));
  return { normalized, key };
};

const encrypt = (content, key) => {
  const textBytes = aesjs.utils.utf8.toBytes(content);

  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  const encryptedBytes = aesCtr.encrypt(textBytes);

  const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
  return encryptedHex;
};

const decrypt = (encrypted, key) => {
  try {
    const encryptedBytes = aesjs.utils.hex.toBytes(encrypted);

    const k = key.split("").map(char => char.charCodeAt(0));
    const aesCtr = new aesjs.ModeOfOperation.ctr(k, new aesjs.Counter(5));
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);

    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText;
  } catch (e) {
    throw new EncryptionError();
  }
};

const readFile = async path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: "utf8" }, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

const createGroup = async title => {
  const payload = {
    isEncrypted: true,
    isPublic: true,
    title
  };

  const requestOptions = {
    method: "POST",
    uri: "https://api.codypaste.io/groups",
    body: payload,
    json: true
  };

  const { id } = await request(requestOptions);
  return id;
};

const createSnippet = async (groupId, snippetContent, snippetName) => {
  const payload = {
    group: groupId,
    snippet: snippetContent,
    snippetName,
    syntax: "Plain Text"
  };

  const requestOptions = {
    method: "POST",
    uri: "https://api.codypaste.io/snippets",
    body: payload,
    json: true
  };

  await request(requestOptions);
};

const publish = async relativePathToFile => {
  const absolutePathToFile = resolve(relativePathToFile);
  const content = await readFile(absolutePathToFile);
  const { key, normalized } = generate256BitKey();
  const encryptedContent = encrypt(content, key);
  const { base: filename } = parse(absolutePathToFile);
  const encryptedTitle = encrypt(filename, key);
  const groupId = await createGroup(encryptedTitle);
  await createSnippet(groupId, encryptedContent, encryptedTitle);
  const url = buildUrl(groupId, normalized);
    console.log(chalk.green('ID:  ', chalk.magenta(groupId)));
    console.log(chalk.green('Key: ', chalk.magenta(normalized)));
    console.log(chalk.green('URL: ', chalk.magenta(url)));
};

program
  .version("0.1.0")
  .command("publish <file>")
  .action(async file => {
    await publish(file);
  });

program.parse(process.argv);
