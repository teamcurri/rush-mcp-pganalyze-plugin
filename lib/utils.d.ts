export declare const PGANALYZE_API_URL = "https://app.pganalyze.com/graphql";
/**
 * Check if PGANALYZE_API_TOKEN is set
 */
export declare function checkApiToken(): void;
/**
 * Execute a GraphQL query against the pganalyze API
 */
export declare function executeGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T>;
//# sourceMappingURL=utils.d.ts.map