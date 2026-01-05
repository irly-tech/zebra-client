import { ZebraClient } from '../client.js';
import { SensorStatus, SensorListResponse, SensorRegistration, ZebraEnvironmentalSensor } from '../types.js';

/**
 * Options for listing available sensors.
 */
export interface ListSensorsOptions {
    /** Page number to retrieve (starts at 1). */
    page?: number;
    /** Number of sensors per page. */
    pageSize?: number;
}

/**
 * Options for listing enrolled environmental sensors with filtering.
 */
export interface ListEnvironmentalSensorsOptions {
    /** Page number to retrieve (starts at 1). */
    page?: number;
    /** Number of sensors per page. */
    pageSize?: number;
    /** Text filter for sensor names or serial numbers. */
    textFilter?: string;
}

/**
 * API for managing and retrieving information about environmental sensors.
 */
export class SensorsAPI {
    constructor(private client: ZebraClient) { }

    /**
     * Retrieves the current status of a specific sensor by its serial number.
     *
     * @param serialNumber - The unique serial number of the sensor.
     * @returns A promise that resolves to the sensor status.
     * @throws {Error} If no sensor is found with the given serial number.
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
     * Lists all environmental sensors.
     *
     * @param options - Pagination options.
     * @returns A promise that resolves to the sensor list response.
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

    /**
     * Enrolls a new sensor into the system using its serial number.
     *
     * @param serialNumber - The serial number of the sensor to register.
     * @returns A promise that resolves to the registration details.
     */
    async register(serialNumber: string): Promise<SensorRegistration> {
        const body = {
            serial_number: serialNumber,
        };

        return this.client.request<SensorRegistration>(
            'sensors.register',
            'devices/sensor-enrollments',
            {
                method: 'POST',
                body: JSON.stringify(body),
            },
            'devices/sensor-enrollments'
        );
    }

    /**
     * Unenrolls a sensor from the system.
     *
     * @param serialNumber - The serial number of the sensor to unregister.
     * @returns A promise that resolves when the sensor is unregistered.
     */
    async unregister(serialNumber: string): Promise<void> {
        await this.client.request<void>(
            'sensors.unregister',
            `devices/sensor-enrollments/${serialNumber}`,
            { method: 'DELETE' },
            'devices/sensor-enrollments/:serialNumber'
        );
    }

    /**
     * Lists all currently enrolled environmental sensors.
     *
     * @param options - Filtering and pagination options.
     * @returns A promise that resolves to the list of enrolled sensors.
     */
    async listEnrolled(options: ListEnvironmentalSensorsOptions = {}): Promise<{ sensors: ZebraEnvironmentalSensor[] }> {
        const params = new URLSearchParams();
        if (options.page !== undefined) params.set('page.page', options.page.toString());
        if (options.pageSize !== undefined) params.set('page.size', options.pageSize.toString());
        if (options.textFilter) params.set('text_filter', options.textFilter);

        const endpoint = params.toString()
            ? `devices/environmental-sensors?${params.toString()}`
            : 'devices/environmental-sensors';

        return this.client.request<{ sensors: ZebraEnvironmentalSensor[] }>(
            'sensors.listEnrolled',
            endpoint,
            { method: 'GET' },
            'devices/environmental-sensors'
        );
    }

    /**
     * Manually triggers a reading from a specific sensor.
     *
     * @param sensorId - The internal ID of the sensor.
     * @returns A promise that resolves when the read is triggered.
     */
    async triggerRead(sensorId: string): Promise<void> {
        await this.client.request<void>(
            'sensors.triggerRead',
            `devices/environmental-sensors/${sensorId}/readings`,
            { method: 'POST' },
            'devices/environmental-sensors/:sensorId/readings'
        );
    }
}
