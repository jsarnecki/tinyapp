const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
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
  getUserURL
} = require('./helpers/helperFunctions');

const { users, urlDatabase } = require('./helpers/data');

app.get('/', (req, res) => {
  res.redirect('urls');
});

app.get('/urls', (req, res) => {

  const user = req.session.user_id;
  const urlDB = getUserURL(user, urlDatabase);
  // Returns an object of short/long urls for the current loggedin user

  const templateVars = {
    urls: urlDB,
    users,
    user
  };

  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = req.session.user_id;
  // Uses the info stored of user from cookieSession
  const templateVars = {
    urls: urlDatabase,
    users,
    user
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {

  const user = req.session.user_id;
  if (!user) {
    // If trying to access link not logged in
    return res.status(403).send('404 Error: You do not have permission to edit this link');
  }

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

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const user = req.session.user_id;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render('urls_register', templateVars);
});

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

app.post('/urls', (req, res) => {
  // Turns submitted url into random shortURL and redirects
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  if (!longURL.includes('http://')) {
    // If longURL does not start with http:// return error
    return res.status(403).send('404 Error: Invalid URL input.  Please begin URL with http://');
  }

  if (longURL.length < 12) {
    // If longURL is less than avg url length return error
    return res.status(403).send('404 Error: Invalid URL input.  URL not long enough');
  }

  const user = req.session.user_id;
  urlDatabase[shortURL] = {
    // Adds new shorturl to user's database
    longURL: longURL,
    users,
    userID: user
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    // If attempting to delete a shortURL from curl / not logged in
    return res.redirect('/urls');
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {

  const updatedLongURL = req.body.updatedLongURL;
  const shortURL = req.params.shortURL;
  
  if (!updatedLongURL.includes('http://')) {
    // If updatedLongURL does not start with http:// return error
    return res.status(403).send('404 Error: Invalid URL input.  Please begin URL with http://');
  }

  if (updatedLongURL.length < 12) {
    // If updatedLongURL is less than avg url length return error
    return res.status(403).send('404 Error: Invalid URL input.  URL not long enough');
  }

  // Updates the urlDB
  urlDatabase[shortURL].longURL = updatedLongURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {

  const { password, email } = req.body;
  // Uses the email from login to check database if already exists
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send('404 Error: Email error');
  }

  const hashedPassword = findHashPassword(email, users);
  // Finds hashed password using email to match in database
  const passwordCheck = bcrypt.compareSync(password, hashedPassword);

  if (passwordCheck === false) {
    return res.status(403).send('404 Error: Password error');
  }

  // Confirms user.id and adds to cookieSession
  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const newUser = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password
  };

  // Authenticates the ID, email, and checks for empty inputs
  const {error, data} = authenticateUser(newUser, users);
  // Validates that there is infact input
  // Data kept for potential future user / data usage
  
  if (error) {
    return res.status(400).send(error);
  }

  // Now hash the password
  const hashedPassword = bcrypt.hashSync(newUser.password, 10);
  newUser.password = hashedPassword;
  // Update newUser.password to hashed before so not to store text-password

  users[newUser.id] = newUser;
  // Adds newUser to users

  req.session.user_id = newUser.id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Tiny App server listening on port ${PORT}!`);
});
