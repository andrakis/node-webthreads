var fs = require('fs');
var cp = require('child_process');
var worker = require('./lib/worker');
var utils = require('./lib/utils');

exports.worker = worker;

function SpawnProcess (path, shim) {
	var args = [];
	var options = {
		env: {
			WEBTHREADS_VERBOSITY: process.env.WEBTHREADS_VERBOSITY
		}
	};
	if(shim) {
		options.env.WEBTHREADS_SHIM_LOAD = path;
		path = shim;
	}
	return cp.fork(path, args, options);
}

function WebThread (path, shim) {
	this.thread = SpawnProcess(path, shim);

	this.expecting = null;
	this.thread.on('message', (e) => {
		this.handle_message(e);
	});
	this.thread.on('close', (e) => { this.handle_removal('close', e); });
	this.thread.on('disconnect', (e) => { this.handle_removal('disconnect', e); });
	this.thread.on('exit', (e) => { this.handle_removal('exit', e); });
	this.thread.on('error', (e) => { this.handle_error(e); });
	this.onmessage = function() { console.log("onmessage handler not setup yet!"); };
}
WebThread.prototype.handle_message = function(e) {
	verbose(50, "(WT.handle_message) ", e);
	this.onmessage(e);
};
WebThread.prototype.handle_removal = function(type, e) {
	verbose(50, "(WT.handle_removal." + type + ") ", e);
	this.expecting = type;
	this.handle_error(e);
};
WebThread.prototype.handle_error = function(e) {
	verbose(30, "(WT.handle_error) ", e);
	if(this.thread) {
		this.thread.kill();
		this.thread = null;
	}
	if(!this.expecting) {
		if(this.onerror)
			this.onerror(e);
	}
};
WebThread.prototype.disconnect =
WebThread.prototype.close =
WebThread.prototype.kill = function(signal) {
	if(this.thread) {
		this.thread.kill(signal);
		this.thread = null;
	}
};
WebThread.prototype.postMessage = function(m) {
	this.send(m);
};
WebThread.prototype.send = function(m) {
	if(!this.thread)
		return this.handle_error(new Error('Thread no longer present'));
	this.thread.send(m);
};

exports.spawn = function(path, shim) {
	if(!fs.existsSync(path) && !fs.existsSync(path + ".js")) {
		throw 'File not found: ' + path;
	}

	return new WebThread(path, shim);
};
