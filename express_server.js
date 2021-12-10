const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080; 
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const users = { 
  "haobc4": {
    id: "haobc4", 
    email: "najmad09@gmail.com", 
    password: "1234"
  },
 "2yx5a7": {
    id: "2yx5a7", 
    email: "najma_d00@hotmail.com", 
    password: "5678"
  }
}

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "haobc4"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "haobc4"
  }
};

const findUserByEmail = (email) => {
  for(const id in users) {
    const user = users[id];
    if(user.email === email) {
      return user;
    }
  }
  return null;
}

const findAllUrlsByUserId = (userID) => {
  const userUrls = {};
  for(const id in urlDatabase) {
    const url = urlDatabase[id];
    if(url.userID === userID) {
      userUrls[id] = url.longURL;
    }
  }
  return userUrls;
}


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]
  if (user) {
    const myURLs = findAllUrlsByUserId(user.id);
    
    const templateVars = { 
      user: user,
      urls: myURLs
    };
    res.render("urls_index", templateVars);
  }

  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    const shortURL = generateRandomString(); 
    const longURL = req.body.longURL;
    const urlEntry = {
      "longURL": longURL,
      "userID": user.id
    }
    urlDatabase[shortURL]= urlEntry;
    res.redirect("/urls/" + shortURL);
  }
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = { 
    user: user
  };
  res.render("user_registration", templateVars);
});

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send("a user already exists with that email")
  }

  users[user_id] = {
    id: user_id,
    email: email,
    password: password
  }
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = { 
    user: user
  };
  res.render("user_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  const user = findUserByEmail(email);
  
  if(!user){
    return res.status(403).send("a user with that email does not exist")
  }

  if(user.password !== password) {
    return res.status(403).send('password does not match')
  }

  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});



app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    res.redirect("/login");
  }
  const templateVars = { 
    user: user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const url = urlDatabase[req.params.shortURL];
  const templateVars = { 
    user: user,
    shortURL: req.params.shortURL, 
    longURL: url["longURL"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  const longURL = url["longURL"];
  res.redirect(longURL);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});