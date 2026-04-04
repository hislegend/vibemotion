import {useCallback, useMemo, useState} from 'react';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuTrigger,
} from '../../context-menu';
import {EditorStarterItem} from '../../items/item-type';
import {setSelectedItems} from '../../state/actions/set-selected-items';
import {useWriteContext} from '../../utils/use-context';
import {TimelineItemContextMenu} from './timeline-item-context-menu';

export const ItemContextMenuTrigger = ({
	item,
	children,
}: {
	item: EditorStarterItem;
	children: React.ReactNode;
}) => {
	const {setState} = useWriteContext();

	const handleContextMenu = useCallback(() => {
		setState({
			update: (state) => {
				// 여러 item이 선택된 경우, 아무것도 선택하지 않음
				if (state.selectedItems.length > 1) {
					return state;
				}

				// 하나의 item만 선택된 경우, 선택을 재설정
				return setSelectedItems(state, [item.id]);
			},
			commitToUndoStack: true,
		});
	}, [item.id, setState]);

	const style = useMemo(() => {
		return {
			display: 'contents',
		};
	}, []);

	const [open, setOpen] = useState(false);

	return (
		<ContextMenu onOpenChange={setOpen}>
			<ContextMenuTrigger asChild>
				<div onContextMenu={handleContextMenu} style={style}>
					{children}
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				{open && <TimelineItemContextMenu item={item} />}
			</ContextMenuContent>
		</ContextMenu>
	);
};
