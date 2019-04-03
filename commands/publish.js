const fs = require("fs");
const { resolve, parse } = require("path");
const request = require("request-promise");
const chalk = require("chalk");
const { encrypt, generate256BitKey, buildUrl } = require('../utils/utils');

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
  console.log(chalk.green("ID:  ", chalk.magenta(groupId)));
  console.log(chalk.green("Key: ", chalk.magenta(normalized)));
  console.log(chalk.green("URL: ", chalk.magenta(url)));
};

module.exports = { publish };
