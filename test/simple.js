var webthreads = require('../.');

var child = webthreads.spawn(__dirname + '/runtime/simple_worker');
child.onmessage = function(m) {
	// Receive results from child process
	console.log('received: ' + m);
	child.disconnect();
};

// Send child process some work
console.log("Sending...");
child.send('Please up-case this string');
