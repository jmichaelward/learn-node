const http = require('http');
const url = require('url');
const util = require('util');

const argUrl = process.argv[2];
// Note: the parse method appears to be deprecated in Express 11 - following instructions from the book.
const parsedUrl = url.parse(argUrl, true);

// The options object is passed to http.request telling it the URL to retrieve
const options = {
  host: parsedUrl.hostname,
  port: parsedUrl.port,
  path:parsedUrl.pathname,
  method: 'GET',
};

if (parsedUrl.search) {
  options.path += `?${parsedUrl.search}`;
}

const request = http.request(options);

// Invoked when the request is finished.
request.on('response', result => {
  console.log(`STATUS: ${result.statusCode}`);
  console.log(`HEADERS: ${util.inspect(result.headers)}`);
  result.setEncoding('utf8');
  result.on('data', chunk => { console.log(`BODY: ${chunk}`); });
  result.on('error', error => { console.log(`RESPONSE ERROR: ${error}`); });
});

// Invoked on errors
request.on('error', error => { console.log(`REQUEST ERROR: ${error}`); });
request.end();
