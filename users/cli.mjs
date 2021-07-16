import { default as program } from 'commander';
import { default as restify } from 'restify-clients';
import * as util from 'util';

let clientPort;
let clientHost;
let clientVersion = '*';
let clientProtocol;
let authid = 'them';
let authcode = 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF';

const client = program => {
  if (typeof process.env.PORT === 'string') {
    clientPort = Number.parseInt(process.env.PORT);
  }

  if (typeof program.port === 'string') {
    clientPort = Number.parseInt(program.port);
  }

  if (typeof program.host === 'string') {
    clientHost = program.host;
  }

  if (typeof program.url === 'string') {
    let programUrl = new URL(program.url);

    if (programUrl.host && programUrl.host !== '') {
      clientHost = programUrl.host;
    }

    if (programUrl.port && programUrl.port !== '') {
      clientPort = programUrl.port;
    }

    if (programUrl.protocol && programUrl.protocol !== '') {
      clientProtocol = programUrl.protocol;
    }
  }

  let connectUrl = new URL('http://localhost:5858');
  if (clientProtocol) {
    connectUrl.protocol = clientProtocol;
  }

  if (clientHost) {
    connectUrl.host = clientHost;
  }

  if (clientPort) {
    connectUrl.port = clientPort;
  }

  let client = restify.createJsonClient({
    url: connectUrl.href,
    version: clientVersion
  });

  client.basicAuth(authid, authcode);
  return client;
}

program
  .option('-p --port <port>', 'Port number for user server, if using localhost')
  .option('-h --host <host>', 'Port number for user server, if using localhost')
  .option('-u --url <url>', 'Connection URL for user server, if using a remote server');

program
  .command('add <username>')
  .description('Add a user to the user server')
  .option('--password <password>', 'Password for new user')
  .option('--family-name <familyName>', 'Family name, or last name, of the user')
  .option('--given-name <givenName>', 'Given name, or first name, of the user')
  .option('--middle-name <middleName>', 'Middle name of the user')
  .option('--email <email>', 'Email address for the user')
  .action((username, commandObject) => {
    const { password, familyName, givenName, middleName } = commandObject;
    const topost = {
      username,
      password,
      provider: 'local',
      familyName,
      givenName,
      middleName,
      emails: [],
      photos: []
    }

    if (typeof commandObject.email !== 'undefined') {
      topost.emails.push(commandObject.email);
    }

    client(program).post('/create-user', topost, (error, request, response, object) => {
      if (error) {
        console.error(error.stack);
      } else {
        console.log(`Created ${util.inspect(object)}`);
      }
    });
  });

program
  .command('find-or-create <username>')
  .description('Add a user to the user server')
  .option('--password <password>', 'Password for new user')
  .option('--family-name <familyName>', 'Family name, or last name, of the user')
  .option('--given-name <givenName>', 'Given name, or first name, of the user')
  .option('--middle-name <middleName>', 'Middle name of the user')
  .option('--email <email>', 'Email address for the user')
  .action((username, commandObject) => {
    const { password, familyName, givenName, middleName } = commandObject;
    const topost = {
      username,
      password,
      provider: 'local',
      familyName,
      givenName,
      middleName,
      emails: [],
      photos: []
    }

    if (typeof commandObject.email !== 'undefined') {
      topost.emails.push(commandObject.email);
    }

    client(program).post('/find-or-create', topost, (error, request, response, object) => {
      if (error) {
        console.error(error.stack);
      } else {
        console.log(`Found or Created ${util.inspect(object)}`);
      }
    });
  });

program
  .command('find <username>')
  .description('Search for a user on the user server')
  .action((username, commandObject) => {
    client(program).get(`/find/${username}`, (error, request, response, object) => {
      if (error) {
        console.error(error.stack);
      } else {
        console.log(`Found ${util.inspect(object)}`);
      }
    });
  });

program
  .command('list-users')
  .description('List all users on the user server')
  .action((commandObject) => {
    client(program).get('/list', (error, request, response, object) => {
      if (error) {
        console.error(error.stack);
      } else {
        console.log(object);
      }
    });
  });


program.parse(process.argv);


