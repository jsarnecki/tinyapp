const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const bcrypt = require('bcryptjs');

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

const originalDataLayout = (db) => {
  let obj = {};
  for (let longURL in db) {
    obj.longURL = db[longURL].longURL;
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
    
    // function(urlDatabase) {} Function to check if user has urls yet, if not, add the "checkout new url button to get started"

    const urlDB = getUserURL(user, urlDatabase);
    console.log("urlDB:", urlDB);
    const templateVars = {
      urls: urlDB, 
      user
    };
    res.render('urls_index', templateVars);
  }
  let urlDB = originalDataLayout(urlDatabase);

  //IF USER IS NOT DEFINED
  const templateVars = {
    urls: urlDB,
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
  if (!user) {
    //IF TRYING TO ACCESS LINK NOT LOGGED IN
  console.log("trigger2");
   let urlDB = originalDataLayout(urlDatabase);
   console.log("new:", urlDB);
  
   const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDB.longURL,
    urls: urlDB, 
    user
    };

  console.log("shortURL:", templateVars.shortURL);
  console.log("urlDB:", templateVars.urls);
  console.log("urlDatabase:", urlDatabase);

  res.render('urls_show', templateVars);
  }


  const urlDB = getUserURL(user, urlDatabase);
  console.log("trigger1");
  
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDB[req.params.shortURL],
    urls: urlDB, 
    user
  };

  console.log("shortURL:", templateVars.shortURL);
  console.log("longURL:", templateVars.longURL);
  console.log("urlDB:", templateVars.urls);
  console.log("urlDatabase:", urlDatabase);

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

  //if longURL does not start with http://, return error
  if (longURL.length === 0 || !longURL.includes("http://")) {
    return res.status(403).send('404 Error: Invalid URL input.  Please begin URL with http://');
  }

  const user = users[req.cookies["user_id"]];

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user.id
  };
  
  res.redirect(`/urls/${shortURL}`);
});

//////DELETE URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.cookies["user_id"]];

  if (!user) {
    //console.log("this user deleted tho shouldnt have:", user);
    return res.redirect('/urls');
  }

  console.log(`${user} deleted ${req.params.shortURL}`);
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