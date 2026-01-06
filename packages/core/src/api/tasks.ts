import { ZebraClient } from '../client.js';
import {
    Task,
    TaskDetails,
    TaskListResponse,
    CreateTaskOptions,
    AssignSensorsResponse,
    ListTasksOptions,
} from '../types.js';

/**
 * API for managing environmental monitoring tasks and sensor assignments.
 */
export class TasksAPI {
    constructor(private client: ZebraClient) { }

    /**
     * Creates a new environmental monitoring task.
     *
     * @param options - Configuration options for the new task.
     * @returns A promise that resolves to the created task.
     */
    async create(options: CreateTaskOptions): Promise<Task> {
        const body = {
            task_from_details: {
                task_details: {
                    name: options.name,
                    interval_minutes: options.intervalMinutes ?? 5,
                    interval_seconds: options.intervalSeconds,
                    loop_reads: options.loopReads ?? true,
                    sensor_type: options.sensorType || 'SENSOR_TYPE_TEMPERATURE',
                    alarm_low_temp: options.alarmLowTemp,
                    alarm_high_temp: options.alarmHighTemp,
                    low_duration_minutes: options.lowDurationMinutes,
                    high_duration_minutes: options.highDurationMinutes,
                    notes: options.notes,
                    start_immediately: options.startImmediately !== false ? {} : undefined,
                    required_sensors: options.requiredSensors,
                },
            },
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

    /**
     * Retrieves the details of a specific task.
     *
     * @param taskId - The unique identifier of the task.
     * @returns A promise that resolves to the task details.
     */
    async get(taskId: string): Promise<Task> {
        return this.client.request<Task>(
            'tasks.get',
            `environmental/tasks/${taskId}`,
            { method: 'GET' },
            'environmental/tasks/:taskId'
        );
    }

    /**
     * Lists environmental tasks with optional filtering and pagination.
     *
     * @param options - Filtering and pagination options.
     * @returns A promise that resolves to the task list response.
     */
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

    /**
     * Stops an active monitoring task.
     *
     * @param taskId - The unique identifier of the task to stop.
     * @returns A promise that resolves when the task is stopped.
     */
    async stop(taskId: string): Promise<void> {
        await this.client.request<void>(
            'tasks.stop',
            `environmental/tasks/${taskId}/stop`,
            { method: 'POST' },
            'environmental/tasks/:taskId/stop'
        );
    }

    /**
     * Deletes a monitoring task.
     *
     * @param taskId - The unique identifier of the task to delete.
     * @returns A promise that resolves when the task is deleted.
     */
    async delete(taskId: string): Promise<void> {
        await this.client.request<void>(
            'tasks.delete',
            `environmental/tasks/${taskId}`,
            { method: 'DELETE' },
            'environmental/tasks/:taskId'
        );
    }

    /**
     * Assigns one or more sensors to a specific monitoring task.
     *
     * @param taskId - The unique identifier of the task.
     * @param sensorIds - Array of sensor IDs to assign.
     * @returns A promise that resolves to the sensor assignment response.
     */
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

    /**
     * Associates assets with a specific monitoring task.
     *
     * @param taskId - The unique identifier of the task.
     * @param assetIds - Array of asset IDs to associate.
     * @returns A promise that resolves to the asset assignment response.
     */
    async assignAssets(taskId: string, assetIds: string[]): Promise<import('../types.js').AssetAssignment[]> {
        const body = {
            asset_ids: assetIds,
        };

        return this.client.request<import('../types.js').AssetAssignment[]>(
            'tasks.assignAssets',
            `environmental/tasks/${taskId}/assets`,
            {
                method: 'POST',
                body: JSON.stringify(body),
            },
            'environmental/tasks/:taskId/assets'
        );
    }
}
