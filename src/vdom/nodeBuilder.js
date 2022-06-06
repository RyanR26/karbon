/* eslint-disable no-mixed-spaces-and-tabs */
import { isUndefined, isDefined, isArray, isFunction, clearObject, isPromise, isBrowser, objsAreEqual, isObject } from '../utils/utils';
/* START.DEV_ONLY */
import { checkPropTypes, propTypes } from '../utils/utils';
/* END.DEV_ONLY */
import { voidedElements } from './voidedElements';
import { createVNode } from './createVNode';
import { createString } from '../server/createString';

export const nodeBuilder = (runTime, appGlobalActions) => {

	const vDomNodesArray = [];
	const componentActiveArray = [];
	const componentActiveIndexArray = [];
	const subscribesToArray = [];
	const keyedNodes = {};
	const actionsCache = {};
	const lazyCache = {};
	const blockCache = {};
	const blockVNodes = []; 
	let creatingBlock = false;
	let keyedNodesPrev;
	let keyName;
	let isKeyed = false;
	let keyedParentLevel;
	let keyedParent;
	let vNode;
	let rootIndex = 1;
	let renderingSvg = false;
	let creatingHydrationLayer = false;
	let lazyCount = 0;

	const getVDomNodesArray = () => vDomNodesArray;
	
	const getKeyedNodes = () => keyedNodes;

	const getKeyedNodesPrev = () => keyedNodesPrev;
	
	const setKeyedNodesPrev = () => {
		keyedNodesPrev = Object.assign({}, keyedNodes);
		// reset keyedNodes Obj instead of creating new one
		clearObject(keyedNodes);
	};
	
	const resetVDomNodesArray = () => {
		vDomNodesArray.length = 0;
	};

	const getLazyCount = () => lazyCount;

	const getBlockCache = () => blockCache;

	const nodeClose = tagName => {
		rootIndex--;
		if (tagName === 'svg' || tagName === '/svg') renderingSvg = false;
	};

	const nodeOpen = (tagName, data = {}, flags = {key: false, staticChildren: false}, block = false, blockProps) => {

		if (tagName === 'svg') renderingSvg = true;

		// Don't cache args as vars as more performant - less garbage collection
		// createElementObj args are :
		// const createElementObj = (type, parentComponentIndex, id, data, level, key, parentComponentName, subscribesTo)
		keyName = flags.key;
		isKeyed = keyName !== false;
			
		vNode = createVNode(
			tagName,
			componentActiveIndexArray[componentActiveIndexArray.length - 1],
			data,
			rootIndex,
			keyName,
			flags.staticChildren,
			componentActiveArray[componentActiveArray.length - 1],
			subscribesToArray[subscribesToArray.length - 1],
			renderingSvg,
			block,
			blockProps
		);

		if (creatingHydrationLayer) {
			Object.keys(vNode.props).map(key => {
				if (key[0] === 'o' && key[1] === 'n') {
					vNode.props[key] = '';
				}
			});
		}

		if (creatingBlock) {
			blockVNodes[blockVNodes.length] = vNode;
			if (!voidedElements[tagName]) {
				rootIndex++;
			}
			return;
		} 
			
		vDomNodesArray[vDomNodesArray.length] = vNode;
	
		// store all keyedNode children on the cached vNode so that when the parent is 
		// moved the children are moved too and in order to splice back into
		// the main vdom array for comparison
		
		if (isDefined(keyedParent)) {
			if (rootIndex > keyedParentLevel) {
				keyedParent.keyedChildren[keyedParent.keyedChildren.length] = vNode;
			} else if (rootIndex === keyedParentLevel) {
				keyedParent = undefined;
				keyedParentLevel = undefined;
			}
		}

		if (isKeyed) {
			keyedParentLevel = rootIndex;
			keyedParent = vNode;
			vNode.keyedChildren = [];

			if (isUndefined(keyedNodes[rootIndex])) {
				keyedNodes[rootIndex] = {};
			}
			keyedNodes[rootIndex][keyName] = vNode;
		}

		if (!voidedElements[tagName]) {
			rootIndex++;
		}


	};
	
	const component = (comp, data = {}) => {

		if (isArray(comp)) {
			data = comp[1] || {};
			comp = comp[0];
		}
			
		const viewRef = Object.keys(comp)[0];
		const view = comp[viewRef];
		const index = isUndefined(data.index) ? 0 : data.index;

		componentActiveArray[componentActiveArray.length] = viewRef;
		componentActiveIndexArray[componentActiveIndexArray.length] = index;

		////////////////////////////////////////////////////////////////////////////
		/// actions ///
		/// if defined inject actions function into component ///
		////////////////////////////////////////////////////////////////////////////

		let localActions;
		let dataActions = data.actions;

		if (isDefined(dataActions)) {
			localActions = {};
			dataActions = isArray(dataActions) ? dataActions : [dataActions];
			
			for (let i = 0; i < dataActions.length; i++) {
				const actionsObj = dataActions[i];
				const actionsName = Object.keys(actionsObj)[0];

				if (isDefined(actionsCache[actionsName])) {
					localActions[actionsName] = actionsCache[actionsName];
				} else {
					localActions[actionsName] = actionsObj[actionsName]({stamp: runTime.stamp, msgs: runTime.messages});
					actionsCache[actionsName] = localActions[actionsName];
				}
			}
		}

		/////////////////////////////////
		/// run component  ///
		/////////////////////////////////

		// If no subscribe to key is provided in component subscribe to all but give warning
		// about performance.

		subscribesToArray[subscribesToArray.length] = 
			isUndefined(data.subscribe) || data.subscribe === 'all' ? 
				Object.keys(runTime.getState()) : 
				data.subscribe;

		const propsFromState = isDefined(data.mergeStateToProps) ? data.mergeStateToProps(runTime.getState()) : undefined;

		/* START.DEV_ONLY */

		// Check defined prop types //
		if (isFunction(data.propTypes)) {

			checkPropTypes(
				propsFromState ? Object.assign({}, data.props, propsFromState) : data.props, 
				data.propTypes(propTypes), 
				viewRef
			);
		}
		
		/* END.DEV_ONLY */
		
		// run view render function //
		// merge local and global actions objects to pass to component
		view(
			isDefined(propsFromState) ? Object.assign({}, data.props, propsFromState) : data.props, 
			isDefined(localActions) || isDefined(appGlobalActions) ? Object.assign({}, localActions, appGlobalActions) : undefined, 
			index
		)(
			nodeOpen, 
			nodeClose,
			component,
			lazy,
			block
		);
		
		subscribesToArray.length = subscribesToArray.length - 1;
		componentActiveArray.length = componentActiveArray.length - 1;
		componentActiveIndexArray.length = componentActiveIndexArray.length - 1;
	};

	const lazy = (importModule, lazyComponent, loading, error, time) => {

		const cacheKey = importModule.toString().replace(/ /g, '');

		if (lazyCache[cacheKey] === 'error') {
			if (isFunction(error)) error();
		}
		else if (isDefined(lazyCache[cacheKey])) {
			const lazy = lazyCache[cacheKey][0];
			lazyCount --;
			if (isFunction(lazy)) lazy(lazyCache[cacheKey][1]);
		} 
		else {
			if (isFunction(loading)) loading();
			lazyCount ++;
			const thenable = isPromise(importModule) ? Promise.resolve(importModule) : importModule();
		
			thenable
				.then(module => {
					setTimeout(() => {
						lazyCache[cacheKey] = [lazyComponent, module];
						runTime.forceReRender(creatingHydrationLayer);
						if (isBrowser() && !creatingHydrationLayer) {
							window.dispatchEvent(new CustomEvent('Lazy_Component_Rendered', { detail: { key: cacheKey } }));
						}
					}, time || 0);
				})
				.catch(error => {
					console.error(error); // eslint-disable-line
					lazyCache[cacheKey] = 'error';
					runTime.forceReRender(creatingHydrationLayer);
					if (isBrowser() && !creatingHydrationLayer) {
						window.dispatchEvent(new CustomEvent('Lazy_Component_Error', { detail: { key: cacheKey } }));
					}
					
				});
		}
	};

	const block = (key, view, props) => {

		creatingBlock = true;    
		let block = '';
		if (props) {
			const propKeys = Object.keys(props);
			for (let i=0; i<propKeys.length; i++) {
				const propKey = propKeys[i];
				props[propKey].id = props[propKey].id || `${key}_${propKey}`;
			}
		} 
		// let bubbleEventMapX;

		if (!blockCache[key]) {
			view(props);
			// block = createString(blockVNodes, false);
			block = blockVNodes.slice(0);
			blockCache[key] = block;

			// if (props) {
			// 	bubbleEventMapX = {};
			// 	const propKeys = Object.keys(props);
			// 	for (let i=0; i<propKeys.length; i++) {
			// 		const propKey = propKeys[i];
			// 		const nestedObj = props[propKey];
			// 		const nestedPropKeys = Object.keys(nestedObj);
			// 		for (let x=0; x<nestedPropKeys.length; x++) {
			// 			const nestedKey = nestedPropKeys[x];
			// 			if (nestedKey[0] === 'o' && nestedKey[1] === 'n' ) {
			// 				const eventType = nestedKey.slice(2);
			// 				if (!bubbleEventMapX[eventType]) {
			// 					bubbleEventMapX[eventType] = {};
			// 				}
			// 				bubbleEventMapX[eventType][nestedObj.id] = nestedObj[nestedKey];
			// 			}
			// 		}
			// 	}

			// 	// console.log('bubbleEventMapX ', bubbleEventMapX);
			// }
		} else {
			block = true;
		}

		// const bubbledEventHandler = (bubbleEventMap, event) => {
		// 	const type = event.type;
		// 	const targetId = event.target.id;
     
		// 	if (bubbleEventMap[type] && bubbleEventMap[type][targetId]) {
		// 		const action = bubbleEventMap[type][targetId];
		//     console.log(targetId, ...action.slice(1))
		// 		if (Array.isArray(action)) {
		// 			action[0](...action.slice(1));
		// 		} else {
		// 			action();
		// 		}
		// 	}
			
		// };


		creatingBlock = false; 
		nodeOpen('span', { 
			// innerHTML: block, 
			// onclick: [bubbledEventHandler, bubbleEventMapX] 
		}, { key }, block, props);
		nodeClose();
		blockVNodes.length = 0;
	};

	const renderRootComponent = (comp, data) => {
		creatingHydrationLayer = false;
		component(comp, data);
	};

	const createHydrationLayer = (comp, data) => {
		creatingHydrationLayer = true;
		component(comp, data);
	};

	return {
		renderRootComponent,
		createHydrationLayer,
		component,
		getKeyedNodes,
		getKeyedNodesPrev,
		setKeyedNodesPrev,
		getVDomNodesArray,
		resetVDomNodesArray,
		getLazyCount,
		getBlockCache
	};
};