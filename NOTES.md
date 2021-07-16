# Notes

## Chapter 4
The book example for the end of the chapter indicates to use `process.env.SERVERPORT` in `fibonacci-rest.js`, but
that causes the start process to fail because Node can't locate the value and thinks it's looking instead on
port 3000. The solution to fixing this is to add `SERVERPORT=3002` to the `start` script in `package.json`, just
like all of the other scripts, since the REST server relies on that value.

The book additionally mentions to call `cross-env` in the scripts, which is a Node module which is not available
natively. Running `npm install cross-env` was necessary in order to call the command.

## Chapter 5
Implementations of Promises before Promises were standardized:
- Blubird: http://bluebirdjs.com
- Q: https://www.npmjs.com/package/q

## Chapter 7
Tip: run `DEBUG=express:* node ./app.mjs` to see Express's built-in debugging.

Page 312 indicates to call a method `emitDestroyed` on the Mongo DB class which is never defined. It looks like this
may be a relic from a previous release, and possibly some kind of tie-in to the Node `eventEmitter`. Calling the
method causes the process to throw an error and hang, so I've excluded it from the example.
