# XSolve-tech blog 📰

👉 [Go to #xsolve-tech blog](https://tech.xsolve.software/)

## About #xsolve-tech
Development tips && tricks.
From devs. For devs.
Any helpful contributions are welcome.
3 lines, 3 paragraphs? Doesn't matter.

## How to contribute
There are two way to contribute

👉 Using CMS system

1. Go to [Tech blog Xsolve](https://tech.xsolve.software/admin/), sometimes you need to do it twice, It's caused by routing.
2. Log in by credentials, preffered github.
3. Go to `Blog Articles` or by clicking `Quick add` on the very top page.
4. Click `New Blog Article`.
5. Create article by providing all required data, also upload `cover`.
6. If you save article will be saved as a draft for review purposes.

7. INFO: To add images to article, you need upload it by `Media` page.
8. Then simple add it in article `![Describe file](/img/<your-file-name>)`


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
4. Put an image (post avatar) in the `static/img`, technology icon is preferred 🖼
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

5. Create a pull request to `master` branch to collaborate 🙌
