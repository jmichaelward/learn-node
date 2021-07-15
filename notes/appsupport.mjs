import * as path from 'path';
import * as url from 'url';
import * as util from 'util';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const approotdir = __dirname;
import { server, port } from './app.mjs';
import { debug, dbgerror } from './debug.mjs';
import { NotesStore } from './models/notes-store.mjs';

/**
 * Converts a port number string into a numerical value.
 *
 * @param value
 * @returns {number|boolean|*}
 */
export function normalizePort(value) {
  const port = parseInt(value, 10);

  if (isNaN(port)) {
    return value;
  }

  return port >= 0 ? port : false;
}

/**
 * Handles errors from the HTTP Server object.
 *
 * @param error
 */
export function onError(error) {
  dbgerror(error);
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requries elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    case 'ENOTESSTORE':
      console.error(`Notes data store initialization failure because ${error.error}`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Prints a user-friendly messaging that indicates where the server is listening for HTTP connections.
 */
export function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}

/**
 * Handles 404 errors within the Express app.
 *
 * @param request
 * @param response
 * @param next
 */
export function handle404(request, response, next) {
  const error = new Error('Not Found');

  error.status = 404;
  next(error);
}

/**
 * Renders an error page when one is generated within the application.
 *
 * @param error
 * @param request
 * @param response
 * @param next
 * @returns {*}
 */
export function basicErrorHandler(error, request, response, next) {
  // Defer to built-in error handler if headersSent
  // See: http://expressjs.com/en/guide/error-handling.html
  if (response.headersSent) {
    return next(error);
  }

  // set locals, only providing error in development
  response.locals.message = error.message;
  response.locals.error = request.app.get('env') === 'development' ? error : {};

  // Render the error page
  response.status(error.status || 500);
  response.render('error');
}

async function catchProcessDeath() {
  debug('urk...');
  await NotesStore.close();
  await server.close();
  process.exit(0);
}

process.on('SIGTERM', catchProcessDeath);
process.on('SIGINT', catchProcessDeath);
process.on('SIGHUP', catchProcessDeath);
process.on('exit', () => { debug('exiting...'); });

process.on('uncaughtException', error => {
  console.error(`I've crashed!!! - ${(error.stack || error)}`);
});

process.on('unhandledRejection', (reason, rejectedPromise) => {
  console.error(`Unhandled Rejection at: ${util.inspect(rejectedPromise)} reason: ${reason}}`);
});
