/* eslint-disable no-undef */
/* eslint-disable indent */
import { syncVNodes } from '../src/vdom/syncVNodes';

const emptyVNodeStatic = {
	type: null,
	lang: null,
	props: null,
	level: undefined,
	key: false,
  keyedAction: null,
  keyedChildren: null,
  staticChildren: false,
	parentComponent: null,
	parentComponentIndex: null,
  subscribesTo: null,
  dom: null,
  block: false,
  blockProps: undefined
};

const vNode = (
	type='div', 
	lang='html', 
	props={}, 
	level=1, 
	key=false, 
  keyedAction=undefined,
  keyedChildren=[],
  staticChildren=false,
	parentComponent='testComp', 
	parentComponentIndex=1, 
	subscribesTo=[],
  block=false,
  blockProps=undefined
) => ({
	type,
	lang,
	props,
	level,
	key,
  keyedAction,
  keyedChildren,
  staticChildren,
	parentComponent,
	parentComponentIndex,
  subscribesTo,
  dom: null,
  block,
  blockProps
});

const _ = undefined;

test('Normalise by level - first item in new array should be an empty vNode', () => {
	const sunkNodes = syncVNodes([vNode()], [vNode(_,_,_,2)], {}, {});
	expect(sunkNodes.domNodes[0]).toEqual(emptyVNodeStatic);
});

test('Normalise by level - second item in old array should be an empty vNode', () => {
	const sunkNodes = syncVNodes([vNode()], [vNode(_,_,_,2)], {}, {});
	expect(sunkNodes.domNodesPrev[1]).toEqual(emptyVNodeStatic);
});

test('Normalise by level - all items in new array should be empty vNodes', () => {
	const sunkNodes = syncVNodes([], [vNode(), vNode(), vNode()], {}, {});
	expect(sunkNodes.domNodes[0]).toEqual(emptyVNodeStatic);
  expect(sunkNodes.domNodes[1]).toEqual(emptyVNodeStatic);
  expect(sunkNodes.domNodes[2]).toEqual(emptyVNodeStatic);
});

test('Normalise by level - all items in old array should be empty vNodes', () => {
	const sunkNodes = syncVNodes([vNode(), vNode(), vNode()], [], {}, {});
	expect(sunkNodes.domNodesPrev[0]).toEqual(emptyVNodeStatic);
  expect(sunkNodes.domNodesPrev[1]).toEqual(emptyVNodeStatic);
  expect(sunkNodes.domNodesPrev[2]).toEqual(emptyVNodeStatic);
});

const sunkNodes = syncVNodes(
	[vNode(), vNode(), vNode(), vNode(_,_,_,2), vNode(_,_,_,2), vNode(_,_,_,2), vNode(_,_,_,3)], 
	[vNode(_,_,_,1), vNode(_,_,_,2), vNode(_,_,_,3), vNode(_,_,_,2)], 
	{}, 
	{}
);

test('Normalise by level - new arrays should be same length', () => {
	expect(sunkNodes.domNodes.length).toEqual(sunkNodes.domNodesPrev.length);
});

describe('Normalise by level - each vNode in old array should match level in newArray if not null', () => { 
	for(let i = 0; i < sunkNodes.domNodes.length; i++) {
		test('should have the same level', () => {
			if(typeof sunkNodes.domNodes[i].level === 'number' && typeof sunkNodes.domNodesPrev[i].level === 'number' ) {
				expect(sunkNodes.domNodes[i].level).toEqual(sunkNodes.domNodesPrev[i].level);
			}
		});
	}
});

test('Normalise by level - no changes - new node will use old node and update props', () => {
    const PrevVNodesArray = [
        vNode('div', 'html', {textContent: 'this is a text string'}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'])
    ];
    const vNodesArray = [
        vNode('div', 'html', {textContent: 'this is a new text string'}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'])
    ];
    const sunkNodes = syncVNodes(vNodesArray, PrevVNodesArray, {}, {});

    expect(sunkNodes.domNodes.length).toBe(1);
    expect(sunkNodes.domNodesPrev.length).toBe(1);
    expect(sunkNodes.domNodes).toEqual(vNodesArray);
    expect(sunkNodes.domNodesPrev).toEqual(PrevVNodesArray);
});

// KEYED UPDATES //
///////////////////

test('Normalise by level - insert old keyed node', () => {
	const sunkNodes = syncVNodes(
		[vNode(_,_,_,1, 'keyName')], 
		[undefined], 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		}, 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		}
	);
	expect(sunkNodes.domNodes[0].keyedAction).toEqual('insertOld');
});

test('Normalise by level - insert old keyed node (with children) ', () => {
	const sunkNodes = syncVNodes(
		[
			vNode(_,_,_,1, 'keyName', _, [vNode(_,_,_,2), vNode(_,_,_,3)]),
			vNode(_,_,_,2), 
			vNode(_,_,_,3)
		], 
		[undefined], 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName', _, [vNode(_,_,_,2), vNode(_,_,_,3)])
			}
		}, 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName', _, [vNode(_,_,_,2), vNode(_,_,_,3)])
			}
		}
	);
	expect(sunkNodes.domNodes[0].keyedAction).toEqual('insertOld');
	expect(sunkNodes.domNodesPrev[1].level).toEqual(2);
	expect(sunkNodes.domNodesPrev[2].level).toEqual(3);
	expect(sunkNodes.domNodes[1].level).toEqual(2);
	expect(sunkNodes.domNodes[2].level).toEqual(3);
});

test('Normalise by level - remove old node (not keyed)', () => {
	const sunkNodes = syncVNodes(
		[vNode(_,_,_,1, 'keyName')], 
		[vNode(_,_,_,1, false)], 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		}, 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		}
	);
	expect(sunkNodes.domNodes[0].props).toEqual(null);
});

test('Normalise by level - remove old node (keyed but not present in new UI)', () => {
	const sunkNodes = syncVNodes(
		[vNode(_,_,_,1, 'keyName')], 
		[vNode(_,_,_,1, 'keyNameOld')], 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		}, 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName'),
				keyNameOld: vNode(_,_,_,1, 'keyNameOld')
			}
		}
	);
	expect(sunkNodes.domNodes[0].props).toEqual(null);
});

test('Normalise by level - swap keyed nodes', () => {
	const sunkNodes = syncVNodes(
		[vNode(_,_,_,1, 'key1'), vNode(_,_,_,1, 'key2'), vNode(_,_,_,1, 'key3')], 
		[vNode(_,_,_,1, 'key3'), vNode(_,_,_,1, 'key1'), vNode(_,_,_,1, 'key2')], 
		{
			1: {
				key1: vNode(_,_,_,1, 'key1'),
				key2: vNode(_,_,_,1, 'key2'),
				key3: vNode(_,_,_,1, 'key3')
			}
		}, 
		{
			1: {
				key1: vNode(_,_,_,1, 'key1'),
				key2: vNode(_,_,_,1, 'key2'),
				key3: vNode(_,_,_,1, 'key3')
			}
		}
	);
	expect(sunkNodes.domNodesPrev[0].key).toEqual('key1');
	expect(sunkNodes.domNodesPrev[1].key).toEqual('key2');
	expect(sunkNodes.domNodesPrev[2].key).toEqual('key3');
});

test('Normalise by level - insert new keyed node', () => {
	const sunkNodes = syncVNodes(
		[vNode(_,_,_,1, 'keyName')], 
		[emptyVNodeStatic], 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		},  
		{
			1: {
				keyNameOther: vNode(_,_,_,1, 'keyNameOther')
			}
		}
	);
	expect(sunkNodes.domNodes[0].keyedAction).toEqual('insertNew');
});

test('Normalise by level - update matched keys attrs', () => {
	const sunkNodes = syncVNodes(
		[vNode(_,_,_,1, 'keyName')], 
		[vNode(_,_,_,1, 'keyName')],
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		},  
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		}
	);
	expect(sunkNodes.domNodes[0].keyedAction).toEqual('updateAttrs');
});

test('Normalise by level - insert new unkeyed node', () => {
	const sunkNodes = syncVNodes(
		[vNode(_,_,_,1, 'keyName')], 
		[vNode(_,_,_,1, 'keyNameOther')], 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		},  
		{
			1: {
				keyNameOther: vNode(_,_,_,1, 'keyNameOther')
			}
		}
	);
	expect(sunkNodes.domNodes[0].keyedAction).toEqual('insertNew');
});

test('Normalise by level - Ignore recycled keyed node', () => {
	const sunkNodes = syncVNodes(
		[vNode(_,_,_,1, false)], 
		[vNode(_,_,_,1, 'keyName')], 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		},  
		{
			1: {
			}
		}
	);
	expect(sunkNodes.domNodes[0].keyedAction).toEqual('recycled');
});

test('Normalise by level - Remove old keyed node', () => {
	const sunkNodes = syncVNodes(
		[vNode(_,_,_,1, false)], 
		[vNode(_,_,_,1, 'keyName')], 
		{
			1: {}
		},  
		{
			1: {}
		}
	);
  expect(sunkNodes.domNodes[0]).toEqual(emptyVNodeStatic);
});

test('Normalise by level - Remove old keyed node', () => {
	const sunkNodes = syncVNodes(
		[emptyVNodeStatic], 
		[vNode(_,_,_,1, 'keyName')], 
		{
			1: {}
		},  
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		}
	);
  expect(sunkNodes.domNodes[0]).toEqual(emptyVNodeStatic);
});

test('Normalise by level - Mark old node as recyclable', () => {
	const sunkNodes = syncVNodes(
		[emptyVNodeStatic], 
		[vNode(_,_,_,1, 'keyName')], 
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		},  
		{
			1: {
				keyName: vNode(_,_,_,1, 'keyName')
			}
		}
	);
	expect(sunkNodes.domNodes[0].keyedAction).toEqual('recyclable');
});

