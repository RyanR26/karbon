export const subscription = (() => {

	let cache = {};

	const getCache = () => cache;

	const add = (el, eventName, functRef, funct, args = []) => {
		args = args || [];
		cache[functRef] = function (event) { funct.apply(null, [...args, event]); };
		el.addEventListener(eventName, cache[functRef]);
	};

	const remove = (el, eventName, functRef) => {
		el.removeEventListener(eventName, cache[functRef]);
		cache[functRef] = undefined;
	};

	return {
		add,
		remove,
		getCache
	};
})();