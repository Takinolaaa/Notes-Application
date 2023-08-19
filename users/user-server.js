import * as dotenv from 'dotenv';
dotenv.config();

import restify from 'restify';
import User from './user-serialize.js';

const app = restify.createServer({
  name: 'User-Auth-Service',
  version: '0.0.1'
});

app.use(restify.plugins.authorizationParser());
app.use(authorize);
app.use(restify.plugins.acceptParser(app.acceptable));
app.use(restify.plugins.queryParser());
app.use(restify.plugins.bodyParser());

app.listen(process.env.PORT, () => {
  console.log(`App ${app.name} listening on: ${app.url}`)
});

app.get('/', (req, res, next) => {
  res.send('hello world!!');
})

app.get('/users', async (req, res) => {
  res.send(await User.list());
});

// Get an existing user
app.get('/users/:username', async (req, res) => {
  let user = await User.get(req.params.username);
  res.send(user);
});

// Create a new user
app.post('/users', async (req, res) => {
  let user = await User.create(req.body);
  res.send(user);
});

app.put('/users/:username', (req, res, next) => {
  // Update (or create) the user!
  res.send('ok!');
})

// Delete the user
app.del('/users', (req, res, next) => {
  res.send('ok!');
});

app.post('/users/check/:username', async (req, res) => {
  let username = req.params.username;
  
  if (await User.check(username, req.body.password)) {
    let user = await User.get(username);
    res.send(user);
  } else {
    res.send('Invalid username/password!');
  }
});

let apiKeys = [
  {
    user: process.env.USER_SERVICE_USER,
    key: process.env.USER_SERVICE_KEY,
  }
]



function authorize(req, res, next) {
  if (req.authorization && req.authorization.basic) {
    let found = false;
    for (let auth of apiKeys) {
      if (auth.user === req.authorization.basic.username &&
          auth.key === req.authorization.basic.password) {
            found = true;
            break;
        }
    }

    if (found) {
      next();
    } else {
      req.send(401, new Error('Not authorized!'));
      next(false);
    }
  } else {
    res.send(500, new Error('No API key!'))
    next(false);
  }
}