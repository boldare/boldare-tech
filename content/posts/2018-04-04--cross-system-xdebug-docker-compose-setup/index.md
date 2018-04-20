---
title: PHP - Cross-system XDebug Docker setup
subTitle: Docker Compose example
category: "docker"
cover: docker.png
postAuthor: Przemek Pawlas
---

## Issue

XDebug can be difficult to configure with Docker due to the requirement of
remote host IP (`remote_host` option) after installing XDebug and calling 
`echo "\nxdebug.remote_enable=1" >> /usr/local/etc/php/conf.d/xdebug.ini `
in your PHP image. So far I've encountered manual `.env` variable setups.
But it's possible to obtain it automatically.

## How would you do that?

You can use this Bash script to find the IP address more or less reliably on
most commonly used systems (Linux, Windows, Mac OS):

```bash
#!/usr/bin/env bash

case "$OSTYPE" in
    linux*) HOST_IP=$(ip -4 addr show docker0 | grep -Po 'inet \K[\d.]+') ;;
    darwin*) HOST_IP="docker.for.mac.host.internal" ;;
    msys*|cygwin*) HOST_IP="docker.for.win.host.internal" ;;
    *) echo "Unknown system: $OSTYPE. Set APP_XDEBUG_REMOTE_HOST_IP manually in .env." ;;
esac

if [[ $HOST_IP ]]; then
    export APP_XDEBUG_REMOTE_HOST_IP=$HOST_IP
else
    echo "Docker host IP not found. Set APP_XDEBUG_REMOTE_HOST_IP manually in .env."
fi

docker-compose "$@"
RESULT=$?
exit $RESULT
``` 

It reads the IP address based on `$OSTYPE`. Mac and Windows Docker versions provide
in-built definitions in their latest versions. Place the script in the same
folder as `docker-compose.yml` and run it with regular Docker Compose parameter(s).

Then in `docker-compose.yml` file you can add the following to your PHP service:

```
services:
  app:
    environment:
      XDEBUG_CONFIG: 'remote_host=${APP_XDEBUG_REMOTE_HOST_IP}'
      PHP_IDE_CONFIG: 'serverName=${APP_XDEBUG_SERVER_NAME}'
```

`PHP_IDE_CONFIG` environment variable is optional and requires
`APP_XDEBUG_SERVER_NAME=server.name` in your `.env` file, which allows
easier setup in [PHPStorm](https://confluence.jetbrains.com/display/PhpStorm/Debugging+PHP+CLI+scripts+with+PhpStorm#DebuggingPHPCLIscriptswithPhpStorm-2.StarttheScriptwithDebuggerOptions).

As you might have noticed in the script, you can still set the IP manually in `.env`
if it's not detected automatically.
