"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetIssuesTool = void 0;
const utils_1 = require("../utils");
const cache_1 = require("../cache");
class GetIssuesTool {
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
                .describe('Organization slug to filter issues by (optional, but required if no serverId)'),
            serverId: zod
                .string()
                .optional()
                .describe('Server ID to filter issues by (optional)'),
            databaseId: zod
                .string()
                .optional()
                .describe('Database ID to filter issues by (optional)'),
            severity: zod
                .string()
                .optional()
                .describe('Filter by severity: info, warning, critical (optional)'),
            resolved: zod
                .boolean()
                .default(false)
                .describe('Include resolved issues (default: false)'),
            forceRefresh: zod
                .boolean()
                .optional()
                .describe('Force a fresh API call, bypassing the 1-hour cache'),
        });
    }
    async executeAsync(input) {
        try {
            const cacheKey = (0, cache_1.getCacheKey)('pganalyze_get_issues', input);
            // Check cache unless forceRefresh is true
            if (!input.forceRefresh) {
                const cached = (0, cache_1.getFromCache)(cacheKey);
                if (cached) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    ...cached,
                                    cached: true,
                                }, null, 2),
                            },
                        ],
                    };
                }
            }
            const query = `
        query GetIssues($organizationSlug: ID, $serverId: ID, $databaseId: ID, $state: String) {
          getIssues(organizationSlug: $organizationSlug, serverId: $serverId, databaseId: $databaseId, state: $state) {
            id
            checkGroupAndName
            description
            severity
            state
            createdAt
            updatedAt
            references {
              kind
              name
              url
              resolvedAt
            }
          }
        }
      `;
            const variables = {};
            if (input.organizationSlug)
                variables.organizationSlug = input.organizationSlug;
            if (input.serverId)
                variables.serverId = input.serverId;
            if (input.databaseId)
                variables.databaseId = input.databaseId;
            // Filter by state - 'open' means unresolved, 'resolved' means resolved
            if (!input.resolved) {
                variables.state = 'open';
            }
            const data = await (0, utils_1.executeGraphQL)(query, variables);
            let issues = data.getIssues;
            // Filter by severity if specified
            if (input.severity) {
                issues = issues.filter(i => i.severity.toLowerCase() === input.severity.toLowerCase());
            }
            const formattedIssues = issues.map(i => ({
                id: i.id,
                check: i.checkGroupAndName,
                description: i.description,
                severity: i.severity,
                state: i.state,
                created_at: new Date(i.createdAt * 1000).toISOString(),
                updated_at: new Date(i.updatedAt * 1000).toISOString(),
                references: i.references.map(r => ({
                    kind: r.kind,
                    name: r.name,
                    url: r.url,
                })),
            }));
            const result = {
                issue_count: formattedIssues.length,
                issues: formattedIssues,
            };
            // Cache the formatted result
            (0, cache_1.setInCache)(cacheKey, result);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            ...result,
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
                        text: `Failed to get issues: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
}
exports.GetIssuesTool = GetIssuesTool;
//# sourceMappingURL=GetIssuesTool.js.map