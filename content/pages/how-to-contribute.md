---
title: How to contribute
---

## About #boldare-tech
Development tips && tricks.
From devs. For devs.
Any helpful contributions are welcome.
3 lines, 3 paragraphs? Doesn't matter.

## How to contribute
There are two ways to contribute:

👉 Using CMS system

1. Go to [admin panel](https://tech.xsolve.software/admin/)
or click `+` icon in sidebar (skip points 2. and 3. in that case).
2. Go to `Blog Articles` or click `Quick add` at the very top of the page.
3. Click `New Blog Article`.
4. Create article by providing all required data, also upload `cover`.
5. If you save article, it will be sent as PR for review to blog's GH repository.

INFO: To add images to article, you need to upload them on `Media` page.
Then simply add it in article `![Describe file](/img/<your-file-name>)`


👉 Cloning repository

The articles' file structure:

```
xsolve-tech/

└── content/
    └── posts/
        └── YYYY-MM-DD--the-post-title.md
└── static/
    └── img/
        └── file-used-in-post.(img|png)
```

1. Clone this repository or add/edit a file
[directly on GitHub](https://github.com/xsolve-pl/xsolve-tech/new/master/content/posts)
2. Use `yarn add-article` command to create a new structure for the post 📂
3. Write an article in [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
syntax and save it in created file by script, English language is preferred ✍️
4. Put an image (post avatar) in `static/img`, technology icon is preferred 🖼
5. Update the following required tags at the very top of the article 👆

```
---
title: Post title - describe the solution concisely, but informatively
subTitle: Post subtitle - optional additional description
tags: ["technology", "keyword", "some key variable"]
cover: post-avatar.jpg - technology icon is preferred
postAuthor: Your Name
---
```

6. Create a pull request to `master` branch to collaborate 🙌
