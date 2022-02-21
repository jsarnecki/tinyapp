const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');

//index page
app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
})

//about page
app.get('/about', (req, res) => {
  res.render('pages/about');
});

//Use <%- include('RELATIVE/PATH/TO/FILE') %> to embed an EJS partial in another file.


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get('/set', (req, res) => {
//   const a = 1;
//   res.send(`a: ${a}`);
// });

// app.get('/fetch', (req, res) => {
//   res.send(`a, again: ${a}`);
// })
