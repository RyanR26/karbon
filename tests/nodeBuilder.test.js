/* eslint-disable indent */
import { nodeBuilder } from '../src/vdom/nodeBuilder';

const _ = undefined;

const vNode = (type='div', lang='html', props={}, level=1, key=false, keyedAction=null, keyedChildren=null, staticChildren=false, parentComponent, parentComponentIndex=0, subscribesTo=[]) => ({
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
    dom: null
});

const mockRunTime = (stateObj) => {
    const state = stateObj || {};
    const getState = () => state;

    return {
        getState
    };
};

test('component parameters', () => {

    const nodeBuilderInstance = nodeBuilder(mockRunTime());
    const c = nodeBuilderInstance.component;

    const testActions = dispatch => {
        expect(dispatch).toBeDefined();
        return ({
            testAction() {}
        });
    };

    const testComponent = (props, actions, index) => (e, x, c) => {
        expect(props).toBeDefined();
        expect(props).toEqual({text: 'this is a text string'});
        expect(actions).toBeDefined();
        expect(actions).toEqual({testActions: {testAction: expect.any(Function)}});
        expect(index).toBeDefined();
        expect(index).toBe(0);
        expect(e).toBeDefined();
        expect(x).toBeDefined();
        expect(c).toBeDefined();
    };

    const testComponent2 = (props, actions, index) => (e, x, c) => {
        expect(props).toBeUndefined();
        expect(actions).toBeUndefined();
        expect(index).toBeDefined();
        expect(index).toBe(1);
        expect(e).toBeDefined();
        expect(x).toBeDefined();
        expect(c).toBeDefined();
    };
    
	c({ testComponent }, { 
        props: {text: 'this is a text string'},
        actions: [{ testActions }]
    });

    c({ testComponent2 }, { 
        index: 1
    });
});

test('create vDom array - single node', () => {

    const nodeBuilderInstance = nodeBuilder(mockRunTime());
    const c = nodeBuilderInstance.component;

    const testComponent = props => (e, x) => {
        e('div', {textContent: props.text}); x('div');
    };
    
	c({ testComponent }, { 
		props: {text: 'this is a text string'},
		subscribe: ['stateKey1', 'stateKey2']
    });
    
    const getNodes = nodeBuilderInstance.getVDomNodesArray();
    
    expect(getNodes.length).toBe(1);
	expect(getNodes).toEqual(
        [
            vNode('div', 'html', {textContent: 'this is a text string'}, 1, false, _, _, _,'testComponent', 0, ['stateKey1', 'stateKey2']),
        ]
    );
});

test('create vDom array - mulitple nodes + nested nodes', () => {

    const nodeBuilderInstance = nodeBuilder(mockRunTime());
    const c = nodeBuilderInstance.component;

    const testComponent = props => (e, x, c) => {
        e('div', {textContent: props.text});
            e('span', {class: ['nested']}); 
                e('a', {href: 'www.test.com', class: ['link','nested']}); x('span');
            x('span');
        x('div');
        e('div'); x('div');
    };
    
	c({ testComponent }, { 
		props: {text: 'this is a text string'},
		subscribe: ['stateKey1', 'stateKey2']
    });
    
    const getNodes = nodeBuilderInstance.getVDomNodesArray();
    
    expect(getNodes.length).toBe(4);
	expect(getNodes).toEqual(
        [
            vNode('div', 'html', {textContent: 'this is a text string'}, 1, false, _, _, _,'testComponent', 0, ['stateKey1', 'stateKey2']),
            vNode('span', 'html', {class: ['nested']}, 2, false, _, _, _,'testComponent', 0, ['stateKey1', 'stateKey2']),
            vNode('a', 'html', {href: 'www.test.com', class: ['link','nested']}, 3, false, _, _, _,'testComponent', 0, ['stateKey1', 'stateKey2']),
            vNode('div', 'html', {}, 1, false, _, _, _,'testComponent', 0, ['stateKey1', 'stateKey2']),
        ]
    ); 
});

test('create vDom array - nested component', () => {

    const nodeBuilderInstance = nodeBuilder(mockRunTime());
    const c = nodeBuilderInstance.component;

    const testComponent = props => (e, x, c) => {
        e('div', {textContent: props.text});
            e('span', {class: ['nested']}); 
                e('a', {href: 'www.test.com', class: ['link','nested']}); x('span');
            x('span');
            c({ nestedTestComponent }, { 
                props: {text: 'this is a nested component'},
                subscribe: ['stateKey3']
            });
        x('div');
        e('div'); x('div');
    };

    const nestedTestComponent = props => (e, x) => {
        e('div', {textContent: props.text});
            e('span', {class: ['nested']}); 
                e('a', {href: 'www.test.com', class: ['link','nested']}); x('span');
            x('span');
        x('div');
    };
    
	c({ testComponent }, { 
		props: {text: 'this is a text string'},
		subscribe: ['stateKey1', 'stateKey2']
    });

    
    
    const getNodes = nodeBuilderInstance.getVDomNodesArray();
    
    expect(getNodes.length).toBe(7);
	expect(getNodes).toEqual(
        [
            vNode('div', 'html', {textContent: 'this is a text string'}, 1, false, _, _, _,'testComponent', 0, ['stateKey1', 'stateKey2']),
            vNode('span', 'html', {class: ['nested']}, 2, false, _, _, _,'testComponent', 0, ['stateKey1', 'stateKey2']),
            vNode('a', 'html', {href: 'www.test.com', class: ['link','nested']}, 3, false, _, _, _,'testComponent', 0, ['stateKey1', 'stateKey2']),
            vNode('div', 'html', {textContent: 'this is a nested component'}, 2, false, _, _, _,'nestedTestComponent', 0, ['stateKey3']),
            vNode('span', 'html', {class: ['nested']}, 3, false, _, _, _,'nestedTestComponent', 0, ['stateKey3']),
            vNode('a', 'html', {href: 'www.test.com', class: ['link','nested']}, 4, false, _, _, _,'nestedTestComponent', 0, ['stateKey3']),
            vNode('div', 'html', {}, 1, false, _, _, _,'testComponent', 0, ['stateKey1', 'stateKey2']),
        ]
    ); 
});

