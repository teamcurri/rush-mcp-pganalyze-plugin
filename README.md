# rush-mcp-pganalyze-plugin

Rush MCP plugin for pganalyze PostgreSQL monitoring integration.

## Prerequisites

- `PGANALYZE_API_TOKEN` environment variable set with your API key
- Create an API key at https://app.pganalyze.com/settings/api-keys

## Installation

Install this plugin in your Rush monorepo's autoinstaller:

```bash
cd common/autoinstallers/rush-mcp
pnpm add rush-mcp-pganalyze-plugin
```

## Configuration

Add to your `common/config/rush-mcp/rush-mcp.json`:

```json
{
  "mcpPlugins": [
    {
      "packageName": "rush-mcp-pganalyze-plugin",
      "autoinstaller": "rush-mcp"
    }
  ]
}
```

## Tools

| Tool | Description |
|------|-------------|
| `pganalyze_get_servers` | Get list of servers and databases in your organization |
| `pganalyze_get_query_stats` | Get query statistics for a database (top queries by runtime %) |
| `pganalyze_get_issues` | Get check-up issues and alerts |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test CLI
node cli.js --list
node cli.js pganalyze_get_servers '{}'
```

## License

MIT
