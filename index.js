const mongoose = require("mongoose");
const express = require("express");
const DictionarySchema = require("./Schema/Dictionary");
const app = express();
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

app.get("/", function (req, res) {
  res.render("home", { results: [], searchTerm: "" });
});
app.post("/", function (req, res) {
  const searchTerm = req.body.searchTerm;
  DictionarySchema.find(
    { Word: { $regex: searchTerm, $options: "i" } },
    (error, results) => {
      if (error) throw error;
      res.render("home", { results: results, searchTerm: searchTerm });
    }
  );
});

app.get("/update", (req, res) => {
  res.render("update",{ results: [], find_word: '' });
});

app.post("/update", (req, res) => {
  const action = req.body.action;

  if (action === "insert") {
    const word = new DictionarySchema({
      Word: req.body.word,
      Definition: req.body.definition,
    });
    word.save();
    res.sendStatus(200);
  } else if (action === "delete-update") {
    const find_word = req.body.find_word;
    DictionarySchema.find({ Word: { $regex: find_word, $options: "i" } },
      (error, result) => {
        if (error) throw error;
       
        res.render("update", { results: result, find_word: find_word });
      }
    );
  } else {
    const type = req.body.action.type;
    const id = req.body.action.id;
    if (type === "delete") {
      DictionarySchema.findByIdAndDelete({ _id: id }, (err) => {
        if (err) throw err;
        else {
          console.log("element deleted");
          res.sendStatus(200);
        }
      });
    } else if (type === "update") {
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
              res.sendStatus(200);
            }
          }
        );
      } else if (word == "") {
        DictionarySchema.findByIdAndUpdate(
          id,
          { Definition: define },
          (err) => {
            if (err) throw err;
            else {
              console.log("element is updated");
              res.sendStatus(200);
            }
          }
        );
      } else if (define == "") {
        DictionarySchema.findByIdAndUpdate(id, { Word: word }, (err) => {
          if (err) throw err;
          else {
            console.log("element is updated");
            res.sendStatus(200);
          }
        });
      }
    }
  }

  res.redirect("/update");
});
