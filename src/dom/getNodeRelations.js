import { isUndefined, isDefined, isNull, isNotNull } from '../utils/utils';

export const getNodeRelations = (i, nodes, node, prevNode, nextNode, oldNode, prevOldNode, nextOldNode, currentNodeLevel, nodesToSkip) => {
	
	let previous;
	let current = 'child';
	let next;
	let action = null;
	let actionNext = null;
	let actionPrev = null;
	const previousNodeLevel = isUndefined(prevNode) ? -1 : isNotNull(prevNode.props) ? prevNode.level : prevOldNode.level;
	const nextNodeLevel = isUndefined(nextNode) ? undefined : isNotNull(nextNode.props) ? nextNode.level : nextOldNode.level;

	if (i > 0) {
		if(previousNodeLevel < currentNodeLevel) {
			previous = 'parent';
			current = 'child';
		} else if(previousNodeLevel > currentNodeLevel) {
			previous = 'child';
			current = 'parent';
		} else {
			previous = 'child';
			current = 'sibling';
		}

		if (isDefined(prevOldNode) && isNull(prevNode.props) && isNotNull(prevOldNode.props)) {
			actionPrev = 'removed';
		}
	}

	if (i < (nodes.length - nodesToSkip) - 1) {
		if (nextNodeLevel < currentNodeLevel) {
			next = 'parent';
		} else if (nextNodeLevel > currentNodeLevel) {
			next = 'child';
		} else {
			next = 'sibling';
		}

		if (isNull(nextNode.props)) {
			actionNext = 'removed';
		}
    
		if (isDefined(nextOldNode) && isNull(nextOldNode.props)) {
			actionNext = 'add';
		}
	}

	if (isNull(node.props)) {
		action = 'removed';
	}
	
	if (isDefined(oldNode) && isNull(oldNode.props)) {
		action = 'add';
	}

	return {
		previous,
		current,
		next,
		action,
		actionNext,
		actionPrev,
		nextNodeLevel
	};
};