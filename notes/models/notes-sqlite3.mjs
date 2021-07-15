import util from 'util';
import { Note, AbstractNotesStore} from './Notes.mjs';
import { default as sqlite3 } from 'sqlite3';
import { default as DBG } from 'debug';
const debug = DBG('notes:notes-sqlite3');
const error = DBG('notes:error-sqlite3');

let db;

async function connectDB() {
  if (db) {
    return db;
  }

  const dbfile = process.env.SQLITE_FILE || 'notes.sqlite3';
  await new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbfile,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      error => {
        if (error) {
          return reject(error);
        }
        resolve(db);
      });
  });
  return db;
}

export default class SQLITE3NotesStore extends AbstractNotesStore {
  async close() {
    const _db = db
    db = undefined
    return _db ?
      new Promise((resolve, reject) => {
        _db.close(error => {
          if (error) {
            reject(error);
          }

          resolve();
        })
      })
      : undefined
  }

  async update(key, title, body) {
    const db = await connectDB();
    const note = new Note(key, title, body);
    await new Promise((resolve, reject) => {
      db.run("UPDATE notes " +
        "SET TITLE = ?, body = ? WHERE notekey = ?",
        [ title, body, key ], error => {
          if (error) {
            return reject(error);
          }

          resolve(note);
        });
    });
    return note;
  }

  async create(key, title, body) {
    const db = await connectDB();
    const note = new Note(key, title, body);
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO notes ( notekey, title, body) " +
        "VALUES (?, ?, ?);", [ key, title, body ], error => {
          if (error) {
            return reject(error);
          }
          resolve(note);
        });
    });
    return note;
  }

  async read(key) {
    const db = await connectDB();

    return await new Promise((resolve, reject) => {
      db.get("SELECT * FROM notes WHERE notekey = ?", [ key ], (error, row) => {
        if (error) {
          return reject(error);
        }

        resolve(new Note(row.notekey, row.title, row.body));
      });
    })
  }

  async destroy(key) {
    const db = await connectDB();
    return await new Promise((resolve, reject) => {
      db.run("DELETE FROM notes WHERE notekey = ?;", [ key ], error => {
        if ( error) {
          return reject(error);
        }

        resolve();
      });
    });
  }

  async keylist () {
    const db = await connectDB();

    return await new Promise((resolve, reject) => {
      db.all('SELECT notekey FROM notes', (error, rows) => {
        if (error) {
          return reject(error)
        }

        resolve(rows.map(row => row.notekey));
      });
    });
  }

  async count() {
    const db = await connectDB();

    return await new Promise((resolve, reject) => {
      db.get("SELECT count(notekey) as count from notes", (error, row) => {
        if (error) {
          return reject(error);
        }

        resolve(row.count);
      });
    })
  }
}
