import { Note, AbstractNotesStore} from './Notes.mjs';
import Sequelize from 'sequelize';
import {
  connectDB as connectSequlz,
  close as closeSequlz
} from './sequlz.mjs';
import DBG from 'debug';
const debug = DBG('notes:notes-sequelize');
const error = DBG('notes:error-sequelize');

let sequelize;

export class SQNote extends Sequelize.Model {}

async function connectDB() {
  if (sequelize) {
    return;
  }

  sequelize = await connectSequlz();
  SQNote.init(
    {
      notekey: {
        type: Sequelize.DataTypes.STRING,
        primaryKey: true,
        unique: true
      },
      title: Sequelize.DataTypes.STRING,
      body: Sequelize.DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'SQNote'
    }
  );
  await SQNote.sync();
}

export default class SequelizeNotesStore extends AbstractNotesStore {
  async close() {
    await closeSequlz();
    sequelize = undefined;
  }

  async update(key, title, body) {
    await connectDB();
    const note = await SQNote.findOne({ where: { notekey: key } });

    if (!note) {
      throw new Error(`No note found for ${key}`);
    }

    await SQNote.update({ title, body }, { where: { notekey: key } });

    const updatedNote = await this.read(key);
    this.emitUpdated(updatedNote);

    return updatedNote;
  }

  async create(key, title, body) {
    await connectDB();

    const sqnote = await SQNote.create({
      notekey: key, title, body
    });

    const note = new Note(sqnote.notekey, sqnote.title, sqnote.body);
    this.emitCreated(note);
    return note;
  }

  async read(key) {
    await connectDB();
    const note = await SQNote.findOne({ where: { notekey: key } });

    if (!note) {
      throw new Error(`No note found for ${key}`);
    }

    return new Note(note.notekey, note.title, note.body);
  }

  async destroy(key) {
    await connectDB();
    await SQNote.destroy({ where: { notekey: key } });
    this.emitDestroyed(key);
  }

  async keylist() {
    await connectDB();
    const notes = await SQNote.findAll({ attributes: [ 'notekey' ] });
    return notes.map(note => note.notekey);
  }

  async count() {
    await connectDB();
    return await SQNote.count();
  }

}
