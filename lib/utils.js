/**
 * Various utility functions
 */

var verbosity = process.env.WEBTHREADS_VERBOSITY || 0;

function verb_log(level, args) {
	if(verbosity >= level) {
		args = Array.prototype.slice.call(arguments);
		args.shift();
		console.log.apply(console, args);
	}
}
function verb_dummy() { }

exports.verbose = global.verbose = (verbosity > 0 ? verb_log : verb_dummy);
