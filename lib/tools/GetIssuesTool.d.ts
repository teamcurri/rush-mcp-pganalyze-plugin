import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
export declare class GetIssuesTool implements IRushMcpTool<GetIssuesTool['schema']> {
    readonly plugin: PganalyzePlugin;
    readonly session: RushMcpPluginSession;
    constructor(plugin: PganalyzePlugin);
    get schema(): zodModule.ZodObject<{
        serverId: zodModule.ZodOptional<zodModule.ZodString>;
        databaseId: zodModule.ZodOptional<zodModule.ZodString>;
        severity: zodModule.ZodOptional<zodModule.ZodString>;
        resolved: zodModule.ZodDefault<zodModule.ZodBoolean>;
    }, "strip", zodModule.ZodTypeAny, {
        resolved: boolean;
        databaseId?: string | undefined;
        serverId?: string | undefined;
        severity?: string | undefined;
    }, {
        databaseId?: string | undefined;
        serverId?: string | undefined;
        severity?: string | undefined;
        resolved?: boolean | undefined;
    }>;
    executeAsync(input: zodModule.infer<GetIssuesTool['schema']>): Promise<CallToolResult>;
}
//# sourceMappingURL=GetIssuesTool.d.ts.map