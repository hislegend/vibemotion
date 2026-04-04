export const pLimit = (concurrency: number) => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	const queue: Function[] = [];
	let activeCount = 0;

	const next = () => {
		activeCount--;

		if (queue.length > 0) {
			queue.shift()?.();
		}
	};

	const run = async <Arguments extends unknown[], ReturnType>(
		fn: (..._arguments: Arguments) => PromiseLike<ReturnType> | ReturnType,
		resolve: (res: Promise<ReturnType>) => void,
		...args: Arguments
	) => {
		activeCount++;

		const result = (async () => fn(...args))();

		resolve(result);

		try {
			await result;
		} catch {
			// 아무것도 하지 않음
		}

		next();
	};

	const enqueue = <Arguments extends unknown[], ReturnType>(
		fn: (..._arguments: Arguments) => PromiseLike<ReturnType> | ReturnType,
		resolve: (res: Promise<ReturnType>) => void,
		...args: Arguments
	) => {
		queue.push(() => run(fn, resolve, ...args));

		(async () => {
			// 이 function은 `activeCount`를 `concurrency`와 비교하기 전에 다음 microtask까지 기다려야 합니다.
			// `activeCount`는 run function이 dequeue되고 호출될 때 비동기적으로 업데이트되기 때문입니다.
			// if-statement의 비교는 `activeCount`의 최신 값을 얻기 위해 비동기적으로 수행되어야 합니다.
			await Promise.resolve();

			if (activeCount < concurrency && queue.length > 0) {
				queue.shift()?.();
			}
		})();
	};

	const generator = <Arguments extends unknown[], ReturnType>(
		fn: (..._arguments: Arguments) => PromiseLike<ReturnType> | ReturnType,
		...args: Arguments
	) =>
		new Promise<ReturnType>((resolve) => {
			enqueue(fn, resolve, ...args);
		});

	Object.defineProperties(generator, {
		activeCount: {
			get: () => activeCount,
		},
		pendingCount: {
			get: () => queue.length,
		},
		clearQueue: {
			value: () => {
				queue.length = 0;
			},
		},
	});

	return generator;
};
