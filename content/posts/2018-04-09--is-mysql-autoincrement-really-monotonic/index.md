---
title: Is MySQL's auto_increment really monotonic?
subTitle: Why you shouldn't rely on auto_increment feature in some cases.
tags: ["MySQL", "Kafka", "transaction", "AUTO_INCREMENT"]
cover: mysql.png
postAuthor: Maciek Papież
---

TL;DR: If a race condition between two MySQL transactions appears, the row
with `ID = N` may appear in the database *BEFORE* another row with `ID < N`.

## The task

Last week, I've been asked to build a microservice that will be responsible for
polling a table for data and pushing it to a Kafka topic. As the table contains
immutable events, it'd wise to use some kind of incremental loading.

## The tool

Confluent JDBC Connector ([see more](https://docs.confluent.io/current/connect/connect-jdbc/docs/index.html))
is a ready-made add-on exploiting Kafka Connect possiblities, it simplifies
building such a service to few lines of properties files and the data just flows... ;)

However, one needs to set the properties carefully, adjusting each of them
to the particular use case. One of them is the [mode](https://docs.confluent.io/current/connect/connect-jdbc/docs/source_config_options.html#mode),
which defines how the table should be queried for new rows. By default,
it adopts the `incrementing` strategy, which should be fine for most. At least,
the docs don't mention any kind of risks involved here.

Beware, it's a trap! (At least with MySQL that I had to use here.)

## The trap

We need three terminals here, let's call them A, B and C.

In the terminal A, we create an empty table `foo` (a very simple one -
  auto_increment primary key + created_at timestamp + some text column `value`):

```sql
create table foo (
  id int not null auto_increment,
  value char(30) not null,
  created_at timestamp default current_timestamp,
  primary key (id)
  );

Query OK, 0 rows affected (0,08 sec)

select * from foo;

Empty set (0,00 sec)
```

OK, done - created and empty. Let's use the second connection, terminal B, to start
a new transaction and insert a row `alfa` (I'll use
[the Alphabet](https://en.wikipedia.org/wiki/NATO_phonetic_alphabet) to maintain a readable order).

```sql
start transaction;
insert into foo (value) values ('alfa');
```

Since we're in the middle on an uncommited transaction (with defualt isolation level),
`alfa` in not yet visible for connection A.

```sql
select * from foo;

Empty set (0,00 sec)
```

Let's use the last connection, C, to make an insert of `bravo` row (with autocommit).

```sql
insert into foo (value) values ('bravo');

Query OK, 1 row affected (0,01 sec)
```

This should be visible from now on for all other connections, that's what terminal A says:

```sql
select * from foo;

+----+-------+---------------------+
| id | value | created_at          |
+----+-------+---------------------+
|  2 | bravo | 2018-04-09 13:13:51 |
+----+-------+---------------------+
1 row in set (0,00 sec)
```

It's there! As you can notice, it got assigned the `ID = 2`, because `ID = 1`
had been previously allocated for the `alfa` row. But hey, where is it?!

Uncommited! Hanging in the air!

Now we commit the connection B transation:

```sql
commit;

Query OK, 0 rows affected (0,02 sec)
```

...and run a query using connection A:

```sql
select * from foo;

+----+-------+---------------------+
| id | value | created_at          |
+----+-------+---------------------+
|  1 | alfa  | 2018-04-09 13:13:21 |
|  2 | bravo | 2018-04-09 13:13:51 |
+----+-------+---------------------+
2 rows in set (0,01 sec)
```

Now, both `alfa` and `bravo` rows are visible.

## The issue

During the between-commit phase, the row `bravo` with `ID = 2` was visible
for other connections while the row `alfa` (`ID = 1`) was still uncommited, thus
not visible for others.

This is why I claim that in edge cases, when a race condition between transaction
occurs, the `auto_increment` breaks its monotonic property. This is due to the fact
that the value is allocated on insert, not on commit.

For the microservice I'm developing, this is a serious threat. Consider that
we query the db during this short between-commit phase:
1. we retrieve a single row, `ID = 2`,
2. we process this batch of one row,
3. we store the `ID = 2` state for the next batch, telling it "you should
add `where ID > 2` to your query".

We've just ommited the `alfa` row!

## Solution ideas

Here's a list of proposals that might work (or might not):

1. Exploit the `created_at` column to improve the situation? I don't think it'll help,
but that's one of the modes that Kafka JDBC connector can operate in.

2. Wait X seconds until all transactions with `ID < N` are commited (e.g. [ innodb_lock_wait_timeout](https://dev.mysql.com/doc/refman/5.7/en/innodb-parameters.html#sysvar_innodb_lock_wait_timeout) + 5 seconds).

3. Dump whole table instead of incremental loading.

4. Mark the already pushed rows with a flag, query with `where flag = false`.

In case of any questions, comments, don't hestitate to [reach out](https://twitter.com/maciejpapiez).
