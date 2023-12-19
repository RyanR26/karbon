import { isUndefined, isDefined, isNotNull } from '../utils/utils';

const emptyVNodeStatic = {
	type: null,
	lang: null,
	props: null,
	level: undefined,
	key: false,
	keyedAction: null,
	keyedChildren: null,
	staticChildren: false,
	parentComponent: null,
	parentComponentIndex: null,
	subscribesTo: null,
	dom: null,
	block: false,
	blockProps: undefined,
	blockChild: false
};

const recycledVNodeStatic = Object.assign({}, emptyVNodeStatic, { keyedAction: 'recycled' });

function syncLists(oldList, newList, keyedNodes, keyedNodesPrev, blockCache) {
      
	let newListSynced = [];
	let oldListSynced = [];
	let newHead = 0;
	let oldHead = 0;
	let newTail = newList.length - 1;
	let oldTail = oldList.length - 1;

	function triggerInsertionOfKeyedOrUnkeyedNode(prevNode, node) {
		if (isDefined(node) && keyedNodesPrev[node.key]) {
			node.keyedAction = 'insertOld';
			newListSynced[newListSynced.length] = node;
			oldListSynced[oldListSynced.length] = keyedNodesPrev[node.key];
			const [oldKeyedChildrenSynced, newKeyedChildrenSynced] = syncLists(keyedNodesPrev[node.key].keyedChildren, node.keyedChildren, keyedNodes, keyedNodesPrev);
			oldListSynced = oldListSynced.concat(oldKeyedChildrenSynced);
			newListSynced = newListSynced.concat(newKeyedChildrenSynced);
			oldHead = oldHead + (isDefined(prevNode) && isNotNull(prevNode.keyedChildren) ? prevNode.keyedChildren.length + 1 : 0);
			newHead = newHead + node.keyedChildren.length + 1;
			delete keyedNodesPrev[node.key];
		}
		else {
			node.keyedAction = 'insertNew';
			newListSynced[newListSynced.length] = node;
			oldListSynced[oldListSynced.length] = emptyVNodeStatic;
			newHead++;
		}
	}

	function triggerSkipOverOldRecycledKeyedNode(prevNode) {
		newListSynced[newListSynced.length] = recycledVNodeStatic;
		oldListSynced[oldListSynced.length] = prevNode;
		oldHead = oldHead + prevNode.keyedChildren.length + 1;
	}

	function triggerRemovalOfKeyedNode(prevNode) {
		newListSynced[newListSynced.length] = emptyVNodeStatic;
		oldListSynced[oldListSynced.length] = prevNode; 
		oldHead = oldHead + prevNode.keyedChildren.length + 1;
		removeKeyFromBlockCache(prevNode);
	}

	function triggerPropsCompareOfTwoEqualKeyedNodes(prevNode, node) {
		node.keyedAction = 'updateAttrs';
		newListSynced[newListSynced.length] = node;
		oldListSynced[oldListSynced.length] = prevNode; 
		newHead++;
		oldHead++;
		delete keyedNodesPrev[node.key];
	}

	function removeKeyFromBlockCache(prevNode) {
		if (prevNode.block) {
			blockCache[prevNode.key] = false;
		} 
		else if (prevNode.blockChild) {
			prevNode.keyedChildren.map(vNode => {
				if (vNode.block) {
					blockCache[vNode.key] = false;
				}
			});
		}
	}

	function syncNode(prevNode, node) {

		if (isUndefined(prevNode) || (isDefined(node) && prevNode.level < node.level)) {

			if (node.key) {
				triggerInsertionOfKeyedOrUnkeyedNode(prevNode, node);
			} else {
				oldListSynced[oldListSynced.length] = emptyVNodeStatic;
				newListSynced[newListSynced.length] = node;
				newHead++;
			}			
		}

		else if (isUndefined(node) || (isDefined(prevNode) && prevNode.level > node.level)) {

			if (prevNode.key && !keyedNodesPrev[prevNode.key] && keyedNodes[prevNode.key]) {
				triggerSkipOverOldRecycledKeyedNode(prevNode);
			} else {
				newListSynced[newListSynced.length] = emptyVNodeStatic;
				oldListSynced[oldListSynced.length] = prevNode;
				oldHead++;
				removeKeyFromBlockCache(prevNode);
			}
		}

		else {

			if (prevNode.key) {
				if (prevNode.key === node.key) {
					triggerPropsCompareOfTwoEqualKeyedNodes(prevNode, node);
				} 
				else if (keyedNodes[prevNode.key]) {
					triggerInsertionOfKeyedOrUnkeyedNode(prevNode, node);
				} else {
					triggerRemovalOfKeyedNode(prevNode, node);
				}
			}
			else if (node.key) {
				// remove old unkeyed node
				newListSynced[newListSynced.length] = emptyVNodeStatic;
				oldListSynced[oldListSynced.length] = prevNode;  
				oldHead++;
			} 
			else {
				newListSynced[newListSynced.length] = node;
				oldListSynced[oldListSynced.length] = prevNode;  
				newHead++;
				oldHead++;
			}				
		}	
	}

	while (newHead <= newTail || oldHead <= oldTail) {
		syncNode(oldList[oldHead], newList[newHead]);
	}

	return [oldListSynced, newListSynced];

}

// Algorithm for syncing prev vNode array with new vNode array
// Each node in the vNode array needs to be compared to a node on the same level in the old array
export const syncVNodes = (domNodes, domNodesPrev, keyedNodes, keyedNodesPrev, blockCache) => {
	
	let syncedLists;

	if (domNodes.length === 0) {
		for (let i=0; i<domNodesPrev.length; i++) {
			domNodes[i] = emptyVNodeStatic;  
		}
	} 
	else {
		syncedLists = syncLists(domNodesPrev, domNodes, keyedNodes, keyedNodesPrev, blockCache);
	}

	return {
		domNodes : syncedLists[1],
		domNodesPrev : syncedLists[0]
	};
};
