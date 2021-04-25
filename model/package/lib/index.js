'use strict';
const path = require('path');

const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall');

const {isObject} = require('@echo-cli/utils');
const formatPaht = require('@echo-cli/format-path');
const log = require('@echo-cli/log');

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

        log.verbose('options', options);
    }

    // 判断当前Package是否存在
    exists() {

    }

    // 安装Package
    install() {
        return npminstall({
            root: this.targetPath,
            storeDir: this.storePath,
            // registry:
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
                return formatPaht(path.resolve(packageDir, pkgFile.main));
            }

            return null;
        }

        // 4、路径的兼容（macos 和 windows）

    }
}

module.exports = Package;
