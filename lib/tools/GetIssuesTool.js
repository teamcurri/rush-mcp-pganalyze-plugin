"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetIssuesTool = void 0;
const utils_1 = require("../utils");
class GetIssuesTool {
    constructor(plugin) {
        this.plugin = plugin;
        this.session = plugin.session;
    }
    get schema() {
        const zod = this.session.zod;
        return zod.object({
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
        });
    }
    async executeAsync(input) {
        try {
            const query = `
        query GetIssues($serverId: ID, $databaseId: ID) {
          getIssues(serverId: $serverId, databaseId: $databaseId) {
            id
            checkName
            description
            severity
            createdAt
            resolvedAt
            references {
              referenceType
              referenceUrl
            }
          }
        }
      `;
            const variables = {};
            if (input.serverId)
                variables.serverId = input.serverId;
            if (input.databaseId)
                variables.databaseId = input.databaseId;
            const data = await (0, utils_1.executeGraphQL)(query, variables);
            let issues = data.getIssues;
            // Filter by resolved status
            if (!input.resolved) {
                issues = issues.filter(i => i.resolvedAt === null);
            }
            // Filter by severity if specified
            if (input.severity) {
                issues = issues.filter(i => i.severity.toLowerCase() === input.severity.toLowerCase());
            }
            const formattedIssues = issues.map(i => ({
                id: i.id,
                check: i.checkName,
                description: i.description,
                severity: i.severity,
                created_at: i.createdAt,
                resolved_at: i.resolvedAt,
                references: i.references,
            }));
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            issue_count: formattedIssues.length,
                            issues: formattedIssues,
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