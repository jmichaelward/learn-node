// const util = require('util');
import { default as express } from 'express';
import { NotesStore as notes } from '../app.mjs';
export const router = express.Router();

// Add note.
router.get('/add', (request, response, next) => {
  response.render('noteedit', {
    title: "Add a Note",
    docreate: true,
    notekey: '',
    note: undefined,
  });
});

// Save note (update).
router.post('/save', async (request, response, next) => {
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
