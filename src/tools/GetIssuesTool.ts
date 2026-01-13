import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
import { executeGraphQL } from '../utils';
import { getCacheKey, getFromCache, setInCache } from '../cache';

interface Issue {
  id: string;
  checkGroupAndName: string;
  description: string;
  severity: string;
  state: string;
  createdAt: number;
  updatedAt: number;
  references: Array<{
    kind: string;
    name: string;
    url: string;
    resolvedAt: number | null;
  }>;
}

interface GetIssuesResponse {
  getIssues: Issue[];
}

export class GetIssuesTool implements IRushMcpTool<GetIssuesTool['schema']> {
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

  public async executeAsync(input: zodModule.infer<GetIssuesTool['schema']>): Promise<CallToolResult> {
    try {
      const cacheKey = getCacheKey('pganalyze_get_issues', input as Record<string, unknown>);
      
      // Check cache unless forceRefresh is true
      if (!input.forceRefresh) {
        const cached = getFromCache<{ issue_count: number; issues: unknown[] }>(cacheKey);
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

      const variables: Record<string, unknown> = {};
      if ((input as Record<string, unknown>).organizationSlug) variables.organizationSlug = (input as Record<string, unknown>).organizationSlug;
      if (input.serverId) variables.serverId = input.serverId;
      if (input.databaseId) variables.databaseId = input.databaseId;
      // Filter by state - 'open' means unresolved, 'resolved' means resolved
      if (!input.resolved) {
        variables.state = 'open';
      }

      const data = await executeGraphQL<GetIssuesResponse>(query, variables);

      let issues = data.getIssues;

      // Filter by severity if specified
      if (input.severity) {
        issues = issues.filter(i => i.severity.toLowerCase() === input.severity!.toLowerCase());
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
            text: `Failed to get issues: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }
}
