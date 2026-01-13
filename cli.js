#!/usr/bin/env node
/**
 * CLI utility for testing rush-mcp-pganalyze-plugin tools locally.
 * 
 * Usage:
 *   node cli.js <tool_name> [args_json]
 *   node cli.js --list
 * 
 * Examples:
 *   node cli.js --list
 *   node cli.js pganalyze_get_servers '{}'
 *   node cli.js pganalyze_get_query_stats '{"databaseId":"12345"}'
 *   node cli.js pganalyze_get_issues '{"severity":"critical"}'
 */

// Minimal zod-like implementation for schema parsing
const zod = {
  string: () => ({
    describe: () => zod.string(),
    default: (v) => ({ ...zod.string(), _default: v }),
    optional: () => ({ ...zod.string(), _optional: true }),
  }),
  number: () => ({
    describe: () => zod.number(),
    default: (v) => ({ ...zod.number(), _default: v }),
    optional: () => ({ ...zod.number(), _optional: true }),
  }),
  boolean: () => ({
    describe: () => zod.boolean(),
    default: (v) => ({ ...zod.boolean(), _default: v }),
    optional: () => ({ ...zod.boolean(), _optional: true }),
  }),
  array: (inner) => ({
    describe: () => zod.array(inner),
    default: (v) => ({ ...zod.array(inner), _default: v }),
    optional: () => ({ ...zod.array(inner), _optional: true }),
  }),
  object: (shape) => shape,
};

// Mock session for tool instantiation
const mockSession = {
  zod,
  registerTool: () => {},
};

// Import tools directly
const { GetServersTool } = require('./lib/tools/GetServersTool');
const { GetQueryStatsTool } = require('./lib/tools/GetQueryStatsTool');
const { GetIssuesTool } = require('./lib/tools/GetIssuesTool');

// Mock plugin
const mockPlugin = {
  session: mockSession,
};

// Available tools
const tools = {
  pganalyze_get_servers: new GetServersTool(mockPlugin),
  pganalyze_get_query_stats: new GetQueryStatsTool(mockPlugin),
  pganalyze_get_issues: new GetIssuesTool(mockPlugin),
};

// Tool descriptions
const toolDescriptions = {
  pganalyze_get_servers: 'Get list of servers and databases',
  pganalyze_get_query_stats: 'Get query statistics for a database',
  pganalyze_get_issues: 'Get check-up issues and alerts',
};

function printUsage() {
  console.log(`
rush-mcp-pganalyze-plugin CLI

Usage:
  node cli.js <tool_name> [args_json]
  node cli.js --list

Options:
  --list    List all available tools

Environment Variables:
  PGANALYZE_API_TOKEN    API token from pganalyze (required)

Tools:`);
  
  for (const [name, desc] of Object.entries(toolDescriptions)) {
    console.log(`  ${name.padEnd(30)} ${desc}`);
  }
  
  console.log(`
Examples:
  node cli.js --list
  node cli.js pganalyze_get_servers '{}'
  node cli.js pganalyze_get_query_stats '{"databaseId":"12345","limit":10}'
  node cli.js pganalyze_get_issues '{"severity":"critical"}'
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }
  
  if (args[0] === '--list') {
    console.log('Available tools:');
    for (const [name, desc] of Object.entries(toolDescriptions)) {
      console.log(`  ${name}: ${desc}`);
    }
    process.exit(0);
  }
  
  const toolName = args[0];
  const argsJson = args[1] || '{}';
  
  if (!tools[toolName]) {
    console.error(`Unknown tool: ${toolName}`);
    console.error(`Available tools: ${Object.keys(tools).join(', ')}`);
    process.exit(1);
  }
  
  let input;
  try {
    input = JSON.parse(argsJson);
  } catch (e) {
    console.error(`Invalid JSON arguments: ${e.message}`);
    process.exit(1);
  }
  
  const tool = tools[toolName];
  
  try {
    console.error(`Executing ${toolName}...`);
    const result = await tool.executeAsync(input);
    
    if (result.isError) {
      console.error('Error:');
    }
    
    for (const content of result.content) {
      if (content.type === 'text') {
        // Try to pretty-print JSON
        try {
          const parsed = JSON.parse(content.text);
          console.log(JSON.stringify(parsed, null, 2));
        } catch {
          console.log(content.text);
        }
      }
    }
    
    process.exit(result.isError ? 1 : 0);
  } catch (e) {
    console.error(`Execution failed: ${e.message}`);
    process.exit(1);
  }
}

main();
