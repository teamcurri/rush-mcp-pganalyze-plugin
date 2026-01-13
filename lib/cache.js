"use strict";
/**
 * Simple in-memory cache with TTL support
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheKey = getCacheKey;
exports.getFromCache = getFromCache;
exports.setInCache = setInCache;
exports.clearCache = clearCache;
exports.getCacheStats = getCacheStats;
const cache = new Map();
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
/**
 * Generate a cache key from tool name and input parameters
 */
function getCacheKey(toolName, input) {
    // Remove forceRefresh from the cache key since it's a control parameter
    const { forceRefresh, ...params } = input;
    return `${toolName}:${JSON.stringify(params, Object.keys(params).sort())}`;
}
/**
 * Get a cached value if it exists and hasn't expired
 */
function getFromCache(key) {
    const entry = cache.get(key);
    if (!entry) {
        return undefined;
    }
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return undefined;
    }
    return entry.data;
}
/**
 * Store a value in the cache
 */
function setInCache(key, data, ttlMs = DEFAULT_TTL_MS) {
    cache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
    });
}
/**
 * Clear the entire cache
 */
function clearCache() {
    cache.clear();
}
/**
 * Get cache statistics
 */
function getCacheStats() {
    return {
        size: cache.size,
        keys: Array.from(cache.keys()),
    };
}
//# sourceMappingURL=cache.js.map