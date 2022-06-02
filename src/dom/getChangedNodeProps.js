
import { isDefined, isObject, isArray, objsAreEqual, arraysAreEqual } from '../utils/utils';

export const getChangedNodeProps = (prevProps, newProps) => {
  
	const props = [];
	const values = [];  

	const newPropsKeys = Object.keys(newProps);
	const prevPropsKeys = Object.keys(prevProps);

	let key;
	let value;

	for (let i = 0; i < newPropsKeys.length; i++) {

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
	for (let i = 0; i < prevPropsKeys.length; i++) {
		const oldProp = prevPropsKeys[i];
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
		props,
		values
	};

};
