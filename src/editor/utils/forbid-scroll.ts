import {useEffect} from 'react';
// container가 "overflow: hidden"을 가지고 있어도, container를 overflow하는 textarea가 있으면
// browser에 의해 여전히 scroll될 수 있습니다.
// 우리는 그런 scroll을 방지하고 scroll 위치를 0으로 강제합니다.

export const useForbidScroll = (
	ref: React.RefObject<HTMLDivElement | null>,
) => {
	useEffect(() => {
		if (!ref.current) {
			return;
		}

		const container = ref.current;

		const handleScroll = (e: Event) => {
			e.preventDefault();
			e.stopPropagation();
			container.scrollLeft = 0;
			container.scrollTop = 0;
		};

		container.addEventListener('scroll', handleScroll);

		return () => {
			container.removeEventListener('scroll', handleScroll);
		};
	}, [ref]);
};
