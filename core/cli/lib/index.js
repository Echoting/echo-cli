'use strict';

module.exports = core;

// reqire .js/.json / .node
// .js ==> module.exports / exports
// .json ==> JSON.parse
// .node ==> process.dlopen
// 其他任何文件 通过 .js 进行解析

const path = require('path');

const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;
const dedent = require('dedent');
const { Command } = require('commander');

const pkg = require('../package.json');
const log = require('@echo-cli/log');
const constant = require('./const');

const init = require('@echo-cli/init');
const exec = require('@echo-cli/exec');

let config;
const program = new Command();

async function core() {
	try {
        await prepare();
        registerCommand();
    } catch (e) {
		log.error(e.message);
		if (program.opts().debug) {
		    log.error(e);
        }
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
	if (!userHome || !pathExists(userHome)) {
	    throw new Error(colors.red('当前登录用户主目录不存在!'));
    }
}

function checkEnv() {
    const dotEnv = require('dotenv');
    const envPath = path.resolve(userHome, '.env');

    if (pathExists(envPath)) {
        // dotEnv是将 .env中配置的参数放置在 process.env中
        config = dotEnv.config({
            path: envPath
        });
    }
    createDefaultConfigPath();
}

function createDefaultConfigPath() {
    let cliHomePath = '';
    if (process.env.CLI_HOME) {
        cliHomePath = path.join(userHome, process.env.CLI_HOME);
    } else {
        cliHomePath = path.join(userHome, constant.CLI_HOME_PATH);
    }
    process.env.CLI_HOME = cliHomePath;
}

async function checkGlobalUpdate() {
    // 获取当前版本号和模块名称
    const currentVersion = pkg.version;
    const pkgName = pkg.name;
    // 调用npm Api，获取所有版本号
    const {getNpmInfo} = require('@echo-cli/get-npm-info');
    const npmInfo = await getNpmInfo(pkgName);

    // 提取所有版本号，比对哪些版本号是大于当前版本号的
    const versions = npmInfo.versions;
    const latestVersion = Object.keys(versions)[0];
    // 获取最新版本号，提醒用户更新到最新
    if(latestVersion && semver.gt(latestVersion, currentVersion)) {
        log.warn('更新提示', colors.yellow(
            dedent`
                请更新 ${pkgName}
                当前版本: ${currentVersion}
                最新版本: ${latestVersion}
                更新命令: npm install -g ${pkgName}@${latestVersion}
            `))
    }
}

// ------ 第一阶段: 准备阶段 ------
async function prepare() {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkEnv();
    await checkGlobalUpdate();
}

// ----- 第二阶段：命令注册 ------
function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d, --debug', '开启debug模式', false)
        .option('-tp, --targetPath <targetPath>', '是否指定本地调试路径', false);

    program
        .command('init [projectName]')
        .option('-f, --force', '是否强制初始化项目')
        .action(exec)

    program.on('option:debug', function() {
        const options = program.opts();
        if (options.debug) {
            process.env.LOG_LEVEL = 'verbose';
        } else {
            process.env.LOG_LEVEL = 'info';
        }

        // 需要对log.level重新赋值，因为require在前面
        log.level = process.env.LOG_LEVEL;
        log.verbose('test', 'debug');
    });

    program.on('option:targetPath', function() {
        const options = program.opts();
        process.env.CLI_TARGET_PATH = options.targetPath;
    });

    program.on('command:*', function (operands) {
        console.error(colors.red(`error: unknown command '${operands[0]}'`));
        const availableCommands = program.commands.map(cmd => cmd.name());
        mySuggestBestMatch(operands[0], availableCommands);
        process.exitCode = 1;
    });

    if (process.argv.length < 3) {
        program.outputHelp();
    }

    program.parse(process.argv);
}