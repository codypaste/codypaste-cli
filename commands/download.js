const fs = require("fs");
const {
  resolve,
  parse,
  format
} = require("path");
const request = require("request-promise");
const chalk = require("chalk");
const {
  decrypt
} = require('../utils/utils');

const saveFile = async (path, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

const getSnippets = async id => {
  const payload = {
    groupId: id
  };

  const requestOptions = {
    method: "POST",
    uri: "https://api.codypaste.io/groups/_search",
    body: payload,
    json: true
  };

  const res = await request.post(requestOptions);
  return res;
};

const download = async (id, key, output) => {
  const {
    snippets
  } = await getSnippets(id);
  const decrypted = snippets.map(snippet => {
    return {
      snippetName: decrypt(snippet.snippetName, key),
      snippet: decrypt(snippet.snippet, key)
    };
  });

  const absolutePath = resolve(output);
  const parsedPath = parse(absolutePath);
  const originalBase = parsedPath.base;

  for (let i = 0; i < decrypted.length; i++) {
    if (i > 0) {
      parsedPath.base = `${i}_${originalBase}`;
    }

    await saveFile(format(parsedPath), decrypted[i].snippet);
    console.log(chalk.green(`Saved file under ${format(parsedPath)}`));
  }
};

module.exports = {
  download,
  saveFile,
  getSnippets
};