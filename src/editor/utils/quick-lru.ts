export type Options<KeyType, ValueType> = {
	/**
	item이 cache에 남아있을 최대 시간(밀리초).

	@default Infinity

	기본적으로 `maxAge`는 `Infinity`이며, 이는 item이 절대 만료되지 않음을 의미합니다.
	지연 만료는 다음 write 또는 read 호출 시 발생합니다.

	개별 item의 만료는 `set(key, value, {maxAge})` method로 지정할 수 있습니다.
	*/
	readonly maxAge?: number;

	/**
	가장 최근에 사용되지 않은 item들을 제거하기 전의 최대 item 수.
	*/
	readonly maxSize: number;

	/**
	item이 cache에서 제거되기 직전에 호출됩니다.

	side effect나 명시적 cleanup이 필요한 object URL(`revokeObjectURL`) 같은 item에 유용합니다.
	*/
	onEviction?: (key: KeyType, value: ValueType) => void;
};

interface CacheItem<ValueType> {
	value: ValueType;
	expiry?: number;
}

/**
간단한 ["Least Recently Used" (LRU) cache](https://en.m.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_.28LRU.29).

인스턴스는 `[key, value]` 쌍의 [`Iterable`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols)이므로 [`for…of`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/for...of) loop에서 직접 사용할 수 있습니다.

@example
```
import QuickLRU from 'quick-lru';

const lru = new QuickLRU({maxSize: 1000});

lru.set('🦄', '🌈');

lru.has('🦄');
//=> true

lru.get('🦄');
//=> '🌈'
```
*/
export default class QuickLRU<KeyType = unknown, ValueType = unknown>
	implements Iterable<[KeyType, ValueType]>
{
	#size = 0;
	#cache = new Map<KeyType, CacheItem<ValueType>>();
	#oldCache = new Map<KeyType, CacheItem<ValueType>>();
	#maxSize: number;
	#maxAge: number;
	#onEviction?: (key: KeyType, value: ValueType) => void;

	constructor(
		options: Options<KeyType, ValueType> = {} as Options<KeyType, ValueType>,
	) {
		if (!(options.maxSize && options.maxSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		if (typeof options.maxAge === 'number' && options.maxAge === 0) {
			throw new TypeError('`maxAge` must be a number greater than 0');
		}

		this.#maxSize = options.maxSize;
		this.#maxAge = options.maxAge || Number.POSITIVE_INFINITY;
		this.#onEviction = options.onEviction;
	}

	// 테스트용.
	get __oldCache() {
		return this.#oldCache;
	}

	#emitEvictions(cache: Map<KeyType, CacheItem<ValueType>>): void {
		if (typeof this.#onEviction !== 'function') {
			return;
		}

		for (const [key, item] of cache) {
			this.#onEviction(key, item.value);
		}
	}

	#deleteIfExpired(key: KeyType, item: CacheItem<ValueType>): boolean {
		if (typeof item.expiry === 'number' && item.expiry <= Date.now()) {
			if (typeof this.#onEviction === 'function') {
				this.#onEviction(key, item.value);
			}

			return this.delete(key);
		}

		return false;
	}

	#getOrDeleteIfExpired(
		key: KeyType,
		item: CacheItem<ValueType>,
	): ValueType | undefined {
		const deleted = this.#deleteIfExpired(key, item);
		if (deleted === false) {
			return item.value;
		}
	}

	#getItemValue(
		key: KeyType,
		item: CacheItem<ValueType>,
	): ValueType | undefined {
		return item.expiry ? this.#getOrDeleteIfExpired(key, item) : item.value;
	}

	#peek(
		key: KeyType,
		cache: Map<KeyType, CacheItem<ValueType>>,
	): ValueType | undefined {
		const item = cache.get(key);
		return item ? this.#getItemValue(key, item) : undefined;
	}

	#set(key: KeyType, value: CacheItem<ValueType>): void {
		this.#cache.set(key, value);
		this.#size++;

		if (this.#size >= this.#maxSize) {
			this.#size = 0;
			this.#emitEvictions(this.#oldCache);
			this.#oldCache = this.#cache;
			this.#cache = new Map<KeyType, CacheItem<ValueType>>();
		}
	}

	#moveToRecent(key: KeyType, item: CacheItem<ValueType>): void {
		this.#oldCache.delete(key);
		this.#set(key, item);
	}

	*#entriesAscending(): Generator<
		[KeyType, CacheItem<ValueType>],
		void,
		unknown
	> {
		for (const item of this.#oldCache) {
			const [key, value] = item;
			if (!this.#cache.has(key)) {
				const deleted = this.#deleteIfExpired(key, value);
				if (deleted === false) {
					yield item;
				}
			}
		}

		for (const item of this.#cache) {
			const [key, value] = item;
			const deleted = this.#deleteIfExpired(key, value);
			if (deleted === false) {
				yield item;
			}
		}
	}

	get(key: KeyType): ValueType | undefined {
		if (this.#cache.has(key)) {
			const item = this.#cache.get(key);
			return item ? this.#getItemValue(key, item) : undefined;
		}

		if (this.#oldCache.has(key)) {
			const item = this.#oldCache.get(key);
			if (item && this.#deleteIfExpired(key, item) === false) {
				this.#moveToRecent(key, item);
				return item.value;
			}
		}
	}

	set(
		key: KeyType,
		value: ValueType,
		{maxAge = this.#maxAge}: {maxAge?: number} = {},
	): this {
		const expiry =
			typeof maxAge === 'number' && maxAge !== Number.POSITIVE_INFINITY
				? Date.now() + maxAge
				: undefined;

		if (this.#cache.has(key)) {
			this.#cache.set(key, {
				value,
				expiry,
			});
		} else {
			this.#set(key, {value, expiry});
		}

		return this;
	}

	has(key: KeyType): boolean {
		if (this.#cache.has(key)) {
			const item = this.#cache.get(key);
			return item ? !this.#deleteIfExpired(key, item) : false;
		}

		if (this.#oldCache.has(key)) {
			const item = this.#oldCache.get(key);
			return item ? !this.#deleteIfExpired(key, item) : false;
		}

		return false;
	}

	peek(key: KeyType): ValueType | undefined {
		if (this.#cache.has(key)) {
			return this.#peek(key, this.#cache);
		}

		if (this.#oldCache.has(key)) {
			return this.#peek(key, this.#oldCache);
		}
	}

	expiresIn(key: KeyType): number | undefined {
		const item = this.#cache.get(key) ?? this.#oldCache.get(key);
		if (item) {
			return item.expiry ? item.expiry - Date.now() : Number.POSITIVE_INFINITY;
		}
	}

	delete(key: KeyType): boolean {
		const deleted = this.#cache.delete(key);
		if (deleted) {
			this.#size--;
		}

		return this.#oldCache.delete(key) || deleted;
	}

	clear(): void {
		this.#cache.clear();
		this.#oldCache.clear();
		this.#size = 0;
	}

	resize(newSize: number): void {
		if (!(newSize && newSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		const items = [...this.#entriesAscending()];
		const removeCount = items.length - newSize;
		if (removeCount < 0) {
			this.#cache = new Map(items);
			this.#oldCache = new Map();
			this.#size = items.length;
		} else {
			if (removeCount > 0) {
				this.#emitEvictions(new Map(items.slice(0, removeCount)));
			}

			this.#oldCache = new Map(items.slice(removeCount));
			this.#cache = new Map();
			this.#size = 0;
		}

		this.#maxSize = newSize;
	}

	*keys(): IterableIterator<KeyType> {
		for (const [key] of this) {
			yield key;
		}
	}

	*values(): IterableIterator<ValueType> {
		for (const [, value] of this) {
			yield value;
		}
	}

	*[Symbol.iterator](): IterableIterator<[KeyType, ValueType]> {
		for (const item of this.#cache) {
			const [key, value] = item;
			const deleted = this.#deleteIfExpired(key, value);
			if (deleted === false) {
				yield [key, value.value];
			}
		}

		for (const item of this.#oldCache) {
			const [key, value] = item;
			if (!this.#cache.has(key)) {
				const deleted = this.#deleteIfExpired(key, value);
				if (deleted === false) {
					yield [key, value.value];
				}
			}
		}
	}

	*entriesDescending(): IterableIterator<[KeyType, ValueType]> {
		let items = [...this.#cache];
		for (let i = items.length - 1; i >= 0; --i) {
			const item = items[i];
			const [key, value] = item;
			const deleted = this.#deleteIfExpired(key, value);
			if (deleted === false) {
				yield [key, value.value];
			}
		}

		items = [...this.#oldCache];
		for (let i = items.length - 1; i >= 0; --i) {
			const item = items[i];
			const [key, value] = item;
			if (!this.#cache.has(key)) {
				const deleted = this.#deleteIfExpired(key, value);
				if (deleted === false) {
					yield [key, value.value];
				}
			}
		}
	}

	*entriesAscending(): IterableIterator<[KeyType, ValueType]> {
		for (const [key, value] of this.#entriesAscending()) {
			yield [key, value.value];
		}
	}

	get size() {
		if (!this.#size) {
			return this.#oldCache.size;
		}

		let oldCacheSize = 0;
		for (const key of this.#oldCache.keys()) {
			if (!this.#cache.has(key)) {
				oldCacheSize++;
			}
		}

		return Math.min(this.#size + oldCacheSize, this.#maxSize);
	}

	get maxSize() {
		return this.#maxSize;
	}

	entries(): IterableIterator<[KeyType, ValueType]> {
		return this.entriesAscending();
	}

	forEach(
		callbackFunction: (value: ValueType, key: KeyType, map: this) => void,
		thisArgument: unknown = this,
	): void {
		for (const [key, value] of this.entriesAscending()) {
			callbackFunction.call(thisArgument, value, key, this);
		}
	}

	get [Symbol.toStringTag]() {
		return 'QuickLRU';
	}

	toString() {
		return `QuickLRU(${this.size}/${this.maxSize})`;
	}

	[Symbol.for('nodejs.util.inspect.custom')]() {
		return this.toString();
	}
}
