const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}/${process.env.DB_NAME}`;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const linkSchema = new mongoose.Schema({
  url: String,
  slug: String,
});

const Link = mongoose.model("urls", linkSchema);

app.get(
  "/.well-known/acme-challenge/6OU0gwwXRV92dX-LW82qXtTU_fsHgmkSOsIjixN0GT8",
  (req, res) => {
    res.send(
      "6OU0gwwXRV92dX-LW82qXtTU_fsHgmkSOsIjixN0GT8.hBn_upTIvrjfsdsPFdZsBwOPUPyYUFHOn4L0UnHbzoM"
    );
  }
);

app.get(
  "/.well-known/acme-challenge/w_5iafbFj3NSYJthR4-jfOknBFA9QIv4w_K2JM_5dkc",
  (req, res) => {
    res.send(
      "w_5iafbFj3NSYJthR4-jfOknBFA9QIv4w_K2JM_5dkc.hBn_upTIvrjfsdsPFdZsBwOPUPyYUFHOn4L0UnHbzoM"
    );
  }
);

app.get("/", (req, res) => {
  res.render("index", {
    message: req.query.m,
    type: req.query.type,
    link: req.query.link,
  });
});

app.get("/:slug", (req, res) => {
  Link.findOne({ slug: req.params.slug }, (err, link) => {
    if (link) {
      res.redirect(link.url);
    } else {
      res.render("not-found", { slug: req.params.slug });
    }
  });
});

app.post("/url", (req, res) => {
  Link.exists({ slug: req.body.slug }, (err, isUsed) => {
    if (err) {
      console.log(err);
    } else {
      if (isUsed) {
        res.redirect("/?m=Slug%20In%20Use&type=danger");
      } else {
        const { url, slug } = req.body;
        const link = new Link({
          url: `http://${url}`,
          slug: slug,
        });
        link.save();
        res.redirect(
          `/?m=Link%20Created%20&type=primary&link=http%3A%2F%2Fr.babega.com%2F${slug}`
        );
      }
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
