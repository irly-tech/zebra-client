import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ZebraClient } from './client.js';
import { ZebraError } from './client-types.js';
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

    test('should include JSON response body in ZebraError for 4xx errors', async () => {
        const errorBody = { error: 'Not Found', message: 'Sensor with ID xyz not found', code: 'SENSOR_NOT_FOUND' };
        const mockFetch = async () => {
            return new Response(JSON.stringify(errorBody), {
                status: 404,
                statusText: 'Not Found'
            });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any
        });

        try {
            await client.request('test', 'test-endpoint');
            assert.fail('Expected ZebraError to be thrown');
        } catch (error) {
            assert.ok(error instanceof ZebraError);
            assert.strictEqual(error.statusCode, 404);
            assert.deepStrictEqual(error.responseBody, errorBody);
        }
    });

    test('should include plain text response body in ZebraError', async () => {
        const errorText = 'Internal Server Error: Database connection failed';
        const mockFetch = async () => {
            return new Response(errorText, {
                status: 400,
                statusText: 'Bad Request'
            });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any
        });

        try {
            await client.request('test', 'test-endpoint');
            assert.fail('Expected ZebraError to be thrown');
        } catch (error) {
            assert.ok(error instanceof ZebraError);
            assert.strictEqual(error.statusCode, 400);
            assert.strictEqual(error.responseBody, errorText);
        }
    });

    test('should include response body in ZebraError for 429 rate limit errors', async () => {
        const errorBody = { error: 'Rate limit exceeded', retryAfter: 60 };
        let attempts = 0;
        const mockFetch = async () => {
            attempts++;
            return new Response(JSON.stringify(errorBody), {
                status: 429,
                statusText: 'Too Many Requests',
                headers: { 'retry-after': '60' }
            });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
            retry: { maxRetries: 0, initialDelayMs: 1 }
        });

        try {
            await client.request('test', 'test-endpoint');
            assert.fail('Expected ZebraError to be thrown');
        } catch (error) {
            assert.ok(error instanceof ZebraError);
            assert.strictEqual(error.statusCode, 429);
            assert.deepStrictEqual(error.responseBody, errorBody);
        }
    });

    test('should handle empty response body in errors', async () => {
        const mockFetch = async () => {
            return new Response('', {
                status: 404,
                statusText: 'Not Found'
            });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any
        });

        try {
            await client.request('test', 'test-endpoint');
            assert.fail('Expected ZebraError to be thrown');
        } catch (error) {
            assert.ok(error instanceof ZebraError);
            assert.strictEqual(error.statusCode, 404);
            assert.strictEqual(error.responseBody, undefined);
        }
    });
});
