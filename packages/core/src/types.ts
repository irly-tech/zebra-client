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
    /** Unique internal identifier for the sensor. */
    id: string;
    /** Unique serial number of the sensor. */
    serial_number: string;
    /** MAC address of the sensor. */
    mac_address?: string;
    /** Human-readable name of the sensor. */
    name?: string;
    /** Hardware model name/number. */
    model?: string;
    /** Manufacturer of the sensor. */
    manufacturer?: string;
    /** Firmware revision version. */
    firmware_revision?: string;
    /** Hardware revision version. */
    hardware_revision?: string;
    /** Current battery level (percentage). */
    battery_level?: number;
    /** Additional info about the sensor. */
    additional_info?: string;
    /** Current operational status of the sensor. */
    status?: 'SENSOR_STATUS_ACTIVE' | 'SENSOR_STATUS_ACTIVE_WITH_ALARM' | 'SENSOR_STATUS_STOPPED';
    /** Number of alarms recorded for the sensor. */
    alarm_count?: number;
    /** ISO 8601 timestamp of when the sensor was first seen (registration date). */
    first_seen?: string;
    /** ISO 8601 timestamp of last activity. */
    last_updated?: string;
    /** Additional notes for the sensor. */
    notes?: string;
    /** URL of the sensor's certificate document. */
    certificate_url?: string;
    /** Type of the sensor's certificate. */
    certificate_type?: 'CERTIFICATE_TYPE_CONFORMANCE' | 'CERTIFICATE_TYPE_CALIBRATION';

    /** legacy/compat field: uses firmware_revision */
    firmware_version?: string;
    /** legacy/compat field: signal strength is not in main list response */
    signal_strength?: number;
    /** legacy/compat field: maps to last_updated or first_seen? */
    last_seen?: string;

    /** Information about the most recent activity. */
    most_recent?: {
        /** Identifier of the assigned task. */
        task_id?: string;
        /** Identifier of the sensor-task mapping. */
        sensor_task_id?: string;
        /** Current status of the sensor task. */
        sensor_task_status?: 'SENSOR_TASK_STATUS_START_PENDING' | 'SENSOR_TASK_STATUS_ACTIVE' | 'SENSOR_TASK_STATUS_ACTIVE_WITH_ALARM' | 'SENSOR_TASK_STATUS_COMPLETED' | 'SENSOR_TASK_STATUS_STOP_PENDING';
        /** ISO 8601 timestamp of the last reading. */
        last_read_time?: string;

        /** legacy/compat fields */
        last_read_value?: number;
        alarm_count?: number;
    };

    /** The requested task which the sensor has been associated with, if any. */
    requested?: {
        task_id?: string;
        sensor_task_id?: string;
        sensor_task_status?: string;
        last_read_time?: string;
    };

    /** Last temperature, date, time and alarm of the advertising packet. */
    unverified?: {
        last_date_time?: string;
        last_temperature?: number;
        last_alarm?: boolean;
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
    /** Number of sensors required for this task. */
    required_sensors?: number;
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
    /** Minimum duration a low temperature must persist before triggering an alarm (in minutes). */
    low_duration_minutes?: number;
    /** Minimum duration a high temperature must persist before triggering an alarm (in minutes). */
    high_duration_minutes?: number;
    /** Minimum duration a low temperature must persist before triggering an alarm (in seconds). */
    low_duration_seconds?: number;
    /** Minimum duration a high temperature must persist before triggering an alarm (in seconds). */
    high_duration_seconds?: number;
    /** Frequency at which readings should be taken (in minutes). */
    interval_minutes?: number;
    /** Frequency at which readings should be taken (in seconds). */
    interval_seconds?: number;
    /** Number of sensors required for this task. */
    required_sensors?: number;
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
    /** Number of sensors required for this task. */
    requiredSensors?: number;
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
 * @deprecated Use SensorStatus instead.
 */
export type ZebraEnvironmentalSensor = SensorStatus;

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

/**
 * Options for creating a new webhook subscription.
 */
export interface CreateWebhookSubscriptionOptions {
    /** The destination URL for callbacks. */
    webhookUrl: string;
    /** A friendly name for the subscription. */
    name?: string;
    /** Custom headers to be sent with the webhook. */
    headers?: Record<string, string>;
    /** Optional task IDs to filter events. */
    taskIds?: string[];
    /** Optional EPCs (Electronic Product Codes) to filter events. */
    epcis?: string[];
}

/**
 * Details of a webhook subscription.
 */
export interface WebhookSubscription {
    /** Unique identifier for the subscription. */
    id: string;
    /** The destination URL for callbacks. */
    webhookUrl: string;
    /** A friendly name for the subscription. */
    name: string;
    /** Current status of the subscription. */
    status: 'ACTIVE' | 'STOPPED';
    /** Custom headers sent with the webhook. */
    headers?: Record<string, string>;
    /** Task IDs used for filtering. */
    taskIds?: string[];
    /** EPCs used for filtering. */
    epcis?: string[];
}

/**
 * Result of associating an asset with a task.
 */
export interface AssetAssignment {
    /** Unique identifier for the asset. */
    asset_id: string;
    /** External ID for the asset. */
    external_id?: string;
    /** Status of the assignment. */
    status: string;
}
