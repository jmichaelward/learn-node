import { default as express } from 'express';
import { default as hbs } from 'hbs';
import * as path from 'path';
import dotenv from 'dotenv/config.js';
import socketio from 'socket.io';
import passportSocketIo from 'passport.socketio';

// import * as favicon from 'service-favicon';
import { default as logger } from 'morgan';
import { default as cookieParser } from 'cookie-parser';
import { default as bodyParser } from 'body-parser';
import * as http from 'http';
import {
  approotdir, normalizePort, onError, onListening, handle404, basicErrorHandler
} from './appsupport.mjs';
import { default as rfs } from 'rotating-file-stream';
import { debug } from './debug.mjs';
import { useModel as useNotesModel } from './models/notes-store.mjs';

// Session-handling imports
import session from 'express-session';
import sessionFileStore from 'session-file-store';

// Router imports
import { router as indexRouter, init as homeInit } from './routes/index.mjs';
import { router as notesRouter, init as notesInit } from './routes/notes.mjs';
import { router as usersRouter, initPassport } from './routes/users.mjs';

const __dirname = approotdir;

// App initialization.
export const app = express();
export const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Add session-handling to the app.
const FileStore = sessionFileStore(session);
export const sessionCookieName = 'notescookie.sid';
const sessionSecret = 'keyboard mouse';
const sessionStore = new FileStore({ path: 'sessions' });

// Initialize the app's HTTP server.
export const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
server.on('request', (request, response) => {
  debug(`${new Date().toISOString()} request ${request.method} ${request.url}`);
});

// Initialize Socket.io session handling.
export const io = socketio(server);

io.use(passportSocketIo.authorize({
  cookieParser,
  key: sessionCookieName,
  secret: sessionSecret,
  store: sessionStore,
}));

app.use(session({
  store: sessionStore,
  secret: sessionSecret,
  resave: true,
  saveUninitialized: true,
  name: sessionCookieName
}));
initPassport(app);

useNotesModel(process.env.NOTES_MODEL ? process.env.NOTES_MODEL : 'memory')
  .then(store => {
    homeInit();
    notesInit();
  })
  .catch(error => { onError({ code: 'ENOTESSTORE', error }); });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'partials'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
  stream: process.env.REQUEST_LOG_FILE ?
    rfs.createStream(process.env.REQUEST_LOG_FILE, {
      size: '10M',      // rotate every 10 Megabytes written
      interval: '1d',   // rotate daily
      compress: 'gzip'  // compress rotated files
    })
    : process.stdout
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use('/assets/vendor/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));
app.use('/assets/vendor/popper.js', express.static(path.join(__dirname, 'node_modules', 'popper.js', 'dist', 'umd')));
app.use('/assets/vendor/feather-icons', express.static(path.join(__dirname, 'node_modules', 'feather-icons', 'dist')));

// Mount routers to the application.
app.use('/', indexRouter);
app.use('/notes', notesRouter);
app.use('/users', usersRouter);

// error handlers
// catch 404 and forward to error handler
app.use(handle404);
app.use(basicErrorHandler);
