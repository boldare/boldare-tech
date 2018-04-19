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

## Redux middleware and logger

Redux allow you to use a `middlewares`.
In this chapter we want to use a `logger` middleware.
Below in this tutorial we will also use a `redux-thunk` middleware to chandle async functions.

First of all we need to install our logger

```js
npm i redux-logger --save-dev
```

Now we need to import an `applyMiddleware` method

```js
import { createStore, applyMiddleware } from 'redux';
```

When applyMiddleware method is available, we can create a middleware

```js
const middleware = applyMiddleware(createLogger());
```

The last step we need to do to enjoy a logger is adding it as a second argument into `createStore` function.

```js
const store = createStore(reducer, middleware);
```

Done !
Your logger should looks like this

![Redux logger](./redux-logger.png)

Whole chapter code is here https://bitbucket.org/michalrozenek/redux-tutorial/src/f30faa2b6b883520c7e62646cf1857ff2ca13c7f/src/index.js?at=lesson-03&fileviewer=file-view-default

## Dividing Redux Store to separated files, Connect() method and a Provider.

In this chapter we are going to clean up our application.
We want to:
- move the Counter to the separated component
- move reducer and store to the separated files
- Use a Provider from `react-redux` to pass the store down to the components inside Provider.
- Use the `connect` method from `react-redux` to connect the Counter component with a store.

First of all we want to install dependencies

```
npm i react-redux --save-dev
```

Now we want to create a Counter component.

```js
import React, { Component } from 'react';

class Counter extends Component {

  render() {
    return (
      <div>
        <button onClick={() => this.props.increase()}>
          +
        </button>
  
        <button onClick={() => this.props.decrease()}>
        -
        </button>
        <h1>{`Result: ${this.props.counter}`}</h1>
      </div>
    )
  }
}

export default Counter;

```

To allow `Counter` component connect to store, we need to import `connect` method

```js
import { connect } from 'react-redux';
```

To give us possibility to read a state, we need to pass state to props, and use `connect` method.

```js
const mapStateToProps = state => {
  return {
    counter: state.counter,
  }
}

export default connect(mapStateToProps)(Counter);

```

Now we want to be able to use a `dispatch` method from `store` inside a Counter component, so we need to use `mapDispatchToProps`, and pass it as a second argument to `connect` method.

```js
const mapDispatchToProps = dispatch => {
  return {
    increase: () => {
      dispatch({
        type: 'INCREASE'
      })
    },

    decrease: () => {
      dispatch({
        type: 'DECREASE'
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
```

Thole Counter component looks like this

```js
import React, { Component } from 'react';
import { connect } from 'react-redux';

class Counter extends Component {

  render() {
    return (
      <div>
        <button onClick={() => this.props.increase()}>
          +
        </button>
  
        <button onClick={() => this.props.decrease()}>
        -
        </button>
        <h1>{`Result: ${this.props.counter}`}</h1>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    counter: state.counter,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    increase: () => {
      dispatch({
        type: 'INCREASE'
      })
    },

    decrease: () => {
      dispatch({
        type: 'DECREASE'
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
```

Ok, great!
We have a Counter component ready to use.
Now we need to create a `store` and `reducer` by copying from main index.js file.

We could create a `store` folder and `index.js` file inside of it.

```js
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import counterReducer from './reducer'

const middleware = applyMiddleware(createLogger());

export default createStore(counterReducer, middleware);
```
As you can see above, our `createStore` method need a reducer.
We could copy a reducer to new `reducer.js` file.

```js
const initialState = {
  counter: 0
}

const counterReducer = (state = initialState, action) => {
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

export default counterReducer;
```

We moved a `store` and `reducer` to the `store` folder and `Counter` component to the `Counter.js` file.

Now we want to import a `Provider` and wrap a <Counter /> into it.
Provider makes the Redux store available to the connect() calls in the component hierarchy below.
We passed a store as an argument for a Provider.

After changes our main index.js should looks like this:

```js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import Counter from './Counter';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Counter />
      </Provider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
```

Congratulations! We finished this chapter!
All files available here: https://bitbucket.org/michalrozenek/redux-tutorial/src/573143833d2671f342cb400a47daa2b18a816fb5/src?at=lesson-04