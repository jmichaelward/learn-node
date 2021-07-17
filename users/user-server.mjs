import restify from 'restify';
import * as util from 'util';
import { SQUser, connectDB, userParams, findOneUser, createUser, sanitizedUser } from './users-sequelize.mjs';
import { default as bcrypt } from 'bcrypt';
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

server.post('/create-user', async (request, response, next) => {
  try {
    await connectDB();
    let result = await createUser(request);
    response.contentType = 'json';
    response.send(result);
    next(false);
  } catch (error) {
    response.send(500, error);
    next(false);
  }
});

server.post('/find-or-create', async (request, response, next) => {
  try {
    await connectDB();
    let user = await findOneUser(request.params.username);
    if (!user) {
      user = await createUser(request);
      if (!user) {
        throw new Error('No user created');
      }
    }

    response.contentType = 'json';
    response.send(user);
    return next(false);
  } catch (error) {
    response.send(500, error);
    next(false);
  }
});

server.get('/find/:username', async (request, response, next) => {
  try {
    await connectDB();
    const user = await findOneUser(request.params.username);
    if (!user) {
      response.send(404, new Error(`Did not find ${request.params.username}`));
    } else {
      response.contentType = 'json';
      response.send(user);
    }
    next(false);
  } catch (error) {
    response.send(500, error);
    next(false);
  }
});

server.get('/list', async (request, response, next) => {
  try {
    await connectDB();
    let userlist = await SQUser.findAll({});
    userlist = userlist.map(user => sanitizedUser(user));

    if (!userlist) {
      userlist = [];
    }

    response.contentType = 'json';
    response.send(userlist);
    next(false);
  } catch (error) {
    response.send(500, error);
    next(false);
  }
});

server.post('/update-user/:username', async (request, response, next) => {
  try {
    await connectDB();
    let toupdate = userParams(request);
    await SQUser.update(toupdate, { where: { username: request.params.username }});
    const result = await findOneUser(request.params.username);

    response.contentType = 'json';
    response.send(result);
    next(false);
  } catch (error) {
    response.send(500, error)
    next(false);
  }
});

server.del('/destroy/:username', async (request, response, next) => {
  try {
    await connectDB();
    const user = await SQUser.findOne({ where: { username: request.params.username } });

    if (!user) {
      response.send(404, new Error(`Did not find request ${request.params.username} to delete`));
    } else {
      user.destroy();
      response.contentType = 'json';
      response.send({});
    }
    next(false);
  } catch (error) {
    response.send(500, error);
    next(false);
  }
});

server.post('/password-check', async (request, response, next) => {
  try {
    await connectDB();
    const user = await SQUser.findOne({ where: {username: request.params.username } });

    let checked;
    if (!user) {
      checked = {
        check: false,
        username: request.params.username,
        message: 'Could not find user'
      };
    } else {
      let pwcheck = false;
      if (user.username === request.params.username) {
        pwcheck = await bcrypt.compare(request.params.password, user.password);
      }

      if (pwcheck) {
        checked = { check: true, username: user.username }
      } else {
        checked = {
          check: false,
          username: request.params.username,
          message: 'Incorrect password'
        };
      }
    }

    response.contentType = 'json';
    response.send(checked);
    next(false);
  } catch (error) {
    response.send(500, error);
    next(false);
  }
})
