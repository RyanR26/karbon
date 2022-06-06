import { isUndefined, isDefined, isNull, isNotNull, isNotNullandIsDef, clearObject } from '../utils/utils';
import { virtualDom } from '../vdom/vDomState';
import { createDomElement } from './createDomElement';
import { createFragment } from './createFragment';
import { shouldRenderNode } from './shouldRenderNode';
import { updateChangedNode } from './updateChangedNode';
import { syncVNodes } from '../vdom/syncVNodes';
import { getNodeRelations } from './getNodeRelations';
import { getChangedNodeProps } from '../dom/getChangedNodeProps';

let nodeReplacedFlag;
let nodeRemovedFlag;
let handleUntrackedHtmlNodesFlag;
let forceUpdateStartLevel;
const keyedNodeRecycleBin = {};
const $_parentNodeStack = [];
let $_parentNode;
let $_currentNode;
let $_prevParentCache;
let node;
let prevNode;
let currentLevel;
let nR;
let nodeIsListeningToStateKey;
let renderNode;
let prevLevel;
// let nodesToSkip;
let domOpsCount;
let domOpsComplete;
let syncedVNodes;
let subscribesTo;
const childNodeIndexes = [];

const getDomIndex = currentLevel => childNodeIndexes[currentLevel];

const updateChildNodeFauxDomIndexes = (nodeRelation, currentLevel) => {
	switch (nodeRelation.current) {
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

const replaceNode = (parentNode, newNode, oldNode) => {
	if (isDefined(oldNode) && isNotNull(oldNode)) {
		parentNode.replaceChild(newNode, oldNode);
	} else {
		parentNode.appendChild(newNode);	
	}
};

const swapElements = (parent, el1, el2) => {
	const n2 = el2.nextSibling;
	if (n2 === el1) {
		parent.insertBefore(el1, el2);
	} else {
		parent.insertBefore(el2, el1);
	}
	if (isDefined(el1)) {
		parent.insertBefore(el1, n2);
	}
};

const updateProperties = (props, values, currentNode) => {
	for (let i = 0; i < props.length; i++) {
		updateChangedNode(
			props[i], 
			values[i], 
			currentNode
		);
	}
};

const patch = () => {

	renderNode = shouldRenderNode(prevNode, node, nR, nodeReplacedFlag, nodeRemovedFlag, currentLevel, forceUpdateStartLevel);

	if (currentLevel <= forceUpdateStartLevel) {
		nodeReplacedFlag = false;
		nodeRemovedFlag = false;
	}
	
	if (renderNode.should) {

		if (handleUntrackedHtmlNodesFlag) {
			// Increase the child node index by 1 as all untracked nodes created by using
			// innerHTML prop will be wrapped in a containing element to prevent breaking the 
			// vdom -> real dom relation
			childNodeIndexes[currentLevel]++;
		}

		switch (renderNode.action) {

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
			$_parentNode.appendChild($_currentNode);
			domOpsCount ++;
			break;
		}

		case 'replaceNode' : {
			$_currentNode = createDomElement(node);
			node.dom = $_currentNode;
			replaceNode($_parentNode, $_currentNode, prevNode.dom);
			nodeReplacedFlag = true;
			forceUpdateStartLevel = currentLevel;    
			domOpsCount ++;
			break;
		}

		case 'removeNode' : {
			let nodeToRemove = prevNode.dom;
			if (isNotNullandIsDef(nodeToRemove)) {
				$_parentNode.removeChild(nodeToRemove);
				nodeToRemove = null;
				childNodeIndexes[currentLevel]--;
				nodeRemovedFlag = true;
				forceUpdateStartLevel = currentLevel;
				domOpsCount ++;
			}
			break;
		}

		case 'recyclable': {
			if (isUndefined(keyedNodeRecycleBin[prevNode.key])) {
				keyedNodeRecycleBin[prevNode.key] = true;
			} else {
				childNodeIndexes[currentLevel]--;
			}
			break;
		}

		case 'handleKeyedUpdate': {

			const currentDomNode = $_parentNode.children[getDomIndex(currentLevel)];
			const recycledDomNode = prevNode.dom;
			const keyedAction = renderNode.keyedAction;
			$_currentNode = recycledDomNode;

			if (keyedAction === 'runBlockUpdates') {
				const keys = Object.keys(renderNode.values);
				for (let i=0; i<keys.length; i++) {
					const key = keys[i];
					const newProps = renderNode.values[key];
					const { props, values } = getChangedNodeProps(renderNode.props[key], newProps);
					if (props.length > 0) {
						updateProperties(props, values, document.getElementById(newProps.id));
					}
				}
			}
			else if (keyedAction === 'insertNew') {	
				$_currentNode = createDomElement(node);
				if(node.block) {
					$_currentNode.appendChild(createFragment(node.block));					
				}
				$_parentNode.insertBefore($_currentNode, currentDomNode);
				domOpsCount ++;
			}
			else if (keyedAction === 'insertOld') {
				$_parentNode.insertBefore(recycledDomNode, currentDomNode);
				keyedNodeRecycleBin[node.key] = true;
				domOpsCount ++;
				if (renderNode.props.length > 0) {
					updateProperties(renderNode.props, renderNode.values, $_currentNode);
				}
			}
			else if (keyedAction === 'swap' || (isDefined(currentDomNode) && !currentDomNode.isEqualNode(recycledDomNode))) {	
				swapElements($_parentNode, currentDomNode, recycledDomNode);
				keyedNodeRecycleBin[node.key] = true;
				domOpsCount ++;
				if (renderNode.props.length > 0) {
					updateProperties(renderNode.props, renderNode.values, $_currentNode);
				}
			} 
			else if (keyedAction === 'updateAttrs' && renderNode.props.length > 0) {
				updateProperties(renderNode.props, renderNode.values, $_currentNode);
				domOpsCount ++;
			}

			node.dom = $_currentNode;
			break;
		}
		}

		if (renderNode.untrackedHtmlNodes && nR.next === 'child' && nR.actionNext !== 'removed') {
			handleUntrackedHtmlNodesFlag = true;
		} else {
			handleUntrackedHtmlNodesFlag = false;
		}
	} 
	else {
		node.dom = prevNode.dom;
		$_currentNode = node.dom;
		if (renderNode === 'recycled') {
			childNodeIndexes[currentLevel]--;
		}
	}
};

export const createView = (appContainer, domNodes, domNodesPrev, changedStateKeys, keyedNodes, keyedNodesPrev, isHydrating, blockCache) => {

	nodeReplacedFlag = false;
	nodeRemovedFlag = false;
	handleUntrackedHtmlNodesFlag = false;
	forceUpdateStartLevel = null;
	$_parentNode = undefined;
	$_currentNode = undefined;
	$_prevParentCache = undefined;
	node = undefined;
	prevNode = undefined;
	currentLevel = undefined;
	nR = undefined;
	nodeIsListeningToStateKey = false;
	renderNode = undefined;
	prevLevel = 0;
	// nodesToSkip = 0;
	domOpsCount = 0;
	domOpsComplete = false;
	syncedVNodes = undefined;
	subscribesTo = null;

	//reset obj and arrays for reuse
	clearObject(keyedNodeRecycleBin);
	$_parentNodeStack.length = 0;
	childNodeIndexes.length = 0;

	if (virtualDom.isInitialized() && virtualDom.requiresSync()) {	
		syncedVNodes = syncVNodes(domNodes.slice(0), domNodesPrev, keyedNodes, keyedNodesPrev, blockCache);
		domNodes = syncedVNodes.domNodes;
		domNodesPrev = syncedVNodes.domNodesPrev;
	}
	
	for (let i = 0, len = domNodes.length; i < len; i++) {

		if (domOpsComplete || virtualDom.getDomUpdatesLimit() === domOpsCount) domOpsComplete = true;
	
		if (!domOpsComplete) {

			// if (nodesToSkip > 0) {
			// 	i = i + nodesToSkip;
			// 	nodesToSkip = 0;
			// }

			node = domNodes[i];
			prevNode = domNodesPrev[i];

			if (isUndefined(node)) break;

			// if (virtualDom.isInitialized() && node.staticChildren && (node.keyedAction !== 'insertNew' && isNotNull(node.keyedAction) && isDefined(prevNode) && isNotNull(prevNode.props))) {
			// 	nodesToSkip = node.keyedChildren.length;
			// } 

			currentLevel = node.level || prevNode.level;	
			// nR = getNodeRelations(i, domNodes, node, domNodes[i-1], domNodes[i+nodesToSkip+1], prevNode, domNodesPrev[i-1], domNodesPrev[i+nodesToSkip+1], currentLevel, nodesToSkip);
			nR = getNodeRelations(i, domNodes, node, domNodes[i-1], domNodes[i+1], prevNode, domNodesPrev[i-1], domNodesPrev[i+1], currentLevel);
			updateChildNodeFauxDomIndexes(nR, currentLevel);

			if (i !== 0) {
				if (isDefined($_prevParentCache) && currentLevel === prevLevel) {
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
			// Render all nodes on initial page load
			////////////////////////////////////////
			if (!virtualDom.isInitialized() && !isHydrating) {

				$_currentNode = createDomElement(node);
				$_parentNode.appendChild($_currentNode);  
				node.dom = $_currentNode;

				if (node.block) {
					$_currentNode.appendChild(createFragment(node.block));					
				}
			} 
			else {

				if (isHydrating) {
					// add dom node ref to prev vnodes dom property
					prevNode.dom = $_parentNode.children[getDomIndex(currentLevel)];
				}
		
				// Reconcile DOM after state updates //
				//////////////////////////////////////////
				
				// All nodes are subscribed to a specific part of the state through the
				// 'subscribe" key in the component. If a part of the state changes
				// but the node is not subscribed we do not need to update any props. 
				nodeIsListeningToStateKey = false;

				// check if the node 'subcribesTo' value matches any of the state key
				// which have been changed. If so 'node is listening to change' so go
				// ahead with DOM updates.
				subscribesTo = node.subscribesTo || prevNode.subscribesTo;

				if (isDefined(changedStateKeys) && isNotNull(subscribesTo) && !nodeIsListeningToStateKey) {
					for (let i = 0; i < subscribesTo.length; i++) {
						if (changedStateKeys.indexOf(subscribesTo[i]) > -1) {
							nodeIsListeningToStateKey = true;
							break; 
						}
					}
				} 
				else if (isNull(subscribesTo)) {
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
		
				if (nodeIsListeningToStateKey) {
					patch();
				} 
				else if (
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
					// not listening to current state change but needs to re-rendered for sum reason eg. parent node was replaced
					patch();
				}
			}

			// update parent node stack array
			//////////////////////////////////
			if (nR.next === 'child' && nR.action !== 'removed') {
				$_parentNodeStack[$_parentNodeStack.length] = $_currentNode;
				
			} else if (nR.next === 'parent') {
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