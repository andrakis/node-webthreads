var cp = require('child_process');

var m = 'a';
cp.fork(m, [], { env: { ABC_LOAD: './b' } });
