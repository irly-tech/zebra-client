import { NoopTelemetryProvider } from './telemetry/noop.js';
import { ZebraClientConfig, ZebraError, InternalConfig } from './client-types.js';
import { RequestContext, RequestResult } from './telemetry/types.js';
import { ReadingsAPI } from './api/readings.js';
import { SensorsAPI } from './api/sensors.js';
import { AlarmsAPI } from './api/alarms.js';
import { TasksAPI } from './api/tasks.js';
import { AuthAPI } from './api/auth.js';

export class ZebraClient {
    private readonly config: InternalConfig;

    public readonly readings: ReadingsAPI;
    public readonly sensors: SensorsAPI;
    public readonly alarms: AlarmsAPI;
    public readonly tasks: TasksAPI;
    public readonly auth: AuthAPI;

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
    }

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
                const url = new URL(endpoint, this.config.baseUrl).toString();
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
                    return (await response.json()) as T;
                }

                if (response.status === 429) {
                    this.config.telemetryProvider.onRateLimitHit(
                        context,
                        parseInt(response.headers.get('retry-after') || '0', 10)
                    );
                    lastError = new ZebraError('Rate limit exceeded', 429, response);
                } else {
                    lastError = new ZebraError(
                        `Zebra API error: ${response.statusText}`,
                        response.status,
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
