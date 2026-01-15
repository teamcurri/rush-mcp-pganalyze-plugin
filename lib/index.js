"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PganalyzePlugin = void 0;
const GetServersTool_1 = require("./tools/GetServersTool");
const GetQueryStatsTool_1 = require("./tools/GetQueryStatsTool");
const GetIssuesTool_1 = require("./tools/GetIssuesTool");
const SetPganalyzeApiTokenTool_1 = require("./tools/SetPganalyzeApiTokenTool");
class PganalyzePlugin {
    constructor(session) {
        this.session = session;
    }
    async onInitializeAsync() {
        // Register configuration tool first - doesn't require token
        this.session.registerTool({ toolName: 'set_pganalyze_api_token' }, new SetPganalyzeApiTokenTool_1.SetPganalyzeApiTokenTool(this));
        // Register data tools - they will check for token at runtime
        this.session.registerTool({ toolName: 'pganalyze_get_servers' }, new GetServersTool_1.GetServersTool(this));
        this.session.registerTool({ toolName: 'pganalyze_get_query_stats' }, new GetQueryStatsTool_1.GetQueryStatsTool(this));
        this.session.registerTool({ toolName: 'pganalyze_get_issues' }, new GetIssuesTool_1.GetIssuesTool(this));
        // Log token status but don't fail
        if (!process.env.PGANALYZE_API_TOKEN) {
            console.error('[pganalyze Plugin] API token not set - tools will prompt for configuration');
        }
        console.error('[pganalyze Plugin] Registered 4 tools (set_pganalyze_api_token, pganalyze_get_servers, pganalyze_get_query_stats, pganalyze_get_issues)');
    }
    async onShutdownAsync() {
        // Nothing to clean up
    }
}
exports.PganalyzePlugin = PganalyzePlugin;
exports.default = (session) => new PganalyzePlugin(session);
//# sourceMappingURL=index.js.map