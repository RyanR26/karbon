/// UTILITIES ///

export const isUndefined = value => value === void 0;

export const isDefined = value => value !== void 0;

export const isNull = value => value === null;

export const isNotNull = value => value !== null;

export const isNullorUndef = value => isUndefined(value) || isNull(value);

export const isNotNullandIsDef = value => value !== null && value !== void 0;

export const isFalse = value => value === false;

export const isNotFalse = value => value !== false;

export const isEmpty = value => value === '';

export const isNotEmpty = value => value !== '';

export const isNullorUndeforEmpty = value => isUndefined(value) || isNull(value) || isEmpty(value);

export const isFunction = value => typeof value === 'function';

export const isObject = value => typeof value === 'object';

export const isArray = Array.isArray;

export const isNumber = value => typeof value === 'number';

export const isString = value => typeof value === 'string';

export const isPromise = value => value instanceof Promise;

export const getLastItemsFromArr = (arr, noOfItems) => arr[arr.length - noOfItems];

export const randomStringId = () => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);

export const clearObject = obj => {
	for (let prop in obj) {
		delete obj[prop];
	}
};

export const arraysAreEqual = (arr1, arr2) => {
	if (arr1.length !== arr2.length) return false;
	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
};

const keyList = Object.keys;
const hasProp = Object.prototype.hasOwnProperty;

export const objsAreEqual = (a, b) => {
	if (a === b) return true;
  
	if (a && b && typeof a == 'object' && typeof b == 'object') {
		const arrA = isArray(a);
		const arrB = isArray(b);
		let i;
		let length;
		let key;
	
		if (arrA && arrB) {
			length = a.length;
			if (length != b.length) return false;
			for (i = length; i-- !== 0;)
				if (!objsAreEqual(a[i], b[i])) return false;
			return true;
		}
		
		const keys = keyList(a);
		length = keys.length;

		if (length !== keyList(b).length) return false;

		for (i = length; i-- !== 0;)
			if (!hasProp.call(b, keys[i])) return false;

		for (i = length; i-- !== 0;) {
			key = keys[i];
			if (!objsAreEqual(a[key], b[key])) return false;
		}

		return true;
	}
  
	return a!==a && b!==b;
};

/* START.DEV_ONLY */

export const checkPropTypes = (props, propTypes, componentName) => {

	const propTypeFailed = (key, value, componentName) => {
		// eslint-disable-next-line no-console
		console.warn(`prop type of '${key}' in component '${componentName}' is incorrect. Got '${typeof(props[key])}' when should be '${value}'`);
	};

	if (isDefined(propTypes)) {
		for (let key in propTypes) {
      
			let success = false;
			let failedKey;
			let failedValue;
			let value = propTypes[key];

			if (!isArray(value)) value = [value];

			for (let i=0; i<value.length; i++) {
				const val = value[i];
				if ((val === 'array' && isArray(props[key])) || val === typeof (props[key])) {
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

export const propTypes = {
	string: 'string',
	number: 'number',
	boolean: 'boolean',
	array: 'array',
	object: 'object',
	function: 'function',
	bigint: 'bigint',
	undefined: 'undefined'
};

/* END.DEV_ONLY */

