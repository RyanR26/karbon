var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var subscription = function () {

	var cache = {};

	var getCache = function getCache() {
		return cache;
	};

	var add = function add(el, eventName, functRef, funct) {
		var args = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

		args = args || [];
		cache[functRef] = function (event) {
			funct.apply(null, [].concat(toConsumableArray(args), [event]));
		};
		el.addEventListener(eventName, cache[functRef]);
	};

	var remove = function remove(el, eventName, functRef) {
		el.removeEventListener(eventName, cache[functRef]);
		cache[functRef] = undefined;
	};

	return {
		add: add,
		remove: remove,
		getCache: getCache
	};
}();

/// UTILITIES ///

var isUndefined = function isUndefined(value) {
	return value === void 0;
};

var isDefined = function isDefined(value) {
	return value !== void 0;
};

var isNull = function isNull(value) {
	return value === null;
};

var isNotNull = function isNotNull(value) {
	return value !== null;
};

var isNullorUndef = function isNullorUndef(value) {
	return isUndefined(value) || isNull(value);
};

var isNotNullandIsDef = function isNotNullandIsDef(value) {
	return value !== null && value !== void 0;
};

var isFalse = function isFalse(value) {
	return value === false;
};

var isNotFalse = function isNotFalse(value) {
	return value !== false;
};

var isFunction = function isFunction(value) {
	return typeof value === 'function';
};

var isObject = function isObject(value) {
	return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
};

var isArray = function isArray(value) {
	return isNull(value) ? false : isObject(value) && isDefined(value.length);
};

var isNumber = function isNumber(value) {
	return typeof value === 'number';
};

var isString = function isString(value) {
	return typeof value === 'string';
};

var randomStringId = function randomStringId() {
	return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
};

var arraysAreEqual = function arraysAreEqual(arr1, arr2) {
	var arr1Length = arr1.length;
	var arr2Length = arr2.length;
	if (arr1Length !== arr2Length) return false;
	for (var i = 0; i < arr1Length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
};

var isArr = Array.isArray;
var keyList = Object.keys;
var hasProp = Object.prototype.hasOwnProperty;

var objsAreEqual = function objsAreEqual(a, b) {
	if (a === b) return true;

	if (a && b && (typeof a === 'undefined' ? 'undefined' : _typeof(a)) == 'object' && (typeof b === 'undefined' ? 'undefined' : _typeof(b)) == 'object') {
		var arrA = isArr(a);
		var arrB = isArr(b);
		var i = void 0;
		var length = void 0;
		var key = void 0;

		if (arrA && arrB) {
			length = a.length;
			if (length != b.length) return false;
			for (i = length; i-- !== 0;) {
				if (!objsAreEqual(a[i], b[i])) return false;
			}return true;
		}

		var keys = keyList(a);
		length = keys.length;

		if (length !== keyList(b).length) return false;

		for (i = length; i-- !== 0;) {
			if (!hasProp.call(b, keys[i])) return false;
		}for (i = length; i-- !== 0;) {
			key = keys[i];
			if (!objsAreEqual(a[key], b[key])) return false;
		}

		return true;
	}

	return a !== a && b !== b;
};

/* START.DEV_ONLY */

var checkPropTypes = function checkPropTypes(props, propTypes, componentName) {

	var propTypeFailed = function propTypeFailed(key, value, componentName) {
		// eslint-disable-next-line no-console
		console.warn('prop type of \'' + key + '\' in component \'' + componentName + '\' is incorrect. Got \'' + _typeof(props[key]) + '\' when should be \'' + value + '\'');
	};

	if (isDefined(propTypes)) {
		for (var key in propTypes) {
			var value = propTypes[key];
			if (value === 'array') {
				if (!isArray(props[key])) {
					propTypeFailed(key, value, componentName);
				}
			} else if (value !== _typeof(props[key])) {
				propTypeFailed(key, value, componentName);
			}
		}
	}
};

var propTypes = {
	string: 'string',
	number: 'number',
	boolean: 'boolean',
	array: 'array',
	object: 'object',
	function: 'function',
	bigint: 'bigint',
	undefined: 'undefined'
};

// requestAnimationFrame() shim by Paul Irish
window.requestAnimFrame = function () {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function ( /* function */callback) {
		window.setTimeout(callback, 1000 / 60);
	};
}();

/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 */

window.requestTimeout = function (fn, delay) {
	if (!window.requestAnimationFrame && !window.webkitRequestAnimationFrame && !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
	!window.oRequestAnimationFrame && !window.msRequestAnimationFrame) return window.setTimeout(fn, delay);

	var start = new Date().getTime(),
	    handle = new Object();

	function loop() {
		var current = new Date().getTime(),
		    delta = current - start;

		delta >= delay ? fn.call() : handle.value = window.requestAnimFrame(loop);
	}

	handle.value = window.requestAnimFrame(loop);
	return handle;
};

/**
 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {int|object} fn The callback function
 */
window.clearRequestTimeout = function (handle) {
	window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) : window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) : window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
	window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) : window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) : window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) : clearTimeout(handle);
};

var virtualDom = function () {

	var initialized = false;
	var syncNodes = true;
	var domUpdatesLimit = false;

	var isInitialized = function isInitialized() {
		return initialized;
	};

	var setInitialized = function setInitialized(value) {
		return initialized = value;
	};

	var requiresSync = function requiresSync() {
		return syncNodes;
	};

	var setSync = function setSync(value) {
		return syncNodes = value;
	};

	var constrainDomUpdates = function constrainDomUpdates(value) {
		return domUpdatesLimit = value;
	};

	var getDomUpdatesLimit = function getDomUpdatesLimit() {
		return domUpdatesLimit;
	};

	return {
		isInitialized: isInitialized,
		setInitialized: setInitialized,
		requiresSync: requiresSync,
		setSync: setSync,
		constrainDomUpdates: constrainDomUpdates,
		getDomUpdatesLimit: getDomUpdatesLimit
	};
}();

/* eslint-disable no-console */

var createRunTime = function createRunTime(app, appId) {

	var appState = void 0;
	var appFx = app.appFx[appId];
	/* START.DEV_ONLY */
	var appTap = app.appTap[appId] || {};
	/* END.DEV_ONLY */
	var sequenceCounter = 0;
	var updatesQueue = {};
	var callbacks = {};

	var setState = function setState(state) {
		appState = state;
	};

	var getState = function getState() {
		return appState;
	};

	var updateMethods = function () {

		var callbackData = null;
		var sequenceCompleted = null;
		var stampId = void 0;
		var priority = void 0;

		var stamp = function stamp(data) {
			stampId = data.id;
			priority = data.priority;
			return {
				msgs: messages
			};
		};

		var messages = function messages() {
			for (var _len = arguments.length, msgs = Array(_len), _key = 0; _key < _len; _key++) {
				msgs[_key] = arguments[_key];
			}

			callbackData = null;
			sequenceCounter++;
			var sequenceId = (stampId || randomStringId()) + '_' + sequenceCounter;
			var priorityDispatch = priority ? true : false;
			stampId = undefined;

			/* START.DEV_ONLY */
			if (isDefined(appTap.dispatch)) {
				appTap.dispatch({ msgs: msgs, sequenceId: sequenceId });
			}
			/* END.DEV_ONLY */

			window.requestTimeout(function () {
				createSequenceArray(sequenceId, msgs, priorityDispatch);
			}, 0);

			return {
				done: done(sequenceId, priorityDispatch)
			};
		};

		var done = function done(sequenceId) {
			return function (callback) {
				if (isNull(callbackData)) {
					callbacks[sequenceId] = callback;
				} else {
					delete updatesQueue[sequenceId];
					callback(callbackData, sequenceCompleted);
				}
			};
		};

		var setCallbackData = function setCallbackData(data, didComplete) {
			callbackData = data;
			sequenceCompleted = didComplete;
		};

		return {
			stamp: stamp,
			messages: messages,
			setCallbackData: setCallbackData
		};
	}();

	var createSequenceArray = function createSequenceArray(sequenceId, msgs) {
		updatesQueue[sequenceId] = [];
		for (var i = 1; i < msgs.length; i++) {
			updatesQueue[sequenceId][i - 1] = msgs[i];
		}
		processMsg(sequenceId, msgs[0]);
	};

	var exeQueuedMsgs = function exeQueuedMsgs(data, sequenceId) {
		var sequenceCompleted = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;


		if (isDefined(sequenceId)) {

			if (updatesQueue[sequenceId].length > 0) {
				// const msg = updatesQueue[sequenceId].shift();
				processMsg(sequenceId, updatesQueue[sequenceId].shift(), data);
			} else {
				delete updatesQueue[sequenceId];
				if (isFunction(callbacks[sequenceId])) {
					var callbacksClone = Object.assign({}, callbacks);
					delete callbacks[sequenceId];
					callbacksClone[sequenceId](data, sequenceCompleted);
				} else {
					updateMethods.setCallbackData(data, sequenceCompleted);
				}
			}
		}
	};

	var processMsg = function processMsg(sequenceId, msg, data) {

		var msgArray = !isFunction(msg) ? msg : isDefined(data) ? msg(data, getState()) : msg(getState());

		// allow for conditional msgs
		if (isNull(msgArray)) {
			exeQueuedMsgs(undefined, sequenceId);
		} else {

			var msgPayload = msgArray[1];
			var renderFlags = msgArray[2] || {};

			/* START.DEV_ONLY */
			if (isDefined(appTap.message)) {
				appTap.message({ msg: msgArray, sequenceId: sequenceId });
			}
			/* END.DEV_ONLY */

			// msgArray[0] === msgType
			switch (msgArray[0]) {

				case 'state':
					{

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

						updateState(msgPayload, sequenceId, renderFlags.preventRender ? true : false);
					}
					break;

				case 'effect':
					{

						var effectName = msgPayload.name;
						var effectFun = isFunction(effectName) ? effectName : isDefined(appFx[effectName]) ? appFx[effectName] : function () {
							return console.warn('no effect \'' + effectName + '\' registered');
						};

						var effectOutput = isArray(msgPayload.args) ? effectFun.apply(undefined, toConsumableArray(msgPayload.args)) : effectFun(msgPayload.args);

						if (effectOutput instanceof Promise) {
							Promise.resolve(effectOutput).then(function (response) {
								exeQueuedMsgs(response, sequenceId);
							}).catch(function (error) {
								exeQueuedMsgs({ error: true, errorMsg: error }, sequenceId);
							});
						} else {
							if (effectOutput === '_break_') {
								// returning '_break_ 'breaks the entire sequence - akin
								// to what would happen if you returned out of a function.
								// done callback will not be fired
								updatesQueue[sequenceId] = [];
							} else {
								exeQueuedMsgs(effectOutput, sequenceId);
							}
						}
					}
					break;

				case 'pipe':
					{

						var processes = msgPayload;
						var firstOutput = processes[0];
						var pipedOutput = null;

						if (processes.length < 2) {
							pipedOutput = firstOutput;
						} else {
							for (var i = 1; i < processes.length; i++) {
								pipedOutput = i === 1 ? processes[i](firstOutput) : processes[i](pipedOutput);
							}
						}
						exeQueuedMsgs(pipedOutput, sequenceId);
					}
					break;

				case 'control':

					if (msgPayload.if || msgPayload.continue || isNumber(msgPayload.continue)) {
						if (!msgPayload.if && isNumber(msgPayload.continue)) {
							updatesQueue[sequenceId].length = msgPayload.continue;
						}
						exeQueuedMsgs(msgPayload.if ? msgPayload.isTrue : msgPayload.isFalse, sequenceId);
					} else {
						updatesQueue[sequenceId] = [];
						if (msgPayload.break) {
							delete callbacks[sequenceId];
						} else {
							exeQueuedMsgs(msgPayload.isFalse, sequenceId, false);
						}
					}

					break;

				case 'cancel':
					{

						var findObjKeyByPrefix = function findObjKeyByPrefix(id) {
							var didFind = false;
							for (var prop in updatesQueue) {
								if (prop.indexOf(id) === 0) {
									didFind = true;
									updatesQueue[prop] = [];
									delete callbacks[prop];
								}
							}
							if (!didFind) {
								for (var _prop in callbacks) {
									if (_prop.indexOf(id) === 0) {
										delete callbacks[_prop];
									}
								}
							}
						};

						var id = msgPayload.id;

						if (isDefined(id)) {
							if (isArray(id)) {
								for (var _i = 0; _i < id.length; _i++) {
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
					console.warn('Message type \'' + msgArray[0] + '\' is not valid. Valid types = \'state\', \'effect\', \'control\', \'pipe\' and \'cancel\'');

				/* END.DEV_ONLY */
			}
		}
	};

	var updateState = function updateState(payload, sequenceId, preventRender) {

		var updateStateObj = function updateStateObj(obj, path) {
			var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
			var action = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'default';
			var add = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
			var remove = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;


			//if path has no keys replace whole state with new value
			if (isUndefined(path)) {
				setState(value);
				return;
			}

			// work on arrays
			if (path.length == 2) {
				// Updating exsiting value. Call funct again. Dont proceed.
				if (action === 'default') {
					return updateStateObj(obj[path[0]], path.slice(1), value, action, add, remove);
				}
				///////////////////////////////////

				var data = obj[path[0]];
				if (isNullorUndef(data)) throw new Error('Karbon - cannot modify undefined array "' + path[0] + '".');

				if (action === 'splice') {

					var index = path[1];

					// add multiple paramters to array (and remove)
					if (add > 1) {
						var args = [index, remove];
						// if multiple values are provided as an array
						if (isArray(value)) {
							for (var i = 0; i < value.length; i++) {
								args[args.length] = value[i];
							}
							// if only one value is provided but must be added more than 1 time
							// use the same value.
						} else {
							for (var _i2 = 0; _i2 < add; _i2++) {
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
							if (isNullorUndef(data[index])) throw new Error('Karbon - cannot remove. Array "' + path[0] + '" does not contain item at position "' + index + '".');
							data.splice(index, remove);
						}
					}
				}

				// delete object key
				else if (action === 'delete') {
						var key = path[1];
						if (isNullorUndef(data[key])) throw new Error('Karbon - cannot delete undefined obj key "' + key + '". Check that it wasn\'t removed in a previous action.');
						delete data[key];
					}
			} else if (path.length == 1) {
				var _key2 = path[0];
				// update multiple props in one object
				if (isArray(_key2)) {
					var multipleValues = isArray(value) ? true : false;
					for (var _i3 = 0; _i3 < _key2.length; _i3++) {

						if (multipleValues) {
							// update each prop with a corresponding value from value array
							obj[_key2[_i3]] = value[_i3];
						} else {
							// update each prop with the same fixed string value
							obj[_key2[_i3]] = value;
						}
					}
				} else {
					// update one prop in one object
					return obj[_key2] = value;
				}
			} else if (path.length == 0) {
				return obj;
			} else {
				return updateStateObj(obj[path[0]], path.slice(1), value, action, add, remove);
			}
		};

		/// update state obj and rerender  ///
		///////////////////////////////////// 

		var changedStateKeys = isArray(payload) ? [] : isDefined(payload.path) ? payload.path[0] : undefined;

		if (isArray(payload)) {
			var prevState = void 0;

			/* START.DEV_ONLY */
			if (isDefined(appTap.state)) {
				prevState = JSON.stringify(appState);
			}
			/* END.DEV_ONLY */

			for (var i = 0; i < payload.length; i++) {
				var payloadObj = payload[i];
				updateStateObj(appState, payloadObj.path, payloadObj.value, payloadObj.action, payloadObj.add, payloadObj.remove);
				changedStateKeys[i] = payloadObj.path[0];
			}
			/* START.DEV_ONLY */
			if (isDefined(appTap.state)) {
				appTap.state({ prevState: JSON.parse(prevState), newState: appState, sequenceId: sequenceId });
			}
			/* END.DEV_ONLY */
		} else {

			var _prevState = void 0;

			/* START.DEV_ONLY */
			if (isDefined(appTap.state)) {
				_prevState = JSON.stringify(appState);
			}
			/* END.DEV_ONLY */

			updateStateObj(appState, payload.path, payload.value, payload.action, payload.add, payload.remove);

			/* START.DEV_ONLY */
			if (isDefined(appTap.state)) {
				appTap.state({ prevState: JSON.parse(_prevState), newState: appState, sequenceId: sequenceId });
			}
			/* END.DEV_ONLY */
		}

		// run subrciptions function every time state changes. Even with no render
		app.runHandleSubs(appId);

		if (!preventRender) {
			app.reRender(changedStateKeys, sequenceId, appId);
		} else {
			exeQueuedMsgs(undefined, sequenceId);
		}
	};

	return {
		setState: setState,
		getState: getState,
		exeQueuedMsgs: exeQueuedMsgs,
		stamp: updateMethods.stamp,
		messages: updateMethods.messages
	};
};

var voidedElements = {
	area: true,
	base: true,
	br: true,
	col: true,
	embed: true,
	hr: true,
	img: true,
	input: true,
	keygen: true,
	link: true,
	meta: true,
	param: true,
	source: true,
	track: true,
	wbr: true,
	animate: true,
	animateTransform: true,
	circle: true,
	'color-profile': true,
	ellipse: true,
	feBlend: true,
	feColorMatrix: true,
	feComposite: true,
	feConvolveMatrix: true,
	feDisplacementMap: true,
	feDistantLight: true,
	feFlood: true,
	feGaussianBlur: true,
	feImage: true,
	feMergeNode: true,
	feMorphology: true,
	feOffset: true,
	fePointLight: true,
	feSpotLight: true,
	feTile: true,
	feTurbulence: true,
	'font-face-name': true,
	image: true,
	line: true,
	mpath: true,
	path: true,
	polygon: true,
	polyline: true,
	set: true,
	stop: true,
	use: true,
	view: true,
	rect: true
};

var elProps = void 0;

var createVNode = function createVNode(type, parentComponentIndex, data, level) {
	var key = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
	var staticChildren = arguments[5];
	var parentComponent = arguments[6];
	var subscribesTo = arguments[7];
	var renderingSvg = arguments[8];


	var props = {};

	elProps = Object.keys(data);

	for (var i = 0; i < elProps.length; i++) {
		var prop = elProps[i];
		var value = data[prop];
		props[prop] = isNull(value) ? '' : prop !== 'innerHTML' ? value : '<span data="untracked-nodes">' + value + '</span>';
	}

	return {
		type: type,
		lang: renderingSvg ? 'xml' : 'html',
		props: props,
		level: level,
		key: key,
		staticChildren: staticChildren,
		keyedAction: null,
		keyedChildren: null,
		parentComponent: parentComponent,
		parentComponentIndex: parentComponentIndex,
		subscribesTo: subscribesTo,
		dom: null
	};
};

var actionsCache = {};

var nodeBuilder = function nodeBuilder(runTime, appGlobalActions) {

	var vDomNodesArray = [];
	var componentActiveArray = [];
	var componentActiveIndexArray = [];
	var subscribesToArray = [];
	var keyedNodes = {};
	var keyedNodesPrev = void 0;
	var keyName = void 0;
	var isKeyed = false;
	var keyedParentLevel = void 0;
	var keyedParent = void 0;
	var vNode = void 0;
	var rootIndex = 1;
	var renderingSvg = false;

	var getVDomNodesArray = function getVDomNodesArray() {
		return vDomNodesArray;
	};

	var getKeyedNodes = function getKeyedNodes() {
		return keyedNodes;
	};

	var getKeyedNodesPrev = function getKeyedNodesPrev() {
		return keyedNodesPrev;
	};

	var setKeyedNodesPrev = function setKeyedNodesPrev() {
		keyedNodesPrev = Object.assign({}, keyedNodes);
		// reset keyeNodes Obj instead of creating new one
		var keys = Object.keys(keyedNodes);
		for (var i = 0; i < keys.length; i++) {
			delete keyedNodes[keys[i]];
		}
	};

	var resetVDomNodesArray = function resetVDomNodesArray() {
		vDomNodesArray.length = 0;
	};

	var nodeClose = function nodeClose(el) {
		rootIndex--;
		if (el === 'svg' || el === '/svg') renderingSvg = false;
	};

	var nodeOpen = function nodeOpen(el) {
		var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		var flags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { key: false, staticChildren: false };


		if (el === 'svg') renderingSvg = true;

		// Dont cache args as vars as more performant - less garbage collection
		// createElementObj args are :
		// const createElementObj = (type, parentComponentIndex, id, data, level, key, parentComponentName, subscribesTo)
		keyName = flags.key;
		isKeyed = keyName !== false;

		vNode = createVNode(el, componentActiveIndexArray[componentActiveIndexArray.length - 1], data, rootIndex, keyName, flags.staticChildren, componentActiveArray[componentActiveArray.length - 1], subscribesToArray[subscribesToArray.length - 1], renderingSvg);

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

		if (!voidedElements[el]) {
			rootIndex++;
		}
	};

	var renderRootComponent = function renderRootComponent(comp, data) {
		// Render all components top down from root
		component(comp, data);
	};

	var component = function component(comp) {
		var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


		var viewRef = Object.keys(comp)[0];
		var view = comp[viewRef];
		var index = isUndefined(data.index) ? 0 : data.index;

		componentActiveArray[componentActiveArray.length] = viewRef;
		componentActiveIndexArray[componentActiveIndexArray.length] = index;

		////////////////////////////////////////////////////////////////////////////
		/// actions ///
		/// if defined inject actions function into component ///
		////////////////////////////////////////////////////////////////////////////

		var localActions = void 0;
		var dataActions = data.actions;

		var createActions = function createActions(actionsObj) {
			var actionsName = Object.keys(actionsObj)[0];

			if (isDefined(actionsCache[actionsName])) {
				localActions[actionsName] = actionsCache[actionsName];
			} else {
				localActions[actionsName] = actionsObj[actionsName]({ stamp: runTime.stamp, msgs: runTime.messages });
				actionsCache[actionsName] = localActions[actionsName];
			}
		};

		if (isDefined(dataActions)) {
			localActions = {};
			if (isArray(dataActions)) {
				for (var i = 0; i < dataActions.length; i++) {
					createActions(dataActions[i]);
				}
			} else {
				createActions(dataActions);
			}
		}

		/////////////////////////////////
		/// run component  ///
		/////////////////////////////////

		// If no subscribe to key is provided in component subscribe to all but give warning
		// about performance.

		subscribesToArray[subscribesToArray.length] = isUndefined(data.subscribe) || data.subscribe === 'all' ? Object.keys(runTime.getState()) : data.subscribe;

		var propsFromState = isDefined(data.mergeStateToProps) ? data.mergeStateToProps(runTime.getState()) : undefined;

		/* START.DEV_ONLY */

		// Check defined prop types //
		if (isFunction(data.propTypes)) {

			checkPropTypes(propsFromState ? Object.assign({}, data.props, propsFromState) : data.props, data.propTypes(propTypes), viewRef);
		}

		/* END.DEV_ONLY */

		// run view render function //
		// merge local and global actions objects to pass to component
		view(isDefined(propsFromState) ? Object.assign({}, data.props, propsFromState) : data.props, isDefined(localActions) || isDefined(appGlobalActions) ? Object.assign({}, localActions, appGlobalActions) : undefined, index)(nodeOpen, nodeClose, component);

		subscribesToArray.length = subscribesToArray.length - 1;
		componentActiveArray.length = componentActiveArray.length - 1;
		componentActiveIndexArray.length = componentActiveIndexArray.length - 1;
	};

	return {
		renderRootComponent: renderRootComponent,
		component: component,
		getKeyedNodes: getKeyedNodes,
		getKeyedNodesPrev: getKeyedNodesPrev,
		setKeyedNodesPrev: setKeyedNodesPrev,
		getVDomNodesArray: getVDomNodesArray,
		resetVDomNodesArray: resetVDomNodesArray
	};
};

var nodeProps = void 0;
var elProps$1 = void 0;
var el = void 0;
var isSVG = false;

var createDomElement = function createDomElement(node) {

	nodeProps = node.props;
	elProps$1 = Object.keys(nodeProps);

	if (node.lang !== 'xml') {
		isSVG = false;
		el = document.createElement(node.type);
	} else {
		isSVG = true;
		el = document.createElementNS('http://www.w3.org/2000/svg', node.type);
	}

	var _loop = function _loop(i, len) {

		var prop = elProps$1[i];
		var value = nodeProps[prop];

		if (isObject(value)) {
			if (isDefined(value.length)) {
				//Array
				if (prop === 'class') {
					var classList = value.filter(Boolean); //remove any empty strings
					if (classList.length > 0) {
						var _el$classList;

						(_el$classList = el.classList).add.apply(_el$classList, toConsumableArray(classList));
					}
				} else if (prop[0] === 'o' && prop[1] === 'n') {
					el[prop] = function (event) {
						return value[0].apply(null, [].concat(toConsumableArray(value.slice(1)), [event]));
					};
				} else {
					// add data attrs
					for (var _i = 0; _i < value.length; _i++) {
						var attrParts = value[_i].split('=');
						el.setAttribute('data-' + attrParts[0], attrParts[1] || '');
					}
				}
			} else {
				// Object
				var keys = Object.keys(value);
				for (var _i2 = 0; _i2 < keys.length; _i2++) {
					var key = keys[_i2];
					el[prop][key] = value[key];
				}
			}
		} else {
			if (prop === 'text') {
				el.textContent = value;
			} else if (isDefined(el[prop]) && !isSVG) {
				el[prop] = value;
			} else {
				el.setAttribute(prop, value);
			}
		}
	};

	for (var i = 0, len = elProps$1.length; i < len; i++) {
		_loop(i, len);
	}
	return el;
};

var props = [];
var values = [];
var newPropsKeys = void 0;
var prevPropsKeys = void 0;

var renderObj = {
	should: null,
	action: null,
	keyedAction: null,
	untrackedHtmlNodes: null,
	props: null,
	values: null
};

// set props on cached obj. Obj reuse instead of creating new obj. Memory mangement.
var updateRenderObj = function updateRenderObj(should) {
	var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'none';
	var keyedAction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	var props = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	var values = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

	renderObj.should = should;
	renderObj.action = action;
	renderObj.keyedAction = keyedAction;
	renderObj.untrackedHtmlNodes = untrackedHtmlNodes;
	renderObj.props = props;
	renderObj.values = values;
};

var prevProps = void 0;
var newProps = void 0;
var notChanged = void 0;
var untrackedHtmlNodes = void 0;
var handleKeyedNode = void 0;
var overrideDefaultAction = void 0;
var forceReplace = void 0;

var statefulElements = {
	radio: true
};

var shouldRenderNode = function shouldRenderNode(objPrev, objNew, nR, nodeReplacedFlag, nodeRemovedFlag, currentLevel, forceUpdateStartLevel) {

	prevProps = objPrev.props;
	newProps = objNew.props;
	notChanged = true;
	untrackedHtmlNodes = false;
	handleKeyedNode = false;
	forceReplace = false;
	//reset arrays
	props.length = 0;
	values.length = 0;

	if (objNew.type !== objPrev.type || isNull(prevProps) || isNull(newProps) || isNotNull(objNew.keyedAction)) {
		notChanged = false;
	} else {
		notChanged = objsAreEqual(prevProps, newProps);
	}

	overrideDefaultAction = (nodeReplacedFlag || nodeRemovedFlag) && currentLevel > forceUpdateStartLevel;

	if (overrideDefaultAction) {
		// add new nodes in the case parent has been replaced or removed.
		// In such cases the children Dom els have been removed but the vdom
		// nodes still remain unchanged (when comparing) and therefore dont trigger a
		// dom update. We need to force creation of new nodes to replace those
		// which were removed when parent was replaced. This overide continues for as long
		// as the node being added is a child of the parent which was replaced.
		if (nR.action !== 'removed') {
			updateRenderObj(true, 'newNode');
			return renderObj;
		}
		// if the dom node was removed previously and we don't want it to
		// be recreated - do nothing - even though the vdom nodes comparison
		// triggers a removal action.
		else if (nR.action === 'removed') {
				return false;
			}
	}

	if (notChanged) {
		return false;
	}

	// node changed //
	//////////////////


	if (isNotNull(prevProps) && isNotNull(newProps)) {

		if (isDefined(newProps.innerHTML)) {
			untrackedHtmlNodes = true;
		}

		// when comparing 2 stateful elements - replace previous element with new as
		// sometimes the new state is not applied. eg. radio box checked attribute when 
		// the group is differnet from the previous.
		if (statefulElements[prevProps.type] && prevProps.type === newProps.type) {
			forceReplace = true;
		}

		if ((objNew.key !== false || objPrev.key !== false) && isNotNull(objNew.keyedAction)) {
			handleKeyedNode = true;
		}

		// replace node //
		//////////////////

		// because innerHTML will cause 'untracked' DOM nodes to be added we need to trigger
		// a replacement of the node
		if ((objNew.type !== objPrev.type || untrackedHtmlNodes || forceReplace) && !handleKeyedNode) {
			updateRenderObj(true, 'replaceNode');
			return renderObj;
		}

		//// update node props //
		// create array of keys, values to be updates //
		// ////////////////////////////////////////////

		// created arrays once and reuse. reduce GC
		// reset cached created array
		newPropsKeys = Object.keys(newProps);
		prevPropsKeys = Object.keys(prevProps);

		var key = void 0;
		var value = void 0;

		for (var i = 0; i < newPropsKeys.length; i++) {

			key = newPropsKeys[i];
			value = newProps[key];

			if (isDefined(prevProps[key])) {
				if (isArray(value)) {
					if (!arraysAreEqual(value, prevProps[key])) {
						props[props.length] = key;
						values[values.length] = value;
					}
				} else if (isObject(value)) {
					if (!objsAreEqual(value, prevProps[key])) {
						props[props.length] = key;
						values[values.length] = value;
					}
				} else {
					if (value !== prevProps[key]) {
						props[props.length] = key;
						values[values.length] = value;
					}
				}
			} else {
				// add new props
				props[props.length] = key;
				values[values.length] = value;
			}
		}

		// loop over old props to see if there are any that the new node does not have
		// if so set value to empty to remove
		for (var _i = 0; _i < prevPropsKeys.length; _i++) {
			var oldProp = prevPropsKeys[_i];
			if (newPropsKeys.indexOf(oldProp) === -1) {
				// insert this at the beginning as clearing inerHTML will
				// strip out any text nodes that are set before
				if (oldProp !== 'innerHTML') {
					props[props.length] = oldProp;
					values[values.length] = oldProp === 'class' || oldProp === 'dataAttrs' ? [] : '';
				} else {
					props.unshift(oldProp);
					values.unshift('');
				}
			}
		}

		if (handleKeyedNode) {
			updateRenderObj(true, 'handleKeyedUpdate', objNew.keyedAction, props, values);
			return renderObj;
		} else {
			updateRenderObj(true, 'updateNode', undefined, props, values);
			return renderObj;
		}
	}

	// new node //
	//////////////
	else if (isNull(prevProps) && isNotNull(newProps)) {

			if (isDefined(newProps.innerHTML)) {
				untrackedHtmlNodes = true;
			}
			if (objNew.keyedAction === 'insertNew') {
				updateRenderObj(true, 'handleKeyedUpdate', objNew.keyedAction);
			} else {
				updateRenderObj(true, 'newNode', objPrev.keyedAction);
			}

			return renderObj;
		}

		// remove nodes //
		//////////////////
		else if (isNotNull(prevProps) && isNull(newProps)) {

				if (objNew.keyedAction === 'recycled') {
					return objNew.keyedAction;
				} else if (objNew.keyedAction === 'recyclable') {
					updateRenderObj(true, objNew.keyedAction);
					return renderObj;
				} else {
					updateRenderObj(true, 'removeNode');
					return renderObj;
				}
			}

			// If prenode and node props are null do nothing
			// should never be the case but just here in case to prevent errors
			else {
					return false;
				}
};

var firstChildNode = void 0;

var updateChangedNode = function updateChangedNode(prop, value, node) {

	switch (prop) {

		case 'class':
			{
				node.removeAttribute(prop);
				if (value.length > 0) {
					var _node$classList;

					(_node$classList = node.classList).add.apply(_node$classList, toConsumableArray(value.filter(Boolean))); //filter out aall empty strings
				}
				break;
			}
		case 'style':
			{
				var keys = Object.keys(value);
				var styles = '';
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					if (isDefined(value[key])) {
						styles += key + ':' + value[key] + '; ';
					}
				}
				if (styles !== '') {
					node.style.cssText = styles;
				} else {
					node.removeAttribute(prop);
				}
				break;
			}
		case 'text':
			if (node.hasChildNodes()) {
				firstChildNode = node.firstChild;
				if (isDefined(firstChildNode.data)) {
					firstChildNode.data = value;
				} else {
					//if there is no text node create one
					node.insertBefore(document.createTextNode(value), firstChildNode);
				}
			} else {
				node.textContent = value;
			}
			break;
		case 'dataAttrs':
			// remove al data attrs
			for (var _i = 0; _i < node.attributes.length; _i++) {
				if (/^data-/i.test(node.attributes[_i].name)) {
					node.removeAttribute(node.attributes[_i].name);
					_i--;
				}
			}
			// add new data attrs
			for (var _i2 = 0; _i2 < value.length; _i2++) {
				var attrParts = value[_i2].split('=');
				node.setAttribute('data-' + attrParts[0], attrParts[1] || '');
			}
			break;
		default:
			if (prop[0] === 'o' && prop[1] === 'n') {
				node[prop] = null;
				node[prop] = function (event) {
					return value[0].apply(null, [].concat(toConsumableArray(value.slice(1)), [event]));
				};
			} else if (isUndefined(node[prop]) || node instanceof SVGElement) {
				node.setAttribute(prop, value);
			} else if (value === '') {
				node[prop] = false;
				node.removeAttribute(prop);
			} else {
				node[prop] = value;
			}
	}
};

var recycledVNodeStatic = {
	type: null,
	lang: null,
	props: null,
	level: undefined,
	key: false,
	keyedAction: 'recycled',
	keyedChildren: null,
	staticChildren: false,
	parentComponent: null,
	parentComponentIndex: null,
	subscribesTo: null,
	dom: null
};

var recyclableVNodeStatic = {
	type: null,
	lang: null,
	props: null,
	level: undefined,
	key: false,
	keyedAction: 'recyclable',
	keyedChildren: null,
	staticChildren: false,
	parentComponent: null,
	parentComponentIndex: null,
	subscribesTo: null,
	dom: null
};

var emptyVNodeStatic = {
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

// Algorithim for syncing prev vNode tree with new vNode tree
// Each node in the vtree array needs to be compared to a node on the same level in the old tree
var syncVNodes = function syncVNodes(domNodes, domNodesPrev, keyedNodes, keyedNodesPrev) {

	var prevNode = void 0;
	var node = void 0;
	var breakLoop = false;

	var _loop = function _loop(i) {

		prevNode = domNodesPrev[i];
		node = domNodes[i];
		breakLoop = false;

		if (isUndefined(prevNode)) {
			domNodesPrev[i] = emptyVNodeStatic;
		} else {
			if (prevNode.level > node.level) {
				domNodes.splice(i, 0, emptyVNodeStatic);
			} else if (prevNode.level < node.level) {
				domNodesPrev.splice(i, 0, emptyVNodeStatic);
			}
		}

		if (i === domNodes.length - 1) {
			var remaining = domNodesPrev.length - domNodes.length;
			if (remaining > 0) {
				for (var x = 1; x <= remaining; x++) {
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
		// {key: false, props: null : {key: 'keyName'} or
		// {key: 'keyName2', props: {}} : {key: 'keyName'} 
		// Current node is keyed and prev node props is null or prev node is keyed but is not in prev pool (has been used already )
		// Insert old keyed node (move from old location and insert) - the prev dom node does not exist (empty vnode) or has been moved already

		// 2: Remove previous node
		// {key: false, props: {} : {key: 'keyName'} or
		// {key: 'keyName2', props: {}} : {key: 'keyName'} 
		// Current node is keyed and prev node is not or prev node is keyed but not present in new pool (not part of new UI)
		// For optimal performace we remove the previous node until we hit the next keyed node

		// 3: Swap keyed nodes
		// {key: 'keyName2'} : {key: 'keyName'} 
		// Current node and prev nodes are keyed and both exist in the new pool (both make up part of the UI)
		// swap the prev node with the current one

		var keyedNodesPrevPool = keyedNodesPrev[node.level || prevNode.level];

		if (isDefined(keyedNodesPrevPool)) {
			// Check If existing pool of keyed Nodes - else skip

			var isOldNodePresentInPrevKeyedPool = void 0;
			var isOldNodePresentInNewKeyedPool = void 0;
			var keyedParentLevel = void 0;

			if (isNotFalse(node.key) && prevNode.key !== node.key) {
				// New node is keyed

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
				var prevKeyedNode = keyedNodesPrevPool[node.key];

				var addKeyedChildrenToOldTree = function addKeyedChildrenToOldTree() {
					if (prevKeyedNode.keyedChildren.length > 0) {
						var childrenCount = 0;
						while (isDefined(domNodesPrev[i + childrenCount + 1]) && domNodesPrev[i + childrenCount + 1].level > keyedParentLevel) {
							childrenCount++;
						}
						domNodesPrev.splice.apply(domNodesPrev, [i + 1, childrenCount].concat(toConsumableArray(prevKeyedNode.keyedChildren)));
					}
				};

				// If undefined means it is a new node. If defined it exists in the DOM already and must be reused (recycled).
				if (isDefined(prevKeyedNode)) {

					// 1: Insert old (recycled) keyed node
					////////////////////////////////
					if (isNull(prevNode.props) || isNotFalse(prevNode.key) && !isOldNodePresentInPrevKeyedPool) {
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
				// Prev is keyed and is present in the prevKeyed pool (hasnt been used yet) and is present in newPool (will be rendered in current UI)
				// Action - splice empty node in prevNodesArray and change node.keyedAction to 'insertNew' 
				// This will insert the node at the index of the current keyed node and push the perev keyed node down until it either reaches
				// its match in the new nodes array or a diff element where another ection takes place

				// 2: Ignore recycled key node
				// {key: 'keyName'} : {key: false, props: {}}
				// Prev is keyed and is NOT present in the prevKeyed pool (has already been used) and is present in newPool (has been been rendered in current UI)
				// Prev node has been moved to another postion in the DOM already ie. has been 'recycled'
				// Action - splice a new empty node into the current nodes array stating this
				// Reconciler will ignore these nodes and decrement the dom child index
				// synced nodes = {key: 'keyName'} : {key: 'keyName, keyedAction: 'recycled', props: null}

				// 3: Replace old keyed node with unkeyed node
				// {key: 'keyName'} : {key: false, props: {}}
				// Prev is keyed and is NOT present in newPool (will NOT be rendered in current UI)
				// Action - Prev keyed node can be removed as it doesn make up part of the UI anymore
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


				else if (isNotFalse(prevNode.key) && prevNode.key !== node.key) {
						// Old node is keyed

						isOldNodePresentInPrevKeyedPool = isDefined(keyedNodesPrevPool[prevNode.key]);
						isOldNodePresentInNewKeyedPool = isUndefined(keyedNodes[prevNode.level]) ? false : isDefined(keyedNodes[prevNode.level][prevNode.key]);

						var removeKeyedChildrenFromOldTree = function removeKeyedChildrenFromOldTree() {
							if (prevNode.keyedChildren.length > 0) {
								var childrenCount = 0;
								while (isDefined(domNodesPrev[i + childrenCount + 1]) && domNodesPrev[i + childrenCount + 1].level > prevNode.level) {
									childrenCount++;
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
							// 2: Ignore recycled keyed node (has alreedy been used)
							///////////////////////////////
							else if (!isOldNodePresentInPrevKeyedPool && isOldNodePresentInNewKeyedPool) {
									domNodes.splice(i, 0, recycledVNodeStatic);
									removeKeyedChildrenFromOldTree();
								}
								// 3: Replace old keyed node with unkeyed node
								//////////////////////////////////////////////
								else if (!isOldNodePresentInNewKeyedPool) {
										prevNode.key = false;
										// no need to remove children of keyed node from tree as the nodeRemovedFlag 
										// in 'CreateView' is being used to skip over these
									}
						} else {
							// 4: Remove old keyed node 
							///////////////////////////
							if (!isOldNodePresentInNewKeyedPool) {
								prevNode.key = false;
								// no need to remove children of keyed node from tree as the nodeRemovedFlag 
								// in 'CreateView' is being used to skip over these
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

		if (breakLoop && domNodes.length === domNodesPrev.length) return 'break';
	};

	for (var i = 0; i < domNodes.length; i++) {
		var _ret = _loop(i);

		if (_ret === 'break') break;
	}

	return {
		domNodes: domNodes,
		domNodesPrev: domNodesPrev
	};
};

var getNodeRelations = function getNodeRelations(i, nodes, node, prevNode, nextNode, oldNode, prevOldNode, nextOldNode, currentNodeLevel, nodesToSkip) {

	var previous = void 0;
	var current = 'child';
	var next = void 0;
	var action = null;
	var actionNext = null;
	var actionPrev = null;
	var previousNodeLevel = isUndefined(prevNode) ? -1 : isNotNull(prevNode.props) ? prevNode.level : prevOldNode.level;
	var nextNodeLevel = isUndefined(nextNode) ? undefined : isNotNull(nextNode.props) ? nextNode.level : nextOldNode.level;

	if (i > 0) {
		if (previousNodeLevel < currentNodeLevel) {
			previous = 'parent';
			current = 'child';
		} else if (previousNodeLevel > currentNodeLevel) {
			previous = 'child';
			current = 'parent';
		} else {
			previous = 'child';
			current = 'sibling';
		}

		if (isDefined(prevOldNode)) {
			if (isNull(prevNode.props && isNotNull(prevOldNode.props))) {
				actionPrev = 'removed';
			}
		}
	}

	if (i < nodes.length - nodesToSkip - 1) {
		if (nextNodeLevel < currentNodeLevel) {
			next = 'parent';
		} else if (nextNodeLevel > currentNodeLevel) {
			next = 'child';
		} else {
			next = 'sibling';
		}

		if (isNull(nextNode.props)) {
			actionNext = 'removed';
		}
		if (isDefined(nextOldNode)) {
			if (isNull(nextOldNode.props)) {
				actionNext = 'add';
			}
		}
	}

	if (isNull(node.props)) {
		action = 'removed';
	}

	if (isDefined(oldNode)) {
		if (isNull(oldNode.props)) {
			action = 'add';
		}
	}

	return {
		previous: previous,
		current: current,
		next: next,
		action: action,
		actionNext: actionNext,
		actionPrev: actionPrev,
		nextNodeLevel: nextNodeLevel
	};
};

var childNodeIndexes = [];

var createView = function createView(appContainer, domNodes, domNodesPrev, changedStateKeys, keyedNodes, keyedNodesPrev) {

	var nodeReplacedFlag = false;
	var nodeRemovedFlag = false;
	var handleUntrackedHtmlNodesFlag = false;
	var forceUpdateStartLevel = null;
	var keyedNodeRecycleBin = {};

	//rest array for reuse
	childNodeIndexes.length = 0;

	if (virtualDom.isInitialized() && virtualDom.requiresSync()) {
		var syncedVNodes = syncVNodes(domNodes.slice(0), domNodesPrev, keyedNodes, keyedNodesPrev);
		domNodes = syncedVNodes.domNodes;
		domNodesPrev = syncedVNodes.domNodesPrev;
	}

	var getDomIndex = function getDomIndex(currentLevel) {
		return childNodeIndexes[currentLevel];
	};

	var updateChildNodeFauxDomIndexes = function updateChildNodeFauxDomIndexes(nodeRelation, currentLevel) {
		switch (nodeRelation.current) {
			case 'parent':
				childNodeIndexes[currentLevel]++;
				break;
			case 'child':
				childNodeIndexes[currentLevel] = 0;
				break;
			case 'sibling':
				childNodeIndexes[currentLevel]++;
				break;
		}
	};

	var replaceNode = function replaceNode(parentNode, newNode, oldNode, currentLevel) {
		if (isDefined(oldNode) && isNotNull(oldNode)) {
			parentNode.replaceChild(newNode, oldNode);
		} else {
			parentNode.appendChild(newNode);
		}
		nodeReplacedFlag = true;
		forceUpdateStartLevel = currentLevel;
	};

	var swapElements = function swapElements(parent, el1, el2) {
		var n2 = el2.nextSibling;
		if (n2 === el1) {
			parent.insertBefore(el1, el2);
		} else {
			parent.insertBefore(el2, el1);
		}
		if (isDefined(el1)) {
			parent.insertBefore(el1, n2);
		}
	};

	var updateProperties = function updateProperties(props, values, currentNode) {
		for (var i = 0; i < props.length; i++) {
			updateChangedNode(props[i], values[i], currentNode);
		}
	};

	var patch = function patch(prevNode, node, nR, parentNodeEl, currentLevel) {

		renderNode = shouldRenderNode(prevNode, node, nR, nodeReplacedFlag, nodeRemovedFlag, currentLevel, forceUpdateStartLevel);

		if (currentLevel <= forceUpdateStartLevel) {
			nodeReplacedFlag = false;
			nodeRemovedFlag = false;
		}

		if (renderNode.should) {

			if (handleUntrackedHtmlNodesFlag) {
				// Increase the child node index by 1 as all untracked nodes created by using
				// innerHTML prop will be wrapped in a sandbox div to prevent breaking the 
				// vdom -> real dom comparison
				childNodeIndexes[currentLevel]++;
			}

			switch (renderNode.action) {

				case 'updateNode':
					{
						$_currentNode = prevNode.dom;
						node.dom = $_currentNode;
						updateProperties(renderNode.props, renderNode.values, $_currentNode);
						domOpsCount++;
						break;
					}

				case 'newNode':
					{
						$_currentNode = createDomElement(node);
						node.dom = $_currentNode;
						parentNodeEl.appendChild($_currentNode);
						domOpsCount++;
						break;
					}

				case 'replaceNode':
					{
						$_currentNode = createDomElement(node);
						node.dom = $_currentNode;
						replaceNode(parentNodeEl, $_currentNode, prevNode.dom, currentLevel);
						domOpsCount++;
						break;
					}

				case 'removeNode':
					{
						var nodeToRemove = prevNode.dom;
						if (isNotNullandIsDef(nodeToRemove)) {
							parentNodeEl.removeChild(nodeToRemove);
							nodeToRemove = null;
							childNodeIndexes[currentLevel]--;
							nodeRemovedFlag = true;
							forceUpdateStartLevel = currentLevel;
							domOpsCount++;
						}
						break;
					}

				case 'recyclable':
					{
						if (isUndefined(keyedNodeRecycleBin[prevNode.key])) {
							keyedNodeRecycleBin[prevNode.key] = true;
						} else {
							childNodeIndexes[currentLevel]--;
						}
						break;
					}

				case 'handleKeyedUpdate':
					{
						var currentDomNode = get_$currentNode();
						var recycledDomNode = prevNode.dom;
						var keyedAction = renderNode.keyedAction;
						$_currentNode = recycledDomNode;

						if (keyedAction === 'insertNew') {
							$_currentNode = createDomElement(node);
							parentNodeEl.insertBefore($_currentNode, currentDomNode);
							domOpsCount++;
						} else if (keyedAction === 'insertOld') {
							parentNodeEl.insertBefore(recycledDomNode, currentDomNode);
							keyedNodeRecycleBin[node.key] = true;
							domOpsCount++;
							if (renderNode.props.length > 0) {
								updateProperties(renderNode.props, renderNode.values, $_currentNode);
							}
						} else if (keyedAction === 'swap' || isDefined(currentDomNode) && !currentDomNode.isEqualNode(recycledDomNode)) {
							swapElements(parentNodeEl, currentDomNode, recycledDomNode);
							keyedNodeRecycleBin[node.key] = true;
							domOpsCount++;
							if (renderNode.props.length > 0) {
								updateProperties(renderNode.props, renderNode.values, $_currentNode);
							}
						} else if (keyedAction === 'updateAttrs' && renderNode.props.length > 0) {
							updateProperties(renderNode.props, renderNode.values, $_currentNode);
							domOpsCount++;
						}

						node.dom = $_currentNode;
						break;
					}
			}

			if (renderNode.untrackedHtmlNodes && nR.next === 'child' && nR.actionNext !== 'removed') {
				handleUntrackedHtmlNodesFlag = true;
			} else {
				handleUntrackedHtmlNodesFlag = false;
			}
		} else {
			node.dom = prevNode.dom;
			$_currentNode = node.dom;
			if (renderNode === 'recycled') {
				childNodeIndexes[currentLevel]--;
			}
		}
	};

	var $_parentNodeStack = [];
	var $_parentNode = void 0;
	var $_currentNode = void 0;
	var $_prevParentCache = void 0;
	var node = void 0;
	var prevNode = void 0;
	var currentLevel = void 0;
	var nR = void 0;
	var nodeIsListeningToStateKey = false;
	var renderNode = void 0;
	var prevLevel = 0;
	var nodesToSkip = 0;
	var domOpsCount = 0;
	var domOpsComplete = false;

	var get_$currentNode = function get_$currentNode() {
		return $_parentNode.children[getDomIndex(currentLevel)];
	};

	for (var i = 0, len = domNodes.length; i < len; i++) {

		if (domOpsComplete || virtualDom.getDomUpdatesLimit() === domOpsCount) {
			domOpsComplete = true;
		}

		if (!domOpsComplete) {

			if (nodesToSkip > 0) {
				i = i + nodesToSkip;
				nodesToSkip = 0;
			}

			node = domNodes[i];
			prevNode = domNodesPrev[i];

			if (isUndefined(node)) break;

			if (virtualDom.isInitialized() && node.staticChildren && node.keyedAction !== 'insertNew' && isNotNull(node.keyedAction) && isDefined(prevNode) && isNotNull(prevNode.props)) {
				nodesToSkip = node.keyedChildren.length;
			}

			currentLevel = node.level || prevNode.level;
			nR = getNodeRelations(i, domNodes, node, domNodes[i - 1], domNodes[i + nodesToSkip + 1], prevNode, domNodesPrev[i - 1], domNodesPrev[i + nodesToSkip + 1], currentLevel, nodesToSkip);
			updateChildNodeFauxDomIndexes(nR, currentLevel);

			if (i !== 0) {
				if (isDefined($_prevParentCache) && currentLevel === prevLevel) {
					$_parentNode = $_prevParentCache;
				} else {
					$_parentNode = $_parentNodeStack[$_parentNodeStack.length - 1];
					$_prevParentCache = $_parentNode;
				}
			} else {
				$_parentNode = appContainer;
				$_parentNodeStack[0] = $_parentNode;
			}

			// Mount //
			// Render all nodes on intial page load
			////////////////////////////////////////2
			if (!virtualDom.isInitialized()) {

				$_currentNode = createDomElement(node);
				$_parentNode.appendChild($_currentNode);
				node.dom = $_currentNode;
			} else {

				// Reconcile DOM after state updates //
				//////////////////////////////////////////

				// All nodes are subscribed to a specific part of the state through the
				// 'subscribe" key in the component. If a part of the state changes
				// but the node is not subscribed we do not need to update any props. 
				nodeIsListeningToStateKey = false;

				// check if the node 'subcribesTo' value matches any of the state key
				// which have been changed. If so 'node is listening to change' so go
				// ahead with DOM updates.
				var subscribesTo = node.subscribesTo || prevNode.subscribesTo;

				if (isDefined(changedStateKeys) && isNotNull(subscribesTo) && !nodeIsListeningToStateKey) {
					for (var _i = 0; _i < subscribesTo.length; _i++) {
						if (changedStateKeys.indexOf(subscribesTo[_i]) > -1) {
							nodeIsListeningToStateKey = true;
							break;
						}
					}
				} else if (isNull(subscribesTo)) ; else {
					//if changedStateKeys are undefined it means that the whole state obj has
					// been replaced and all nodes must be checked and updated accordingly
					nodeIsListeningToStateKey = true;
				}

				// if node is not listening to the current state change we can go ahead and update
				// the id if necessary and discard the rest of the old/current node comparison
				// process.

				if (nodeIsListeningToStateKey) {
					patch(prevNode, node, nR, $_parentNode, currentLevel);
				} else if (prevNode.parentComponent === node.parentComponent && isNotNull(node.props) && isNotNull(prevNode.props) && !nodeReplacedFlag && !nodeRemovedFlag && node.type === prevNode.type && node.keyedAction !== 'insertOld') {
					// noop
					/////////////
					node.dom = prevNode.dom;
					$_currentNode = node.dom;
				} else {
					// not listening to current state change but needs to rerenderd for sum reason eg. parent node was replaced
					patch(prevNode, node, nR, $_parentNode, currentLevel);
				}
			}

			// update parent node stack array
			//////////////////////////////////
			if (nR.next === 'child' && nR.action !== 'removed') {
				$_parentNodeStack[$_parentNodeStack.length] = $_currentNode;
			} else if (nR.next === 'parent') {
				$_parentNodeStack.splice(nR.nextNodeLevel, currentLevel - nR.nextNodeLevel); // (nextNodeLevel, removeQuantity)
			}

			prevLevel = currentLevel;
		} else {
			node = domNodes[i];
			prevNode = domNodesPrev[i];
			node.dom = prevNode.dom;
			$_currentNode = node.dom;
		}
	}
};

var vdomNodeBuilder = void 0;
var vDomNodesArrayPrevious = [];

var renderApp = function renderApp(appContainer, appView, runTime, appGlobalActions, appOnInit, changedStateKeys, sequenceId, firstRender, lastFirstRender, appId) {

	var nodeBuilderInstance = void 0;
	// cache nodeBuilder instances
	if (!firstRender) {
		nodeBuilderInstance = vdomNodeBuilder[appId];
		vDomNodesArrayPrevious = nodeBuilderInstance.getVDomNodesArray().slice(0);
		nodeBuilderInstance.resetVDomNodesArray();
	} else {
		vdomNodeBuilder = isDefined(vdomNodeBuilder) ? vdomNodeBuilder : {};
		vdomNodeBuilder[appId] = nodeBuilder(runTime, appGlobalActions, changedStateKeys);
		nodeBuilderInstance = vdomNodeBuilder[appId];
	}

	nodeBuilderInstance.setKeyedNodesPrev();
	nodeBuilderInstance.renderRootComponent({ $$_appRootView: appView }, { props: runTime.getState() });

	createView(appContainer, nodeBuilderInstance.getVDomNodesArray(), vDomNodesArrayPrevious, changedStateKeys, nodeBuilderInstance.getKeyedNodes(), nodeBuilderInstance.getKeyedNodesPrev(), appId);

	if (!firstRender) {
		runTime.exeQueuedMsgs(undefined, sequenceId);
	} else {
		if (isFunction(appOnInit)) appOnInit(appGlobalActions);
		if (lastFirstRender) {
			virtualDom.setInitialized(true);
			virtualDom.setSync(true);
		}
	}
};

/* eslint-disable no-console */

var karbon = function () {
	return {
		run: function run() {

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
			/* START.DEV_ONLY */
			this.appTap = {};
			/* END.DEV_ONLY */

			for (var _len = arguments.length, appConfig = Array(_len), _key = 0; _key < _len; _key++) {
				appConfig[_key] = arguments[_key];
			}

			for (var i = 0; i < appConfig.length; i++) {

				var appConfigObj = appConfig[i];
				var appId = i;
				var lastFirstRender = i === appConfig.length - 1;
				appConfigObj.container.innerHTML = '';
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
					this.appTap[appId].state({ prevState: null, newState: appConfigObj.state, sequenceId: null });
				}
				/* END.DEV_ONLY */

				renderApp(this.appContainer[appId], this.appView[appId], this.runTime[appId], this.appGlobalActions[appId], this.appOnInit[appId], undefined, undefined, true, lastFirstRender, appId);
			}
		},
		initGlobalActions: function initGlobalActions(actions, runTime) {

			var globalActions = {};

			var injectActions = function injectActions(actionsObj) {
				var actionsKeys = Object.keys(actionsObj);
				var actionsName = actionsKeys[0];
				globalActions[actionsName] = actionsObj[actionsName]({ stamp: runTime.stamp, msgs: runTime.messages });
			};

			if (isDefined(actions)) {
				if (isArray(actions)) {
					for (var i = 0; i < actions.length; i++) {
						injectActions(actions[i]);
					}
				} else {
					injectActions(actions);
				}
				return globalActions;
			}
		},
		handleSubs: function handleSubs(subs, appId) {

			/* START.DEV_ONLY */
			var subsStatus = [];
			/* END.DEV_ONLY */

			for (var i = 0; i < subs.length; i++) {

				var sub = subs[i];
				var action = isArray(sub.action) ? sub.action[0] : sub.action;

				if (isUndefined(action.name)) {
					Object.defineProperty(action.prototype, 'name', {
						get: function get$$1() {
							return (/function ([^(]*)/.exec(this + '')[1]
							);
						}
					});
				}

				var subId = sub.id || action.name + '_' + sub.name.toString().replace(/\s/g, '');

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
						subsStatus.push({ name: sub.name.name, active: isNullorUndef(sub.when) ? true : sub.when, action: action.name });
					}
					/* END.DEV_ONLY */

					// string denotes event sub
				} else if (isString(sub.name)) {

					if (sub.when || isUndefined(sub.when)) {
						if (isDefined(sub.name)) {
							if (!isDefined(subscription.getCache()[subId])) {

								subscription.add(sub.el || window, sub.name, subId, action, isArray(sub.action) ? sub.action.slice(1) : undefined);
							}
						} else {
							// this subscription action is called whenever the state changes
							if (isArray(sub.action)) {
								var _sub$action;

								(_sub$action = sub.action)[0].apply(_sub$action, toConsumableArray(sub.action.slice(1)));
							} else {
								sub.action();
							}
						}

						/* START.DEV_ONLY */
						if (isDefined(this.appTap[appId].subscriptions)) {
							subsStatus.push({ name: sub.name, active: true, action: action.name });
						}
						/* END.DEV_ONLY */
					} else if (!sub.when) {
						if (isDefined(sub.name)) {
							if (isDefined(subscription.getCache()[subId])) {
								subscription.remove(sub.el || window, sub.name, subId);
							}
						}

						/* START.DEV_ONLY */
						if (isDefined(this.appTap[appId].subscriptions)) {
							subsStatus.push({ name: sub.name, active: false, action: action.name });
						}
						/* END.DEV_ONLY */
					}
				}
			}

			/* START.DEV_ONLY */
			if (isDefined(this.appTap[appId].subscriptions)) {
				this.appTap[appId].subscriptions({ subs: subsStatus });
			}
			/* END.DEV_ONLY */
		},
		runHandleSubs: function runHandleSubs(appId) {
			if (isFunction(this.appSubs[appId])) {
				this.handleSubs(this.appSubs[appId](this.runTime[appId].getState(), this.appGlobalActions[appId]), appId);
			}
		},
		reRender: function reRender(changedStateKeys, sequenceId, appId) {

			renderApp(this.appContainer[appId], this.appView[appId], this.runTime[appId], this.appGlobalActions[appId], undefined, changedStateKeys, sequenceId, false, undefined, appId, undefined);
		}
	};
}();

var run = void 0;
if (document.currentScript && "noModule" in document.currentScript) {
    run = karbon.run.bind(karbon);
} else {
    window.karbon = {};
    window.karbon.run = karbon.run.bind(karbon);
}

export { run };
