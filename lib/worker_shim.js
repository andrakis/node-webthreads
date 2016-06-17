var webthreads = require('../.');
var worker = webthreads.worker;

worker.init();

if(process.env.WEBTHREADS_SHIM_LOAD)
	require(process.env.WEBTHREADS_SHIM_LOAD);
