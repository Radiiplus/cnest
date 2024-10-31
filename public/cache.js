class AdvancedCache {
    constructor(options = {}) {
        this.cache = new Map();
        this.config = {
            maxEntries: options.maxEntries || 100,
            maxAge: options.maxAge || 24 * 60 * 60 * 1000,
            autoPrune: options.autoPrune !== undefined ? options.autoPrune : true,
            pruneInterval: options.pruneInterval || 60 * 60 * 1000,
        };

        if (this.config.autoPrune) {
            this.startAutoPrune();
        }
    }

    genKey(path, params = {}) {
        const stringifyParam = (param) => {
            if (param === null || param === undefined) return '';
            if (typeof param === 'object') {
                return JSON.stringify(Object.entries(param)
                    .sort()
                    .map(([k, v]) => `${k}:${stringifyParam(v)}`)
                );
            }
            return String(param);
        };

        const sortedParams = Object.entries(params)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${stringifyParam(value)}`)
            .join('&');

        return `${path}?${sortedParams}`;
    }

    set(path, content, options = {}) {
        const entry = {
            content,
            meta: {
                createdAt: Date.now(),
                etag: options.etag,
                lastModified: options.lastModified,
                tags: options.tags || [],
                size: new Blob([content]).size
            }
        };

        const key = this.genKey(path, options.params);
        this.cache.set(key, entry);

        this.maintainCacheSize();

        return entry;
    }

    get(path, params = {}) {
        const key = this.genKey(path, params);
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (this.isExpired(entry)) {
            this.cache.delete(key);
            return null;
        }

        return entry;
    }

    isValid(path, params = {}) {
        const entry = this.get(path, params);
        return !!entry;
    }

    isExpired(entry) {
        return (Date.now() - entry.meta.createdAt) > this.config.maxAge;
    }

    maintainCacheSize() {
        if (this.cache.size <= this.config.maxEntries) return;

        const sortedEntries = Array.from(this.cache.entries())
            .sort((a, b) => a[1].meta.createdAt - b[1].meta.createdAt);

        while (this.cache.size > this.config.maxEntries) {
            const [oldestKey] = sortedEntries.shift();
            this.cache.delete(oldestKey);
        }
    }

    startAutoPrune() {
        this.pruneTimer = setInterval(() => {
            for (const [key, entry] of this.cache.entries()) {
                if (this.isExpired(entry)) {
                    this.cache.delete(key);
                }
            }
        }, this.config.pruneInterval);
    }

    clearByTag(tag) {
        for (const [key, entry] of this.cache.entries()) {
            if (entry.meta.tags.includes(tag)) {
                this.cache.delete(key);
            }
        }
    }

    getStats() {
        return {
            totalEntries: this.cache.size,
            totalSize: Array.from(this.cache.values())
                .reduce((sum, entry) => sum + entry.meta.size, 0),
            oldestEntry: Array.from(this.cache.values())
                .reduce((oldest, entry) => 
                    (!oldest || entry.meta.createdAt < oldest.meta.createdAt) ? entry : oldest, 
                null)
        };
    }

    stopAutoPrune() {
        if (this.pruneTimer) {
            clearInterval(this.pruneTimer);
        }
    }

    clear(path, params = {}) {
        const key = this.genKey(path, params);
        this.cache.delete(key);
    }

    clearAll() {
        this.cache.clear();
    }
}

class AdvancedFetcher {
    constructor(cache) {
        this.cache = cache;
    }

    async fetch(path, options = {}) {
        const cached = this.cache.get(path, options.params);
        const headers = new Headers(options.headers || {});
        
        if (cached?.meta.etag) {
            headers.append('If-None-Match', cached.meta.etag);
        }
        
        if (cached?.meta.lastModified) {
            headers.append('If-Modified-Since', cached.meta.lastModified);
        }

        try {
            const res = await fetch(path, { 
                ...options, 
                headers 
            });

            if (res.status === 304 && cached) {
                return { 
                    content: cached.content, 
                    fromCache: true, 
                    status: 304 
                };
            }

            if (res.ok) {
                const content = await res.text();
                
                this.cache.set(path, content, {
                    etag: res.headers.get('ETag'),
                    lastModified: res.headers.get('Last-Modified'),
                    tags: options.tags,
                    params: options.params
                });

                return { 
                    content, 
                    fromCache: false, 
                    status: res.status 
                };
            }

            throw new Error(`Failed to fetch page: ${res.status}`);
        } catch (error) {
            if (cached) {
                console.warn('Network error, serving from cache:', error);
                return { 
                    content: cached.content, 
                    fromCache: true, 
                    status: 200 
                };
            }
            throw error;
        }
    }
}

export const pageCache = new AdvancedCache({
    maxEntries: 200,
    maxAge: 48 * 60 * 60 * 1000,
    autoPrune: true
});

export const pageFetcher = new AdvancedFetcher(pageCache);