"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetServersTool = void 0;
const utils_1 = require("../utils");
class GetServersTool {
    constructor(plugin) {
        this.plugin = plugin;
        this.session = plugin.session;
    }
    get schema() {
        const zod = this.session.zod;
        return zod.object({});
    }
    async executeAsync(_input) {
        try {
            const query = `
        query {
          getServers {
            id
            name
            databases {
              id
              name
            }
          }
        }
      `;
            const data = await (0, utils_1.executeGraphQL)(query);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            servers: data.getServers,
                            count: data.getServers.length,
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to get servers: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    }
}
exports.GetServersTool = GetServersTool;
//# sourceMappingURL=GetServersTool.js.map