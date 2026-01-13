"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetQueryStatsTool = void 0;
const utils_1 = require("../utils");
class GetQueryStatsTool {
    constructor(plugin) {
        this.plugin = plugin;
        this.session = plugin.session;
    }
    get schema() {
        const zod = this.session.zod;
        return zod.object({
            databaseId: zod
                .string()
                .describe('Database ID from pganalyze (use get_servers to find this)'),
            startTs: zod
                .number()
                .optional()
                .describe('Start Unix timestamp in seconds (defaults to 24 hours ago)'),
            endTs: zod
                .number()
                .optional()
                .describe('End Unix timestamp in seconds (defaults to now)'),
            limit: zod
                .number()
                .default(20)
                .describe('Number of queries to return (default: 20)'),
        });
    }
    async executeAsync(input) {
        try {
            const query = `
        query GetQueryStats($databaseId: ID!, $startTs: Int, $endTs: Int) {
          getQueryStats(databaseId: $databaseId, startTs: $startTs, endTs: $endTs) {
            id
            queryUrl
            normalizedQuery
            truncatedQuery
            queryComment
            statementTypes
            totalCalls
            avgTime
            avgIoTime
            bufferHitRatio
            pctOfTotal
          }
        }
      `;
            const variables = {
                databaseId: input.databaseId,
            };
            if (input.startTs)
                variables.startTs = input.startTs;
            if (input.endTs)
                variables.endTs = input.endTs;
            const data = await (0, utils_1.executeGraphQL)(query, variables);
            // Limit results and sort by pctOfTotal descending
            const queries = data.getQueryStats
                .sort((a, b) => b.pctOfTotal - a.pctOfTotal)
                .slice(0, input.limit)
                .map(q => ({
                id: q.id,
                query: q.truncatedQuery,
                url: q.queryUrl,
                statement_types: q.statementTypes,
                total_calls: q.totalCalls,
                avg_time_ms: Math.round(q.avgTime * 100) / 100,
                buffer_hit_ratio: Math.round(q.bufferHitRatio * 100) / 100,
                pct_of_total: Math.round(q.pctOfTotal * 100) / 100,
            }));
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            database_id: input.databaseId,
                            query_count: queries.length,
                            queries,
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
                        text: `Failed to get query stats: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
}
exports.GetQueryStatsTool = GetQueryStatsTool;
//# sourceMappingURL=GetQueryStatsTool.js.map