const fs = require("fs");
const request = require("request-promise");

const DownloadCommand = require("../../commands/download");

jest.mock("fs");
jest.mock("request");

afterEach(() => {
  jest.resetAllMocks();
});

test("saveFile should successfully save file", async () => {
  expect.assertions(1);
  fs.writeFile.mockImplementation((path, content, cb) => {
    return cb(null);
  });
  await DownloadCommand.saveFile("/tmp/test.txt", "abc");
  expect(fs.writeFile).toHaveBeenCalledTimes(1);
});

test("getSnippets should successfully return array of snippets", async () => {
  expect.assertions(1);
  request.post.mockResolvedValue([1, 2]);
  const res = await DownloadCommand.getSnippets(123);
  expect(res).toEqual([1, 2]);
});

test("download should successfully download snippets, decode them and save to file", async () => {
  expect.assertions(3);

  const consoleSpy = jest.spyOn(console, "log");

  fs.writeFile.mockImplementation((path, content, cb) => {
    return cb(null);
  });

  request.post.mockResolvedValue({
    snippets: [
      {
        snippet: "83fd",
        snippetName: "b7f16e26b1cc52f1072b"
      },
      {
        snippet: "81fb",
        snippetName: "b7f16e26b1cc52f10728"
      }
    ]
  });

  await DownloadCommand.download(
    1,
    "2fd2f540dceb425f90f4de1bd222ccfe",
    "./output.txt"
  );

  expect(fs.writeFile).toHaveBeenCalledTimes(2);
  expect(request.post).toHaveBeenCalledTimes(1);
  expect(consoleSpy).toHaveBeenCalledTimes(2);
});
