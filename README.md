WebThreads
==========

WebThreads is a module for Node.js that provides a
WebWorker-threads-like interface using the standard node fork
capabilities.

Worker threads have the `send` and `postMessage` functions available,
as well as the ability to assign an `onmessage` handler.

The master thread can send messages to the child, listen for events,
and ultimately kill the child.


Benefits
--------

* Some other implementations lack the ability to use various like:
  * `setTimeout`, `setInterval`
  * `require` (usually overcome using browserify or other packaging tools)
  * file access

* No dependencies required
