var fs = require('fs');
var cp = require('child_process');
var worker = require('./lib/worker');

exports.worker = worker;

function WebThread (path) {
	this.thread = cp.fork(path);
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
	console.log("(WT.handle_message) ", e);
	this.onmessage(e);
};
WebThread.prototype.handle_removal = function(type, e) {
	console.log("(WT.handle_removal." + type + ") ", e);
	this.handle_error(e);
};
WebThread.prototype.handle_error = function(e) {
	console.log("(WT.handle_error) ", e);
	if(this.thread)
		this.thread.kill();
	this.thread = null;
};
WebThread.prototype.postMessage = function(m) {
	this.send(m);
};
WebThead.prototype.send = function(m) {
	if(!this.thread)
		return this.handle_error(new Error('Thread no longer present'));
	this.thread.send(m);
};

exports.spawn = function(path) {
	if(!fs.fileExistsSync(path)) {
		throw 'File not found: ' + paht;
	}

	return new WebThread(path);
};
