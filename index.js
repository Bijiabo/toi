#!/usr/bin/env node
/**
 * Created by huchunbo on 2017/3/3.
 */
require('shelljs/global');
var path = require('path');
var yargs = require('yargs');

var _new = require(path.join(__dirname, 'commands/new'));
console.log(_new);

var argv = yargs
    .command(_new)
    .command(require('./commands/download'))
    .option('i', {
        alias : 'init',
        demand: false,
        // default: '',
        describe: 'init a new project   创建项目',
        // type: 'string'
        function (yargs) {
            console.log(yargs);
        }
    })
    .option('p', {
        alias : 'platform',
        demand: false,
        default: 'alismart',
        describe: 'set platform         设定项目所属平台',
        choices: ['alismart', 'jdsmart'],
        type: 'string'
    })
    .alias('n', 'new')
    .alias('s', 'start')
    .alias('v', 'version')
    .usage('Usage: hello [options]')
    // 示例
    .example('toi -n -p=alismart', 'create a alismart project       创建一个阿里智能平台项目')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2015')
    .argv;

console.log('hello ', argv.name);