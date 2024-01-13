var karbon = (function (exports) {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

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

  var isEmpty = function isEmpty(value) {
  	return value === '';
  };

  var isNotEmpty = function isNotEmpty(value) {
  	return value !== '';
  };

  var isFunction = function isFunction(value) {
  	return typeof value === 'function';
  };

  var isObject = function isObject(value) {
  	return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
  };

  var isArray = Array.isArray;

  var isNumber = function isNumber(value) {
  	return typeof value === 'number';
  };

  var isString = function isString(value) {
  	return typeof value === 'string';
  };

  var isPromise = function isPromise(value) {
  	return value instanceof Promise;
  };

  var randomStringId = function randomStringId() {
  	return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
  };

  var isBrowser = function isBrowser() {
  	return (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object';
  };

  var clearObject = function clearObject(obj) {
  	for (var prop in obj) {
  		delete obj[prop];
  	}
  };

  var arraysAreEqual = function arraysAreEqual(arr1, arr2) {
  	if (arr1.length !== arr2.length) return false;
  	for (var i = 0; i < arr1.length; i++) {
  		if (arr1[i] !== arr2[i]) return false;
  	}
  	return true;
  };

  var keyList = Object.keys;
  var hasProp = Object.prototype.hasOwnProperty;

  var objsAreEqual = function objsAreEqual(a, b) {
  	if (a === b) return true;

  	if (a && b && (typeof a === 'undefined' ? 'undefined' : _typeof(a)) == 'object' && (typeof b === 'undefined' ? 'undefined' : _typeof(b)) == 'object') {
  		var arrA = isArray(a);
  		var arrB = isArray(b);
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

  			var success = false;
  			var failedKey = void 0;
  			var failedValue = void 0;
  			var value = propTypes[key];

  			if (!isArray(value)) value = [value];

  			for (var i = 0; i < value.length; i++) {
  				var val = value[i];
  				if (val === 'array' && isArray(props[key]) || val === _typeof(props[key])) {
  					success = true;
  				} else {
  					failedKey = key;
  					failedValue = value;
  				}
  			}

  			if (!success) propTypeFailed(failedKey, failedValue, componentName);
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
  	/* START.DEV_ONLY */
  	var appTap = app.appTap[appId] || {};
  	/* END.DEV_ONLY */
  	var sequenceCounter = 0;
  	var updatesQueue = {};
  	var callbacks = {};
  	var _ = undefined;

  	var setState = function setState(state) {
  		appState = state;
  	};

  	var getState = function getState() {
  		return appState;
  	};

  	var updateMethods = function () {

  		var callbackData = null;
  		var sequenceCompleted = null;
  		var sequenceCache = null;
  		var stampId = void 0;
  		var cache = void 0;

  		var stamp = function stamp(data) {
  			stampId = data.id;
  			cache = data.cache;
  			return {
  				msgs: messages
  			};
  		};

  		var messages = function messages() {
  			for (var _len = arguments.length, msgs = Array(_len), _key = 0; _key < _len; _key++) {
  				msgs[_key] = arguments[_key];
  			}

  			callbackData = null;
  			sequenceCache = Object.assign({}, cache);
  			sequenceCounter++;
  			var sequenceId = (stampId || randomStringId()) + '_' + sequenceCounter;
  			cache = undefined;
  			stampId = undefined;

  			/* START.DEV_ONLY */
  			if (isDefined(appTap.dispatch)) appTap.dispatch({ msgs: msgs, sequenceId: sequenceId });
  			/* END.DEV_ONLY */

  			setTimeout(function () {
  				createSequenceArray(sequenceId, msgs, sequenceCache);
  			}, 0);

  			return {
  				done: done(sequenceId)
  			};
  		};

  		var done = function done(sequenceId) {
  			return function (callback) {
  				if (isNull(callbackData)) {
  					callbacks[sequenceId] = callback;
  				} else {
  					delete updatesQueue[sequenceId];
  					callback(callbackData, sequenceCompleted, sequenceCache);
  				}
  			};
  		};

  		var setCallbackData = function setCallbackData(data, didComplete, cache) {
  			callbackData = data;
  			sequenceCompleted = didComplete;
  			sequenceCache = cache;
  		};

  		return {
  			stamp: stamp,
  			messages: messages,
  			setCallbackData: setCallbackData
  		};
  	}();

  	var createSequenceArray = function createSequenceArray(sequenceId, msgs, sequenceCache) {
  		updatesQueue[sequenceId] = [];
  		for (var i = 1; i < msgs.length; i++) {
  			updatesQueue[sequenceId][i - 1] = msgs[i];
  		}
  		processMsg(sequenceId, msgs[0], _, sequenceCache);
  	};

  	var exeQueuedMsgs = function exeQueuedMsgs(data, sequenceId) {
  		var sequenceCompleted = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  		var sequenceCache = arguments[3];


  		if (isDefined(sequenceId)) {
  			if (updatesQueue[sequenceId].length > 0) {
  				processMsg(sequenceId, updatesQueue[sequenceId].shift(), data, sequenceCache);
  			} else {
  				delete updatesQueue[sequenceId];
  				if (isFunction(callbacks[sequenceId])) {
  					var callbacksClone = Object.assign({}, callbacks);
  					delete callbacks[sequenceId];
  					callbacksClone[sequenceId](data, sequenceCompleted, sequenceCache);
  				} else {
  					updateMethods.setCallbackData(data, sequenceCompleted, sequenceCache);
  				}
  			}
  		}
  	};

  	var processMsg = function processMsg(sequenceId, msg, data, sequenceCache) {

  		var msgArray = !isFunction(msg) ? msg : isNotNullandIsDef(data) ? msg(data === 'undefined' ? undefined : data, getState(), sequenceCache) : msg(getState(), sequenceCache);

  		// allow for conditional msgs
  		if (isNull(msgArray)) {
  			exeQueuedMsgs(null, sequenceId, _, sequenceCache);
  		} else if (isUndefined(msgArray)) {
  			exeQueuedMsgs('undefined', sequenceId, _, sequenceCache);
  		} else {

  			var msgPayload = msgArray[1];
  			var renderFlags = msgArray[2] || {};

  			/* START.DEV_ONLY */
  			if (isDefined(appTap.message)) appTap.message({ msg: msgArray, sequenceId: sequenceId, input: data });
  			/* END.DEV_ONLY */

  			// msgArray[0] === msgType
  			switch (msgArray[0]) {

  				case 'state':
  					{

  						if (renderFlags.fixedDomShape) {
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

  				case 'effect':
  					{

  						var effectCacheKey = msgPayload.cache;
  						var effectName = msgPayload.name || msgPayload.def;
  						var effectFun = isFunction(effectName) ? effectName : function () {
  							return console.warn('Effect \'' + effectName + '\' is not a function.');
  						};

  						var effectOutput = isArray(msgPayload.args) ? effectFun.apply(undefined, toConsumableArray(msgPayload.args)) : effectFun(msgPayload.args);

  						if (isPromise(effectOutput)) {
  							Promise.resolve(effectOutput).then(function (response) {
  								if (isDefined(effectCacheKey)) sequenceCache[effectCacheKey] = response;
  								exeQueuedMsgs(response, sequenceId, _, sequenceCache);
  							}).catch(function (error) {
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
  						exeQueuedMsgs(pipedOutput, sequenceId, _, sequenceCache);
  					}
  					break;

  				case 'control':
  					{

  						var condition = !!msgPayload.if;
  						var conditionPayloadIsArray = isArray(msgPayload[condition]);
  						var conditionPayload = conditionPayloadIsArray ? msgPayload[condition][0] : msgPayload[condition];
  						var sequenceAction = conditionPayloadIsArray ? msgPayload[condition][1] : null;
  						var sequenceActionParam = conditionPayloadIsArray ? msgPayload[condition][2] : null;
  						var _effectCacheKey = msgPayload.cache;
  						var sequenceComplete = false;

  						if (!sequenceAction) {
  							if (condition) {
  								sequenceComplete = true;
  							} else {
  								updatesQueue[sequenceId] = [];
  							}
  						} else if (sequenceAction === 'continue') {
  							if (isNumber(sequenceActionParam)) {
  								updatesQueue[sequenceId].length = sequenceActionParam;
  							}
  						} else if (sequenceAction === 'skip' && sequenceActionParam) {
  							if (isNumber(sequenceActionParam)) {
  								updatesQueue[sequenceId].splice(0, sequenceActionParam);
  							}
  							/* START.DEV_ONLY */
  							if (!isNumber(sequenceActionParam)) {
  								console.warn('Control msg error - Parameter for "skip" must be of type Number to have any effect.');
  							}
  							/* END.DEV_ONLY */
  						} else if (sequenceAction === 'break') {
  							updatesQueue[sequenceId] = [];
  							delete callbacks[sequenceId];
  						}

  						if (isDefined(_effectCacheKey)) sequenceCache[_effectCacheKey] = conditionPayload;
  						exeQueuedMsgs(conditionPayload, sequenceId, sequenceComplete, sequenceCache);
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

  	var updateState = function updateState(obj, path) {
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
  				return updateState(obj[path[0]], path.slice(1), value, action, add, remove);
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
  							// args[args.length] = value[i];
  							args[args.length] = isFunction(value[i]) ? value(data) : value[i];
  						}
  						// if only one value is provided but must be added more than 1 time
  						// use the same value.
  					} else {
  						for (var _i2 = 0; _i2 < add; _i2++) {
  							// args[args.length] = value;
  							args[args.length] = isFunction(value) ? value(data) : value;
  						}
  					}
  					// if(data[index] == undefined) throw new Error(`Karbon - cannot add/remove. Array "${path[0]}" does not contain item at position "${index}".`);
  					data.splice.apply(data, args);
  				} else {
  					// add one paramter to array (and remove)
  					if (isNotNull(value)) {
  						// if(data[index] == undefined) throw new Error(`Karbon - cannot add/remove. Array "${path[0]}" does not contain item at position "${index}".`);
  						data.splice(index, remove, isFunction(value) ? value(data) : value);
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
  				for (var _i3 = 0; _i3 < _key2.length; _i3++) {
  					if (isArray(value)) {
  						// update each prop with a corresponding value from value array
  						// obj[key[i]] = value[i];
  						obj[_key2[_i3]] = isFunction(value[_i3]) ? value(obj[_key2[_i3]]) : value[_i3];
  					} else {
  						// update each prop with the same fixed string value
  						// obj[key[i]] = value;
  						obj[_key2[_i3]] = isFunction(value) ? value(obj[_key2[_i3]]) : value;
  					}
  				}
  			} else {
  				// update one prop in one object
  				// If value is a function pass in the current state value as an argument
  				obj[_key2] = isFunction(value) ? value(obj[_key2]) : value;
  			}
  		} else if (path.length == 0) {
  			return obj;
  		} else {
  			return updateState(obj[path[0]], path.slice(1), value, action, add, remove);
  		}
  	};

  	var runUpdate = function runUpdate(payload, sequenceId, preventRender, sequenceCache) {

  		/// update state obj and re-render  ///
  		///////////////////////////////////// 

  		/* START.DEV_ONLY */
  		var prevState = void 0;
  		/* END.DEV_ONLY */

  		var changedStateKeys = isArray(payload) ? [] : isDefined(payload.path) ? payload.path[0] : undefined;

  		/* START.DEV_ONLY */
  		if (isDefined(appTap.state)) prevState = JSON.stringify(appState);
  		/* END.DEV_ONLY */

  		if (isArray(payload)) {
  			for (var i = 0; i < payload.length; i++) {
  				var payloadObj = payload[i];
  				updateState(appState, payloadObj.path, payloadObj.value, payloadObj.action, payloadObj.add, payloadObj.remove);
  				changedStateKeys[i] = payloadObj.path[0];
  			}
  		} else {
  			updateState(appState, payload.path, payload.value, payload.action, payload.add, payload.remove);
  		}

  		/* START.DEV_ONLY */
  		if (isDefined(appTap.state)) appTap.state({ prevState: JSON.parse(prevState), newState: appState, sequenceId: sequenceId });
  		/* END.DEV_ONLY */

  		// run subscriptions function every time state changes. Even with no render
  		app.runHandleSubs(appId);

  		if (!preventRender) {
  			app.reRender(changedStateKeys, sequenceId, appId, sequenceCache);
  		} else {
  			exeQueuedMsgs(_, sequenceId, _, sequenceCache);
  		}
  	};

  	var forceReRender = function forceReRender(creatingHydrationLayer) {
  		virtualDom.setSync(true);
  		app.reRender(undefined, undefined, appId, undefined, creatingHydrationLayer);
  	};

  	return {
  		setState: setState,
  		getState: getState,
  		exeQueuedMsgs: exeQueuedMsgs,
  		forceReRender: forceReRender,
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

  var createVNode = function createVNode(type, parentComponentIndex, data, level) {
  	var key = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  	var staticChildren = arguments[5];
  	var parentComponent = arguments[6];
  	var subscribesTo = arguments[7];
  	var renderingSvg = arguments[8];
  	var block = arguments[9];
  	var blockProps = arguments[10];
  	var blockChild = arguments[11];


  	var props = {};
  	var elProps = Object.keys(data);

  	for (var i = 0; i < elProps.length; i++) {
  		var prop = elProps[i];
  		var value = data[prop];
  		props[prop] = isNull(value) ? '' : prop !== 'innerHTML' ? value : '<span data="dangerously-set-innerHTML">' + value + '</span>';
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
  		dom: null,
  		block: block,
  		blockProps: blockProps,
  		blockChild: blockChild
  	};
  };

  /* eslint-disable no-mixed-spaces-and-tabs */

  var nodeBuilder = function nodeBuilder(runTime, appGlobalActions) {

  	var vDomNodesArray = [];
  	var componentActiveArray = [];
  	var componentActiveIndexArray = [];
  	var subscribesToArray = [];
  	var keyedNodes = {};
  	var actionsCache = {};
  	var lazyCache = {};
  	var blockCache = {};
  	var blockVNodes = [];
  	var creatingBlock = false;
  	var keyedNodesPrev = void 0;
  	var keyName = void 0;
  	var isKeyed = false;
  	var keyedParentLevel = void 0;
  	var keyedParent = void 0;
  	var vNode = void 0;
  	var rootIndex = 1;
  	var renderingSvg = false;
  	var lazyCount = 0;
  	var renderProcess = void 0;

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
  		// reset keyedNodes Obj instead of creating new one
  		clearObject(keyedNodes);
  	};

  	var resetVDomNodesArray = function resetVDomNodesArray() {
  		vDomNodesArray.length = 0;
  	};

  	var getLazyCount = function getLazyCount() {
  		return lazyCount;
  	};

  	var getBlockCache = function getBlockCache() {
  		return blockCache;
  	};

  	var nodeClose = function nodeClose(tagName) {
  		rootIndex--;
  		if (tagName === 'svg' || tagName === '/svg') renderingSvg = false;
  	};

  	var nodeOpen = function nodeOpen(tagName) {
  		var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  		var flags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { key: false, staticChildren: false };
  		var block = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  		var blockProps = arguments[4];


  		if (tagName === 'svg') renderingSvg = true;

  		// Don't cache args as vars as more performant - less garbage collection
  		// createElementObj args are :
  		// const createElementObj = (type, parentComponentIndex, id, data, level, key, parentComponentName, subscribesTo)
  		keyName = flags.key;
  		isKeyed = !!keyName;

  		vNode = createVNode(tagName, componentActiveIndexArray[componentActiveIndexArray.length - 1], data, rootIndex, keyName, flags.staticChildren, componentActiveArray[componentActiveArray.length - 1], subscribesToArray[subscribesToArray.length - 1], renderingSvg, block, blockProps, false);

  		if (renderProcess === 'creatingHydrationLayer') {
  			Object.keys(vNode.props).map(function (key) {
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
  				if (vNode.block) {
  					keyedParent.blockChild = true;
  				}
  			} else if (rootIndex === keyedParentLevel) {
  				keyedParent = undefined;
  				keyedParentLevel = undefined;
  			}
  		}

  		if (isKeyed) {
  			keyedParentLevel = rootIndex;
  			keyedParent = vNode;
  			vNode.keyedChildren = [];
  			keyedNodes[keyName] = vNode;
  		}

  		if (!voidedElements[tagName]) {
  			rootIndex++;
  		}
  	};

  	var component = function component(comp) {
  		var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  		if (isArray(comp)) {
  			data = comp[1] || {};
  			comp = comp[0];
  		}

  		var viewRef = Object.keys(comp)[0];
  		var view = comp[viewRef];
  		var index = data.index || 0;

  		componentActiveArray[componentActiveArray.length] = viewRef;
  		componentActiveIndexArray[componentActiveIndexArray.length] = index;

  		////////////////////////////////////////////////////////////////////////////
  		/// actions ///
  		/// if defined inject actions function into component ///
  		////////////////////////////////////////////////////////////////////////////

  		var localActions = void 0;
  		var dataActions = data.actions;

  		if (isDefined(dataActions)) {
  			localActions = {};
  			dataActions = isArray(dataActions) ? dataActions : [dataActions];

  			for (var i = 0; i < dataActions.length; i++) {
  				var actionsObj = dataActions[i];
  				var actionsName = Object.keys(actionsObj)[0];

  				if (isDefined(actionsCache[actionsName])) {
  					localActions[actionsName] = actionsCache[actionsName];
  				} else {
  					localActions[actionsName] = actionsObj[actionsName]({ stamp: runTime.stamp, msgs: runTime.messages });
  					actionsCache[actionsName] = localActions[actionsName];
  				}
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
  		view(isDefined(propsFromState) ? Object.assign({}, data.props, propsFromState) : data.props, isDefined(localActions) || isDefined(appGlobalActions) ? Object.assign({}, localActions, appGlobalActions) : undefined, index)(nodeOpen, nodeClose, {
  			component: component,
  			lazy: lazy,
  			block: block
  		});

  		subscribesToArray.length = subscribesToArray.length - 1;
  		componentActiveArray.length = componentActiveArray.length - 1;
  		componentActiveIndexArray.length = componentActiveIndexArray.length - 1;
  	};

  	var lazy = function lazy(importModule, lazyComponent, loading, error, time) {

  		var cacheKey = importModule.toString().replace(/ /g, '');
  		var creatingHydrationLayer = renderProcess === 'creatingHydrationLayer';

  		if (lazyCache[cacheKey] === 'error') {
  			if (isFunction(error)) error();
  		} else if (isDefined(lazyCache[cacheKey])) {
  			if (lazyCache[cacheKey] === 'loading') {
  				if (isFunction(loading)) loading();
  			} else {
  				var _lazy = lazyCache[cacheKey][0];
  				if (lazyCount > 0) lazyCount--;
  				if (isFunction(_lazy)) _lazy(lazyCache[cacheKey][1]);
  			}
  		} else {
  			if (lazyCache[cacheKey] !== 'loading') {
  				if (isFunction(loading)) loading();
  				lazyCache[cacheKey] = 'loading';
  				lazyCount++;
  				var thenable = isPromise(importModule) ? Promise.resolve(importModule) : importModule();

  				thenable.then(function (module) {
  					setTimeout(function () {
  						lazyCache[cacheKey] = [lazyComponent, module];
  						runTime.forceReRender(creatingHydrationLayer);
  						if (isBrowser() && !creatingHydrationLayer) {
  							window.dispatchEvent(new CustomEvent('Lazy_Component_Rendered', { detail: { key: cacheKey } }));
  						}
  					}, time || 0);
  				}).catch(function (error) {
  					console.error(error); // eslint-disable-line
  					lazyCache[cacheKey] = 'error';
  					runTime.forceReRender(creatingHydrationLayer);
  					if (isBrowser() && !creatingHydrationLayer) {
  						window.dispatchEvent(new CustomEvent('Lazy_Component_Error', { detail: { key: cacheKey } }));
  					}
  				});
  			}
  		}
  	};

  	var block = function block(key, view, props) {
  		var tag = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'div';


  		creatingBlock = true;
  		var block = '';

  		if (props) {
  			var propKeys = Object.keys(props);
  			for (var i = 0; i < propKeys.length; i++) {
  				var propKey = propKeys[i];
  				props[propKey].id = props[propKey].id || key + '_' + propKey;
  			}
  		}

  		if (!blockCache[key]) {
  			view(props);
  			block = blockVNodes.slice(0);
  			blockCache[key] = block;
  		} else {
  			block = true;
  		}

  		creatingBlock = false;
  		nodeOpen(tag, { id: key + '-block', class: 'karbon-block' }, { key: key }, block, props);
  		// if creating string render children inside block containing element
  		if (renderProcess === 'toString') {
  			view(props);
  		}
  		nodeClose();
  		blockVNodes.length = 0;
  	};

  	var renderRootComponent = function renderRootComponent(comp, data, process) {
  		renderProcess = process;
  		component(comp, data);
  	};

  	return {
  		renderRootComponent: renderRootComponent,
  		component: component,
  		getKeyedNodes: getKeyedNodes,
  		getKeyedNodesPrev: getKeyedNodesPrev,
  		setKeyedNodesPrev: setKeyedNodesPrev,
  		getVDomNodesArray: getVDomNodesArray,
  		resetVDomNodesArray: resetVDomNodesArray,
  		getLazyCount: getLazyCount,
  		getBlockCache: getBlockCache
  	};
  };

  /* eslint-disable no-mixed-spaces-and-tabs */

  var documentCreateElement = function documentCreateElement(tag, isSVG) {
  	return isSVG ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
  };

  var createDomElement = function createDomElement(node) {

  	var nodeProps = node.props;
  	var elProps = Object.keys(nodeProps);
  	var isSVG = node.lang === 'xml';
  	var el = documentCreateElement(node.type, isSVG);

  	var _loop = function _loop(i, len) {

  		var prop = elProps[i];
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
  		} else if (prop === 'text') {
  			el.textContent = value;
  		} else if (prop === 'class') {
  			if (isNotEmpty(value)) el.className = value;
  		} else if (isDefined(el[prop]) && !isSVG) {
  			el[prop] = value;
  		} else {
  			el.setAttribute(prop, value);
  		}
  	};

  	for (var i = 0, len = elProps.length; i < len; i++) {
  		_loop(i, len);
  	}
  	return el;
  };

  var createFragment = function createFragment(vNodes) {

  	var fragment = document.createDocumentFragment();
  	var blockParentNodeStack = [fragment];
  	var nodeLevel = 0;

  	vNodes.map(function (node) {
  		if (node.level === nodeLevel) {
  			blockParentNodeStack.length = blockParentNodeStack.length - 1;
  		} else if (node.level < nodeLevel) {
  			blockParentNodeStack.length = blockParentNodeStack.length - (nodeLevel - node.level);
  		}

  		var element = createDomElement(node);
  		var parentNode = blockParentNodeStack[blockParentNodeStack.length - 1];
  		parentNode.appendChild(element);
  		blockParentNodeStack[blockParentNodeStack.length] = element;
  		nodeLevel = node.level;
  	});

  	return fragment;
  };

  var getChangedNodeProps = function getChangedNodeProps(prevProps, newProps) {

  	var props = [];
  	var values = [];

  	var newPropsKeys = Object.keys(newProps);
  	var prevPropsKeys = Object.keys(prevProps);

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
  			// insert this at the beginning as clearing innerHTML will
  			// strip out any text nodes that are set before
  			if (oldProp !== 'innerHTML') {
  				props[props.length] = oldProp;
  				values[values.length] = oldProp === 'data' ? [] : '';
  			} else {
  				props.unshift(oldProp);
  				values.unshift('');
  			}
  		}
  	}

  	return {
  		props: props,
  		values: values
  	};
  };

  var statefulElements = {
  	radio: true
  };

  var renderObj = {
  	should: null,
  	action: null,
  	keyedAction: null,
  	untrackedHtmlNodes: null,
  	props: null,
  	values: null
  };

  // set props on cached obj. Obj reuse instead of creating new obj. Memory management.
  var updateRenderObj = function updateRenderObj(should) {
  	var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'none';
  	var keyedAction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  	var props = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  	var values = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  	var untrackedHtmlNodes = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

  	renderObj.should = should;
  	renderObj.action = action;
  	renderObj.keyedAction = keyedAction;
  	renderObj.untrackedHtmlNodes = untrackedHtmlNodes;
  	renderObj.props = props;
  	renderObj.values = values;
  };

  var shouldRenderNode = function shouldRenderNode(objPrev, objNew, nR, nodeReplacedFlag, nodeRemovedFlag, currentLevel, forceUpdateStartLevel) {

  	if (objPrev.block && objNew.block) {
  		if (isNull(objNew.keyedAction) && (isUndefined(objNew.blockProps) || objsAreEqual(objPrev.blockProps, objNew.blockProps))) {
  			return false;
  		} else {
  			if (objNew.keyedAction === 'insertOld') {
  				updateRenderObj(true, 'handleKeyedUpdate', 'insertOld', objPrev.blockProps, objNew.blockProps, true);
  			} else {
  				updateRenderObj(true, 'handleKeyedUpdate', 'runBlockUpdates', objPrev.blockProps, objNew.blockProps, true);
  			}
  			return renderObj;
  		}
  	}

  	var prevProps = objPrev.props;
  	var newProps = objNew.props;
  	var notChanged = true;
  	var untrackedHtmlNodes = false;
  	var handleKeyedNode = false;
  	var forceReplace = false;

  	if (objNew.type !== objPrev.type || isNull(prevProps) || isNull(newProps) || isNotNull(objNew.keyedAction)) {
  		notChanged = false;
  	} else {
  		notChanged = objsAreEqual(prevProps, newProps);
  	}

  	var overrideDefaultAction = (nodeReplacedFlag || nodeRemovedFlag) && currentLevel > forceUpdateStartLevel;

  	if (overrideDefaultAction) {

  		// if the dom node was removed previously and we don't want it to
  		// be recreated - do nothing - even though the vdom nodes comparison
  		// triggers a removal action.
  		if (nR.action === 'removed') {
  			return false;
  		}
  		// add new nodes in the case parent has been replaced or removed.
  		// In such cases the children Dom els have been removed but the vdom
  		// nodes still remain unchanged (when comparing) and therefore dont trigger a
  		// dom update. We need to force creation of new nodes to replace those
  		// which were removed when parent was replaced. This override continues for as long
  		// as the node being added is a child of the parent which was replaced.
  		else {
  				if (objNew.keyedAction === 'insertNew') {
  					updateRenderObj(true, 'handleKeyedUpdate', 'insertNew');
  				} else {
  					updateRenderObj(true, 'newNode');
  				}
  				return renderObj;
  			}
  	}

  	if (notChanged) return false;

  	// node changed //
  	//////////////////
  	if (isNotNull(prevProps) && isNotNull(newProps)) {

  		if (isDefined(newProps.innerHTML)) {
  			untrackedHtmlNodes = true;
  		}

  		// when comparing 2 stateful elements - replace previous element with new as
  		// sometimes the new state is not applied. eg. radio box checked attribute when 
  		// the group is different from the previous.
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
  			updateRenderObj(true, 'replaceNode', undefined, undefined, undefined, untrackedHtmlNodes);
  			return renderObj;
  		}

  		//// update node props //
  		// create array of keys, values to be updated //
  		// ////////////////////////////////////////////

  		var _getChangedNodeProps = getChangedNodeProps(prevProps, newProps),
  		    props = _getChangedNodeProps.props,
  		    values = _getChangedNodeProps.values;

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
  				updateRenderObj(true, 'handleKeyedUpdate', 'insertNew', undefined, undefined, untrackedHtmlNodes);
  			} else {
  				updateRenderObj(true, 'newNode', objPrev.keyedAction, undefined, undefined, untrackedHtmlNodes);
  			}

  			return renderObj;
  		}

  		// remove nodes //
  		//////////////////
  		else if (isNotNull(prevProps) && isNull(newProps)) {

  				if (objNew.keyedAction === 'recycled') {
  					return 'recycled';
  				} else if (objNew.keyedAction === 'recyclable') {
  					updateRenderObj(true, 'recyclable');
  					return renderObj;
  				} else {
  					updateRenderObj(true, 'removeNode');
  					return renderObj;
  				}
  			}

  			// If prev node and node props are null do nothing
  			// should never be the case but just here in case to prevent errors
  			else {
  					return false;
  				}
  };

  var updateChangedNode = function updateChangedNode(prop, value, node) {

  	switch (prop) {

  		case 'class':
  			{
  				node.removeAttribute(prop);
  				if (isString(value) && isNotEmpty(value)) {
  					node.className = value;
  				} else if (isArray(value) && value.length > 0) {
  					var _node$classList;

  					(_node$classList = node.classList).add.apply(_node$classList, toConsumableArray(value.filter(Boolean))); //filter out all empty strings
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
  				if (isNotEmpty(styles)) {
  					node.style.cssText = styles;
  				} else {
  					node.removeAttribute(prop);
  				}
  				break;
  			}
  		case 'text':
  			if (node.hasChildNodes()) {
  				var firstChildNode = node.firstChild;
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
  		case 'data':
  			// remove all data attrs
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
  				if (isString(value)) {
  					node[prop] = null;
  				} else {
  					if (isArray(value)) {
  						node[prop] = function (event) {
  							return value[0].apply(null, [].concat(toConsumableArray(value.slice(1)), [event]));
  						};
  					} else {
  						node[prop] = function (event) {
  							return value.apply(null, [event]);
  						};
  					}
  				}
  			} else if (isUndefined(node[prop]) || node instanceof SVGElement) {
  				node.setAttribute(prop, value);
  			} else if (isEmpty(value)) {
  				node[prop] = false;
  				node.removeAttribute(prop);
  			} else {
  				node[prop] = value;
  			}
  	}
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
  	dom: null,
  	block: false,
  	blockProps: undefined,
  	blockChild: false
  };

  var recycledVNodeStatic = Object.assign({}, emptyVNodeStatic, { keyedAction: 'recycled' });

  function syncLists(oldList, newList, keyedNodes, keyedNodesPrev, blockCache) {

  	var newListSynced = [];
  	var oldListSynced = [];
  	var newHead = 0;
  	var oldHead = 0;
  	var newTail = newList.length - 1;
  	var oldTail = oldList.length - 1;

  	function triggerInsertionOfKeyedOrUnkeyedNode(prevNode, node) {
  		if (isDefined(node) && keyedNodesPrev[node.key]) {
  			node.keyedAction = 'insertOld';
  			newListSynced[newListSynced.length] = node;
  			oldListSynced[oldListSynced.length] = keyedNodesPrev[node.key];

  			var _syncLists = syncLists(keyedNodesPrev[node.key].keyedChildren, node.keyedChildren, keyedNodes, keyedNodesPrev),
  			    _syncLists2 = slicedToArray(_syncLists, 2),
  			    oldKeyedChildrenSynced = _syncLists2[0],
  			    newKeyedChildrenSynced = _syncLists2[1];

  			oldListSynced = oldListSynced.concat(oldKeyedChildrenSynced);
  			newListSynced = newListSynced.concat(newKeyedChildrenSynced);
  			oldHead = oldHead + (isDefined(prevNode) && isNotNull(prevNode.keyedChildren) ? prevNode.keyedChildren.length + 1 : 0);
  			newHead = newHead + node.keyedChildren.length + 1;
  			delete keyedNodesPrev[node.key];
  		} else {
  			node.keyedAction = 'insertNew';
  			newListSynced[newListSynced.length] = node;
  			oldListSynced[oldListSynced.length] = emptyVNodeStatic;
  			newHead++;
  		}
  	}

  	function triggerSkipOverOldRecycledKeyedNode(prevNode) {
  		newListSynced[newListSynced.length] = recycledVNodeStatic;
  		oldListSynced[oldListSynced.length] = prevNode;
  		oldHead = oldHead + prevNode.keyedChildren.length + 1;
  	}

  	function triggerRemovalOfKeyedNode(prevNode) {
  		newListSynced[newListSynced.length] = emptyVNodeStatic;
  		oldListSynced[oldListSynced.length] = prevNode;
  		oldHead = oldHead + prevNode.keyedChildren.length + 1;
  		removeKeyFromBlockCache(prevNode);
  	}

  	function triggerPropsCompareOfTwoEqualKeyedNodes(prevNode, node) {
  		node.keyedAction = 'updateAttrs';
  		newListSynced[newListSynced.length] = node;
  		oldListSynced[oldListSynced.length] = prevNode;
  		newHead++;
  		oldHead++;
  		delete keyedNodesPrev[node.key];
  	}

  	function removeKeyFromBlockCache(prevNode) {
  		if (prevNode.block) {
  			blockCache[prevNode.key] = false;
  		} else if (prevNode.blockChild) {
  			prevNode.keyedChildren.map(function (vNode) {
  				if (vNode.block) {
  					blockCache[vNode.key] = false;
  				}
  			});
  		}
  	}

  	function syncNode(prevNode, node) {

  		if (isUndefined(prevNode) || isDefined(node) && prevNode.level < node.level) {

  			if (node.key) {
  				triggerInsertionOfKeyedOrUnkeyedNode(prevNode, node);
  			} else {
  				oldListSynced[oldListSynced.length] = emptyVNodeStatic;
  				newListSynced[newListSynced.length] = node;
  				newHead++;
  			}
  		} else if (isUndefined(node) || isDefined(prevNode) && prevNode.level > node.level) {

  			if (prevNode.key && !keyedNodesPrev[prevNode.key] && keyedNodes[prevNode.key]) {
  				triggerSkipOverOldRecycledKeyedNode(prevNode);
  			} else {
  				newListSynced[newListSynced.length] = emptyVNodeStatic;
  				oldListSynced[oldListSynced.length] = prevNode;
  				oldHead++;
  				removeKeyFromBlockCache(prevNode);
  			}
  		} else {

  			if (prevNode.key) {
  				if (prevNode.key === node.key) {
  					triggerPropsCompareOfTwoEqualKeyedNodes(prevNode, node);
  				} else if (keyedNodes[prevNode.key]) {
  					triggerInsertionOfKeyedOrUnkeyedNode(prevNode, node);
  				} else {
  					triggerRemovalOfKeyedNode(prevNode, node);
  				}
  			} else if (node.key) {
  				// remove old unkeyed node
  				newListSynced[newListSynced.length] = emptyVNodeStatic;
  				oldListSynced[oldListSynced.length] = prevNode;
  				oldHead++;
  			} else {
  				newListSynced[newListSynced.length] = node;
  				oldListSynced[oldListSynced.length] = prevNode;
  				newHead++;
  				oldHead++;
  			}
  		}
  	}

  	while (newHead <= newTail || oldHead <= oldTail) {
  		syncNode(oldList[oldHead], newList[newHead]);
  	}

  	return [oldListSynced, newListSynced];
  }

  // Algorithm for syncing prev vNode array with new vNode array
  // Each node in the vNode array needs to be compared to a node on the same level in the old array
  var syncVNodes = function syncVNodes(domNodes, domNodesPrev, keyedNodes, keyedNodesPrev, blockCache) {

  	var syncedLists = void 0;

  	if (domNodes.length === 0) {
  		for (var i = 0; i < domNodesPrev.length; i++) {
  			domNodes[i] = emptyVNodeStatic;
  		}
  	} else {
  		syncedLists = syncLists(domNodesPrev, domNodes, keyedNodes, keyedNodesPrev, blockCache);
  	}

  	return {
  		domNodes: syncedLists[1],
  		domNodesPrev: syncedLists[0]
  	};
  };

  var getNodeRelations = function getNodeRelations(i, nodes, node, prevNode, nextNode, oldNode, prevOldNode, nextOldNode, currentNodeLevel) {

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

  		if (isDefined(prevOldNode) && isNull(prevNode.props) && isNotNull(prevOldNode.props)) {
  			actionPrev = 'removed';
  		}
  	}

  	if (i < nodes.length - 1) {
  		if (nextNodeLevel < currentNodeLevel) {
  			next = 'parent';
  		} else if (nextNodeLevel > currentNodeLevel) {
  			next = 'child';
  		} else {
  			next = 'sibling';
  		}

  		if (isNull(nextNode.props)) {
  			actionNext = 'removed';
  		} else if (isDefined(nextOldNode) && isNull(nextOldNode.props)) {
  			actionNext = 'add';
  		}
  	}

  	if (isNull(node.props)) {
  		action = 'removed';
  	} else if (isDefined(oldNode) && isNull(oldNode.props)) {
  		action = 'add';
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

  var keyedNodeRecycleBin = {};
  var $_parentNodeStack = [];
  var childNodeIndexes = [];
  var nodeReplacedFlag = void 0;
  var nodeRemovedFlag = void 0;
  var handleUntrackedHtmlNodesFlag = void 0;
  var forceUpdateStartLevel = void 0;
  var $_parentNode = void 0;
  var $_currentNode = void 0;
  var $_prevParentCache = void 0;
  var node = void 0;
  var prevNode = void 0;
  var currentLevel = void 0;
  var nR = void 0;
  var nodeIsListeningToStateKey = void 0;
  var renderNode = void 0;
  var prevLevel = void 0;
  var domOpsCount = void 0;
  var domOpsComplete = void 0;
  var syncedVNodes = void 0;
  var subscribesTo = void 0;

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

  var replaceNode = function replaceNode(parentNode, newNode, oldNode) {
  	if (isDefined(oldNode) && isNotNull(oldNode)) {
  		parentNode.replaceChild(newNode, oldNode);
  	} else {
  		parentNode.appendChild(newNode);
  	}
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

  var updateBlockProperties = function updateBlockProperties(renderNode) {
  	var keys = Object.keys(renderNode.values);
  	for (var i = 0; i < keys.length; i++) {
  		var key = keys[i];
  		var newProps = renderNode.values[key];

  		var _getChangedNodeProps = getChangedNodeProps(renderNode.props[key], newProps),
  		    props = _getChangedNodeProps.props,
  		    values = _getChangedNodeProps.values;

  		if (props.length > 0) {
  			domOpsCount++;
  			updateProperties(props, values, document.getElementById(newProps.id));
  		}
  	}
  };

  var patch = function patch() {

  	renderNode = shouldRenderNode(prevNode, node, nR, nodeReplacedFlag, nodeRemovedFlag, currentLevel, forceUpdateStartLevel);

  	if (currentLevel <= forceUpdateStartLevel) {
  		nodeReplacedFlag = false;
  		nodeRemovedFlag = false;
  	}

  	if (renderNode.should) {

  		if (handleUntrackedHtmlNodesFlag) {
  			// Increase the child node index by 1 as all untracked nodes created by using
  			// innerHTML prop will be wrapped in a containing element to prevent breaking the 
  			// vdom -> real dom relation
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
  					$_parentNode.appendChild($_currentNode);
  					domOpsCount++;
  					break;
  				}

  			case 'replaceNode':
  				{
  					$_currentNode = createDomElement(node);
  					node.dom = $_currentNode;
  					replaceNode($_parentNode, $_currentNode, prevNode.dom);
  					nodeReplacedFlag = true;
  					forceUpdateStartLevel = currentLevel;
  					domOpsCount++;
  					break;
  				}

  			case 'removeNode':
  				{
  					var nodeToRemove = prevNode.dom;
  					if (isNotNullandIsDef(nodeToRemove)) {
  						$_parentNode.removeChild(nodeToRemove);
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

  					var currentDomNode = $_parentNode.children[getDomIndex(currentLevel)];
  					var recycledDomNode = prevNode.dom;
  					var keyedAction = renderNode.keyedAction;
  					$_currentNode = recycledDomNode;

  					if (keyedAction === 'runBlockUpdates') {
  						if (isNotNull(renderNode.props)) {
  							updateBlockProperties(renderNode);
  						}
  					} else if (keyedAction === 'insertNew') {
  						$_currentNode = createDomElement(node);
  						if (node.block) {
  							$_currentNode.appendChild(createFragment(node.block));
  						}
  						$_parentNode.insertBefore($_currentNode, currentDomNode);
  						domOpsCount++;
  					} else if (keyedAction === 'insertOld') {
  						$_parentNode.insertBefore(recycledDomNode, currentDomNode);
  						keyedNodeRecycleBin[node.key] = true;
  						domOpsCount++;
  						if (!node.block) {
  							if (renderNode.props.length > 0) {
  								updateProperties(renderNode.props, renderNode.values, $_currentNode);
  							}
  						} else {
  							if (isNotNull(renderNode.props)) {
  								updateBlockProperties(renderNode);
  							}
  						}
  					} else if (isDefined(currentDomNode) && !currentDomNode.isEqualNode(recycledDomNode)) {
  						swapElements($_parentNode, currentDomNode, recycledDomNode);
  						keyedNodeRecycleBin[node.key] = true;
  						domOpsCount++;
  						if (!node.block) {
  							if (renderNode.props.length > 0) {
  								updateProperties(renderNode.props, renderNode.values, $_currentNode);
  							}
  						} else {
  							if (isNotNull(renderNode.props)) {
  								updateBlockProperties(renderNode);
  							}
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

  var createView = function createView(appContainer, domNodes, domNodesPrev, changedStateKeys, keyedNodes, keyedNodesPrev, isHydrating, blockCache) {

  	nodeReplacedFlag = false;
  	nodeRemovedFlag = false;
  	handleUntrackedHtmlNodesFlag = false;
  	forceUpdateStartLevel = null;
  	$_parentNode = undefined;
  	$_currentNode = undefined;
  	$_prevParentCache = undefined;
  	node = undefined;
  	prevNode = undefined;
  	currentLevel = undefined;
  	nR = undefined;
  	nodeIsListeningToStateKey = false;
  	renderNode = undefined;
  	prevLevel = 0;
  	domOpsCount = 0;
  	domOpsComplete = false;
  	syncedVNodes = undefined;
  	subscribesTo = null;

  	//reset obj and arrays for reuse
  	clearObject(keyedNodeRecycleBin);
  	$_parentNodeStack.length = 0;
  	childNodeIndexes.length = 0;

  	if (virtualDom.isInitialized() && virtualDom.requiresSync()) {
  		syncedVNodes = syncVNodes(domNodes.slice(0), domNodesPrev, keyedNodes, keyedNodesPrev, blockCache);
  		domNodes = syncedVNodes.domNodes;
  		domNodesPrev = syncedVNodes.domNodesPrev;
  	}

  	for (var i = 0, len = domNodes.length; i < len; i++) {

  		if (domOpsComplete || virtualDom.getDomUpdatesLimit() === domOpsCount) domOpsComplete = true;

  		if (!domOpsComplete) {

  			node = domNodes[i];
  			prevNode = domNodesPrev[i];

  			if (isUndefined(node)) break;

  			currentLevel = node.level || prevNode.level;
  			nR = getNodeRelations(i, domNodes, node, domNodes[i - 1], domNodes[i + 1], prevNode, domNodesPrev[i - 1], domNodesPrev[i + 1], currentLevel);
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
  			// Render all nodes on initial page load
  			////////////////////////////////////////
  			if (!virtualDom.isInitialized() && !isHydrating) {

  				$_currentNode = createDomElement(node);
  				$_parentNode.appendChild($_currentNode);
  				node.dom = $_currentNode;

  				if (node.block) {
  					$_currentNode.appendChild(createFragment(node.block));
  				}
  			} else {

  				if (isHydrating) {
  					// add dom node ref to prev vnodes dom property
  					prevNode.dom = $_parentNode.children[getDomIndex(currentLevel)];
  				}

  				// Reconcile DOM after state updates //
  				//////////////////////////////////////////

  				// All nodes are subscribed to a specific part of the state through the
  				// 'subscribe" key in the component. If a part of the state changes
  				// but the node is not subscribed we do not need to update any props. 
  				nodeIsListeningToStateKey = false;

  				// check if the node 'subcribesTo' value matches any of the state key
  				// which have been changed. If so 'node is listening to change' so go
  				// ahead with DOM updates.
  				subscribesTo = node.subscribesTo || prevNode.subscribesTo;

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
  					patch();
  				} else if (prevNode.parentComponent === node.parentComponent && isNotNull(node.props) && isNotNull(prevNode.props) && !nodeReplacedFlag && !nodeRemovedFlag && node.type === prevNode.type && node.keyedAction !== 'insertOld') {
  					// noop
  					/////////////
  					node.dom = prevNode.dom;
  					$_currentNode = node.dom;
  				} else {
  					// not listening to current state change but needs to re-rendered for sum reason eg. parent node was replaced
  					patch();
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

  var createString = function createString(vDomNodes) {

  	var htmlString = '';
  	var node = void 0;
  	var nextNode = void 0;
  	var closingTagStack = [];

  	for (var i = 0, len = vDomNodes.length; i < len; i++) {
  		node = vDomNodes[i];
  		nextNode = vDomNodes[i + 1];

  		// open tag
  		htmlString += '<' + node.type;

  		// add props
  		var propKeys = void 0;

  		// remove test and event handlers from pros obj
  		propKeys = Object.keys(node.props).filter(function (value) {
  			return value !== 'text' && value[0] != 'o' && value[1] != 'n';
  		});

  		propKeys.forEach(function (key) {

  			if (key === 'style') {
  				htmlString += ' style="';
  				var styleKeys = Object.keys(node.props.style);
  				styleKeys.forEach(function (key, idx) {
  					htmlString += key + ':' + node.props.style[key] + ';';
  					if (idx !== styleKeys.length - 1) {
  						htmlString += ' ';
  					}
  				});
  				htmlString += '"';
  			} else if (Array.isArray(node.props[key])) {
  				if (key === 'data') {
  					node.props.data.forEach(function (dataAttr) {
  						htmlString += ' ' + 'data-' + dataAttr;
  					});
  				} else if (key === 'class') {
  					node.props.class.forEach(function (className) {
  						htmlString += ' ' + className;
  					});
  				}
  			} else {
  				htmlString += ' ' + key + '="' + node.props[key] + '"';
  			}
  		});

  		// close tag
  		if (voidedElements[node.type]) {
  			htmlString += '/>';
  		} else {
  			closingTagStack.push(node.type);
  			htmlString += '>';

  			// add text and inner html
  			if (node.props.text) {
  				htmlString += node.props.text;
  			}

  			if (node.props.innerHTML) {
  				htmlString += node.props.innerHTML;
  			}

  			if (nextNode) {
  				if (nextNode.level === node.level) {
  					htmlString += '</' + closingTagStack.pop() + '>';
  				} else if (nextNode.level < node.level) {
  					var retrace = node.level - nextNode.level;
  					for (var x = 0; x <= retrace; x++) {
  						htmlString += '</' + closingTagStack.pop() + '>';
  					}
  				}
  			} else {
  				var remaining = closingTagStack.length;
  				for (var _x = 0; _x < remaining; _x++) {
  					htmlString += '</' + closingTagStack.pop() + '>';
  				}
  			}
  		}
  	}

  	return htmlString;
  };

  var vDomNodeBuilder = void 0;
  var vDomNodesArrayPrevious = [];

  var renderString = function renderString(karbon, appId) {

  	var runTime = karbon.runTime[appId];
  	var asyncResolve = karbon.toStringAsyncResolve[appId];
  	vDomNodeBuilder = isDefined(vDomNodeBuilder) ? vDomNodeBuilder : {};
  	vDomNodeBuilder[appId] = isDefined(vDomNodeBuilder[appId]) ? vDomNodeBuilder[appId] : nodeBuilder(runTime, karbon.appGlobalActions[appId]);
  	var nodeBuilderInstance = vDomNodeBuilder[appId];
  	nodeBuilderInstance.renderRootComponent({ $$_appRootView: karbon.appView[appId] }, { props: runTime.getState() }, 'toString');

  	if (asyncResolve && nodeBuilderInstance.getLazyCount() === 0) {
  		asyncResolve(createString(nodeBuilderInstance.getVDomNodesArray()));
  	} else if (!asyncResolve) {
  		return createString(nodeBuilderInstance.getVDomNodesArray());
  	} else {
  		nodeBuilderInstance.resetVDomNodesArray();
  	}
  };

  var hydrateApp = function hydrateApp(karbon, appId, firstRender, changedStateKeys, sequenceId, sequenceCache) {

  	var runTime = karbon.runTime[appId];
  	vDomNodeBuilder = isDefined(vDomNodeBuilder) ? vDomNodeBuilder : {};
  	vDomNodeBuilder[appId] = isDefined(vDomNodeBuilder[appId]) ? vDomNodeBuilder[appId] : nodeBuilder(runTime, karbon.appGlobalActions[appId]);
  	var nodeBuilderInstance = vDomNodeBuilder[appId];
  	nodeBuilderInstance.renderRootComponent({ $$_appRootView: karbon.appView[appId] }, { props: runTime.getState() }, 'creatingHydrationLayer');

  	if (nodeBuilderInstance.getLazyCount() !== 0) {
  		nodeBuilderInstance.resetVDomNodesArray();
  	} else {
  		vDomNodesArrayPrevious = nodeBuilderInstance.getVDomNodesArray().slice(0);

  		renderApp(karbon, appId, firstRender, changedStateKeys, sequenceId, sequenceCache, true);
  	}
  };

  var renderApp = function renderApp(karbon, appId, firstRender, changedStateKeys, sequenceId, sequenceCache, isHydrating) {

  	var runTime = karbon.runTime[appId];
  	var globalActions = karbon.appGlobalActions[appId];
  	var appInit = karbon.appOnInit[appId];
  	var nodeBuilderInstance = void 0;

  	if (!firstRender || isHydrating) {
  		nodeBuilderInstance = vDomNodeBuilder[appId];
  		vDomNodesArrayPrevious = nodeBuilderInstance.getVDomNodesArray().slice(0);
  		nodeBuilderInstance.resetVDomNodesArray();
  	} else {
  		vDomNodeBuilder = isDefined(vDomNodeBuilder) ? vDomNodeBuilder : {};
  		vDomNodeBuilder[appId] = nodeBuilder(runTime, globalActions);
  		nodeBuilderInstance = vDomNodeBuilder[appId];
  		virtualDom.setInitialized(false);
  		virtualDom.setSync(false);
  	}

  	nodeBuilderInstance.setKeyedNodesPrev();
  	nodeBuilderInstance.renderRootComponent({ $$_appRootView: karbon.appView[appId] }, { props: runTime.getState() }, 'toDom');

  	createView(karbon.appContainer[appId], nodeBuilderInstance.getVDomNodesArray(), vDomNodesArrayPrevious, changedStateKeys, nodeBuilderInstance.getKeyedNodes(), nodeBuilderInstance.getKeyedNodesPrev(), isHydrating, nodeBuilderInstance.getBlockCache());

  	if (!firstRender && !isHydrating) {
  		runTime.exeQueuedMsgs(undefined, sequenceId, undefined, sequenceCache);
  	} else {
  		if (isFunction(appInit)) appInit(globalActions);
  		virtualDom.setInitialized(true);
  		virtualDom.setSync(true);
  	}
  };

  var globalActions = function globalActions(actions, runTime) {

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
  };

  var subscription = function () {

  	var cache = {};

  	var getCache = function getCache() {
  		return cache;
  	};

  	var setCache = function setCache(key, value) {
  		cache[key] = value;
  	};

  	var addEvent = function addEvent(el, name, functRef, funct) {
  		var args = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

  		cache[functRef] = {
  			fun: function fun(event) {
  				funct.apply(null, [].concat(toConsumableArray(args), [event]));
  			},
  			el: el,
  			name: name
  		};
  		el.addEventListener(name, cache[functRef].fun);
  	};

  	var removeEvent = function removeEvent(el, name, functRef) {
  		el.removeEventListener(name, cache[functRef].fun);
  		delete cache[functRef];
  	};

  	return {
  		addEvent: addEvent,
  		removeEvent: removeEvent,
  		getCache: getCache,
  		setCache: setCache
  	};
  }();

  var handleSubscriptions = function handleSubscriptions(subs, appId, appTap) {

    /* START.DEV_ONLY */
    var subsStatus = [];
    /* END.DEV_ONLY */

    var _loop = function _loop(i) {

      var sub = subs[i];
      var action = isArray(sub.action) ? sub.action[0] : sub.action;
      var cache = subscription.getCache();

      if (sub.action && isUndefined(action.name)) {
        Object.defineProperty(action.prototype, 'name', {
          get: function get$$1() {
            return (/function ([^(]*)/.exec(this + '')[1]
            );
          }
        });
      }

      action = isArray(sub.action) ? function (arg) {
        var _sub$action;

        return (_sub$action = sub.action)[0].apply(_sub$action, toConsumableArray(sub.action.slice(1)).concat([arg]));
      } : sub.action;
      var subKey = (sub.key || '') + action.name + '_' + (sub.name || 'sub-key').toString().replace(/\s/g, '');
      sub.key = subKey;

      /* START.DEV_ONLY */
      if (isNullorUndef(subKey)) {
        console.warn('Please add an explicit id ({id: "identifierName"}) to subscription obj due to action.name not being supported by this browser');
      }
      /* END.DEV_ONLY */

      if (!sub.name) {

        // this subscription action is called whenever the state changes
        if (isUndefined(sub.when) && isUndefined(sub.watch)) {
          action();
        }
        // this subscription action is called once whenever the state changes and the 'when' condition is met
        else if (sub.when || !!sub.watch) {
            if (sub.when || isUndefined(sub.when) && !sub.watch || !!sub.watch && !cache[sub.key]) {
              cache[sub.key] = {
                when: sub.when,
                watch: sub.watch,
                unmount: null
              };
              action();
            }
          }
          // this subscription action is called once whenever the state changes and the 'when' condition is not met
          else {
              if (cache[sub.key]) {
                if (sub.when === false) {
                  delete cache[sub.key];
                } else if (sub.watch && sub.watch !== cache[sub.key].watch) {
                  cache[sub.key].watch = sub.watch;
                  action();
                }
              }
            }
      }
      // function denoted user or custom sub
      else if (isFunction(sub.name)) {

          if (sub.when || isUndefined(sub.when) && !sub.watch || !!sub.watch && !cache[sub.key]) {

            if (isUndefined(cache[sub.key])) {
              subscription.setCache(sub.key, {
                when: sub.when,
                watch: sub.watch,
                unmount: sub.name(action, sub.options)
              });
            }
          } else {

            var cachedSub = cache[sub.key];
            if (cachedSub) {
              if (sub.when === false) {
                if (isFunction(cachedSub.unmount)) {
                  cachedSub.unmount();
                }
                delete cache[sub.key];
              } else if (sub.watch && sub.watch !== cachedSub.watch) {
                if (isFunction(cachedSub.unmount)) {
                  cachedSub.unmount();
                }
                cachedSub.watch = sub.watch;
                sub.name(action, sub.options);
              }
            }
          }

          /* START.DEV_ONLY */
          if (isDefined(appTap[appId].subscriptions)) {
            subsStatus.push({ name: sub.name.name, active: isNullorUndef(sub.when) ? true : sub.when, action: action.name });
          }
          /* END.DEV_ONLY */
        }
        // string denotes event sub
        else if (isString(sub.name)) {

            if (sub.when || isUndefined(sub.when)) {

              if (isUndefined(cache[sub.key])) {

                subscription.addEvent(sub.el || window, sub.name, subKey, action, isArray(sub.action) ? sub.action.slice(1) : undefined);

                /* START.DEV_ONLY */
                if (isDefined(appTap[appId].subscriptions)) {
                  subsStatus.push({ name: sub.name, active: true, action: action.name });
                }
                /* END.DEV_ONLY */
              }
            } else if (cache[sub.key]) {

              subscription.removeEvent(sub.el || window, sub.name, subKey);

              /* START.DEV_ONLY */
              if (isDefined(appTap[appId].subscriptions)) {
                subsStatus.push({ name: sub.name, active: false, action: action.name });
              }
              /* END.DEV_ONLY */
            }
          }
    };

    for (var i = 0; i < subs.length; i++) {
      _loop(i);
    }

    /* START.DEV_ONLY */
    if (isDefined(appTap[appId].subscriptions)) {
      appTap[appId].subscriptions({ subs: subsStatus });
    }
    /* END.DEV_ONLY */
  };

  /* eslint-disable no-console */

  var karbon = function () {
  	return {

  		runTime: {},
  		appContainer: {},
  		appView: {},
  		appGlobalActions: {},
  		appSubs: {},
  		appOnInit: {},
  		renderToString: {},
  		toStringAsyncResolve: {},
  		process: {},
  		appCounter: 0,
  		/* START.DEV_ONLY */
  		appTap: {},
  		/* END.DEV_ONLY */

  		render: function render(appConfig) {
  			this.init(appConfig, false, 'render');
  		},
  		hydrate: function hydrate(appConfig) {
  			this.init(appConfig, false, 'hydrate');
  		},
  		toString: function toString(appConfig) {
  			return this.init(appConfig, true, 'string');
  		},
  		toStringAsync: function toStringAsync(appConfig) {
  			var _this = this;

  			return new Promise(function (resolveOuter) {
  				_this.toStringAsyncPromise = new Promise(function (resolveInner) {
  					_this.init(appConfig, true, 'toStringAsync', resolveInner);
  				});
  				_this.toStringAsyncPromise.then(function (htmlString) {
  					resolveOuter(htmlString);
  				});
  			});
  		},
  		init: function init(appConfigObj, renderToString, process, asyncStringResolve) {

  			this.appCounter++;

  			var appId = this.appCounter;
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
  				return renderString(this, appId);
  			} else if (this.process[appId] === 'hydrate') {
  				// hydration only happens once - update 'process' to ensure dom is rendered on future state changes
  				this.process[appId] = 'render';

  				hydrateApp(this, appId, true // firstRender
  				);
  			} else {
  				this.appContainer[appId].innerHTML = '';

  				renderApp(this, appId, true // firstRender				
  				);
  			}
  		},
  		initGlobalActions: function initGlobalActions(actions, runTime) {
  			return globalActions(actions, runTime);
  		},
  		handleSubs: function handleSubs(subs, appId) {
  			handleSubscriptions(subs, appId, this.appTap);
  		},
  		runHandleSubs: function runHandleSubs(appId) {
  			if (isFunction(this.appSubs[appId])) {
  				this.handleSubs(this.appSubs[appId](this.runTime[appId].getState(), this.appGlobalActions[appId]), appId);
  			}
  		},
  		reRender: function reRender(changedStateKeys, sequenceId, appId, sequenceCache, creatingHydrationLayer) {

  			if (creatingHydrationLayer) {
  				hydrateApp(this, appId, true // firstRender
  				);
  			} else if (this.process[appId] === 'render') {
  				renderApp(this, appId, false, // firstRender
  				changedStateKeys, sequenceId, sequenceCache);
  			} else if (this.renderToString[appId] && this.process[appId] === 'toStringAsync') {
  				renderString(this, appId);
  			}
  		}
  	};
  }();

  var render = karbon.render.bind(karbon);
  var hydrate = karbon.hydrate.bind(karbon);
  var toString = karbon.toString.bind(karbon);
  var toStringAsync = karbon.toStringAsync.bind(karbon);

  exports.render = render;
  exports.hydrate = hydrate;
  exports.toString = toString;
  exports.toStringAsync = toStringAsync;

  return exports;

}({}));
