import {useCallback, useMemo, useRef, useState} from 'react';
// [STUB] react-router-dom removed
import {IconButton} from '../../icon-button';
import {CheckIcon} from '../../icons/check';
import {DownloadIcon} from '../../icons/download-state';
import {FileIcon} from '../../icons/file';
import {RenderProgressBottomLine} from '../../rendering/render-progress-bottom-line';
import {RenderingTask} from '../../rendering/render-state';
import {deleteRenderingTask} from '../../state/actions/set-render-state';
import {useWriteContext} from '../../utils/use-context';
import {IconContainer} from './icon-container';
import {TaskContainer} from './task-container';
import {TaskDescription} from './task-description';
import {TaskSubtitle} from './task-subtitle';
import {TaskTitle} from './task-title';
import {taskIndicatorRef} from './tasks-indicator';
import {getProjectIdForEditor} from '../../state/supabase-initial-state';
import {FolderOpen} from 'lucide-react';

export const RenderProgress: React.FC<{
	renderTask: RenderingTask;
}> = ({renderTask}) => {
	const a = useRef<HTMLAnchorElement>(null);
	const {setState} = useWriteContext();
	const navigate = (path: string) => { window.location.href = path };

	const onClick = useCallback(() => {
		a.current?.click();
		taskIndicatorRef.current?.close();
	}, [a]);

	const onNavigateToGallery = useCallback(() => {
		const projectId = getProjectIdForEditor();
		taskIndicatorRef.current?.close();
		// URL에서 테넌트 슬러그 추출
		const pathParts = window.location.pathname.split('/').filter(Boolean);
		const tenantSlug = pathParts[0];
		const basePath = tenantSlug && !['editor-new', 'gallery', 'projects'].includes(tenantSlug) ? `/${tenantSlug}` : '';
		if (projectId) {
			navigate(`${basePath}/gallery?projectId=${projectId}`);
		} else {
			navigate(`${basePath}/gallery`);
		}
	}, [navigate]);

	const title = useMemo(() => {
		return `${renderTask.codec === 'h264' ? 'MP4' : 'WebM'} export`;
	}, [renderTask.codec]);

	const [hovered, setHovered] = useState(false);

	const onMouseEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onMouseLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const onDismiss = useCallback(() => {
		setState({
			commitToUndoStack: false,
			update: (prevState) => {
				return deleteRenderingTask({
					state: prevState,
					taskId: renderTask.id,
				});
			},
		});
	}, [renderTask.id, setState]);

	return (
		<TaskContainer onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
			<IconContainer>
				<FileIcon />
			</IconContainer>
			<TaskDescription isError={renderTask.status.type === 'error'}>
				<TaskTitle>{title}</TaskTitle>
				<TaskSubtitle>
					<RenderProgressBottomLine renderTask={renderTask} />
				</TaskSubtitle>
			</TaskDescription>
			<div className="flex">
				{hovered &&
				(renderTask.status.type === 'error' ||
					renderTask.status.type === 'done') ? (
					<>
						<IconButton onClick={onDismiss} aria-label="Dismiss">
							<CheckIcon />
						</IconButton>
					</>
				) : null}
				{renderTask.status.type === 'done' ? (
					<>
						<a
							className="hidden"
							href={renderTask.status.outputFile}
							target="_blank"
							ref={a}
						/>
						<IconButton onClick={onClick} aria-label="Download">
							<DownloadIcon />
						</IconButton>
						<IconButton onClick={onNavigateToGallery} aria-label="Go to Gallery">
							<FolderOpen className="h-4 w-4" />
						</IconButton>
					</>
				) : null}
			</div>
		</TaskContainer>
	);
};
