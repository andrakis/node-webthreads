/**
 * Provides handling for the worker process.
 * The init function should be called to setup handling.
 */

var utils = require('./utils');

/**
 * Browserify creates a new process object that doesn't contain the properties
 * of the real node process object.
 * This function restores it by grabbing it from the global scope.
 */
function restore_process () {
	for(var key in global.process)
		process[key] = global.process[key];
	return global.process;
}

exports.init = function() {
	if(process != global.process)
		process = restore_process();
	verbose(80, "Waiting for a message");
	global.onmessage = null;
	process.on('message', function(message) {
		verbose(20, "(WORKER) Got message", message);
		if(global.onmessage) {
			try {
				global.onmessage(message);
			} catch (e) {
				verbose("(WORKER) Error handling message");
				global.onerror(e);
			}
			return;
		}
		global.onerror('No message handler installed');
	});
	var uncaughtException = function(e) {
		verbose("(WORKER) Uncaught exception: " + e);
		verbose(e.stack);
		process.exit();
	};
	process.on('uncaughtException', uncaughtException);
	global.onerror = function(e) {
		verbose("(WORKER) No onerror handler installed.");
		uncaughtException(e);
	};
	global.send =
	global.postMessage = function(data) {
		try {
			process.send(data);
		} catch (e) {
			global.onerror(e);
		}
	};
};
