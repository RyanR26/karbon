import { voidedElements } from '../vdom/voidedElements';

export const createString = vDomNodes => {

	let htmlString = ''; 
	let node;
	let nextNode;
	const closingTagStack = [];
  
	for (let i = 0, len = vDomNodes.length; i < len; i++) {
		node = vDomNodes[i];
		nextNode = vDomNodes[i+1];
    
		// open tag
		htmlString += '<' + node.type;

		// add props
		const propKeys = Object.keys(node.props).filter(value => value !== 'text' && (value[0] != 'o' && value[1] != 'n'));

		propKeys.forEach(key => {

			if (key === 'style') {
				htmlString += ' style="';
				const styleKeys = Object.keys(node.props.style);
				styleKeys.forEach((key, idx) => {
					htmlString += key + ':' + node.props.style[key] + ';';
					if (idx !== styleKeys.length - 1) {
						htmlString += ' ';
					}
				});
				htmlString += '"';
			}
			else if (Array.isArray(node.props[key])) {
				if (key === 'data') {
					node.props.data.forEach(dataAttr => {
						htmlString += ' ' + 'data-' + dataAttr;
					});
				} else if(key === 'class') {
					node.props.class.forEach(className => {
						htmlString += ' ' + className;
					});
				}
			} else {
				htmlString += ' ' + key + '="' + node.props[key] + '"';
			}
		});
		
		// close tag
		if (voidedElements[node.type]) {
			htmlString += '/>';
		}
		else {
			closingTagStack.push(node.type);
			htmlString += '>';
      
			// add text and inner html
			if (node.props.text) {
				htmlString += node.props.text;
			}
      
			if (node.props.innerHTML) {
				htmlString += node.props.innerHTML;
			}

			if (nextNode) {
				if (nextNode.level === node.level) {
					htmlString += '</' + closingTagStack.pop() + '>';
				}
				else if (nextNode.level < node.level) {
					const retrace = node.level - nextNode.level;
					for (let x = 0; x <= retrace; x++) {
						htmlString += '</' + closingTagStack.pop() + '>';
					}
				}
			} else {
				const remaining = closingTagStack.length;
				for (let x = 0; x < remaining; x++) {
					htmlString += '</' + closingTagStack.pop() + '>';
				}
			}
		}

	}

	return htmlString;
};