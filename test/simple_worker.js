function handler(m) {
	// Do work  (in this case just up-case the string
	m = m.toUpperCase();

	// Pass results back to parent process
	global.process.send(m.toUpperCase(m));
};

global.process.on('message', handler);
