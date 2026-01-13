import type { IRushMcpTool, RushMcpPluginSession, CallToolResult, zodModule } from '../types/rush-mcp-plugin';
import type { PganalyzePlugin } from '../index';
export declare class GetQueryStatsTool implements IRushMcpTool<GetQueryStatsTool['schema']> {
    readonly plugin: PganalyzePlugin;
    readonly session: RushMcpPluginSession;
    constructor(plugin: PganalyzePlugin);
    get schema(): zodModule.ZodObject<{
        databaseId: zodModule.ZodString;
        startTs: zodModule.ZodOptional<zodModule.ZodNumber>;
        endTs: zodModule.ZodOptional<zodModule.ZodNumber>;
        limit: zodModule.ZodDefault<zodModule.ZodNumber>;
    }, "strip", zodModule.ZodTypeAny, {
        databaseId: string;
        limit: number;
        startTs?: number | undefined;
        endTs?: number | undefined;
    }, {
        databaseId: string;
        startTs?: number | undefined;
        endTs?: number | undefined;
        limit?: number | undefined;
    }>;
    executeAsync(input: zodModule.infer<GetQueryStatsTool['schema']>): Promise<CallToolResult>;
}
//# sourceMappingURL=GetQueryStatsTool.d.ts.map