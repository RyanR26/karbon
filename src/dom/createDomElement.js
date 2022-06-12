/* eslint-disable no-mixed-spaces-and-tabs */
import { isNotEmpty, isDefined, isObject } from '../utils/utils';

const documentCreateElement = (tag, isSVG) => isSVG ?
	document.createElementNS('http://www.w3.org/2000/svg', tag) :
	document.createElement(tag);

export const createDomElement = node => {

	const nodeProps = node.props;
	const elProps = Object.keys(nodeProps);
	const isSVG = node.lang === 'xml';
	const el = documentCreateElement(node.type, isSVG);

	for (let i = 0, len = elProps.length; i < len; i++) {

		const prop = elProps[i];
		const value = nodeProps[prop];

		if (isObject(value)) {
			if (isDefined(value.length)) { //Array
				if (prop === 'class') {
					const classList = value.filter(Boolean); //remove any empty strings
					if (classList.length > 0) {
						el.classList.add(...classList);
					}
				}
				else if (prop[0] === 'o' && prop[1] === 'n') {
					el[prop] = event => value[0].apply(null, [...value.slice(1), event]);
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