---
title: Docker dev & prod ready setup for SPA app
subTitle: Simple and light env setup to run SPA apps on various configurations with Docker multi-stage build
tags: ["Docker", "docker-compose", "multi-stage", "build", "setup", "production", "SPA", "React", "Angular", "Vue"]
cover: /img/docker.png
postAuthor: Marcin Łesek (@marcinlesek)
---

- [Intro](#intro)
  - [Source vs. Artifact](#source-vs-artifact)
  - [Docker](#docker)
- [Prepare development environment](#dev-env)
  - [Setup create-react-app boiler template](#setup-cra)
  - [Install base tools - Docker & docker-compose](#install-tools)
  - [Dockerfile on development env? Oh please no...](#dockerfile-on-dev)
  - [Multiple compose files](#multi-compose-files)
  - [Default environment variables](#default-env-vars)
  - [Rocket launch!](#rocket-launch)
- [Production environment](#prod-env)

## <a name="intro"></a>Intro

Nowadays, frontend applications have a lot of dependencies (everyone knows these funny memes about the size of `node_modules` directory) and ways to be successfully started, deployed and built, so it's not a piece of cake. I think everyone started with client apps where we're editing files live on production and probably everything was in one file, or if not, the whole files was available from client side. Fortunately, this times is gone, for most of us. :)

### <a name="source-vs-artifact"></a>Source vs. Artifact

Due to optymalization, performance etc., actual standards are to parse, minify, combine our production code. In this article we will focus on setting up **development** and **production** environment for our app, but this setup will allow you to prepare more environments **in less than 3 minutes**. So what is the difference between `source` and `artifact` in SPA application? Take a look for this simple React app structure:

```
  .
  ├── /build/                     # The folder for compiled production ready output
  ├── /node_modules/              # 3rd-party libraries and utilities
  ├── /src/                       # The source code of the application
  │   ├── /components/            
  │   ├── /routes/                
  │   ├── /styles/                
  │   ├── /...                    
  │   └── ...                     
  ├── /...
  ├── package.json                # Project info like dependencies, authors, scripts etc.                           
  └── ...                          
```

The whole `/src` folder is our app heart - main code that we're developing. Running applications locally, on development environment by some `webpack-dev-server` or another serving tool, give us opportunity to have *hot module reload*, *live preview*, *fast run* etc. It's really good for development purpose and we'll use it!

### <a name="docker"></a>Docker

<!-- TODO: Docker opis dzialania w pigulce, co to image, co to kontener + jakieś tricky foto -->

## <a name="dev-env"></a>Prepare development environment

We'll start with setting up our development environment based on **Docker** & **docker-compose** and `create-react-app` template. Firstly, we need to set up our basic app. Of course in bigger project, we'll had many more dependencies, services and complexity but the problem solution is almost the same.

### <a name="setup-cra"></a>Setup create-react-app boiler template

Create our boilertemplate app:

```bash
$ npx create-react-app my-app
```

After that, we should see message like this:

```bash
Success! Created my-app at /path/to/my-app
```

Now lets run our hello world application:
```bash
$ cd my-app
$ yarn start
```

After few second we should see information regarding successfully compiled and served under `localhost:3000`, with all things we need to easily develop app. Great! 

### <a name="install-tools"></a>Install base tools - Docker & docker-compose

Now the real fun begin. Next things that we'll need will be `Docker` and `docker-compose`. This tutorial was wrote using:

```bash
$ docker -v
Docker version 18.06.0-ce, build 0ffa825
$ docker-compose -v
docker-compose version 1.21.0, build 5920eb0
```

If you don't have `Docker` or `docker-compose` on your local machine, check [Docker installation guide](https://docs.docker.com/install/) or [docker-compose installation guide](https://docs.docker.com/compose/install/). Due to this versions, we could use **compose files** over `3.6` version. Now, in project root directory let's create `.docker` directory where we'll keep the whole Docker configuration.

```bash
$ mkdir .docker
$ cd .docker
```
### <a name="dockerfile-on-dev"></a>Dockerfile on development env? Oh please no...

<!-- TODO: porownanie Dockerfile i podpinania do gotowych obrazow -->

### <a name="multi-compose-files"></a>Multiple compose files

Firstly, what is `multiple compose files`? By default, our docker-compose will read base `docker-compose.yml` file wher in convention, it should be our base cofniguration, which **will be shared over all environments**. After that, compose will append final docker-compose file with override file like `docker-compose.override.yml`. When some services are defined in both, they will be merged together. This feature is really cool and will help us to keep our setup clear and easy to maintain.

So, we'll create `docker-compose.yml` which will our base for all environments, also production etc. 

```yml
# docker-compose.yml
version: '3.6'

services:
  client:
    env_file:
      - .env
```

So, what happend here? Probably you know `docker-compose` schema and properties, but if not, I will explain a little:

* `version: 3.6` - Shows supported compose file version to `docker-compose`, so we'll know what syntax and features we could use.
* `services:` - main compose purpose, registring services to run them all neither using command for one by one like `docker run ...`
* `client:` - registring our first and main service - `client` which will be our React app,
* `env_file:` - pointing the `.env` file which should be used to get global environments values for our setup. This file helps us to storage variables for our app like exposed port, application environment, compose project name and much more, that we could easily change due to fact that they are in one place.

Okey, now our **Docker** setup contains only base `docker-compose.yml`, so we need to add first override compose file for development environment: `docker-compose.dev.yml`

```yml
# docker-compose.dev.yml
version: '3.6'

services:
  client:
    image: node:carbon
    volumes:
      - ..:/opt/app:cached
    ports:
      - "${NODE_PORT}:${NODE_PORT}"
    working_dir: /opt/app
    command: "/bin/sh -c 'yarn install --frozen-lockfile --production=false; yarn start'"
```

Describe a bit more this little magic:

* `image:` - here we're specyfing that we want to use image with predefined `node.js` in `carbon` (`8.x`) version. Based on this image, Docker will build container for our application (`client`),
* `volumes:` - this allow us to mount some data volume (we needn't to copy data, because we mount data from our host to container) as `HOST:CONTAINER` path. So we're mounting `..` from host (project root directory) to `/opt/app` in our container. We also add `:cached` for improve MacBook's performance. More details about it [here](https://docs.docker.com/docker-for-mac/osxfs-caching/#cached).
* `ports:` - here we're assign port from our host to port in our container (`HOST:CONTAINER`), so we could access our container from outside e.g. `5000:5000` maps port `5000` from host to port `5000` in container. We could also parametrise this values so we're getting them from env variables,
* `working_dir:` - specifies root app directory, where `docker-compose` will be working,
* `command:` - command which will run our container. We're passing to shell our commands (via `/bin/sh -c`), which firstly made installing dependencies with frozen lockfile (don't generate new `yarn.lockfile` and should download this same versions) and forced production flag to false (be sure, that `devDependencies` also will be installed).

### <a name="default-env-vars"></a>Default environment variables

For now, our Docker setup won't do anything useful for us. Also, if you'll try now to run it, compose will warn you about lack of image or build source. Firstly, let's add `.env` template file called `.env.dev.dist`!

```bash
# .env.dev.dist
COMPOSE_PROJECT_NAME=my-app-spa
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml
NODE_ENV=development
NODE_PORT=3000
```

We added few environment variables:

* `COMPOSE_PROJECT_NAME` - set our project name, it will be used as prefix for creating our services containers later, so it sohuld be short and intuitive,
* `COMPOSE_FILE` - this one is due to fact, that we want to use multiple compose files. We're specyfing what exactly files should be override and by which one. By this variable, we could setup it per application environment, but about this will be more later. Syntax looks like: `base:override1:oferride2` etc.,
* `NODE_ENV` will be used in our app to specify in which environment we're now, like development or production,
* `NODE_PORT` to easily change exposed port from our service container, now we set it as default `3000`,

Our template is ready, we need to copy it to *proper* `.env` file:

```bash
$ cp .env.dev.dist .env
```

### <a name="rocket-launch"></a>Rocket launch!

Yeah! Now with this `docker-compose.dev.yml` and `.env` file we're able to start our app in Docker::

```bash
$ docker-compose up -d
Starting my-app-spa_client_1 ... done
```

**Congratulations**! You **set up your development** environment.
