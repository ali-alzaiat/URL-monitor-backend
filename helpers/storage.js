const NodeCache = require( "node-cache" );
const checkCache = new NodeCache();
const reportCache = new NodeCache();
exports.checkCache = checkCache;
exports.reportCache = reportCache;