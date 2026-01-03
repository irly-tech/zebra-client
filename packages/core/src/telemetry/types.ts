/**
 * Interface for implementing custom telemetry providers to monitor API requests.
 * Implement this interface to track metrics, logs, and traces for Zebra API calls.
 */
export interface TelemetryProvider {
    /**
     * Called before an API request is made.
     * @param context - Information about the request being started
     */
    onRequestStart(context: RequestContext): void;

    /**
     * Called after an API request completes (success or failure).
     * @param context - Information about the request
     * @param result - The result of the request including status and duration
     */
    onRequestEnd(context: RequestContext, result: RequestResult): void;

    /**
     * Called when a rate limit is hit.
     * @param context - Information about the request that was rate limited
     * @param retryAfter - Number of seconds to wait before retrying (from Retry-After header)
     */
    onRateLimitHit(context: RequestContext, retryAfter?: number): void;

    /**
     * Called when a retry is attempted.
     * @param context - Information about the request being retried
     * @param attempt - The retry attempt number (1-indexed)
     * @param reason - Reason for the retry
     */
    onRetry(context: RequestContext, attempt: number, reason: string): void;
}

/**
 * Context information about an API request.
 */
export interface RequestContext {
    /** HTTP method (GET, POST, etc.) */
    method: string;

    /** The endpoint being called */
    endpoint: string;

    /** Optional route template for grouping similar requests */
    route?: string;

    /** Name of the operation for identification */
    operationName: string;

    /** Timestamp when the request started (milliseconds since epoch) */
    startTime: number;

    /** Optional trace ID for distributed tracing */
    traceId?: string;

    /** Optional custom attributes for additional context */
    attributes?: Record<string, string | number | boolean>;
}

/**
 * Result information about a completed API request.
 */
export interface RequestResult {
    /** HTTP status code */
    statusCode: number;

    /** Whether the request succeeded */
    success: boolean;

    /** Error object if the request failed */
    error?: Error;

    /** Duration of the request in milliseconds */
    duration: number;

    /** Optional size of the response in bytes */
    responseSize?: number;

    /** Whether the request was rate limited */
    rateLimited: boolean;

    /** Number of times the request was retried */
    retryCount: number;
}
