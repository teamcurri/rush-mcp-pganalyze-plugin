"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PGANALYZE_API_URL = void 0;
exports.checkApiToken = checkApiToken;
exports.executeGraphQL = executeGraphQL;
exports.PGANALYZE_API_URL = 'https://app.pganalyze.com/graphql';
/**
 * Check if PGANALYZE_API_TOKEN is set
 */
function checkApiToken() {
    if (!process.env.PGANALYZE_API_TOKEN) {
        throw new Error('PGANALYZE_API_TOKEN environment variable is not set. ' +
            'Create an API key at https://app.pganalyze.com/settings/api-keys');
    }
}
/**
 * Execute a GraphQL query against the pganalyze API
 */
async function executeGraphQL(query, variables) {
    const apiToken = process.env.PGANALYZE_API_TOKEN;
    if (!apiToken) {
        throw new Error('PGANALYZE_API_TOKEN environment variable not set');
    }
    const response = await fetch(exports.PGANALYZE_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });
    if (!response.ok) {
        throw new Error(`pganalyze API request failed: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL error: ${result.errors.map(e => e.message).join(', ')}`);
    }
    if (!result.data) {
        throw new Error('No data returned from pganalyze API');
    }
    return result.data;
}
//# sourceMappingURL=utils.js.map