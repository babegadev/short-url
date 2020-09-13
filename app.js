const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.get("X-Forwarded-Proto") !== "https") {
    res.redirect("https://" + req.get("Host") + req.url);
  } else next();
});

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}/${process.env.DB_NAME}`;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const linkSchema = new mongoose.Schema({
  url: String,
  slug: String,
});

const Link = mongoose.model("urls", linkSchema);

app.get("/", (req, res) => {
  res.sendFile("index");
});

app.get("/:slug", (req, res) => {
  Link.findOne({ slug: req.params.slug }, (err, link) => {
    if (link) {
      res.redirect(link.url);
    } else {
      res.redirect("/");
    }
  });
});

app.post("/url", (req, res) => {
  Link.exists({ slug: req.body.slug }, (err, isUsed) => {
    if (err) {
      console.log(err);
    } else {
      if (isUsed) {
        res.write("Slug in use");
      } else {
        const { url, slug } = req.body;
        const link = new Link({
          url: url,
          slug: slug,
        });
        link.save();
        res.redirect("/");
      }
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
