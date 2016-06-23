function handler(m) {
	// Do work  (in this case just up-case the string
	m = m.data;
	m = m.toUpperCase();

	// Pass results back to parent process after a delay
	setTimeout(postMessage, 1000, m.toUpperCase(m));
};

//process.on('message', handler);
onmessage = handler;
