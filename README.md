# Zebra Client Monorepo

This repository contains the official TypeScript packages for interacting with Zebra Savannah APIs, with high-performance telemetry and retry logic built-in.

## 📦 Packages

| Package | Description | Documentation |
| :--- | :--- | :--- |
| [`@irly-tech/zebra-client`](./packages/core) | Core API client for Readings, Sensors, and Alarms. | [README](./packages/core/README.md) |
| [`@irly-tech/zebra-client-otel`](./packages/otel) | OpenTelemetry extension for automated metrics and tracing. | [README](./packages/otel/README.md) |

---

## 🚀 Quick Start

### 1. Installation

Install the core client and optionally the OTel extension:

```bash
npm install @irly-tech/zebra-client @irly-tech/zebra-client-otel
```

### 2. Basic Usage

```typescript
import { ZebraClient } from '@irly-tech/zebra-client';
import { OTelTelemetryProvider } from '@irly-tech/zebra-client-otel';

const zebra = new ZebraClient({
  apiKey: process.env.ZEBRA_API_KEY,
  telemetryProvider: new OTelTelemetryProvider() // Optional: records metrics/traces
});

// Example: List all sensors
const { sensors } = await zebra.sensors.list();
console.log(`Found ${sensors.length} sensors`);
```

---

## 📂 Repository Sitemap

*   **[Core Package Reference](./packages/core/README.md)**
    *   [Configuration Options](./packages/core/README.md#configuration) - Retries, Timeouts, and Fetch.
    *   [Testing Utilities](./packages/core/README.md#testing) - Using `MockZebraClient` and factories.
*   **[OTel Extension Reference](./packages/otel/README.md)**
    *   [GCP / Cloud Trace Integration](./packages/otel/README.md#google-cloud--vendor-integration) - How to export to Google Cloud.
    *   [Metrics Dictionary](./packages/otel/README.md#metrics-recorded) - List of all captured metrics.

---

## 🛠 Development

This repository uses **npm workspaces** and **TypeScript Project References**.

### Build
To build all packages in the correct order:
```bash
npm run build
```

### Test
To run all unit tests:
```bash
npm test
```

## License

UNLICENSED
