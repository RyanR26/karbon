import { virtualDom } from '../vdom/vDomState';
import { nodeBuilder } from '../vdom/nodeBuilder';
import { createView } from '../dom/createView';
import { isDefined, isFunction } from '../utils/utils';

let vdomNodeBuilder;
let vDomNodesArrayPrevious = [];

export const renderApp = (
	appContainer,
	appView, 
	runTime, 
	appGlobalActions, 
	appOnInit, 
	changedStateKeys, 
	sequenceId, 
	firstRender,
	lastFirstRender,
	appId
) => {
	
	let nodeBuilderInstance;
	// cache nodeBuilder instances
	if(!firstRender) {
		nodeBuilderInstance = vdomNodeBuilder[appId];
		vDomNodesArrayPrevious = nodeBuilderInstance.getVDomNodesArray().slice(0);
		nodeBuilderInstance.resetVDomNodesArray();
	} 
	else {
		vdomNodeBuilder = isDefined(vdomNodeBuilder) ? vdomNodeBuilder : {};
		vdomNodeBuilder[appId] = nodeBuilder(runTime, appGlobalActions, changedStateKeys);
		nodeBuilderInstance = vdomNodeBuilder[appId];
	}

	nodeBuilderInstance.setKeyedNodesPrev();
	nodeBuilderInstance.renderRootComponent({ $$_appRootView : appView }, {props: runTime.getState()});

	createView(
		appContainer,
		nodeBuilderInstance.getVDomNodesArray(),
		vDomNodesArrayPrevious,
		changedStateKeys,
		nodeBuilderInstance.getKeyedNodes(),
		nodeBuilderInstance.getKeyedNodesPrev(),
		appId
	);

	if(!firstRender) {
		runTime.exeQueuedMsgs(undefined, sequenceId);
	} else {
		if(isFunction(appOnInit)) appOnInit(appGlobalActions);
		if (lastFirstRender) {
			virtualDom.setInitialized(true);
			virtualDom.setSync(true);
		}
	}
};