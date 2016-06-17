var child_process = require('child_process');
var workerfile = __dirname + '/runtime/simple_worker.js';

var child = child_process.fork(workerfile);

child.on('message', function(m) {
	console.log("(From child) ", m);
	child.disconnect();
});

child.send('test');
console.log("Waiting...");
setTimeout(function() {
	console.log("Done waiting, giving up");
}, 1000);
