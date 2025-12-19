# @irly-tech/zebra-client-otel

OpenTelemetry extension for `@irly-tech/zebra-client`. Automatically tracks API request durations, counts, errors, and retries.

## Installation

```bash
npm install @irly-tech/zebra-client @irly-tech/zebra-client-otel
```

## Usage

Simply instantiate the `OTelTelemetryProvider` and pass it to your `ZebraClient`.

```typescript
import { ZebraClient } from '@irly-tech/zebra-client';
import { OTelTelemetryProvider } from '@irly-tech/zebra-client-otel';

const zebra = new ZebraClient({
  apiKey: 'your-api-key',
  telemetryProvider: new OTelTelemetryProvider({
    // optional configuration
    metricPrefix: 'zebra_api_', 
    defaultAttributes: { 'service.name': 'my-app' }
  })
});
```

## Google Cloud / Vendor Integration

This package uses the standard `@opentelemetry/api`. To send data to Google Cloud (GCP) or any other provider, simply configure your OpenTelemetry SDK with the appropriate exporter.

### GCP Example

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { MetricExporter } from '@google-cloud/opentelemetry-cloud-monitoring-exporter';
import { OTelTelemetryProvider } from '@irly-tech/zebra-client-otel';

// Configure the SDK
const sdk = new NodeSDK({
  traceExporter: new TraceExporter(),
  metricExporter: new MetricExporter(),
});
sdk.start();

// The provider will automatically use the global SDK configuration
const telemetryProvider = new OTelTelemetryProvider();
```

## Metrics Recorded

- `zebra_client_requests_total`: Counter of all requests sent.
- `zebra_client_request_duration_ms`: Histogram of request latency.
- `zebra_client_errors_total`: Counter of non-2xx responses.
- `zebra_client_rate_limits_total`: Counter of 429 responses.
- `zebra_client_retries_total`: Counter of retry attempts.

## License

UNLICENSED
