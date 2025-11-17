# Schema Analysis Summary

## Purpose
This document provides an analysis of the protobuf schema changes made to support Playwright and other major testing frameworks.

## Changes Overview

### 1. Enhanced TestStatus Enum
**File:** `testsystem/v1/common/common.proto`

**Changes:**
- Added `TIMEDOUT = 5` - for tests that exceed timeout limits
- Added `INTERRUPTED = 6` - for tests interrupted during execution

**Impact:**
- Enables accurate status reporting from Playwright tests
- Compatible with Playwright's status values: 'passed', 'failed', 'timedOut', 'skipped', 'interrupted'
- Backward compatible - old clients will treat unknown values as UNKNOWN

### 2. Enhanced TestCaseRun Message
**File:** `testsystem/v1/entities/test_case.proto`

**Changes:**
```protobuf
google.protobuf.Duration duration = 14;  // Duration of the test execution
int32 retry_count = 15;                  // Total number of retry attempts allowed
int32 retry_index = 16;                  // Current retry attempt index (0 for first)
int32 timeout = 17;                      // Timeout in milliseconds
```

**Impact:**
- `duration`: Captures test execution time (previously only start_time was available)
- `retry_count` & `retry_index`: Supports Playwright's test retry mechanism
- `timeout`: Records timeout configuration per test
- All fields use sequential numbers (14-17) to maintain compatibility

### 3. Enhanced StepRun Message
**File:** `testsystem/v1/entities/test_case.proto`

**Changes:**
```protobuf
string category = 16;  // Category of step (e.g., "hook", "fixture", "test.step")
```

**Impact:**
- Enables differentiation between different step types in Playwright:
  - `hook` - beforeEach, afterEach, beforeAll, afterAll
  - `fixture` - fixture setup/teardown
  - `test.step` - explicit test.step() calls
  - `expect` - assertion steps
  - `pw:api` - Playwright API calls
- Helps with debugging and understanding test execution flow

### 4. Enhanced TestSuiteSpec Message
**File:** `testsystem/v1/entities/test_suite.proto`

**Changes:**
```protobuf
string project = 13;  // Project identifier (e.g., browser/device configuration)
```

**Impact:**
- Supports Playwright's project concept (different browser/device configurations)
- Enables tracking which configuration a suite belongs to
- Example values: 'chromium', 'firefox', 'webkit', 'mobile-chrome', 'tablet-safari'

### 5. Enhanced TestSuiteRun Message
**File:** `testsystem/v1/entities/test_suite.proto`

**Changes:**
```protobuf
string project_name = 11;  // Project name (e.g., browser/device configuration)
```

**Impact:**
- Tracks which project a test run belongs to
- Enables filtering and grouping results by browser/configuration
- Complements TestSuiteSpec.project field

### 6. Enhanced Output Event Messages
**File:** `testsystem/v1/events/events.proto`

**Changes:**
Both `StdOutputEventRequest` and `StdErrorEventRequest` received:
```protobuf
string test_case_run_id = 4;  // Reference to the specific test case run
```

**Impact:**
- Links stdout/stderr output to specific test case runs
- Critical for parallel test execution where multiple tests run simultaneously
- Enables proper output association during test retries
- Helps correlate console output with the test that produced it

## Framework Compatibility Matrix

| Feature | Playwright | Jest | Mocha | Cypress | Status |
|---------|-----------|------|-------|---------|--------|
| Test Statuses | ✅ Full | ✅ Full | ✅ Full | ✅ Full | Complete |
| Test Duration | ✅ Full | ✅ Full | ✅ Full | ✅ Full | Complete |
| Test Retries | ✅ Full | ⚠️ Partial | ⚠️ Partial | ✅ Full | Complete |
| Step Tracking | ✅ Full | ❌ Limited | ❌ Limited | ✅ Full | Complete |
| Step Categories | ✅ Full | ❌ N/A | ❌ N/A | ⚠️ Partial | Complete |
| Project/Config | ✅ Full | ⚠️ Partial | ⚠️ Partial | ⚠️ Partial | Complete |
| Output Linking | ✅ Full | ✅ Full | ✅ Full | ✅ Full | Complete |

Legend:
- ✅ Full: Complete native support
- ⚠️ Partial: Supported via workarounds or limited functionality
- ❌ Limited/N/A: Not applicable or very limited support

## Backward Compatibility

All changes maintain full backward compatibility:

1. **Field Numbering**: All new fields use sequential numbers higher than existing ones
2. **Optional Fields**: All new fields are optional (proto3 default)
3. **Enum Values**: New enum values don't affect existing value mappings
4. **No Breaking Changes**: No existing fields were removed, renamed, or renumbered

### Compatibility Guarantees

- ✅ Old clients can read messages from new servers (ignore unknown fields)
- ✅ New clients can read messages from old servers (treat missing fields as default values)
- ✅ Wire format remains compatible across versions
- ✅ Generated code in Go, Java, TypeScript remains compatible

## Field Number Allocation

Current field number ranges by message:

| Message | Used Range | Available Range | Notes |
|---------|------------|-----------------|-------|
| TestCaseRun | 1-17 | 18+ | Added 14-17 for Playwright |
| StepRun | 1-16 | 17+ | Added 16 for category |
| TestSuiteSpec | 1-13 | 14+ | Added 13 for project |
| TestSuiteRun | 1-11 | 12+ | Added 11 for project_name |
| StdOutputEventRequest | 1-4 | 5+ | Added 4 for test_case_run_id |
| StdErrorEventRequest | 1-4 | 5+ | Added 4 for test_case_run_id |

## Migration Guide

### For Existing Implementations

1. **No Immediate Action Required**: Existing implementations continue to work
2. **Optional Enhancement**: Populate new fields to gain additional functionality
3. **Gradual Adoption**: Can adopt new fields incrementally

### For New Implementations

1. **Use Full Schema**: Leverage all new fields for complete functionality
2. **Follow Guide**: Reference PLAYWRIGHT_COMPATIBILITY.md for implementation patterns
3. **Test Thoroughly**: Validate all status types, retries, and output linking

## Testing Framework Support

### Playwright
**Status**: ✅ **Fully Supported**
- All Playwright reporter API features mapped
- Complete test lifecycle coverage
- Full step tracking with categories
- Project/configuration support
- Retry mechanism fully supported

### Jest
**Status**: ✅ **Well Supported**
- Test lifecycle events covered
- Status mapping complete
- Duration tracking available
- Limited retry support (custom reporters needed)
- Output can be linked via test context

### Mocha
**Status**: ✅ **Well Supported**
- Test lifecycle events covered
- Status mapping (pass/fail/pending → PASSED/FAILED/SKIPPED)
- Hook tracking via step events
- Duration via test.duration
- Metadata via test context

### Cypress
**Status**: ✅ **Well Supported**
- Test lifecycle through plugin events
- Command tracking via step events
- Retry support (experimental)
- Screenshot/video attachments supported
- Browser configuration via metadata

## Future Enhancements

Potential additions for broader framework support:

1. **Test Annotations**: Support for @skip, @only, @flaky decorators
2. **Code Coverage**: Fields for coverage metrics
3. **Performance Metrics**: Memory, CPU usage during test execution
4. **Test Dependencies**: Graph of test dependencies
5. **Parallel Execution**: Worker pool information
6. **Custom Reporters**: Plugin/extension metadata

## Validation

Schema validation can be performed using:

```bash
# Compile all proto files
protoc --proto_path=. \
  --go_out=gen/go \
  --java_out=gen/java \
  --js_out=gen/js \
  testsystem/v1/**/*.proto

# Verify no compilation errors
echo $?  # Should output 0
```

## Documentation

- **PLAYWRIGHT_COMPATIBILITY.md**: Detailed Playwright integration guide
- **Schema Files**: Inline comments in all .proto files
- **This Document**: High-level analysis and change summary

## Conclusion

The schema enhancements successfully address the requirements for Playwright compatibility while maintaining:
- Full backward compatibility
- Clean, extensible design
- Support for other major testing frameworks
- Clear documentation and implementation guides

All changes follow Protocol Buffers best practices and maintain the repository's coding conventions.
