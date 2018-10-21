---
title: Complex command handler in JavaScript
subTitle: Comparison of using Promise and async/await
cover: /img/js.jpg
tags: ["JavaScript", "Promise", "async", "await", "Command"]
postAuthor: Mariusz Bąk (malef)
---
Recently I needed to carry out some complicated process in my Node.js side project. This process consisted of multiple steps and while some of them could be run in parallel some other required to be run in sequence. Here I will show the basic solution I came up with as it's quite short and demonstrates the way of using both `Promise`s and `async`/`await`.

I wanted to follow the Command design pattern (https://en.wikipedia.org/wiki/Command_pattern) where Command object representing a single operation is provided with all the data required for carrying it out. Later such Command object is provided to a dedicated CommandHandler that would actually perform the task at hand, possibly making use of some external dependencies.

In other words, I needed a piece of code that will execute some composite command that I would define upfront. This composite command would describe the whole process and would be composed of other composite commands (that would be handled recursively) or simple commands (that would have their dedicated command handlers provided as services). Let's go through the process of building such a service.

First, let's prepare some classes that will represent our commands. We need two classes for it: one for the atomic command that will be provided to a dedicated CommandHandler, and one composite command for composing multiple commands (either atomic or composite) into a set that can be handled either in parallel or in sequence. Let's call them SimpleCommand and CompositeCommand --- they will be quite basic.

For the sake of simplicity we won't require our atomic commands to describe any real operations --- we will provide them only with identifiers so that we can track if everything works fine:

```js
class SimpleCommand {
    constructor(id) {
        this.id = id;
    }
}
```

A composite command is also simple --- it needs to have a collection of nested commands and a flag that will indicate whether it's possible to handle these nested commands in parallel, or whether they have to be run in sequence:

```js
class CompositeCommand {
    constructor(children, allowParallel = false) {
        this.children = children;
        this.allowParallel = allowParallel;
    }
}
```

Since our simple commands are just for demo purposes we can handle them all with a single handler that will simply make each of them take some random time to complete. We will also include some `console.log` calls there that will show us when the handling of given command started and completed.

We will expect the `handle` method to return a `Promise` that will be resolved when command has completed. To makes things simple we don't care about any result (which also matches the default approach as when using Command design pattern we usually make an assumption that commands can be handled asynchronously, e.g. queued).

```js
class SimpleCommandHandler {
    handle(simpleCommand) {
        const delay = 100 + 100 * Math.round(20 * Math.random());
        console.log(`${simpleCommand.id} - started, will take ${delay} ms`);

        return new Promise(resolve => {
            setTimeout(
                () => {
                    console.log(`${simpleCommand.id} - completed`);
                    resolve();
                },
				delay
            );
        });
    }
}
```

Now let's define a sample composite command that we would like to handle so that we better understand its data structure. We will have five main stages marked with letters from A to E.

```js
const command = new CompositeCommand(
    [
        new CompositeCommand(
            [
                new SimpleCommand('A1'),
                new SimpleCommand('A2'),
                new SimpleCommand('A3')
            ],
            false
        ),
        new CompositeCommand(
            [
                new CompositeCommand(
                    [
                        new SimpleCommand('B1'),
                        new SimpleCommand('B2'),
                        new SimpleCommand('B3'),
                        new SimpleCommand('B4'),
                        new SimpleCommand('B5'),
                        new SimpleCommand('B6'),
                        new SimpleCommand('B7')
                    ],
                    false
                ),
                new CompositeCommand(
                    [
                        new SimpleCommand('C1'),
                        new SimpleCommand('C2'),
                        new CompositeCommand(
                            [
                                new SimpleCommand('C3a'),
                                new SimpleCommand('C3b'),
                                new SimpleCommand('C3c'),
                                new SimpleCommand('C3d'),
                                new SimpleCommand('C3e')
                            ],
                            true
                        ),
                        new SimpleCommand('C4'),
                        new SimpleCommand('C5'),
                        new SimpleCommand('C6'),
                    ],
                    false
                ),
                new CompositeCommand(
                    [
                        new SimpleCommand('D1'),
                        new SimpleCommand('D2')
                    ],
                    false
                )
            ],
            true
        ),
        new CompositeCommand(
            [
                new SimpleCommand('E1'),
                new SimpleCommand('E2'),
                new SimpleCommand('E3')
            ],
            false
        ),
    ],
    false
);
```

As you can see, stage A is to be executed first, then stages B, C, D in parallel; finally stage E should be handled. Each of these stages is composed from other commands which you can see on diagram below.

![](/img/complex-task.png)

Now we can start implementing `CompositeCommandHandler` that we will use to handle our `command`.  It will accept an instance of `SingleCommandHandler` as a constructor argument and will use it once it reaches `SimpleCommand` object.

```js
class CompositeCommandHandler {
    constructor(simpleCommandHandler) {
        this.simpleCommandHandler = simpleCommandHandler;
    }

    // More methods needed here.
}
```

We will now implement the main `handle` method that will accept either `SimpleCommand` or `CompositeCommand` object. If `SimpleCommand` is receiver it can simply use `SimpleCommandHandler` to handle it. Otherwise it will call one of the methods we will define later for handling commands in parallel or in sequence.

```js
class CompositeCommandHandler {
    // Methods defined previously.

    handle(command) {
        if (command instanceof SimpleCommand) {
            return this.simpleCommandHandler.handle(command);
        }

        if (command instanceof CompositeCommand) {
            if (command.allowParallel) {
                return this.handleInParallel(command.children);
	        } else {
	            return this.handleInSequence(command.children);
            }
        }
 
        throw new Error('Unknown class of command.');
    }

    handleInParallel(commands) {
        // To be defined.
    }

    handleInSequence(commands) {
        // To be defined.
    }
}
```

The return value of our `handle` method is a `Promise` that will be resolved once a single command (in case of `SimpleCommand` is provided) or multiple commands are completed. We just need to check which kind of command was provided and --- for `CompositeCommand` --- whether they should be executed in parallel or in sequence. It's easy to see that when we will be implementing `handleInParallel` and `handleInSequence` method we will be able to recursively call the `handle` method to execute each of commands provided to them, while these specialized methods will only be responsible for linking promises resulting from it in an appropriate way.

For each of the remaining methods we will compare and contrast two approaches --- we will implement them with `Promise`s first and then we will compare it with a solution based on `async`/`await` syntactic sugar. If you're not familiar with these please check related pages on MDN Web Docs: [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await), [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

Let's start with `handleInParallel` and `Promise`. Our method needs to return an instance of `Promise` that should be resolved once all provided commands are completed. To execute these commands in parallel we can call the `handle` method of `SimpleCommandHandler` for each of them. This way we'll obtain a set of promises. When all of them are resolved we can resolve the promise that was our return value. Luckily we can use `Promise.all` method to easily obtain the composite promise we need to return.

```js
class CompositeCommandHandler {
	// Methods defined previously.

    handleInParallel(commands) {
        const promises = commands.map(command => {
            return this.handle(command);
        });

        return Promise.all(promises);
    }

    handleInSequence(commands) {
        // To be defined.
    }
}
```

First, we map each element of `commands` to a `Promise` using the `handle` method recursively (as command can be either simple or composite and we've already implemented the logic of handling them there). Then this array of promisses is used as an argument for `Promise.all` which produces composite instance of `Promise` class that we need to return.

We need only one more method to make our `CompositeCommandHandler` work and it's `handleInSequence` Let's try to use `Promise` again.

What we need to do is to handle the first element of `commands` argument. Only when it is completed (e.g. promise resulting from handling it is resolved) we can handle the next element of `commands`. We should do so until all commands are handled and then we can use the last instance of `Promise` as our return value. Let's express this with code then --- for the sake of simplicity we can assume that `commands` will never be an empty array.

```js
class CompositeCommandHandler {
    // Methods defined previously.
	
    handleInSequence(commands) {
        let lastPromise = this.handle(commands[0]);
        for (const command of commands.slice(1)) {
            lastPromise = promise.then(() => this.handle(command));
        }
        
        return lastPromise;
    }
}
```

In this example we don't care about the result of handling each command and therefore we can simple chain promises using `then` callbacks that don't require any arguments. We produce first promise outside of the `for ... of` loop and then for each subsequent command we add a `then` callback that will handle the net element of `commands` and return resulting promise. This creates a new promise that we store in the `lastPromise` variable and use it in next loop. The final value of `lastPromise` is used as return value as it will be resolved when the last command is completed.

Since we've implemented all methods that were needed, let's now run our sample composite command.

```js
const handler = new CompositeCommandHandler(new SimpleCommandHandler());

console.log('Running commands.');
handler
    .handle(command)
    .then(
        () => {
            console.log('All commands completed.');
        },
        error => {
            console.log('Some commands failed');
            console.log(error);
        }
    );
```

Now let's run it in command line.

```bash
node ./complex-command-handler.js 
```

It will give different output each time as delays are random, but the order of commands execution will be correct.

```
Running commands.
A1 - started, will take 1100 ms
A1 - completed
A2 - started, will take 1300 ms
A2 - completed
A3 - started, will take 1100 ms
A3 - completed
B1 - started, will take 1900 ms
C1 - started, will take 300 ms
D1 - started, will take 1300 ms
C1 - completed
C2 - started, will take 2100 ms
D1 - completed
D2 - started, will take 2100 ms
B1 - completed
B2 - started, will take 1900 ms
C2 - completed
C3a - started, will take 1100 ms
C3b - started, will take 1200 ms
C3c - started, will take 1800 ms
C3d - started, will take 1300 ms
C3e - started, will take 1300 ms
D2 - completed
C3a - completed
C3b - completed
C3d - completed
C3e - completed
B2 - completed
B3 - started, will take 1800 ms
C3c - completed
C4 - started, will take 700 ms
C4 - completed
C5 - started, will take 400 ms
C5 - completed
C6 - started, will take 500 ms
B3 - completed
B4 - started, will take 2000 ms
C6 - completed
B4 - completed
B5 - started, will take 1500 ms
B5 - completed
B6 - started, will take 1300 ms
B6 - completed
B7 - started, will take 900 ms
B7 - completed
E1 - started, will take 1000 ms
E1 - completed
E2 - started, will take 1300 ms
E2 - completed
E3 - started, will take 300 ms
E3 - completed
All commands completed.
```

So our code already does what it was expected to do, but the implementation of `handleInSequence` method is not as readable as we would like. Let's check if using `async`/`await` syntactic sugar could improve this.

```js
async handleInSequence(commands) {
    for (const command of commands) {
        await this.handle(command);
    }
}
```

Wow, that's something! As you can see we only need to loop through provided commands and `await` for each `handle` call. This will pause the execution of this method until this nested promise is resolved. (Of course, it won't stop the execution of other callbacks that are in motion as this would beat the purpose of using an asynchronous tool like Node.js). Since we don't care about results returned we can end our method without explicitly returning any value --- defining this method as `async` will automatically wrap it's result value with `Promise` object that caller method expects to receive!

We can clearly see that this implementation is better and easier to analyze, so let's use it instead of the previous one.

Since it went so well for `handleInSequence`, let's now get back to implementing `handleInParallel` but this time using `async`/`await` approach. In this case it doesn't result in an easy to read the code, though.

First, we can wonder why we can't simply call the `handle` method for each command inside a `for ... of` loop and `await` for them to be resolved? The problem is that this will not yield the expected result --- note that we've already used this approach when we implemented `handleInSequence` method! The reason is that `await` would pause the execution of our method for every single `handle` call. This would prevent handling of subsequent commands for even getting started and instead of being executed in parallel they would be run in sequence.

Therefore we need to initiate handling of all commands first, and only then `await` for their results.    

```js
async handleInParallel(commands) {
    const promises = commands.map((command) => {
        return this.handle(command);
    });


    for (const promise of promises) {
        await promise;
    }
}
```

We are still calling our variable `promises` as this is what is really returned from `handle` and what is used by `async`/`await` syntax internally.

You will probably agree that in this case the solution with `Promise` was much more readable. Like we described above we are first mapping set of commands to set of promises by calling the `handle` method recursively and therefore they run in sequence. (We don't have a need for `map` callback function to be declared as `async` as it doesn't need to `await` for anything --- it receives `Promise` object from the `handle` method and it is expected to return one.

After mapping all commands to promises we need to wait for all of them to be resolved. Now it's time to use `await` in a `for ... of` loop --- there may be some commands that will take longer to be completed, but even if this loop will be temporarily blocked by one of them them the remaining commands will already be in progress.

The order of awaiting doesn't matter here --- if some command runs quicker and completes before we use `await` on it there will be no need to pause the execution of our method.

Finally, we don't need to return anything as `Promise` object is automatically created when we declare our method as `async`.

Now we're done - we have compared implementations using `Promise` and `async`/`await`. In our case handling commands in parallel was more readable when we used `Promise`, while for running in sequence  `async`/`await` solution seems more suitable.

This demonstrates that for writing succinct and readable code it's important to know both these techniques, to understand their inner workings so that we can use either of them depending on a task at hand.
