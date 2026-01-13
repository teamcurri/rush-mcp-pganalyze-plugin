import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
export declare class GetServersTool implements IRushMcpTool<GetServersTool['schema']> {
    readonly plugin: PganalyzePlugin;
    readonly session: RushMcpPluginSession;
    constructor(plugin: PganalyzePlugin);
    get schema(): zodModule.ZodObject<{
        forceRefresh: zodModule.ZodOptional<zodModule.ZodBoolean>;
    }, "strip", zodModule.ZodTypeAny, {
        forceRefresh?: boolean | undefined;
    }, {
        forceRefresh?: boolean | undefined;
    }>;
    executeAsync(input: zodModule.infer<GetServersTool['schema']>): Promise<CallToolResult>;
}
//# sourceMappingURL=GetServersTool.d.ts.map