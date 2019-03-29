const program = require('commander');
const {resolve} = require('path');

program
    .version('0.1.0')
    .command('publish <file>')
    .action((file) => {
        const resolved = resolve(file);
        console.log(resolved);
    });

program.parse(process.argv);