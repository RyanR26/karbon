import { isUndefined, isDefined, isNull, isNotNull, isFalse, isNotFalse} from '../utils/utils';

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
	dom: null
};

const recycledVNodeStatic = Object.assign({}, emptyVNodeStatic, { keyedAction: 'recycled' });
const recyclableVNodeStatic = Object.assign({}, emptyVNodeStatic, { keyedAction: 'recyclable' });

// Algorithm for syncing prev vNode tree with new vNode tree
// Each node in the vtree array needs to be compared to a node on the same level in the old tree
export const syncVNodes = (domNodes, domNodesPrev, keyedNodes, keyedNodesPrev, blockCache) => {
	
	let prevNode;
	let node;
	let breakLoop = false;

	if (domNodes.length === 0) {

		for (let i=0; i<domNodesPrev.length; i++) {
			domNodes[i] = emptyVNodeStatic;  
		}

	} else {

		for (let i=0; i<domNodes.length; i++) {

			prevNode = domNodesPrev[i];
			node = domNodes[i];
			breakLoop = false;

			if (isUndefined(prevNode)) {
				domNodesPrev[i] = emptyVNodeStatic;  	
			} 
			else if (isUndefined(node)) {
				domNodes[i] = emptyVNodeStatic;  
			}
			else if (prevNode.level > node.level) {
				domNodes.splice(i, 0, emptyVNodeStatic);
			}
			else if (prevNode.level < node.level) {
				domNodesPrev.splice(i, 0, emptyVNodeStatic);
			}
      
			if (i === domNodes.length - 1) {
				const remaining = domNodesPrev.length - domNodes.length;
				if (remaining > 0) {
					for (let x=1; x <= remaining; x++) {
						domNodes[domNodes.length] = emptyVNodeStatic;
						breakLoop = true;
					}
				}	
			}

			prevNode = domNodesPrev[i];
			node = domNodes[i];

			////////////////////// KEYED NODES //////////////////////////
			/////////////////////////////////////////////////////////////

			// 1: Insert old keyed node
			// {key: false, props: null} : {key: 'keyName'} or
			// {key: 'keyName2', props: {}} : {key: 'keyName'} 
			// Current node is keyed and prev node props is null or prev node is keyed but is not in prev pool (has been used already )
			// Insert old keyed node (move from old location and insert) - the prev dom node does not exist (empty vnode) or has been moved already

			// 2: Remove previous node
			// {key: false, props: {} : {key: 'keyName'} or
			// {key: 'keyName2', props: {}} : {key: 'keyName'} 
			// Current node is keyed and prev node is not or prev node is keyed but not present in new pool (not part of new UI)
			// For optimal performance we remove the previous node until we hit the next keyed node

			// 3: Swap keyed nodes
			// {key: 'keyName2'} : {key: 'keyName'} 
			// Current node and prev nodes are keyed and both exist in the new pool (both make up part of the UI)
			// swap the prev node with the current one

			const keyedNodesPrevPool = keyedNodesPrev[node.level || prevNode.level];
      
			if (isDefined(keyedNodesPrevPool)) { // Check If existing pool of keyed Nodes - else skip

				let isOldNodePresentInPrevKeyedPool;
				let isOldNodePresentInNewKeyedPool;
				let keyedParentLevel;

				if (isNotFalse(node.key) && prevNode.key !== node.key) { // New node is keyed

					// Check if old node is keyed too, or if it is, if it still exists in the old pool. IF it does not
					// exist in the old pool then it has already been reused and deleted from the pool. 
					isOldNodePresentInPrevKeyedPool = isDefined(keyedNodesPrevPool[prevNode.key]); 
					// If old node is keyed - check if is it needed in the next rendered UI
					isOldNodePresentInNewKeyedPool = isUndefined(keyedNodes[node.level]) ? false : isDefined(keyedNodes[node.level][prevNode.key]);
    
					// Keep track of the highest most keyed parent.
					// Any children of this keyed element need to be stored against the
					// keyedChildren prop on the vNode
					//////////////////////////////////////////////////////////////////////////////

					if (node.level <= keyedParentLevel) {
						keyedParentLevel = undefined;
					}

					keyedParentLevel = isDefined(keyedParentLevel) ? keyedParentLevel : node.level;

					////////////////////////////////////////////
					////////////////////////////////////////////

					// Try to retrieve current keyed node from prev keyed pool
					let prevKeyedNode = keyedNodesPrevPool[node.key];

					// If undefined means it is a new node. If defined it exists in the DOM already and must be reused (recycled).          
					if (isDefined(prevKeyedNode)) { 

						const addKeyedChildrenToOldTree = () => {
							if (prevKeyedNode.keyedChildren.length > 0) {
								let childrenCount = 0;
								while (isDefined(domNodesPrev[i + childrenCount + 1]) && domNodesPrev[i + childrenCount + 1].level > keyedParentLevel) {
									childrenCount ++;
								}
								domNodesPrev.splice(i + 1, childrenCount, ...prevKeyedNode.keyedChildren);
							}
						};

						// 1: Insert old (recycled) keyed node
						////////////////////////////////
						if (isNull(prevNode.props) || (isNotFalse(prevNode.key) && !isOldNodePresentInPrevKeyedPool)) {
							// prev node is empty or has already been used already so we can replace the vNode with 
							// the prevKeyedNode vNode for comparison of attributes.
							domNodesPrev[i] = prevKeyedNode;
							node.keyedAction = 'insertOld'; // set action for use in patch function
							// match all children of keyed parent node with their old vNodes counterparts
							addKeyedChildrenToOldTree();
						}
						// 2: Remove previous node (keyed or non-keyed)
						//////////////////////////////////////////////////////////
						else if (isFalse(prevNode.key) || !isOldNodePresentInNewKeyedPool) {
							domNodes.splice(i, 0, emptyVNodeStatic);
							node = domNodes[i];
						}
						// 3: Swap keyed nodes
						//////////////////////
						else {
							domNodesPrev[i] = prevKeyedNode;
							node.keyedAction = 'swap';
							// match all children of keyed parent node with their old vNodes counterparts
							addKeyedChildrenToOldTree();
						}
						// once keyed node has been reused remove it from pool
						delete keyedNodesPrevPool[node.key];
            
						// Insert a new keyed node.
						//////////////////////////
					} else {
						if (isNull(prevNode.props)) {
							domNodesPrev[i] = emptyVNodeStatic;
						} else {
							domNodesPrev.splice(i, 0, emptyVNodeStatic);
						}
						node.keyedAction = 'insertNew';
					}
				} 

				//if keys match we still want to update any props that might have changed
				else if (isNotFalse(node.key) && prevNode.key === node.key) {
					node.keyedAction = 'updateAttrs';
				}

				// 1: Insert new unkeyed node
				// {key: 'keyName'} : {key: false, props: {}}
				// Prev is keyed and is present in the prevKeyed pool (hasn't been used yet) and is present in newPool (will be rendered in current UI)
				// Action - splice empty node in prevNodesArray and change node.keyedAction to 'insertNew' 
				// This will insert the node at the index of the current keyed node and push the prev keyed node down until it either reaches
				// its match in the new nodes array or a diff element where another action takes place

				// 2: Ignore recycled key node
				// {key: 'keyName'} : {key: false, props: {}}
				// Prev is keyed and is NOT present in the prevKeyed pool (has already been used) and is present in newPool (has been been rendered in current UI)
				// Prev node has been moved to another position in the DOM already ie. has been 'recycled'
				// Action - splice a new empty node into the current nodes array stating this
				// Reconciler will ignore these nodes and decrement the dom child index
				// synced nodes = {key: 'keyName'} : {key: 'keyName, keyedAction: 'recycled', props: null}
        
				// 3: Replace old keyed node with unkeyed node
				// {key: 'keyName'} : {key: false, props: {}}
				// Prev is keyed and is NOT present in newPool (will NOT be rendered in current UI)
				// Action - Prev keyed node can be removed as it doesn't make up part of the UI anymore
				// Make prev node key = false to trigger replace update

				// 4: Remove old keyed node 
				// {key: 'keyName'} : {key: false, props: null}
				// Prev is keyed and is NOT present in newPool (will NOT be rendered in current UI)
				// Action - remove prev keyed node from dom

				// 5: Recycle old keyed node 
				// {key: 'keyName'} : {key: false, props: null}
				// Prev is keyed and is present in newPool (will be rendered in current UI)
				// Action - change node.keyedAction to 'recycle'
				// Skip over this as the node will be used later on


				else if (isNotFalse(prevNode.key) && prevNode.key !== node.key) { // Old node is keyed

					isOldNodePresentInPrevKeyedPool = isDefined(keyedNodesPrevPool[prevNode.key]);
					isOldNodePresentInNewKeyedPool = isUndefined(keyedNodes[prevNode.level]) ? false : isDefined(keyedNodes[prevNode.level][prevNode.key]);

					const removeKeyedChildrenFromOldTree = () => {
						if (prevNode.keyedChildren.length > 0) {
							let childrenCount = 0;
							while (isDefined(domNodesPrev[i + childrenCount + 1]) && domNodesPrev[i + childrenCount + 1].level > prevNode.level) {
								childrenCount ++;
							}
							domNodesPrev.splice(i + 1, childrenCount);
						}
					};

					if (isNotNull(node.props)) {
						// 1: Insert New keyed/unkeyed node
						/////////////////////////////
						if (isOldNodePresentInPrevKeyedPool && isOldNodePresentInNewKeyedPool) {
							domNodesPrev.splice(i, 0, emptyVNodeStatic);
							node.keyedAction = 'insertNew';
							removeKeyedChildrenFromOldTree();
						} 
						// 2: Ignore recycled keyed node (has already been used)
						///////////////////////////////
						else if (!isOldNodePresentInPrevKeyedPool && isOldNodePresentInNewKeyedPool) {
							domNodes.splice(i, 0, recycledVNodeStatic);
							removeKeyedChildrenFromOldTree();
						}
						// 3: Replace old keyed node with unkeyed node
						//////////////////////////////////////////////
						else if (!isOldNodePresentInNewKeyedPool) {
							// prevNode.key = false;
							// no need to remove children of keyed node from tree as the nodeRemovedFlag 
							// in 'CreateView' is being used to skip over these
             
							domNodes.splice(i, 0, emptyVNodeStatic);
							node = domNodes[i];
              
							if (prevNode.block) {
								blockCache[prevNode.key] = false;
							}
						}
					} else {
						// 4: Remove old keyed node 
						///////////////////////////
						if (!isOldNodePresentInNewKeyedPool) {
							// prevNode.key = false;
							// no need to remove children of keyed node from tree as the nodeRemovedFlag 
							// in 'CreateView' is being used to skip over these
							domNodes.splice(i, 0, emptyVNodeStatic);
							node = domNodes[i];

							if (prevNode.block) {
								blockCache[prevNode.key] = false;
							}
						}
						// 5: Mark old keyed node as Recyclable
						////////////////////////////
						else {
							domNodes[i] = recyclableVNodeStatic;
							removeKeyedChildrenFromOldTree();
						}
					}
				}
			} 
			// Ensure new keyed nodes are always inserted even when there is no pool of previously keyed nodes
			else if(node.key) {
				if (isNull(prevNode.props)) {
					domNodesPrev[i] = emptyVNodeStatic;
				} else {
					domNodesPrev.splice(i, 0, emptyVNodeStatic);
				}
				node.keyedAction = 'insertNew';
			}

			if (breakLoop && domNodes.length === domNodesPrev.length) break;
            
		}
	}

	return {
		domNodes,
		domNodesPrev
	};
};
