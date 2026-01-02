import { ZebraClient } from '../client.js';
import { SensorStatus, SensorListResponse } from '../types.js';

export interface ListSensorsOptions {
    page?: number;
    pageSize?: number;
}

export class SensorsAPI {
    constructor(private client: ZebraClient) { }

    async getStatus(serialNumber: string): Promise<SensorStatus> {
        const url = new URL('devices/environmental-sensors');
        url.searchParams.set('text_filter', serialNumber);

        const response = await this.client.request<SensorListResponse>(
            'sensors.getStatus',
            url.toString(),
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
        const url = new URL('environmental/sensors');
        if (options.page !== undefined) url.searchParams.set('page.page', options.page.toString());
        if (options.pageSize !== undefined) url.searchParams.set('page.size', options.pageSize.toString());

        return this.client.request<SensorListResponse>(
            'sensors.list',
            url.toString(),
            { method: 'GET' },
            'environmental/sensors'
        );
    }
}
