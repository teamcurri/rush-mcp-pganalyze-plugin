import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
export declare class GetServersTool implements IRushMcpTool<GetServersTool['schema']> {
    readonly plugin: PganalyzePlugin;
    readonly session: RushMcpPluginSession;
    constructor(plugin: PganalyzePlugin);
    get schema(): zodModule.ZodObject<{}, "strip", zodModule.ZodTypeAny, {}, {}>;
    executeAsync(_input: zodModule.infer<GetServersTool['schema']>): Promise<CallToolResult>;
}
//# sourceMappingURL=GetServersTool.d.ts.map