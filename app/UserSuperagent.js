import axios from 'axios';

export async function check(username, password) {
    return axios.post(`${process.env.USER_SERVICE_URL}/users/check/${username}`, {
      password: password
    }, {
      auth: {
        username: process.env.USER_SERVICE_USER,
        password: process.env.USER_SERVICE_KEY
      }
    })
  }

export async function find(username) {
  return axios.get(`${process.env.USER_SERVICE_URL}/users/${username}`, {
    auth: {
      username: process.env.USER_SERVICE_USER,
      password: process.env.USER_SERVICE_KEY
    }
  })
}



export async function createUser(username, password) {
  return axios.get(`${process.env.USER_SERVICE_URL}/users/${username}`, {
    auth: {
      username: process.env.USER_SERVICE_USER,
      password: process.env.USER_SERVICE_KEY
    }
  });
}
