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
    name: string;
    status: 'TASK_STATUS_ACTIVE' | 'TASK_STATUS_SENSOR_COMPLETED' | 'TASK_STATUS_START_PENDING' | 'TASK_STATUS_STOP_PENDING';
    sensor_count?: number;
    alarm_count?: number;
    started?: string;
    ended?: string;
    taskDetails?: TaskDetails;
}

export interface TaskDetails {
    name: string;
    interval: {
        minutes?: number;
        seconds?: number;
    };
    loop_reads?: boolean;
    sensor_type?: 'SENSOR_TYPE_TEMPERATURE' | 'SENSOR_TYPE_HUMIDITY';
    alarm_low_temp?: number;
    alarm_high_temp?: number;
    low_duration?: {
        minutes?: number;
    };
    high_duration?: {
        minutes?: number;
    };
    notes?: string;
}

export interface CreateTaskOptions {
    name: string;
    intervalMinutes?: number;
    intervalSeconds?: number;
    loopReads?: boolean;
    sensorType?: 'SENSOR_TYPE_TEMPERATURE' | 'SENSOR_TYPE_HUMIDITY';
    alarmLowTemp?: number;
    alarmHighTemp?: number;
    lowDurationMinutes?: number;
    highDurationMinutes?: number;
    notes?: string;
    startImmediately?: boolean;
}

export interface ListTasksOptions {
    page?: number;
    pageSize?: number;
    status?: string;
}

export interface TaskListResponse {
    tasks: Task[];
    page_response: PageResponse;
}

export interface AssignSensorsResponse {
    associated_sensors: Array<{
        sensor_id: string;
        sensor_task_id: string;
        status: string;
    }>;
    failed_sensors: Array<{
        sensor_id: string;
        failed_sensor_error: string;
    }>;
}

export interface ZebraEnvironmentalSensor {
    id: string;
    serial_number: string;
    mac_address: string;
    battery_level?: number;
    model?: string;
    firmware_revision?: string;
    status?: string;
    most_recent?: {
        task_id: string;
        sensor_task_id: string;
        sensor_task_status: string;
        last_read_time: string;
    };
}

export interface SensorRegistration {
    id: string;
    serial_number: string;
    mac_address?: string;
    enrolled_at?: string;
}

export interface ZSFinderTokenResponse {
    token: string;
    expires_at?: string;
}
