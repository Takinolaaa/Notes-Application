class Note {
  #key;
  #title;
  #note;

  constructor(key, title, note) {
    this.#key = key;
    this.#title = title;
    this.#note = note;
  }

  get key() {
    return this.#key;
  }

  get title() {
    return this.#title;
  }

  get note() {
    return this.#note;
  }

  set title(title) {
    this.#title = title;
  }

  set note(note) {
    this.#note = note;
  }
}

class AbstractNotes {
  async create(note) {}
  async read(key) {}
  async update(note) {}
  async delete(key) {}
  async list() {}
}

export {Note, AbstractNotes };
