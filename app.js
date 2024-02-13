const express = require("express");
const mongoose = require("mongoose");
const translate = require('translate-google');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = 3000;
const BookUser = require("./models/bookUsers");

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.set("view engine", "ejs");
app.set('views',path.join(process.cwd(), 'views'));

mongoose.connect("mongodb+srv://boiiian:ReYNLTEMgzwLJFxX@cluster0.vf03xwt.mongodb.net/?retryWrites=true&w=majority").then( () => {
    console.log("Connected to db");
}).catch( (error) => {
    console.log("Error: ", error);
});

app.get("/", (req, res) => {
    res.render("homePage", { error: "" });
});

app.get("/books", (req, res) => {
    res.render("index");
});

app.post("/translate", (req, res) => {
    translate(req.body.text, { to: "ru" }).then((translation) => {
        res.json(translation);
    }).catch((error) => {
        console.error("Translation error:", error);
    });
});

app.post("/signIn", async (req, res) => {
    try {
        const user = await BookUser.findOne({ name: req.body.name });
        if (user) {
          const result = req.body.password === user.password;
          if (result) {
            if (user.adminStatus == true) {
                res.redirect(`/users`);
            } else {
                res.redirect(`/books?username=${user.name}`);
            }
          } else {
            res.render("homePage", { error: "Пароль не совпадает" });
          }
        } else {
          res.render("homePage", { error: "Пользователь не существует" });
        }
      } catch (error) {
        res.json({ error });
      }
});

app.post("/signUp", async (req, res) => {
    try {
        let user = new BookUser({
            name: req.body.name,
            password: req.body.password,
            adminStatus: false
        });
        const isExists = await BookUser.findOne({ name: user.name });
        if (isExists) {
            res.render("homePage", { error: "Это имя пользователя уже зарегистрировано" });
        } else {
            await user.save();
            res.redirect(`/books?username=${user.name}`);
        }
    } catch (error) {
        res.json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log("server is started");
});