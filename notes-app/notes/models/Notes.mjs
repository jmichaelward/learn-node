import EventEmitter from 'events';

// Symbols are used here to ensure that the values on the Note class cannot be overwritten by outside code.
const _note_key = Symbol('key');
const _note_title = Symbol('title');
const _note_body = Symbol('body');

/**
 * Describes a single note that our application will manage.
 */
export class Note {
  constructor(key, title, body) {
    this[_note_key] = key;
    this[_note_title] = title;
    this[_note_body] = body;
  }

  get key() {
    return this[_note_key];
  }

  get title() {
    return this[_note_title];
  }

  set title(newTitle) {
    this[_note_title] = newTitle;
  }

  get body() {
    return this[_note_body];
  }

  set body(newBody) {
    this[_note_body] = newBody;
  }

  get JSON() {
    return JSON.stringify({
      key: this.key,
      title: this.title,
      body: this.body
    });
  }

  static fromJSON(json) {
    const data = JSON.parse(json);

    if (typeof data !== 'object'
      || !data.hasOwnProperty('key')
      || typeof data.key !== 'string'
      || !data.hasOwnProperty('title')
      || typeof data.title !== 'string'
      || !data.hasOwnProperty('body')
      || typeof data.body !== 'string'
    ) {
      throw new Error(`Not a Note: ${json}`);
    }

    return new Note(data.key, data.title, data.body);
  }
}

/**
 * Documents the methods that we will use for accessing notes from data storage.
 *
 * This class serves to document the API, and we will use this as a base class for some of the storage models that
 * we will implement.
 */
export class AbstractNotesStore extends EventEmitter {
  // Used when we are done with a datastore.
  async close() {}
  async update(key, title, body) {}
  async create(key, title, body) {}
  async read(key) {}
  async destroy(key) {}
  async keylist() {}
  async count() {}

  // Event emitter functions.
  emitCreated = note => this.emit('notecreated', note);
  emitUpdated = note => this.emit('noteupdated', note);
  emitDestroyed = key => this.emit('notedestroyed', key);
}
