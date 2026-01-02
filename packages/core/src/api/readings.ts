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
