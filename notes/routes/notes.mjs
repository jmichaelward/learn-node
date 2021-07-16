// const util = require('util');
import { default as express } from 'express';
import { NotesStore as notes } from '../models/notes-store.mjs';
import { ensureAuthenticated } from './users.mjs'

export const router = express.Router();

// Add note.
router.get('/add', ensureAuthenticated, (request, response, next) => {
  response.render('noteedit', {
    title: "Add a Note",
    docreate: true,
    notekey: '',
    note: undefined,
    user: request.user,
  });
});

// Save note (update).
router.post('/save', ensureAuthenticated, async (request, response, next) => {
  try {
    let note;
    const { notekey, title, body } = request.body;

    if (request.body.docreate === 'create') {
      note = await notes.create(notekey, title, body);
    } else {
      note = await notes.update(notekey, title, body);
    }

    response.redirect(`/notes/view?key=${notekey}`);
  } catch (error) {
    next(error);
  }
});

// Read note (read)
router.get('/view', async (request, response, next) => {
  try {
    let note = await notes.read(request.query.key);
    response.render('noteview', {
      title: note ? note.title : '',
      notekey: request.query.key,
      note: note,
      user: request.user ? request.user : undefined
    });
  } catch (error) {
    next(error);
  }
});

// Edit note (update)
router.get('/edit', ensureAuthenticated, async (request, response, next) => {
  try {
    const note = await notes.read(request.query.key);

    response.render('noteedit', {
      title: note ? (`Edit ${note.title}`) : "Add a Note",
      docreate: false,
      notekey: request.query.key,
      note: note,
      user: request.user
    });
  } catch (error) {
    next(error);
  }
});

// Ask to Delete note (destroy)
router.get('/destroy', ensureAuthenticated, async (request, response, next) => {
  try {
    const note = await notes.read(request.query.key);

    response.render('notedestroy', {
      title: note ? `Delete ${note.title}` : '',
      notekey: request.query.key,
      note: note,
      user: request.user
    });
  } catch (error) {
    next(error);
  }
});

// Really destroy the note.
router.post('/destroy/confirm', ensureAuthenticated, async (request, response, next) => {
  try {
    await notes.destroy(request.body.notekey);
    response.redirect('/');
  } catch (error) {
    next(error);
  }
});
