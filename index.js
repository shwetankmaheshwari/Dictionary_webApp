const mongoose = require("mongoose");
const express = require("express");
const DictionarySchema = require("./Schema/Dictionary");
const userSchema = require("./Schema/users");
const app = express();
const session = require("express-session");
app.use(
  session({
    secret: "shwetankmaheshwariismyname",
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

const port = 5050;
const mongoUrl = "mongodb://127.0.0.1:27017/DictionaryDB";

app.listen(port, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Server is connecting on port " + port);
  }
});

mongoose.connect(mongoUrl, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("MongoDB is Connected");
  }
});

// http://localhost:5050/
app.get("/", function (req, res) {
  res.render("home", { results: [], searchTerm: "" });
});

app.post("/", function (req, res) {
  const searchTerm = req.body.searchTerm;

  // getting the form data from client and searching in database

  DictionarySchema.find(
    { Word: { $regex: searchTerm, $options: "i" } },
    (error, results) => {
      if (error) throw error;
      if (req.body.action === "delete-update") {
        // here date is render to update page on which by use of _id of the element delete or update is perform
        res.render("update", { results: results, searchTerm: searchTerm });
      }
      // data send to home page to find out the words
      else res.render("home", { results: results, searchTerm: searchTerm });
    }
  );
});

app.get("/login", function (req, res) {
  res.render("login");
});

// checking login credentials
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await userSchema.findOne({ username: username });

  if (user.password === password) {
    console.log("loged in");
    req.session.isLoggedIn = true;
    res.render("update", { results: [], find_word: "" });
  } else {
    res.render("login", { message: "Invalid username or password" });
  }
});

// function which check that person is logged in or not if not then restrict insertion deletion and update
function requireLogin(req, res, next) {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
}

// http://localhost:5050/update
app.get("/update", (req, res) => {
  res.render("update", { results: [], find_word: "" });
});

app.post("/update", requireLogin, (req, res) => {
  // inserting the new word  and updating the dictionary
  const word = new DictionarySchema({
    Word: req.body.word,
    Definition: req.body.definition,
  });

  word.save();
  res.redirect("/update");
});

// to handle the delete request
app.post("/delete", requireLogin, (req, res) => {
  const id = req.body.action;
  // _id if the element is taken and delete that word from db
  DictionarySchema.findByIdAndDelete(id, (err, doc) => {
    if (err) throw err;
    else {
      console.log("element deleted", doc);
      res.json(doc);
    }
  });
});

app.post("/updateElement", requireLogin, (req, res) => {
  const id = req.body.action;
  // _id if the element is taken and update that word or its definition from db
  const word = req.body.word;
  const define = req.body.definition;
  if (word != "" && define != "") {
    DictionarySchema.findByIdAndUpdate(
      id,
      { Word: word, Definition: define },
      (err) => {
        if (err) throw err;
        else {
          console.log("element is updated");
          res.redirect("/update");
        }
      }
    );
  } else if (word == "") {
    DictionarySchema.findByIdAndUpdate(id, { Definition: define }, (err) => {
      if (err) throw err;
      else {
        console.log("element is updated");
        res.redirect("/update");
      }
    });
  } else if (define == "") {
    DictionarySchema.findByIdAndUpdate(id, { Word: word }, (err) => {
      if (err) throw err;
      else {
        console.log("element is updated");
        res.redirect("/update");
      }
    });
  }
});
