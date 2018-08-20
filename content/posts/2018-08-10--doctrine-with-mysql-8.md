---
title: Doctrine with MySQL 8
subTitle: How to use them together
tags: ["PHP", "MySQL", "Doctrine", "Doctrine DBAL"]
cover: /img/doctrine.png
postAuthor: Przemek Pawlas
---

## Issue

By default `MySQL 8.x` doesn't work with `doctrine/dbal` <= `2.8.x`.
You get an error:
```
The server requested authentication method unknown to the client: [caching_sha2_password]
```

## How to get around it?

The solution is very simple - you can force MySQL to use the old `5.x`
authentication method by default. All you have to do is add:

```
[mysqld]
default-authentication-plugin=mysql_native_password
```

to your MySQL config file, e.g. `/etc/mysql/conf.d/my.cnf` on the official
Docker image.
