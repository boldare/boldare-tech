---
title: MySQL decimal formatting
subTitle: Without FORMAT() usage
tags: ["PHP", "MySQL", "Doctrine", "DQL", "decimal"]
cover: mysql.png
postAuthor: Kamil Ścisłowski
---

I've bothered myself with writing a MySQL database query to a table with prices
for quite a long time. In that table a record for 10$ stores value of `1000`
because price can be for example 10.50$ (`1050`). In DQL I wanted to get the price,
so in `SELECT` I wrote `price / 100`. It resulted in `10.0000` (what?!)
instead of `10.00`. I couldn't use MySQL's `FORMAT()` because it was unavailable in DQL.
The CSV report, which received values directly, unfortunately showed `10.0000`.

## Solution

It turned out that instead of doing `/ 100` you can just do `* 0.01`.
