import {
    ZebraReadingsResponse,
    ZebraReading,
    SensorStatus,
    ZebraAlarmsResponse,
    ZebraAlarm,
    Task
} from '../types.js';

export function createMockReadingsResponse(
    overrides: Partial<ZebraReadingsResponse> = {}
): ZebraReadingsResponse {
    return {
        sensors_readings: [
            createMockReading(),
        ],
        cursor: undefined,
        page_response: {
            total_pages: 1,
            page_size: 100,
            current_page: 0,
        },
        ...overrides,
    };
}

export function createMockReading(
    overrides: Partial<ZebraReading> = {}
): ZebraReading {
    return {
        id: `reading-${Date.now()}`,
        sensor_id: 'ZEB-001',
        occurred: new Date().toISOString(),
        temperature: 4.5,
        humidity: 65,
        battery_level: 95,
        signal_strength: -45,
        ...overrides,
    };
}

export function createMockSensorStatus(
    overrides: Partial<SensorStatus> = {}
): SensorStatus {
    return {
        serial_number: 'ZEB-001',
        battery_level: 95,
        signal_strength: -45,
        last_seen: new Date().toISOString(),
        firmware_version: '1.2.3',
        ...overrides,
    };
}

export function createMockAlarmsResponse(
    overrides: Partial<ZebraAlarmsResponse> = {}
): ZebraAlarmsResponse {
    return {
        sensors_alarms: [],
        page_response: {
            total_pages: 1,
            page_size: 50,
            current_page: 0,
        },
        ...overrides,
    };
}

export function createMockAlarm(
    overrides: Partial<ZebraAlarm> = {}
): ZebraAlarm {
    return {
        id: `alarm-${Date.now()}`,
        sensor_id: 'ZEB-001',
        task_id: 'task-123',
        alarm_type: 'HIGH_TEMPERATURE',
        occurred: new Date().toISOString(),
        temperature: 10.5,
        threshold_max: 8.0,
        ...overrides,
    };
}
