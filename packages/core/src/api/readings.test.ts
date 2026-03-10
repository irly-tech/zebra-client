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
        assert.ok(capturedUrl.includes('sensorTaskId=sensor-task-456'));
        assert.ok(capturedUrl.includes('startTime=2024-01-01T00%3A00%3A00.000Z'));
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

        assert.ok(capturedUrl.includes('endTime=2024-01-02T00%3A00%3A00.000Z'));
    });

    test('getLog should URL-encode base64 cursor with special characters', async () => {
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

        // Real-world base64 cursor from the Zebra API containing + and = characters
        // Without URL-encoding, + is interpreted as a space by the server
        const base64Cursor = 'MjAyNi0wMS0wM1QyMDo1NTowOVp+fjY5NWExY2Q2YzkyMjM5MDAxMDk0NmFkMg==';

        await client.readings.getLog({
            taskId: 'task-123',
            sensorTaskId: 'sensor-task-456',
            startTime: new Date('2024-01-01T00:00:00Z'),
            cursor: base64Cursor,
        });

        // The cursor MUST be URL-encoded so the server can decode it correctly
        // encodeURIComponent will encode: + -> %2B, / -> %2F, = -> %3D
        const expectedEncodedCursor = encodeURIComponent(base64Cursor);
        assert.ok(
            capturedUrl.includes(`cursor=${expectedEncodedCursor}`),
            `Expected cursor to be URL-encoded. Got URL: ${capturedUrl}`
        );

        // Verify the raw cursor is NOT in the URL (would cause + to be read as space)
        assert.ok(
            !capturedUrl.includes(`cursor=${base64Cursor}`),
            'Raw cursor should not appear in URL - must be URL-encoded'
        );
    });

    test('getLog should properly encode cursor with plus signs', async () => {
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

        // Cursor with + character which must be encoded as %2B
        // If not encoded, server interprets + as space, corrupting the cursor
        const cursorWithPlus = 'abc+def/ghi==';

        await client.readings.getLog({
            taskId: 'task-123',
            sensorTaskId: 'sensor-task-456',
            startTime: new Date('2024-01-01T00:00:00Z'),
            cursor: cursorWithPlus,
        });

        // + must become %2B, / must become %2F, = must become %3D
        assert.ok(
            capturedUrl.includes('cursor=abc%2Bdef%2Fghi%3D%3D'),
            `Expected + to be encoded as %2B. Got URL: ${capturedUrl}`
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

    test('getLog should URL-encode cursor containing forward slashes', async () => {
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

        const cursorWithSlash = 'abc/def/ghi==';

        await client.readings.getLog({
            taskId: 'task-123',
            sensorTaskId: 'sensor-task-456',
            startTime: new Date('2024-01-01T00:00:00Z'),
            cursor: cursorWithSlash,
        });

        // / must be encoded as %2F
        assert.ok(
            capturedUrl.includes('%2F'),
            `Expected / to be encoded as %2F. Got URL: ${capturedUrl}`
        );
    });

    test('getLog should not include cursor parameter when undefined', async () => {
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
        });

        assert.ok(
            !capturedUrl.includes('cursor='),
            `Expected no cursor parameter. Got URL: ${capturedUrl}`
        );
    });

    test('getLog should not include cursor parameter when empty string', async () => {
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
            cursor: '',
        });

        assert.ok(
            !capturedUrl.includes('cursor='),
            `Expected no cursor parameter for empty string. Got URL: ${capturedUrl}`
        );
    });
});
