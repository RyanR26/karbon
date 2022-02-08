import { karbon } from './app/app';

export let render; 
export let toString;
export let toStringAsync;

if (typeof window === 'object') {
	if (document.currentScript && 'noModule' in document.currentScript) {
		render = karbon.render.bind(karbon);
		toString = karbon.toString.bind(karbon);
		toStringAsync = karbon.toStringAsync.bind(karbon);
	} 
	else {
		window.karbon = {};
		window.karbon.render = karbon.render.bind(karbon);
	}
} else {
	render = karbon.render.bind(karbon);
	toString = karbon.toString.bind(karbon);
	toStringAsync = karbon.toStringAsync.bind(karbon);
}


