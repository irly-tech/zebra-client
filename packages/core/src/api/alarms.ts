import { ZebraClient } from '../client.js';
import { ZebraAlarmsResponse } from '../types.js';

/**
 * Options for listing alarms.
 */
export interface ListAlarmsOptions {
    /**
     * ID of the task to retrieve alarms for.
     */
    taskId: string;

    /**
     * Optional start time to filter alarms (only alarms after this time).
     */
    since?: Date;

    /**
     * Optional page number for pagination (0-indexed).
     */
    page?: number;

    /**
     * Optional page size for pagination.
     */
    pageSize?: number;
}

/**
 * API for retrieving alarm information.
 */
export class AlarmsAPI {
    /** @internal */
    constructor(private client: ZebraClient) { }

    /**
     * Lists alarms for a specific task with optional filtering and pagination.
     *
     * @param options - Query options including task ID, time filter, and pagination
     * @returns Promise resolving to paginated alarm list
     * @throws {ZebraError} When the API request fails
     *
     * @example
     * ```typescript
     * const alarms = await client.alarms.list({
     *   taskId: 'task-123',
     *   since: new Date('2024-01-01'),
     *   page: 0,
     *   pageSize: 50
     * });
     *
     * console.log(`Found ${alarms.sensors_alarms.length} alarms`);
     * console.log(`Total pages: ${alarms.page_response.total_pages}`);
     * ```
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
