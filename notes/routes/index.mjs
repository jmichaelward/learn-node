import * as express from 'express';
import { NotesStore as notes } from '../models/notes-store.mjs';
import { twitterLogin } from './users.mjs';

export const router = express.Router();

export function init() {}

// GET home page
router.get('/', async (request, response, next) => {
  try {
    const keylist = await notes.keylist();
    // console.log(`keylist ${util.inspect(keylist)}`);
    const keyPromises = keylist.map(key => {
      return notes.read(key);
    });

    const notelist = await Promise.all(keyPromises);
    // console.log(util.inspect(notelist));
    response.render('index', {
      title: 'Notes',
      notelist,
      user: request.user ? request.user : undefined,
      twitterLogin
    });
  } catch (error) {
    next(error);
  }
})
