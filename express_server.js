const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['secret test one', 'another secret test']
}));

const bcrypt = require('bcryptjs');

const { 
  generateRandomString,
  authenticateUser,
  getUserByEmail,
  findHashPassword,
  getUserURL,
  originalDataLayout
  } = require('./helpers/helperFunctions');

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

//////////////GET//////////////

////HOME - ALL URLS
app.get('/urls', (req, res) => {
  //const user = users[req.cookies["user_id"]];
  const user = req.session.user_id;
  // console.log("first user:", user);
  // console.log("users, before checking if user is defined:", users);

  // if (user) {//POTENTIALLY CHANGE, (.. !urlDB), or else it may screw up when coming back to this
  //   //IF USER IS DEFINED
  //   //console.log("users, after checking  user IS defined:", users);
    
  //   // function(urlDatabase) {} Function to check if user has urls yet, if not, add the "checkout new url button to get started"

  //   const urlDB = getUserURL(user, urlDatabase);
  //   console.log("urlDB:", urlDB);
  //   const templateVars = {
  //     urls: urlDB,
  //     users,
  //     user
  //   };
  //   console.log("users", users);
  //   res.render('urls_index', templateVars);
  // }

  const urlDB = getUserURL(user, urlDatabase);
  //IF USER IS NOT DEFINED
  let formattedURLS = originalDataLayout(urlDB);

  const templateVars = {
    urls: urlDB,
    users,
    user
  };

  console.log("user undefined?", user);
  res.render('urls_index', templateVars);
});

////NEW
app.get("/urls/new", (req, res) => {
  // const user = users[req.cookies["user_id"]];
  const user = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    users,
    user
  };
  console.log("second user:", user);
  res.render("urls_new", templateVars);
});

/////URLS SHOW --- SPECIFIC SHORT URL 
app.get('/urls/:shortURL', (req, res) => {

  const user = req.session.user_id;

  if (!user) {
    //IF TRYING TO ACCESS LINK NOT LOGGED IN
    return res.status(403).send('404 Error: Forbidden');

    };

  const urlDB = getUserURL(user, urlDatabase);

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDB[req.params.shortURL],
    urls: urlDB,
    users,
    user
  };

  res.render('urls_show', templateVars);
});

/////TO ACTUAL LONG URL REDIRECT
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

////REGISTER
app.get('/register', (req, res) => {

  const user = req.session.user_id;

  console.log("req.session, get register:", req.session);
  console.log("user get register:", user);

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render('urls_register', templateVars);
});

/////LOGIN
app.get('/login', (req, res) => {
  const user = req.session.user_id;

  console.log("user get login:", user);

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users,
    user
  };
  res.render('urls_login', templateVars);
});


///////////////POST/////////////////

//////SUBMIT URL & GENERATE-ID
app.post('/urls', (req, res) => {
  //Turns submitted url into random shortURL and redirects
  
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  //if longURL does not start with http://, return error
  if (longURL.length === 0 || !longURL.includes("http://")) {
    return res.status(403).send('404 Error: Invalid URL input.  Please begin URL with http://');
  }

  const user = req.session.user_id;

  urlDatabase[shortURL] = {
    longURL: longURL,
    users,
    userID: user
  };
  
  res.redirect(`/urls/${shortURL}`);
});

//////DELETE URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = req.session.user_id;

  if (!user) {
    return res.redirect('/urls');
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

/////UPDATES/EDITS SHORT URL
app.post('/urls/:shortURL', (req, res) => {

  //If updatedLURL is no length, or does not start with http:// return error
  const updatedLongURL = req.body.updatedLongURL;
  const shortURL = req.params.shortURL;

  if (updatedLongURL.length === 0 || !updatedLongURL.includes("http://")) {
    return res.status(403).send('404 Error: Invalid URL input.  Please begin URL with http://');
  }

  urlDatabase[shortURL].longURL = updatedLongURL;
  //update the urlDB 
  //urlDB[shortURL] = updatedLongURL;

  res.redirect('/urls');
});

//// LOGIN --- COOKIES
app.post('/login', (req, res) => {

  const { password, email } = req.body;
  let user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send('404 Error: Email error');
  }

  const hashedPassword = findHashPassword(email, users);
  const passwordCheck = bcrypt.compareSync(password, hashedPassword);

  if (passwordCheck === false) {
    return res.status(403).send('404 Error: Password error');
  }
  
  //res.cookie('user_id', user.id);
  req.session.user_id = user.id;

  console.log("req.session.user_id post login:", req.session.user_id);

  //console.log("user:", user);

  res.redirect('/urls');
});

////LOGOUT
app.post('/logout', (req, res) => {
  //res.clearCookie("user_id");
  req.session = null;
  console.log("logout post, should be null:", req.session);
  res.redirect('/urls');
});

/////REGISTER
app.post('/register', (req, res) => {
  const newUser = {
    id: req.body.userID,
    email: req.body.email,
    password: req.body.password
  };

  //authenticates the ID, email, and checks for empty inputs
  const {error, data} = authenticateUser(newUser, users);
  //validates that there is infact input
  if (error) {
    return res.status(400).send(error);
  }

  //Now hash the password
  const hashedPassword = bcrypt.hashSync(newUser.password, 10);
  newUser.password = hashedPassword;
  //UPDATE newUser.password TO HASHED BEFORE 

  users[newUser.id] = newUser;//adds newUser to users
  //res.cookie('newUser', newUser);
  //res.cookie('user_id', newUser.id);
  req.session.user_id = newUser.id;
  console.log("users:", users);
  console.log("req.session.user_id  post register, set from newUser.id:", req.session.user_id);

  res.redirect('/urls');
});


/////////LISTEN///////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//////////NOTES//////////

//Use <%- include('RELATIVE/PATH/TO/FILE') %> to embed an EJS partial in another file.