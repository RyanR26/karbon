import { virtualDom } from '../vdom/vDomState';
import { nodeBuilder } from '../vdom/nodeBuilder';
import { createView } from '../dom/createView';
import { createString } from '../server/createString';
import { isDefined, isFunction } from '../utils/utils';

let vDomNodeBuilder;
let vDomNodesArrayPrevious = [];

export const renderString = (karbon, appId) => {

  const runTime = karbon.runTime[appId];
  const asyncResolve = karbon.toStringAsyncResolve[appId];
	vDomNodeBuilder = isDefined(vDomNodeBuilder) ? vDomNodeBuilder : {};
	vDomNodeBuilder[appId] = isDefined(vDomNodeBuilder[appId]) ? vDomNodeBuilder[appId] : nodeBuilder(runTime, karbon.appGlobalActions[appId]);
	const nodeBuilderInstance = vDomNodeBuilder[appId];
	nodeBuilderInstance.renderRootComponent({ $$_appRootView : karbon.appView[appId] }, { props: runTime.getState() }, 'toString');

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
  karbon,
	appId,
  firstRender,
	changedStateKeys, 
	sequenceId, 
	sequenceCache
) => { 
  
  const runTime = karbon.runTime[appId];
	vDomNodeBuilder = isDefined(vDomNodeBuilder) ? vDomNodeBuilder : {};
	vDomNodeBuilder[appId] = isDefined(vDomNodeBuilder[appId]) ? vDomNodeBuilder[appId] : nodeBuilder(runTime, karbon.appGlobalActions[appId]);
	const nodeBuilderInstance = vDomNodeBuilder[appId];
	nodeBuilderInstance.renderRootComponent({ $$_appRootView : karbon.appView[appId] }, { props: runTime.getState() }, 'creatingHydrationLayer');
	
	if (nodeBuilderInstance.getLazyCount() !== 0) {
		nodeBuilderInstance.resetVDomNodesArray();
	} else {
		vDomNodesArrayPrevious = nodeBuilderInstance.getVDomNodesArray().slice(0);

		renderApp(
			karbon,
      appId,
      firstRender,
			changedStateKeys, 
			sequenceId, 
			sequenceCache,
			true
		);
	}

};

export const renderApp = (
	karbon,
  appId,
  firstRender,
	changedStateKeys, 
	sequenceId, 
	sequenceCache,
	isHydrating
) => {

  const runTime = karbon.runTime[appId];
  const globalActions = karbon.appGlobalActions[appId];
  const appInit = karbon.appOnInit[appId];
	let nodeBuilderInstance;

	if (!firstRender || isHydrating) {
		nodeBuilderInstance = vDomNodeBuilder[appId];
		vDomNodesArrayPrevious = nodeBuilderInstance.getVDomNodesArray().slice(0);
		nodeBuilderInstance.resetVDomNodesArray();
	} 
	else {
		vDomNodeBuilder = isDefined(vDomNodeBuilder) ? vDomNodeBuilder : {};
		vDomNodeBuilder[appId] = nodeBuilder(runTime, globalActions);
		nodeBuilderInstance = vDomNodeBuilder[appId];
		virtualDom.setInitialized(false);
		virtualDom.setSync(false);
  }

	nodeBuilderInstance.setKeyedNodesPrev();
	nodeBuilderInstance.renderRootComponent({ $$_appRootView : karbon.appView[appId] }, { props: runTime.getState() }, 'toDom');

	createView(
		karbon.appContainer[appId],
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
		if (isFunction(appInit)) appInit(globalActions);
		virtualDom.setInitialized(true);
		virtualDom.setSync(true);
	}  
};