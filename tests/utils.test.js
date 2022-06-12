/* eslint-disable no-undef */
/* eslint-disable indent */
import { arraysAreEqual, isDefined, isUndefined, isNotNull } from '../src/utils/utils';

const function1 = index => {
	return index + 1;
};

const function2 = index => {
	return index + 1;
};

test('isNotNull', () => {
	expect(isNotNull('string')).toBe(true);
});

test('isDefined', () => {
	expect(isDefined('string')).toBe(true);
});

test('isUndefined', () => {
	let test;
	expect(isUndefined(test)).toBe(true);
});

test('arrays are equal', () => {
	const array1 = [function1, 1];
	const array2 = [function1, 1];
	expect(arraysAreEqual(array1, array2)).toBe(true);
});

test('arrays are equal- diff order', () => {
	const array1 = [1, function1];
	const array2 = [function1, 1];
	expect(arraysAreEqual(array1, array2)).toBe(false);
});

test('arrays are not equal - number', () => {
	const array1 = [function1, 1];
	const array2 = [function1, 2];
	expect(arraysAreEqual(array1, array2)).toBe(false);
});

test('arrays are not equal - funciton', () => {
	const array1 = [function1, 1];
	const array2 = [function2, 2];
	expect(arraysAreEqual(array1, array2)).toBe(false);
});