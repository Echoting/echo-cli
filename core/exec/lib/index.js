'use strict';

module.exports = exec;

const Package = require('@echo-cli/package');

function exec() {

    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME;

    const cmdObj = arguments[arguments.length - 1];
    const packageName = cmdObj.name();
    const packageVersion = 'latest';

    if (!targetPath) {
        targetPath = '';
    }

    const pkg = new Package({
        targetPath,
        packageName,
        packageVersion
    });

    console.log(111, pkg.getFileRootPath())
}
