/**
 * Simple in-memory cache with TTL support
 */
/**
 * Generate a cache key from tool name and input parameters
 */
export declare function getCacheKey(toolName: string, input: Record<string, unknown>): string;
/**
 * Get a cached value if it exists and hasn't expired
 */
export declare function getFromCache<T>(key: string): T | undefined;
/**
 * Store a value in the cache
 */
export declare function setInCache<T>(key: string, data: T, ttlMs?: number): void;
/**
 * Clear the entire cache
 */
export declare function clearCache(): void;
/**
 * Get cache statistics
 */
export declare function getCacheStats(): {
    size: number;
    keys: string[];
};
//# sourceMappingURL=cache.d.ts.map