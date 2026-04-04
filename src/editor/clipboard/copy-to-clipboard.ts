// tldraw copy logic에서 영감을 받음:
// https://github.com/tldraw/tldraw/blob/a03de714c746d6425679de4bb36376594d670b51/packages/tldraw/src/lib/ui/hooks/useClipboardEvents.ts#L589-L652

import {EditorStarterItem} from '../items/item-type';

const getTextContent = (items: EditorStarterItem[]) => {
	const content = items
		.filter((item) => item.type === 'text')
		.map((item) => item.text)
		.join('\n');

	// Chrome Android에서 text/plain이 비어있으면 copy되지 않는 문제를 처리
	if (content === '') {
		return ' ';
	}

	return content;
};

const getHtmlContent = (items: EditorStarterItem[]) => {
	const content = JSON.stringify(items);
	return `<div data-remotion-editor-starter>${content}</div>`;
};

export const copyToClipboard = (items: EditorStarterItem[]) => {
	if (navigator.clipboard && navigator.clipboard.write) {
		navigator.clipboard.write([
			new ClipboardItem({
				'text/html': new Blob([getHtmlContent(items)], {type: 'text/html'}),
				'text/plain': new Blob([getTextContent(items)], {type: 'text/plain'}),
			}),
		]);
	} else if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(getHtmlContent(items));
	}
};
