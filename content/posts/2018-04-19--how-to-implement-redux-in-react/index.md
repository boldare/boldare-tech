---
title: How to implement Redux in React
subTitle: How to do it?
category: "Redux"
cover: redux.png
postAuthor: Michał Rożenek
---

# What is Redux?

Everything you change in your application, included data and UI changes is contained in an object called `state`, so
basicaly Redux is a store which contains application state.

## State 

`State` is read only.
When you want to modify the state,
you need to `dispatch` an `action`.

## Action

`Action` is a plain javascript object, described in the simple way, includes an informations about changes in the application.
Action minimum requirement is a `TYPE` property. Actions could receive some arguments. Actions in redux have to be pure!

## Reducer

The state mutations in your app need to be pure functions.
Reducer receive initial state, previos state and action, then state don't modify the previous state, just return a new object.

## Store

`Store` has a current application `state` object and let you `dispatch actions`.
During creating a store, you need to provide a `reducer` as a parameter to let the store know what and how you want to update.

### Store methods:
`getState` - return current state
`dispatch` - let you dispatch actions
`subscribe` - let you subscribe on store changes and register a callback

Store shouldn't be mutated!
You should always return a new object.
To avoild an Object mutations, you can use those methods:

- spread operator:
```js
return {
  ...state,
  counter: state.counter + 1
};
```

- Object assign:

```js
return Object.assign({}, state, {
	counter: state.counter++
}
```

# Let's do it in practice!

## React installation

For this article I used `createReactApp` starter.

If you want to use it, please go to https://github.com/facebook/create-react-app,
then following `createReactApp` manual, you should be able to use those commands:

```
npx create-react-app my-app
cd my-app
npm start
```

Congratulations! Your React application is running.

Now we want to install Redux

## Redux installation

```
npm i react-redux redux --save-dev.
```

Redux is installed, so we can try to create our Redux store.
Please open react app folder in your IDE, go to `src`.
For this course I removed unnecessary files.
You can also remove all from `src` besides index.js.

## Create our first Redux Store

Go to ```index.js```
First of all, we need to import `createStore` method

```js
import { createStore } from 'redux';
```

To create a store, you need to call `createStore` method, passing reducer as an argument

```js
const store = createStore(reducer);
```

Now we need a `reducer`.
In this case it is a simple counter reducer

```js
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INCREASE':
      return {
        ...state,
        counter: state.counter + 1
      };
    case 'DECREASE':
      return {
        ...state,
        counter: state.counter - 1
      };
    default:
      return state;
  }
}
```

As you can see, our reducer is using `initialState`.
We can define it

```js
const initialState = {
  counter: 0
}
```

Ok, we have almost all.
No we want to dispatch an action to change our application state

```js
store.dispatch({
  type: 'INCREASE'
})
store.dispatch({
  type: 'INCREASE'
})
store.dispatch({
  type: 'DECREASE'
})
```

I dispatched 3 actions with two different TYPES. As I wrote above, TYPE is required in redux action.

Last step we want to do is watch our changes.
To do it, we need to use subscribe method.

```js
store.subscribe(() => {
  console.log('Store changed: ', store.getState().counter)
})
```

Great! Now we have a working redux store.
All index.js file should looks like this

```js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { createStore } from 'redux';

const initialState = {
  counter: 0
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INCREASE':
      return {
        ...state,
        counter: state.counter + 1
      };
    case 'DECREASE':
      return {
        ...state,
        counter: state.counter - 1
      };
    default:
      return state;
  }
}

const store = createStore(reducer);

store.subscribe(() => {
  console.log('Store changed: ', store.getState().counter)
})

store.dispatch({
  type: 'INCREASE'
})
store.dispatch({
  type: 'INCREASE'
})
store.dispatch({
  type: 'DECREASE'
})

class App extends Component {

  render() {
    return (
      <h1>Redux in React</h1>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
```

## Modify the store from UI

To achieve store modification from the UI, we need to prepare a buttons in `App` component

```js
class App extends Component {

  render() {
    return (
      <div>
        <button onClick={() => increase()}>
          +
        </button>
  
        <button onClick={() => decrease()}>
        -
        </button>
        <h1>{`Result: ${store.getState().counter}`}</h1>
      </div>
    )
  }
}
```

In out app component we are using increase and decrease functions. Let's prepare those functions.

```js
const increase = () => {
  store.dispatch({
    type: 'INCREASE'
  })
}

const decrease = () => {
  store.dispatch({
    type: 'DECREASE'
  })
}
```

Functions above are dispatching an actions.

Last thing we need to do is a re-render an `<App />` component when state changed.
In this case we can use `subscribe` method on `store` object, then as a callback use
```
ReactDOM.render
```

```js
const rootRender = () => {
  ReactDOM.render(<App />, document.getElementById('root'));
}

store.subscribe(() => {
  rootRender();
})

rootRender();
```

Now you can modify your application state from UI.
Whole code is here https://bitbucket.org/michalrozenek/redux-tutorial/src/4cf6bd490fe5c3f75e6d3fb0d3f0639e369b6d16/src/index.js?at=lesson-02&fileviewer=file-view-default