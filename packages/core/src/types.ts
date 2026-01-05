/**
 * Represents a single environmental reading from a Zebra sensor.
 */
export interface ZebraReading {
    /** Unique identifier for the reading. */
    id?: string;
    /** Identifier of the device that generated the reading. */
    deviceId?: string;
    /** ISO 8601 timestamp of when the reading was recorded. */
    timestamp: string;
    /** Decoded sensor data (temperature, humidity, etc.). */
    decode?: {
        /** Temperature reading details. */
        temperature?: {
            /** The temperature value. */
            sample: number;
            /** ISO 8601 timestamp of the temperature sample. */
            sample_time?: string;
            /** Whether a temperature alert was triggered. */
            alert?: boolean;
        };
        /** Humidity reading details. */
        humidity?: {
            /** The humidity value. */
            sample: number;
        };
    };
    /** Event metadata associated with the reading. */
    event?: {
        /** ISO 8601 timestamp of the event. */
        timestamp?: string;
        /** Additional event data. */
        data?: {
            /** Received Signal Strength Indicator (RSSI) value. */
            rssi?: number;
        };
    };
    /** Analytics data, including location information. */
    analytics?: {
        /** Geographic coordinates. */
        coordinates?: {
            /** Global coordinates (latitude/longitude). */
            global?: {
                /** latitude in decimal degrees. */
                latitude: number;
                /** longitude in decimal degrees. */
                longitude: number;
                /** accuracy in meters. */
                accuracy?: number;
            };
        };
        /** Human-readable location name. */
        location_name?: string;
        /** Resource identifier associated with the location. */
        resourceId?: string;
        /** Additional metadata. */
        meta?: {
            /** Metadata data fields. */
            data?: {
                /** Whether a task alarm was active. */
                task_alarm?: boolean;
            };
        };
    };
    /** MAC address of the sensor. */
    mac_address?: string;
    /** Unique identifier of the sensor. */
    sensor_id?: string;
    /** Identifier of the message containing the reading. */
    message_id?: string;
}

/**
 * Paginated response containing a list of Zebra readings.
 */
export interface ZebraReadingsResponse {
    /** Array of readings matching the query. */
    results: ZebraReading[];
    /** Total number of readings available across all pages. */
    total_count: number;
    /** Cursor for fetching the next page of results. */
    nextCursor?: string;
}

/**
 * Represents an alarm triggered by an environmental sensor.
 */
export interface ZebraAlarm {
    /** Unique identifier for the alarm. */
    id: string;
    /** Identifier of the sensor that triggered the alarm. */
    sensor_id: string;
    /** Identifier of the task associated with the alarm. */
    task_id: string;
    /** Type of alarm (e.g., temperature excursion). */
    alarm_type: string;
    /** ISO 8601 timestamp of when the alarm occurred. */
    occurred: string;
    /** Temperature recorded when the alarm was triggered. */
    temperature: number;
    /** Minimum temperature threshold that was violated. */
    threshold_min?: number;
    /** Maximum temperature threshold that was violated. */
    threshold_max?: number;
}

/**
 * Paginated response containing a list of sensor alarms.
 */
export interface ZebraAlarmsResponse {
    /** Array of alarms matching the query. */
    sensors_alarms: ZebraAlarm[];
    /** Pagination information for the response. */
    page_response: PageResponse;
}

/**
 * Standard pagination information for API responses.
 */
export interface PageResponse {
    /** Total number of pages available. */
    total_pages: number;
    /** Number of items per page. */
    page_size: number;
    /** Current page index (starts at 1). */
    current_page: number;
}

/**
 * Current status and health information for a sensor.
 */
export interface SensorStatus {
    /** Unique serial number of the sensor. */
    serial_number: string;
    /** Current battery level (percentage). */
    battery_level: number;
    /** Current signal strength (RSSI). */
    signal_strength: number;
    /** ISO 8601 timestamp of the last time the sensor was seen. */
    last_seen: string;
    /** Firmware version installed on the sensor. */
    firmware_version?: string;
    /** Hardware model name/number. */
    model?: string;
    /** Hardware revision version. */
    hardware_revision?: string;
    /** Information about the most recent activity. */
    most_recent?: {
        /** ISO 8601 timestamp of the last reading. */
        last_read_time?: string;
        /** Current task status of the sensor. */
        sensor_task_status?: string;
        /** Number of alarms currently active for this sensor. */
        alarm_count?: number;
    };
}

/**
 * Paginated response containing a list of sensors and their status.
 */
export interface SensorListResponse {
    /** Array of sensor status objects. */
    sensors: SensorStatus[];
    /** Pagination information for the response. */
    page_response: PageResponse;
}

/**
 * Represents a monitoring task for environmental sensors.
 */
export interface Task {
    /** Unique identifier for the task. */
    id: string;
    /** Human-readable name of the task. */
    name: string;
    /** Current operational status of the task. */
    status: 'TASK_STATUS_ACTIVE' | 'TASK_STATUS_SENSOR_COMPLETED' | 'TASK_STATUS_START_PENDING' | 'TASK_STATUS_STOP_PENDING';
    /** Number of sensors assigned to this task. */
    sensor_count?: number;
    /** Total number of alarms triggered during this task. */
    alarm_count?: number;
    /** ISO 8601 timestamp of when the task started. */
    started?: string;
    /** ISO 8601 timestamp of when the task ended. */
    ended?: string;
    /** Detailed configuration for the task. */
    taskDetails?: TaskDetails;
}

/**
 * Detailed configuration settings for an environmental task.
 */
export interface TaskDetails {
    /** Human-readable name of the task. */
    name: string;
    /** Frequency at which readings should be taken. */
    interval: {
        /** Interval in minutes. */
        minutes?: number;
        /** Interval in seconds. */
        seconds?: number;
    };
    /** Whether to continuously loop readings. */
    loop_reads?: boolean;
    /** Type of sensor data to monitor (temperature or humidity). */
    sensor_type?: 'SENSOR_TYPE_TEMPERATURE' | 'SENSOR_TYPE_HUMIDITY';
    /** Low temperature threshold for alarms. */
    alarm_low_temp?: number;
    /** High temperature threshold for alarms. */
    alarm_high_temp?: number;
    /** Minimum duration a low temperature must persist before triggering an alarm. */
    low_duration?: {
        /** Duration in minutes. */
        minutes?: number;
    };
    /** Minimum duration a high temperature must persist before triggering an alarm. */
    high_duration?: {
        /** Duration in minutes. */
        minutes?: number;
    };
    /** Optional notes or description for the task. */
    notes?: string;
}

/**
 * Options for creating a new environmental monitoring task.
 */
export interface CreateTaskOptions {
    /** Human-readable name for the new task. */
    name: string;
    /** Reading interval in minutes. */
    intervalMinutes?: number;
    /** Reading interval in seconds. */
    intervalSeconds?: number;
    /** Whether to loop readings (default: true). */
    loopReads?: boolean;
    /** Type of monitoring (default: SENSOR_TYPE_TEMPERATURE). */
    sensorType?: 'SENSOR_TYPE_TEMPERATURE' | 'SENSOR_TYPE_HUMIDITY';
    /** Lower temperature limit for triggering alarms. */
    alarmLowTemp?: number;
    /** Upper temperature limit for triggering alarms. */
    alarmHighTemp?: number;
    /** Minutes excursion below alarmLowTemp must last to trigger an alarm. */
    lowDurationMinutes?: number;
    /** Minutes excursion above alarmHighTemp must last to trigger an alarm. */
    highDurationMinutes?: number;
    /** Additional notes or context for the task. */
    notes?: string;
    /** Whether to start the task immediately upon creation (default: true). */
    startImmediately?: boolean;
}

/**
 * Options for filtering and paginating a list of tasks.
 */
export interface ListTasksOptions {
    /** Page number to retrieve. */
    page?: number;
    /** Number of items per page. */
    pageSize?: number;
    /** Filter tasks by status. */
    status?: string;
}

/**
 * Paginated response containing a list of environmental tasks.
 */
export interface TaskListResponse {
    /** Array of tasks matching the query. */
    tasks: Task[];
    /** Pagination information for the response. */
    page_response: PageResponse;
}

/**
 * Result of assigning sensors to a monitoring task.
 */
export interface AssignSensorsResponse {
    /** List of sensors successfully associated with the task. */
    associated_sensors: Array<{
        /** Unique identifier of the sensor. */
        sensor_id: string;
        /** Identifier of the specific sensor-task mapping. */
        sensor_task_id: string;
        /** Assignment status. */
        status: string;
    }>;
    /** List of sensors that could not be associated with the task. */
    failed_sensors: Array<{
        /** Unique identifier of the sensor. */
        sensor_id: string;
        /** Reason why the assignment failed. */
        failed_sensor_error: string;
    }>;
}

/**
 * Represents an environmental sensor within the Zebra system.
 */
export interface ZebraEnvironmentalSensor {
    /** Unique internal identifier for the sensor. */
    id: string;
    /** Unique serial number of the sensor. */
    serial_number: string;
    /** MAC address of the sensor. */
    mac_address: string;
    /** Current battery level (percentage). */
    battery_level?: number;
    /** Sensor hardware model. */
    model?: string;
    /** Sensor firmware revision. */
    firmware_revision?: string;
    /** Current operational status of the sensor. */
    status?: string;
    /** Information about the sensor's current or last active task. */
    most_recent?: {
        /** Identifier of the assigned task. */
        task_id: string;
        /** Identifier of the sensor-task mapping. */
        sensor_task_id: string;
        /** Current status of the task for this specific sensor. */
        sensor_task_status: string;
        /** ISO 8601 timestamp of the last recorded reading. */
        last_read_time: string;
    };
}

/**
 * Details of a sensor's registration (enrollment) in the system.
 */
export interface SensorRegistration {
    /** Unique internal identifier for the sensor. */
    id: string;
    /** Unique serial number of the sensor. */
    serial_number: string;
    /** MAC address of the sensor. */
    mac_address?: string;
    /** ISO 8601 timestamp of when the sensor was enrolled. */
    enrolled_at?: string;
}

/**
 * Response containing a short-lived token for Zebra SmartFinder integration.
 */
export interface ZSFinderTokenResponse {
    /** The authentication token. */
    token: string;
    /** ISO 8601 timestamp of when the token expires. */
    expires_at?: string;
}
