import * as http from 'http';
import * as util from 'util';
import * as os from 'os';

const listenOn = 'http://localhost:8124';
const server = http.createServer();

server.on('request', (request, response) => {
  let requestUrl = new URL(request.url, listenOn);
  if (requestUrl.pathname === '/') {
    homePage(request, response);
  } else if (requestUrl.pathname === '/osinfo') {
    osInfo(request, response);
  } else {
    badUrl(request, response);
  }
});

server.listen(new URL(listenOn).port);
console.log(`Listening to ${listenOn}`);

function homePage(request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end(
      `<html>
        <head>
            <title>Hello, world!</title>
        </head>
        <body>
            <h1>Hello, world!</h1>
            <p><a href="/osinfo">OS Info</a></p>
        </body>
      </html>`
  );
}

function osInfo(request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end(
    `
    <html>
        <head>
            <title>Operating System Info</title>
        </head>
        <body>
            <h1>Operating System Info</h1>
            <table>
                <tr><th>TMP Dir</th><td>${os.tmpdir()}</td></tr>
                <tr><th>Host Name</th><td>${os.hostname()}</td></tr>
                <tr><th>OS Type</th><td>${os.type()} ${os.platform()} ${os.arch()} ${os.release()}</td></tr>
                <tr><th>Update</th><td>${os.uptime()} ${util.inspect(os.loadavg())}</td></tr>
                <tr><th>Memory</th><td>total: ${os.totalmem()} free: ${os.freemem()}</td></tr>
                <tr><th>CPUs</th><td><pre>${util.inspect(os.cpus())}</pre></td></tr>
                <tr><th>Network</th><td><pre>${util.inspect(os.networkInterfaces())}</pre></td></tr>
            </table>
        </body>
    </html>`
  );
}

function badUrl(request, response) {
  response.writeHead(404, {'Content-Type': 'text/html'});
  response.end(
    `
    <html>
    <head>
        <title>Seems we've got nothing for ya.</title>
    </head>
    <body>
        <h1>Looks like you've found a dead end. Sorry, partner.</h1>
        <p><a href="/">Maybe you should go home.</a></p>
    </body>
    </html>
    `
  );
}
