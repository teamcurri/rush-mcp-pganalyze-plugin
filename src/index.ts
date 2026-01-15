import type { IRushMcpPlugin, RushMcpPluginSession } from './types/rush-mcp-plugin';
import { GetServersTool } from './tools/GetServersTool';
import { GetQueryStatsTool } from './tools/GetQueryStatsTool';
import { GetIssuesTool } from './tools/GetIssuesTool';
import { SetPganalyzeApiTokenTool } from './tools/SetPganalyzeApiTokenTool';

export class PganalyzePlugin implements IRushMcpPlugin {
  public session: RushMcpPluginSession;

  public constructor(session: RushMcpPluginSession) {
    this.session = session;
  }

  public async onInitializeAsync(): Promise<void> {
    // Register configuration tool first - doesn't require token
    this.session.registerTool(
      { toolName: 'set_pganalyze_api_token' },
      new SetPganalyzeApiTokenTool(this)
    );

    // Register data tools - they will check for token at runtime
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

    // Log token status but don't fail
    if (!process.env.PGANALYZE_API_TOKEN) {
      console.error('[pganalyze Plugin] API token not set - tools will prompt for configuration');
    }

    console.error('[pganalyze Plugin] Registered 4 tools (set_pganalyze_api_token, pganalyze_get_servers, pganalyze_get_query_stats, pganalyze_get_issues)');
  }

  public async onShutdownAsync(): Promise<void> {
    // Nothing to clean up
  }
}

export default (session: RushMcpPluginSession) => new PganalyzePlugin(session);
