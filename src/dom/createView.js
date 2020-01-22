import { isUndefined, isDefined, isNull, isNotNull, isNotNullandIsDef } from '../utils/utils';
import { virtualDom } from '../vdom/vDomState';
import { createDomElement } from './createDomElement';
import { shouldRenderNode } from './shouldRenderNode';
import { updateChangedNode } from './updateChangedNode';
import { syncVNodes } from '../vdom/syncVNodes';
import { getNodeRelations } from './getNodeRelations';

const childNodeIndexes = [];

export const createView = (appContainer, domNodes, domNodesPrev, changedStateKeys, keyedNodes, keyedNodesPrev) => {

	let nodeReplacedFlag = false;
	let nodeRemovedFlag = false;
	let handleUntrackedHtmlNodesFlag = false;
	let forceUpdateStartLevel = null;
	const keyedNodeRecycleBin = {};

	//rest array for reuse
	childNodeIndexes.length = 0;

	if (virtualDom.isInitialized() && virtualDom.requiresSync()) {	
		const syncedVNodes = syncVNodes(domNodes.slice(0), domNodesPrev, keyedNodes, keyedNodesPrev);
		domNodes = syncedVNodes.domNodes;
		domNodesPrev = syncedVNodes.domNodesPrev;
	}

	const getDomIndex = currentLevel => childNodeIndexes[currentLevel];

	const updateChildNodeFauxDomIndexes = (nodeRelation, currentLevel) => {
		switch(nodeRelation.current) {
		case 'parent':
			childNodeIndexes[currentLevel]++;
			break;
		case 'child':
			childNodeIndexes[currentLevel] = 0;
			break;
		case 'sibling':
			childNodeIndexes[currentLevel]++;
			break;
		}
	};

	const replaceNode = (parentNode, newNode, oldNode, currentLevel) => {
		if(isDefined(oldNode) && isNotNull(oldNode)) {
			parentNode.replaceChild(newNode, oldNode);
		} else {
			parentNode.appendChild(newNode);	
		}
		nodeReplacedFlag = true;
		forceUpdateStartLevel = currentLevel;
	};

	const swapElements = (parent, el1, el2) => {
		const n2 = el2.nextSibling;
		if (n2 === el1) {
			parent.insertBefore(el1, el2);
		} else {
			parent.insertBefore(el2, el1);
		}
		if(isDefined(el1)) {
			parent.insertBefore(el1, n2);
		}
	};

	const updateProperties = (props, values, currentNode) => {
		for(let i = 0; i < props.length; i++) {
			updateChangedNode(
				props[i], 
				values[i], 
				currentNode
			);
		}
	};

	const patch = (prevNode, node, nR, parentNodeEl, currentLevel) => {

		renderNode = shouldRenderNode(prevNode, node, nR, nodeReplacedFlag, nodeRemovedFlag, currentLevel, forceUpdateStartLevel);

		if(currentLevel <= forceUpdateStartLevel) {
			nodeReplacedFlag = false;
			nodeRemovedFlag = false;
		}
		
		if(renderNode.should) {

			if(handleUntrackedHtmlNodesFlag) {
				// Increase the child node index by 1 as all untracked nodes created by using
				// innerHTML prop will be wrapped in a sandbox div to prevent breaking the 
				// vdom -> real dom comparison
				childNodeIndexes[currentLevel]++;
			}

			switch(renderNode.action) {

			case 'updateNode' : {
				$_currentNode = prevNode.dom;
				node.dom = $_currentNode;
				updateProperties(renderNode.props, renderNode.values, $_currentNode);
				domOpsCount ++;
				break;
			}

			case 'newNode' : {
				$_currentNode = createDomElement(node);
				node.dom = $_currentNode;
				parentNodeEl.appendChild($_currentNode);
				domOpsCount ++;
				break;
			}

			case 'replaceNode' : {
				$_currentNode = createDomElement(node);
				node.dom = $_currentNode;
				replaceNode(parentNodeEl, $_currentNode, prevNode.dom, currentLevel);
				domOpsCount ++;
				break;
			}

			case 'removeNode' : {
				let nodeToRemove = prevNode.dom;
				if(isNotNullandIsDef(nodeToRemove)) {
					parentNodeEl.removeChild(nodeToRemove);
					nodeToRemove = null;
					childNodeIndexes[currentLevel]--;
					nodeRemovedFlag = true;
					forceUpdateStartLevel = currentLevel;
					domOpsCount ++;
				}
				break;
			}

			case 'recyclable': {
				if(isUndefined(keyedNodeRecycleBin[prevNode.key])) {
					keyedNodeRecycleBin[prevNode.key] = true;
				} else {
					childNodeIndexes[currentLevel]--;
				}
				break;
			}

			case 'handleKeyedUpdate': {
				const currentDomNode = get_$currentNode();
				const recycledDomNode = prevNode.dom;
				const keyedAction = renderNode.keyedAction;
				$_currentNode = recycledDomNode;

				if(keyedAction === 'insertNew') {	
					$_currentNode = createDomElement(node);
					parentNodeEl.insertBefore($_currentNode, currentDomNode);
					domOpsCount ++;
				}
				else if(keyedAction === 'insertOld') {
					parentNodeEl.insertBefore(recycledDomNode, currentDomNode);
					keyedNodeRecycleBin[node.key] = true;
					domOpsCount ++;
					if(renderNode.props.length > 0) {
						updateProperties(renderNode.props, renderNode.values, $_currentNode);
					}
				}
				else if(keyedAction === 'swap' || (isDefined(currentDomNode) && !currentDomNode.isEqualNode(recycledDomNode))) {	
					swapElements(parentNodeEl, currentDomNode, recycledDomNode);
					keyedNodeRecycleBin[node.key] = true;
					domOpsCount ++;
					if(renderNode.props.length > 0) {
						updateProperties(renderNode.props, renderNode.values, $_currentNode);
					}
				} 
				else if(keyedAction === 'updateAttrs' && renderNode.props.length > 0) {
					updateProperties(renderNode.props, renderNode.values, $_currentNode);
					domOpsCount ++;
				}

				node.dom = $_currentNode;
				break;
			}
			}

			if(renderNode.untrackedHtmlNodes && nR.next === 'child' && nR.actionNext !== 'removed') {
				handleUntrackedHtmlNodesFlag = true;
			} else {
				handleUntrackedHtmlNodesFlag = false;
			}
		} 
		else {
			node.dom = prevNode.dom;
			$_currentNode = node.dom;
			if(renderNode === 'recycled') {
				childNodeIndexes[currentLevel]--;
			}
		}
	};

	const $_parentNodeStack = [];
	let $_parentNode;
	let $_currentNode;
	let $_prevParentCache;
	let node;
	let prevNode;
	let currentLevel;
	let nR;
	let nodeIsListeningToStateKey = false;
	let renderNode;
	let prevLevel = 0;
	let nodesToSkip = 0;
	let domOpsCount = 0;
	let domOpsComplete = false;
	
	const get_$currentNode = () =>	$_parentNode.children[getDomIndex(currentLevel)];

	for(let i = 0, len = domNodes.length; i < len; i++) {

		if(domOpsComplete || virtualDom.getDomUpdatesLimit() === domOpsCount) {
			domOpsComplete = true;
		}

		if(!domOpsComplete) {

			if(nodesToSkip > 0) {
				i = i + nodesToSkip;
				nodesToSkip = 0;
			}

			node = domNodes[i];
			prevNode = domNodesPrev[i];

			if(isUndefined(node)) break;

			if(virtualDom.isInitialized() && node.staticChildren && (node.keyedAction !== 'insertNew' && isNotNull(node.keyedAction) && isDefined(prevNode) && isNotNull(prevNode.props))) {
				nodesToSkip = node.keyedChildren.length;
			} 

			currentLevel = node.level || prevNode.level;	
			nR = getNodeRelations(i, domNodes, node, domNodes[i-1], domNodes[i+nodesToSkip+1], prevNode, domNodesPrev[i-1], domNodesPrev[i+nodesToSkip+1], currentLevel, nodesToSkip);
			updateChildNodeFauxDomIndexes(nR, currentLevel);

			if(i !== 0) {
				if(isDefined($_prevParentCache) && currentLevel === prevLevel) {
					$_parentNode = $_prevParentCache;
				} 
				else {
					$_parentNode = $_parentNodeStack[$_parentNodeStack.length - 1];
					$_prevParentCache = $_parentNode;
				}
			} 
			else {
				$_parentNode = appContainer;
				$_parentNodeStack[0] = $_parentNode;
			}

			// Mount //
			// Render all nodes on intial page load
			////////////////////////////////////////2
			if(!virtualDom.isInitialized()) {

				$_currentNode = createDomElement(node);
				$_parentNode.appendChild($_currentNode);
				node.dom = $_currentNode;

			} else {
		
				// Reconcile DOM after state updates //
				//////////////////////////////////////////
				
				// All nodes are subscribed to a specific part of the state through the
				// 'subscribe" key in the component. If a part of the state changes
				// but the node is not subscribed we do not need to update any props. 
				nodeIsListeningToStateKey = false;

				// check if the node 'subcribesTo' value matches any of the state key
				// which have been changed. If so 'node is listening to change' so go
				// ahead with DOM updates.
				const subscribesTo = node.subscribesTo || prevNode.subscribesTo;

				if(isDefined(changedStateKeys) && isNotNull(subscribesTo) && !nodeIsListeningToStateKey) {
					for(let i = 0; i < subscribesTo.length; i++) {
						if(changedStateKeys.indexOf(subscribesTo[i]) > -1) {
							nodeIsListeningToStateKey = true;
							break; 
						}
					}
				} 
				else if(isNull(subscribesTo)) {
					// do nothing
					// Edge case where there are 2 nulled vnodes - prob an issue with nested keys
					// leave nodeIsListeningToStateKey = false
				}
				else {
					//if changedStateKeys are undefined it means that the whole state obj has
					// been replaced and all nodes must be checked and updated accordingly
					nodeIsListeningToStateKey = true;
				}

				// if node is not listening to the current state change we can go ahead and update
				// the id if necessary and discard the rest of the old/current node comparison
				// process.
		
				if(nodeIsListeningToStateKey) {
					patch(prevNode, node, nR, $_parentNode, currentLevel);
				} 
				else if(
					prevNode.parentComponent === node.parentComponent &&
					isNotNull(node.props) && 
					isNotNull(prevNode.props) &&
					!nodeReplacedFlag && 
					!nodeRemovedFlag &&
					node.type === prevNode.type &&
					node.keyedAction !== 'insertOld'

				) {
					// noop
					/////////////
					node.dom = prevNode.dom;
					$_currentNode = node.dom;
				} else {
					// not listening to current state change but needs to rerenderd for sum reason eg. parent node was replaced
					patch(prevNode, node, nR, $_parentNode, currentLevel);
				}
				
			}

			// update parent node stack array
			//////////////////////////////////
			if(nR.next === 'child' && nR.action !== 'removed') {
				$_parentNodeStack[$_parentNodeStack.length] = $_currentNode;
				
			} else if(nR.next === 'parent') {
				$_parentNodeStack.splice(nR.nextNodeLevel, currentLevel - nR.nextNodeLevel); // (nextNodeLevel, removeQuantity)
			}

			prevLevel = currentLevel;

		} 
		else {
			node = domNodes[i];
			prevNode = domNodesPrev[i];
			node.dom = prevNode.dom;
			$_currentNode = node.dom;
		}
	}
};