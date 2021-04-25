'use strict';
const path = require('path');

const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall');
const pathExists = require('path-exists');

const {isObject} = require('@echo-cli/utils');
const formatPaht = require('@echo-cli/format-path');
const log = require('@echo-cli/log');
const {getDefaultRegistry, getNpmLatestVersion} = require('@echo-cli/get-npm-info');

class Package {
    constructor(options) {
        if (!options) {
            throw new Error('options 不能为空');
        }
        if (!isObject(options)) {
            throw new Error('options 必须为 JOSN 对象');
        }

        // package的路径
        this.targetPath = options.targetPath;
        // package的存储路径
        this.storePath = options.storePath;
        // packageName
        this.packageName = options.packageName;
        // versiom
        this.packageVersion = options.packageVersion;

        // 缓存路径前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_');
        log.verbose('options', options);
        log.verbose('cacheFilePathPrefix', this.cacheFilePathPrefix);
    }

    async prepare() {
        if (this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatestVersion(this.packageName);
        }
    }

    get cacheFilePath() {
        // _@imooc-cli_init@1.1.2@@imooc-cli
        return path.resolve(this.storePath, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
    }

    // 判断当前Package是否存在
    async exists() {
        // 如果storePath存在说明走的是缓存
        if (this.storePath) {
            await this.prepare();
            log.verbose('cacheFilePath', this.cacheFilePath);
            return pathExists(this.cacheFilePath);
        } else {
            // 走的不是缓存，只需要判断 targetPath 存在不，就能知道包是否存在
            return pathExists(this.targetPath);
        }

    }

    // 安装Package
    async install() {
        await this.prepare();
        return npminstall({
            root: this.targetPath,
            storeDir: this.storePath,
            registry: getDefaultRegistry(),
            pkgs: [
              { name: this.packageName, version: this.packageVersion },
            ],
        })
    }

    // 更新Package
    update() {

    }

    // 获取入口文件
    getFileRootPath() {
        // 1、获取package.json所在目录 -- pkg-dir
        const packageDir = pkgDir(this.targetPath);

        if (packageDir) {
            // 2、读取package.json
            const pkgFile = require(path.resolve(packageDir, 'package.json'));

            // 3、寻找 main/lib
            if (pkgFile && pkgFile.main) {

                // 4、路径的兼容（macos 和 windows）
                return formatPaht(path.resolve(packageDir, pkgFile.main));
            }

            return null;
        }
    }
}

module.exports = Package;
