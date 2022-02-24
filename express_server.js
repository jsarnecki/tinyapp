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


const getUserURL = (user, urlDB) => {
  const obj = {};
  for (let url in urlDB) {
    if (urlDB[url].userID === user.id) {
      obj[url] = urlDB[url].longURL;
    }
  }
  return obj;
}



//////////////GET//////////////

////HOME - ALL URLS
app.get('/urls', (req, res) => {
  const user = users[req.cookies["user_id"]];
  console.log("user:", user);

  if (user) {//POTENTIALLY CHANGE, (.. !urlDB), or else it may screw up when coming back to this


    //IF USER IS DEFINED
    const urlDB = getUserURL(user, urlDatabase);
    console.log(urlDB);
    const templateVars = {
      urls: urlDB, 
      user
    };
    res.render('urls_index', templateVars);
  }

  //IF USER IS NOT DEFINED
  const templateVars = {
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
  const user = users[req.cookies["user_id"]];//this already sorted

  //console.log("urlDatabase:", urlDatabase);
  //console.log("new urlDB:", urlDB);

  const urlDB = getUserURL(user, urlDatabase);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDB[req.params.shortURL],
    urls: urlDB, 
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

//////SUBMIT URL & GENERATE-ID
app.post('/urls', (req, res) => {
  //Turns submitted url into random shortURL and redirects
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const user = users[req.cookies["user_id"]];

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user.id
  };
  
  res.redirect(`/urls/${shortURL}`);
});

//////DELETE URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

/////UPDATES/EDITS SHORT URL
app.post('/urls/:shortURL', (req, res) => {
  const updatedLongURL = req.body.updatedLongURL;
  const shortURL = req.params.shortURL;

  urlDatabase[shortURL].longURL = updatedLongURL;
  //update the urlDB 
  //urlDB[shortURL] = updatedLongURL;

  res.redirect('/urls');
});

//// LOGIN --- COOKIES
app.post('/login', (req, res) => {

  const { password, email } = req.body;
  let user = getUserByEmail(email, users);
  let isPassword = passwordVerify(password, users);

  // console.log("password submitted:", password);

  if (!user) {
    return res.status(403).send('404 Error: Email error');
  }

  if (isPassword === false) {
    return res.status(403).send('404 Error: Password error');
  }
  
  res.cookie('user_id', user.id);

  //console.log("user:", user);

  res.redirect('/urls');
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