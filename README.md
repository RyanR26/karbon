<h2><a href="https://github.com/RyanR26/karbon">Karbon</a></h2>

A **unique** framework for creating user interfaces *(MIT Licensed)*

---
### Introduction

Karbon is a small, performant and user-friendly framework with a unique api and workflow, aimed at improving developer happiness and productivity and code readability. 

It is a complete system comprising of a model and view layer with a state management and subscriptions api. 

It is suitable for any web application. It can be used to build an entire single page application or simple/complex embedded apps/widgets within a traditional webpage.

It has zero-dependencies and does not require compilation or tooling. It can simply be inserted into your project via a single `<script>` tag.

### overview

 - Zero dependencies
 - No compilation
 - Small size (~8k gz) 
 - Single state app
 - VDOM
 - Subscriptions API
 
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

