---
title: Async/await in Express routing
subTitle: How to do it?
tags: ["JavaScript", "ES7", "Express", "async", "await"]
cover: /img/express.png
postAuthor: Dawid Rożenek
---

## Issue

The good practice is to use the latest standards of language. In JavaScript, standard ES7 saw the light of day in 2016. Using express, we may want to use async/await feature, but how?

## Express route

Let's create some express route f.ex user.

```js
const getUser = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id); // f.ex. mongoose findById method
};

router.get("/user/:id", getUser);
```
Above, we've defined simple route for `/user/:id"`.
Our async/await is not completed yet, because we are not catching any errors in `getUser`.
Let's add a try statement to our example.

```js
const getUser = async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id); // f.ex. mongoose findById method
    } catch(e) {
        // here goes out error handler
    }
}

router.get("/user/:id", getUser);
```

Now our `getUser` function will catch errors in the `catch` block, but it's not a perfect solution. I can't imagine using `async/await` with `try/catch` in whole application...
We can create some `middleware` to remove the `try/catch` statement.

```js
const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next);
};

const getUser = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id); // f.ex. mongoose findById method
}

router.get("/user/:id", asyncMiddleware(getUser));

```
Above, we've declared our asyncMiddleware. Inside this function, we are just resolving `getUser`.
If any of `await` statements returns us a rejected promise, then it will go into `catch` function.

## What are the advantages?

1. Of course, this is syntactic sugar. We can write asynchronous code which looks like synchronous.
2. In our asyncMiddleware, we can handle all errors from our routes callbacks async functions and move them to some error middleware with `next`.
