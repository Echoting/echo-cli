'use strict';

module.exports = index;

// reqire .js/.json / .node
// .js ==> module.exports / exports
// .json ==> JSON.parse
// .node ==> process.dlopen
// 其他任何文件 通过 .js 进行解析
const pkg = require('../package.json');
const log = require('@echo-cli/log');

function index(argv) {
    checkPkgVersion();
}

function checkPkgVersion() {
	log.info('version', pkg.version);
}
