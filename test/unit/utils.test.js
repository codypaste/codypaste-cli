const check = require("check-types");
const _ = require("lodash");
const {
  buildUrl,
  decrypt,
  encrypt,
  generate256BitKey
} = require("../../utils/utils");

test("buildUrl should build correct view url for codypaste website", () => {
  const id = 1;
  const key = 2;
  const url = buildUrl(id, key);

  expect(url).toBe("https://codypaste.io/view/1?key=2");
});

test("encrypt should successfully encrypt string", () => {
  const stringToEncrypt = "abc def";
  const { key } = generate256BitKey();
  const encrypted = encrypt(stringToEncrypt, key);

  expect(encrypted).not.toBe(stringToEncrypt);
});

test("decrypt should successfully decrypt string", () => {
  const stringToEncrypt = "abc def";
  const { key, normalized } = generate256BitKey();
  const encrypted = encrypt(stringToEncrypt, key);

  const decrypted = decrypt(encrypted, normalized);

  expect(decrypted).toBe(stringToEncrypt);
});

test("generate256BitKey should generate 256 bit key normalized and in array buffer", () => {
  const { key, normalized } = generate256BitKey();

  expect(check.array(key)).toBe(true);
  expect(key).toHaveLength(32);

  expect(check.string(normalized)).toBe(true);
  expect(normalized).toHaveLength(32);
});

test("generate256BitKey should always generate different key", () => {
  const keys = [];
  const normalizedKeys = [];

  for (let i = 0; i < 100; i++) {
    const { key, normalized } = generate256BitKey();
    keys.push(key);
    normalizedKeys.push(normalized);
  }

  expect(keys).toHaveLength(100);
  expect(normalizedKeys).toHaveLength(100);

  const uniqueKeys = _.uniq(keys);
  const uniqueNormalizedKeys = _.uniq(normalizedKeys);

  expect(uniqueKeys).toHaveLength(100);
  expect(uniqueNormalizedKeys).toHaveLength(100);
});
