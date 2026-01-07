import { ZebraClient } from '../client.js';
import { ZebraAlarmsResponse } from '../types.js';

/**
 * Options for listing sensor alarms.
 */
export interface ListAlarmsOptions {
    /** The ID of the task to list alarms for. */
    taskId: string;
    /** Only include alarms that occurred after this date. */
    since?: Date;
    /** Page number to retrieve (starts at 1). */
    page?: number;
    /** Number of alarms per page. */
    pageSize?: number;
}

/**
 * API for managing and retrieving sensor alarms.
 */
export class AlarmsAPI {
    constructor(private client: ZebraClient) { }

    /**
     * Retrieves a list of alarms for a specific task.
     *
     * @param options - Filtering and pagination options.
     * @returns A promise that resolves to the alarms response.
     * @throws {ZebraError} If the API returns an error (e.g., 404 if task not found, 401, 403).
     */
    async list(options: ListAlarmsOptions): Promise<ZebraAlarmsResponse> {
        const url = new URL(`environmental/tasks/${options.taskId}/alarms`);
        if (options.since) url.searchParams.set('since', options.since.toISOString());
        if (options.page !== undefined) url.searchParams.set('page.page', options.page.toString());
        if (options.pageSize !== undefined) url.searchParams.set('page.size', options.pageSize.toString());

        return this.client.request<ZebraAlarmsResponse>(
            'alarms.list',
            url.toString(),
            { method: 'GET' },
            'environmental/tasks/:taskId/alarms'
        );
    }
}
