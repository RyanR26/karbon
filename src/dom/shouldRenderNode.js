import { isDefined, isUndefined, isNull, isNotNull, objsAreEqual } from '../utils/utils';
import { getChangedNodeProps } from '../dom/getChangedNodeProps';

const statefulElements = {
	radio: true
};

const renderObj = {
	should: null,
	action: null,
	keyedAction: null,
	untrackedHtmlNodes: null,
	props: null,
	values: null
};

// set props on cached obj. Obj reuse instead of creating new obj. Memory management.
const updateRenderObj = (
	should, 
	action='none', 
	keyedAction=null, 
	props=null, 
	values=null, 
	untrackedHtmlNodes=false
) => {
	renderObj.should = should;
	renderObj.action = action;
	renderObj.keyedAction = keyedAction;
	renderObj.untrackedHtmlNodes = untrackedHtmlNodes;
	renderObj.props = props;
	renderObj.values = values;
};

export const shouldRenderNode = (
	objPrev, 
	objNew, 
	nR, 
	nodeReplacedFlag, 
	nodeRemovedFlag, 
	currentLevel, 
	forceUpdateStartLevel
) => {

	if (objPrev.block && objNew.block) {
		if (isUndefined(objNew.blockProps) || objsAreEqual(objPrev.blockProps, objNew.blockProps)) {
			return false;
		} else {
			updateRenderObj(true, 'handleKeyedUpdate', 'runBlockUpdates', objPrev.blockProps, objNew.blockProps, true);
			return renderObj;
		}
	}

	const prevProps = objPrev.props;
	const newProps = objNew.props;
	let notChanged = true;
	let untrackedHtmlNodes = false;
	let handleKeyedNode = false;
	let forceReplace = false;

	if (objNew.type !== objPrev.type || isNull(prevProps) || isNull(newProps) || isNotNull(objNew.keyedAction)) {
		notChanged = false;
	} else {
		notChanged = objsAreEqual(prevProps, newProps);
	}

	const overrideDefaultAction = (nodeReplacedFlag || nodeRemovedFlag) && (currentLevel > forceUpdateStartLevel);

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

		const { props, values } = getChangedNodeProps(prevProps, newProps);

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
			updateRenderObj(true, 'handleKeyedUpdate', objNew.keyedAction, undefined, undefined, untrackedHtmlNodes);
		} else {
			updateRenderObj(true, 'newNode', objPrev.keyedAction, undefined, undefined, untrackedHtmlNodes);
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

	// If prev node and node props are null do nothing
	// should never be the case but just here in case to prevent errors
	else {
		return false;
	}
};