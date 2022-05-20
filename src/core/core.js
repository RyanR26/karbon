/* eslint-disable no-console */
import { subscription } from './subscription';
import { isDefined, isUndefined, isNullorUndef, isNull, isFunction, isString, isArray, isBrowser } from '../utils/utils';
import { createRunTime } from '../runTime/runTime';
import { renderApp, hydrateApp, renderString } from '../render/render';

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
				// this.toStringAsyncResolve = resolveInner;
				this.init(appConfig, true, 'toStringAsync', resolveInner);
			});
			this.toStringAsyncPromise.then(htmlString => {
				resolveOuter(htmlString);
			});
		});
	},

	init(appConfigObj, renderToString, process, asyncStringResolve) {

		this.appCounter ++;
		
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
			this.appTap[appId].state({prevState: null, newState: appConfigObj.state, sequenceId: null});
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
				this.appOnInit[appId],
				undefined, //	changedStateKeys
				undefined, //sequenceId
				true, // firstRender
				appId
			);
		}
		// }
	},

	initGlobalActions(actions, runTime) {

		const globalActions = {};

		const injectActions = actionsObj => {
			const actionsKeys = Object.keys(actionsObj);
			const actionsName = actionsKeys[0];
			globalActions[actionsName] = actionsObj[actionsName]({stamp: runTime.stamp, msgs: runTime.messages});
		};

		if (isDefined(actions)) {
			if (isArray(actions)) {
				for (let i = 0; i < actions.length; i++) {
					injectActions(actions[i]);
				}
			} else {
				injectActions(actions);
			}
			return globalActions;
		}
	},

	handleSubs(subs, appId) {

		/* START.DEV_ONLY */
		const subsStatus = [];
		/* END.DEV_ONLY */

		for (let i=0; i<subs.length; i++) {

			const sub = subs[i];
			const action = isArray(sub.action) ? sub.action[0] : sub.action;

			if (isUndefined(action.name)) {
				Object.defineProperty(action.prototype,'name',{
					get:function() {
						return /function ([^(]*)/.exec( this+'' )[1];
					}
				});
			} 

			const subId = sub.id || action.name + '_' + sub.name.toString().replace(/\s/g, '');

			/* START.DEV_ONLY */
			if (isNullorUndef(subId)) {
				console.warn('Please add an explicit id ({id: "identifierName"}) to subscription obj due to action.name not being supported by this browser');
			}
			/* END.DEV_ONLY */

			// function denoted user or custom sub
			if (isFunction(sub.name)) {

				sub.name({
					opts: sub.options, 
					action: action, 
					actionArgs: isArray(sub.action) ? sub.action.slice(1) : [], 
					condition: isNullorUndef(sub.when) ? true : sub.when, 
					subId: subId,
					subCache: subscription.getCache()
				});

				/* START.DEV_ONLY */
				if (isDefined(this.appTap[appId].subscriptions)) {
					subsStatus.push({name: sub.name.name, active: isNullorUndef(sub.when) ? true : sub.when, action: action.name });
				}
				/* END.DEV_ONLY */

			// string denotes event sub
			} else if (isString(sub.name)) {

				if (sub.when || isUndefined(sub.when)) {
					if (isDefined(sub.name)) {
						if (!isDefined(subscription.getCache()[subId])) {

							subscription.add(
								sub.el || window,
								sub.name,
								subId,
								action,
								isArray(sub.action) ? sub.action.slice(1) : undefined
							);
						}
					}
					else {
						// this subscription action is called whenever the state changes
						if (isArray(sub.action)) {
							sub.action[0](...sub.action.slice(1));
						} else {
							sub.action();
						}
					}

					/* START.DEV_ONLY */
					if (isDefined(this.appTap[appId].subscriptions)) {
						subsStatus.push({name: sub.name, active: true, action: action.name});
					}
					/* END.DEV_ONLY */

				} else if (!sub.when) {
					if (isDefined(sub.name)) {
						if (isDefined(subscription.getCache()[subId])) {
							subscription.remove(
								sub.el || window,
								sub.name,
								subId
							);
						}
					}

					/* START.DEV_ONLY */
					if (isDefined(this.appTap[appId].subscriptions)) {
						subsStatus.push({name: sub.name, active: false, action: action.name});
					}
					/* END.DEV_ONLY */
				}
			}
		}

		/* START.DEV_ONLY */
		if (isDefined(this.appTap[appId].subscriptions)) {
			this.appTap[appId].subscriptions({subs: subsStatus});
		}
		/* END.DEV_ONLY */
	},

	runHandleSubs(appId) {
		if (isFunction(this.appSubs[appId])) {
			this.handleSubs(this.appSubs[appId](this.runTime[appId].getState(), this.appGlobalActions[appId]), appId);
		}
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

