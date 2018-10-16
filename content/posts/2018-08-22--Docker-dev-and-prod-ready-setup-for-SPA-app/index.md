---
title: Docker dev & prod ready setup for SPA app
subTitle: Simple and light env setup to run SPA apps on various configurations with multi-stage build
tags: ["Docker", "docker-compose", "multi-stage", "build", "setup", "production", "SPA", "React", "Angular", "Vue"]
cover: docker.png
postAuthor: Marcin Łesek
---

- [Intro](#intro)
- [Prepare development environment](#dev-env)

## <a name="intro"></a>Intro

Nowadays, frontend applications have a lot of dependencies (everyone knows these funny memes about the size of `node_modules` directory) and ways to be successfully started, deployed and built, so it's not a piece of cake. I think everyone started with client apps where we're editing files live on production and probably everything was in one file, or if not, the whole files was available from client side. Fortunately, this times is gone, for most of us. :)

### Source vs. Artifact 

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


### Docker

<!-- TODO: Docker opis dzialania w pigulce, co to image, co to kontener + jakieś tricky foto -->

## <a name="dev-env"></a>Prepare development environment

We'll start with setting up our development environment based on **Docker** & **docker-compose** and `create-react-app` template. Firstly, we need to set up our basic app. Of course in bigger project, we'll had many more dependencies, services and complexity but the problem solution is almost the same. 

### Setup create-react-app boiler template

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

### Install base tools - Docker & docker-compose

Now the real fun begin. Next things that we'll need will be `Docker` and `docker-compose`. This tutorial was wrote using:

```bash
$ docker -v
Docker version 18.06.0-ce, build 0ffa825
$ docker-compose -v
docker-compose version 1.21.0, build 5920eb0
```

<!-- TODO: dodanie linków do Docker installation guide -->

If you don't have `Docker` or `docker-compose` on your local machine, check [Docker installation guide]() or [docker-compose installation guide](). Due to this versions, we could use **compose files** over `3.6` version. Now, in project root directory let's create `.docker` directory where we'll keep the whole Docker configuration.

```bash
$ mkdir .docker
$ cd .docker
```
### Dockerfile on development env? Oh please no...

<!-- TODO: porownanie Dockerfile i podpinania do gotowych obrazow -->

### Multiple compose files

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

For now, our Docker setup won't do anything useful for us. Also, if you'll try now to run it, compose will warn you about lack of image or build source. Let's add `.env` file!

<!-- TODO: dodac typ dla komentarza z .env file i wyzej dodac slowo "najpierw" do dodania .env file -->

```
# .env
COMPOSE_PROJECT_NAME=my-app-spa
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml
NODE_ENV=development
NODE_PORT=3000
```

Now we added few environment variables:

<!-- TODO: intuicyjne intuiv? -->

* `COMPOSE_PROJECT_NAME` - set our project name, it will be used as prefix for creating our services containers later, so it sohuld be short and intuiv,
* `COMPOSE_FILE` - this one is due to fact, that we want to use multiple compose files. We're specyfing what exactly files should be override and by which one. By this variable, we could setup it per application environment, but about this will be more later. Syntax looks like: `base:override1:oferride2` etc.,
* `NODE_ENV` will be used in our app to specify in which environment we're now, like development or production,
* `NODE_PORT` to easily change exposed port from our service container, now we set it as default `3000`,

Okey, now our **Docker** setup contains only base `docker-compose.yml` and `.env` files, so we need to add first override compose file for development environment: `docker-compose.dev.yml`

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

* `image:` - here we're specyfing that we want to use image with predefined `node.js` in `carbon` (`8.x`) version. Based on this image, Docker will build container for our application (`client`).
* `volumes:` - 
