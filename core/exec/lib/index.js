'use strict';

module.exports = exec;

const path = require('path');

const Package = require('@echo-cli/package');
const log = require('@echo-cli/log');

const SETTINGS = {
    init: '@imooc-cli/init'
};

const CACHE_DIR = 'dependence';

async function exec() {

    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME;
    let storePath = '';

    log.verbose('homePath', homePath);

    const cmdObj = arguments[arguments.length - 1];
    const packageName = SETTINGS[cmdObj.name()];
    const packageVersion = 'latest';

    let pkg = new Package({
        targetPath,
        storePath,
        packageName,
        packageVersion
    });

    if (!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR);
        storePath = path.resolve(targetPath, 'node_modules');

        log.verbose('targetPath', targetPath);


        pkg = new Package({
            targetPath,
            storePath,
            packageName,
            packageVersion
        });

        if (pkg.exists()) {
            // 更新package
            console.log(88, '文件存在')
        } else {
            // 安装package
            await pkg.install();
        }
    } else {
        pkg = new Package({
            targetPath,
            storePath,
            packageName,
            packageVersion
        });
    }

    const rootFile = pkg.getFileRootPath();

    if (rootFile) {
        require(rootFile).apply(null, arguments);
    }
}
