/**
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a cache key from tool name and input parameters
 */
export function getCacheKey(toolName: string, input: Record<string, unknown>): string {
  // Remove forceRefresh from the cache key since it's a control parameter
  const { forceRefresh, ...params } = input;
  return `${toolName}:${JSON.stringify(params, Object.keys(params).sort())}`;
}

/**
 * Get a cached value if it exists and hasn't expired
 */
export function getFromCache<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
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
export function setInCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
