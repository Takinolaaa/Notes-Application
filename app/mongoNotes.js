import { default as mongodb, ObjectId } from "mongodb";
import { AbstractNotes } from "./noteClass.js";

const MongoClient = mongodb.MongoClient;

const db = await (async () => {
  let client = await MongoClient.connect("mongodb://localhost:27017");
  return client.db("NotesDB");
})();


const Notes = db.collection("notes");

export class MongoNotes extends AbstractNotes {
  async create(note) {
    let res = await Notes.insertOne({
      title: note.title,
      note: note.note,
    });

    return res.insertedId;
  }

  async read(key) {
    let note = await Notes.findOne(new ObjectId(key));
    note.key = note._id;
    return note;
  }

  async update(note) {
    await Notes.updateOne(
      { _id: new ObjectId(note.key) },
      {
        $set: {
          title: note.title,
          note: note.note,
        },
      }
    );

    return note.key;
  }

  async delete(key) {
    await Notes.findOneAndDelete({ _id: new ObjectId(key) });
    return true;
  }

  async list() {
    return await Notes.find()
      .map((n) => {
        n.key = n._id;
        return n;
      })
      .toArray();
  }
}
