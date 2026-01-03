import { TelemetryProvider } from './types.js';

/**
 * No-op implementation of TelemetryProvider that does nothing.
 * This is the default telemetry provider used when none is specified.
 */
export class NoopTelemetryProvider implements TelemetryProvider {
    /** @inheritdoc */
    onRequestStart(): void { }

    /** @inheritdoc */
    onRequestEnd(): void { }

    /** @inheritdoc */
    onRateLimitHit(): void { }

    /** @inheritdoc */
    onRetry(): void { }
}
