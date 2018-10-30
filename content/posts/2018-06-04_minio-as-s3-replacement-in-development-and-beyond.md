---
title: Minio as S3 replacement in development and beyond
subTitle: How to configure self-hosted S3 file storage with Docker and setup Symfony Flysystem
tags: ["s3", "aws", "amazon", "symfony", "docker", "flysystem"]
cover: /img/minio.png
postAuthor: Dawid Śpiechowicz
---

- [What is Minio](#what-is-minio)
- [How to spin it up](#how-to-spin-it-up)
- [Minio Browser](#minio-browser)
- [Integration with PHP SDK](#integration-with-php-sdk)
- [Integration with Flysystem](#integration-with-flysystem)

## <a name="what-is-minio"></a>What is Minio?

[Minio](https://minio.io) is open source AWS S3 compatible file storage.
You can run it on environment you fully control.

This blog post assumes you use Minio for development / testing purposes as AWS S3 replacement.

If you are interested in production usage then you should take a look at [distributed Minio](https://docs.minio.io/docs/distributed-minio-quickstart-guide) mode which contains data loss protection features.

## <a name="how-to-spin-it-up"></a>How to spin it up?

Fastest way is to use Docker.
Single instance can be created using following `docker-compose.yml` container definition:
```yaml
minio:
    image: minio/minio:RELEASE.2018-05-16T23-35-33Z
    volumes:
        # adjust volume to your needs
        - "../.data/minio:/data"
    ports:
        - ${MINIO_PORT}:9000
    environment:
        MINIO_ACCESS_KEY: ${S3_KEY}
        MINIO_SECRET_KEY: ${S3_SECRET}
    command: server /data
    restart: unless-stopped
```

The tricky part is bucket configuration.
There is `mc` CLI client to configure Minio.
In order to automate everything you can configure buckets using another docker container:
```yaml
createbuckets:
    image: minio/mc:RELEASE.2018-04-28T00-08-20Z
    depends_on:
        - minio
    entrypoint: >
        /bin/sh -c "
        /usr/bin/mc config host add minio http://minio:9000 ${S3_KEY} ${S3_SECRET};

        /usr/bin/mc mb minio/bucket_with_no_public_access;
        /usr/bin/mc policy none minio/bucket_with_no_public_access;

        /usr/bin/mc mb minio/bucket_with_public_download;
        /usr/bin/mc policy download minio/bucket_with_public_download;

        exit 0;
        "
```
It will exit as soon as job is done. It's perfectly OK ;-)

## <a name="minio-browser"></a>Minio Browser

Assuming your `MINIO_PORT` defined in `.env` is `9001` you can just go to `http://localhost:9001` using browser.
Enter `S3_KEY` and `S3_SECRET` values and you should see Minio dashboard.

## <a name="integration-with-php-sdk"></a>Integration with PHP SDK

Ensure `aws/aws-sdk-php` is present in your `composer.json`.

```php
$client = new \Aws\S3\S3Client([
    'version' => '2006-03-01',
    'region' => 'eu-central-1',
    'endpoint' => 'http://minio:9000',
    'use_path_style_endpoint' => true, // this is super important
    'credentials' => [
        'key' => 's3key',
        'secret' => 's3secret',
    ]
]);
```

## <a name="integration-with-flysystem"></a>Integration with Flysystem on Symfony

Ensure you have following dependencies in your `composer.json`:
- `oneup/flysystem-bundle`
- `league/flysystem-aws-s3-v3`

Define S3Client service in `config/services.yaml`:
```yaml
parameters:
    app.s3_client.version: '%env(S3_VERSION)%'
    app.s3_client.region: '%env(S3_REGION)%'
    app.s3_client.endpoint: 'http://minio:9000'
    app.s3_client.key: '%env(S3_KEY)%'
    app.s3_client.secret: '%env(S3_SECRET)%'

app.s3_client:
    class: Aws\S3\S3Client
        arguments:
            -
                version: '%app.s3_client.version%'
                region: '%app.s3_client.region%'
                endpoint: '%app.s3_client.endpoint%'
                use_path_style_endpoint: true
                credentials:
                    key: '%app.s3_client.key%'
                    secret: '%app.s3_client.secret%'
```

Define filesystems in `config/packages/oneup_flysystem.yaml`:
```yaml
oneup_flysystem:
    adapters:
        bucket_with_no_public_access:
            awss3v3:
                client: app.s3_client
                bucket: bucket_with_no_public_access
                options:
                    visibility: private
                    ACL: private
        bucket_with_public_download:
            awss3v3:
                client: app.s3_client
                bucket: bucket_with_public_download
                options:
                    visibility: public
                    ACL: public
    filesystems:
        bucket_with_no_public_access:
            adapter: bucket_with_no_public_access
            alias: bucket_with_no_public_access
        bucket_with_public_download:
            adapter: bucket_with_public_download
            alias: bucket_with_public_download
```

From now on you can just inject filesystems using newly created `oneup_flysystem.bucket_with_no_public_access_filesystem` and `oneup_flysystem.bucket_with_public_download_filesystem` services.
