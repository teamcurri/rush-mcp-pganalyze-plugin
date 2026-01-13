import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
import { executeGraphQL } from '../utils';

interface Issue {
  id: string;
  checkName: string;
  description: string;
  severity: string;
  createdAt: string;
  resolvedAt: string | null;
  references: Array<{
    referenceType: string;
    referenceUrl: string;
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

  public async executeAsync(input: zodModule.infer<GetIssuesTool['schema']>): Promise<CallToolResult> {
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

      const variables: Record<string, unknown> = {};
      if (input.serverId) variables.serverId = input.serverId;
      if (input.databaseId) variables.databaseId = input.databaseId;

      const data = await executeGraphQL<GetIssuesResponse>(query, variables);

      let issues = data.getIssues;

      // Filter by resolved status
      if (!input.resolved) {
        issues = issues.filter(i => i.resolvedAt === null);
      }

      // Filter by severity if specified
      if (input.severity) {
        issues = issues.filter(i => i.severity.toLowerCase() === input.severity!.toLowerCase());
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
