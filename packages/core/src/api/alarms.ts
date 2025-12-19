import { ZebraClient } from '../client.js';
import { ZebraAlarmsResponse } from '../types.js';

export interface ListAlarmsOptions {
    taskId: string;
    since?: Date;
    page?: number;
    pageSize?: number;
}

export class AlarmsAPI {
    constructor(private client: ZebraClient) { }

    async list(options: ListAlarmsOptions): Promise<ZebraAlarmsResponse> {
        const url = new URL(`environmental/tasks/${options.taskId}/alarms`);
        if (options.since) url.searchParams.set('since', options.since.toISOString());
        if (options.page !== undefined) url.searchParams.set('page.page', options.page.toString());
        if (options.pageSize !== undefined) url.searchParams.set('page.size', options.pageSize.toString());

        return this.client.request<ZebraAlarmsResponse>(
            'alarms.list',
            url.toString()
        );
    }
}
