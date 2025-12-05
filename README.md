# Test System Protobuf Definitions

Protocol Buffer definitions for a test event collection and observation system designed to work with major testing frameworks.

## Overview

This repository defines a gRPC-based API for collecting and managing test execution data. The system follows an observer pattern where test runners (clients) report events to a centralized observer service.

## Architecture

```
┌─────────────────┐
│  Test Runners   │  (Playwright, Jest, Cypress, etc.)
│   (Reporters)   │
└────────┬────────┘
         │ gRPC Events
         ↓
┌─────────────────┐
│    Observer     │
│     Service     │
│ (TestEventCollector)
└─────────────────┘
```

## Directory Structure

```
testsystem/v1/
├── common/
│   └── common.proto          # Shared types (TestStatus, Attachment)
├── entities/
│   ├── test_case.proto       # Test case and step definitions
│   └── test_suite.proto      # Test suite definitions
├── events/
│   └── events.proto          # Event messages for lifecycle
└── observer/
    └── observer.proto        # gRPC service definition
```

## Core Concepts

### Test Lifecycle

1. **Suite Begin** → Multiple tests → **Suite End**
2. **Test Begin** → Multiple steps → **Test End**
3. **Step Begin** → Execution → **Step End**

### Key Messages

- **TestCaseRun**: Represents a single test execution with status, duration, retries, timeout, and attachments (19 fields)
- **StepRun**: Represents a test step with category (hook, fixture, test.step), duration, status, and error tracking (16 fields)
- **TestSuiteRun**: Represents a test suite execution with type (ROOT/PROJECT/SUBSUITE), project information, and aggregated results (20 fields)
- **Attachment**: Test artifacts (screenshots, videos, traces) with inline bytes or URI-based storage

### Status Values

- `PASSED` - Test succeeded
- `FAILED` - Test failed with assertion error
- `SKIPPED` - Test was skipped
- `TIMEDOUT` - Test exceeded timeout
- `INTERRUPTED` - Test was interrupted
- `BROKEN` - Internal error

## Framework Compatibility

### ✅ Playwright (Fully Supported)

Complete integration with Playwright's reporter API:

- All test statuses (including timedOut, interrupted)
- Test retries and timeout tracking
- Step categories (hooks, fixtures, test.step)
- Project configurations (browsers/devices)
- Console output linking to test runs

See [PLAYWRIGHT_COMPATIBILITY.md](PLAYWRIGHT_COMPATIBILITY.md) for detailed integration guide.

### ⚠️ Other Frameworks (Well Supported)

The schema also supports Jest, Mocha, Cypress, and other testing frameworks with varying levels of feature coverage. See [SCHEMA_ANALYSIS.md](SCHEMA_ANALYSIS.md) for framework compatibility matrix.

## Usage

### 1. Clone the Repository

```bash
git clone https://github.com/stanterprise/protobuf.git
cd protobuf
```

### 2. Generate Code for Your Language

#### Go

```bash
protoc --proto_path=. \
  --go_out=gen/go \
  --go-grpc_out=gen/go \
  testsystem/v1/**/*.proto
```

#### TypeScript/JavaScript

```bash
protoc --proto_path=. \
  --js_out=import_style=commonjs:gen/js \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:gen/js \
  testsystem/v1/**/*.proto
```

#### Python

```bash
python -m grpc_tools.protoc --proto_path=. \
  --python_out=gen/python \
  --grpc_python_out=gen/python \
  testsystem/v1/**/*.proto
```

### 3. Implement a Reporter

See [examples/PLAYWRIGHT_INTEGRATION.md](examples/PLAYWRIGHT_INTEGRATION.md) for a complete Playwright reporter implementation.

## gRPC Service

The `TestEventCollector` service provides these RPC methods:

```protobuf
service TestEventCollector {
  rpc ReportSuiteBegin(SuiteBeginEventRequest) returns (AckResponse);
  rpc ReportSuiteEnd(SuiteEndEventRequest) returns (AckResponse);
  rpc ReportTestBegin(TestBeginEventRequest) returns (AckResponse);
  rpc ReportTestEnd(TestEndEventRequest) returns (AckResponse);
  rpc ReportStepBegin(StepBeginEventRequest) returns (AckResponse);
  rpc ReportStepEnd(StepEndEventRequest) returns (AckResponse);
  rpc ReportTestFailure(TestFailureEventRequest) returns (AckResponse);
  rpc ReportTestError(TestErrorEventRequest) returns (AckResponse);
  rpc ReportStdOutput(StdOutputEventRequest) returns (AckResponse);
  rpc ReportStdError(StdErrorEventRequest) returns (AckResponse);
  rpc Heartbeat(HeartbeatEventRequest) returns (AckResponse);
}
```

## Key Features

### Test Lifecycle Management

- Complete test execution tracking from suite begin to suite end
- Hierarchical test organization (ROOT → PROJECT → SUBSUITE)
- Support for test retries and timeout configuration
- Detailed step tracking with categories (hooks, fixtures, test.step)

### Framework Integration

- **Playwright**: Full native support for all reporter API features
- **Jest/Mocha/Cypress**: Well supported with comprehensive event mapping
- **Universal Design**: Compatible with any test framework through flexible event model

### Attachment Handling

- Small files: Inline `bytes` payload for quick access
- Large files: `uri` field for external storage (S3, GCS, etc.)
- Support for screenshots, videos, traces, logs, and custom artifacts

## Backward Compatibility

✅ **Guaranteed Backward Compatibility**

- New fields use higher field numbers
- All new fields are optional
- No existing fields modified or removed
- Wire format remains compatible

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Ensure backward compatibility
5. Submit a pull request

### Schema Evolution Rules

- ❌ Never remove or renumber existing fields
- ❌ Never change field types
- ✅ Add new fields with higher numbers
- ✅ Mark deprecated fields (don't remove)
- ✅ Use optional for new fields

## License

See [LICENSE](LICENSE) file for details.

## Resources

- [Protocol Buffers Guide](https://protobuf.dev/)
- [gRPC Documentation](https://grpc.io/docs/)
- [Playwright Reporter API](https://playwright.dev/docs/api/class-reporter)

## Support

For issues or questions:

- Open an issue on GitHub
- Review existing documentation
- Check example implementations
