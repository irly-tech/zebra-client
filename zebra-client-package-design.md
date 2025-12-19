# Zebra API Client Package Design

## Overview

A shared TypeScript package for interacting with Zebra Savannah APIs, with opt-in OpenTelemetry telemetry support. This package will replace the duplicated Zebra API code across the web app and GCP functions/services.

## Source Repositories

| Repository | Purpose |
|------------|---------|
| `github.com/irly-tech/temp-genie` | Main application monorepo (consumer of this package) |
| `github.com/irly-tech/serverless` | Reference package for CI/CD and testing patterns |
| `github.com/temp-genie/zebra-client` | **New repo to be created** for this package |

## Problem Statement

1. **Duplicated Code**: Zebra API interaction logic is duplicated between:
   - `github.com/irly-tech/temp-genie` → `apps/web/lib/api/clients/zebra.ts` (web app)
   - `github.com/irly-tech/temp-genie` → `gcp/services/process-sensor-poll/src/index.ts` (raw fetch calls)
   - `github.com/irly-tech/temp-genie` → `gcp/services/process-alarm-check/src/index.ts` (raw fetch calls)

2. **Rate Limiting**: Hitting Zebra API rate limits frequently with no unified way to track/monitor usage

3. **No Telemetry**: No visibility into API call patterns, latencies, error rates, or rate limit hits

## Proposed Solution

Create two npm packages:

### 1. `@temp-genie/zebra-client` (Core Package)

The main client library with:
- Type-safe API methods for all Zebra endpoints
- Built-in retry logic with exponential backoff
- Rate limit handling
- Request/response logging hooks
- **Pluggable telemetry provider interface** (defaults to no-op)

### 2. `@temp-genie/zebra-client-otel` (Optional Extension)

OpenTelemetry integration that:
- Implements the telemetry provider interface
- Tracks request metrics (latency, status codes, rate limits)
- Creates spans for distributed tracing
- Exports to any OTel-compatible backend

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Consumer Application                         │
│  (Next.js web app, GCP Cloud Run service, Cloud Function)       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   @temp-genie/zebra-client                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ API Methods │  │ Retry Logic │  │ TelemetryProvider (I/F) │  │
│  │             │  │             │  │  - NoopProvider (default)│  │
│  │ - sensors   │  │ - exp backoff│  │  - Custom providers     │  │
│  │ - readings  │  │ - rate limits│  │                         │  │
│  │ - tasks     │  │             │  └─────────────────────────┘  │
│  │ - alarms    │  │             │              ▲                │
│  └─────────────┘  └─────────────┘              │                │
└────────────────────────────────────────────────┼────────────────┘
                                                 │
                              ┌──────────────────┘
                              │ (optional dependency)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 @temp-genie/zebra-client-otel                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ OTelTelemetryProvider implements TelemetryProvider          ││
│  │  - Creates spans for each API call                          ││
│  │  - Records metrics (request count, latency, errors)         ││
│  │  - Tracks rate limit hits as events                         ││
│  │  - Exports to configured OTel backend                       ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Core Package API Design

### Installation & Basic Usage

```typescript
import { ZebraClient } from '@temp-genie/zebra-client';

const client = new ZebraClient({
  apiKey: process.env.ZEBRA_API_KEY,
  baseUrl: 'https://api.zebra.com/v2', // optional, has default
});

// Fetch sensor readings
const readings = await client.readings.getLog({
  taskId: 'task-123',
  sensorTaskId: 'sensor-task-456',
  startTime: new Date('2024-01-01'),
  cursor: undefined,
});

// Get sensor status
const status = await client.sensors.getStatus('ZEB-001');

// Fetch alarms
const alarms = await client.alarms.list({
  taskId: 'task-123',
  since: new Date('2024-01-01'),
  page: 0,
  pageSize: 50,
});
```

### Telemetry Provider Interface

```typescript
// types.ts
export interface TelemetryProvider {
  /**
   * Called before an API request is made
   */
  onRequestStart(context: RequestContext): void;

  /**
   * Called after an API request completes (success or failure)
   */
  onRequestEnd(context: RequestContext, result: RequestResult): void;

  /**
   * Called when a rate limit is hit
   */
  onRateLimitHit(context: RequestContext, retryAfter?: number): void;

  /**
   * Called when a retry is attempted
   */
  onRetry(context: RequestContext, attempt: number, reason: string): void;
}

export interface RequestContext {
  method: string;           // HTTP method
  endpoint: string;         // API endpoint path
  operationName: string;    // e.g., 'readings.getLog', 'sensors.getStatus'
  startTime: number;        // Timestamp
  traceId?: string;         // Optional trace ID for correlation
  attributes?: Record<string, string | number | boolean>;
}

export interface RequestResult {
  statusCode: number;
  success: boolean;
  error?: Error;
  duration: number;         // Request duration in ms
  responseSize?: number;    // Response body size in bytes
  rateLimited: boolean;
  retryCount: number;
}
```

### No-op Provider (Default)

```typescript
// noop-provider.ts
export class NoopTelemetryProvider implements TelemetryProvider {
  onRequestStart(): void {}
  onRequestEnd(): void {}
  onRateLimitHit(): void {}
  onRetry(): void {}
}
```

### Client Configuration

```typescript
export interface ZebraClientConfig {
  apiKey: string;
  baseUrl?: string;

  // Retry configuration
  retry?: {
    maxRetries?: number;        // default: 3
    initialDelayMs?: number;    // default: 1000
    maxDelayMs?: number;        // default: 30000
    backoffMultiplier?: number; // default: 2
  };

  // Rate limiting
  rateLimit?: {
    requestsPerSecond?: number; // optional client-side throttling
  };

  // Telemetry (optional - defaults to NoopProvider)
  telemetryProvider?: TelemetryProvider;

  // Request timeout
  timeoutMs?: number;           // default: 30000

  // Custom fetch implementation (for testing or custom HTTP clients)
  fetch?: typeof fetch;
}
```

## OpenTelemetry Extension API

### Installation

```bash
npm install @temp-genie/zebra-client @temp-genie/zebra-client-otel
```

### Usage with OpenTelemetry

```typescript
import { ZebraClient } from '@temp-genie/zebra-client';
import { OTelTelemetryProvider } from '@temp-genie/zebra-client-otel';
import { trace, metrics } from '@opentelemetry/api';

// Create the OTel provider with tracer and meter
const telemetryProvider = new OTelTelemetryProvider({
  tracer: trace.getTracer('zebra-client'),
  meter: metrics.getMeter('zebra-client'),

  // Optional: customize metric names
  metricPrefix: 'zebra_api',

  // Optional: add default attributes to all spans/metrics
  defaultAttributes: {
    'service.name': 'process-sensor-poll',
    'environment': process.env.DEPLOY_ENV,
  },
});

// Create client with telemetry enabled
const client = new ZebraClient({
  apiKey: process.env.ZEBRA_API_KEY,
  telemetryProvider,
});

// All API calls now automatically:
// - Create spans with timing, status, retry info
// - Record metrics for request count, latency histogram, error rate
// - Track rate limit events
```

### Metrics Exported

| Metric Name | Type | Description |
|-------------|------|-------------|
| `zebra_api_requests_total` | Counter | Total number of API requests |
| `zebra_api_request_duration_ms` | Histogram | Request latency distribution |
| `zebra_api_errors_total` | Counter | Total number of failed requests |
| `zebra_api_rate_limits_total` | Counter | Number of rate limit hits |
| `zebra_api_retries_total` | Counter | Number of retry attempts |

### Span Attributes

Each span includes:
- `http.method`
- `http.url`
- `http.status_code`
- `zebra.operation` (e.g., `readings.getLog`)
- `zebra.retry_count`
- `zebra.rate_limited`
- `error` (if failed)

## API Methods to Implement

Based on current usage in the codebase:

### Sensors

```typescript
interface SensorsAPI {
  // Get sensor status including battery level
  getStatus(serialNumber: string): Promise<SensorStatus>;

  // List sensors with optional filters
  list(options?: ListSensorsOptions): Promise<SensorListResponse>;
}
```

### Readings

```typescript
interface ReadingsAPI {
  // Get readings log with cursor-based pagination
  getLog(options: GetReadingsLogOptions): Promise<ReadingsLogResponse>;
}

interface GetReadingsLogOptions {
  taskId: string;
  sensorTaskId: string;
  startTime: Date;
  endTime?: Date;
  cursor?: string;
}
```

### Tasks

```typescript
interface TasksAPI {
  // Create a new sensor task
  create(options: CreateTaskOptions): Promise<Task>;

  // Stop a sensor task
  stop(taskId: string): Promise<void>;

  // Get task status
  get(taskId: string): Promise<Task>;
}
```

### Alarms

```typescript
interface AlarmsAPI {
  // List alarms with pagination
  list(options: ListAlarmsOptions): Promise<AlarmsResponse>;
}

interface ListAlarmsOptions {
  taskId: string;
  since?: Date;
  page?: number;
  pageSize?: number;
}
```

## Migration Plan

### Phase 1: Create Package

1. Set up new repo `zebra-client` with TypeScript, ESM + CJS builds
2. Implement core client with NoopProvider
3. Implement all API methods based on existing code
4. Add comprehensive tests
5. Publish to npm (or private registry)

### Phase 2: Integrate into temp-genie

1. Add `@temp-genie/zebra-client` to (in `github.com/irly-tech/temp-genie`):
   - `apps/web/package.json`
   - `gcp/services/process-sensor-poll/package.json`
   - `gcp/services/process-alarm-check/package.json`

2. Replace existing Zebra API code with client usage

3. Remove duplicated types and fetch logic

### Phase 3: Add Telemetry (Optional)

1. Create `@temp-genie/zebra-client-otel` package
2. Set up OTel collector in GCP
3. Configure services to use OTel provider
4. Create dashboards for monitoring

## Package Structure

```
zebra-client/
├── packages/
│   ├── core/                    # @temp-genie/zebra-client
│   │   ├── src/
│   │   │   ├── index.ts         # Main exports
│   │   │   ├── client.ts        # ZebraClient class
│   │   │   ├── api/
│   │   │   │   ├── sensors.ts
│   │   │   │   ├── readings.ts
│   │   │   │   ├── tasks.ts
│   │   │   │   └── alarms.ts
│   │   │   ├── telemetry/
│   │   │   │   ├── types.ts     # TelemetryProvider interface
│   │   │   │   └── noop.ts      # NoopTelemetryProvider
│   │   │   ├── retry.ts         # Retry logic
│   │   │   └── types.ts         # Shared types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── otel/                    # @temp-genie/zebra-client-otel
│       ├── src/
│       │   ├── index.ts
│       │   └── provider.ts      # OTelTelemetryProvider
│       ├── package.json         # peer deps: @opentelemetry/*
│       └── tsconfig.json
│
├── package.json                 # Workspace root
├── tsconfig.json
└── README.md
```

## Testing & Mockability

This package is designed with test-driven development in mind. Consumers should be able to easily mock the Zebra client in their tests without making real API calls.

### Testing Subpath Export

The package exposes testing utilities via a dedicated subpath:

```typescript
// In consumer tests
import { MockZebraClient, createMockReadingsResponse } from '@temp-genie/zebra-client/testing';
```

### Package.json Exports

```json
{
  "name": "@temp-genie/zebra-client",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./testing": {
      "types": "./dist/testing/index.d.ts",
      "default": "./dist/testing/index.js"
    }
  }
}
```

### MockZebraClient

A fully mockable client implementation with call tracking:

```typescript
// testing/mock-client.ts
export interface MockCall {
  method: string;
  args: unknown[];
  timestamp: number;
  result?: unknown;
  error?: Error;
}

export class MockZebraClient implements ZebraClientInterface {
  private _calls: MockCall[] = [];

  // Configurable mock responses
  public mockResponses: {
    readings: {
      getLog?: ZebraReadingsResponse | Error;
    };
    sensors: {
      getStatus?: SensorStatus | Error;
      list?: SensorListResponse | Error;
    };
    tasks: {
      create?: Task | Error;
      stop?: void | Error;
      get?: Task | Error;
    };
    alarms: {
      list?: AlarmsResponse | Error;
    };
  } = {
    readings: {},
    sensors: {},
    tasks: {},
    alarms: {},
  };

  // Call tracking
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

  // API implementations
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

  tasks = {
    create: async (options: CreateTaskOptions): Promise<Task> => {
      const response = this.mockResponses.tasks.create;
      this._calls.push({
        method: 'tasks.create',
        args: [options],
        timestamp: Date.now(),
        result: response instanceof Error ? undefined : response,
        error: response instanceof Error ? response : undefined,
      });

      if (response instanceof Error) throw response;
      if (!response) throw new Error('No mock response configured for tasks.create');
      return response;
    },

    stop: async (taskId: string): Promise<void> => {
      const response = this.mockResponses.tasks.stop;
      this._calls.push({
        method: 'tasks.stop',
        args: [taskId],
        timestamp: Date.now(),
        error: response instanceof Error ? response : undefined,
      });

      if (response instanceof Error) throw response;
    },

    get: async (taskId: string): Promise<Task> => {
      const response = this.mockResponses.tasks.get;
      this._calls.push({
        method: 'tasks.get',
        args: [taskId],
        timestamp: Date.now(),
        result: response instanceof Error ? undefined : response,
        error: response instanceof Error ? response : undefined,
      });

      if (response instanceof Error) throw response;
      if (!response) throw new Error('No mock response configured for tasks.get');
      return response;
    },
  };

  alarms = {
    list: async (options: ListAlarmsOptions): Promise<AlarmsResponse> => {
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
```

### Factory Functions

Pre-built factories for creating mock responses:

```typescript
// testing/factories.ts

/**
 * Create a mock readings response
 */
export function createMockReadingsResponse(
  overrides: Partial<ZebraReadingsResponse> = {}
): ZebraReadingsResponse {
  return {
    sensors_readings: [
      {
        id: 'reading-1',
        sensor_id: 'ZEB-001',
        occurred: new Date().toISOString(),
        temperature: 4.5,
        humidity: 65,
        battery_level: 95,
        signal_strength: -45,
      },
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

/**
 * Create a mock reading
 */
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

/**
 * Create a mock sensor status
 */
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

/**
 * Create a mock alarms response
 */
export function createMockAlarmsResponse(
  overrides: Partial<AlarmsResponse> = {}
): AlarmsResponse {
  return {
    alarms: [],
    page_response: {
      total_pages: 1,
      page_size: 50,
      current_page: 0,
    },
    ...overrides,
  };
}

/**
 * Create a mock alarm
 */
export function createMockAlarm(
  overrides: Partial<ZebraAlarm> = {}
): ZebraAlarm {
  return {
    id: `alarm-${Date.now()}`,
    sensor_id: 'ZEB-001',
    task_id: 'task-123',
    alarm_type: 'HIGH_TEMPERATURE',
    triggered_at: new Date().toISOString(),
    threshold_value: 8.0,
    actual_value: 10.5,
    resolved: false,
    ...overrides,
  };
}

/**
 * Create a mock task
 */
export function createMockTask(
  overrides: Partial<Task> = {}
): Task {
  return {
    id: `task-${Date.now()}`,
    sensor_id: 'ZEB-001',
    status: 'active',
    created_at: new Date().toISOString(),
    thresholds: {
      min_temperature: 2.0,
      max_temperature: 8.0,
    },
    ...overrides,
  };
}

/**
 * Create multiple readings for pagination testing
 */
export function createMockReadingsBatch(
  count: number,
  baseOptions: Partial<ZebraReading> = {}
): ZebraReading[] {
  return Array.from({ length: count }, (_, i) =>
    createMockReading({
      id: `reading-${i + 1}`,
      occurred: new Date(Date.now() - i * 60000).toISOString(), // 1 minute apart
      ...baseOptions,
    })
  );
}
```

### Preset Factories

Common test scenarios with pre-configured mocks:

```typescript
// testing/presets.ts

/**
 * Create a MockZebraClient pre-configured for successful readings flow
 */
export function createSuccessfulReadingsClient(): MockZebraClient {
  const client = new MockZebraClient();
  client.mockResponses.readings.getLog = createMockReadingsResponse({
    sensors_readings: createMockReadingsBatch(10),
  });
  return client;
}

/**
 * Create a MockZebraClient pre-configured for paginated readings
 */
export function createPaginatedReadingsClient(
  totalPages: number
): MockZebraClient {
  const client = new MockZebraClient();
  let currentPage = 0;

  // Override getLog to return paginated responses
  const originalGetLog = client.readings.getLog;
  client.readings.getLog = async (options) => {
    currentPage++;
    const hasMore = currentPage < totalPages;

    client.mockResponses.readings.getLog = createMockReadingsResponse({
      sensors_readings: createMockReadingsBatch(100),
      cursor: hasMore ? `cursor-page-${currentPage + 1}` : undefined,
      page_response: {
        total_pages: totalPages,
        page_size: 100,
        current_page: currentPage,
      },
    });

    return originalGetLog.call(client.readings, options);
  };

  return client;
}

/**
 * Create a MockZebraClient that simulates rate limiting
 */
export function createRateLimitedClient(
  failCount: number = 2
): MockZebraClient {
  const client = new MockZebraClient();
  let attempts = 0;

  const originalGetLog = client.readings.getLog;
  client.readings.getLog = async (options) => {
    attempts++;
    if (attempts <= failCount) {
      const error = new Error('Rate limited') as Error & { statusCode: number };
      error.statusCode = 429;
      throw error;
    }

    client.mockResponses.readings.getLog = createMockReadingsResponse();
    return originalGetLog.call(client.readings, options);
  };

  return client;
}

/**
 * Create a MockZebraClient for error scenarios
 */
export function createErrorClient(
  errorMessage: string = 'API Error',
  statusCode: number = 500
): MockZebraClient {
  const client = new MockZebraClient();
  const error = new Error(errorMessage) as Error & { statusCode: number };
  error.statusCode = statusCode;

  client.mockResponses.readings.getLog = error;
  client.mockResponses.sensors.getStatus = error;
  client.mockResponses.sensors.list = error;
  client.mockResponses.tasks.create = error;
  client.mockResponses.tasks.get = error;
  client.mockResponses.alarms.list = error;

  return client;
}
```

### Testing Module Exports

```typescript
// testing/index.ts
export { MockZebraClient, type MockCall } from './mock-client';
export {
  createMockReadingsResponse,
  createMockReading,
  createMockReadingsBatch,
  createMockSensorStatus,
  createMockAlarmsResponse,
  createMockAlarm,
  createMockTask,
} from './factories';
export {
  createSuccessfulReadingsClient,
  createPaginatedReadingsClient,
  createRateLimitedClient,
  createErrorClient,
} from './presets';
```

### Example Test Usage

```typescript
// In consumer test file
import { describe, it, expect, beforeEach } from 'vitest';
import {
  MockZebraClient,
  createMockReadingsResponse,
  createSuccessfulReadingsClient
} from '@temp-genie/zebra-client/testing';
import { processSensorPoll } from './sensor-poll-service';

describe('processSensorPoll', () => {
  let mockClient: MockZebraClient;

  beforeEach(() => {
    mockClient = new MockZebraClient();
  });

  it('should fetch and store readings successfully', async () => {
    // Arrange
    mockClient.mockResponses.readings.getLog = createMockReadingsResponse({
      sensors_readings: [
        { id: 'r1', sensor_id: 'ZEB-001', temperature: 4.5, occurred: new Date().toISOString() },
      ],
    });

    // Act
    const result = await processSensorPoll({
      client: mockClient,
      sensorTaskId: 'task-123',
    });

    // Assert
    expect(result.success).toBe(true);
    expect(result.readingsStored).toBe(1);

    // Verify API was called correctly
    expect(mockClient.wasCalled('readings.getLog')).toBe(true);
    const call = mockClient.getLastCall('readings.getLog');
    expect(call?.args[0]).toEqual({ sensorTaskId: 'task-123' });
  });

  it('should handle API errors gracefully', async () => {
    // Arrange
    mockClient.mockResponses.readings.getLog = new Error('API unavailable');

    // Act
    const result = await processSensorPoll({
      client: mockClient,
      sensorTaskId: 'task-123',
    });

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('API unavailable');
  });

  it('should handle paginated responses', async () => {
    // Using preset factory
    mockClient = createPaginatedReadingsClient(3); // 3 pages

    const result = await processSensorPoll({
      client: mockClient,
      sensorTaskId: 'task-123',
    });

    expect(result.success).toBe(true);
    expect(mockClient.getCalls('readings.getLog').length).toBe(3);
  });
});
```

### ZebraClientInterface

For dependency injection, the package exports an interface:

```typescript
// types.ts
export interface ZebraClientInterface {
  readings: ReadingsAPI;
  sensors: SensorsAPI;
  tasks: TasksAPI;
  alarms: AlarmsAPI;
}

// Both ZebraClient and MockZebraClient implement this
```

## CI/CD Workflows

Based on the patterns from `@irly-tech/serverless` (`github.com/irly-tech/serverless`):

### Repository Structure

```
zebra-client/
├── .github/
│   └── workflows/
│       ├── ci.yml           # Test on PR/push
│       ├── release.yml      # Auto-version bump on merge
│       └── publish.yml      # Publish to GitHub Packages
├── packages/
│   ├── core/
│   └── otel/
├── package.json
└── vitest.config.ts
```

### CI Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run tests
        run: npm test -- --coverage

      - name: Build packages
        run: npm run build
```

### Release Workflow (`.github/workflows/release.yml`)

Automatically bumps version on PR merge based on labels:

```yaml
name: Release

on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  release:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Determine version bump
        id: version
        run: |
          if echo "${{ join(github.event.pull_request.labels.*.name, ' ') }}" | grep -q "major"; then
            echo "bump=major" >> $GITHUB_OUTPUT
          elif echo "${{ join(github.event.pull_request.labels.*.name, ' ') }}" | grep -q "minor"; then
            echo "bump=minor" >> $GITHUB_OUTPUT
          else
            echo "bump=patch" >> $GITHUB_OUTPUT
          fi

      - name: Install dependencies
        run: npm ci

      - name: Bump version
        run: |
          npm version ${{ steps.version.outputs.bump }} -m "chore: release v%s"
          git push
          git push --tags
```

### Publish Workflow (`.github/workflows/publish.yml`)

Publishes to GitHub Packages when a release is created:

```yaml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@temp-genie'

      - name: Install dependencies
        run: npm ci

      - name: Build packages
        run: npm run build

      - name: Publish core package
        working-directory: packages/core
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Publish otel package
        working-directory: packages/otel
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### GitHub Packages Configuration

Each package's `package.json` needs (in `github.com/temp-genie/zebra-client`):

```json
{
  "name": "@temp-genie/zebra-client",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/temp-genie/zebra-client.git"
  }
}
```

### Consumer Installation

Consumers (e.g., `github.com/irly-tech/temp-genie`) need `.npmrc` configured:

```
@temp-genie:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## Updated Package Structure

Structure for `github.com/temp-genie/zebra-client`:

```
zebra-client/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── release.yml
│       └── publish.yml
├── packages/
│   ├── core/                    # @temp-genie/zebra-client
│   │   ├── src/
│   │   │   ├── index.ts         # Main exports
│   │   │   ├── client.ts        # ZebraClient class
│   │   │   ├── api/
│   │   │   │   ├── sensors.ts
│   │   │   │   ├── readings.ts
│   │   │   │   ├── tasks.ts
│   │   │   │   └── alarms.ts
│   │   │   ├── telemetry/
│   │   │   │   ├── types.ts     # TelemetryProvider interface
│   │   │   │   └── noop.ts      # NoopTelemetryProvider
│   │   │   ├── testing/         # Testing utilities subpath
│   │   │   │   ├── index.ts     # Testing exports
│   │   │   │   ├── mock-client.ts
│   │   │   │   ├── factories.ts
│   │   │   │   └── presets.ts
│   │   │   ├── retry.ts         # Retry logic
│   │   │   └── types.ts         # Shared types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── otel/                    # @temp-genie/zebra-client-otel
│       ├── src/
│       │   ├── index.ts
│       │   └── provider.ts      # OTelTelemetryProvider
│       ├── package.json         # peer deps: @opentelemetry/*
│       └── tsconfig.json
│
├── package.json                 # Workspace root
├── tsconfig.json
├── vitest.config.ts
├── TESTING.md                   # Testing documentation
└── README.md
```

## Questions to Decide

1. **Package registry**: GitHub Packages (recommended based on serverless pattern)

2. **Monorepo or separate repos?**: Monorepo for easier development

3. **OTel backend**: Where to send telemetry? Options:
   - Google Cloud Trace/Monitoring (native GCP integration)
   - Grafana Cloud
   - Self-hosted Jaeger/Prometheus

4. **Versioning**: Semantic versioning with PR labels (major/minor/patch)

5. **Test framework**: Vitest (aligned with serverless package)

## Next Steps

1. Create the new repo `github.com/temp-genie/zebra-client` with the package structure above
2. Set up CI/CD workflows (ci.yml, release.yml, publish.yml)
3. Implement testing utilities first (MockZebraClient, factories, presets)
4. Write tests for the core client (TDD approach)
5. Implement core client to pass tests
6. Copy and refactor existing Zebra types from `github.com/irly-tech/temp-genie` → `apps/web/lib/api/clients/zebra.ts`
7. Publish initial version to GitHub Packages
8. Integrate into `github.com/irly-tech/temp-genie`
9. (Optional) Add OTel extension

## Reference Files

Key files in `github.com/irly-tech/temp-genie` to reference when implementing:

| File Path | Purpose |
|-----------|---------|
| `apps/web/lib/api/clients/zebra.ts` | Existing Zebra API client with types |
| `gcp/services/process-sensor-poll/src/index.ts` | Sensor polling service with raw fetch calls |
| `gcp/services/process-sensor-poll/src/types.ts` | Type definitions for readings, sensors |
| `gcp/services/process-alarm-check/src/index.ts` | Alarm check service with raw fetch calls |

Key files in `github.com/irly-tech/serverless` to reference for patterns:

| File Path | Purpose |
|-----------|---------|
| `package.json` | Subpath exports configuration |
| `src/testing/index.ts` | Testing module structure |
| `TESTING.md` | Testing documentation |
| `.github/workflows/ci.yml` | CI workflow |
| `.github/workflows/release.yml` | Auto-version bump workflow |
| `.github/workflows/publish.yml` | GitHub Packages publish workflow |
