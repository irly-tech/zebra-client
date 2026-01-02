export interface ZebraReading {
    id?: string;
    deviceId?: string;
    timestamp: string;
    decode?: {
        temperature?: {
            sample: number;
            sample_time?: string;
            alert?: boolean;
        };
        humidity?: {
            sample: number;
        };
    };
    event?: {
        timestamp?: string;
        data?: {
            rssi?: number;
        };
    };
    analytics?: {
        coordinates?: {
            global?: {
                latitude: number;
                longitude: number;
                accuracy?: number;
            };
        };
        location_name?: string;
        resourceId?: string;
        meta?: {
            data?: {
                task_alarm?: boolean;
            };
        };
    };
    mac_address?: string;
    sensor_id?: string;
    message_id?: string;
}

export interface ZebraReadingsResponse {
    results: ZebraReading[];
    total_count: number;
    nextCursor?: string;
}

export interface ZebraAlarm {
    id: string;
    sensor_id: string;
    task_id: string;
    alarm_type: string;
    occurred: string;
    temperature: number;
    threshold_min?: number;
    threshold_max?: number;
}

export interface ZebraAlarmsResponse {
    sensors_alarms: ZebraAlarm[];
    page_response: PageResponse;
}

export interface PageResponse {
    total_pages: number;
    page_size: number;
    current_page: number;
}

export interface SensorStatus {
    serial_number: string;
    battery_level: number;
    signal_strength: number;
    last_seen: string;
    firmware_version?: string;
    model?: string;
    hardware_revision?: string;
    most_recent?: {
        last_read_time?: string;
        sensor_task_status?: string;
        alarm_count?: number;
    };
}

export interface SensorListResponse {
    sensors: SensorStatus[];
    page_response: PageResponse;
}

export interface Task {
    id: string;
    sensor_id: string;
    status: string;
    created_at: string;
    thresholds?: {
        min_temperature?: number;
        max_temperature?: number;
    };
}
