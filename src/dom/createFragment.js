import { createDomElement } from './createDomElement';

export const createFragment = vNodes => {

	const fragment = document.createDocumentFragment();
	const blockParentNodeStack = [fragment];
	let nodeLevel = 0;

	vNodes.map(node => {
    console.log(node.level)
		if (node.level === nodeLevel) {
			blockParentNodeStack.length = blockParentNodeStack.length - 1;
		}
		else if (node.level < nodeLevel) {
			blockParentNodeStack.length = blockParentNodeStack.length - (nodeLevel - node.level) - 1;
		}

		const element = createDomElement(node);
		const parentNode = blockParentNodeStack[blockParentNodeStack.length - 1];
		parentNode.appendChild(element);
		blockParentNodeStack[blockParentNodeStack.length] = element;
		nodeLevel = node.level;
	});

	return fragment;
};