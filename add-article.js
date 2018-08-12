const mkdirp = require("mkdirp");
const path = require("path");
const readline = require("readline");
const fs = require("fs");

const POSTS_DIR = "./content/posts/";

const args = process.argv.reduce((obj, arg) => {
  const match = arg.match(/^--(.+)="?(.+)"?$/);
  if (match) {
    obj[match[1]] = match[2];
  }
  return obj;
}, {});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (argument, sample) =>
  new Promise(resolve => {
    rl.question(`Specify ${argument} (i.e. ${sample}): `, answer => {
      console.log(`You can also type the article name as an argument: --${argument}="${sample}"`);
      resolve(answer);
    });
  });

const getDate = () => {
  const date = new Date();
  let month = (date.getMonth() + 1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }
  let day = date.getDate().toString();
  if (day.length === 1) {
    day = "0" + day;
  }
  return date.getFullYear() + "-" + month + "-" + day;
};

const getSlug = name =>
  getDate() +
  "--" +
  name
    .trim()
    .toLowerCase()
    .replace(/[!@#$%^&*()_+\-=\\/ ]/g, "-");

const main = async () => {
  // Gather data
  let { name, subtitle, tags, author } = args;
  if (!name) {
    name = await question("name", "My new article");
    if (!name) {
      console.log("Name is required to correctly generate the article");
      process.exit(1);
    }
  }
  if (!subtitle) {
    subtitle = await question("subtitle", "A slightly more detailed topic description.");
  }
  if (!tags) {
    tags = await question("tags", "javascript, react, nodejs");
  }
  tags = `"${tags
    .split(",")
    .map(tag => tag.trim())
    .join(`", "`)}"`;

  if (!author) {
    author = await question("author", "John Doe");
  }

  rl.close();

  // Prepare location
  const slug = getSlug(name);
  const location = path.join(POSTS_DIR, slug);
  console.log("Location: " + location);

  // Create directory
  if (fs.existsSync(location)) {
    console.log("Article already exists");
    process.exit(2);
  }
  mkdirp.sync(location);

  // Prepare template
  const template = `\
---
title: ${name}
subTitle: ${subtitle}
tags: [${tags}]
cover: 
postAuthor: ${author}
---

- [Section 1](#section1)
- ...

## <a name="section1"></a>Section 1

`;

  // Write template
  fs.writeFileSync(path.join(location, "index.md"), template, "utf8");
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
