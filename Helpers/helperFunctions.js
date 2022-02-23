
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
  if (!checkUser.userID || !checkUser.email || !checkUser.password) {
    console.log({error: "404 Error: Must fill in all inputs", data: null});
    return {error: '404 Error: Must fill in all inputs', data: null};
    //res.status(400).send('404 Error: Must fill in all inputs');
  }
  if(userDB[checkUser.userID]) {
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

module.exports = { authenticateEmail, authenticateUser };