---
title: How to quickly remove merged branches
subTitle: I've got dozens of merged branches in my bitbucket/github - how to remove them?
tags: ["git", "github", "bitbucket", "repository", "repo"]
cover: /img/git.png
postAuthor: Maciej Papież (@maciejpapiez)
---

## Issue
The number of merged, non-removed branches in our repository grew significantly.
The time to cleanup has come. How to make it quickly?

Doing a hundred "click-delete-and-confirm" manual sequences in Web UI is a bad idea,
let's find a better one.

## Solution

*Notice: pay attention to the name of your remote and change it if needed.*

1. Fetch all changes from the repository, cleaning up stale remote references
at the same time.
    ```
    git fetch -p
    ```

1. Checkout the branch you consider "if it's merged to this branch, it can be removed".
For us, it was `develop`. Update your local repository with most recent changes.
    ```
    git checkout develop
    git merge --ff-only origin/develop
    ```

1. Create a list of branches to be removed, filtering out all `release` branches, `master`
and `develop`. Dump it to a file.

    ```
    git branch -r --merged \
      | grep -v '\*\|master\|release\|develop' \
      | sed 's/origin\///' > merged_branches.txt
    ```

1. Check the candidates in `merged_branches.txt` if they're all safe to be removed.

1. Remove 'em!
    ```
    cat merged_branches.txt | xargs -n 1 git push --delete origin
    ```

That's all, hope that helps!
