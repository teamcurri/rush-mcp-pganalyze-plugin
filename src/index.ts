import type { IRushMcpPlugin, RushMcpPluginSession } from './types/rush-mcp-plugin';
import { checkApiToken } from './utils';
import { GetServersTool } from './tools/GetServersTool';
import { GetQueryStatsTool } from './tools/GetQueryStatsTool';
import { GetIssuesTool } from './tools/GetIssuesTool';

export class PganalyzePlugin implements IRushMcpPlugin {
  public session: RushMcpPluginSession;

  public constructor(session: RushMcpPluginSession) {
    this.session = session;
  }

  public async onInitializeAsync(): Promise<void> {
    // Check API token on boot - throws if not set
    checkApiToken();

    // Register tools
    this.session.registerTool(
      { toolName: 'pganalyze_get_servers' },
      new GetServersTool(this)
    );

    this.session.registerTool(
      { toolName: 'pganalyze_get_query_stats' },
      new GetQueryStatsTool(this)
    );

    this.session.registerTool(
      { toolName: 'pganalyze_get_issues' },
      new GetIssuesTool(this)
    );

    console.error('[pganalyze Plugin] Registered 3 tools (pganalyze_get_servers, pganalyze_get_query_stats, pganalyze_get_issues)');
  }

  public async onShutdownAsync(): Promise<void> {
    // Nothing to clean up
  }
}

export default (session: RushMcpPluginSession) => new PganalyzePlugin(session);
