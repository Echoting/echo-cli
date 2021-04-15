'use strict';
const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

function getNpmInfo(npmName, registry = '') {
    if (!npmName) {
        return;
    }

    const registryUrl = registry || getDefaultRegistry();
    const npmInfoUrl = urlJoin(registryUrl, npmName);
    return axios.get(npmInfoUrl).then(
        res => {
            if (res.status === 200) {
                return res.data;
            }
            return null;
        }
    ).catch(err => {
        return Promise.reject(err);
    })

}

function getDefaultRegistry(isOriginal = false) {
    return isOriginal ? 'http://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}

module.exports = {
    getNpmInfo
};

