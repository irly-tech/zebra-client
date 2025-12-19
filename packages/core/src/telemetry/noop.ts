import { TelemetryProvider } from './types.js';

export class NoopTelemetryProvider implements TelemetryProvider {
    onRequestStart(): void { }
    onRequestEnd(): void { }
    onRateLimitHit(): void { }
    onRetry(): void { }
}
