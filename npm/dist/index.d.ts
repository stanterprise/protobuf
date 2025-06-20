import * as _protobuf_ts_runtime from '@protobuf-ts/runtime';
import { MessageType, PartialMessage, IBinaryReader, BinaryReadOptions, IBinaryWriter, BinaryWriteOptions, JsonWriteOptions, JsonValue, JsonReadOptions } from '@protobuf-ts/runtime';
import * as _protobuf_ts_runtime_rpc from '@protobuf-ts/runtime-rpc';
import { ServiceType, RpcOptions, UnaryCall, ServiceInfo, RpcTransport } from '@protobuf-ts/runtime-rpc';

/**
 * Enum for test result statuses
 *
 * @generated from protobuf enum testsystem.common.TestStatus
 */
declare enum TestStatus {
    /**
     * @generated from protobuf enum value: UNKNOWN = 0;
     */
    UNKNOWN = 0,
    /**
     * @generated from protobuf enum value: PASSED = 1;
     */
    PASSED = 1,
    /**
     * @generated from protobuf enum value: FAILED = 2;
     */
    FAILED = 2,
    /**
     * @generated from protobuf enum value: SKIPPED = 3;
     */
    SKIPPED = 3,
    /**
     * @generated from protobuf enum value: BROKEN = 4;
     */
    BROKEN = 4
}
declare class Attachment$Type extends MessageType<Attachment> {
    constructor();
    create(value?: PartialMessage<Attachment>): Attachment;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Attachment): Attachment;
    internalBinaryWrite(message: Attachment, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * Message for attachments
 *
 * @generated from protobuf message testsystem.common.Attachment
 */
interface Attachment {
    /**
     * @generated from protobuf field: string name = 1
     */
    name: string;
    /**
     * @generated from protobuf field: string mime_type = 2
     */
    mimeType: string;
    /**
     * @generated from protobuf field: bytes content = 3
     */
    content: Uint8Array;
}
/**
 * @generated MessageType for protobuf message testsystem.common.Attachment
 */
declare const Attachment: Attachment$Type;

declare class Timestamp$Type extends MessageType<Timestamp> {
    constructor();
    /**
     * Creates a new `Timestamp` for the current time.
     */
    now(): Timestamp;
    /**
     * Converts a `Timestamp` to a JavaScript Date.
     */
    toDate(message: Timestamp): Date;
    /**
     * Converts a JavaScript Date to a `Timestamp`.
     */
    fromDate(date: Date): Timestamp;
    /**
     * In JSON format, the `Timestamp` type is encoded as a string
     * in the RFC 3339 format.
     */
    internalJsonWrite(message: Timestamp, options: JsonWriteOptions): JsonValue;
    /**
     * In JSON format, the `Timestamp` type is encoded as a string
     * in the RFC 3339 format.
     */
    internalJsonRead(json: JsonValue, options: JsonReadOptions, target?: Timestamp): Timestamp;
    create(value?: PartialMessage<Timestamp>): Timestamp;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Timestamp): Timestamp;
    internalBinaryWrite(message: Timestamp, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * A Timestamp represents a point in time independent of any time zone or local
 * calendar, encoded as a count of seconds and fractions of seconds at
 * nanosecond resolution. The count is relative to an epoch at UTC midnight on
 * January 1, 1970, in the proleptic Gregorian calendar which extends the
 * Gregorian calendar backwards to year one.
 *
 * All minutes are 60 seconds long. Leap seconds are "smeared" so that no leap
 * second table is needed for interpretation, using a [24-hour linear
 * smear](https://developers.google.com/time/smear).
 *
 * The range is from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59.999999999Z. By
 * restricting to that range, we ensure that we can convert to and from [RFC
 * 3339](https://www.ietf.org/rfc/rfc3339.txt) date strings.
 *
 * # Examples
 *
 * Example 1: Compute Timestamp from POSIX `time()`.
 *
 *     Timestamp timestamp;
 *     timestamp.set_seconds(time(NULL));
 *     timestamp.set_nanos(0);
 *
 * Example 2: Compute Timestamp from POSIX `gettimeofday()`.
 *
 *     struct timeval tv;
 *     gettimeofday(&tv, NULL);
 *
 *     Timestamp timestamp;
 *     timestamp.set_seconds(tv.tv_sec);
 *     timestamp.set_nanos(tv.tv_usec * 1000);
 *
 * Example 3: Compute Timestamp from Win32 `GetSystemTimeAsFileTime()`.
 *
 *     FILETIME ft;
 *     GetSystemTimeAsFileTime(&ft);
 *     UINT64 ticks = (((UINT64)ft.dwHighDateTime) << 32) | ft.dwLowDateTime;
 *
 *     // A Windows tick is 100 nanoseconds. Windows epoch 1601-01-01T00:00:00Z
 *     // is 11644473600 seconds before Unix epoch 1970-01-01T00:00:00Z.
 *     Timestamp timestamp;
 *     timestamp.set_seconds((INT64) ((ticks / 10000000) - 11644473600LL));
 *     timestamp.set_nanos((INT32) ((ticks % 10000000) * 100));
 *
 * Example 4: Compute Timestamp from Java `System.currentTimeMillis()`.
 *
 *     long millis = System.currentTimeMillis();
 *
 *     Timestamp timestamp = Timestamp.newBuilder().setSeconds(millis / 1000)
 *         .setNanos((int) ((millis % 1000) * 1000000)).build();
 *
 * Example 5: Compute Timestamp from Java `Instant.now()`.
 *
 *     Instant now = Instant.now();
 *
 *     Timestamp timestamp =
 *         Timestamp.newBuilder().setSeconds(now.getEpochSecond())
 *             .setNanos(now.getNano()).build();
 *
 * Example 6: Compute Timestamp from current time in Python.
 *
 *     timestamp = Timestamp()
 *     timestamp.GetCurrentTime()
 *
 * # JSON Mapping
 *
 * In JSON format, the Timestamp type is encoded as a string in the
 * [RFC 3339](https://www.ietf.org/rfc/rfc3339.txt) format. That is, the
 * format is "{year}-{month}-{day}T{hour}:{min}:{sec}[.{frac_sec}]Z"
 * where {year} is always expressed using four digits while {month}, {day},
 * {hour}, {min}, and {sec} are zero-padded to two digits each. The fractional
 * seconds, which can go up to 9 digits (i.e. up to 1 nanosecond resolution),
 * are optional. The "Z" suffix indicates the timezone ("UTC"); the timezone
 * is required. A proto3 JSON serializer should always use UTC (as indicated by
 * "Z") when printing the Timestamp type and a proto3 JSON parser should be
 * able to accept both UTC and other timezones (as indicated by an offset).
 *
 * For example, "2017-01-15T01:30:15.01Z" encodes 15.01 seconds past
 * 01:30 UTC on January 15, 2017.
 *
 * In JavaScript, one can convert a Date object to this format using the
 * standard
 * [toISOString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)
 * method. In Python, a standard `datetime.datetime` object can be converted
 * to this format using
 * [`strftime`](https://docs.python.org/2/library/time.html#time.strftime) with
 * the time format spec '%Y-%m-%dT%H:%M:%S.%fZ'. Likewise, in Java, one can use
 * the Joda Time's [`ISODateTimeFormat.dateTime()`](
 * http://joda-time.sourceforge.net/apidocs/org/joda/time/format/ISODateTimeFormat.html#dateTime()
 * ) to obtain a formatter capable of generating timestamps in this format.
 *
 *
 * @generated from protobuf message google.protobuf.Timestamp
 */
interface Timestamp {
    /**
     * Represents seconds of UTC time since Unix epoch
     * 1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
     * 9999-12-31T23:59:59Z inclusive.
     *
     * @generated from protobuf field: int64 seconds = 1
     */
    seconds: string;
    /**
     * Non-negative fractions of a second at nanosecond resolution. Negative
     * second values with fractions must still have non-negative nanos values
     * that count forward in time. Must be from 0 to 999,999,999
     * inclusive.
     *
     * @generated from protobuf field: int32 nanos = 2
     */
    nanos: number;
}
/**
 * @generated MessageType for protobuf message google.protobuf.Timestamp
 */
declare const Timestamp: Timestamp$Type;

declare class TestStartEvent$Type extends MessageType<TestStartEvent> {
    constructor();
    create(value?: PartialMessage<TestStartEvent>): TestStartEvent;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TestStartEvent): TestStartEvent;
    private binaryReadMap4;
    internalBinaryWrite(message: TestStartEvent, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated from protobuf message testsystem.events.TestStartEvent
 */
interface TestStartEvent {
    /**
     * @generated from protobuf field: string test_id = 1
     */
    testId: string;
    /**
     * @generated from protobuf field: string test_name = 2
     */
    testName: string;
    /**
     * @generated from protobuf field: google.protobuf.Timestamp start_time = 3
     */
    startTime?: Timestamp;
    /**
     * @generated from protobuf field: map<string, string> metadata = 4
     */
    metadata: {
        [key: string]: string;
    };
}
/**
 * @generated MessageType for protobuf message testsystem.events.TestStartEvent
 */
declare const TestStartEvent: TestStartEvent$Type;
declare class TestFinishEvent$Type extends MessageType<TestFinishEvent> {
    constructor();
    create(value?: PartialMessage<TestFinishEvent>): TestFinishEvent;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TestFinishEvent): TestFinishEvent;
    internalBinaryWrite(message: TestFinishEvent, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated from protobuf message testsystem.events.TestFinishEvent
 */
interface TestFinishEvent {
    /**
     * @generated from protobuf field: string test_id = 1
     */
    testId: string;
    /**
     * @generated from protobuf field: testsystem.common.TestStatus status = 2
     */
    status: TestStatus;
    /**
     * @generated from protobuf field: google.protobuf.Timestamp end_time = 3
     */
    endTime?: Timestamp;
    /**
     * @generated from protobuf field: repeated testsystem.common.Attachment attachments = 4
     */
    attachments: Attachment[];
    /**
     * @generated from protobuf field: string error_message = 5
     */
    errorMessage: string;
    /**
     * @generated from protobuf field: string stack_trace = 6
     */
    stackTrace: string;
}
/**
 * @generated MessageType for protobuf message testsystem.events.TestFinishEvent
 */
declare const TestFinishEvent: TestFinishEvent$Type;
declare class TestStep$Type extends MessageType<TestStep> {
    constructor();
    create(value?: PartialMessage<TestStep>): TestStep;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TestStep): TestStep;
    internalBinaryWrite(message: TestStep, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated from protobuf message testsystem.events.TestStep
 */
interface TestStep {
    /**
     * @generated from protobuf field: string description = 1
     */
    description: string;
    /**
     * @generated from protobuf field: google.protobuf.Timestamp timestamp = 2
     */
    timestamp?: Timestamp;
    /**
     * @generated from protobuf field: testsystem.common.TestStatus status = 3
     */
    status: TestStatus;
    /**
     * @generated from protobuf field: repeated testsystem.common.Attachment attachments = 4
     */
    attachments: Attachment[];
}
/**
 * @generated MessageType for protobuf message testsystem.events.TestStep
 */
declare const TestStep: TestStep$Type;
declare class TestStepEvent$Type extends MessageType<TestStepEvent> {
    constructor();
    create(value?: PartialMessage<TestStepEvent>): TestStepEvent;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TestStepEvent): TestStepEvent;
    internalBinaryWrite(message: TestStepEvent, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated from protobuf message testsystem.events.TestStepEvent
 */
interface TestStepEvent {
    /**
     * @generated from protobuf field: string test_id = 1
     */
    testId: string;
    /**
     * @generated from protobuf field: repeated testsystem.events.TestStep steps = 2
     */
    steps: TestStep[];
}
/**
 * @generated MessageType for protobuf message testsystem.events.TestStepEvent
 */
declare const TestStepEvent: TestStepEvent$Type;

declare class Ack$Type extends MessageType<Ack> {
    constructor();
    create(value?: PartialMessage<Ack>): Ack;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Ack): Ack;
    internalBinaryWrite(message: Ack, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated from protobuf message testsystem.observer.Ack
 */
interface Ack {
    /**
     * @generated from protobuf field: bool success = 1
     */
    success: boolean;
    /**
     * @generated from protobuf field: string message = 2
     */
    message: string;
}
/**
 * @generated MessageType for protobuf message testsystem.observer.Ack
 */
declare const Ack: Ack$Type;
/**
 * @generated ServiceType for protobuf service testsystem.observer.TestEventCollector
 */
declare const TestEventCollector: ServiceType;

/**
 * @generated from protobuf service testsystem.observer.TestEventCollector
 */
interface ITestEventCollectorClient {
    /**
     * @generated from protobuf rpc: ReportTestStart
     */
    reportTestStart(input: TestStartEvent, options?: RpcOptions): UnaryCall<TestStartEvent, Ack>;
    /**
     * @generated from protobuf rpc: ReportTestFinish
     */
    reportTestFinish(input: TestFinishEvent, options?: RpcOptions): UnaryCall<TestFinishEvent, Ack>;
    /**
     * @generated from protobuf rpc: ReportTestStep
     */
    reportTestStep(input: TestStepEvent, options?: RpcOptions): UnaryCall<TestStepEvent, Ack>;
}
/**
 * @generated from protobuf service testsystem.observer.TestEventCollector
 */
declare class TestEventCollectorClient implements ITestEventCollectorClient, ServiceInfo {
    private readonly _transport;
    typeName: string;
    methods: _protobuf_ts_runtime_rpc.MethodInfo<any, any>[];
    options: {
        [extensionName: string]: _protobuf_ts_runtime.JsonValue;
    };
    constructor(_transport: RpcTransport);
    /**
     * @generated from protobuf rpc: ReportTestStart
     */
    reportTestStart(input: TestStartEvent, options?: RpcOptions): UnaryCall<TestStartEvent, Ack>;
    /**
     * @generated from protobuf rpc: ReportTestFinish
     */
    reportTestFinish(input: TestFinishEvent, options?: RpcOptions): UnaryCall<TestFinishEvent, Ack>;
    /**
     * @generated from protobuf rpc: ReportTestStep
     */
    reportTestStep(input: TestStepEvent, options?: RpcOptions): UnaryCall<TestStepEvent, Ack>;
}

export { Ack, Attachment, type ITestEventCollectorClient, TestEventCollector, TestEventCollectorClient, TestFinishEvent, TestStartEvent, TestStatus, TestStep, TestStepEvent, Timestamp };
