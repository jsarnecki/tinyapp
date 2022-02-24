
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
      return users[id];
    }
  // console.log("email:", users[id].email);
  }
}

const passwordVerify = (password, users) => {
  for (let id in users) {
    console.log("password loop check:", users[id].password, "users:", users[id]);
    if (users[id].password === password) {
      return true;
    }
  }
  return false;
}


module.exports = { authenticateEmail, authenticateUser, getUserByEmail, passwordVerify };