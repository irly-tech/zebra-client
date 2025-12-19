import { ZebraClient } from '../client.js';
import { SensorStatus, SensorListResponse } from '../types.js';

export interface ListSensorsOptions {
    page?: number;
    pageSize?: number;
}

export class SensorsAPI {
    constructor(private client: ZebraClient) { }

    async getStatus(serialNumber: string): Promise<SensorStatus> {
        return this.client.request<SensorStatus>(
            'sensors.getStatus',
            `environmental/sensors/${serialNumber}`,
            { method: 'GET' },
            'environmental/sensors/:serialNumber'
        );
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
