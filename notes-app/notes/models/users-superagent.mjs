import { default as request } from 'superagent';
import util from 'util';
import url from 'url';
import { default as bcrypt } from 'bcrypt';
import DBG from 'debug';

const saltRounds = 10;
const URL = url.URL;
const debug = DBG('notes:users-superagent');
const error = DBG('notes:error-superagent');

let authid = 'them';
let authcode = 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF';

async function hashpass(password) {
  let salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
}

function userServiceUrl(path) {
  const requestUrl = new URL(process.env.USER_SERVICE_URL);
  requestUrl.pathname = path;
  return requestUrl.toString();
}

export async function create(username, password, provider, familyName, givenName, middleName, emails, photos) {
  let response = await request.post(userServiceUrl('/create-user'))
    .send({ username, password: await hashpass(password), provider, familyName, givenName, middleName, emails, photos })
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .auth(authid, authcode);

  return response.body;
}

export async function update(username, password, provider, familyName, givenName, middleName, emails, photos) {
  let response = await request
    .post(userServiceUrl(`/update-user/${username}`))
    .send({ username, password: await hashpass(password), provider, familyName, givenName, middleName, emails, photos })
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .auth(authid, authcode);

  return response.body;
}

export async function find(username) {
  let response = await request
    .get(userServiceUrl(`/find/${username}`))
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .auth(authid, authcode);

  return response.body;
}

export async function userPasswordCheck(username, password) {
  let response = await request
    .post(userServiceUrl(`/password-check`))
    .send({ username, password })
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .auth(authid, authcode);

  return response.body;
}

export async function findOrCreate(profile) {
  const { id, password, provider, familyName, givenName, middleName, emails, photos } = profile;

  let response = await request
    .post(userServiceUrl(`/find-or-create`))
    .send({
      username: id,
      password: await hashpass(password),
      familyName,
      givenName,
      middleName,
      emails,
      photos
    })
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .auth(authid, authcode);

  return response.body;
}

export async function listUsers() {
  let response = await request
    .get(userServiceUrl(`/list`))
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .auth(authid, authcode);

  return response.body;
}
