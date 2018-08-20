---
title: Elasticsearch error - [script] unknown field [source], parser not found
subTitle: Caused by Elastica and how to fix Travis?
tags: ["Elasticsearch", "Elastica", "Elasticsearch script", "Travis", "PHP"]
cover: elasticsearch.png
postAuthor: Przemek Pawlas
---

## Issue

If you're using a script for Elasticsearch, e.g. a `Function Score` query,
you may spot `[script] unknown field [source], parser not found` error
after upgrading Elasticsearch to `5.6.0` or higher and the library for 
your back-end language. In my case `ruflin/elastica` that resulted in
mentioned error on Travis. 

## How did I solve it?

I didn't notice that Travis by default installs older Elasticsearch `5.2`
rather than the latest `5.x` because there was no other issue before.
In older versions there was no `source` field used now by default by the
upgraded Elastica library, there was `inline` that got deprecated.

Basically all that was needed was upgrading Elasticsearch on Travis, you can add e.g.:
```
before_install:
  - curl -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.6.10.deb && sudo dpkg -i --force-confnew elasticsearch-5.6.10.deb && sudo service elasticsearch restart
```
to `.travis.yml` for `5.6.10` version.
