import {expect} from 'chai';
import User from '../user-serialize.js';

describe('My first tests', function() {
  it('One is a number', function() {
    let one = 1;
    expect(one).to.be.a('number');
  });

  it('Strings are strings!', function() {
    let string = 'hello world!';

    expect(string).to.be.a('string');
    expect(string).to.not.be.empty;
    expect(string.length).to.eq(12);
  });
});

describe('Fetching users', function() {
  it('Getting an existing user', async function() {
    let user = await User.get('admin');
    expect(user).to.be.an('object');
    expect(user).to.not.be.empty;
    expect(user).to.have.property('username');
  });

  it('Getting a non existing user', async function() {
    let user = await User.get('0000000000000');
    expect(user).to.be.null;
  })
});

describe('Checking passwords ', function() {
  let username = 'admin',
      password = 'admin';

  it('Checking that password matches', async function() {
    let check = await User.check(username, password);
    expect(check).to.be.a('boolean');
    expect(check).to.eq(true);
  });

  it('Checking that password fails', async function() {
    let check = await User.check(username, 'doauhwduoidp;a');
    expect(check).to.be.a('boolean');
    expect(check).to.eq(false);
  });
});



after(function() {
  User.close();
})
  