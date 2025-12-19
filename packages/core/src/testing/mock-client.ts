import {
    ZebraReadingsResponse,
    SensorStatus,
    SensorListResponse,
    ZebraAlarmsResponse,
    Task,
    ZebraReading,
    ZebraAlarm
} from '../types.js';
import { GetReadingsLogOptions } from '../api/readings.js';
import { ListSensorsOptions } from '../api/sensors.js';
import { ListAlarmsOptions } from '../api/alarms.js';

export interface MockCall {
    method: string;
    args: any[];
    timestamp: number;
    result?: any;
    error?: Error;
}

export class MockZebraClient {
    private _calls: MockCall[] = [];

    public mockResponses: {
        readings: {
            getLog?: ZebraReadingsResponse | Error;
        };
        sensors: {
            getStatus?: SensorStatus | Error;
            list?: SensorListResponse | Error;
        };
        alarms: {
            list?: ZebraAlarmsResponse | Error;
        };
    } = {
            readings: {},
            sensors: {},
            alarms: {},
        };

    get calls(): readonly MockCall[] {
        return this._calls;
    }

    getCalls(method: string): MockCall[] {
        return this._calls.filter(c => c.method === method);
    }

    getLastCall(method: string): MockCall | undefined {
        return this.getCalls(method).at(-1);
    }

    wasCalled(method: string): boolean {
        return this.getCalls(method).length > 0;
    }

    clearCalls(): void {
        this._calls = [];
    }

    readings = {
        getLog: async (options: GetReadingsLogOptions): Promise<ZebraReadingsResponse> => {
            const response = this.mockResponses.readings.getLog;
            this._calls.push({
                method: 'readings.getLog',
                args: [options],
                timestamp: Date.now(),
                result: response instanceof Error ? undefined : response,
                error: response instanceof Error ? response : undefined,
            });

            if (response instanceof Error) throw response;
            if (!response) throw new Error('No mock response configured for readings.getLog');
            return response;
        },
    };

    sensors = {
        getStatus: async (serialNumber: string): Promise<SensorStatus> => {
            const response = this.mockResponses.sensors.getStatus;
            this._calls.push({
                method: 'sensors.getStatus',
                args: [serialNumber],
                timestamp: Date.now(),
                result: response instanceof Error ? undefined : response,
                error: response instanceof Error ? response : undefined,
            });

            if (response instanceof Error) throw response;
            if (!response) throw new Error('No mock response configured for sensors.getStatus');
            return response;
        },

        list: async (options?: ListSensorsOptions): Promise<SensorListResponse> => {
            const response = this.mockResponses.sensors.list;
            this._calls.push({
                method: 'sensors.list',
                args: [options],
                timestamp: Date.now(),
                result: response instanceof Error ? undefined : response,
                error: response instanceof Error ? response : undefined,
            });

            if (response instanceof Error) throw response;
            if (!response) throw new Error('No mock response configured for sensors.list');
            return response;
        },
    };

    alarms = {
        list: async (options: ListAlarmsOptions): Promise<ZebraAlarmsResponse> => {
            const response = this.mockResponses.alarms.list;
            this._calls.push({
                method: 'alarms.list',
                args: [options],
                timestamp: Date.now(),
                result: response instanceof Error ? undefined : response,
                error: response instanceof Error ? response : undefined,
            });

            if (response instanceof Error) throw response;
            if (!response) throw new Error('No mock response configured for alarms.list');
            return response;
        },
    };
}
