import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ZebraClient } from '../client.js';
import { Task, CreateTaskOptions, TaskListResponse, AssignSensorsResponse } from '../types.js';

describe('TasksAPI', () => {
    test('create should create a task with correct parameters', async () => {
        const mockTask: Task = {
            id: 'task-123',
            name: 'Cold Storage Monitor',
            status: 'TASK_STATUS_ACTIVE',
            sensor_count: 0,
            alarm_count: 0,
        };

        let capturedBody: any;

        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('environmental/tasks'));
            assert.strictEqual(options.method, 'POST');
            capturedBody = JSON.parse(options.body);
            return new Response(JSON.stringify(mockTask), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const taskOptions: CreateTaskOptions = {
            name: 'Cold Storage Monitor',
            intervalMinutes: 5,
            alarmLowTemp: 2.0,
            alarmHighTemp: 8.0,
            lowDurationMinutes: 2,
            highDurationMinutes: 2,
        };

        const result = await client.tasks.create(taskOptions);

        assert.deepStrictEqual(result, mockTask);
        const details = capturedBody.task_from_details.task_details;
        assert.strictEqual(details.name, 'Cold Storage Monitor');
        assert.strictEqual(details.interval_minutes, 5);
        assert.strictEqual(details.alarm_low_temp, 2.0);
        assert.strictEqual(details.alarm_high_temp, 8.0);
        assert.strictEqual(details.low_duration_minutes, 2);
        assert.deepStrictEqual(details.start_immediately, {});
    });

    test('get should retrieve task by ID', async () => {
        const mockTask: Task = {
            id: 'task-123',
            name: 'Test Task',
            status: 'TASK_STATUS_ACTIVE',
        };

        const mockFetch = async (url: string) => {
            assert.ok(url.includes('environmental/tasks/task-123'));
            return new Response(JSON.stringify(mockTask), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.tasks.get('task-123');
        assert.deepStrictEqual(result, mockTask);
    });

    test('list should retrieve tasks with pagination', async () => {
        const mockResponse: TaskListResponse = {
            tasks: [
                {
                    id: 'task-1',
                    name: 'Task 1',
                    status: 'TASK_STATUS_ACTIVE',
                },
                {
                    id: 'task-2',
                    name: 'Task 2',
                    status: 'TASK_STATUS_SENSOR_COMPLETED',
                },
            ],
            page_response: {
                total_pages: 1,
                page_size: 10,
                current_page: 0,
            },
        };

        const mockFetch = async (url: string) => {
            assert.ok(url.includes('environmental/tasks'));
            assert.ok(url.includes('page.page=0'));
            assert.ok(url.includes('page.size=10'));
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.tasks.list({ page: 0, pageSize: 10 });
        assert.deepStrictEqual(result, mockResponse);
    });

    test('stop should send POST request to stop endpoint', async () => {
        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('environmental/tasks/task-123/stop'));
            assert.strictEqual(options.method, 'POST');
            return new Response('', { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        await client.tasks.stop('task-123');
    });

    test('delete should send DELETE request', async () => {
        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('environmental/tasks/task-123'));
            assert.strictEqual(options.method, 'DELETE');
            return new Response('', { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        await client.tasks.delete('task-123');
    });

    test('assignSensors should assign sensors to task', async () => {
        const mockResponse: AssignSensorsResponse = {
            associated_sensors: [
                {
                    sensor_id: 'sensor-1',
                    sensor_task_id: 'st-1',
                    status: 'ACTIVE',
                },
                {
                    sensor_id: 'sensor-2',
                    sensor_task_id: 'st-2',
                    status: 'ACTIVE',
                },
            ],
            failed_sensors: [],
        };

        let capturedBody: any;

        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('environmental/tasks/task-123/sensors'));
            assert.strictEqual(options.method, 'POST');
            capturedBody = JSON.parse(options.body);
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.tasks.assignSensors('task-123', ['sensor-1', 'sensor-2']);

        assert.deepStrictEqual(result, mockResponse);
        assert.deepStrictEqual(capturedBody.sensor_ids, ['sensor-1', 'sensor-2']);
    });

    test('assignSensors should handle failed sensors', async () => {
        const mockResponse: AssignSensorsResponse = {
            associated_sensors: [
                {
                    sensor_id: 'sensor-1',
                    sensor_task_id: 'st-1',
                    status: 'ACTIVE',
                },
            ],
            failed_sensors: [
                {
                    sensor_id: 'sensor-2',
                    failed_sensor_error: 'Sensor not found',
                },
            ],
        };

        const mockFetch = async () => {
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.tasks.assignSensors('task-123', ['sensor-1', 'sensor-2']);

        assert.strictEqual(result.associated_sensors.length, 1);
        assert.strictEqual(result.failed_sensors.length, 1);
        assert.strictEqual(result.failed_sensors[0].failed_sensor_error, 'Sensor not found');
    });

    test('assignAssets should associate assets with task', async () => {
        const mockResponse = [
            {
                asset_id: 'asset-1',
                status: 'ASSOCIATED',
            },
        ];

        let capturedBody: any;

        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('environmental/tasks/task-123/assets'));
            assert.strictEqual(options.method, 'POST');
            capturedBody = JSON.parse(options.body);
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.tasks.assignAssets('task-123', ['asset-1']);

        assert.deepStrictEqual(result, mockResponse);
        assert.deepStrictEqual(capturedBody.asset_ids, ['asset-1']);
    });
});
