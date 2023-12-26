
<h2><a href="https://github.com/RyanR26/karbon">Karbon</a></h2>

A **unique** framework for creating user interfaces *(MIT Licensed)*

---
### Introduction

Karbon is a small, performant and user-friendly framework with a unique api and workflow, aimed at improving the developer experience and productivity. 

It is a complete system comprising of a model and view layer with a state management and subscriptions api. 

It is suitable for any web application. It can be used to build an entire single page application or simple/complex embedded apps/widgets within a traditional webpage.

It has zero-dependencies and does not require compilation or tooling. It can simply be inserted into your project via a single `<script>` tag.

### Key points

 - Zero dependencies
 - No compilation
 - Small size (~7k gz) 
 - VDOM
 - Single state
 - Unique message system
 - Effects API
 - Subscriptions API

 
 ### API overview
 ---
 
 Basic example
```js
import { run } from karbon;
 
const app = {
  container: document.getElementById('app'),
  state: {
    name: 'Ryan'
  },
  view: state => (e, x) => {
    e('div', { text: 'Hello' + state.name }); x('div') 			
  }
};

render(app)
```

Karbon is a single state application framework. This means that the whole app is driven from one global state (think Redux, Elm etc.). All components are stateless and are only responsible for generating virtual nodes which get converted into DOM elements by the app runtime.

On the most basic level an app is an object which must consist of at least the following properties:

 1. **container** - this is the app root element.
 2. **state** - the app initial state.
 3. **view** - this will create the vdom used to create html

The app object will then get passed to the run function which will mount our app to the dom.

If Karbon is being used on a traditional webpage we can easily implement multiple apps on a single page if needed. Simply invoke the render function passing in the app object.

```js
import { run } from karbon;
 
const app1 = {...};
const app2 = {...};
const app3 = {...};

render(app1)
render(app2)
render(app3)
```

**Container**

------------



The container value must be a valid DOM node. This will be the root of the app. If the container element contains any server rendered html it will be cleared out automatically before the app view is rendered to the document. In the case of multi apps on a single page - the container must be a unique node for each app.

**State**

------------


This value is the initial application state. This must be an object. This value will get passed, as application level props, to the view function upon rendering. 

**View**

------------


The view function creates virtual nodes (vnode) which make up the virtual dom tree. Each vnode will eventually generate an actually dom node which the browser can display. 

*vnode API*

The view function takes ***state*** and ***actions*** as arguments and must return a (render) function. The returned (render) function is invoked by the runtime and has 3 parameters injected upon invocation.

 1. vnode open function 
 2. vnode close function 
 3. component creator function 

The vnode api is unique to Karbon. It does not support JSX or any other vnode creator eg. hyperHTML etc. *(See api design docs for more details)*

*Above vnode functions shortened to **e, x, c** in the examples below but could be named anything the user desires.*

- vnode signature:

```js
// signature
open(tagName:string, props:obj, flags:obj);
close(tagName)

// example of common el props

e('div', { 
  text: 'text',
  id: 'id',
  class: ['class1', 'class2'],
  dataAttrs: ['name=Harry', 'surname=Jones'],
  style: {color: 'red', 'font-weight': 'bold'}
  onclick: [actions.example.click, 'arg1', 'arg2'] // always an array with the function at position 1 and any arguments listed after.
}, 
  { key: 'uniqueId' }
);
x('div')

```


```js
// ES5
var app = {
  ...
  view: function(state, actions) {
    return function(e, x, c) {
      e('div', { text: 'text'}); 
        e('span', { text: 'nested elemenet' }); x('span')
      x('div') 
    }
  } 
};

// We can shorten this nicely using the ES6 syntax
const app = {
  ...
  view: (state, actions) => (e, x, c) => {
    e('div', { text: 'text'}); 
      e('span', { text: 'nested elemenet' }); x('span')
    x('div') 
  }
};

```
These functions allow you to write vnodes as you would normal html elements (ie. with an opening and closing tag) using standard functions. 

Because of this we are not constrained or conformed to lengthly work arounds when writing conditional logic. We can use standard JS logic right along side vnode factory functions.

- conditional logic:

```js

const app = {
  ...
  state: {
    loggedIn: false
    userName: ''
  },
  view: (state, actions) => (e, x, c) => {
    if(state.loggedIn) {
      e('div', { text: 'hello' + state.userName}); x('div') 
    } else {
      e('div', { text: 'Please login'}); 
        e('button', { text: 'login'}); x('button')
      x('div') 
    }
  }
}; 

```

Components

In order to group vnodes and create independent, reusable pieces we need to make use of components.

*Defining a component* 

Components function differently in Karbon as opposed to other frameworks like React, Mithril etc. Components are stateless functions that always follow the same signature. Components **cannot** use ES6 classes and do not have lifecycle methods or hooks. They are at the core very simple by design. Their principle purposes being to take props and create vnodes in order render html and to invoke actions in response to user events. 

Example of basic component:
```js

const Title = (props, actions, index) => (e, x, c) => {
  e('div', { class: ['component']})
    e('h1', { text: props.title }); x('h1')
  x('div')
};
```

A component takes ***props***, ***actions*** and ***index*** as arguments and returns a (render) function. (Exactly the same is the app view function with the exception of the extra index parameter).

*Rendering a component*

```js

// component constructor signature
/*
 The function takes 2 arguments. Both are objects. The 1st is a named  component definition. The name can be the same as the comp name.
 The 2nd is an object with the below available properties and methods
 */

c({ Comp } , {
  props: { },
  mergStateToProps: state => ({ }),
  propTypes: types => ({ }),
  index: 1,
  subscribe: [ ],
  actions: { } || [ ],
});

```
In use:

```js

import { Title } from components;

const app = {
  ...
  view: (state, actions) => (e, x, c) => {
    c({ Title }, { 
      props: { title: state.title }
    });
  }
};

```
***Props*** is an object of read only values passed into the component from when the component is invoked. This is a familiar pattern used in most UI frameworks nowadays. This pattern can get a little messy when trying to pass props from a parent component to a deeply nested child component when the props are not needed by the intermediate components. This has become known as prop-drilling and other frameworks have ways of dealing with this usually via a context provider function. Karbon deals with this by providing the ***mergeStateToProps*** method which can be passed to the component factory function and invoked by the runtime. It must return an object which will get merged in with the defined component props object. This allows us to pull properties from the state at any nested level.

mergeStateToProps example:

```js

const DeeplyNestedComp = (props, actions, index) => (e, x, c) => {
  e('div', { 
    class: ['container'],
    style: props.theme
  });
    e('div', { text: props.name }); x('div')
  x('div')
}

const Parent (props, actions, index) => (e, x, c) => {
  e('div')
    c({ DeeplyNestedComp }, {
      props: { name: 'John' },
      mergeStateToProps: state  =>  ({ theme: state.themes.light })
    });
  x('div')
}

```
Karbon has a built in method ***propTypes*** which can be used to check if the type is correct and log a warning otherwise. This is only available in the dev build ie. the non-minified version.

propTypes example:

```js

c({ DeeplyNestedComp }, {
  props: { name: 'John' },
  mergeStateToProps: state  => ({ 
    theme: state.themes.light
  }),
  propTypes: types => ({
    name: types.string,
    theme: types.object
  })}
});

```

If a component is used inside a loop then the ***index*** value should be passed to the component constructor. This is used by the app runtime to track instances.

```js

const Item = (props, actions, index) => (e, x, c) => {
  e('div', { text: props.name }); x('div')
}

const app = {
  ...
  state: {
    list: [
      { name: 'John'},
      { name: 'Harry'},
      { name: 'Elvis'}
    ]
  },
  view: (state, actions) => (e, x, c) => {
    state.list.map((item, index) => {
      c({ Item }, { 
        props: {name: item.name},
        index
      });
    });
  }
};

```

As components are usually only used to display a specific portion of that entire app state we can optimize performance by telling our component to only update in response to specific state key changes. The ***subscribe*** property lets us list which top level state keys the component should listen to changes on.

*It is important to note that this is simply for optimization purposes and that if you do not want the component display to ever change the props it recieves should be static. This is because in certain cases the runtime will determine that the component needs to be rerendered to keep the UI in sync even though it is not subscribed to the current changing key.*

subscibe example:

```js
const app = {
  ...
  state: {
    list: [
      { name: 'John'},
      { name: 'Harry'},
      { name: 'Elvis'}
    ]
  },
  view: (state, actions) => (e, x, c) => {
    state.list.map((item, index) => {
      c({ Item }, { 
        props: {name: item.name},
        index,
        subscribe: [ 'list' ]
      });
    });
  }
};

```
The subscribe array is only for top level keys. All children of that property are included.

For example: if a component subscribes to the *themes* key, when any change occurs on a child of themes the component will check for updates. In contrast, if a changed was made to the *list* property the component would skip the update check.

```js

// components listen to changes on all children of top level keys only.
// [ 'listen' ] or [ ' themes' ] or multiple keys [ 'listen', 'themes'] but
// you cannot subscribe to a sub key eg. [ 'themes.light.color ']

state: {
  list: [ ],  // here
  themes: { // here
    light: {
      color: 'black',
      background: 'white'
    },
    dark: {
      color: 'white',
      background: 'black'
    }
  }
}

```

**Actions**

------------

So far we have seen how to render html via our view function, vnodes and components but in order for app to do anything we need to be able to run something in response to user events.  This brings us to the *actions*.

Actions can be global (available in every component) or can be injected on a component level.

Global actions example:
```js
import { run } from karbon;

const global = dispatch => ({
  changeName(name) {
    console.log('change name to' + name)
  }
});
 
const app = {
  container: document.getElementById('app'),
  state: {
    name: 'Ryan'
  },
  actions: [
    { global }
  ]
  view: (state, actions) => (e, x) => {
    e('div', { 
      text: 'Hello' + state.name, 
      onclick: [ actions.global.changeName, 'John' ] 
   });
   x('div')
  }
};

run(app)
```

Actions are functions that receive the *dispatch*  object (more about this later) as an argument and return methods that can be invoked from within our view. They are initialised by adding them to the actions array on the app object. Actions are created once and then cached.

As you can see in the above example the view function now takes actions as a 2nd parameter and we can access actions via the relevant actions namespace inside our view. Multiple actions can be added via the array syntax. These can now be accessed in any component within our app.

Local actions example:
```js
import { run } from karbon;

// actions
const local = dispatch => ({
  changeName(name) {
    console.log('change name to' + name)
  }
});

// component
const Hello = (props, actions) => (e, x) => {
  e('div', { 
    text: 'Hello' + state.name, 
    onclick: [ actions.local.changeName, 'John' ] 
  });
  x('div')
};
 
const app = {
  container: document.getElementById('app'),
  state: {
    name: 'Ryan'
  },
  actions: [ ],
  view: (state, actions) => (e, x) => {
    c({ Hello }, {
      props: { name: state.name },
      actions: { local },
      subscribe: [ 'name' ]
    });
  }
};

run(app)
```

In this example we have removed the global actions and instead passed them to the Hello component via the actions property. These are local actions ie. they are only available within the component you pass them into. We can pass mulitple actions by using an array:

```js
c({ Hello }, {
      props: { name: state.name },
      actions: [ { local }, { local2 }, { local3 } ],
      subscribe: [ 'name' ]
    });
```


At this point our action is not actully doing anything but logging the value passed into it. What makes Karbon substantially different form other frameworks is the way it handles all app updates. The dispatch methods are at the core of how the framework handles change flow and gives the developer complete control of how to sequence updates without resorting to spaghetti code, nested callbacks, middleware etc.  The 3 chainable dispatch methods are:

```js
dispatch
  .stamp()
  .msgs()
  .done()
```
Karbon uses a messaging system to propogate any state changes, run effects or add control logic to a dispatch sequence. These messages are passed in sequence to the framework runtime where they are handled automatically.

Lets start with a simple example of updating the state. 

```js
import { run } from karbon;

// actions
const local = dispatch => ({
  changeName: name => 
    dispatch.msgs(['state', {
        path: ['name'],
        value: name
    }])
});

// component
const Hello = (props, actions) => (e, x) => {
  e('div', { 
    text: 'Hello' + state.name, 
    onclick: [ actions.local.changeName, 'John' ] 
  });
  x('div')
};
 
const app = {
  container: document.getElementById('app'),
  state: {
    name: 'Ryan'
  },
  actions: [ ],
  view: (state, actions) => (e, x) => {
    c({ Hello }, {
      props: { name: state.name },
      actions: { local },
      subscribe: ['name']
    });
  }
};

run(app)
```


**Messages**

------------

In order to update our app state we need to dispatch a message via the `dispatch.msgs()` method.

A message is a plain array which contains, at minimum, the message type and a payload.

There are 5 message types:
- ***state***
- ***effec*t**
- ***control***
- ***pipe***
- ***cancel***

*State*

In this case our message type is *state* and our payload is an object which contains the path to the state property we want to update and the new value we want to display.

```js
dispatch.msgs(
  ['state', {
    path: ['name'],
    value: name
}])
```
This differs from other frameworks where you always need to return a new state object (which can get tricky with deeply nested values). Karbon takes the state message and uses it to update the state in a predictable manner. We never update/mutate the state ourselves but rather always send a message and let the runtime take care of it automaticallty. This system allows us to update deeply nested state values witjh ease.

```js

state: {
  themes: {
    light: {
      color: 'black',
      background: 'white',
      border: '1px solid black'
    }
  }
}

dispatch.msgs(
  ['state', {
    path: ['themes', 'light', 'color'],
    value: 'red'
}])
```
Multiple values can be updated using arrays:

```js
dispatch.msgs(
  ['state', {
    path: ['themes', 'light', ['color', 'background']],
    value: ['red', 'black']
}])
```
