import { TelemetryProvider } from './telemetry/types.js';

/**
 * Configuration options for the Zebra API client.
 */
export interface ZebraClientConfig {
    /**
     * Your Zebra API key for authentication.
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
         * Initial delay in milliseconds before the first retry.
         * @default 1000
         */
        initialDelayMs?: number;

        /**
         * Maximum delay in milliseconds between retries.
         * @default 30000
         */
        maxDelayMs?: number;

        /**
         * Multiplier for exponential backoff between retries.
         * @default 2
         */
        backoffMultiplier?: number;
    };

    /**
     * Optional client-side rate limiting configuration.
     */
    rateLimit?: {
        /**
         * Maximum number of requests per second.
         */
        requestsPerSecond?: number;
    };

    /**
     * Optional telemetry provider for monitoring API requests.
     * @default NoopTelemetryProvider
     */
    telemetryProvider?: TelemetryProvider;

    /**
     * Timeout in milliseconds for API requests.
     * @default 30000
     */
    timeoutMs?: number;

    /**
     * Custom fetch implementation (useful for testing or custom HTTP clients).
     * @default globalThis.fetch
     */
    fetch?: typeof fetch;
}

/**
 * Error class for Zebra API errors.
 * Extends the standard Error class with additional context about the failed request.
 */
export class ZebraError extends Error {
    /**
     * Creates a new ZebraError.
     * @param message - Error message describing what went wrong
     * @param statusCode - HTTP status code from the failed request
     * @param response - The raw HTTP response object
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
 * Internal configuration used by the ZebraClient.
 * This is the resolved configuration with all default values applied.
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
