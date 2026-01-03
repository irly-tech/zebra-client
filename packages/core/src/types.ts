/**
 * Represents a single sensor reading from the Zebra API.
 */
export interface ZebraReading {
    /** Unique identifier for this reading */
    id?: string;

    /** Device identifier */
    deviceId?: string;

    /** ISO 8601 timestamp when the reading was taken */
    timestamp: string;

    /** Decoded sensor data */
    decode?: {
        /** Temperature reading data */
        temperature?: {
            /** Temperature value in degrees Celsius */
            sample: number;
            /** ISO 8601 timestamp when the temperature was sampled */
            sample_time?: string;
            /** Whether this reading triggered an alert */
            alert?: boolean;
        };
        /** Humidity reading data */
        humidity?: {
            /** Humidity percentage (0-100) */
            sample: number;
        };
    };

    /** Event metadata */
    event?: {
        /** Event timestamp */
        timestamp?: string;
        /** Event data */
        data?: {
            /** Received Signal Strength Indicator (RSSI) in dBm */
            rssi?: number;
        };
    };

    /** Analytics and location data */
    analytics?: {
        /** Geographic coordinates */
        coordinates?: {
            /** Global GPS coordinates */
            global?: {
                /** Latitude in decimal degrees */
                latitude: number;
                /** Longitude in decimal degrees */
                longitude: number;
                /** Accuracy in meters */
                accuracy?: number;
            };
        };
        /** Human-readable location name */
        location_name?: string;
        /** Resource identifier */
        resourceId?: string;
        /** Additional metadata */
        meta?: {
            data?: {
                /** Whether this reading triggered a task alarm */
                task_alarm?: boolean;
            };
        };
    };

    /** Sensor MAC address */
    mac_address?: string;

    /** Sensor unique identifier */
    sensor_id?: string;

    /** Message unique identifier */
    message_id?: string;
}

/**
 * Response from the readings API containing paginated sensor readings.
 */
export interface ZebraReadingsResponse {
    /** Array of sensor readings */
    results: ZebraReading[];

    /** Total number of readings available */
    total_count: number;

    /** Cursor for fetching the next page of results */
    nextCursor?: string;
}

/**
 * Represents an alarm triggered by a sensor.
 */
export interface ZebraAlarm {
    /** Unique identifier for this alarm */
    id: string;

    /** ID of the sensor that triggered the alarm */
    sensor_id: string;

    /** ID of the task associated with this alarm */
    task_id: string;

    /** Type of alarm (e.g., 'HIGH_TEMPERATURE', 'LOW_TEMPERATURE') */
    alarm_type: string;

    /** ISO 8601 timestamp when the alarm occurred */
    occurred: string;

    /** Temperature value that triggered the alarm (in degrees Celsius) */
    temperature: number;

    /** Minimum temperature threshold (if applicable) */
    threshold_min?: number;

    /** Maximum temperature threshold (if applicable) */
    threshold_max?: number;
}

/**
 * Response from the alarms API containing paginated alarms.
 */
export interface ZebraAlarmsResponse {
    /** Array of alarms */
    sensors_alarms: ZebraAlarm[];

    /** Pagination information */
    page_response: PageResponse;
}

/**
 * Pagination information for API responses.
 */
export interface PageResponse {
    /** Total number of pages available */
    total_pages: number;

    /** Number of items per page */
    page_size: number;

    /** Current page number (0-indexed) */
    current_page: number;
}

/**
 * Status information for a sensor.
 */
export interface SensorStatus {
    /** Sensor serial number */
    serial_number: string;

    /** Battery level percentage (0-100) */
    battery_level: number;

    /** Signal strength in dBm */
    signal_strength: number;

    /** ISO 8601 timestamp of when the sensor was last seen */
    last_seen: string;

    /** Firmware version string */
    firmware_version?: string;

    /** Sensor model name */
    model?: string;

    /** Hardware revision identifier */
    hardware_revision?: string;

    /** Most recent activity information */
    most_recent?: {
        /** ISO 8601 timestamp of the last reading */
        last_read_time?: string;

        /** Status of the sensor's current task */
        sensor_task_status?: string;

        /** Number of alarms in the current task */
        alarm_count?: number;
    };
}

/**
 * Response from the sensors list API containing paginated sensors.
 */
export interface SensorListResponse {
    /** Array of sensors */
    sensors: SensorStatus[];

    /** Pagination information */
    page_response: PageResponse;
}

/**
 * Represents a monitoring task.
 */
export interface Task {
    /** Unique identifier for this task */
    id: string;

    /** ID of the sensor assigned to this task */
    sensor_id: string;

    /** Current status of the task */
    status: string;

    /** ISO 8601 timestamp when the task was created */
    created_at: string;

    /** Temperature thresholds for alarms */
    thresholds?: {
        /** Minimum temperature threshold in degrees Celsius */
        min_temperature?: number;

        /** Maximum temperature threshold in degrees Celsius */
        max_temperature?: number;
    };
}
