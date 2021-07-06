import * as util from 'util';
import * as url from 'url';

const timestamp = () => new Date().toISOString();

export function sniffOn(server) {
  server.on('request', (request, response) => {
    console.log(`${timestamp()} request`);
    console.log(`${timestamp()} ${requestToString(request)}`);
  });

  server.on('close', errno => console.log(`${timestamp()} close errno=${errno}`));

  server.on('checkContinue', (request, response) => {
    console.log(`${timestamp()} checkContinue`);
    console.log(`${timestamp()} ${requestToString(request)}`);
    response.writeContinue();
  });

  server.on('upgrade', (request, socket, head) => {
    console.log(`${timestamp()} upgrade`);
    console.log(`${timestamp()} ${requestToString(request)}`);
  });

  server.on('clientError', () => console.log('clientError'));
}

export function requestToString(request) {
  let result = `request ${request.method} ${request.httpVersion} ${request.url}` + '\n';

  result += JSON.stringify(url.parse(request.url, true)) + '\n';

  let keys = Object.keys(request.headers);

  for (let i = 0, length = keys.length; i < length; i++) {
    let key = keys[i];
    result += `${i} ${key}: ${request.headers[key]}` + '\n';
  }

  if (request.trailers) {
    result += util.inspect(request.trailers) + '\n';
  }

  return result;
}
