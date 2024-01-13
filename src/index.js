import { karbon } from './core/index.js';

export const render = karbon.render.bind(karbon); 
export const hydrate = karbon.hydrate.bind(karbon);
export const toString = karbon.toString.bind(karbon);
export const toStringAsync = karbon.toStringAsync.bind(karbon);