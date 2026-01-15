import type { CallToolResult } from './types/rush-mcp-plugin';

/**
 * Elicitation response format for prompting users for input.
 * When a tool returns this, the agent should:
 * 1. Display the question/instructions to the user
 * 2. Collect input according to input_schema
 * 3. Call next_tool with the collected input
 * 4. After next_tool succeeds, retry the original tool
 */
export interface ElicitationResponse {
  status: 'needs_user_input';
  kind: 'elicitation';
  question: string;
  instructions?: string;
  input_schema: {
    type: 'string' | 'object';
    enum?: string[];
    properties?: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
  next_tool: string;
  next_tool_inputs?: Record<string, unknown>;
}

/**
 * Create an elicitation response that prompts the user for the pganalyze API token.
 */
export function createPganalyzeTokenElicitation(): CallToolResult {
  const response: ElicitationResponse = {
    status: 'needs_user_input',
    kind: 'elicitation',
    question: 'pganalyze API token is required. Please provide your pganalyze API token.',
    instructions: `To get a pganalyze API token:
1. Go to https://app.pganalyze.com/settings/api-keys
2. Click "Create API Key"
3. Give it a descriptive name (e.g., "MCP Plugin")
4. Copy the generated token

The token will be stored for this session only.`,
    input_schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Your pganalyze API token',
        },
      },
      required: ['token'],
    },
    next_tool: 'set_pganalyze_api_token',
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}

/**
 * Check if PGANALYZE_API_TOKEN is set.
 * Returns an elicitation response if not set, null otherwise.
 */
export function checkPganalyzeToken(): CallToolResult | null {
  if (!process.env.PGANALYZE_API_TOKEN) {
    return createPganalyzeTokenElicitation();
  }
  return null;
}

/**
 * Create an elicitation response for an invalid/expired pganalyze token (401 error).
 */
export function createPganalyzeTokenInvalidElicitation(): CallToolResult {
  const response: ElicitationResponse = {
    status: 'needs_user_input',
    kind: 'elicitation',
    question: 'pganalyze API token is invalid or expired. Please provide a new pganalyze API token.',
    instructions: `Your current pganalyze API token was rejected (401 Unauthorized).

To get a new pganalyze API token:
1. Go to https://app.pganalyze.com/settings/api-keys
2. Click "Create API Key"
3. Give it a descriptive name (e.g., "MCP Plugin")
4. Copy the generated token

The token will be stored for this session only.`,
    input_schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Your pganalyze API token',
        },
      },
      required: ['token'],
    },
    next_tool: 'set_pganalyze_api_token',
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}

/**
 * Check if an error is a 401 Unauthorized error.
 */
export function is401Error(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('401') || error.message.includes('Unauthorized');
  }
  return false;
}

/**
 * Handle an error, returning an elicitation response for 401 errors
 * or a standard error response otherwise.
 */
export function handlePganalyzeError(error: unknown, operation: string): CallToolResult {
  if (is401Error(error)) {
    return createPganalyzeTokenInvalidElicitation();
  }

  return {
    content: [
      {
        type: 'text',
        text: `Failed to ${operation}: ${error}`,
      },
    ],
    isError: true,
  };
}
