import type {PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect, useState} from 'react';
import {FullscreenIcon} from '../icons/fullscreen';

export const FullscreenButton: React.FC<{
	playerRef: React.RefObject<PlayerRef | null>;
}> = ({playerRef}) => {
	const [supportsFullscreen, setSupportsFullscreen] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		const {current} = playerRef;

		if (!current) {
			return;
		}

		const onFullscreenChange = () => {
			setIsFullscreen(document.fullscreenElement !== null);
		};

		current.addEventListener('fullscreenchange', onFullscreenChange);

		return () => {
			current.removeEventListener('fullscreenchange', onFullscreenChange);
		};
	}, [playerRef]);

	useEffect(() => {
		// SSR hydration mismatch를 피하기 위해 클라이언트 사이드에서 처리해야 함
		setSupportsFullscreen(
			(typeof document !== 'undefined' &&
				(document.fullscreenEnabled ||
					// @ts-expect-error Types not defined
					document.webkitFullscreenEnabled)) ??
				false,
		);
	}, []);

	const onClick = useCallback(() => {
		const {current} = playerRef;
		if (!current) {
			return;
		}

		if (isFullscreen) {
			current.exitFullscreen();
		} else {
			current.requestFullscreen();
		}
	}, [isFullscreen, playerRef]);

	if (!supportsFullscreen) {
		return null;
	}

	return (
		<button
			className="editor-starter-focus-ring p-2"
			type="button"
			onClick={onClick}
			aria-label="Fullscreen"
		>
			<FullscreenIcon className="size-4 text-neutral-300" />
		</button>
	);
};
