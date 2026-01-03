import { ZebraClient } from '../client.js';
import { SensorStatus, SensorListResponse } from '../types.js';

/**
 * Options for listing sensors.
 */
export interface ListSensorsOptions {
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
 * API for accessing sensor information and status.
 */
export class SensorsAPI {
    /** @internal */
    constructor(private client: ZebraClient) { }

    /**
     * Retrieves the status of a specific sensor by serial number.
     *
     * @param serialNumber - The serial number of the sensor to query
     * @returns Promise resolving to the sensor's status information
     * @throws {ZebraError} When the API request fails
     * @throws {Error} When no sensor is found with the given serial number
     *
     * @example
     * ```typescript
     * const status = await client.sensors.getStatus('ZEB-001');
     * console.log(`Battery: ${status.battery_level}%`);
     * console.log(`Last seen: ${status.last_seen}`);
     * ```
     */
    async getStatus(serialNumber: string): Promise<SensorStatus> {
        const endpoint = `devices/environmental-sensors?text_filter=${encodeURIComponent(serialNumber)}`;

        const response = await this.client.request<SensorListResponse>(
            'sensors.getStatus',
            endpoint,
            { method: 'GET' },
            'devices/environmental-sensors'
        );

        if (!response.sensors || response.sensors.length === 0) {
            throw new Error(`No sensor found with serial number: ${serialNumber}`);
        }

        if (response.sensors.length > 1) {
            console.warn(`Multiple sensors found for serial number ${serialNumber}, returning the first one`);
        }

        return response.sensors[0];
    }

    /**
     * Lists all sensors with optional pagination.
     *
     * @param options - Optional pagination options
     * @returns Promise resolving to paginated sensor list
     * @throws {ZebraError} When the API request fails
     *
     * @example
     * ```typescript
     * const sensors = await client.sensors.list({
     *   page: 0,
     *   pageSize: 100
     * });
     *
     * for (const sensor of sensors.sensors) {
     *   console.log(`${sensor.serial_number}: ${sensor.battery_level}% battery`);
     * }
     * ```
     */
    async list(options: ListSensorsOptions = {}): Promise<SensorListResponse> {
        const params = new URLSearchParams();
        if (options.page !== undefined) params.set('page.page', options.page.toString());
        if (options.pageSize !== undefined) params.set('page.size', options.pageSize.toString());

        const endpoint = params.toString()
            ? `environmental/sensors?${params.toString()}`
            : 'environmental/sensors';

        return this.client.request<SensorListResponse>(
            'sensors.list',
            endpoint,
            { method: 'GET' },
            'environmental/sensors'
        );
    }
}
