import { virtualDom } from '../vdom/vDomState';
import { nodeBuilder } from '../vdom/nodeBuilder';
import { createView } from '../dom/createView';
import { createString } from '../server/createString';
import { isDefined, isFunction } from '../utils/utils';

let vdomNodeBuilder;
let vDomNodesArrayPrevious = [];

export const renderString = (
	appView, 
	runTime, 
	appGlobalActions, 
	appId,
	asyncResolve
) => {

	vdomNodeBuilder = isDefined(vdomNodeBuilder) ? vdomNodeBuilder : {};
	vdomNodeBuilder[appId] = isDefined(vdomNodeBuilder[appId]) ? vdomNodeBuilder[appId] : nodeBuilder(runTime, appGlobalActions);
	const nodeBuilderInstance = vdomNodeBuilder[appId];
	nodeBuilderInstance.renderRootComponent({ $$_appRootView : appView }, { props: runTime.getState() }, 'toString');

	if (asyncResolve && nodeBuilderInstance.getLazyCount() === 0) {
		asyncResolve(createString(nodeBuilderInstance.getVDomNodesArray()));
	} 
	else if (!asyncResolve) {
		return createString(nodeBuilderInstance.getVDomNodesArray());
	} 
	else {
		nodeBuilderInstance.resetVDomNodesArray();
	}
};

export const hydrateApp = (
	appContainer,
	appView, 
	runTime, 
	appGlobalActions, 
	appOnInit, 
	changedStateKeys, 
	sequenceId, 
	firstRender,
	appId,
	sequenceCache
) => { 

	vdomNodeBuilder = isDefined(vdomNodeBuilder) ? vdomNodeBuilder : {};
	vdomNodeBuilder[appId] = isDefined(vdomNodeBuilder[appId]) ? vdomNodeBuilder[appId] : nodeBuilder(runTime, appGlobalActions);
	const nodeBuilderInstance = vdomNodeBuilder[appId];
	nodeBuilderInstance.renderRootComponent({ $$_appRootView : appView }, { props: runTime.getState() }, 'creatingHydrationLayer');
	
	if (nodeBuilderInstance.getLazyCount() !== 0) {
		nodeBuilderInstance.resetVDomNodesArray();
	} else {
		vDomNodesArrayPrevious = nodeBuilderInstance.getVDomNodesArray().slice(0);

		renderApp(
			appContainer,
			appView, 
			runTime, 
			appGlobalActions, 
			appOnInit, 
			changedStateKeys, 
			sequenceId, 
			firstRender,
			appId,
			sequenceCache,
			true
		);
	}

};

export const renderApp = (
	appContainer,
	appView, 
	runTime, 
	appGlobalActions, 
	appOnInit, 
	changedStateKeys, 
	sequenceId, 
	firstRender,
	appId,
	sequenceCache,
	isHydrating
) => {

	let nodeBuilderInstance;

	if (!firstRender || isHydrating) {
		nodeBuilderInstance = vdomNodeBuilder[appId];
		vDomNodesArrayPrevious = nodeBuilderInstance.getVDomNodesArray().slice(0);
		nodeBuilderInstance.resetVDomNodesArray();
	} 
	else {
		vdomNodeBuilder = isDefined(vdomNodeBuilder) ? vdomNodeBuilder : {};
		vdomNodeBuilder[appId] = nodeBuilder(runTime, appGlobalActions);
		nodeBuilderInstance = vdomNodeBuilder[appId];
		virtualDom.setInitialized(false);
		virtualDom.setSync(false);
	}

	nodeBuilderInstance.setKeyedNodesPrev();
	nodeBuilderInstance.renderRootComponent({ $$_appRootView : appView }, { props: runTime.getState() }, 'toDom');

	createView(
		appContainer,
		nodeBuilderInstance.getVDomNodesArray(),
		vDomNodesArrayPrevious,
		changedStateKeys,
		nodeBuilderInstance.getKeyedNodes(),
		nodeBuilderInstance.getKeyedNodesPrev(),
		isHydrating,
		nodeBuilderInstance.getBlockCache()
	);
  
	if (!firstRender && !isHydrating) {
		runTime.exeQueuedMsgs(undefined, sequenceId, undefined, sequenceCache);
	} else {
		if (isFunction(appOnInit)) appOnInit(appGlobalActions);
		virtualDom.setInitialized(true);
		virtualDom.setSync(true);
	}  

};