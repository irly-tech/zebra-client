import { ZebraClient } from '../client.js';
import { SensorStatus, SensorListResponse, SensorRegistration, ZebraEnvironmentalSensor } from '../types.js';

export interface ListSensorsOptions {
    page?: number;
    pageSize?: number;
}

export interface ListEnvironmentalSensorsOptions {
    page?: number;
    pageSize?: number;
    textFilter?: string;
}

export class SensorsAPI {
    constructor(private client: ZebraClient) { }

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

    async unregister(serialNumber: string): Promise<void> {
        await this.client.request<void>(
            'sensors.unregister',
            `devices/sensor-enrollments/${serialNumber}`,
            { method: 'DELETE' },
            'devices/sensor-enrollments/:serialNumber'
        );
    }

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

    async triggerRead(sensorId: string): Promise<void> {
        await this.client.request<void>(
            'sensors.triggerRead',
            `devices/environmental-sensors/${sensorId}/readings`,
            { method: 'POST' },
            'devices/environmental-sensors/:sensorId/readings'
        );
    }
}
