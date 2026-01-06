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
        results: [
            createMockReading(),
        ],
        total_count: 1,
        nextCursor: undefined,
        ...overrides,
    };
}

export function createMockReading(
    overrides: Partial<ZebraReading> = {}
): ZebraReading {
    return {
        id: `reading-${Date.now()}`,
        deviceId: 'device-123',
        sensor_id: 'ZEB-001',
        timestamp: new Date().toISOString(),
        decode: {
            temperature: {
                sample: 4.5,
                sample_time: new Date().toISOString(),
                alert: false,
            },
            humidity: {
                sample: 65,
            },
        },
        event: {
            timestamp: new Date().toISOString(),
            data: {
                rssi: -45,
            },
        },
        analytics: {
            coordinates: {
                global: {
                    latitude: 40.7128,
                    longitude: -74.0060,
                    accuracy: 10,
                },
            },
            location_name: 'Test Location',
        },
        mac_address: '00:11:22:33:44:55',
        ...overrides,
    };
}

export function createMockSensorStatus(
    overrides: Partial<SensorStatus> = {}
): SensorStatus {
    return {
        id: `sensor-${Date.now()}`,
        serial_number: 'ZEB-001',
        battery_level: 95,
        signal_strength: -45,
        last_seen: new Date().toISOString(),
        firmware_version: '1.2.3',
        model: 'ZebraSense-3050',
        hardware_revision: 'v1',
        most_recent: {
            last_read_time: new Date().toISOString(),
            sensor_task_status: 'SENSOR_TASK_STATUS_ACTIVE',
            alarm_count: 0,
        },
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
