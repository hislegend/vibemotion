import React, {useCallback, useEffect, useState} from 'react';
// [STUB] react-router-dom removed
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {toast} from 'sonner';
import {saveState, loadState, hasUnsavedSession, clearSession} from '../state/session-persistence';
import {useFullState, useWriteContext} from '../utils/use-context';
import {cleanUpAssetStatus, cleanUpStateBeforeSaving} from '../state/clean-up-state-before-saving';

interface SessionManagerProps {
	children: React.ReactNode;
	projectId?: string;
}

export const SessionManager: React.FC<SessionManagerProps> = ({children, projectId}) => {
	const [showRestoreDialog, setShowRestoreDialog] = useState(false);
	const [showExitDialog, setShowExitDialog] = useState(false);
	const [exitCallback, setExitCallback] = useState<(() => void) | null>(null);
	const state = useFullState();
	const {setState} = useWriteContext();
	const navigate = (path: string) => { window.location.href = path };

	// 진입 시 이전 세션 복원 확인
	useEffect(() => {
		if (state.initialized && hasUnsavedSession(projectId)) {
			setShowRestoreDialog(true);
		}
	}, [state.initialized, projectId]);

	// 복원 핸들러
	const handleRestore = useCallback(() => {
		const savedState = loadState(projectId);
		if (savedState) {
			setState({
				update: (prev) => ({
					...prev,
					undoableState: savedState,
				}),
				commitToUndoStack: false,
			});
			toast.success('이전 작업을 복원했습니다');
		}
		setShowRestoreDialog(false);
	}, [projectId, setState]);

	// 복원 거부 핸들러
	const handleDiscardRestore = useCallback(() => {
		clearSession(projectId);
		setShowRestoreDialog(false);
	}, [projectId]);

	// 저장 핸들러
	const handleSave = useCallback(() => {
		try {
			const cleanedState = cleanUpAssetStatus(state);
			const cleanedUndoable = cleanUpStateBeforeSaving(cleanedState.undoableState);
			saveState(cleanedUndoable, projectId);
			toast.success('작업이 저장되었습니다');
			return true;
		} catch (error) {
			toast.error('저장 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
			return false;
		}
	}, [state, projectId]);

	// 종료 확인 핸들러
	const handleExitConfirm = useCallback(() => {
		if (exitCallback) {
			exitCallback();
		}
		setShowExitDialog(false);
		setExitCallback(null);
	}, [exitCallback]);

	// 저장 후 종료 핸들러
	const handleSaveAndExit = useCallback(() => {
		if (handleSave()) {
			if (exitCallback) {
				exitCallback();
			}
		}
		setShowExitDialog(false);
		setExitCallback(null);
	}, [handleSave, exitCallback]);

	// beforeunload 이벤트 핸들러
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			// 자동 저장
			try {
				const cleanedState = cleanUpAssetStatus(state);
				const cleanedUndoable = cleanUpStateBeforeSaving(cleanedState.undoableState);
				saveState(cleanedUndoable, projectId);
			} catch {
				// 저장 실패 시 경고 표시
				e.preventDefault();
				e.returnValue = '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [state, projectId]);

	// 컨텍스트로 내보낼 exit 요청 함수
	const requestExit = useCallback((callback: () => void) => {
		setExitCallback(() => callback);
		setShowExitDialog(true);
	}, []);

	return (
		<SessionContext.Provider value={{requestExit, handleSave}}>
			{children}

			{/* 복원 다이얼로그 */}
			<AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>이전 작업 복원</AlertDialogTitle>
						<AlertDialogDescription>
							저장되지 않은 이전 작업이 있습니다. 복원하시겠습니까?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={handleDiscardRestore}>
							삭제
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleRestore}>
							복원
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* 종료 확인 다이얼로그 */}
			<AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>에디터 종료</AlertDialogTitle>
						<AlertDialogDescription>
							저장하지 않은 변경사항이 있을 수 있습니다. 저장 후 종료하시겠습니까?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="gap-2">
						<AlertDialogCancel>
							취소
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleExitConfirm}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							저장 안함
						</AlertDialogAction>
						<AlertDialogAction onClick={handleSaveAndExit}>
							저장 후 종료
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</SessionContext.Provider>
	);
};

// 세션 컨텍스트
interface SessionContextValue {
	requestExit: (callback: () => void) => void;
	handleSave: () => boolean;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export const useSession = () => {
	const context = React.useContext(SessionContext);
	if (!context) {
		throw new Error('useSession must be used within SessionManager');
	}
	return context;
};
