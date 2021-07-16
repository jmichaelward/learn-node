import { Sequelize } from 'sequelize'
import { default as jsyaml } from 'js-yaml'
import { promises as fs } from 'fs'
import * as util from 'util'
import DBG from 'debug'

const log = DBG('users:model-users')
const error = DBG('users:error')

var sequlz

export class SQUser extends Sequelize.Model {}

export async function connectDB () {
  if (sequlz) {
    return sequlz
  }

  const yamltext = await fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8')
  const params = await jsyaml.safeLoad(yamltext, 'utf8')

  if (typeof process.env.SEQUELIZE_DBNAME !== 'undefined' && process.env.SEQUELIZE_DBNAME !== '') {
    params.dbname = process.env.SEQUELIZE_DBNAME;
  }

  if (typeof process.env.SEQUELIZE_DBUSER !== 'undefined' && process.env.SEQUELIZE_DBUSER !== '') {
    params.username = process.env.SEQUELIZE_DBUSER;
  }

  if (typeof process.env.SEQUELIZE_DBPASSWD !== 'undefined' && process.env.SEQUELIZE_DBPASSWD !== '') {
    params.password = process.env.SEQUELIZE_DBPASSWD;
  }

  if (typeof process.env.SEQUELIZE_DBHOST !== 'undefined' && process.env.SEQUELIZE_DBHOST !== '') {
    params.params.host = process.env.SEQUELIZE_DBHOST;
  }

  if (typeof process.env.SEQUELIZE_DBPORT !== 'undefined' && process.env.SEQUELIZE_DBPORT !== '') {
    params.params.port = process.env.SEQUELIZE_DBPORT;
  }

  if (typeof process.env.SEQUELIZE_DBDIALECT !== 'undefined' && process.env.SEQUELIZE_DBDIALECT !== '') {
    params.params.dialect = process.env.SEQUELIZE_DBDIALECT;
  }

  log('Sequelize params ' + util.inspect(params));

  sequlz = new Sequelize(params.dbname, params.username, params.password, params.params);

  SQUser.init(
    {
      username: { type: Sequelize.STRING, unique: true },
      password: Sequelize.STRING,
      provider: Sequelize.STRING,
      familyName: Sequelize.STRING,
      givenName: Sequelize.STRING,
      middleName: Sequelize.STRING,
      emails: Sequelize.STRING(2048),
      photos: Sequelize.STRING(2048)
    },
    {
      sequelize: sequlz,
      modelName: 'SQUser'
    }
  );

  await SQUser.sync();
}

export function userParams(request) {
  const { username, password, provider, familyName, givenName, middleName, emails, photos } = request.params;

  return {
    username,
    password,
    provider,
    familyName,
    givenName,
    middleName,
    emails: JSON.stringify(emails),
    photos: JSON.stringify(photos),
  };
}

export function sanitizedUser(user) {
  const { username, provider, familyName, givenName, middleName, emails, photos } = user;

  let result = {
    id: user.username,
    username,
    provider,
    familyName,
    givenName,
    middleName
  };

  try {
    result.emails = JSON.parse(emails);
  } catch (error) {
    result.emails = [];
  }

  try {
    result.photos = JSON.parse(photos);
  } catch (error) {
    result.photos = [];
  }

  return result;
}

export async function findOneUser(username) {
  let user = await SQUser.findOne({ where: { username: username } });

  return user ? sanitizedUser(user) : undefined;
}

export async function createUser(request) {
  let tocreate = userParams(request);
  await SQUser.create(tocreate);
  return await findOneUser(request.params.username);
}
