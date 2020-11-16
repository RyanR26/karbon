/* eslint-disable no-console */
import { randomStringId, isDefined, isUndefined, isArray, isFunction, isNullorUndef, isNotNull, isNull, isNumber } from '../utils/utils';
import { virtualDom } from '../vdom/vDomState';

export const createRunTime = (app, appId) => {

	let appState;
	let appFx = app.appFx[appId];
	/* START.DEV_ONLY */
	let appTap = app.appTap[appId] || {};
	/* END.DEV_ONLY */
	let sequenceCounter = 0;
	const updatesQueue = {};
	const callbacks = {};
	const _ = undefined;

	const setState = state => {
		appState = state;
	};

	const getState = () => appState;
	
	const updateMethods = (() => {
		
		let callbackData = null;
		let sequenceCompleted = null;
		let stampId;
		let cache;

		const stamp = data => {
			stampId = data.id;
			cache = data.cache;
			return {
				msgs: messages
			};
		};

		const messages = (...msgs) => {
			callbackData = null;
			sequenceCounter ++;
			const sequenceId = (stampId || randomStringId()) + '_' + sequenceCounter ;
			const sequenceCache = Object.assign({}, cache);
			cache = undefined;
			stampId = undefined;
      
      
			/* START.DEV_ONLY */
			if (isDefined(appTap.dispatch)) appTap.dispatch({msgs, sequenceId});
			/* END.DEV_ONLY */
			
			window.setTimeout(() => {
				createSequenceArray(sequenceId, msgs, sequenceCache);
			}, 0);

			return { 
				done: done(sequenceId)
			};
		};

		const done = sequenceId => callback => {
			if (isNull(callbackData)) {
				callbacks[sequenceId] = callback;
			} else {
				delete updatesQueue[sequenceId];
				callback(callbackData, sequenceCompleted);
			}
		};
		
		const setCallbackData = (data, didComplete) => {
			callbackData = data;
			sequenceCompleted = didComplete;
		};

		return {
			stamp,
			messages,
			setCallbackData
		};
	})();

	const createSequenceArray = (sequenceId, msgs, sequenceCache) => {
		updatesQueue[sequenceId] = [];
		for (let i = 1; i < msgs.length; i++) {
			updatesQueue[sequenceId][i-1] = msgs[i];
		}
		processMsg(sequenceId, msgs[0], _, sequenceCache);
	};

	const exeQueuedMsgs = (data, sequenceId, sequenceCompleted = true, sequenceCache) => {

		if (isDefined(sequenceId)) {

			if (updatesQueue[sequenceId].length > 0) {
				processMsg(sequenceId, updatesQueue[sequenceId].shift(), data, sequenceCache);
			} 
			else {
				delete updatesQueue[sequenceId];
				if (isFunction(callbacks[sequenceId])) {
					const callbacksClone = Object.assign({}, callbacks);
					delete callbacks[sequenceId];
					callbacksClone[sequenceId](data, sequenceCompleted);
					
				} else {
					updateMethods.setCallbackData(data, sequenceCompleted);
				}
			}
		} 
	};

	const processMsg = (sequenceId, msg, data, sequenceCache) => {
		
		let msgArray = !isFunction(msg) ?
			msg :
			isDefined(data) ?
				msg(data === 'undefined' ? undefined : data, getState(), sequenceCache) :
				msg(getState(), sequenceCache);
        
		// allow for conditional msgs
		if (isNull(msgArray)) {
			exeQueuedMsgs(null, sequenceId, _, sequenceCache);
		} 
		else if (isUndefined(msgArray)) {
			exeQueuedMsgs('undefined', sequenceId, _, sequenceCache);
		}
		else {

			const msgPayload = msgArray[1];
			const renderFlags = msgArray[2] || {};

			/* START.DEV_ONLY */
			if (isDefined(appTap.message))	appTap.message({msg: msgArray, sequenceId});
			/* END.DEV_ONLY */
			
			// msgArray[0] === msgType
			switch (msgArray[0]) {

			case 'state': {

				if (isDefined(renderFlags.syncNodes)) {
					virtualDom.setSync(false);
				} else {
					virtualDom.setSync(true);
				}
				if (isDefined(renderFlags.maxDomUpdates)) {
					virtualDom.constrainDomUpdates(renderFlags.maxDomUpdates);
				} else {
					virtualDom.constrainDomUpdates(false);
				}

				runUpdate(msgPayload, sequenceId, renderFlags.preventRender ? true : false, sequenceCache); 
			}
				break;

			case 'effect': {

				const effectCacheKey = msgPayload.cache;
				const effectName = msgPayload.name || msgPayload.def;
				const effectFun = isFunction(effectName) ?
					effectName :
					isDefined(appFx[effectName]) ?
						appFx[effectName] :
						() => console.warn(`no effect '${effectName}' registered`);
        
				const effectOutput = isArray(msgPayload.args) ?
					effectFun(...msgPayload.args) :
					effectFun(msgPayload.args);

				if (effectOutput instanceof Promise) {
					Promise.resolve(effectOutput).then(response => {
						if (isDefined(effectCacheKey)) sequenceCache[effectCacheKey] = response;
						exeQueuedMsgs(response, sequenceId, _, sequenceCache);
					}).catch(error => {
						if (isDefined(effectCacheKey)) sequenceCache[effectCacheKey] = error;
						exeQueuedMsgs({ error: true, errorMsg: error }, sequenceId, _, sequenceCache);
					});
				} else {
					if (effectOutput === '_break_') {
						// returning '_break_ 'breaks the entire sequence - akin
						// to what would happen if you returned out of a function.
						// done callback will not be fired
						updatesQueue[sequenceId] = [];
					} else {
						if (isDefined(effectCacheKey)) sequenceCache[effectCacheKey] = effectOutput;
						exeQueuedMsgs(effectOutput, sequenceId, _, sequenceCache);
					}
				}
			}
				break;

			case 'pipe': {

				const processes = msgPayload;
				const firstOutput = processes[0];
				let pipedOutput = null;

				if (processes.length < 2) {
					pipedOutput = firstOutput;
				} else {
					for (let i = 1; i < processes.length; i++) {
						pipedOutput = i === 1 ? processes[i](firstOutput) : processes[i](pipedOutput);
					}
				}
				exeQueuedMsgs(pipedOutput, sequenceId, _, sequenceCache);
			}
				break;

			case 'control':

				if (msgPayload.if || msgPayload.continue || isNumber(msgPayload.continue)) {
					if (!msgPayload.if && isNumber(msgPayload.continue)) {
						updatesQueue[sequenceId].length = msgPayload.continue;
					}
					exeQueuedMsgs(msgPayload.if ? msgPayload.isTrue : msgPayload.isFalse , sequenceId, _, sequenceCache);
				} else {
					updatesQueue[sequenceId] = [];
					if (msgPayload.break) {
						delete callbacks[sequenceId];
					} else {
						exeQueuedMsgs(msgPayload.isFalse, sequenceId, false, sequenceCache);
					}
				}
				
				break;
			
			case 'cancel': {
					
				const findObjKeyByPrefix = id => {
					let didFind = false;
					for (let prop in updatesQueue) {
            console.log(prop, id)
						if (prop.indexOf(id) === 0) {
							didFind = true;
							updatesQueue[prop] = [];
							delete callbacks[prop];
						}
					}
					if (!didFind) {
						for (let prop in callbacks) {
							if (prop.indexOf(id) === 0) {
								delete callbacks[prop];
							}
						}
					}
				};
				
				const id = msgPayload.id;
		
				if (isDefined(id)) {
					if (isArray(id)) {
						for (let i = 0; i < id.length; i++) {
							findObjKeyByPrefix(id);
						}
					} else {
						findObjKeyByPrefix(id);
					}
					exeQueuedMsgs(undefined, sequenceId);
				}
				/* START.DEV_ONLY */
				else {
					console.warn('id of process to cancel is not defined');
				}
				/* END.DEV_ONLY */
			}
				break;
				
			/* START.DEV_ONLY */
			default:
				console.warn(`Message type '${msgArray[0]}' is not valid. Valid types = 'state', 'effect', 'control', 'pipe' and 'cancel'`);
					
			/* END.DEV_ONLY */
			}
		}
	};
  
	const updateState = (obj, path, value = null, action = 'default', add = 0, remove = 0) => {

		//if path has no keys replace whole state with new value
		if (isUndefined(path)) {
			setState(value);
			return;
		}

		// work on arrays
		if (path.length == 2) {
			// Updating exsiting value. Call funct again. Dont proceed.
			if (action === 'default') {
				return updateState(obj[path[0]], path.slice(1), value, action, add, remove);
			}
			///////////////////////////////////

			const data = obj[path[0]];
			if (isNullorUndef(data)) throw new Error(`Karbon - cannot modify undefined array "${path[0]}".`);

			if (action === 'splice') {

				const index = path[1];

				// add multiple paramters to array (and remove)
				if (add > 1) {
					const args = [index, remove];
					// if multiple values are provided as an array
					if (isArray(value)) {
						for (let i = 0; i < value.length; i++) {
							args[args.length] = value[i];
						}
						// if only one value is provided but must be added more than 1 time
						// use the same value.
					} else {
						for (let i = 0; i < add; i++) {
							args[args.length] = value;
						}
					}
					// if(data[index] == undefined) throw new Error(`Karbon - cannot add/remove. Array "${path[0]}" does not contain item at position "${index}".`);
					data.splice.apply(data, args);
				} else {
					// add one paramter to array (and remove)
					if (isNotNull(value)) {
						// if(data[index] == undefined) throw new Error(`Karbon - cannot add/remove. Array "${path[0]}" does not contain item at position "${index}".`);
						data.splice(index, remove, value);
						// only remove parameter/s from array
					} else {
						if (isNullorUndef(data[index])) throw new Error(`Karbon - cannot remove. Array "${path[0]}" does not contain item at position "${index}".`);
						data.splice(index, remove);
					}
				}
			}

			// delete object key
			else if (action === 'delete') {
				const key = path[1];
				if (isNullorUndef(data[key])) throw new Error(`Karbon - cannot delete undefined obj key "${key}". Check that it wasn't removed in a previous action.`);
				delete data[key];
			}
		} else if (path.length == 1) {
			const key = path[0];
			// update multiple props in one object
			if (isArray(key)) {
				for (let i = 0; i < key.length; i++) {
					if (isArray(value)) {
						// update each prop with a corresponding value from value array
						obj[key[i]] = value[i];
					} else {
						// update each prop with the same fixed string value
						obj[key[i]] = value;
					}
				}
			} else {
				// update one prop in one object
				return obj[key] = value;
			}
		} else if (path.length == 0) {
			return obj;
		} else {
			return updateState(obj[path[0]], path.slice(1), value, action, add, remove);
		}
	};


	const runUpdate = (payload, sequenceId, preventRender, sequenceCache) => {

		/// update state obj and rerender  ///
		///////////////////////////////////// 

		/* START.DEV_ONLY */
		let prevState;
		/* END.DEV_ONLY */
    
		const changedStateKeys = isArray(payload) ? 
			[] : 
			isDefined(payload.path) ? 
				payload.path[0] : 
				undefined;
        
		/* START.DEV_ONLY */
		if (isDefined(appTap.state)) prevState = JSON.stringify(appState);
		/* END.DEV_ONLY */

		if (isArray(payload)) {
			for(let i = 0; i < payload.length; i++) {
				const payloadObj = payload[i];
				updateState(appState, payloadObj.path, payloadObj.value, payloadObj.action, payloadObj.add, payloadObj.remove);
				changedStateKeys[i] = payloadObj.path[0];
			}
		} 
		else {
			updateState(appState, payload.path, payload.value, payload.action, payload.add, payload.remove);
		}
    
		/* START.DEV_ONLY */
		if (isDefined(appTap.state)) appTap.state({prevState: JSON.parse(prevState), newState: appState, sequenceId});
		/* END.DEV_ONLY */

		// run subrciptions function every time state changes. Even with no render
		app.runHandleSubs(appId);

		if (!preventRender)  {
			app.reRender(changedStateKeys, sequenceId, appId, sequenceCache);
		} else {
			exeQueuedMsgs(undefined, sequenceId, _, sequenceCache);
		}

	};

	return {
		setState,
		getState,
		exeQueuedMsgs,
		stamp: updateMethods.stamp,
		messages : updateMethods.messages
	};
};