import {useCallback, useRef} from 'react';
import {toast} from 'sonner';
import {UploadIcon} from '../icons/upload';
import {EditorState, UndoableState} from '../state/types';
import {clsx} from '../utils/clsx';
import {hasUploadingAssets} from '../utils/upload-status';
import {useFullState, useWriteContext} from '../utils/use-context';

export const LoadStateButton = () => {
	const state = useFullState();
	const {setState} = useWriteContext();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleLoadClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) {
				return;
			}

			// 파일 형식 검증
			if (!file.name.endsWith('.json')) {
				toast.error('유효한 JSON 파일을 선택해주세요.');
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const result = e.target?.result;
					if (typeof result !== 'string') {
						throw new Error('Failed to read file');
					}

					const loadedState: UndoableState = JSON.parse(result);

					// 로드된 state 구조의 기본 검증
					if (
						!loadedState ||
						typeof loadedState !== 'object' ||
						!Array.isArray(loadedState.tracks) ||
						typeof loadedState.items !== 'object' ||
						typeof loadedState.assets !== 'object' ||
						typeof loadedState.fps !== 'number' ||
						typeof loadedState.compositionWidth !== 'number' ||
						typeof loadedState.compositionHeight !== 'number'
					) {
						throw new Error('Invalid state file format');
					}

					// state 업데이트
					setState({
						update: (prevState: EditorState) => ({
							...prevState,
							undoableState: loadedState,
						}),
						commitToUndoStack: true,
					});

					toast.success('상태를 불러왔습니다.');
				} catch (error) {
					toast.error(
						error instanceof Error
							? `상태 불러오기 실패: ${error.message}`
							: '상태 불러오기 실패',
					);
				}
			};

			reader.onerror = () => {
				toast.error('파일을 읽는 데 실패했습니다.');
			};

			reader.readAsText(file);

			// 동일한 파일을 다시 선택할 수 있도록 input 재설정
			event.target.value = '';
		},
		[setState],
	);

	const assetsUploading = hasUploadingAssets(state.assetStatus);

	return (
		<div className="bg-white/5">
			<button
				data-uploading={Boolean(assetsUploading)}
				className={clsx(
					'editor-starter-focus-ring flex h-10 w-10 items-center justify-center rounded text-white transition-colors',
					assetsUploading && 'opacity-50',
					!assetsUploading && 'hover:bg-white/10',
				)}
			title={
				assetsUploading
					? '에셋 업로드 중에는 불러올 수 없습니다.'
					: '파일에서 불러오기'
			}
			disabled={assetsUploading}
			onClick={handleLoadClick}
			aria-label="파일에서 불러오기"
			>
				<UploadIcon />
			</button>
			<input
				ref={fileInputRef}
				type="file"
				accept=".json"
				style={{display: 'none'}}
				onChange={handleFileChange}
			/>
		</div>
	);
};
