export const subscription = (() => {

	let cache = {};

	const getCache = () => cache;

	const add = (el, eventName, functRef, funct, args=[], typeLocal) => {
		cache[functRef] = {
      fun: function (event) { funct.apply(null, [...args, event]); },
      el,
      eventName, 
      typeLocal
    };
		el.addEventListener(eventName, cache[functRef].fun);
	};

	const remove = (el, eventName, functRef) => {
		el.removeEventListener(eventName, cache[functRef].fun);
		delete cache[functRef];
	};

	return {
		add,
		remove,
		getCache
	};
})();