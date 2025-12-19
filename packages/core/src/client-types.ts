import { TelemetryProvider } from './telemetry/types.js';

export interface ZebraClientConfig {
    apiKey: string;
    baseUrl?: string;

    // Retry configuration
    retry?: {
        maxRetries?: number;        // default: 3
        initialDelayMs?: number;    // default: 1000
        maxDelayMs?: number;        // default: 30000
        backoffMultiplier?: number; // default: 2
    };

    // Rate limiting (optional client-side throttling)
    rateLimit?: {
        requestsPerSecond?: number;
    };

    // Telemetry (optional - defaults to NoopProvider)
    telemetryProvider?: TelemetryProvider;

    // Request timeout
    timeoutMs?: number;           // default: 30000

    // Custom fetch implementation
    fetch?: typeof fetch;
}

export class ZebraError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public response?: Response
    ) {
        super(message);
        this.name = 'ZebraError';
    }
}

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
