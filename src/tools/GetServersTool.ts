import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
import { executeGraphQL } from '../utils';
import { getCacheKey, getFromCache, setInCache } from '../cache';

interface Server {
  id: string;
  name: string;
  humanId: string;
  databases: Array<{
    id: string;
    datname: string | null;
    displayName: string;
  }>;
}

interface GetServersResponse {
  getServers: Server[];
}

export class GetServersTool implements IRushMcpTool<GetServersTool['schema']> {
  public readonly plugin: PganalyzePlugin;
  public readonly session: RushMcpPluginSession;

  public constructor(plugin: PganalyzePlugin) {
    this.plugin = plugin;
    this.session = plugin.session;
  }

  public get schema() {
    const zod: typeof zodModule = this.session.zod;
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

  public async executeAsync(input: zodModule.infer<GetServersTool['schema']>): Promise<CallToolResult> {
    try {
      const cacheKey = getCacheKey('pganalyze_get_servers', input as Record<string, unknown>);
      
      // Check cache unless forceRefresh is true
      if (!input.forceRefresh) {
        const cached = getFromCache<GetServersResponse>(cacheKey);
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

      const variables: Record<string, unknown> = {};
      const inputAny = input as { organizationSlug?: string; forceRefresh?: boolean };
      if (inputAny.organizationSlug) {
        variables.organizationSlug = inputAny.organizationSlug;
      }

      const data = await executeGraphQL<GetServersResponse>(query, variables);
      
      // Cache the response
      setInCache(cacheKey, data);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              servers: data.getServers,
              count: data.getServers.length,
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
            text: `Failed to get servers: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }
}
