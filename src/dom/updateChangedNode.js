import { isEmpty, isNotEmpty, isString, isArray, isDefined, isUndefined } from '../utils/utils';

export const updateChangedNode = (prop, value, node) => {

	switch (prop) {

	case 'class': {
		node.removeAttribute(prop);
		if (isString(value) && isNotEmpty(value)) {
			node.className = value;
		}
		else if (isArray(value) && value.length > 0) {
			node.classList.add(...value.filter(Boolean)); //filter out all empty strings
		} 
		break;
	}
	case 'style': {
		const keys = Object.keys(value);
		let styles = '';
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			if (isDefined(value[key])) {
				styles += `${key}:${value[key]}; `;
			}
		}
		if (isNotEmpty(styles)) {	
			node.style.cssText = styles;
		} else {
			node.removeAttribute(prop);
		}
		break;
	}
	case 'text':
		if (node.hasChildNodes()) {
			let firstChildNode = node.firstChild;
			if (isDefined(firstChildNode.data)) {
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
	case 'data':
		// remove all data attrs
		for (let i = 0; i < node.attributes.length; i++) {
			if (/^data-/i.test(node.attributes[i].name)) {
				node.removeAttribute(node.attributes[i].name);
				i--;
			}
		}
		// add new data attrs
		for (let i = 0; i < value.length; i++) {
			const attrParts = value[i].split('=');
			node.setAttribute('data-' + attrParts[0], attrParts[1] || '');
		}
		break;
	default:
		if (prop[0] === 'o' && prop[1] === 'n') {
			if (isString(value)) {
				node[prop] = null;
			} else {
				node[prop] = event => value[0].apply(null, [...value.slice(1), event]);
			}
		}
		else if (isUndefined(node[prop]) || node instanceof SVGElement) {
			node.setAttribute(prop, value);
		}
		else if (isEmpty(value)) {
			node[prop] = false;
			node.removeAttribute(prop);
		}
		else {
			node[prop] = value;
		}
	}
};