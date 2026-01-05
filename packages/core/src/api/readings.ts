import { ZebraClient } from '../client.js';
import { ZebraReadingsResponse } from '../types.js';

/**
 * Options for retrieving historical sensor readings.
 */
export interface GetReadingsLogOptions {
    /** The ID of the task containing the readings. */
    taskId: string;
    /** The specific sensor task ID within the task. */
    sensorTaskId: string;
    /** The start of the time range to retrieve. */
    startTime: Date;
    /** The end of the time range to retrieve (optional, defaults to now). */
    endTime?: Date;
    /** Cursor for fetching the next page of results. */
    cursor?: string;
}

/**
 * API for retrieving environmental sensor readings.
 */
export class ReadingsAPI {
    constructor(private client: ZebraClient) { }

    /**
     * Retrieves a log of historical readings for a specific sensor task.
     *
     * @param options - Time range and pagination options.
     * @returns A promise that resolves to the readings response.
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
