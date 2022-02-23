const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//////////////GET//////////////

////HOME - ALL URLS
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars);
});

////NEW
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

/////URLS SHOW --- SPECIFIC SHORT URL 
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render('urls_show', templateVars);
});

/////TO ACTUAL LONG URL REDIRECT
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
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

////COOKIES
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  //Adds 'username' to cookies, so that tempVars  
  //can pick it up in get('/urls') via req.cookies ln28
  res.redirect('/urls');
});

////LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});


/////////LISTEN///////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//////////NOTES//////////

//Use <%- include('RELATIVE/PATH/TO/FILE') %> to embed an EJS partial in another file.