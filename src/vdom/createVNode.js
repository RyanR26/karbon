import { isNull } from '../utils/utils';

export const createVNode = (
	type, 
	parentComponentIndex, 
	data, 
	level, 
	key=false, 
	staticChildren, 
	parentComponent, 
	subscribesTo, 
	renderingSvg,
	block,
  blockProps
) => {

	const props = {}; 
	const elProps = Object.keys(data);

	for (let i = 0; i < elProps.length; i++) {
		const prop = elProps[i];	
		const value = data[prop];
		props[prop] = isNull(value) ? '' : prop !== 'innerHTML' ? value : block ? value : `<span data="dangerously-set-innerHTML">${value}</span>`;
	}

	return {
		type,
		lang: renderingSvg ? 'xml' : 'html',
		props,
		level,
		key,
		staticChildren,
		keyedAction: null,
		keyedChildren: null,
		parentComponent,
		parentComponentIndex,
		subscribesTo,
		dom: null,
    block,
    blockProps
	};
};

