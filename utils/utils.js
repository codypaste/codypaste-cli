const aesjs = require("aes-js");
const uuid = require("uuid");

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
  const encryptedBytes = aesjs.utils.hex.toBytes(encrypted);

  const k = key.split("").map(char => char.charCodeAt(0));
  const aesCtr = new aesjs.ModeOfOperation.ctr(k, new aesjs.Counter(5));
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);

  const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  return decryptedText;
};

module.exports = { buildUrl, generate256BitKey, encrypt, decrypt };
