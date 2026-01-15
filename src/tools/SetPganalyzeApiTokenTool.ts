import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';

export class SetPganalyzeApiTokenTool implements IRushMcpTool<SetPganalyzeApiTokenTool['schema']> {
  public readonly plugin: PganalyzePlugin;
  public readonly session: RushMcpPluginSession;

  public constructor(plugin: PganalyzePlugin) {
    this.plugin = plugin;
    this.session = plugin.session;
  }

  public get schema() {
    const zod: typeof zodModule = this.session.zod;
    return zod.object({
      token: zod
        .string()
        .describe('The pganalyze API token to configure'),
    });
  }

  public async executeAsync(input: zodModule.infer<SetPganalyzeApiTokenTool['schema']>): Promise<CallToolResult> {
    try {
      if (!input.token || input.token.trim() === '') {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Token cannot be empty.',
            },
          ],
          isError: true,
        };
      }

      // Set the token in the current process environment
      process.env.PGANALYZE_API_TOKEN = input.token.trim();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              message: 'pganalyze API token configured successfully for this session.',
              hint: 'You can now proceed with your previous request.',
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to set pganalyze API token: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }
}
