import {useCallback, useEffect, useMemo, useState} from 'react';
import {Rect} from './fit-element-size-in-container';

// pane이 이동된 경우 window가 resize되지 않았어도 layout shift가 발생합니다.
// 이러한 UI element들은 이 API를 호출하여 강제로 update할 수 있습니다

export const useElementSize = (
	ref: React.RefObject<HTMLElement | null>,
	options: {
		triggerOnWindowResize: boolean;
	},
): Rect | null => {
	const [size, setSize] = useState<Rect | null>(() => {
		if (!ref.current) {
			return null;
		}

		const rect = ref.current.getClientRects();
		if (!rect[0]) {
			return null;
		}

		return {
			width: rect[0].width as number,
			height: rect[0].height as number,
			left: rect[0].x as number,
			top: rect[0].y as number,
		};
	});

	const observer = useMemo(() => {
		if (typeof ResizeObserver === 'undefined') {
			return null;
		}

		return new ResizeObserver((entries) => {
			// contentRect는 `scale()`이 적용되지 않은 width를 반환합니다. height는 잘못된 값입니다
			const {target} = entries[0];
			// clientRect는 `scale()`이 적용된 크기를 반환합니다.
			const newSize = target.getClientRects();

			if (!newSize?.[0]) {
				setSize(null);
				return;
			}

			const width = newSize[0].width;

			const height = newSize[0].height;

			setSize({
				width,
				height,
				left: newSize[0].x,
				top: newSize[0].y,
			});
		});
	}, []);

	const updateSize = useCallback(() => {
		if (!ref.current) {
			return;
		}

		const rect = ref.current.getClientRects();
		if (!rect[0]) {
			setSize(null);
			return;
		}

		setSize((prevState): Rect => {
			const isSame =
				prevState &&
				prevState.width === rect[0].width &&
				prevState.height === rect[0].height &&
				prevState.left === rect[0].x &&
				prevState.top === rect[0].y;
			if (isSame) {
				return prevState;
			}

			return {
				width: rect[0].width as number,
				height: rect[0].height as number,
				left: rect[0].x as number,
				top: rect[0].y as number,
			};
		});
	}, [ref]);

	useEffect(() => {
		if (!observer) {
			return;
		}

		const {current} = ref;
		if (current) {
			observer.observe(current);
		}

		return (): void => {
			if (current) {
				observer.unobserve(current);
			}
		};
	}, [observer, ref, updateSize]);

	useEffect(() => {
		if (!options.triggerOnWindowResize) {
			return;
		}

		window.addEventListener('resize', updateSize);

		return () => {
			window.removeEventListener('resize', updateSize);
		};
	}, [options.triggerOnWindowResize, updateSize]);

	return useMemo(() => {
		if (!size) {
			return null;
		}

		return {...size, refresh: updateSize};
	}, [size, updateSize]);
};
