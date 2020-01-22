/// UTILITIES ///

export const isUndefined = (value) => {
	return value === void 0;
};

export const isDefined = (value) => {
	return value !== void 0;
};

export const isNull = (value) => {
	return value === null;
};

export const isNotNull = (value) => {
	return value !== null;
};

export const isNullorUndef = (value) => {
	return isUndefined(value) || isNull(value);
};

export const isNotNullandIsDef = (value) => {
	return value !== null && value !== void 0;
};

export const isFalse = (value) => {
	return value === false;
};

export const isNotFalse = (value) => {
	return value !== false;
};

export const isEmpty = (value) => {
	return value === '';
};

export const isNotEmpty = (value) => {
	return value !== '';
};

export const isNullorUndeforEmpty = (value) => {
	return isUndefined(value) || isNull(value) || isEmpty(value);
};

export const isFunction = (value) => {
	return typeof value === 'function';
};

export const isObject = (value) => {
	return typeof value === 'object';
};

export const isArray = (value) => {
	return isNull(value) ? false : isObject(value) && isDefined(value.length);
};

export const isNumber = (value) => {
	return typeof value === 'number';
};

export const isString = (value) => {
	return typeof value === 'string';
};

export const getLastItemsFromArr = (arr, noOfItems) => {
	return arr[arr.length - noOfItems];
};

export const randomStringId = () => {
	return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
};

export const arraysAreEqual = (arr1, arr2) => {
	const arr1Length = arr1.length;
	const arr2Length = arr2.length;
	if(arr1Length !== arr2Length) return false;
	for(let i = 0; i < arr1Length; i++) {
		if(arr1[i] !== arr2[i]) return false;
	}
	return true;
};

const isArr = Array.isArray;
const keyList = Object.keys;
const hasProp = Object.prototype.hasOwnProperty;

export const objsAreEqual = (a, b) => {
	if (a === b) return true;
  
	if (a && b && typeof a == 'object' && typeof b == 'object') {
		const arrA = isArr(a);
		const arrB = isArr(b);
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
			let value = propTypes[key];
			if (value === 'array') {
				if (!isArray(props[key])) {
					propTypeFailed(key, value, componentName);
				}
			}
			else if (value !== typeof (props[key])) {
				propTypeFailed(key, value, componentName);
			}
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

