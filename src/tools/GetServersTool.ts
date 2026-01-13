import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
import { executeGraphQL } from '../utils';

interface Server {
  id: string;
  name: string;
  databases: Array<{
    id: string;
    name: string;
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
    return zod.object({});
  }

  public async executeAsync(_input: zodModule.infer<GetServersTool['schema']>): Promise<CallToolResult> {
    try {
      const query = `
        query {
          getServers {
            id
            name
            databases {
              id
              name
            }
          }
        }
      `;

      const data = await executeGraphQL<GetServersResponse>(query);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              servers: data.getServers,
              count: data.getServers.length,
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
