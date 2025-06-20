# Makefile for generating gRPC code from .proto files

# Variables
PROTO_DIR := testsystem
PROTO_FILES := $(wildcard $(PROTO_DIR)/*.proto)
GO_OUT_DIR := gen/go
PY_OUT_DIR := gen/python
TS_OUT_DIR := npm/lib
JAVA_OUT_DIR := gen/java

# Protobuf compiler
PROTOC := protoc

# Plugins
GO_PLUGIN := protoc-gen-go
GO_GRPC_PLUGIN := protoc-gen-go-grpc
PYTHON_PLUGIN := grpc_python_plugin
TS_PLUGIN := protoc-gen-ts
JAVA_GRPC_PLUGIN := protoc-gen-grpc-java

# Paths to plugins
GO_PLUGIN_PATH := $(shell which $(GO_PLUGIN))
GO_GRPC_PLUGIN_PATH := $(shell which $(GO_GRPC_PLUGIN))
TS_PLUGIN_PATH := $(shell which $(TS_PLUGIN))
JAVA_GRPC_PLUGIN_PATH := $(JAVA_GRPC_PLUGIN)

# Default target
all: go python ts # java

# Generate Go code
go:
	mkdir -p $(GO_OUT_DIR)
	$(PROTOC) \
		--proto_path=$(PROTO_DIR) \
		--go_out=$(GO_OUT_DIR) \
		--go_opt=module=github.com/stanterprise/protobuf/gen/go \
		--go-grpc_out=$(GO_OUT_DIR) \
		--go-grpc_opt=module=github.com/stanterprise/protobuf/gen/go \
		$(PROTO_FILES)

# Generate Python code
python:
	mkdir -p $(PY_OUT_DIR)
	python -m grpc_tools.protoc \
		--proto_path=$(PROTO_DIR) \
		--python_out=$(PY_OUT_DIR) \
		--grpc_python_out=$(PY_OUT_DIR) \
		$(PROTO_FILES)

# Generate TypeScript code
ts:
	mkdir -p $(TS_OUT_DIR)
	npx protoc \
		--ts_out=$(TS_OUT_DIR) \
		--ts_opt long_type_string \
		--ts_opt optimize_code_size \
		--proto_path=$(PROTO_DIR) \
		${PROTO_FILES}

# Generate Java code
# java:
# 	mkdir -p $(JAVA_OUT_DIR)
# 	$(PROTOC) \
# 		--proto_path=$(PROTO_DIR) \
# 		--java_out=$(JAVA_OUT_DIR) \
# 		--plugin=protoc-gen-grpc-java=$(JAVA_GRPC_PLUGIN_PATH) \
# 		--grpc-java_out=$(JAVA_OUT_DIR) \
# 		$(PROTO_FILES)

# Clean generated code
clean:
	rm -rf gen/go/testsystem
	rm -rf gen/python/testsystem

# Help
help:
	@echo "Usage:"
	@echo "  make all      - Generate code for all languages"
	@echo "  make go       - Generate Go code"
	@echo "  make python   - Generate Python code"
	@echo "  make ts       - Generate TypeScript code"
	@echo "  make java     - Generate Java code"
	@echo "  make clean    - Remove generated code"