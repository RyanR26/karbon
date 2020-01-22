
export const virtualDom = (() => {

	let initialized = false;
	let syncNodes = true;
	let domUpdatesLimit = false;

	const isInitialized = () => initialized;

	const setInitialized = value => initialized = value;

	const requiresSync = () => syncNodes;

	const setSync = value => syncNodes = value;

	const constrainDomUpdates = value => domUpdatesLimit = value;

	const getDomUpdatesLimit = () => domUpdatesLimit;

	return {
		isInitialized,
		setInitialized,
		requiresSync,
		setSync,
		constrainDomUpdates,
		getDomUpdatesLimit 
	};
})();