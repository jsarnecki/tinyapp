
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
};

const authenticateEmail = (checkUser, userDB) => {
  for (const id in userDB) {
    if (userDB[id].email === checkUser.email) {
      console.log({error: "404 Error: Email already in use", data: null});
      return {error: '404 Error: Email already in use', data: null};
      //res.status(400).send('404 Error: Email already in use');
    }
  }
  return {error: null, data: checkUser};
};

const authenticateUser = (checkUser, userDB) => {
  if (!checkUser.id || !checkUser.email || !checkUser.password) {
    console.log({error: "404 Error: Must fill in all inputs", data: null});
    return {error: '404 Error: Must fill in all inputs', data: null};
    //res.status(400).send('404 Error: Must fill in all inputs');
  }
  if(userDB[checkUser.id]) {
    console.log({error: "404 Error: UserID already in use", data: null});
    return {error: '404 Error: UserID already in use', data: null};
    // res.status(400).send('404 Error: UserID already in use');
  }
  for (const id in userDB) {
    if (userDB[id].email === checkUser.email) {
      console.log({error: "404 Error: Email already in use", data: null});
      return {error: '404 Error: Email already in use', data: null};
      //res.status(400).send('404 Error: Email already in use');
    }
  }
  return {error: null, data: checkUser};
};

const getUserByEmail = (email, users) => {
  for (let id in users) {
    if (users[id].email === email) {
     // console.log(`${users[id].email} === ${email}`);
      return users[id];
    }
   //console.log("email:", users[id].email);
  }
}

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



// const passwordVerify = (password, users) => {
//   for (let id in users) {
//     //console.log("password loop check:", users[id].password, "users:", users[id]);
//     if (users[id].password === password) {
//       return true;
//     }
//   }
//   return false;
// }

const findHashPassword = (email, users) => {
  for (let id in users) {
    //console.log("password loop check:", users[id].password, "users:", users[id]);
    if (users[id].email === email) {
      return users[id].password;
    }
  }
  return false;
}

const getUserURL = (user, urlDB) => {
  const obj = {};
  for (let url in urlDB) {
    if (urlDB[url].userID === user) {
      obj[url] = urlDB[url].longURL;
    }
  }
  return obj;
}

const originalDataLayout = (db) => {
  let obj = {};
  for (let longURL in db) {
    obj.longURL = db[longURL].longURL;
  }
  return obj;
}

console.log(getUserURL('admin', urlDatabase));


module.exports = { 
  authenticateEmail,
  authenticateUser,
  getUserByEmail,
  findHashPassword,
  getUserURL,
  originalDataLayout,
  generateRandomString
 };