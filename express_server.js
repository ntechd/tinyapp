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
    userID: "2yx5a7"
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

const urlsForUser = (userID) => {
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
  const templateVars = { 
    user: null,
    urls: null
  };
  if (user) {
    const myURLs = urlsForUser(user.id);
    
    const templateVars = { 
      user: user,
      urls: myURLs
    };
    res.render("urls_index", templateVars);
  }
  else {
    res.render("urls_index", templateVars);
  }
  
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
  const shortURL = req.params.id;
  const user_id = req.cookies["user_id"];
  const urls = urlsForUser(user_id);

  

  if (shortURL in urls) {
    let url = urlDatabase[shortURL];
    url["longURL"] = req.body.newURL;
  }
  else {
    res.status(403).send("you can not edit somone's else URL")
  }
  
  
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies["user_id"];
  const urls = urlsForUser(user_id);

  console.log(shortURL);

  if (shortURL in urls) {
    delete urlDatabase[shortURL];
  }
  else {
    res.status(403).send("you can not delete somone's else URL")
  }
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
  if (user) {
    const user_id = user.id;
    const urls = urlsForUser(user_id);
    const shortURL = req.params.shortURL;
    if (shortURL in urls) {
      const url = urls[shortURL];
    const templateVars = { 
      user: user,
      shortURL, 
      longURL: url["longURL"]
    };


    if(user["id"] !== url["userID"]) {
      templateVars["userError"] = true; 
    } else {
      templateVars["userError"] = false; 
    }
    console.log(user.id);
    res.render("urls_show", templateVars);
    }
    else {
      console.log("Error");
    }
  }

  const templateVars = { 
    user: null,
    userError: false
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