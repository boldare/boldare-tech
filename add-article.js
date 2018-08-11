const mkdirp = require("mkdirp");
const path = require("path");
const fs = require("fs");

const POSTS_DIR = "./content/posts/";

const args = process.argv.reduce((obj, arg) => {
  const match = arg.match(/^--(.+)="?(.+)"?$/);
  if (match) {
    obj[match[1]] = match[2];
  }
  return obj;
}, {});

const name = args.name;
if (!name) {
  console.log("Type the article name as an argument: --name=\"My new article\"");
  process.exit(1);
}
const date = new Date();
let month = (date.getMonth() + 1).toString();
if (month.length === 1) {
  month = "0" + month;
}
let day = date.getDay().toString();
if (day.length === 1) {
  day = "0" + day;
}
const dateString = date.getFullYear() + "-" + month + "-" + day;

const slug =
  dateString +
  "--" +
  name
    .trim()
    .toLowerCase()
    .replace(/[!@#$%^&*()_+\-=\\/ ]/g, "-");

const location = path.join(POSTS_DIR, slug);
console.log("Location: " + location);

if (fs.existsSync(location)) {
  console.log("Article already exists");
  process.exit(2);
}
mkdirp.sync(location);

const template = `\
---
title: ${name}
subTitle: 
tags: [""]
cover: 
postAuthor: 
---

- [Intro](#intro)
- ...

## <a name="intro"></a>Intro

`;

fs.writeFileSync(path.join(location, "index.md"), template, "utf8");
