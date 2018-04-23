---
title: Git - Przywrócenie usuniętego brancha
subTitle: Git - Przywrócenie usuniętego brancha
category: "git"
cover: git.png
postAuthor: Łukasz Mitusiński
---

Jak niechcący usuniemy brancha, ze zmianami z całego dnia:

**git reflog** -> szukamy hasha ostatniego commita na branchu, który chcemy przywrócić (tutaj przydaje się nazywanie commitów po ludzku, a nie "fix")

**git checkout -b <branch_name> <hash>**

usuniety branch został przywrócony.
