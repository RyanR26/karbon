
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
 - Small size (~8k gz) 
 - Unique API
 - Single state app
 - VDOM
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
	 	e('div', { text: 'Hello' + state.name })
	 	x('div') 			
	}
};

run(app)
```

Karbon is a single state application framework. This means that the whole app is driven from one global state (think Redux, Elm etc.). All components are stateless and are only responsible for generating virtual nodes which get converted into DOM elements by the app runtime.

On the most basic level an app is an object which must consist of at least the following properties:

 1. **container** - this is the app root element.
 2. **state** - the app initial state.
 3. **view** - this will create the vdom used to create html

The app object will then get passed to the run function which will mount our app to the dom.

If Karbon is being used on a traditional webpage we can easily implement multiple apps on a single page if needed. Simply pass multiple app objects to the run function.

```js
import { run } from karbon;
 
const app1 = {...};
const app2 = {...};
const app3 = {...};

run(app1, app2, app3)
```

**Container**

The container value must be a valid DOM node. This will be the root of the app. If the container element contains any server rendered html it will be cleared out automatically before the app view is rendered to the document. In the case of multi apps on a single page - the container must be a unique node for each app.

**State**

This value is the initial application state. This must be an object. This value will get passed, as application level props, to the view function upon rendering. 

**View**

The view function creates virtual nodes (vnode) which make up the virtual dom tree. Each vnode will eventually generate an actually dom node which the browser can display. 

*vnode API*

The view function takes ***state*** and ***actions*** as arguments and must return a (render) function. The returned (render) function is invoked by the runtime and has 3 parameters injected upon invocation.

 1. vnode open function 
 2. vnode close function 
 3. component creator function 

The vnode creation api is unique to Karbon. It does not support JSX or any other vnode creator eg. hyperHTML etc. *(See api design docs for more details)*

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
	dataAttrs: ['data-name=Harry','data-surname=Jones'],
	style: {color: 'red', 'font-weight': 'bold'}
	onclick: [actions.example.click, 'arg1', 'arg2']
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
			e('div', { text: 'Please login'}); x('div') 
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
Props are read only values passed into the component from when the component is invoked. This is a familiar pattern used in most UI frameworks nowadays. This pattern can get a little messy when trying to pass props from a parent component to a deeply nested child component when the props are not needed by the intermediate components. This has become known as prop-drilling and other frameworks have ways of dealing with this usually via a context provider function. Karbon deals with this by providing a ***mergeStateToProps*** method which can be passed to the component factory function and invoked by the runtime.

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
	c({ DeeplyNestedComp }, {
		props: { name: 'John' },
		mergeStateToProps: state  =>  ({ theme: state.themes.light }),
	})
}


```

If a component is used inside a loop then the index value should be passed to the component constructor. This is used by the app runtime to track instances.

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
	}
	view: (state, actions) => (e, x, c) => {
			
			state.list.map((item, index) => {
				c({ Item }, { 
					props: {name: item.name},
					index
				});
			});
 			
		}
	} 
};

```


