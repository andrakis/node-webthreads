var webthreads = require('../.');
var worker = webthreads.worker;

worker.init();

if(process.env.WEBTHREADS_SHIM_LOAD) {
	try {
		require(process.env.WEBTHREADS_SHIM_LOAD);
	} catch (e) {
		console.log("(webthreads.shim) error loading process: " + e);
		console.log(e.stack);
	}
	if(!global.onmessage)
		throw 'No message handler installed?';
}
