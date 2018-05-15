---
title: Travis - problematic Python and Node
tags: ["Travis", "Python", "Node.js", "aws.cli", "nvm", ".nvrmc"]
cover: travis.png
postAuthor: Krzysztof Miemiec
---

We're speaking about project with NodeJS that also requires aws-cli (for refreshing CloudFront).
Builds were failing randomly because only the newest Python was available for Ubuntu Trusty,
`2.7.6`, which had some SSL-related stuff missing. Adding:
```
python:
    - 3.6
```
to `.travis.yml`, or any other version, resulted in... nothing.

## Solution

It was sufficient to set `language: python` in `.travis.yml` in our front-end app.
Then Travis correctly downloaded new Python.

## Old Node version

If we have e.g. `language: php` project, Node will be available in antediluvian 0.10 version,
perhaps. You should add:
```
before_install:
   - nvm install 7
```
to be happy about Node 7. Another option is adding `.nvmrc` file, in which you enter the
version string.
