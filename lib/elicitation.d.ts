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
        properties?: Record<string, {
            type: string;
            description?: string;
            enum?: string[];
        }>;
        required?: string[];
    };
    next_tool: string;
    next_tool_inputs?: Record<string, unknown>;
}
/**
 * Create an elicitation response that prompts the user for the pganalyze API token.
 */
export declare function createPganalyzeTokenElicitation(): CallToolResult;
/**
 * Check if PGANALYZE_API_TOKEN is set.
 * Returns an elicitation response if not set, null otherwise.
 */
export declare function checkPganalyzeToken(): CallToolResult | null;
/**
 * Create an elicitation response for an invalid/expired pganalyze token (401 error).
 */
export declare function createPganalyzeTokenInvalidElicitation(): CallToolResult;
/**
 * Check if an error is a 401 Unauthorized error.
 */
export declare function is401Error(error: unknown): boolean;
/**
 * Handle an error, returning an elicitation response for 401 errors
 * or a standard error response otherwise.
 */
export declare function handlePganalyzeError(error: unknown, operation: string): CallToolResult;
//# sourceMappingURL=elicitation.d.ts.map