interface CacheEntry {
	
};

const data = new Map<string, string>();

class MyCache {

	public data: Map<string, string>;

	constructor(data: Map<string, string>) {
		this.data = data;
	}

	public set(key: string, value: string) {
		this.data.set(key, value);
	}

	public get(key: string) {
		return this.data.get(key);
	}

	public deleteEntry(key: string) {
		this.data.delete(key);
	}

}

export const mogus = new MyCache(data);