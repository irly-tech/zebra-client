# @irly-tech/zebra-client

A type-safe TypeScript client for interacting with Zebra Savannah APIs (v2).

## Features

- **Type-safe API**: Full TypeScript support for Sensors, Readings, and Alarms.
- **Automatic Retries**: Built-in exponential backoff for `429` (Rate Limit) and `5xx` (Server Error) responses.
- **Configurable**: Customize timeouts, retry strategies, and base URLs.
- **Pluggable Telemetry**: Opt-in support for OpenTelemetry via `@irly-tech/zebra-client-otel`.
- **Testing Utilities**: Includes a `MockZebraClient` and factory functions for easy testing.

## Installation

```bash
npm install @irly-tech/zebra-client
```

## Basic Usage

```typescript
import { ZebraClient } from '@irly-tech/zebra-client';

const zebra = new ZebraClient({
  apiKey: 'your-api-key',
});

// List all sensors
const { sensors } = await zebra.sensors.list();

// Get readings for a specific sensor
const { sensors_readings } = await zebra.readings.getLog({
  serialNumber: 'ZEB-12345',
  start_date: '2023-12-01T00:00:00Z',
});
```

## Configuration

The client is highly configurable:

```typescript
const client = new ZebraClient({
  apiKey: '...',
  baseUrl: 'https://api.zebra.com/v2', // optional, defaults to v2
  timeoutMs: 30000,                   // optional, defaults to 30s
  retry: {
    maxRetries: 3,           // default: 3
    initialDelayMs: 1000,    // default: 1s
    maxDelayMs: 30000,       // default: 30s
    backoffMultiplier: 2,    // default: 2 (exponential)
  }
});
```

## Testing

This package exports a dedicated testing module to help you mock Zebra API calls in your own tests.

```typescript
import { MockZebraClient, createMockReading } from '@irly-tech/zebra-client/testing';

const mockClient = new MockZebraClient();

// Setup mock response
mockClient.mockResponses.readings.getLog = {
  sensors_readings: [createMockReading({ temperature: 4.5 })],
  page_response: { total_pages: 1, page_size: 100, current_page: 0 }
};

// Use it like a real client
const readings = await mockClient.readings.getLog({ serialNumber: 'TEST' });
```

## License

UNLICENSED
