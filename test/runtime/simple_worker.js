(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var fs = require('fs');
var cp = require('child_process');
var worker = require('./lib/worker');
var utils = require('./lib/utils');

exports.worker = worker;

function WebThread (path) {
	this.thread = cp.fork(path);
	this.expecting = null;
	this.thread.on('message', (e) => {
		this.handle_message(e);
	});
	this.thread.on('close', (e) => { this.handle_removal('close', e); });
	this.thread.on('disconnect', (e) => { this.handle_removal('disconnect', e); });
	this.thread.on('exit', (e) => { this.handle_removal('exit', e); });
	this.thread.on('error', (e) => { this.handle_error(e); });
	this.onmessage = function() { console.log("onmessage handler not setup yet!"); };
}
WebThread.prototype.handle_message = function(e) {
	verbose(50, "(WT.handle_message) ", e);
	this.onmessage(e);
};
WebThread.prototype.handle_removal = function(type, e) {
	verbose(50, "(WT.handle_removal." + type + ") ", e);
	this.expecting = type;
	this.handle_error(e);
};
WebThread.prototype.handle_error = function(e) {
	verbose(30, "(WT.handle_error) ", e);
	if(this.thread) {
		this.thread.kill();
		this.thread = null;
	}
	if(!this.expecting) {
		if(this.onerror)
			this.onerror(e);
	}
};
WebThread.prototype.disconnect =
WebThread.prototype.close =
WebThread.prototype.kill = function(signal) {
	if(this.thread) {
		this.thread.kill(signal);
		this.thread = null;
	}
};
WebThread.prototype.postMessage = function(m) {
	this.send(m);
};
WebThread.prototype.send = function(m) {
	if(!this.thread)
		return this.handle_error(new Error('Thread no longer present'));
	this.thread.send(m);
};

exports.spawn = function(path) {
	if(!fs.existsSync(path) && !fs.existsSync(path + ".js")) {
		throw 'File not found: ' + path;
	}

	return new WebThread(path);
};

},{"./lib/utils":2,"./lib/worker":3,"child_process":4,"fs":4}],2:[function(require,module,exports){
(function (process,global){
/**
 * Various utility functions
 */

var verbosity = process.env.WEBTHREADS_VERBOSITY || 0;

exports.verbose =
global.verbose = function(level, args) {
	if(verbosity >= level) {
		args = Array.prototype.slice.call(arguments);
		args.shift();
		console.log.apply(console, args);
	}
};

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":5}],3:[function(require,module,exports){
(function (process,global){
/**
 * Provides handling for the worker process.
 * The init function should be called to setup handling.
 */

var utils = require('./utils');

/**
 * Browserify creates a new process object that doesn't contain the properties
 * of the real node process object.
 * This function restores it by grabbing it from the global scope.
 */
function restore_process () {
	for(var key in global.process)
		process[key] = global.process[key];
	return global.process;
}

exports.init = function() {
	process = restore_process();
	verbose(80, "Waiting for a message");
	global.onmessage = null;
	process.on('message', function(message) {
		verbose(20, "(WORKER) Got message", message);
		if(global.onmessage) {
			try {
				global.onmessage(message);
			} catch (e) {
				verbose("(WORKER) Error handling message");
				global.onerror(e);
			}
			return;
		}
		global.onerror('No message handler installed');
	});
	var uncaughtException = function(e) {
		verbose("(WORKER) Uncaught exception: " + e);
		verbose(e.stack);
		process.exit();
	};
	process.on('uncaughtException', uncaughtException);
	global.onerror = function(e) {
		verbose("(WORKER) No onerror handler installed.");
		uncaughtException(e);
	};
	global.send =
	global.postMessage = function(data) {
		try {
			process.send(data);
		} catch (e) {
			global.onerror(e);
		}
	};
};

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./utils":2,"_process":5}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
function handler(m) {
	// Do work  (in this case just up-case the string
	m = m.toUpperCase();

	// Pass results back to parent process after a delay
	setTimeout(postMessage, 1000, m.toUpperCase(m));
};

//process.on('message', handler);
onmessage = handler;

},{}],7:[function(require,module,exports){
var webthreads = require('../.');
var worker = webthreads.worker;

worker.init();

},{"../.":1}]},{},[7,6]);
