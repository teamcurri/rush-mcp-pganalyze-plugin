"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPganalyzeTokenElicitation = createPganalyzeTokenElicitation;
exports.checkPganalyzeToken = checkPganalyzeToken;
exports.createPganalyzeTokenInvalidElicitation = createPganalyzeTokenInvalidElicitation;
exports.is401Error = is401Error;
exports.handlePganalyzeError = handlePganalyzeError;
/**
 * Create an elicitation response that prompts the user for the pganalyze API token.
 */
function createPganalyzeTokenElicitation() {
    const response = {
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
function checkPganalyzeToken() {
    if (!process.env.PGANALYZE_API_TOKEN) {
        return createPganalyzeTokenElicitation();
    }
    return null;
}
/**
 * Create an elicitation response for an invalid/expired pganalyze token (401 error).
 */
function createPganalyzeTokenInvalidElicitation() {
    const response = {
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
function is401Error(error) {
    if (error instanceof Error) {
        return error.message.includes('401') || error.message.includes('Unauthorized');
    }
    return false;
}
/**
 * Handle an error, returning an elicitation response for 401 errors
 * or a standard error response otherwise.
 */
function handlePganalyzeError(error, operation) {
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
//# sourceMappingURL=elicitation.js.map