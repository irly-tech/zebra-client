import { ZebraClient } from '../client.js';
import { ZebraReadingsResponse } from '../types.js';

export interface GetReadingsLogOptions {
    taskId: string;
    sensorTaskId: string;
    startTime: Date;
    endTime?: Date;
    cursor?: string;
}

export class ReadingsAPI {
    constructor(private client: ZebraClient) { }

    async getLog(options: GetReadingsLogOptions): Promise<ZebraReadingsResponse> {
        const url = new URL(`data/environmental/tasks/${options.taskId}/log`);
        url.searchParams.set('savannah_sensor_task_id', options.sensorTaskId);
        url.searchParams.set('since', options.startTime.toISOString());
        if (options.endTime) {
            url.searchParams.set('until', options.endTime.toISOString());
        }
        if (options.cursor) {
            url.searchParams.set('cursor', options.cursor);
        }

        return this.client.request<ZebraReadingsResponse>(
            'readings.getLog',
            url.toString(),
            { method: 'GET' },
            'data/environmental/tasks/:taskId/log'
        );
    }
}
