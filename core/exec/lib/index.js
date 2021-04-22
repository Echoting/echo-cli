'use strict';

module.exports = index;

function index() {
    console.log(888, 'exec');
    console.log(process.env.CLI_TARGET_PATH);
    console.log(process.env.CLI_HOME);
}
