import { io } from '../app.mjs';
import * as express from 'express';
import { NotesStore as notes } from '../models/notes-store.mjs';
import { twitterLogin } from './users.mjs';
import { debug } from '../debug.mjs';

export const router = express.Router();

// GET home page
router.get('/', async (request, response, next) => {
  try {
    const notelist = await getKeyTitlesList();
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
});

async function getKeyTitlesList() {
  const keylist = await notes.keylist();
  const keyPromises = keylist.map(key => notes.read(key));
  const notelist = await Promise.all(keyPromises);

  return notelist.map(note => {
    return { key: note.key, title: note.title };
  });
}

export const emitNoteTitles = async () => {
  const notelist = await getKeyTitlesList();
  io.of('/home').emit('notetitles', { notelist });
}

export function init() {
  io.of('/home').on('connect', socket => {
    debug('socketio connection on /home');
  });
  notes.on('notecreated', emitNoteTitles);
  notes.on('noteupdated', emitNoteTitles);
  notes.on('notedestroyed', emitNoteTitles);
}
