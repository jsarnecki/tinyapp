const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret test one', 'another secret test']
}));

const { 
  generateRandomString,
  authenticateUser,
  getUserByEmail,
  findHashPassword,
  getUserURL,
  originalDataLayout
  } = require('./helpers/helperFunctions');

const { users, urlDatabase } = require('./helpers/data');

//////////////GET//////////////

////HOME - ALL URLS
app.get('/urls', (req, res) => {

  const user = req.session.user_id;
  const urlDB = getUserURL(user, urlDatabase);
  //Returns an object of short/long urls for the current loggedin user

  const formattedURLS = originalDataLayout(urlDB);
  //FormattedURLS returns an object in the original object layout, that is much easier to work with, 
  //rather than objects nested inside on object

  const templateVars = {
    urls: urlDB,
    users,
    user
  };

  res.render('urls_index', templateVars);
});

////NEW
app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;
  //Uses the info stored of user from cookieSession
  const templateVars = {
    urls: urlDatabase,
    users,
    user
  };
  res.render("urls_new", templateVars);
});

/////URLS SHOW --- SPECIFIC SHORT URL 
app.get('/urls/:shortURL', (req, res) => {

  const user = req.session.user_id;
  if (!user) {
    //If trying to access link not logged in
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
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users,
    user
  };
  res.render('urls_login', templateVars);
});

///////////////POST/////////////////

//////SUBMIT URL & GENERATE-URL-ID
app.post('/urls', (req, res) => {
  //Turns submitted url into random shortURL and redirects
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  if (longURL.length === 0 || !longURL.includes("http://")) {
    //if longURL does not start with http://, return error
    return res.status(403).send('404 Error: Invalid URL input.  Please begin URL with http://');
  };

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
    //if attempting to delete a shortURL from curl / not logged in
    return res.redirect('/urls');
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

/////UPDATES/EDITS SHORT URL
app.post('/urls/:shortURL', (req, res) => {

  const updatedLongURL = req.body.updatedLongURL;
  const shortURL = req.params.shortURL;
  
  if (updatedLongURL.length === 0 || !updatedLongURL.includes("http://")) {
    //If updatedLongURL is no length, or does not start with http:// return error
    return res.status(403).send('404 Error: Invalid URL input.  Please begin URL with http://');
  }

  //update the urlDB 
  urlDatabase[shortURL].longURL = updatedLongURL;
  res.redirect('/urls');
});

//// LOGIN --- COOKIES
app.post('/login', (req, res) => {

  const { password, email } = req.body;
  //uses the email from login to check database if already exists
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send('404 Error: Email error');
  }

  const hashedPassword = findHashPassword(email, users);
  //finds hashed password using email to match in database
  const passwordCheck = bcrypt.compareSync(password, hashedPassword);

  if (passwordCheck === false) {
    return res.status(403).send('404 Error: Password error');
  }

  //confirms user.id and adds to cookieSession
  req.session.user_id = user.id;
  res.redirect('/urls');
});

////LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
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
  //UPDATE newUser.password to hashed before so not to store text-password

  users[newUser.id] = newUser;
  //adds newUser to users
  req.session.user_id = newUser.id;
  res.redirect('/urls');
});

/////////LISTEN///////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
