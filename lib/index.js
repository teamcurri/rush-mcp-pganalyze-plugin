"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PganalyzePlugin = void 0;
const utils_1 = require("./utils");
const GetServersTool_1 = require("./tools/GetServersTool");
const GetQueryStatsTool_1 = require("./tools/GetQueryStatsTool");
const GetIssuesTool_1 = require("./tools/GetIssuesTool");
class PganalyzePlugin {
    constructor(session) {
        this.session = session;
    }
    async onInitializeAsync() {
        // Check API token on boot - throws if not set
        (0, utils_1.checkApiToken)();
        // Register tools
        this.session.registerTool({ toolName: 'pganalyze_get_servers' }, new GetServersTool_1.GetServersTool(this));
        this.session.registerTool({ toolName: 'pganalyze_get_query_stats' }, new GetQueryStatsTool_1.GetQueryStatsTool(this));
        this.session.registerTool({ toolName: 'pganalyze_get_issues' }, new GetIssuesTool_1.GetIssuesTool(this));
        console.error('[pganalyze Plugin] Registered 3 tools (pganalyze_get_servers, pganalyze_get_query_stats, pganalyze_get_issues)');
    }
    async onShutdownAsync() {
        // Nothing to clean up
    }
}
exports.PganalyzePlugin = PganalyzePlugin;
exports.default = (session) => new PganalyzePlugin(session);
//# sourceMappingURL=index.js.map