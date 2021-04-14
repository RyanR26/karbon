/* eslint-disable no-mixed-spaces-and-tabs */
import { isNotEmpty, isDefined, isObject } from '../utils/utils';

let nodeProps;
let elProps;
let el;
let isSVG = false;

export const createDomElement = node => {
    
	nodeProps = node.props;
	elProps = Object.keys(nodeProps);
 
	if (node.lang !== 'xml') {
		isSVG = false;
		el = document.createElement(node.type);
	} else {
		isSVG = true;
		el = document.createElementNS('http://www.w3.org/2000/svg', node.type);
	}
	
	for (let i = 0, len = elProps.length; i < len; i++) {

		const prop = elProps[i];
		const value = nodeProps[prop];

		if (isObject(value)) {
			if (isDefined(value.length)) { //Array
			  if (prop[0] === 'o' && prop[1] === 'n') {
					el[prop] = event => value[0].apply(null, [...value.slice(1), event]);
				}
				else if (prop === 'class') {
					const classList = value.filter(Boolean); //remove any empty strings
					if (classList.length > 0) {
						el.classList.add(...classList);
					}
				}
				else { // add data attrs
					for (let i = 0; i < value.length; i++) {
						const attrParts = value[i].split('=');
						el.setAttribute('data-' + attrParts[0], attrParts[1] || '');
					}
				}
			} else { // Object
				const keys = Object.keys(value);
				for (let i = 0; i < keys.length; i++) {
					const key = keys[i];
					el[prop][key] = value[key];
				}
			}
		} 
		else if (prop === 'text') {
			el.textContent = value;
		}
		else if (prop === 'class') {
			if (isNotEmpty(value)) el.className = value;
		}
		else if (isDefined(el[prop]) && !isSVG) {
			el[prop] = value;
		} 
		else {
			el.setAttribute(prop, value);
		}
	}
	return el;
};