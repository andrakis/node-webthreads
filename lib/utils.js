/**
 * Various utility functions
 */

var util = require('util');
var verbosity = process.env.WEBTHREADS_VERBOSITY || 0;

function inspect(obj) {
	if(typeof obj === 'string')
		return obj;
	return util.inspect(obj).replace(/(?:\r\n|\r|\n)/g, '');
}

function verb_log(level, args) {
	if(verbosity >= level) {
		args = Array.prototype.slice.call(arguments);
		args.shift();
		console.log.apply(console, args.map(inspect));
	}
}
function verb_dummy() { }

exports.verbose = global.verbose = (verbosity > 0 ? verb_log : verb_dummy);
