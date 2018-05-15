---
title: Git not detecting renames
subTitle: Quick workarounds
tags: ["Git", "Git renamed", "git status", "git commit"]
cover: git.png
postAuthor: Przemek Pawlas
---

## Issue

In big projects there are lots of files.
If we rename one or more, `git status` tends to show misleading `new file`
and `deleted` labels rather than `renamed`. That's because git uses heuristic
algorithms for matching renamed pairs - sometimes faster and less accurate
for optimization reasons.

## Make sure renames are indeed not detected

First of all, run `git commit --dry-run -a`.
It will show you different results than `git status`, which is optimized for quicker results.
Another algorithm for matching pairs is used.

Similarly, deeper matching is used for detecting renames on git hosting services like GitHub.
So the problem may not in fact be a problem when it comes to required informativity.

## Change rename limits

If the mentioned command doesn't recognize renames, you can increase the
maximum number of pairs that are checked.
To do that, run `git config --global diff.renameLimit [integer]`.
`[integer]` needs to be <= 32767 if you're using git < 2.16.
`merge.renameLimit`, which applies to merge actions, can also be changed.

## Split renames into more commits

If above tips don't help, you can also try splitting a big commit into smaller ones.
It will mean less work for algorithms in one go.
