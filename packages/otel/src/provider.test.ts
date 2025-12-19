import { test, describe } from 'node:test';
import assert from 'node:assert';
import { OTelTelemetryProvider } from './provider.js';

describe('OTelTelemetryProvider', () => {
    test('should initialize without errors', () => {
        const provider = new OTelTelemetryProvider();
        assert.strictEqual(provider !== undefined, true);
    });

    test('should handle life-cycle methods', () => {
        const provider = new OTelTelemetryProvider();
        const context = {
            method: 'GET',
            endpoint: '/test',
            operationName: 'test.op',
            startTime: Date.now(),
        };

        // Verify it doesn't throw when called
        provider.onRequestStart(context);
        provider.onRetry(context, 1, 'error');
        provider.onRateLimitHit(context, 60);
        provider.onRequestEnd(context, {
            statusCode: 200,
            success: true,
            duration: 100,
            rateLimited: false,
            retryCount: 0,
        });
    });
});
