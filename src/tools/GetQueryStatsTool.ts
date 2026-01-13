import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
import { executeGraphQL } from '../utils';

interface QueryStat {
  id: string;
  queryUrl: string;
  normalizedQuery: string;
  truncatedQuery: string;
  queryComment: string | null;
  statementTypes: string[];
  totalCalls: number;
  avgTime: number;
  avgIoTime: number | null;
  bufferHitRatio: number;
  pctOfTotal: number;
}

interface GetQueryStatsResponse {
  getQueryStats: QueryStat[];
}

export class GetQueryStatsTool implements IRushMcpTool<GetQueryStatsTool['schema']> {
  public readonly plugin: PganalyzePlugin;
  public readonly session: RushMcpPluginSession;

  public constructor(plugin: PganalyzePlugin) {
    this.plugin = plugin;
    this.session = plugin.session;
  }

  public get schema() {
    const zod: typeof zodModule = this.session.zod;
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

  public async executeAsync(input: zodModule.infer<GetQueryStatsTool['schema']>): Promise<CallToolResult> {
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

      const variables: Record<string, unknown> = {
        databaseId: input.databaseId,
      };
      if (input.startTs) variables.startTs = input.startTs;
      if (input.endTs) variables.endTs = input.endTs;

      const data = await executeGraphQL<GetQueryStatsResponse>(query, variables);

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
    } catch (error) {
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
