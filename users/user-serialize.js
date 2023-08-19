import mongoose from "mongoose";
import bcrypt from 'bcrypt';

let port = process.env.MONGODB_PORT,
    host = process.env.MONGODB_HOST,
    db = process.env.MONGODB_DATABASE;

(async () => {
  await mongoose.connect(`mongodb://${host}:${port}/${db}`)
})()

const Schema = mongoose.Schema;

class User {
  user;
  #saltRounds = 10;

  constructor() {
    const userSchema = new Schema({
      username: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      firstName: {
        type: String,
        required: true
      },
      lastName: {
        type: String,
        required: true
      },
      dateCreated: {
        type: Date,
        default: Date.now
      }
    }, {
      toObject: {
        transform: (doc, ret) => {
          delete ret._id;
          delete ret.password;
        }
      },
      toJSON: {
        transform: (doc, ret) => {
          delete ret._id;
          delete ret.password;
        }
      }
    });

    this.user = mongoose.connection.model('users', userSchema);
  }

  async get(username) {
    return this.user.findOne({username: username}).exec();
  }

  async list() {
    return this.user.find().exec();
  }

  async create(data) {
    return this.user.create(await this.#sanitizeUser(data));
  }

  async #sanitizeUser(data) {
      if (data.hasOwnProperty('password')) {
        data.password = await new Promise((resolve, reject) => {
          bcrypt.hash(data.password, this.#saltRounds, (err, hash) => {
            if (err) {
              return reject(err);
            }

            return resolve(hash);
          })
        })
      }

      return data;
  }

  async check(username, password) {
    let user = await this.get(username);
    if (!user) {
      return false;
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return reject(err);
        }

        return resolve(result);
      })
    })
  }

  close() {
    mongoose.disconnect()
  }

}

export default new User();
