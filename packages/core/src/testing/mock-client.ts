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

/**
 * Represents a recorded method call on the mock client.
 */
export interface MockCall {
    /** Name of the method that was called */
    method: string;

    /** Arguments passed to the method */
    args: any[];

    /** Timestamp when the call was made */
    timestamp: number;

    /** Result returned by the method (if successful) */
    result?: any;

    /** Error thrown by the method (if failed) */
    error?: Error;
}

/**
 * Mock implementation of ZebraClient for testing.
 * Allows configuring responses and verifying method calls.
 *
 * @example
 * ```typescript
 * const mockClient = new MockZebraClient();
 *
 * // Configure a mock response
 * mockClient.mockResponses.readings.getLog = {
 *   results: [createMockReading()],
 *   total_count: 1
 * };
 *
 * // Call the method
 * const result = await mockClient.readings.getLog({...});
 *
 * // Verify it was called
 * expect(mockClient.wasCalled('readings.getLog')).toBe(true);
 * ```
 */
export class MockZebraClient {
    private _calls: MockCall[] = [];

    /**
     * Configure mock responses for API methods.
     * Set to an Error instance to simulate a failure.
     */
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

    /**
     * Returns all recorded method calls in chronological order.
     */
    get calls(): readonly MockCall[] {
        return this._calls;
    }

    /**
     * Returns all calls to a specific method.
     * @param method - Method name (e.g., 'readings.getLog')
     */
    getCalls(method: string): MockCall[] {
        return this._calls.filter(c => c.method === method);
    }

    /**
     * Returns the most recent call to a specific method.
     * @param method - Method name (e.g., 'readings.getLog')
     */
    getLastCall(method: string): MockCall | undefined {
        return this.getCalls(method).at(-1);
    }

    /**
     * Checks if a method was called at least once.
     * @param method - Method name (e.g., 'readings.getLog')
     */
    wasCalled(method: string): boolean {
        return this.getCalls(method).length > 0;
    }

    /**
     * Clears the recorded call history.
     */
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
