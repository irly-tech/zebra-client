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
 * Custom error class for Zebra API related errors.
 */
export class ZebraError extends Error {
    /**
     * Creates a new ZebraError.
     * @param message - The error message.
     * @param statusCode - The HTTP status code returned by the API, if available.
     * @param response - The raw Response object, if available.
     */
    constructor(
        message: string,
        public statusCode?: number,
        public response?: Response
    ) {
        super(message);
        this.name = 'ZebraError';
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
