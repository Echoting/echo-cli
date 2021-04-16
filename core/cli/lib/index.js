'use strict';

module.exports = index;

// reqire .js/.json / .node
// .js ==> module.exports / exports
// .json ==> JSON.parse
// .node ==> process.dlopen
// 其他任何文件 通过 .js 进行解析

const path = require('path');

const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists');
const dedent = require('dedent');
const { Command } = require('commander');

const pkg = require('../package.json');
const log = require('@echo-cli/log');
const constant = require('./const');

const init = require('@echo-cli/init');

let config;
const program = new Command();

async function index(argv) {
	try {
        checkPkgVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
        // checkInputArgs();
        log.verbose('verbose', 'test');
        checkEnv();
        await checkGlobalUpdate();

        registerCommand();
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
    log.verbose('环境变量', process.env.CLI_HOME);
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

// ----- 第二阶段：命令注册 ------
function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d, --debug', '开启debug模式', false);

    program
        .command('init [projectName]')
        .option('-f, --force', '是否强制初始化项目')
        .action(init)

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