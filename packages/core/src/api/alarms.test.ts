import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ZebraClient } from '../client.js';
import { ZebraAlarmsResponse } from '../types.js';

describe('AlarmsAPI', () => {
    const mockResponse: ZebraAlarmsResponse = {
        sensors_alarms: [
            {
                id: 'alarm-1',
                sensor_id: 'sensor-1',
                task_id: 'task-123',
                alarm_type: 'HIGH_TEMP',
                occurred: '2024-01-15T10:30:00Z',
                temperature: 12.5,
                threshold_max: 8.0,
            },
        ],
        page_response: {
            total_pages: 1,
            page_size: 20,
            current_page: 1,
        },
    };

    test('list should retrieve alarms for a task', async () => {
        const mockFetch = async (url: string) => {
            assert.ok(url.includes('environmental/tasks/task-123/alarms'));
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.alarms.list({ taskId: 'task-123' });
        assert.deepStrictEqual(result, mockResponse);
    });

    test('list should include since parameter when provided', async () => {
        const since = new Date('2024-01-01T00:00:00Z');

        const mockFetch = async (url: string) => {
            assert.ok(url.includes('environmental/tasks/task-123/alarms'));
            assert.ok(url.includes('since=2024-01-01T00%3A00%3A00.000Z'));
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.alarms.list({ taskId: 'task-123', since });
        assert.deepStrictEqual(result, mockResponse);
    });

    test('list should include pagination parameters', async () => {
        const mockFetch = async (url: string) => {
            assert.ok(url.includes('environmental/tasks/task-123/alarms'));
            assert.ok(url.includes('page.page=2'));
            assert.ok(url.includes('page.size=10'));
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.alarms.list({ taskId: 'task-123', page: 2, pageSize: 10 });
        assert.deepStrictEqual(result, mockResponse);
    });

    test('list should not include query params when no optional options provided', async () => {
        const mockFetch = async (url: string) => {
            const urlObj = new URL(url);
            assert.ok(url.includes('environmental/tasks/task-123/alarms'));
            assert.strictEqual(urlObj.search, '');
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        await client.alarms.list({ taskId: 'task-123' });
    });
});
