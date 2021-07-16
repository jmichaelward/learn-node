import restify from 'restify';
import * as util from 'util';
import { SQUser, connectDB, userParams, findOneUser, createUser, sanitizedUser } from './users-sequelize.mjs';
import DBG from 'debug';
const log = DBG('users:service');
const error = DBG('users:error');

//////// Set up the REST server

let server = restify.createServer({
  name: 'User-Auth-Service',
  version: '0.0.1'
});

server.use(restify.plugins.authorizationParser());
server.use(check);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({
  mapParams: true
}));

server.listen(process.env.PORT, 'localhost', () => {
  log(`${server.name} listening at ${server.url}`);
});

process.on('uncaughtException', (error) => {
  console.error(`UNCAUGHT EXCEPTION - ${error.stack || error}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, rejectedPromise) => {
  console.error(`UNHANDLED PROMISE REJECTION: ${util.inspect(rejectedPromise)} reason: ${reason}`);
  process.exit(1);
});


// Mimic API Key authentication.

var apiKeys = [
  { user: 'them', key: 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF' }
];

function check(request, response, next) {
  if (!(request.authorization && request.authorization.basic)) {
    response.send(500, new Error('No Authorization Key'));
    next(false);
  }

  const { username, password } = request.authorization.basic;

  var found = false;
  for (let auth of apiKeys) {
    if (auth.key === password && auth.user === username) {
      found = true;
      break;
    }
  }

  if (!found) {
    response.send(401, new Error('Not authenticated'));
    next(false);
  }

  next();
}
