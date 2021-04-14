/* eslint-disable no-undef */
/* eslint-disable indent */
import { createView } from '../src/dom/createView';
import { virtualDom } from '../src/vdom/vDomState';

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
  dom: null
};

const vNode = (type='div', lang='html', props={}, level=1, key=false, keyedAction=null, keyedChildren=null, staticChildren=false, parentComponent, parentComponentIndex=0, subscribesTo=[], dom=null) => ({
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
  dom
});

const _ = undefined;

test('create new node', () => {
    // Set up our document body
    document.body.innerHTML = '<div id="app"></div>';
    const container = document.getElementById('app');
    const vNodesArray = [
        vNode('div', 'html', {text: 'this is a text string'}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'])
    ];
    createView(container, vNodesArray, [], ['stateKey1'], undefined, undefined );
    expect(document.body.innerHTML).toEqual('<div id="app"><div>this is a text string</div></div>');
});

test('update node - add new props: id, class, style, text, data attr', () => {
    // Set up our document body
    document.body.innerHTML = '<div id="app"><div></div></div>';
    const container = document.getElementById('app');
    const oldDomNode = document.getElementById('app').children[0];
    virtualDom.setInitialized(true);
    const PrevVNodesArray = [
        vNode('div', 'html', {}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)
    ];
    const vNodesArray = [
        vNode('div', 'html', {text: 'this is a new text string', id: 'test-id', class: ['new-class'], style: {color: 'red', 'font-size': '10px'}, dataAttrs: ['test=test']}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'])
    ];
    createView(container, vNodesArray, PrevVNodesArray, ['stateKey1'], {}, {} );
    expect(document.body.innerHTML).toEqual('<div id="app"><div id="test-id" class="new-class" style="color: red; font-size: 10px;" data-test="test">this is a new text string</div></div>');
});

test('update node - remove props: id, class, style, text, data attr', () => {
    // Set up our document body
    document.body.innerHTML = '<div id="app"><div id="test-id" class="new-class" style="color: red; font-size: 10px;" data-test="test">this is a new text string</div></div>';
    const container = document.getElementById('app');
    const oldDomNode = document.getElementById('app').children[0];
    virtualDom.setInitialized(true);
    const vNodesArray = [
        vNode('div', 'html', {}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'])
    ];
    const PrevVNodesArray = [
        vNode('div', 'html', {text: 'this is a new text string', id: 'test-id', class: ['new-class'], style: {color: 'red', 'font-size': '10px'}, dataAttrs: ['test=test']}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)
    ];
    createView(container, vNodesArray, PrevVNodesArray, ['stateKey1'], {}, {} );
    expect(document.body.innerHTML).toEqual('<div id="app"><div></div></div>');
});

test('update node - transform props: id, class, style, text, data attr', () => {
    // Set up our document body
    document.body.innerHTML = '<div id="app"><div id="test-id" class="new-class" style="color: red; font-size: 10px;" data-test="test">this is a new text string</div></div>';
    const container = document.getElementById('app');
    const oldDomNode = document.getElementById('app').children[0];
    virtualDom.setInitialized(true);
    const vNodesArray = [
        vNode('div', 'html', {text: 'this is an updated text string', id: 'updated-id', class: ['updated-class'], style: {color: 'blue', 'font-size': '20px'}, dataAttrs: ['test2=test2']}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)
    ];
    const PrevVNodesArray = [
        vNode('div', 'html', {text: 'this is a text string', id: 'test-id', class: ['new-class'], style: {color: 'red', 'font-size': '10px'}, dataAttrs: ['test=test']}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)
    ];
    createView(container, vNodesArray, PrevVNodesArray, ['stateKey1'], {}, {} );
    // the order of style and class gets swapped but values are updated successfully
    expect(document.body.innerHTML).toEqual('<div id="app"><div id="updated-id" style="color: blue; font-size: 20px;" class="updated-class" data-test2="test2">this is an updated text string</div></div>');
});

test('update node 2 - transform props: id, class, style, text, data attr', () => {
    // Set up our document body
    document.body.innerHTML = '<div id="app"><a href="www.test.com">this is a link</a></div>';
    const container = document.getElementById('app');
    const oldDomNode = document.getElementById('app').children[0];
    virtualDom.setInitialized(true);
    const vNodesArray = [
        vNode('a', 'html', {text: null, href: null}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)
    ];
    const PrevVNodesArray = [
        vNode('a', 'html', {text: 'this is a link', href: 'www.test.com'}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)
    ];
    createView(container, vNodesArray, PrevVNodesArray, ['stateKey1'], {}, {} );
    // the order of style and class gets swapped but values are updated successfully
    expect(document.body.innerHTML).toEqual('<div id="app"><a href="null"></a></div>');
});

test('update node 3 - transform props: id, class, style, text, data attr', () => {
    // Set up our document body
    document.body.innerHTML = '<div id="app"><a href="null"></a></div>';
    const container = document.getElementById('app');
    const oldDomNode = document.getElementById('app').children[0];
    virtualDom.setInitialized(true);
    const vNodesArray = [
        vNode('a', 'html', {text: 'this is a link', href: 'www.test.com'}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)
    ];
    const PrevVNodesArray = [
        vNode('a', 'html', {text: null, href: null}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)
    ];
    createView(container, vNodesArray, PrevVNodesArray, ['stateKey1'], {}, {} );
    // the order of style and class gets swapped but values are updated successfully
    expect(document.body.innerHTML).toEqual('<div id="app"><a href="www.test.com">this is a link</a></div>');
});


test('replace node', () => {
    // Set up our document body
    document.body.innerHTML = '<div id="app"><div class="old-element"></div></div>';
    const container = document.getElementById('app');
    const oldDomNode = document.getElementById('app').children[0];
    virtualDom.setInitialized(true);
    const vNodesArray = [
        vNode('span', 'html', {class: ['new-element']}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)
    ];
    const PrevVNodesArray = [
        vNode('div', 'html', {class: ['old-element']}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)
    ];
    createView(container, vNodesArray, PrevVNodesArray, ['stateKey1'], {}, {} );
    // the order of style and class gets swapped but values are updated successfully
    expect(document.body.innerHTML).toEqual('<div id="app"><span class="new-element"></span></div>');
});

test('replace multiple nodes', () => {
    // Set up our document body
    document.body.innerHTML = '<div id="app"><div class="old-element"><spa>span</span></div></div>';
    const container = document.getElementById('app');
    const oldDomNode = document.getElementById('app').children[0];
    virtualDom.setInitialized(true);
    const vNodesArray = [
        vNode('span', 'html', {class: ['new-element']}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode),
        emptyVNodeStatic
    ];
    const PrevVNodesArray = [
        vNode('div', 'html', {class: ['old-element']}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode),
        vNode('span', 'html', {text: 'span'}, 2, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)

    ];
    createView(container, vNodesArray, PrevVNodesArray, ['stateKey1'], {}, {} );
    // the order of style and class gets swapped but values are updated successfully
    expect(document.body.innerHTML).toEqual('<div id="app"><span class="new-element"></span></div>');
});

test('remove node', () => {
    // Set up our document body
    document.body.innerHTML = '<div id="app"><div class="old-element"></div></div>';
    const container = document.getElementById('app');
    const oldDomNode = document.getElementById('app').children[0];
    virtualDom.setInitialized(true);
    const vNodesArray = [
        emptyVNodeStatic
    ];
    const PrevVNodesArray = [
        vNode('div', 'html', {class: ['old-element']}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], oldDomNode)
    ];
    createView(container, vNodesArray, PrevVNodesArray, ['stateKey1'], {}, {} );
    // the order of style and class gets swapped but values are updated successfully
    expect(document.body.innerHTML).toEqual('<div id="app"></div>');
});

test('swap keyed nodes', () => {
    // Set up our document body
    document.body.innerHTML = `
    <div id="app">
        <ul id="1">
            <li id="2">item 1</li>
            <li id="3">item 2</li>
        </ul>
    </div>`;

    const container = document.getElementById('app');
    const domNode = id => document.getElementById(id);

    // domNode(2).style.color = 'red';

    virtualDom.setInitialized(true);

    const vNodesArray = [
        vNode('ul', 'html', {id: '1'}, 1, false, _, _, _,'testComponent', 0, ['stateKey1']),
        vNode('li', 'html', {id: '3'}, 2, false, 'key2', _, _,'testComponent', 0, ['stateKey1']),
        vNode('li', 'html', {id: '2'}, 2, false, 'key1', _, _,'testComponent', 0, ['stateKey1'])
    ];

    const PrevVNodesArray = [
        vNode('ul', 'html', {id: '1'}, 1, false, _, _, _,'testComponent', 0, ['stateKey1'], domNode(1)),
        vNode('li', 'html', {id: '2'}, 2, false, 'key1', _, _,'testComponent', 0, ['stateKey1'], domNode(2)),
        vNode('li', 'html', {id: '3'}, 2, false, 'key2', _, _,'testComponent', 0, ['stateKey1'], domNode(3))
    ];

    const oldKeyedNodes = {
        2: {
            key2: vNode('li', 'html', {id: '3'}, 2, false, 'key2', _, _,'testComponent', 0, ['stateKey1']),
            key1: vNode('li', 'html', {id: '2'}, 2, false, 'key1', _, _,'testComponent', 0, ['stateKey1'])
        }
    };

    const newKeyedNodes = { 
        2: {
            key2: vNode('li', 'html', {id: '3'}, 2, false, 'key2', _, _,'testComponent', 0, ['stateKey1']),
            key1: vNode('li', 'html', {id: '2'}, 2, false, 'key1', _, _,'testComponent', 0, ['stateKey1'])
        },
    };

    createView(container, vNodesArray, PrevVNodesArray, ['stateKey1'], newKeyedNodes, oldKeyedNodes );

    expect(document.body.innerHTML).toEqual(`
    <div id="app">
        <ul id="1">
            <li id="3">item 1</li>
            <li id="2">item 2</li>
        </ul>
    </div>`);
});