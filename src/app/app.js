/* eslint-disable no-console */
import { subscription } from './subscription';
import { isDefined, isUndefined, isNullorUndef, isFunction, isString, isArray } from '../utils/utils';
import { createRunTime } from '../runTime/runTime';
import { renderApp, renderString } from '../render/render';

export const karbon = (() => ({

	run(...appConfig) {
		this.init(appConfig, false);
	},

	toString(...appConfig) {
		return this.init(appConfig, true);
	},

	toStringAsync(...appConfig) {

		this.toStringAsyncResolve;
		this.toStringAsyncPromise;

		return new Promise(resolveOuter => {

			this.toStringAsyncPromise = new Promise(resolveInner => {
				this.toStringAsyncResolve = resolveInner;
				this.init(appConfig, true);
			});
  
			this.toStringAsyncPromise.then(htmlString => {
				resolveOuter(htmlString);
			});

		});
	},

	init(appConfig, renderToString) {

		this.runTime = {};
		this.appRootComponent = {};
		this.appRootActions = {};
		this.appContainer = {};
		this.appView = {};
		this.appGlobalActions = {};
		this.appRootSubscribe = {};
		this.appSubs = {};
		this.appFx = {};
		this.appOnInit = {};
		this.renderToString = renderToString;

		/* START.DEV_ONLY */
		this.appTap = {};
		/* END.DEV_ONLY */

		for (let i=0; i<appConfig.length; i++) {

			const appConfigObj = appConfig[i];
			const appId = i;
			const lastFirstRender = i === appConfig.length - 1;
			
			this.appContainer[appId] = appConfigObj.container;
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
			this.runHandleSubs(appId);

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
					this.appOnInit[appId],
					appId
				);

			} else {

				appConfigObj.container.innerHTML = '';

				renderApp(
					this.appContainer[appId],
					this.appView[appId],
					this.runTime[appId],
					this.appGlobalActions[appId],
					this.appOnInit[appId],
					undefined,
					undefined,
					true,
					lastFirstRender,
					appId
				);
			}
		}
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

	reRender(changedStateKeys, sequenceId, appId, sequenceCache) {

		if (this.renderToString) {
			this.toStringAsyncOut = renderString(
				this.appView[appId],
				this.runTime[appId],
				this.appGlobalActions[appId],
				this.appOnInit[appId],
				appId,
				this.toStringAsyncResolve
			);
		} else {
			renderApp(
				this.appContainer[appId],
				this.appView[appId],
				this.runTime[appId],
				this.appGlobalActions[appId],
				undefined,
				changedStateKeys,
				sequenceId,
				false,
				undefined,
				appId,
				sequenceCache
			);
		}

	}
  
}))();

