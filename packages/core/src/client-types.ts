import { TelemetryProvider } from './telemetry/types.js';

/**
 * Configuration options for the Zebra API client.
 */
export interface ZebraClientConfig {
    /**
     * Your Zebra API key.
     */
    apiKey: string;

    /**
     * Base URL for the Zebra API.
     * @default 'https://api.zebra.com/v2'
     */
    baseUrl?: string;

    /**
     * Retry configuration for failed requests.
     */
    retry?: {
        /**
         * Maximum number of retry attempts.
         * @default 3
         */
        maxRetries?: number;
        /**
         * Initial delay before the first retry in milliseconds.
         * @default 1000
         */
        initialDelayMs?: number;
        /**
         * Maximum delay between retries in milliseconds.
         * @default 30000
         */
        maxDelayMs?: number;
        /**
         * Multiplier for exponential backoff.
         * @default 2
         */
        backoffMultiplier?: number;
    };

    /**
     * Optional client-side rate limiting (throttling).
     */
    rateLimit?: {
        /**
         * Maximum number of requests allowed per second.
         */
        requestsPerSecond?: number;
    };

    /**
     * Optional provider for telemetry/observability.
     * Defaults to a NoopProvider if not specified.
     */
    telemetryProvider?: TelemetryProvider;

    /**
     * Request timeout in milliseconds.
     * @default 30000
     */
    timeoutMs?: number;

    /**
     * Custom fetch implementation.
     * Useful for testing or environments without a global fetch.
     */
    fetch?: typeof fetch;
}

/**
 * The parsed body of an error response from the Zebra API.
 * - `Record<string, unknown>` - If the response body was valid JSON
 * - `string` - If the response body was plain text
 * - `undefined` - If the body was empty or could not be read
 */
export type ZebraErrorBody = Record<string, unknown> | string | undefined;

/**
 * Custom error class for Zebra API related errors.
 *
 * This error is thrown when the Zebra API returns a non-successful HTTP status code.
 * It provides access to the HTTP status code, the raw Response object, and the
 * pre-parsed response body for debugging purposes.
 *
 * @example
 * ```typescript
 * import { ZebraClient, ZebraError } from '@irly-tech/zebra-client';
 *
 * const client = new ZebraClient({ apiKey: 'your-api-key' });
 *
 * try {
 *     await client.sensors.get('invalid-id');
 * } catch (error) {
 *     if (error instanceof ZebraError) {
 *         console.log('Status:', error.statusCode);        // e.g., 404
 *         console.log('Message:', error.message);          // e.g., "Zebra API error: Not Found"
 *
 *         // Access the pre-parsed response body
 *         if (typeof error.responseBody === 'object') {
 *             // JSON error response from the API
 *             console.log('Error code:', error.responseBody.code);
 *             console.log('Details:', error.responseBody.message);
 *         } else if (typeof error.responseBody === 'string') {
 *             // Plain text error response
 *             console.log('Error text:', error.responseBody);
 *         }
 *
 *         // Raw Response is still available for advanced use cases
 *         console.log('Headers:', error.response?.headers.get('x-request-id'));
 *     }
 * }
 * ```
 */
export class ZebraError extends Error {
    /**
     * The parsed response body from the API error response.
     * This is automatically populated when using `ZebraError.fromResponse()`.
     * - If the response body is JSON, this will be the parsed object.
     * - If the response body is plain text, this will be the string.
     * - If parsing failed or no body was present, this will be undefined.
     */
    public responseBody?: ZebraErrorBody;

    /**
     * Creates a new ZebraError.
     * @param message - The error message.
     * @param statusCode - The HTTP status code returned by the API, if available.
     * @param response - The raw Response object, if available.
     * @param responseBody - The parsed response body, if available.
     */
    constructor(
        message: string,
        public statusCode?: number,
        public response?: Response,
        responseBody?: ZebraErrorBody
    ) {
        super(message);
        this.name = 'ZebraError';
        this.responseBody = responseBody;
    }

    /**
     * Creates a ZebraError from a Response object, automatically parsing the response body.
     * @param message - The error message.
     * @param response - The Response object from the failed request.
     * @returns A promise that resolves to a new ZebraError with the parsed response body.
     */
    static async fromResponse(message: string, response: Response): Promise<ZebraError> {
        let responseBody: ZebraErrorBody;

        try {
            const text = await response.text();
            if (text) {
                try {
                    responseBody = JSON.parse(text) as Record<string, unknown>;
                } catch {
                    // Not JSON, use the raw text
                    responseBody = text;
                }
            }
        } catch {
            // Failed to read body, leave as undefined
        }

        return new ZebraError(message, response.status, response, responseBody);
    }
}

/**
 * Internal configuration used by the client, with all optional fields resolved to defaults.
 * @internal
 */
export interface InternalConfig {
    apiKey: string;
    baseUrl: string;
    retry: {
        maxRetries: number;
        initialDelayMs: number;
        maxDelayMs: number;
        backoffMultiplier: number;
    };
    telemetryProvider: TelemetryProvider;
    timeoutMs: number;
    fetch: typeof fetch;
}
