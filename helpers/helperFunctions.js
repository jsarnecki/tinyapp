//FOR POTENTIAL TESTING PURPOSES
const users = {
  'testUser': {
    id: 'testUser',
    email: 'test@user.ca',
    password: '$2a$10$bmDZVNexuP9GZHPtrOVywepwP2tlrZvehKGwm9WxWpyxwc.f8Prrm'
  },  
  'admin': {
      id: 'admin',
      email: 'joshsarnecki@gmail.com',
      password: '$2a$10$r7vErsgCElCbKdbRfUkASebHpuGUJ9D9h9sBwBb9wyFRuTbgnnQJi'
  },
  "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
  }
};
//FOR POTENTIAL TESTING PURPOSES
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "admin"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "admin"
  }
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
};

const authenticateEmail = (checkUser, userDB) => {
  for (const id in userDB) {
    if (userDB[id].email === checkUser.email) {
      console.log({error: "404 Error: Email already in use", data: null});
      return {error: '404 Error: Email already in use', data: null};
    }
  }
  return {error: null, data: checkUser};
};

const authenticateUser = (checkUser, userDB) => {
  if (!checkUser.id || !checkUser.email || !checkUser.password) {
    console.log({error: "404 Error: Must fill in all inputs", data: null});
    return {error: '404 Error: Must fill in all inputs', data: null};
  }
  if(userDB[checkUser.id]) {
    console.log({error: "404 Error: UserID already in use", data: null});
    return {error: '404 Error: UserID already in use', data: null};
  }
  for (const id in userDB) {
    if (userDB[id].email === checkUser.email) {
      console.log({error: "404 Error: Email already in use", data: null});
      return {error: '404 Error: Email already in use', data: null};
    }
  }
  return {error: null, data: checkUser};
};

const getUserByEmail = (email, users) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
};

const findHashPassword = (email, users) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id].password;
    }
  }
  return false;
};

const getUserURL = (user, urlDB) => {
  const obj = {};
  for (const url in urlDB) {
    if (urlDB[url].userID === user) {
      obj[url] = urlDB[url].longURL;
    }
  }
  return obj;
};

const originalDataLayout = (db) => {
  const obj = {};
  for (const longURL in db) {
    obj.longURL = db[longURL].longURL;
  }
  return obj;
};

module.exports = { 
  authenticateEmail,
  authenticateUser,
  getUserByEmail,
  findHashPassword,
  getUserURL,
  originalDataLayout,
  generateRandomString
 };