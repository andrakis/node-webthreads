var webthread = require('webthread');

var child = webthread.spawn(__dirname + '/runtime/simple_worker');
child.on('message', function(m) {
	// Receive results from child process
	console.log('received: ' + m);
	child.disconnect();
});

// Send child process some work
console.log("Sending...");
child.send('Please up-case this string');
