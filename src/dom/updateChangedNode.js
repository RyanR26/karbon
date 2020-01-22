import { isDefined, isUndefined } from '../utils/utils';

let firstChildNode; 

export const updateChangedNode = (prop, value, node) => {

	switch (prop) {

	case 'class': {
		node.removeAttribute(prop);
		if(value.length > 0) {
			node.classList.add(...value.filter(Boolean)); //filter out aall empty strings
		}
		break;
	}
	case 'style': {
		const keys = Object.keys(value);
		let styles = '';
		for(let i = 0; i < keys.length; i++) {
			const key = keys[i];
			if(isDefined(value[key])) {
				styles += `${key}:${value[key]}; `;
			}
		}
		if (styles !== '') {	
			node.style.cssText = styles;
		} else {
			node.removeAttribute(prop);
		}
		break;
	}
	case 'text':
		if(node.hasChildNodes()) {
			firstChildNode = node.firstChild;
			if(isDefined(firstChildNode.data)) {
				firstChildNode.data = value;
			} else {
				//if there is no text node create one
				node.insertBefore(document.createTextNode(value), firstChildNode);
			}
		} 
		else {
			node.textContent = value;
		}
		break;
	case 'dataAttrs':
		// remove al data attrs
		for (let i = 0; i < node.attributes.length; i++) {
			if (/^data-/i.test(node.attributes[i].name)) {
				node.removeAttribute(node.attributes[i].name);
				i--;
			}
		}
		// add new data attrs
		for(let i = 0; i < value.length; i++) {
			const attrParts = value[i].split('=');
			node.setAttribute(attrParts[0], attrParts[1]);
		}
		break;
	default:
		if(prop[0] === 'o' && prop[1] === 'n') {
			node[prop] = null;
			node[prop] = event => value[0].apply(null, [...value.slice(1), event]);
		}
		else if(isUndefined(node[prop]) || node instanceof SVGElement) {
			node.setAttribute(prop, value);
		}
		else if(value === '') {
			node[prop] = false;
			node.removeAttribute(prop);
		}
		else {
			node[prop] = value;
		}
	}
};