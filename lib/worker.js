exports.init = function() {
	console.log("Waiting for a message");
	global.process.on('message', function(message) {
		console.log("(WORKER) Got message", message);
		if(global.onmessage) {
			try {
				global.onmessage(message);
			} catch (e) {
				console.log("(WORKER) Error handling message");
				global.onerror(e);
			}
		}
		global.onerror('No message handler installed');
	});
	var uncaughtException = function(e) {
		console.log("(WORKER) Uncaught exception: " + e);
		console.log(e.stack);
		process.exit();
	};
	global.process.on('uncaughtException', uncaughtException);
	global.onerror = function(e) {
		console.log("(WORKER) No onerror handler installed.");
		uncaughtException(e);
	};
	global.postMessage = function(data) {
		try {
			global.process.send(data);
		} catch (e) {
			global.onerror(e);
		}
	};
};
