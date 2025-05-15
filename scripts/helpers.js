/*
    Use:
    node scripts/helpers.js --helper=decode -- r41ri22abtygq r41ri22abtygq
*/
const util = require('util');

const minimist = require('minimist');

const {decodeId, encodeId} = require('../dist/server/utils/id.js');

util.inspect.defaultOptions.maxArrayLength = null;

const args = minimist(process.argv.slice(2), {
    alias: {
        h: 'helper',
    },
    string: ['_'],
});

const {helper} = args;

switch (helper) {
    case 'decode': {
        const encodedIds = args._;
        const decodedIds = encodedIds.map(decodeId);

        console.log(decodedIds);
        break;
    }
    case 'encode': {
        const encodedIds = args._;
        const decodedIds = encodedIds.map(encodeId);

        console.log(decodedIds);
        break;
    }
    default: {
        console.log('not exist helper');
    }
}
