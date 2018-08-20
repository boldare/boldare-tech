---
title: PHP with MySQL 8
subTitle: How to avoid authentication method error
tags: ["PHP", "MySQL", "MySQL 8", "PDO", "PDO_MYSQL"]
cover: php.png
postAuthor: Przemek Pawlas
---

## Issue

By default MySQL `8.x` doesn't work with older versions of PHP.
You get an error:
```
The server requested authentication method unknown to the client: [caching_sha2_password]
```

## How to get around it?

The solutions are very simple - you can either upgrade PHP to `7.1.16`/`7.2.4` 
or if you want to stick to an older version force MySQL to use the old `5.x`
authentication method by default. All you have to do is add:

```
[mysqld]
default-authentication-plugin=mysql_native_password
``` 

to your MySQL config file, e.g. `/etc/mysql/conf.d/my.cnf` on the official
Docker image.
