import test from "ava";
const check = require("check-types");
const _ = require("lodash");
const {
  buildUrl,
  decrypt,
  encrypt,
  generate256BitKey
} = require("../../utils/utils");

test("buildUrl should build correct view url for codypaste website", t => {
  const id = 1;
  const key = 2;
  const url = buildUrl(id, key);

  t.is(url, "https://codypaste.io/view/1?key=2");
});

test("encrypt should successfully encrypt string", async t => {
  const stringToEncrypt = "abc def";
  const { key } = generate256BitKey();
  const encrypted = encrypt(stringToEncrypt, key);

  t.not(encrypted, stringToEncrypt);
});

test("decrypt should successfully decrypt string", async t => {
  const stringToEncrypt = "abc def";
  const { key, normalized } = generate256BitKey();
  const encrypted = encrypt(stringToEncrypt, key);

  const decrypted = decrypt(encrypted, normalized);

  t.is(decrypted, stringToEncrypt);
});

test("generate256BitKey should generate 256 bit key normalized and in array buffer", async t => {
  const { key, normalized } = generate256BitKey();

  t.truthy(check.array(key));
  t.is(key.length, 32);

  t.truthy(check.string(normalized));
  t.is(normalized.length, 32);
});

test("generate256BitKey should always generate different key", async t => {
  const keys = [];
  const normalizedKeys = [];

  for (let i = 0; i < 100; i++) {
    const { key, normalized } = generate256BitKey();
    keys.push(key);
    normalizedKeys.push(normalized);
  }

  t.is(keys.length, 100);
  t.is(normalizedKeys.length, 100);

  const uniqueKeys = _.uniq(keys);
  const uniqueNormalizedKeys = _.uniq(normalizedKeys);
  t.is(uniqueKeys.length, keys.length);
  t.is(uniqueNormalizedKeys.length, normalizedKeys.length);
});
