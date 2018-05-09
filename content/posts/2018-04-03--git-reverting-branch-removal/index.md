---
title: Reverting branch removal in Git
category: "git"
tags: ["Git", "git reflog"]
cover: git.png
postAuthor: Mateusz Rosiek
---

If we remove a branch with changes from the whole day coincidentally, we can use:

`git reflog` - to find the hash of the latest cgommit on deleted branch.
That's also why proper commit messages naming, rather than e.g. "fix", is useful.

`git checkout -b [branch_name] [hash]` - to switch to the found commit hash on a new branch.
