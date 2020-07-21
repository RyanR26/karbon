import { isDefined, isNull, isNotNull, isObject, isArray, objsAreEqual, arraysAreEqual } from '../utils/utils';

const props = [];
const values = [];
let newPropsKeys;
let prevPropsKeys;

const renderObj = {
	should: null,
	action: null,
	keyedAction: null,
	untrackedHtmlNodes: null,
	props: null,
	values: null
};

// set props on cached obj. Obj reuse instead of creating new obj. Memory mangement.
const updateRenderObj = (should, action='none', keyedAction=null, props=null, values=null) => {
	renderObj.should = should;
	renderObj.action = action;
	renderObj.keyedAction = keyedAction;
	renderObj.untrackedHtmlNodes = untrackedHtmlNodes;
	renderObj.props = props;
	renderObj.values = values;
};

let prevProps;
let newProps;
let notChanged;
let untrackedHtmlNodes;
let handleKeyedNode;
let overrideDefaultAction;
let forceReplace;

const statefulElements = {
	radio: true
};

export const shouldRenderNode = (objPrev, objNew, nR, nodeReplacedFlag, nodeRemovedFlag, currentLevel, forceUpdateStartLevel) => {

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
		notChanged = (objsAreEqual(prevProps, newProps));
	}

	overrideDefaultAction = (nodeReplacedFlag || nodeRemovedFlag) && (currentLevel > forceUpdateStartLevel);

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
		// which were removed when parent was replaced. This overide continues for as long
		// as the node being added is a child of the parent which was replaced.
		else {
			updateRenderObj(true, 'newNode');
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

		if (isDefined(newProps.innerHTML))  {
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
		}
		else if (objNew.keyedAction === 'recyclable') {
			updateRenderObj(true, objNew.keyedAction);
			return renderObj;
		}
		else {
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