import { karbon } from './app/app';

export let run; 
export let toString;
export let toStringAsync;

if (typeof window === 'object') {
	if (document.currentScript && 'noModule' in document.currentScript) {
		run = karbon.run.bind(karbon);
		toString = karbon.toString.bind(karbon);
    toStringAsync = karbon.toStringAsync.bind(karbon);
	} 
	else {
		window.karbon = {};
		window.karbon.run = karbon.run.bind(karbon);
	}
} else {
	run = karbon.run.bind(karbon);
	toString = karbon.toString.bind(karbon);
  toStringAsync = karbon.toStringAsync.bind(karbon);
}


