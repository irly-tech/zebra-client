export interface TelemetryProvider {
    /**
     * Called before an API request is made
     */
    onRequestStart(context: RequestContext): void;

    /**
     * Called after an API request completes (success or failure)
     */
    onRequestEnd(context: RequestContext, result: RequestResult): void;

    /**
     * Called when a rate limit is hit
     */
    onRateLimitHit(context: RequestContext, retryAfter?: number): void;

    /**
     * Called when a retry is attempted
     */
    onRetry(context: RequestContext, attempt: number, reason: string): void;
}

export interface RequestContext {
    method: string;
    endpoint: string;
    operationName: string;
    startTime: number;
    traceId?: string;
    attributes?: Record<string, string | number | boolean>;
}

export interface RequestResult {
    statusCode: number;
    success: boolean;
    error?: Error;
    duration: number;
    responseSize?: number;
    rateLimited: boolean;
    retryCount: number;
}
