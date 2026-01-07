import { NoopTelemetryProvider } from './telemetry/noop.js';
import { ZebraClientConfig, ZebraError, InternalConfig } from './client-types.js';
import { RequestContext, RequestResult } from './telemetry/types.js';
import { ReadingsAPI } from './api/readings.js';
import { SensorsAPI } from './api/sensors.js';
import { AlarmsAPI } from './api/alarms.js';
import { TasksAPI } from './api/tasks.js';
import { AuthAPI } from './api/auth.js';
import { WebhooksAPI } from './api/webhooks.js';

/**
 * The main client for interacting with the Zebra Savannah APIs.
 *
 * This client provides access to various API modules for environmental sensor monitoring,
 * including readings, sensors, alarms, tasks, and authentication.
 */
export class ZebraClient {
    private readonly config: InternalConfig;

    /** Access to the Environmental Readings API. */
    public readonly readings: ReadingsAPI;
    /** Access to the Sensors Management API. */
    public readonly sensors: SensorsAPI;
    /** Access to the Alarms API. */
    public readonly alarms: AlarmsAPI;
    /** Access to the Environmental Tasks API. */
    public readonly tasks: TasksAPI;
    /** Access to the Authentication API. */
    public readonly auth: AuthAPI;
    /** Access to the Webhook Subscription API. */
    public readonly webhooks: WebhooksAPI;

    /**
     * Initializes a new Zebra API client.
     * @param config - Configuration options for the client.
     */
    constructor(config: ZebraClientConfig) {
        this.config = {
            apiKey: config.apiKey,
            baseUrl: config.baseUrl || 'https://api.zebra.com/v2',
            retry: {
                maxRetries: config.retry?.maxRetries ?? 3,
                initialDelayMs: config.retry?.initialDelayMs ?? 1000,
                maxDelayMs: config.retry?.maxDelayMs ?? 30000,
                backoffMultiplier: config.retry?.backoffMultiplier ?? 2,
            },
            telemetryProvider: config.telemetryProvider || new NoopTelemetryProvider(),
            timeoutMs: config.timeoutMs || 30000,
            fetch: config.fetch || globalThis.fetch.bind(globalThis),
        };

        this.readings = new ReadingsAPI(this);
        this.sensors = new SensorsAPI(this);
        this.alarms = new AlarmsAPI(this);
        this.tasks = new TasksAPI(this);
        this.auth = new AuthAPI(this);
        this.webhooks = new WebhooksAPI(this);
    }

    /**
     * Performs a low-level request to the Zebra API with retry logic and telemetry.
     *
     * @template T - The expected response type.
     * @param operationName - Name of the operation for telemetry purposes (e.g., 'tasks.create').
     * @param endpoint - The API endpoint (relative to the base URL or absolute).
     * @param options - Standard Fetch API RequestInit options.
     * @param route - Optional parameterized route (e.g., 'tasks/:id') for better telemetry aggregation.
     * @returns A promise that resolves to the API response object.
     * @throws {ZebraError} If the API returns an error status code (4xx/5xx) and retries are exhausted.
     *   The error includes `statusCode`, `response`, and `responseBody` properties for debugging.
     * @throws {Error} If a network or other low-level error occurs.
     */
    async request<T>(
        operationName: string,
        endpoint: string,
        options: RequestInit = {},
        route?: string
    ): Promise<T> {
        const context: RequestContext = {
            method: options.method || 'GET',
            endpoint,
            route,
            operationName,
            startTime: Date.now(),
        };

        this.config.telemetryProvider.onRequestStart(context);

        let attempt = 0;
        let lastError: Error | undefined;

        while (attempt <= this.config.retry.maxRetries) {
            if (attempt > 0) {
                const delay = Math.min(
                    this.config.retry.initialDelayMs * Math.pow(this.config.retry.backoffMultiplier, attempt - 1),
                    this.config.retry.maxDelayMs
                );
                this.config.telemetryProvider.onRetry(context, attempt, lastError?.message || 'Unknown error');
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            try {
                const baseUrlStr = this.config.baseUrl.endsWith('/')
                    ? this.config.baseUrl
                    : `${this.config.baseUrl}/`;
                const url = new URL(endpoint, baseUrlStr).toString();
                console.log(`[DEBUG] Final URL: ${url}`);
                const response = await this.config.fetch(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.config.apiKey,
                        ...options.headers,
                    },
                    signal: AbortSignal.timeout(this.config.timeoutMs),
                });

                const duration = Date.now() - context.startTime;

                if (response.ok) {
                    const result: RequestResult = {
                        statusCode: response.status,
                        success: true,
                        duration,
                        rateLimited: false,
                        retryCount: attempt,
                    };
                    this.config.telemetryProvider.onRequestEnd(context, result);

                    if (response.status === 204) {
                        return null as T;
                    }

                    const text = await response.text();
                    return text ? (JSON.parse(text) as T) : (null as T);
                }

                if (response.status === 429) {
                    this.config.telemetryProvider.onRateLimitHit(
                        context,
                        parseInt(response.headers.get('retry-after') || '0', 10)
                    );
                    lastError = await ZebraError.fromResponse('Rate limit exceeded', response);
                } else {
                    lastError = await ZebraError.fromResponse(
                        `Zebra API error: ${response.statusText}`,
                        response
                    );
                }

                // Only retry on 429 or 5xx
                if (response.status !== 429 && response.status < 500) {
                    throw lastError;
                }
            } catch (error) {
                if (error instanceof ZebraError) throw error;
                lastError = error instanceof Error ? error : new Error(String(error));
            }

            attempt++;
        }

        const duration = Date.now() - context.startTime;
        const result: RequestResult = {
            statusCode: (lastError as ZebraError).statusCode || 0,
            success: false,
            error: lastError,
            duration,
            rateLimited: (lastError as ZebraError).statusCode === 429,
            retryCount: attempt - 1,
        };
        this.config.telemetryProvider.onRequestEnd(context, result);

        throw lastError;
    }
}
