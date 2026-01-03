import { ZebraClient } from '../client.js';
import { ZebraReadingsResponse } from '../types.js';

/**
 * Options for retrieving sensor reading logs.
 */
export interface GetReadingsLogOptions {
    /**
     * ID of the task to retrieve readings for.
     */
    taskId: string;

    /**
     * ID of the sensor task to retrieve readings for.
     */
    sensorTaskId: string;

    /**
     * Start time for the readings query (inclusive).
     */
    startTime: Date;

    /**
     * Optional end time for the readings query (inclusive).
     */
    endTime?: Date;

    /**
     * Optional cursor for pagination. Use the `nextCursor` from a previous response.
     */
    cursor?: string;
}

/**
 * API for retrieving sensor reading data.
 */
export class ReadingsAPI {
    /** @internal */
    constructor(private client: ZebraClient) { }

    /**
     * Retrieves a log of sensor readings for a specific task and sensor.
     *
     * @param options - Query options including task IDs and time range
     * @returns Promise resolving to paginated sensor readings
     * @throws {ZebraError} When the API request fails
     *
     * @example
     * ```typescript
     * const readings = await client.readings.getLog({
     *   taskId: 'task-123',
     *   sensorTaskId: 'sensor-task-456',
     *   startTime: new Date('2024-01-01'),
     *   endTime: new Date('2024-01-31')
     * });
     *
     * // Handle pagination
     * if (readings.nextCursor) {
     *   const nextPage = await client.readings.getLog({
     *     ...options,
     *     cursor: readings.nextCursor
     *   });
     * }
     * ```
     */
    async getLog(options: GetReadingsLogOptions): Promise<ZebraReadingsResponse> {
        const params = new URLSearchParams();
        params.set('savannah_sensor_task_id', options.sensorTaskId);
        params.set('since', options.startTime.toISOString());
        if (options.endTime) {
            params.set('until', options.endTime.toISOString());
        }
        if (options.cursor) {
            params.set('cursor', options.cursor);
        }

        const endpoint = `data/environmental/tasks/${options.taskId}/log?${params.toString()}`;

        return this.client.request<ZebraReadingsResponse>(
            'readings.getLog',
            endpoint,
            { method: 'GET' },
            'data/environmental/tasks/:taskId/log'
        );
    }
}
