import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
import { executeGraphQL } from '../utils';
import { getCacheKey, getFromCache, setInCache } from '../cache';

interface QueryStat {
  id: string;
  queryId: string;
  queryUrl: string;
  normalizedQuery: string;
  truncatedQuery: string;
  queryComment: string | null;
  statementTypes: string[];
  totalCalls: number;
  avgTime: number;
  avgIoTime: number;
  bufferHitRatio: number;
  pctOfTotal: number;
  callsPerMinute: number;
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
      forceRefresh: zod
        .boolean()
        .optional()
        .describe('Force a fresh API call, bypassing the 1-hour cache'),
    });
  }

  public async executeAsync(input: zodModule.infer<GetQueryStatsTool['schema']>): Promise<CallToolResult> {
    try {
      const cacheKey = getCacheKey('pganalyze_get_query_stats', input as Record<string, unknown>);
      
      // Check cache unless forceRefresh is true
      if (!input.forceRefresh) {
        const cached = getFromCache<{ queries: unknown[]; database_id: string }>(cacheKey);
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
        query GetQueryStats($databaseId: ID!, $startTs: Int, $endTs: Int, $limit: Int) {
          getQueryStats(databaseId: $databaseId, startTs: $startTs, endTs: $endTs, limit: $limit) {
            id
            queryId
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
            callsPerMinute
          }
        }
      `;

      const variables: Record<string, unknown> = {
        databaseId: input.databaseId,
        limit: input.limit,
      };
      if (input.startTs) variables.startTs = input.startTs;
      if (input.endTs) variables.endTs = input.endTs;

      const data = await executeGraphQL<GetQueryStatsResponse>(query, variables);

      // Results already sorted by pganalyze, just map
      const queries = data.getQueryStats
        .map(q => ({
          id: q.queryId,
          query: q.truncatedQuery,
          url: q.queryUrl,
          statement_types: q.statementTypes,
          total_calls: q.totalCalls,
          calls_per_minute: Math.round(q.callsPerMinute * 100) / 100,
          avg_time_ms: Math.round(q.avgTime * 100) / 100,
          buffer_hit_ratio: Math.round(q.bufferHitRatio * 100) / 100,
          pct_of_total: Math.round(q.pctOfTotal * 100) / 100,
        }));

      const result = {
        database_id: input.databaseId,
        query_count: queries.length,
        queries,
      };
      
      // Cache the formatted result
      setInCache(cacheKey, result);

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
