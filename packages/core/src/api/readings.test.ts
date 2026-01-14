import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ZebraClient } from '../client.js';
import { ZebraReadingsResponse } from '../types.js';

describe('ReadingsAPI', () => {
    test('getLog should retrieve readings with required parameters', async () => {
        const mockResponse: ZebraReadingsResponse = {
            results: [
                {
                    sensor_id: 'sensor-123',
                    temperature: 22.5,
                    humidity: 45,
                    timestamp: '2024-01-01T12:00:00Z',
                },
            ],
            total_count: 1,
        };

        let capturedUrl = '';

        const mockFetch = async (url: string) => {
            capturedUrl = url;
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.readings.getLog({
            taskId: 'task-123',
            sensorTaskId: 'sensor-task-456',
            startTime: new Date('2024-01-01T00:00:00Z'),
        });

        assert.deepStrictEqual(result, mockResponse);
        assert.ok(capturedUrl.includes('data/environmental/tasks/task-123/log'));
        assert.ok(capturedUrl.includes('savannah_sensor_task_id=sensor-task-456'));
        assert.ok(capturedUrl.includes('since=2024-01-01T00%3A00%3A00.000Z'));
    });

    test('getLog should include endTime when provided', async () => {
        const mockResponse: ZebraReadingsResponse = {
            results: [],
            total_count: 0,
        };

        let capturedUrl = '';

        const mockFetch = async (url: string) => {
            capturedUrl = url;
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        await client.readings.getLog({
            taskId: 'task-123',
            sensorTaskId: 'sensor-task-456',
            startTime: new Date('2024-01-01T00:00:00Z'),
            endTime: new Date('2024-01-02T00:00:00Z'),
        });

        assert.ok(capturedUrl.includes('until=2024-01-02T00%3A00%3A00.000Z'));
    });

    test('getLog should not double-encode base64 cursor with special characters', async () => {
        const mockResponse: ZebraReadingsResponse = {
            results: [],
            total_count: 0,
        };

        let capturedUrl = '';

        const mockFetch = async (url: string) => {
            capturedUrl = url;
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        // Base64 cursor containing + and / characters that would be double-encoded
        // if passed through URLSearchParams
        const base64Cursor = 'eyJwYWdlIjoxfQ+/test==';

        await client.readings.getLog({
            taskId: 'task-123',
            sensorTaskId: 'sensor-task-456',
            startTime: new Date('2024-01-01T00:00:00Z'),
            cursor: base64Cursor,
        });

        // The cursor should appear in the URL exactly as provided, not URL-encoded
        // If it were double-encoded, + would become %2B and / would become %2F
        assert.ok(
            capturedUrl.includes(`cursor=${base64Cursor}`),
            `Expected cursor to be preserved exactly. Got URL: ${capturedUrl}`
        );
        assert.ok(
            !capturedUrl.includes('cursor=eyJwYWdlIjoxfQ%2B%2Ftest%3D%3D'),
            'Cursor should not be URL-encoded (would cause "Illegal base64 character" errors)'
        );
    });

    test('getLog should handle cursor without special characters', async () => {
        const mockResponse: ZebraReadingsResponse = {
            results: [],
            total_count: 0,
        };

        let capturedUrl = '';

        const mockFetch = async (url: string) => {
            capturedUrl = url;
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const simpleCursor = 'abc123';

        await client.readings.getLog({
            taskId: 'task-123',
            sensorTaskId: 'sensor-task-456',
            startTime: new Date('2024-01-01T00:00:00Z'),
            cursor: simpleCursor,
        });

        assert.ok(capturedUrl.includes(`cursor=${simpleCursor}`));
    });
});
