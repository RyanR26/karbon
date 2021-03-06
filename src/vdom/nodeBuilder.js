/* eslint-disable no-mixed-spaces-and-tabs */
import { isUndefined, isDefined, isArray, isFunction, clearObject } from '../utils/utils';
/* START.DEV_ONLY */
import { checkPropTypes, propTypes } from '../utils/utils';
/* END.DEV_ONLY */
import { voidedElements } from './voidedElements';
import { createVNode } from './createVNode';

const actionsCache = {};

export const nodeBuilder = (runTime, appGlobalActions) => {
	
	const vDomNodesArray = [];
	const componentActiveArray = [];
	const componentActiveIndexArray = [];
	const subscribesToArray = [];
	const keyedNodes = {};
	let keyedNodesPrev;
	let keyName;
	let isKeyed = false;
	let keyedParentLevel;
	let keyedParent;
	let vNode;
	let rootIndex = 1;
	let renderingSvg = false;

	const getVDomNodesArray = () => vDomNodesArray;
	
	const getKeyedNodes = () => keyedNodes;

	const getKeyedNodesPrev = () => keyedNodesPrev;
	
	const setKeyedNodesPrev = () => {
		keyedNodesPrev = Object.assign({}, keyedNodes);
		// reset keyeNodes Obj instead of creating new one
		clearObject(keyedNodes);
	};
	
	const resetVDomNodesArray = () => {
		vDomNodesArray.length = 0;
	};

	const nodeClose = tagName => {
		rootIndex--;
		if (tagName === 'svg' || tagName === '/svg') renderingSvg = false;
	};

	const nodeOpen = (tagName, data = {}, flags = {key: false, staticChildren: false}) => {

		if (tagName === 'svg') renderingSvg = true;

		// Dont cache args as vars as more performant - less garbage collection
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
			renderingSvg
		);
		
		// more performant than array.push()
		vDomNodesArray[vDomNodesArray.length] = vNode;

		// store all keyedNode children on the cached vNode so that when the parent is 
		// moved the children are moved too and in order to splice back into
		// the main vdom array for comparison
		if (isDefined(keyedParent) && rootIndex > keyedParentLevel) {
			keyedParent.keyedChildren[keyedParent.keyedChildren.length] = vNode;
		} else if (isDefined(keyedParent) && rootIndex === keyedParentLevel) {
			keyedParent = undefined;
			keyedParentLevel = undefined;
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

	const renderRootComponent = (comp, data) => {
		// Render all components top down from root		
		component(comp, data);
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
			component
		);
    
		subscribesToArray.length = subscribesToArray.length - 1;
		componentActiveArray.length = componentActiveArray.length - 1;
		componentActiveIndexArray.length = componentActiveIndexArray.length - 1;
	};

	return {
		renderRootComponent,
		component,
		getKeyedNodes,
		getKeyedNodesPrev,
		setKeyedNodesPrev,
		getVDomNodesArray,
		resetVDomNodesArray 
	};
};