# Copilot Instructions for Protobuf Test System

## Project Overview

This repository defines a **test system API** using Protocol Buffers, designed for collecting and managing test execution data. The architecture follows event-driven patterns with a centralized observer service.

## Architecture & Components

### 📁 Package Structure

- `testsystem/v1/common/` - Shared types and enums
- `testsystem/v1/entities/` - Core domain models (TestScript, TestSuite)
- `testsystem/v1/events/` - Event messages for test lifecycle
- `testsystem/v1/observer/` - gRPC service definitions

### 🔄 Data Flow

1. **Test Lifecycle Events**: Start → Steps → Finish
2. **Observer Pattern**: All events flow through `TestEventCollector` service
3. **Attachment Strategy**: Small files inline (`bytes`), large files via URI (S3/GCS links)

## Critical Conventions

### Import Patterns

```protobuf
// Always use full paths for local imports
import "testsystem/v1/common/common.proto";
import "testsystem/v1/events/events.proto";

// Use fully qualified type names across packages
testsystem.v1.common.TestStatus status = 2;
repeated testsystem.v1.common.Attachment attachments = 4;
```

### Field Numbering Strategy

- **IDs always field 1**: `string id = 1;` for all entities
- **Names always field 2**: `string name = 2;` for identifiable objects
- **Metadata maps field 5+**: `map<string, string> metadata = 5;`

### Code Generation Setup

Code is generated in corresponding repositories referencing these Protobuf definitions. Follow the established patterns for adding new messages and services.

## Development Workflows

### Protobuf Validation

```bash
# Compile all schemas to validate syntax
protoc --proto_path=. testsystem/v1/**/*.proto

# Generate language bindings
protoc --proto_path=. --go_out=gen/go testsystem/v1/**/*.proto
```

### Schema Evolution Rules

- **Never remove fields** - mark deprecated instead
- **Never change field numbers** - breaks wire compatibility
- **Add new fields with higher numbers**
- **Use `optional` for new fields in existing messages**
