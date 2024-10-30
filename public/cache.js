class Cache {
    constructor() {
        this.cache = new Map();
    }

    genKey(path, params = {}) {
        return `${path}${Object.entries(params).sort().join('')}`;
    }

    set(path, content, etag, last) {
        const entry = {
            content,
            meta: {
                etag,
                last,
                at: Date.now()
            }
        };
        this.cache.set(this.genKey(path), entry);
    }

    get(path) {
        return this.cache.get(this.genKey(path));
    }

    isValid(path) {
        const cached = this.get(path);
        return !!cached;
    }

    clear(path) {
        this.cache.delete(this.genKey(path));
    }

    clearAll() {
        this.cache.clear();
    }
}

class Fetcher {
    constructor(cache) {
        this.cache = cache;
    }

    async fetch(path) {
        const cached = this.cache.get(path);
        const headers = new Headers();
        
        if (cached?.meta.etag) {
            headers.append('If-None-Match', cached.meta.etag);
        }
        
        if (cached?.meta.last) {
            headers.append('If-Modified-Since', cached.meta.last);
        }

        try {
            const res = await fetch(path, { headers });

            if (res.status === 304 && cached) {
                return { content: cached.content, fromCache: true, status: 304 };
            }

            if (res.ok) {
                const content = await res.text();
                this.cache.set(
                    path,
                    content,
                    res.headers.get('ETag'),
                    res.headers.get('Last-Modified')
                );
                return { content, fromCache: false, status: res.status };
            }

            throw new Error(`Failed to fetch page: ${res.status}`);
        } catch (error) {
            if (cached) {
                console.warn('Network error, serving from cache:', error);
                return { content: cached.content, fromCache: true, status: 200 };
            }
            throw error;
        }
    }
}

export const pageCache = new Cache();
export const pageFetcher = new Fetcher(pageCache);