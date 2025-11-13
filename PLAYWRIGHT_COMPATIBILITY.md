# Playwright Compatibility Guide

This document describes the protobuf schema enhancements made to support Playwright test framework integration.

## Overview

The protobuf messages in this repository define an observer-based test event collection system. The schema has been enhanced to fully support Playwright's reporter API, enabling seamless integration between Playwright test runners and the observer service.

## Enhanced Schema Elements

### 1. TestStatus Enum (common.proto)

**Added Status Values:**
- `TIMEDOUT = 5` - Test execution exceeded configured timeout
- `INTERRUPTED = 6` - Test execution was interrupted (e.g., user cancellation)

**Mapping to Playwright:**
- `PASSED` ← 'passed'
- `FAILED` ← 'failed'
- `SKIPPED` ← 'skipped'
- `TIMEDOUT` ← 'timedOut'
- `INTERRUPTED` ← 'interrupted'
- `BROKEN` - Reserved for internal errors

### 2. TestCaseRun Message (test_case.proto)

**New Fields:**

| Field | Type | Number | Description | Playwright Mapping |
|-------|------|--------|-------------|-------------------|
| `duration` | google.protobuf.Duration | 14 | Test execution duration | `result.duration` |
| `retry_count` | int32 | 15 | Total retry attempts allowed | `test.retries` |
| `retry_index` | int32 | 16 | Current retry attempt (0-based) | `result.retry` |
| `timeout` | int32 | 17 | Timeout in milliseconds | `test.timeout` |

**Usage Example:**
```javascript
// In Playwright reporter onTestEnd()
const testCaseRun = {
  id: generateId(),
  test_id: test.id,
  title: test.title,
  status: mapStatus(result.status),
  start_time: { seconds: Math.floor(result.startTime.getTime() / 1000) },
  duration: { seconds: Math.floor(result.duration / 1000) },
  retry_count: test.retries,
  retry_index: result.retry,
  timeout: test.timeout,
  // ... other fields
};
```

### 3. StepRun Message (test_case.proto)

**New Fields:**

| Field | Type | Number | Description | Playwright Mapping |
|-------|------|--------|-------------|-------------------|
| `category` | string | 16 | Step category/type | `step.category` |

**Playwright Step Categories:**
- `hook` - beforeEach, afterEach, beforeAll, afterAll
- `fixture` - Fixture setup/teardown
- `test.step` - Explicit test.step() calls
- `expect` - Assertion steps
- `pw:api` - Playwright API calls (locator, click, etc.)

**Usage Example:**
```javascript
// In Playwright reporter onStepEnd()
const stepRun = {
  id: generateId(),
  test_case_run_id: testCaseRunId,
  title: step.title,
  category: step.category,
  duration: { seconds: Math.floor(step.duration / 1000) },
  status: step.error ? 'FAILED' : 'PASSED',
  // ... other fields
};
```

### 4. TestSuiteSpec & TestSuiteRun Messages (test_suite.proto)

**New Fields:**

| Message | Field | Type | Number | Description | Playwright Mapping |
|---------|-------|------|--------|-------------|-------------------|
| TestSuiteSpec | `project` | string | 13 | Project identifier | `test.parent.project().name` |
| TestSuiteRun | `project_name` | string | 11 | Project name | `suite.project().name` |

**Playwright Projects:**
Projects in Playwright define different test configurations (browsers, devices, viewports):
```javascript
// playwright.config.ts
export default {
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ]
};
```

**Usage Example:**
```javascript
// In Playwright reporter onBegin()
const testSuiteRun = {
  id: generateId(),
  name: suite.title,
  project_name: suite.project().name, // 'chromium', 'firefox', etc.
  start_time: { seconds: Math.floor(Date.now() / 1000) },
  // ... other fields
};
```

### 5. Output Event Messages (events.proto)

**Updated Messages:**

Both `StdOutputEventRequest` and `StdErrorEventRequest` now include:

| Field | Type | Number | Description |
|-------|------|--------|-------------|
| `test_case_run_id` | string | 4 | Links output to specific test run |

**Rationale:**
Playwright can emit stdout/stderr during test execution. This field enables proper association of console output with the specific test run that generated it, which is crucial when:
- Tests run in parallel
- Tests are retried
- Multiple test runs occur in the same suite

**Usage Example:**
```javascript
// Capture stdout during test execution
const stdOutput = {
  test_id: test.id,
  test_case_run_id: currentTestCaseRunId,
  message: consoleMessage.text(),
  timestamp: { seconds: Math.floor(Date.now() / 1000) }
};
```

## Implementation Guide for Playwright Reporter

### Basic Reporter Structure

```javascript
class ObserverReporter {
  constructor(client) {
    this.client = client; // gRPC client to TestEventCollector service
    this.suiteRunMap = new Map();
    this.testCaseRunMap = new Map();
  }

  async onBegin(config, suite) {
    // Report suite begin for each project
    for (const project of config.projects) {
      const suiteRun = {
        id: generateId(),
        name: suite.title || 'Root Suite',
        project_name: project.name,
        start_time: timestampNow(),
      };
      await this.client.ReportSuiteBegin({ suite: suiteRun });
      this.suiteRunMap.set(project.name, suiteRun.id);
    }
  }

  async onTestBegin(test, result) {
    const testCaseRun = {
      id: generateId(),
      test_id: test.id,
      test_suite_run_id: this.suiteRunMap.get(test.parent.project().name),
      title: test.title,
      start_time: timestampFromDate(result.startTime),
      retry_count: test.retries,
      retry_index: result.retry,
      timeout: test.timeout,
    };
    await this.client.ReportTestBegin({ test_case: testCaseRun });
    this.testCaseRunMap.set(test.id, testCaseRun.id);
  }

  async onStepBegin(test, result, step) {
    const stepRun = {
      id: generateId(),
      test_case_run_id: this.testCaseRunMap.get(test.id),
      title: step.title,
      category: step.category,
      start_time: timestampNow(),
    };
    await this.client.ReportStepBegin({ step: stepRun });
  }

  async onStepEnd(test, result, step) {
    const stepRun = {
      id: generateId(),
      test_case_run_id: this.testCaseRunMap.get(test.id),
      title: step.title,
      category: step.category,
      duration: durationFromMs(step.duration),
      status: step.error ? 'FAILED' : 'PASSED',
      error: step.error?.message,
    };
    await this.client.ReportStepEnd({ step: stepRun });
  }

  async onTestEnd(test, result) {
    const testCaseRun = {
      id: this.testCaseRunMap.get(test.id),
      test_id: test.id,
      title: test.title,
      status: this.mapStatus(result.status),
      duration: durationFromMs(result.duration),
      error_message: result.error?.message,
      stack_trace: result.error?.stack,
      errors: result.errors.map(e => e.message),
      attachments: await this.mapAttachments(result.attachments),
    };
    await this.client.ReportTestEnd({ test_case: testCaseRun });
  }

  async onEnd(result) {
    // Report suite end for each project
    for (const [projectName, suiteRunId] of this.suiteRunMap) {
      const suiteRun = {
        id: suiteRunId,
        name: 'Root Suite',
        project_name: projectName,
        end_time: timestampNow(),
        status: result.status === 'passed' ? 'PASSED' : 'FAILED',
      };
      await this.client.ReportSuiteEnd({ suite: suiteRun });
    }
  }

  mapStatus(playwrightStatus) {
    const statusMap = {
      'passed': 'PASSED',
      'failed': 'FAILED',
      'timedOut': 'TIMEDOUT',
      'skipped': 'SKIPPED',
      'interrupted': 'INTERRUPTED',
    };
    return statusMap[playwrightStatus] || 'UNKNOWN';
  }

  async mapAttachments(attachments) {
    return Promise.all(attachments.map(async att => ({
      name: att.name,
      mime_type: att.contentType,
      // Use content for small attachments, uri for large ones
      ...(att.body ? { content: att.body } : { uri: att.path })
    })));
  }
}
```

### Helper Functions

```javascript
function timestampNow() {
  return { seconds: Math.floor(Date.now() / 1000) };
}

function timestampFromDate(date) {
  return { seconds: Math.floor(date.getTime() / 1000) };
}

function durationFromMs(ms) {
  return { seconds: Math.floor(ms / 1000) };
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

## Backward Compatibility

All schema changes maintain backward compatibility:

1. **New enum values** - Old clients ignore unknown values, default to UNKNOWN
2. **New message fields** - All new fields use higher field numbers (14+)
3. **Optional fields** - All new fields are implicitly optional in proto3
4. **Existing fields** - No changes to field numbers, types, or semantics

## Testing Recommendations

When implementing a Playwright reporter:

1. **Test different status types** - Verify all status mappings (passed, failed, timedOut, skipped, interrupted)
2. **Test retries** - Ensure retry_count and retry_index are correctly populated
3. **Test projects** - Verify project information flows correctly for multi-project configurations
4. **Test steps** - Check step categories (hooks, fixtures, test.step, pw:api)
5. **Test output** - Verify stdout/stderr events include test_case_run_id
6. **Test attachments** - Handle both inline content and URI-based attachments
7. **Test parallel execution** - Ensure proper event sequencing with parallel tests

## Additional Resources

- [Playwright Reporter API](https://playwright.dev/docs/api/class-reporter)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Protocol Buffers Style Guide](https://protobuf.dev/programming-guides/style/)
