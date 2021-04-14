'use strict';

module.exports = index;

// reqire .js/.json / .node
// .js ==> module.exports / exports
// .json ==> JSON.parse
// .node ==> process.dlopen
// 其他任何文件 通过 .js 进行解析
const semver = require('semver');
const colors = require('colors/safe');
const pkg = require('../package.json');
const log = require('@echo-cli/log');
const constant = require('./const');

function index(argv) {
	try {
        checkPkgVersion();
        checkNodeVersion();
    } catch (e) {
		log.error(e.message);
    }

}

// 需要检查Node版本，较低版本的Node不支持
function checkNodeVersion() {
	const curentNodeVersion = process.version;
	const lowestNodeVersion = constant.LOWEST_NODE_VERSION;

	if (!semver.gte(curentNodeVersion, lowestNodeVersion)) {
		throw new Error(colors.red(`echo-cli 需要安装 v${lowestNodeVersion} 以上版本的 node.js`));
	}
}

// 检测当前版本
function checkPkgVersion() {
	log.info('version', pkg.version);
}
