// const util = require('util');
import {default as express} from 'express';
import {NotesStore as notes} from '../models/notes-store.mjs';
import {ensureAuthenticated} from './users.mjs';
import {twitterLogin} from './users.mjs';
import {emitNoteTitles} from './index.mjs';
import {io} from '../app.mjs';
import {
  postMessage,
  destroyMessage,
  recentMessages,
  emitter as messageEvents,
} from '../models/messages-sequelize.mjs';
import DBG from 'debug';

const debug = DBG('notes:home');
const error = DBG('notes:error-home');

export const router = express.Router();

// Add note.
router.get('/add', ensureAuthenticated, (request, response, next) => {
  response.render('noteedit', {
    title: "Add a Note",
    docreate: true,
    notekey: '',
    note: undefined,
    user: request.user,
    twitterLogin
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
    const note = await notes.read(request.query.key);
    const messages = await recentMessages('/notes', request.query.key);
    response.render('noteview', {
      title: note ? note.title : '',
      notekey: request.query.key,
      note,
      messages,
      user: request.user ? request.user : undefined,
      twitterLogin,
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
      user: request.user,
      twitterLogin,
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
      user: request.user,
      twitterLogin
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

export function init() {
  io.of('/notes').on('connect', socket => {
    let notekey = socket.handshake.query.key;
    if (notekey) {
      socket.join(notekey);
    }

    socket.on('create-message', async (newMessage, fn) => {
      try {
        const { from, namespace, room, message } = newMessage;
        await postMessage( from, namespace, room, message );
        fn('ok');
      } catch (error) {
        error(`Failed to create message ${error.stack}`);
      }
    });

    socket.on('delete-message', async (data) => {
      try {
        await destroyMessage(data.id);
      } catch (error) {
        error(`Failed to delete message ${error.stack}`);
      }
    })
  });

  notes.on('noteupdated', async (note) => {
    const toemit = {
      key: note.key,
      title: note.title,
      body: note.body
    };
    io.of('/notes').to(note.key).emit('noteupdated', toemit);
    await emitNoteTitles();
  });

  notes.on('notedestroyed', async (key) => {
    io.of('/notes').to(key).emit('notedestroyed', key);
    await emitNoteTitles();
  });

  messageEvents.on('newmessage', newMessage => {
    io.of(newMessage.namespace).to(newMessage.room).emit('newmessage', newMessage);
  });

  messageEvents.on('destroymessage', data => {
    io.of(data.namespace).to(data.room).emit('destroymessage', data);
  });
}

