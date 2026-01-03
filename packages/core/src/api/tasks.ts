import { ZebraClient } from '../client.js';
import {
    Task,
    TaskDetails,
    TaskListResponse,
    CreateTaskOptions,
    AssignSensorsResponse,
    ListTasksOptions,
} from '../types.js';

export class TasksAPI {
    constructor(private client: ZebraClient) { }

    async create(options: CreateTaskOptions): Promise<Task> {
        const body = {
            name: options.name,
            interval: options.intervalMinutes
                ? { minutes: options.intervalMinutes }
                : options.intervalSeconds
                    ? { seconds: options.intervalSeconds }
                    : { minutes: 5 },
            loop_reads: options.loopReads ?? true,
            sensor_type: options.sensorType || 'SENSOR_TYPE_TEMPERATURE',
            alarm_low_temp: options.alarmLowTemp,
            alarm_high_temp: options.alarmHighTemp,
            low_duration: options.lowDurationMinutes ? { minutes: options.lowDurationMinutes } : undefined,
            high_duration: options.highDurationMinutes ? { minutes: options.highDurationMinutes } : undefined,
            notes: options.notes,
            start_immediately: options.startImmediately ?? true,
        };

        return this.client.request<Task>(
            'tasks.create',
            'environmental/tasks',
            {
                method: 'POST',
                body: JSON.stringify(body),
            },
            'environmental/tasks'
        );
    }

    async get(taskId: string): Promise<Task> {
        return this.client.request<Task>(
            'tasks.get',
            `environmental/tasks/${taskId}`,
            { method: 'GET' },
            'environmental/tasks/:taskId'
        );
    }

    async list(options: ListTasksOptions = {}): Promise<TaskListResponse> {
        const params = new URLSearchParams();
        if (options.page !== undefined) params.set('page.page', options.page.toString());
        if (options.pageSize !== undefined) params.set('page.size', options.pageSize.toString());
        if (options.status) params.set('status', options.status);

        const endpoint = params.toString()
            ? `environmental/tasks?${params.toString()}`
            : 'environmental/tasks';

        return this.client.request<TaskListResponse>(
            'tasks.list',
            endpoint,
            { method: 'GET' },
            'environmental/tasks'
        );
    }

    async stop(taskId: string): Promise<void> {
        await this.client.request<void>(
            'tasks.stop',
            `environmental/tasks/${taskId}/stop`,
            { method: 'POST' },
            'environmental/tasks/:taskId/stop'
        );
    }

    async delete(taskId: string): Promise<void> {
        await this.client.request<void>(
            'tasks.delete',
            `environmental/tasks/${taskId}`,
            { method: 'DELETE' },
            'environmental/tasks/:taskId'
        );
    }

    async assignSensors(taskId: string, sensorIds: string[]): Promise<AssignSensorsResponse> {
        const body = {
            sensor_ids: sensorIds,
        };

        return this.client.request<AssignSensorsResponse>(
            'tasks.assignSensors',
            `environmental/tasks/${taskId}/sensors`,
            {
                method: 'POST',
                body: JSON.stringify(body),
            },
            'environmental/tasks/:taskId/sensors'
        );
    }
}
