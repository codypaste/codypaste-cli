#!/usr/bin/env node

const program = require("commander");
const chalk = require("chalk");
const { version } = require("./package.json");
const { download } = require('./commands/download');
const { publish } = require('./commands/publish');


program
  .command("download <id> <key> <output_file>")
  .action(async (id, key, output) => {
    try {
      await download(id, key, output);
    } catch (e) {
      console.log(chalk.red(`Something went wrong: ${e}`));
    }
  });

program.command("publish <file>").action(async file => {
  try {
    await publish(file);
  } catch (e) {
    console.log(chalk.red(`Something went wrong: ${e}`));
  }
});

program.version(version).parse(process.argv);
