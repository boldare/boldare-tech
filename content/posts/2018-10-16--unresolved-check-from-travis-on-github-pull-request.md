---
title: Unresolved status check from Travis on Github Pull Request
subTitle: When your repository couldn't get information from Travis about build status check and you stuck on unresolved PR
tags: ["travis", "github", "ci", "continuous integration"]
cover: /img/travis.png
postAuthor: Marcin Łesek (@marcinlesek)
---

Few days ago I faced a problem when I pushed some code to my feature branch, created Pull Request and waited for standard Travis build check, that all tests, builds etc. passed. Casual day in developer's life. But not today!

## Issue

As **Github Services are being deprecated**, all our old integrations should be transferred to **Github Apps** - so old integrations *could work*, but they *don't have to*. Tricky, isn't it? This was also the case here: 

Github couldn't obtain the build status from Travis, even though **build passed successfully** in CI. We constantly get:

```
Waiting for status[...]
```

Restarting build, closing and reopening PR, creating new one with new commits didn't help at all. 

## Solution?

Obvious one! Not at all - **remove old integration**, because now **status checks pass only via Github Apps**!

Get into your repository **Settings** page, then choose **Branches** and edit protection rule for branch. There in 

```
Require status checks to pass before merging
```

you need to remove

```
continuous-integration/travis-ci
```

and choose one or both from:

![](../../static/img/travis-check.png)

Now your Pull Request should successfully obtain proper build status and you could get back to happy codin'!
