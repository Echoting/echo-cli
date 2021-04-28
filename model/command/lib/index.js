'use strict';

const LOWEST_NODE_VERSION = '10.0.0';
const semver = require('semver');
const colors = require('colors');

const log = require('@echo-cli/log');

class Command {
    constructor(argv) {
        console.log('command constructor', argv);
        this._argv = argv;

        let runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve();
            chain = chain.then(() => { this.checkNodeVersion()});
            chain = chain.then(() => { this.initArgs()});
            chain.catch(err => {
                log.error(err.message);
            })
        })
    }

    // 需要检查Node版本，较低版本的Node不支持
    checkNodeVersion() {
        const curentNodeVersion = process.version;
        const lowestNodeVersion = LOWEST_NODE_VERSION;

        if (!semver.gte(curentNodeVersion, lowestNodeVersion)) {
            throw new Error(colors.red(`echo-cli 需要安装 v${lowestNodeVersion} 以上版本的 node.js`));
        }
    }

    initArgs() {

    }

    init() {
        throw new Error('init 方法必须实现');

    }

    exec() {
        throw new Error('exec 方法必须实现');
    }
}



module.exports = Command;
