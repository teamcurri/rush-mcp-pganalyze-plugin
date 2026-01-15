import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
export declare class SetPganalyzeApiTokenTool implements IRushMcpTool<SetPganalyzeApiTokenTool['schema']> {
    readonly plugin: PganalyzePlugin;
    readonly session: RushMcpPluginSession;
    constructor(plugin: PganalyzePlugin);
    get schema(): zodModule.ZodObject<{
        token: zodModule.ZodString;
    }, "strip", zodModule.ZodTypeAny, {
        token: string;
    }, {
        token: string;
    }>;
    executeAsync(input: zodModule.infer<SetPganalyzeApiTokenTool['schema']>): Promise<CallToolResult>;
}
//# sourceMappingURL=SetPganalyzeApiTokenTool.d.ts.map