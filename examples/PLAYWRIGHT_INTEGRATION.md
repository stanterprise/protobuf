# Playwright Integration Example

This example demonstrates how to implement a custom Playwright reporter that integrates with the TestEventCollector service.

## Prerequisites

```bash
npm install @playwright/test @grpc/grpc-js @grpc/proto-loader
```

## Project Structure

```
playwright-reporter/
├── src/
│   ├── reporter.js         # Main reporter implementation
│   ├── client.js           # gRPC client wrapper
│   └── mappers.js          # Data mapping utilities
├── proto/                  # Copy of protobuf definitions
│   └── testsystem/
└── playwright.config.ts    # Playwright configuration
```

## Implementation

### 1. gRPC Client Setup (client.js)

```javascript
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

class TestEventClient {
  constructor(serverAddress = "localhost:50051") {
    const PROTO_PATH = path.join(
      __dirname,
      "../proto/testsystem/v1/observer/observer.proto"
    );

    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [path.join(__dirname, "../proto")],
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    const testSystemProto = protoDescriptor.testsystem.v1.observer;

    this.client = new testSystemProto.TestEventCollector(
      serverAddress,
      grpc.credentials.createInsecure()
    );
  }

  reportTestBegin(request) {
    return new Promise((resolve, reject) => {
      this.client.ReportTestBegin(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  reportTestEnd(request) {
    return new Promise((resolve, reject) => {
      this.client.ReportTestEnd(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  // ... other methods
}

module.exports = TestEventClient;
```

### 2. Data Mappers (mappers.js)

```javascript
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function timestampFromDate(date) {
  const ms = date.getTime();
  return {
    seconds: Math.floor(ms / 1000),
    nanos: (ms % 1000) * 1000000,
  };
}

function durationFromMs(ms) {
  return {
    seconds: Math.floor(ms / 1000),
    nanos: (ms % 1000) * 1000000,
  };
}

function mapStatus(playwrightStatus) {
  const statusMap = {
    passed: "PASSED",
    failed: "FAILED",
    timedOut: "TIMEDOUT",
    skipped: "SKIPPED",
    interrupted: "INTERRUPTED",
  };
  return statusMap[playwrightStatus] || "UNKNOWN";
}

module.exports = {
  generateId,
  timestampFromDate,
  durationFromMs,
  mapStatus,
};
```

### 3. Main Reporter (reporter.js)

```javascript
const TestEventClient = require("./client");
const {
  generateId,
  timestampFromDate,
  durationFromMs,
  mapStatus,
} = require("./mappers");

class ObserverReporter {
  constructor(options = {}) {
    this.client = new TestEventClient(options.serverAddress);
    this.runId = generateId();
    this.suiteRunMap = new Map();
    this.testCaseRunMap = new Map();
  }

  async onTestBegin(test, result) {
    const testCaseRunId = generateId();
    const projectName = test.parent.project().name;

    const testCaseRun = {
      id: testCaseRunId,
      test_id: test.id,
      run_id: this.runId,
      test_suite_run_id: this.suiteRunMap.get(projectName),
      title: test.title,
      status: "UNKNOWN",
      start_time: timestampFromDate(result.startTime),
      retry_count: test.retries,
      retry_index: result.retry,
      timeout: test.timeout,
      metadata: {
        file: test.location.file,
        project: projectName,
      },
    };

    await this.client.reportTestBegin({ test_case: testCaseRun });
    this.testCaseRunMap.set(test.id, testCaseRunId);
  }

  async onTestEnd(test, result) {
    const testCaseRunId = this.testCaseRunMap.get(test.id);

    const testCaseRun = {
      id: testCaseRunId,
      test_id: test.id,
      title: test.title,
      status: mapStatus(result.status),
      duration: durationFromMs(result.duration),
      error_message: result.error?.message || "",
      errors: result.errors.map((e) => e.message),
      retry_count: test.retries,
      retry_index: result.retry,
    };

    await this.client.reportTestEnd({ test_case: testCaseRun });
  }

  // Implement other methods: onBegin, onEnd, onStepBegin, onStepEnd
}

module.exports = ObserverReporter;
```

### 4. Playwright Configuration

```typescript
import { defineConfig, devices } from "@playwright/test";
import ObserverReporter from "./src/reporter";

export default defineConfig({
  reporter: [
    ["list"],
    [ObserverReporter, { serverAddress: "localhost:50051" }],
  ],

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
```

## Key Features Mapped

| Playwright Feature | Protobuf Field                         | Description                      |
| ------------------ | -------------------------------------- | -------------------------------- |
| result.status      | TestCaseRun.status                     | Uses TIMEDOUT, INTERRUPTED enums |
| result.duration    | TestCaseRun.duration                   | Test execution time              |
| test.retries       | TestCaseRun.retry_count                | Max retry attempts               |
| result.retry       | TestCaseRun.retry_index                | Current retry number             |
| test.timeout       | TestCaseRun.timeout                    | Test timeout in ms               |
| step.category      | StepRun.category                       | hook, fixture, test.step         |
| project.name       | TestSuiteRun.project                   | Browser/device config            |
| suite hierarchy    | TestSuiteRun.type                      | ROOT, PROJECT, or SUBSUITE       |
| console output     | StdOutputEventRequest.test_case_run_id | Links output to test             |

## Running

```bash
npx playwright test
```

For complete implementation, see PLAYWRIGHT_COMPATIBILITY.md
