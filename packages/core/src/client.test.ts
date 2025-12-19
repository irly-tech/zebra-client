import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ZebraClient } from './client.js';
import { NoopTelemetryProvider } from './telemetry/noop.js';

describe('ZebraClient', () => {
    test('should initialize with default config', () => {
        const client = new ZebraClient({ apiKey: 'test-key' });
        assert.strictEqual(client.readings !== undefined, true);
        assert.strictEqual(client.sensors !== undefined, true);
        assert.strictEqual(client.alarms !== undefined, true);
    });

    test('should handle successful requests', async () => {
        const mockFetch = async () => {
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any
        });

        const result = await client.request('test', 'test-endpoint');
        assert.deepStrictEqual(result, { success: true });
    });

    test('should retry on 429 errors', async () => {
        let attempts = 0;
        const mockFetch = async () => {
            attempts++;
            if (attempts === 1) {
                return new Response('Rate limited', { status: 429 });
            }
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
            retry: {
                maxRetries: 2,
                initialDelayMs: 1,
            }
        });

        const result = await client.request('test', 'test-endpoint', { method: 'GET' }, 'test/:id');
        assert.strictEqual(attempts, 2);
        assert.deepStrictEqual(result, { success: true });
    });

    test('should pass route to telemetry provider', async () => {
        let capturedRoute: string | undefined;
        const mockTelemetry = {
            onRequestStart: (ctx: any) => { capturedRoute = ctx.route; },
            onRequestEnd: () => { },
            onRetry: () => { },
            onRateLimitHit: () => { },
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            telemetryProvider: mockTelemetry as any,
            fetch: (async () => new Response('{}')) as any
        });

        await client.request('test', 'sensors/123', { method: 'GET' }, 'sensors/:id');
        assert.strictEqual(capturedRoute, 'sensors/:id');
    });
});
