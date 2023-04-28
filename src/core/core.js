/* eslint-disable no-console */
import { isDefined, isNull, isFunction, isBrowser } from '../utils/utils';
import { createRunTime } from '../runTime/runTime';
import { renderApp, hydrateApp, renderString } from '../render/render';
import { globalActions } from './globalActions';
import { handleSubssciptions } from './handleSubscriptions';

export const karbon = (() => ({

	runTime: {},
	appRootComponent: {},
	appRootActions: {},
	appContainer: {},
	appView: {},
	appGlobalActions: {},
	appRootSubscribe: {},
	appSubs: {},
	appFx: {},
	appOnInit: {},
	renderToString: {},
	toStringAsyncResolve: {},
	process: {},
	appCounter: 0,
	/* START.DEV_ONLY */
	appTap: {},
	/* END.DEV_ONLY */

	render(appConfig) {
		this.init(appConfig, false, 'render');
	},

	hydrate(appConfig) {
		this.init(appConfig, false, 'hydrate');
	},

	toString(appConfig) {
		return this.init(appConfig, true, 'string');
	},

	toStringAsync(appConfig) {
		
		return new Promise(resolveOuter => {
			this.toStringAsyncPromise = new Promise(resolveInner => {
				this.init(appConfig, true, 'toStringAsync', resolveInner);
			});
			this.toStringAsyncPromise.then(htmlString => {
				resolveOuter(htmlString);
			});
		});
	},

	init(appConfigObj, renderToString, process, asyncStringResolve) {

		this.appCounter++;

		const appId = this.appCounter;

		this.renderToString[appId] = renderToString;
		this.toStringAsyncResolve[appId] = asyncStringResolve;
		this.process[appId] = process;
		this.appContainer[appId] = isBrowser() ? appConfigObj.container(document) : null;

		/* START.DEV_ONLY */
		if (isBrowser() && isNull(this.appContainer[appId])) {
			console.error('App container node does not exist');
			return false;
		}
		/* END.DEV_ONLY */

		this.appFx[appId] = appConfigObj.effects;
		this.appSubs[appId] = appConfigObj.subscriptions;
		/* START.DEV_ONLY */
		this.appTap[appId] = appConfigObj.tap || {};
		/* END.DEV_ONLY */
		this.runTime[appId] = createRunTime(this, appId);
		this.runTime[appId].setState(appConfigObj.state);
		this.appView[appId] = appConfigObj.view;
		this.appGlobalActions[appId] = this.initGlobalActions(appConfigObj.actions, this.runTime[appId]);
		this.appOnInit[appId] = appConfigObj.init;

		if (isBrowser()) {
			this.runHandleSubs(appId);
		}

		/* START.DEV_ONLY */
		if (isDefined(this.appTap[appId].state)) {
			this.appTap[appId].state({ prevState: null, newState: appConfigObj.state, sequenceId: null });
		}
		/* END.DEV_ONLY */

		if (renderToString) {

			return renderString(
				this.appView[appId],
				this.runTime[appId],
				this.appGlobalActions[appId],
				appId,
				this.toStringAsyncResolve[appId]
			);
		}

		else if (this.process[appId] === 'hydrate') {

			// hydration only happens once - update 'process' to ensure dom is rendered on future state changes
			this.process[appId] = 'render';

			hydrateApp(
				this.appContainer[appId],
				this.appView[appId],
				this.runTime[appId],
				this.appGlobalActions[appId],
				this.appOnInit[appId],
				undefined, //	changedStateKeys
				undefined, //sequenceId
				true, // firstRender
				appId
			);
		}

		else {

			this.appContainer[appId].innerHTML = '';

			renderApp(
				this.appContainer[appId],
				this.appView[appId],
				this.runTime[appId],
				this.appGlobalActions[appId],
        this,
				this.appOnInit[appId],
				undefined, //	changedStateKeys
				undefined, //sequenceId
				true, // firstRender
				appId
			);
		}
	},

	initGlobalActions(actions, runTime) {
		return globalActions(actions, runTime);
	},

	handleSubs(subs, appId, isLocalSubs=false) {
    handleSubssciptions(subs, appId, isLocalSubs, this.appTap);
	},

	runHandleSubs(appId) {
		if (isFunction(this.appSubs[appId])) {
      this.handleSubs(this.appSubs[appId](this.runTime[appId].getState(), this.appGlobalActions[appId]), appId);
		}
	},

  runHandleLocalSubs(subs, appId) {
    this.handleSubs(subs, appId, true);
  },

	reRender(changedStateKeys, sequenceId, appId, sequenceCache, creatingHydrationLayer) {

		if (creatingHydrationLayer) {
			hydrateApp(
				this.appContainer[appId],
				this.appView[appId],
				this.runTime[appId],
				this.appGlobalActions[appId],
				this.appOnInit[appId],
				undefined, //	changedStateKeys
				undefined, // sequenceId
				true, // firstRender
				appId
			);
		}
		else if (this.process[appId] === 'render') {
			renderApp(
				this.appContainer[appId],
				this.appView[appId],
				this.runTime[appId],
				this.appGlobalActions[appId],
        this,
				undefined, //onInit
				changedStateKeys,
				sequenceId,
				false,  // firstRender
				appId,
				sequenceCache
			);
		}
		else if (this.renderToString[appId] && this.process[appId] === 'toStringAsync') {
			renderString(
				this.appView[appId],
				this.runTime[appId],
				this.appGlobalActions[appId],
				appId,
				this.toStringAsyncResolve[appId]
			);
		}
	}

}))();

