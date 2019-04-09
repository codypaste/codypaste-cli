import test from "ava";
const fs = require('fs');
const sinon = require('sinon');
const request = require('request-promise');

const {
    download,
    getSnippets,
    saveFile
} = require('../../commands/download');

test.afterEach(t => {
    sinon.restore();
});

test("saveFile should successfully save file", async t => {
    const mock = sinon.mock(fs);
    mock.expects("writeFile").once().yields(null, "2");

    await saveFile('/tmp/test.txt', 'abc');

    mock.verify()
});

test("getSnippets should successfully return array of snippets", async t => {
    const mock = sinon.mock(request);
    mock.expects("post").once().resolves([1, 2]);

    const res = await getSnippets("2");

    t.deepEqual(res, [1, 2]);

    mock.verify();
});