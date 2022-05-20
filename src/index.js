import { karbon } from './core/core';
import { isBrowser } from './utils/utils';

export let render; 
export let hydrate;
export let toString;
export let toStringAsync;

if (isBrowser()) {
	if (document.currentScript && 'noModule' in document.currentScript) {
		render = karbon.render.bind(karbon);
		hydrate = karbon.hydrate.bind(karbon);
		toString = karbon.toString.bind(karbon);
		toStringAsync = karbon.toStringAsync.bind(karbon);
	} 
	else {
		window.karbon = {};
		window.karbon.render = karbon.render.bind(karbon);
		window.karbon.hydrate = karbon.hydrate.bind(karbon);
		window.karbon.toString = karbon.toString.bind(karbon);
		window.karbon.toStringAsync = karbon.toStringAsync.bind(karbon);
	}
} else {
	render = karbon.render.bind(karbon);
	hydrate = karbon.hydrate.bind(karbon);
	toString = karbon.toString.bind(karbon);
	toStringAsync = karbon.toStringAsync.bind(karbon);
}


