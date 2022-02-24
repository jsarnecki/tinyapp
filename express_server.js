const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const { authenticateEmail, authenticateUser, getUserByEmail, passwordVerify } = require('./Helpers/helperFunctions');

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  'admin': {
      id: 'admin',
      email: 'joshsarnecki@gmail.com',
      password: 'teacup'
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
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  res.render('urls_index', templateVars);
});

////NEW
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  res.render("urls_new", templateVars);
});

/////URLS SHOW --- SPECIFIC SHORT URL 
app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render('urls_show', templateVars);
});

/////TO ACTUAL LONG URL REDIRECT
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

////REGISTER
app.get('/register', (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render('urls_register', templateVars);
});

/////LOGIN
app.get('/login', (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render('urls_login', templateVars);
});


///////////////POST/////////////////

app.post('/urls', (req, res) => {
  //Turns submitted url into random shortURL and redirects
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const updatedLongURL = req.body.updatedLongURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect('/urls');
});

//// LOGIN --- COOKIES
app.post('/login', (req, res) => {

  const { password, email } = req.body;
  let user = getUserByEmail(email, users);
  let isPassword = passwordVerify(password, users);

  if (!user) {
    return res.status(403).send('404 Error: Email error');
  }

  if (isPassword === false) {
    return res.status(403).send('404 Error: Password error');
  }
  
  res.cookie('user_id', user.id);

  //console.log("user:", user);

  res.redirect('/urls');
  console.log("invalid email");
});

////LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
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

  if (error) {
    return res.status(400).send(error);
  }

  users[newUser.id] = newUser;//adds newUser to users
  //res.cookie('newUser', newUser);
  res.cookie('user_id', newUser.id);
  console.log("users:", users);
  res.redirect('/urls');
});


/////////LISTEN///////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//////////NOTES//////////

//Use <%- include('RELATIVE/PATH/TO/FILE') %> to embed an EJS partial in another file.