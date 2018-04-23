---
title: Doctrine NEW DQL operator and objects
subTitle: Can we combine them?
category: "Doctrine"
cover: doctrine.png
postAuthor: Przemek Pawlas
---

## Issue

Sometimes we need to pull data from the database that doesn't translate to an entity.
For example, we want to obtain an entity and `SUM()` of one of its fields in one query.
Or three different `SUM()`s for statistics. To do that, the most objective-oriented solution
is passing the data to a Data Transfer Object.

## Does NEW keyword help?

The `NEW` keyword, available since Doctrine 2.4, unfortunately currently
allows only scalar values passed to DTO's constructor. Example:

```php
<?php

namespace Example\DTO;

class SomeEntityData
{
    // Property definitions
    
    public function __construct(string $field, ?int $count)
    {
        $this->field = $field;
        $this->count = $count;
    }
    
    // Getters
}
```

```php
<?php

namespace Example\Repository;

use Doctrine\ORM\EntityRepository;
use Example\DTO\SomeEntityData;

class SomeEntityRepository extends EntityRepository
{
    public function getSomeEntityWithData() : array
    {
        $queryBuilder = $this->createQueryBuilder('someEntity');

        $queryBuilder
            ->select(
                sprintf(
                    'NEW %s(someEntity.field, COUNT(anotherEntity))',
                    SomeEntityData::class
                )
            )
            ->innerJoin('someEntity.collection', 'anotherEntity')
            ->where('someEntity.value > 5')
            ->groupBy('someEntity.id');

        // EntityData[]
        return $queryBuilder->getQuery()->getResult();
    }
}
```

If we used `NEW %s(entity, COUNT(anotherEntity))` and accepted `Entity $entity`
in DTO constructor instead, we would get an error saying that `entity` is an unexpected string.

You can easily miss that in
[the official documentation](http://docs.doctrine-project.org/en/latest/reference/dql-doctrine-query-language.html#new-operator-syntax)
because the line that speaks about scalar values is below two code blocks.

## What can we do then?

There are multiple solutions. One of them, the simpliest in my opinion,
is adding aliases to selected fields and mapping query results to DTOs:

```php
<?php

namespace Example\Repository;

use Doctrine\ORM\EntityRepository;
use Example\DTO\SomeEntityData;

class SomeEntityRepository extends EntityRepository
{
    public function getSomeEntityWithData() : array
    {
        $queryBuilder = $this->createQueryBuilder('someEntity');

        $queryBuilder
            ->select('someEntity AS entityData, COUNT(anotherEntity) AS countData')
            ->innerJoin('someEntity.collection', 'anotherEntity')
            ->where('someEntity.value > 5')
            ->groupBy('someEntity.id');

        // EntityData[]
        return \array_map(
            function (array $result) {
                return new SomeEntityData($result['entityData'], $result['countData']);
            },
            $queryBuilder->getQuery()->getResult()
        );
    }
}
```

Another one is using Doctrine's `ResultSetMapping`, which basically does
the same thing in a more defined and strict way.
