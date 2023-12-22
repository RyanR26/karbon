export const subscription = (() => {

	const cache = {};

	const getCache = () => {
    return cache;
  };

  const setCache = (key, value) => {
    cache[key] = value;
  };

	const addEvent = (el, name, functRef, funct, args=[]) => {
		cache[functRef] = {
      fun: function (event) { funct.apply(null, [...args, event]); },
      el,
      name, 
    };
		el.addEventListener(name, cache[functRef].fun);
	};

	const removeEvent = (el, name, functRef) => {
		el.removeEventListener(name, cache[functRef].fun);
		delete cache[functRef];
	};

	return {
		addEvent,
		removeEvent,
		getCache,
    setCache
	};
})();