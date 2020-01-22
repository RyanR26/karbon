import { karbon } from './app/app';

export let run; 
if(document.currentScript && "noModule" in document.currentScript) {
    run = karbon.run.bind(karbon);
} else {
    window.karbon = {};
    window.karbon.run = karbon.run.bind(karbon);
}
