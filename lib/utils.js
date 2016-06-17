/**
 * Various utility functions
 */

var verbosity = process.env.WEBTHREADS_VERBOSITY || 0;

exports.verbose =
global.verbose = function(level, args) {
	if(verbosity >= level) {
		args = Array.prototype.slice.call(arguments);
		args.shift();
		console.log.apply(console, args);
	}
};
