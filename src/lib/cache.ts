type CacheEntry<T extends any> = {
	timestamp: number;
	ttl: number;
	data: T;
};

const cache = new Map<string, CacheEntry<any>>();

class Cache {
	public cache = new Map<string, CacheEntry<any>>();

	constructor(c: Map<string, CacheEntry<any>>) {
		this.cache = cache
	}

	/**
	 * Gets an entry from cache.
	 * @param key unique key for cache entry
	 * @returns data inside cache entry
	 */
	public get<T>(key: string): T | undefined {
		const entry = this.cache.get(key);
		if (entry && entry.timestamp + entry.ttl < Date.now()) {
			return undefined;
		}
		return entry?.data;
	}

	/**
	 * Inserts or updates an entry in cache.
	 * @param key unique key for accessing the entry
	 * @param value any value to store in cache
	 * @param ttl time-to-live (entry will become `undefined` after ttl ends), default: 30 minutes
	 */
	public set(key: string, value: any, ttl: number = 1_800_000) {
		this.cache.set(key, {
			timestamp: Date.now(),
			ttl: ttl,
			data: value,
		});
	}

	/**
	 * Deletes an entry from cache.
	 * @param key key identifying the entry that should be deleted
	 */
	public delete(key: string) {
		this.cache.delete(key);
	}
}

export const CACHE = new Cache(cache);
