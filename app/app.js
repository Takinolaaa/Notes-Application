import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from 'express-session';
import { engine } from "express-handlebars";
import { MongoNotes } from "./mongoNotes.js";
import passport from "passport";
import passportLocal from "passport-local";
import * as userModel from "./UserSuperagent.js";

const LocalStrategy = passportLocal.Strategy;
const journal = new MongoNotes();
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");


app.use(express.static('./public'))



app.use(session({
  secret: 'keyboard mouse',
  resave: true,
  saveUninitialized: true,
}))

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.user) {
    console.log("we have a user", req.user)
    res.locals.user = req.user;
  }
  next();
})



passport.use(new LocalStrategy(async (username, password, done) => {
  console.log('Trying to login', username);
  try {
    let res = await userModel.check(username, password),
        user = res.data;

    if (user) {
      console.log('The user has logged in!', username);
      done(null, {id: user.username, username: user.username});
    } else {
      console.log('The username or password combo did not work!', username);
      done(null, false, 'Invalid username/password');
    }
  } catch (e) {
    done(e)
  }
}))

passport.serializeUser((user, done) => {
  try {
      console.log('serialize user', user);
      done(null, user.username);
  } catch (e) {
      done(e);
  }
})

passport.deserializeUser(async (username, done) => {
try {
  console.log('deserializeUser', username);
  let res = await userModel.find(username);
  done(null, res.data);
} catch (e) {
  done(e)
}
})

function authenticate(req, res, next) {
console.log('authenticate');
try {
  if (req.user) {
    console.log('The user is logged in!');
    next();
  } else {
    console.log('The user is not logged in!');
    res.redirect('/login');
  }
} catch (e) {
  next(e)
}
}

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.get("/", async (req, res) => {
  let note = await journal.list();
  res.render("home", { note });
});

app.get("/create", authenticate, async (req, res) => {
  res.render("notes-edit");
});

app.get("/delete/:id", authenticate, async (req, res) => {
  await journal.delete(req.params.id);
  res.redirect("/");
});

app.get("/edit/:id", authenticate, async (req, res) => {
  let note = await journal.read(req.params.id);
  res.render("notes-edit", { note, editMode: true });
});

app.get("/note/:id", async (req, res) => {
  let note = await journal.read(req.params.id);
  res.render("note", { note });
});

app.post("/note", authenticate, async (req, res) => {
  let key = req.body.key;
  if (key) {
    key = await journal.update(req.body);
  } else {
    key = await journal.create(req.body);
  }
  res.redirect("/note/" + key);
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Call userModel method to create a new user
    await userModel.createUser(username, password);

    // Redirect the user to the login page or home page
    res.redirect('/login');
  } catch (error) {
    // Handle errors, such as duplicate usernames or database issues
    next(error);
  }
});


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

