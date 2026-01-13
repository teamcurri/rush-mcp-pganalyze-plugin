import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
export declare class GetServersTool implements IRushMcpTool<GetServersTool['schema']> {
    readonly plugin: PganalyzePlugin;
    readonly session: RushMcpPluginSession;
    constructor(plugin: PganalyzePlugin);
    get schema(): zodModule.ZodObject<{
        organizationSlug: zodModule.ZodOptional<zodModule.ZodString>;
        forceRefresh: zodModule.ZodOptional<zodModule.ZodBoolean>;
    }, "strip", zodModule.ZodTypeAny, {
        forceRefresh?: boolean | undefined;
        organizationSlug?: string | undefined;
    }, {
        forceRefresh?: boolean | undefined;
        organizationSlug?: string | undefined;
    }>;
    executeAsync(input: zodModule.infer<GetServersTool['schema']>): Promise<CallToolResult>;
}
//# sourceMappingURL=GetServersTool.d.ts.map