import type { IRushMcpPlugin, RushMcpPluginSession } from './types/rush-mcp-plugin';
export declare class PganalyzePlugin implements IRushMcpPlugin {
    session: RushMcpPluginSession;
    constructor(session: RushMcpPluginSession);
    onInitializeAsync(): Promise<void>;
    onShutdownAsync(): Promise<void>;
}
declare const _default: (session: RushMcpPluginSession) => PganalyzePlugin;
export default _default;
//# sourceMappingURL=index.d.ts.map