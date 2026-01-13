"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetServersTool = void 0;
const utils_1 = require("../utils");
const cache_1 = require("../cache");
class GetServersTool {
    constructor(plugin) {
        this.plugin = plugin;
        this.session = plugin.session;
    }
    get schema() {
        const zod = this.session.zod;
        return zod.object({
            organizationSlug: zod
                .string()
                .optional()
                .describe('Organization slug to filter servers by (e.g., "curri-inc")'),
            forceRefresh: zod
                .boolean()
                .optional()
                .describe('Force a fresh API call, bypassing the 1-hour cache'),
        });
    }
    async executeAsync(input) {
        try {
            console.error('[GetServersTool] Input received:', JSON.stringify(input));
            const cacheKey = (0, cache_1.getCacheKey)('pganalyze_get_servers', input);
            // Check cache unless forceRefresh is true
            if (!input.forceRefresh) {
                const cached = (0, cache_1.getFromCache)(cacheKey);
                if (cached) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    servers: cached.getServers,
                                    count: cached.getServers.length,
                                    cached: true,
                                }, null, 2),
                            },
                        ],
                    };
                }
            }
            const query = `
        query GetServers($organizationSlug: ID) {
          getServers(organizationSlug: $organizationSlug) {
            id
            name
            humanId
            databases {
              id
              datname
              displayName
            }
          }
        }
      `;
            const variables = {};
            const inputAny = input;
            if (inputAny.organizationSlug) {
                variables.organizationSlug = inputAny.organizationSlug;
            }
            const data = await (0, utils_1.executeGraphQL)(query, variables);
            // Cache the response
            (0, cache_1.setInCache)(cacheKey, data);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            input_received: input,
                            variables_used: variables,
                            servers: data.getServers,
                            count: data.getServers.length,
                            cached: false,
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to get servers: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
}
exports.GetServersTool = GetServersTool;
//# sourceMappingURL=GetServersTool.js.map