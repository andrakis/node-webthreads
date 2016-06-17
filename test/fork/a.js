global.abc = function() { console.log('ABC!'); };

if(process.env.ABC_LOAD)
	require(process.env.ABC_LOAD);
