export interface ZebraReading {
    id: string;
    sensor_id: string;
    occurred: string;
    temperature: number;
    humidity?: number;
    battery_level?: number;
    signal_strength?: number;
}

export interface ZebraReadingsResponse {
    sensors_readings: ZebraReading[];
    cursor?: string;
    page_response: PageResponse;
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
