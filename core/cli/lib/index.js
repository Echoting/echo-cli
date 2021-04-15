'use strict';

module.exports = index;

// reqire .js/.json / .node
// .js ==> module.exports / exports
// .json ==> JSON.parse
// .node ==> process.dlopen
// 其他任何文件 通过 .js 进行解析
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').async;

const pkg = require('../package.json');
const log = require('@echo-cli/log');
const constant = require('./const');

function index(argv) {
	try {
        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
        checkInputArgs();
        log.verbose('verbose', 'test');
    } catch (e) {
		log.error(e.message);
    }

}

// 检测当前版本
function checkPkgVersion() {
    log.info('version', pkg.version);
}


// 需要检查Node版本，较低版本的Node不支持
function checkNodeVersion() {
	const curentNodeVersion = process.version;
	const lowestNodeVersion = constant.LOWEST_NODE_VERSION;

	if (!semver.gte(curentNodeVersion, lowestNodeVersion)) {
		throw new Error(colors.red(`echo-cli 需要安装 v${lowestNodeVersion} 以上版本的 node.js`));
	}
}

// 检查是否root账户启动，如果是则自动降级
function checkRoot() {
	const rootCheck = require('root-check');
    rootCheck();
}

// 检查用户主目录
function checkUserHome() {
	console.log(userHome)
}

// 检查入参，看是否开启了debug模式
function checkInputArgs() {
    const minimist = require('minimist');
    const args = minimist(process.argv.slice(2));

    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose';
    } else {
        process.env.LOG_LEVEL = 'info';
    }

    // 需要对log.level重新赋值，因为require在前面
    log.level = process.env.LOG_LEVEL;

}