---
title: Quick import of MySQL database dump
subTitle: How to import 3 GB database dump in under 30 seconds
cover: /img/docker.png
tags:
  - Docker
  - Docker Compose
  - MySQL
postAuthor: Mariusz Bąk (malef)
---
Recently I've faced a nagging problem in a project I was working on - I was spending too much time on importing again and again database dump that we were using for development. It was either when I was switching between branches or when I needed to reproduce some problems that were reported and I didn't want my previous actions to have any effect.

Since database we were using was quite large (almost 3 GB) plus we needed to run some time-consuming migrations after it was imported it took often over 30 minutes for environment to be ready - and that's definitely too much time to lose. I had to figure out something that could make cleaning up my environment significantly faster.

We're using Docker Compose setup to run our project locally and for initial testing. The basic structure of `docker-compose.yml` file for any project based on PHP and MySQL would look along these lines:

```
version: '3'

services:
  # This is a container for PHP application.
  app:
    # ...
    container_name: foo_app
    depends_on:
      - db

  db:
    image: mysql:5.7
    # ...
    container_name: foo_db
    volumes:
      # Some configuration attached using a volume.
      - ./mysql/config.cnf:/etc/mysql/conf.d/config.cnf
```

We don't use named volume to keep MySQL data as we often rebuild the whole application and we don't have a need for retaining them. But when you look at the documentation of [official MySQL Docker image](https://hub.docker.com/_/mysql/) you'll notice that it's possible to mount a volume to `/var/lib/mysql` so that all databases are preserved.

It becomes apparent that you would be able to quickly replace whole database contents if you would be able to change the content of this volume. Since this would only require some files to be copied (without building indexes, checking foreign keys, locking etc. as it is when `.sql` files are imported via MySQL client) it would be much faster then ordinary import.

The plan is as follows:

1. Alter `docker-compose.yml` to mount a named data volume for MySQL service.
2. Import database dump you want to preserve using MySQL client.
3. Clone named data volume.
4. When database needs to be cleaned up use previously cloned named data volume and clone it back.

First following changes are required to our `docker-compose.yml` file:

```
version: '3'

services:
  # This is a container for PHP application.
  app:
    # ...
    container_name: foo_app
    depends_on:
      - db

  db:
    image: mysql:5.7
    # ...
    container_name: foo_db
    volumes:
      # Some configuration attached using a volume.
      - ./mysql/config.cnf:/etc/mysql/conf.d/config.cnf
      # We add this named volume for MySQL data.
      - foo_db_data:/var/lib/mysql

volumes:
  # We define this volume as external - we will be preparing it manually.
  foo_db_data:
    external: true
```

So let's create this named volume now:

```
docker volume create --name foo_db_data
```

We can run this new setup and import our database with \`mysql\` command:

```
# On host
docker-compose up -d
docker exec -it foo_app bash
# Inside foo_app container
mysql -uuser -p -hdb foo < foo.sql
```

Following this we will create another named volume that will contain a copy of our data. We can use a [simple Bash script](https://github.com/gdiepen/docker-convenience-scripts/blob/master/docker_clone_volume.sh) to copy all files from `foo_db_data volume` to `foo_db_data_clone` volume - visit [Guido Diepen's blog](https://www.guidodiepen.nl/2016/05/cloning-docker-data-volumes/) to find out more about how it works. Basically it uses Alpine image to which both source and destination volumes are mounted and that copies all files between them. The script also creates destination volume for us. We invoke it as follows:

```
# On host
./docker_clone_volume.sh foo_db_data foo_db_data_clone
```

Now we have our backup ready!

Let's say we did some work and now we want to clean up the database. We have to remove our `foo_db_data` volume so it can be cloned from `foo_db_data_clone`. In order to do it we also have to remove our `foo_db` container since named volumes cannot be removed if they are used by any container:

```
# On host
docker-compose stop
docker rm foo_db
docker volume rm foo_db_data
./docker_clone_volume.sh foo_db_data_clone foo_db_data
docker-compose up -d
```

And that's all we have to do! Using this solution I went down form over 30 minutes to about 30 seconds - so much more time for diving into code!
