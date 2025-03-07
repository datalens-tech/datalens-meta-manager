var __TEMPORAL__;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@temporalio/common/lib/activity-options.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/activity-options.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeActivityCancellationType = exports.encodeActivityCancellationType = exports.ActivityCancellationType = void 0;
const internal_workflow_1 = __webpack_require__(/*! ./internal-workflow */ "./node_modules/@temporalio/common/lib/internal-workflow/index.js");
exports.ActivityCancellationType = {
    TRY_CANCEL: 'TRY_CANCEL',
    WAIT_CANCELLATION_COMPLETED: 'WAIT_CANCELLATION_COMPLETED',
    ABANDON: 'ABANDON',
};
_a = (0, internal_workflow_1.makeProtoEnumConverters)({
    [exports.ActivityCancellationType.TRY_CANCEL]: 0,
    [exports.ActivityCancellationType.WAIT_CANCELLATION_COMPLETED]: 1,
    [exports.ActivityCancellationType.ABANDON]: 2,
}, ''), exports.encodeActivityCancellationType = _a[0], exports.decodeActivityCancellationType = _a[1];


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/data-converter.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/data-converter.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultDataConverter = exports.defaultFailureConverter = void 0;
const failure_converter_1 = __webpack_require__(/*! ./failure-converter */ "./node_modules/@temporalio/common/lib/converter/failure-converter.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js");
/**
 * The default {@link FailureConverter} used by the SDK.
 *
 * Error messages and stack traces are serizalized as plain text.
 */
exports.defaultFailureConverter = new failure_converter_1.DefaultFailureConverter();
/**
 * A "loaded" data converter that uses the default set of failure and payload converters.
 */
exports.defaultDataConverter = {
    payloadConverter: payload_converter_1.defaultPayloadConverter,
    failureConverter: exports.defaultFailureConverter,
    payloadCodecs: [],
};


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/failure-converter.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/failure-converter.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultFailureConverter = void 0;
exports.cutoffStackTrace = cutoffStackTrace;
const failure_1 = __webpack_require__(/*! ../failure */ "./node_modules/@temporalio/common/lib/failure.js");
const type_helpers_1 = __webpack_require__(/*! ../type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
const time_1 = __webpack_require__(/*! ../time */ "./node_modules/@temporalio/common/lib/time.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js");
function combineRegExp(...regexps) {
    return new RegExp(regexps.map((x) => `(?:${x.source})`).join('|'));
}
/**
 * Stack traces will be cutoff when on of these patterns is matched
 */
const CUTOFF_STACK_PATTERNS = combineRegExp(
/** Activity execution */
/\s+at Activity\.execute \(.*[\\/]worker[\\/](?:src|lib)[\\/]activity\.[jt]s:\d+:\d+\)/, 
/** Workflow activation */
/\s+at Activator\.\S+NextHandler \(.*[\\/]workflow[\\/](?:src|lib)[\\/]internals\.[jt]s:\d+:\d+\)/, 
/** Workflow run anything in context */
/\s+at Script\.runInContext \((?:node:vm|vm\.js):\d+:\d+\)/);
/**
 * Any stack trace frames that match any of those wil be dopped.
 * The "null." prefix on some cases is to avoid https://github.com/nodejs/node/issues/42417
 */
const DROPPED_STACK_FRAMES_PATTERNS = combineRegExp(
/** Internal functions used to recursively chain interceptors */
/\s+at (null\.)?next \(.*[\\/]common[\\/](?:src|lib)[\\/]interceptors\.[jt]s:\d+:\d+\)/, 
/** Internal functions used to recursively chain interceptors */
/\s+at (null\.)?executeNextHandler \(.*[\\/]worker[\\/](?:src|lib)[\\/]activity\.[jt]s:\d+:\d+\)/);
/**
 * Cuts out the framework part of a stack trace, leaving only user code entries
 */
function cutoffStackTrace(stack) {
    const lines = (stack ?? '').split(/\r?\n/);
    const acc = Array();
    for (const line of lines) {
        if (CUTOFF_STACK_PATTERNS.test(line))
            break;
        if (!DROPPED_STACK_FRAMES_PATTERNS.test(line))
            acc.push(line);
    }
    return acc.join('\n');
}
/**
 * Default, cross-language-compatible Failure converter.
 *
 * By default, it will leave error messages and stack traces as plain text. In order to encrypt them, set
 * `encodeCommonAttributes` to `true` in the constructor options and use a {@link PayloadCodec} that can encrypt /
 * decrypt Payloads in your {@link WorkerOptions.dataConverter | Worker} and
 * {@link ClientOptions.dataConverter | Client options}.
 */
class DefaultFailureConverter {
    constructor(options) {
        const { encodeCommonAttributes } = options ?? {};
        this.options = {
            encodeCommonAttributes: encodeCommonAttributes ?? false,
        };
    }
    /**
     * Converts a Failure proto message to a JS Error object.
     *
     * Does not set common properties, that is done in {@link failureToError}.
     */
    failureToErrorInner(failure, payloadConverter) {
        if (failure.applicationFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, failure.applicationFailureInfo.type, Boolean(failure.applicationFailureInfo.nonRetryable), (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.applicationFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.serverFailureInfo) {
            return new failure_1.ServerFailure(failure.message ?? undefined, Boolean(failure.serverFailureInfo.nonRetryable), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.timeoutFailureInfo) {
            return new failure_1.TimeoutFailure(failure.message ?? undefined, (0, payload_converter_1.fromPayloadsAtIndex)(payloadConverter, 0, failure.timeoutFailureInfo.lastHeartbeatDetails?.payloads), (0, failure_1.decodeTimeoutType)(failure.timeoutFailureInfo.timeoutType));
        }
        if (failure.terminatedFailureInfo) {
            return new failure_1.TerminatedFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.canceledFailureInfo) {
            return new failure_1.CancelledFailure(failure.message ?? undefined, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.canceledFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.resetWorkflowFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, 'ResetWorkflow', false, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.resetWorkflowFailureInfo.lastHeartbeatDetails?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.childWorkflowExecutionFailureInfo) {
            const { namespace, workflowType, workflowExecution, retryState } = failure.childWorkflowExecutionFailureInfo;
            if (!(workflowType?.name && workflowExecution)) {
                throw new TypeError('Missing attributes on childWorkflowExecutionFailureInfo');
            }
            return new failure_1.ChildWorkflowFailure(namespace ?? undefined, workflowExecution, workflowType.name, (0, failure_1.decodeRetryState)(retryState), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.activityFailureInfo) {
            if (!failure.activityFailureInfo.activityType?.name) {
                throw new TypeError('Missing activityType?.name on activityFailureInfo');
            }
            return new failure_1.ActivityFailure(failure.message ?? undefined, failure.activityFailureInfo.activityType.name, failure.activityFailureInfo.activityId ?? undefined, (0, failure_1.decodeRetryState)(failure.activityFailureInfo.retryState), failure.activityFailureInfo.identity ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        return new failure_1.TemporalFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
    }
    failureToError(failure, payloadConverter) {
        if (failure.encodedAttributes) {
            const attrs = payloadConverter.fromPayload(failure.encodedAttributes);
            // Don't apply encodedAttributes unless they conform to an expected schema
            if (typeof attrs === 'object' && attrs !== null) {
                const { message, stack_trace } = attrs;
                // Avoid mutating the argument
                failure = { ...failure };
                if (typeof message === 'string') {
                    failure.message = message;
                }
                if (typeof stack_trace === 'string') {
                    failure.stackTrace = stack_trace;
                }
            }
        }
        const err = this.failureToErrorInner(failure, payloadConverter);
        err.stack = failure.stackTrace ?? '';
        err.failure = failure;
        return err;
    }
    errorToFailure(err, payloadConverter) {
        const failure = this.errorToFailureInner(err, payloadConverter);
        if (this.options.encodeCommonAttributes) {
            const { message, stackTrace } = failure;
            failure.message = 'Encoded failure';
            failure.stackTrace = '';
            failure.encodedAttributes = payloadConverter.toPayload({ message, stack_trace: stackTrace });
        }
        return failure;
    }
    errorToFailureInner(err, payloadConverter) {
        if (err instanceof failure_1.TemporalFailure) {
            if (err.failure)
                return err.failure;
            const base = {
                message: err.message,
                stackTrace: cutoffStackTrace(err.stack),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
                source: failure_1.FAILURE_SOURCE,
            };
            if (err instanceof failure_1.ActivityFailure) {
                return {
                    ...base,
                    activityFailureInfo: {
                        ...err,
                        retryState: (0, failure_1.encodeRetryState)(err.retryState),
                        activityType: { name: err.activityType },
                    },
                };
            }
            if (err instanceof failure_1.ChildWorkflowFailure) {
                return {
                    ...base,
                    childWorkflowExecutionFailureInfo: {
                        ...err,
                        retryState: (0, failure_1.encodeRetryState)(err.retryState),
                        workflowExecution: err.execution,
                        workflowType: { name: err.workflowType },
                    },
                };
            }
            if (err instanceof failure_1.ApplicationFailure) {
                return {
                    ...base,
                    applicationFailureInfo: {
                        type: err.type,
                        nonRetryable: err.nonRetryable,
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                        nextRetryDelay: (0, time_1.msOptionalToTs)(err.nextRetryDelay),
                    },
                };
            }
            if (err instanceof failure_1.CancelledFailure) {
                return {
                    ...base,
                    canceledFailureInfo: {
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.TimeoutFailure) {
                return {
                    ...base,
                    timeoutFailureInfo: {
                        timeoutType: (0, failure_1.encodeTimeoutType)(err.timeoutType),
                        lastHeartbeatDetails: err.lastHeartbeatDetails
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, err.lastHeartbeatDetails) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.ServerFailure) {
                return {
                    ...base,
                    serverFailureInfo: { nonRetryable: err.nonRetryable },
                };
            }
            if (err instanceof failure_1.TerminatedFailure) {
                return {
                    ...base,
                    terminatedFailureInfo: {},
                };
            }
            // Just a TemporalFailure
            return base;
        }
        const base = {
            source: failure_1.FAILURE_SOURCE,
        };
        if ((0, type_helpers_1.isError)(err)) {
            return {
                ...base,
                message: String(err.message) ?? '',
                stackTrace: cutoffStackTrace(err.stack),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
            };
        }
        const recommendation = ` [A non-Error value was thrown from your code. We recommend throwing Error objects so that we can provide a stack trace]`;
        if (typeof err === 'string') {
            return { ...base, message: err + recommendation };
        }
        if (typeof err === 'object') {
            let message = '';
            try {
                message = JSON.stringify(err);
            }
            catch (_err) {
                message = String(err);
            }
            return { ...base, message: message + recommendation };
        }
        return { ...base, message: String(err) + recommendation };
    }
    /**
     * Converts a Failure proto message to a JS Error object if defined or returns undefined.
     */
    optionalFailureToOptionalError(failure, payloadConverter) {
        return failure ? this.failureToError(failure, payloadConverter) : undefined;
    }
    /**
     * Converts an error to a Failure proto message if defined or returns undefined
     */
    optionalErrorToOptionalFailure(err, payloadConverter) {
        return err ? this.errorToFailure(err, payloadConverter) : undefined;
    }
}
exports.DefaultFailureConverter = DefaultFailureConverter;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/payload-codec.js":
/*!************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/payload-codec.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/payload-converter.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/payload-converter.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultPayloadConverter = exports.DefaultPayloadConverter = exports.searchAttributePayloadConverter = exports.SearchAttributePayloadConverter = exports.JsonPayloadConverter = exports.BinaryPayloadConverter = exports.UndefinedPayloadConverter = exports.CompositePayloadConverter = void 0;
exports.toPayloads = toPayloads;
exports.mapToPayloads = mapToPayloads;
exports.fromPayloadsAtIndex = fromPayloadsAtIndex;
exports.arrayFromPayloads = arrayFromPayloads;
exports.mapFromPayloads = mapFromPayloads;
const encoding_1 = __webpack_require__(/*! ../encoding */ "./node_modules/@temporalio/common/lib/encoding.js");
const errors_1 = __webpack_require__(/*! ../errors */ "./node_modules/@temporalio/common/lib/errors.js");
const types_1 = __webpack_require__(/*! ./types */ "./node_modules/@temporalio/common/lib/converter/types.js");
/**
 * Implements conversion of a list of values.
 *
 * @param converter
 * @param values JS values to convert to Payloads
 * @return list of {@link Payload}s
 * @throws {@link ValueError} if conversion of the value passed as parameter failed for any
 *     reason.
 */
function toPayloads(converter, ...values) {
    if (values.length === 0) {
        return undefined;
    }
    return values.map((value) => converter.toPayload(value));
}
/**
 * Run {@link PayloadConverter.toPayload} on each value in the map.
 *
 * @throws {@link ValueError} if conversion of any value in the map fails
 */
function mapToPayloads(converter, map) {
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, converter.toPayload(v)]));
}
/**
 * Implements conversion of an array of values of different types. Useful for deserializing
 * arguments of function invocations.
 *
 * @param converter
 * @param index index of the value in the payloads
 * @param payloads serialized value to convert to JS values.
 * @return converted JS value
 * @throws {@link PayloadConverterError} if conversion of the data passed as parameter failed for any
 *     reason.
 */
function fromPayloadsAtIndex(converter, index, payloads) {
    // To make adding arguments a backwards compatible change
    if (payloads === undefined || payloads === null || index >= payloads.length) {
        return undefined;
    }
    return converter.fromPayload(payloads[index]);
}
/**
 * Run {@link PayloadConverter.fromPayload} on each value in the array.
 */
function arrayFromPayloads(converter, payloads) {
    if (!payloads) {
        return [];
    }
    return payloads.map((payload) => converter.fromPayload(payload));
}
function mapFromPayloads(converter, map) {
    if (map == null)
        return undefined;
    return Object.fromEntries(Object.entries(map).map(([k, payload]) => {
        const value = converter.fromPayload(payload);
        return [k, value];
    }));
}
/**
 * Tries to convert values to {@link Payload}s using the {@link PayloadConverterWithEncoding}s provided to the constructor, in the order provided.
 *
 * Converts Payloads to values based on the `Payload.metadata.encoding` field, which matches the {@link PayloadConverterWithEncoding.encodingType}
 * of the converter that created the Payload.
 */
class CompositePayloadConverter {
    constructor(...converters) {
        this.converterByEncoding = new Map();
        if (converters.length === 0) {
            throw new errors_1.PayloadConverterError('Must provide at least one PayloadConverterWithEncoding');
        }
        this.converters = converters;
        for (const converter of converters) {
            this.converterByEncoding.set(converter.encodingType, converter);
        }
    }
    /**
     * Tries to run `.toPayload(value)` on each converter in the order provided at construction.
     * Returns the first successful result, throws {@link ValueError} if there is no converter that can handle the value.
     */
    toPayload(value) {
        for (const converter of this.converters) {
            const result = converter.toPayload(value);
            if (result !== undefined) {
                return result;
            }
        }
        throw new errors_1.ValueError(`Unable to convert ${value} to payload`);
    }
    /**
     * Run {@link PayloadConverterWithEncoding.fromPayload} based on the `encoding` metadata of the {@link Payload}.
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const encoding = (0, encoding_1.decode)(payload.metadata[types_1.METADATA_ENCODING_KEY]);
        const converter = this.converterByEncoding.get(encoding);
        if (converter === undefined) {
            throw new errors_1.ValueError(`Unknown encoding: ${encoding}`);
        }
        return converter.fromPayload(payload);
    }
}
exports.CompositePayloadConverter = CompositePayloadConverter;
/**
 * Converts between JS undefined and NULL Payload
 */
class UndefinedPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_NULL;
    }
    toPayload(value) {
        if (value !== undefined) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_NULL,
            },
        };
    }
    fromPayload(_content) {
        return undefined; // Just return undefined
    }
}
exports.UndefinedPayloadConverter = UndefinedPayloadConverter;
/**
 * Converts between binary data types and RAW Payload
 */
class BinaryPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_RAW;
    }
    toPayload(value) {
        if (!(value instanceof Uint8Array)) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_RAW,
            },
            data: value,
        };
    }
    fromPayload(content) {
        return (
        // Wrap with Uint8Array from this context to ensure `instanceof` works
        (content.data ? new Uint8Array(content.data.buffer, content.data.byteOffset, content.data.length) : content.data));
    }
}
exports.BinaryPayloadConverter = BinaryPayloadConverter;
/**
 * Converts between non-undefined values and serialized JSON Payload
 */
class JsonPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_JSON;
    }
    toPayload(value) {
        if (value === undefined) {
            return undefined;
        }
        let json;
        try {
            json = JSON.stringify(value);
        }
        catch (_err) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_JSON,
            },
            data: (0, encoding_1.encode)(json),
        };
    }
    fromPayload(content) {
        if (content.data === undefined || content.data === null) {
            throw new errors_1.ValueError('Got payload with no data');
        }
        return JSON.parse((0, encoding_1.decode)(content.data));
    }
}
exports.JsonPayloadConverter = JsonPayloadConverter;
/**
 * Converts Search Attribute values using JsonPayloadConverter
 */
class SearchAttributePayloadConverter {
    constructor() {
        this.jsonConverter = new JsonPayloadConverter();
        this.validNonDateTypes = ['string', 'number', 'boolean'];
    }
    toPayload(values) {
        if (!Array.isArray(values)) {
            throw new errors_1.ValueError(`SearchAttribute value must be an array`);
        }
        if (values.length > 0) {
            const firstValue = values[0];
            const firstType = typeof firstValue;
            if (firstType === 'object') {
                for (const [idx, value] of values.entries()) {
                    if (!(value instanceof Date)) {
                        throw new errors_1.ValueError(`SearchAttribute values must arrays of strings, numbers, booleans, or Dates. The value ${value} at index ${idx} is of type ${typeof value}`);
                    }
                }
            }
            else {
                if (!this.validNonDateTypes.includes(firstType)) {
                    throw new errors_1.ValueError(`SearchAttribute array values must be: string | number | boolean | Date`);
                }
                for (const [idx, value] of values.entries()) {
                    if (typeof value !== firstType) {
                        throw new errors_1.ValueError(`All SearchAttribute array values must be of the same type. The first value ${firstValue} of type ${firstType} doesn't match value ${value} of type ${typeof value} at index ${idx}`);
                    }
                }
            }
        }
        // JSON.stringify takes care of converting Dates to ISO strings
        const ret = this.jsonConverter.toPayload(values);
        if (ret === undefined) {
            throw new errors_1.ValueError('Could not convert search attributes to payloads');
        }
        return ret;
    }
    /**
     * Datetime Search Attribute values are converted to `Date`s
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const value = this.jsonConverter.fromPayload(payload);
        let arrayWrappedValue = Array.isArray(value) ? value : [value];
        const searchAttributeType = (0, encoding_1.decode)(payload.metadata.type);
        if (searchAttributeType === 'Datetime') {
            arrayWrappedValue = arrayWrappedValue.map((dateString) => new Date(dateString));
        }
        return arrayWrappedValue;
    }
}
exports.SearchAttributePayloadConverter = SearchAttributePayloadConverter;
exports.searchAttributePayloadConverter = new SearchAttributePayloadConverter();
class DefaultPayloadConverter extends CompositePayloadConverter {
    // Match the order used in other SDKs, but exclude Protobuf converters so that the code, including
    // `proto3-json-serializer`, doesn't take space in Workflow bundles that don't use Protobufs. To use Protobufs, use
    // {@link DefaultPayloadConverterWithProtobufs}.
    //
    // Go SDK:
    // https://github.com/temporalio/sdk-go/blob/5e5645f0c550dcf717c095ae32c76a7087d2e985/converter/default_data_converter.go#L28
    constructor() {
        super(new UndefinedPayloadConverter(), new BinaryPayloadConverter(), new JsonPayloadConverter());
    }
}
exports.DefaultPayloadConverter = DefaultPayloadConverter;
/**
 * The default {@link PayloadConverter} used by the SDK. Supports `Uint8Array` and JSON serializables (so if
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description | `JSON.stringify(yourArgOrRetval)`}
 * works, the default payload converter will work).
 *
 * To also support Protobufs, create a custom payload converter with {@link DefaultPayloadConverter}:
 *
 * `const myConverter = new DefaultPayloadConverter({ protobufRoot })`
 */
exports.defaultPayloadConverter = new DefaultPayloadConverter();


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/types.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/types.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.METADATA_MESSAGE_TYPE_KEY = exports.encodingKeys = exports.encodingTypes = exports.METADATA_ENCODING_KEY = void 0;
const encoding_1 = __webpack_require__(/*! ../encoding */ "./node_modules/@temporalio/common/lib/encoding.js");
exports.METADATA_ENCODING_KEY = 'encoding';
exports.encodingTypes = {
    METADATA_ENCODING_NULL: 'binary/null',
    METADATA_ENCODING_RAW: 'binary/plain',
    METADATA_ENCODING_JSON: 'json/plain',
    METADATA_ENCODING_PROTOBUF_JSON: 'json/protobuf',
    METADATA_ENCODING_PROTOBUF: 'binary/protobuf',
};
exports.encodingKeys = {
    METADATA_ENCODING_NULL: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_NULL),
    METADATA_ENCODING_RAW: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_RAW),
    METADATA_ENCODING_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_JSON),
    METADATA_ENCODING_PROTOBUF_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF_JSON),
    METADATA_ENCODING_PROTOBUF: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF),
};
exports.METADATA_MESSAGE_TYPE_KEY = 'messageType';


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/deprecated-time.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/deprecated-time.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalTsToMs = optionalTsToMs;
exports.tsToMs = tsToMs;
exports.msNumberToTs = msNumberToTs;
exports.msToTs = msToTs;
exports.msOptionalToTs = msOptionalToTs;
exports.msOptionalToNumber = msOptionalToNumber;
exports.msToNumber = msToNumber;
exports.tsToDate = tsToDate;
exports.optionalTsToDate = optionalTsToDate;
const time = __importStar(__webpack_require__(/*! ./time */ "./node_modules/@temporalio/common/lib/time.js"));
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToMs(ts) {
    return time.optionalTsToMs(ts);
}
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 *
 * @hidden
 * @deprecated - meant for internal use only
 * @deprecated - meant for internal use only
 */
function tsToMs(ts) {
    return time.tsToMs(ts);
}
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msNumberToTs(millis) {
    return time.msNumberToTs(millis);
}
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToTs(str) {
    return time.msToTs(str);
}
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToTs(str) {
    return time.msOptionalToTs(str);
}
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToNumber(val) {
    return time.msOptionalToNumber(val);
}
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToNumber(val) {
    return time.msToNumber(val);
}
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function tsToDate(ts) {
    return time.tsToDate(ts);
}
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToDate(ts) {
    return time.optionalTsToDate(ts);
}


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/encoding.js":
/*!*********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/encoding.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Pasted with modifications from: https://raw.githubusercontent.com/anonyco/FastestSmallestTextEncoderDecoder/master/EncoderDecoderTogether.src.js
/* eslint no-fallthrough: 0 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TextEncoder = exports.TextDecoder = void 0;
exports.encode = encode;
exports.decode = decode;
const fromCharCode = String.fromCharCode;
const encoderRegexp = /[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g;
const tmpBufferU16 = new Uint16Array(32);
class TextDecoder {
    decode(inputArrayOrBuffer) {
        const inputAs8 = inputArrayOrBuffer instanceof Uint8Array ? inputArrayOrBuffer : new Uint8Array(inputArrayOrBuffer);
        let resultingString = '', tmpStr = '', index = 0, nextEnd = 0, cp0 = 0, codePoint = 0, minBits = 0, cp1 = 0, pos = 0, tmp = -1;
        const len = inputAs8.length | 0;
        const lenMinus32 = (len - 32) | 0;
        // Note that tmp represents the 2nd half of a surrogate pair incase a surrogate gets divided between blocks
        for (; index < len;) {
            nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
            for (; pos < nextEnd; index = (index + 1) | 0, pos = (pos + 1) | 0) {
                cp0 = inputAs8[index] & 0xff;
                switch (cp0 >> 4) {
                    case 15:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        if (cp1 >> 6 !== 0b10 || 0b11110111 < cp0) {
                            index = (index - 1) | 0;
                            break;
                        }
                        codePoint = ((cp0 & 0b111) << 6) | (cp1 & 0b00111111);
                        minBits = 5; // 20 ensures it never passes -> all invalid replacements
                        cp0 = 0x100; //  keep track of th bit size
                    case 14:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b1111) << 6) | (cp1 & 0b00111111);
                        minBits = cp1 >> 6 === 0b10 ? (minBits + 4) | 0 : 24; // 24 ensures it never passes -> all invalid replacements
                        cp0 = (cp0 + 0x100) & 0x300; // keep track of th bit size
                    case 13:
                    case 12:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b11111) << 6) | (cp1 & 0b00111111);
                        minBits = (minBits + 7) | 0;
                        // Now, process the code point
                        if (index < len && cp1 >> 6 === 0b10 && codePoint >> minBits && codePoint < 0x110000) {
                            cp0 = codePoint;
                            codePoint = (codePoint - 0x10000) | 0;
                            if (0 <= codePoint /*0xffff < codePoint*/) {
                                // BMP code point
                                //nextEnd = nextEnd - 1|0;
                                tmp = ((codePoint >> 10) + 0xd800) | 0; // highSurrogate
                                cp0 = ((codePoint & 0x3ff) + 0xdc00) | 0; // lowSurrogate (will be inserted later in the switch-statement)
                                if (pos < 31) {
                                    // notice 31 instead of 32
                                    tmpBufferU16[pos] = tmp;
                                    pos = (pos + 1) | 0;
                                    tmp = -1;
                                }
                                else {
                                    // else, we are at the end of the inputAs8 and let tmp0 be filled in later on
                                    // NOTE that cp1 is being used as a temporary variable for the swapping of tmp with cp0
                                    cp1 = tmp;
                                    tmp = cp0;
                                    cp0 = cp1;
                                }
                            }
                            else
                                nextEnd = (nextEnd + 1) | 0; // because we are advancing i without advancing pos
                        }
                        else {
                            // invalid code point means replacing the whole thing with null replacement characters
                            cp0 >>= 8;
                            index = (index - cp0 - 1) | 0; // reset index  back to what it was before
                            cp0 = 0xfffd;
                        }
                        // Finally, reset the variables for the next go-around
                        minBits = 0;
                        codePoint = 0;
                        nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
                    /*case 11:
                  case 10:
                  case 9:
                  case 8:
                    codePoint ? codePoint = 0 : cp0 = 0xfffd; // fill with invalid replacement character
                  case 7:
                  case 6:
                  case 5:
                  case 4:
                  case 3:
                  case 2:
                  case 1:
                  case 0:
                    tmpBufferU16[pos] = cp0;
                    continue;*/
                    default: // fill with invalid replacement character
                        tmpBufferU16[pos] = cp0;
                        continue;
                    case 11:
                    case 10:
                    case 9:
                    case 8:
                }
                tmpBufferU16[pos] = 0xfffd; // fill with invalid replacement character
            }
            tmpStr += fromCharCode(tmpBufferU16[0], tmpBufferU16[1], tmpBufferU16[2], tmpBufferU16[3], tmpBufferU16[4], tmpBufferU16[5], tmpBufferU16[6], tmpBufferU16[7], tmpBufferU16[8], tmpBufferU16[9], tmpBufferU16[10], tmpBufferU16[11], tmpBufferU16[12], tmpBufferU16[13], tmpBufferU16[14], tmpBufferU16[15], tmpBufferU16[16], tmpBufferU16[17], tmpBufferU16[18], tmpBufferU16[19], tmpBufferU16[20], tmpBufferU16[21], tmpBufferU16[22], tmpBufferU16[23], tmpBufferU16[24], tmpBufferU16[25], tmpBufferU16[26], tmpBufferU16[27], tmpBufferU16[28], tmpBufferU16[29], tmpBufferU16[30], tmpBufferU16[31]);
            if (pos < 32)
                tmpStr = tmpStr.slice(0, (pos - 32) | 0); //-(32-pos));
            if (index < len) {
                //fromCharCode.apply(0, tmpBufferU16 : Uint8Array ?  tmpBufferU16.subarray(0,pos) : tmpBufferU16.slice(0,pos));
                tmpBufferU16[0] = tmp;
                pos = ~tmp >>> 31; //tmp !== -1 ? 1 : 0;
                tmp = -1;
                if (tmpStr.length < resultingString.length)
                    continue;
            }
            else if (tmp !== -1) {
                tmpStr += fromCharCode(tmp);
            }
            resultingString += tmpStr;
            tmpStr = '';
        }
        return resultingString;
    }
}
exports.TextDecoder = TextDecoder;
//////////////////////////////////////////////////////////////////////////////////////
function encoderReplacer(nonAsciiChars) {
    // make the UTF string into a binary UTF-8 encoded string
    let point = nonAsciiChars.charCodeAt(0) | 0;
    if (0xd800 <= point) {
        if (point <= 0xdbff) {
            const nextcode = nonAsciiChars.charCodeAt(1) | 0; // defaults to 0 when NaN, causing null replacement character
            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                if (point > 0xffff)
                    return fromCharCode((0x1e /*0b11110*/ << 3) | (point >> 18), (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
            }
            else
                point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
        else if (point <= 0xdfff) {
            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
    }
    /*if (point <= 0x007f) return nonAsciiChars;
    else */ if (point <= 0x07ff) {
        return fromCharCode((0x6 << 5) | (point >> 6), (0x2 << 6) | (point & 0x3f));
    }
    else
        return fromCharCode((0xe /*0b1110*/ << 4) | (point >> 12), (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
}
class TextEncoder {
    encode(inputString) {
        // 0xc0 => 0b11000000; 0xff => 0b11111111; 0xc0-0xff => 0b11xxxxxx
        // 0x80 => 0b10000000; 0xbf => 0b10111111; 0x80-0xbf => 0b10xxxxxx
        const encodedString = inputString === void 0 ? '' : '' + inputString, len = encodedString.length | 0;
        let result = new Uint8Array(((len << 1) + 8) | 0);
        let tmpResult;
        let i = 0, pos = 0, point = 0, nextcode = 0;
        let upgradededArraySize = !Uint8Array; // normal arrays are auto-expanding
        for (i = 0; i < len; i = (i + 1) | 0, pos = (pos + 1) | 0) {
            point = encodedString.charCodeAt(i) | 0;
            if (point <= 0x007f) {
                result[pos] = point;
            }
            else if (point <= 0x07ff) {
                result[pos] = (0x6 << 5) | (point >> 6);
                result[(pos = (pos + 1) | 0)] = (0x2 << 6) | (point & 0x3f);
            }
            else {
                widenCheck: {
                    if (0xd800 <= point) {
                        if (point <= 0xdbff) {
                            nextcode = encodedString.charCodeAt((i = (i + 1) | 0)) | 0; // defaults to 0 when NaN, causing null replacement character
                            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                                if (point > 0xffff) {
                                    result[pos] = (0x1e /*0b11110*/ << 3) | (point >> 18);
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
                                    continue;
                                }
                                break widenCheck;
                            }
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                        else if (point <= 0xdfff) {
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                    }
                    if (!upgradededArraySize && i << 1 < pos && i << 1 < ((pos - 7) | 0)) {
                        upgradededArraySize = true;
                        tmpResult = new Uint8Array(len * 3);
                        tmpResult.set(result);
                        result = tmpResult;
                    }
                }
                result[pos] = (0xe /*0b1110*/ << 4) | (point >> 12);
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
            }
        }
        return Uint8Array ? result.subarray(0, pos) : result.slice(0, pos);
    }
    encodeInto(inputString, u8Arr) {
        const encodedString = inputString === void 0 ? '' : ('' + inputString).replace(encoderRegexp, encoderReplacer);
        let len = encodedString.length | 0, i = 0, char = 0, read = 0;
        const u8ArrLen = u8Arr.length | 0;
        const inputLength = inputString.length | 0;
        if (u8ArrLen < len)
            len = u8ArrLen;
        putChars: {
            for (; i < len; i = (i + 1) | 0) {
                char = encodedString.charCodeAt(i) | 0;
                switch (char >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        read = (read + 1) | 0;
                    // extension points:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                        break;
                    case 12:
                    case 13:
                        if (((i + 1) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    case 14:
                        if (((i + 2) | 0) < u8ArrLen) {
                            //if (!(char === 0xEF && encodedString.substr(i+1|0,2) === "\xBF\xBD"))
                            read = (read + 1) | 0;
                            break;
                        }
                    case 15:
                        if (((i + 3) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    default:
                        break putChars;
                }
                //read = read + ((char >> 6) !== 2) |0;
                u8Arr[i] = char;
            }
        }
        return { written: i, read: inputLength < read ? inputLength : read };
    }
}
exports.TextEncoder = TextEncoder;
/**
 * Encode a UTF-8 string into a Uint8Array
 */
function encode(s) {
    return TextEncoder.prototype.encode(s);
}
/**
 * Decode a Uint8Array into a UTF-8 string
 */
function decode(a) {
    return TextDecoder.prototype.decode(a);
}


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/errors.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/errors.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NamespaceNotFoundError = exports.WorkflowNotFoundError = exports.IllegalStateError = exports.PayloadConverterError = exports.ValueError = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Thrown from code that receives a value that is unexpected or that it's unable to handle.
 */
let ValueError = class ValueError extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
    }
};
exports.ValueError = ValueError;
exports.ValueError = ValueError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ValueError')
], ValueError);
/**
 * Thrown when a Payload Converter is misconfigured.
 */
let PayloadConverterError = class PayloadConverterError extends ValueError {
};
exports.PayloadConverterError = PayloadConverterError;
exports.PayloadConverterError = PayloadConverterError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('PayloadConverterError')
], PayloadConverterError);
/**
 * Used in different parts of the SDK to note that something unexpected has happened.
 */
let IllegalStateError = class IllegalStateError extends Error {
};
exports.IllegalStateError = IllegalStateError;
exports.IllegalStateError = IllegalStateError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('IllegalStateError')
], IllegalStateError);
/**
 * Thrown when a Workflow with the given Id is not known to Temporal Server.
 * It could be because:
 * - Id passed is incorrect
 * - Workflow is closed (for some calls, e.g. `terminate`)
 * - Workflow was deleted from the Server after reaching its retention limit
 */
let WorkflowNotFoundError = class WorkflowNotFoundError extends Error {
    constructor(message, workflowId, runId) {
        super(message);
        this.workflowId = workflowId;
        this.runId = runId;
    }
};
exports.WorkflowNotFoundError = WorkflowNotFoundError;
exports.WorkflowNotFoundError = WorkflowNotFoundError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowNotFoundError')
], WorkflowNotFoundError);
/**
 * Thrown when the specified namespace is not known to Temporal Server.
 */
let NamespaceNotFoundError = class NamespaceNotFoundError extends Error {
    constructor(namespace) {
        super(`Namespace not found: '${namespace}'`);
        this.namespace = namespace;
    }
};
exports.NamespaceNotFoundError = NamespaceNotFoundError;
exports.NamespaceNotFoundError = NamespaceNotFoundError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('NamespaceNotFoundError')
], NamespaceNotFoundError);


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/failure.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/failure.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkflowExecutionAlreadyStartedError = exports.ChildWorkflowFailure = exports.ActivityFailure = exports.TimeoutFailure = exports.TerminatedFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ServerFailure = exports.TemporalFailure = exports.decodeRetryState = exports.encodeRetryState = exports.RetryState = exports.decodeTimeoutType = exports.encodeTimeoutType = exports.TimeoutType = exports.FAILURE_SOURCE = void 0;
exports.ensureApplicationFailure = ensureApplicationFailure;
exports.ensureTemporalFailure = ensureTemporalFailure;
exports.rootCause = rootCause;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
const internal_workflow_1 = __webpack_require__(/*! ./internal-workflow */ "./node_modules/@temporalio/common/lib/internal-workflow/index.js");
exports.FAILURE_SOURCE = 'TypeScriptSDK';
exports.TimeoutType = {
    START_TO_CLOSE: 'START_TO_CLOSE',
    SCHEDULE_TO_START: 'SCHEDULE_TO_START',
    SCHEDULE_TO_CLOSE: 'SCHEDULE_TO_CLOSE',
    HEARTBEAT: 'HEARTBEAT',
    /** @deprecated Use {@link START_TO_CLOSE} instead. */
    TIMEOUT_TYPE_START_TO_CLOSE: 'START_TO_CLOSE', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link SCHEDULE_TO_START} instead. */
    TIMEOUT_TYPE_SCHEDULE_TO_START: 'SCHEDULE_TO_START', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link SCHEDULE_TO_CLOSE} instead. */
    TIMEOUT_TYPE_SCHEDULE_TO_CLOSE: 'SCHEDULE_TO_CLOSE', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link HEARTBEAT} instead. */
    TIMEOUT_TYPE_HEARTBEAT: 'HEARTBEAT', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use `undefined` instead. */
    TIMEOUT_TYPE_UNSPECIFIED: undefined, // eslint-disable-line deprecation/deprecation
};
_a = (0, internal_workflow_1.makeProtoEnumConverters)({
    [exports.TimeoutType.START_TO_CLOSE]: 1,
    [exports.TimeoutType.SCHEDULE_TO_START]: 2,
    [exports.TimeoutType.SCHEDULE_TO_CLOSE]: 3,
    [exports.TimeoutType.HEARTBEAT]: 4,
    UNSPECIFIED: 0,
}, 'TIMEOUT_TYPE_'), exports.encodeTimeoutType = _a[0], exports.decodeTimeoutType = _a[1];
exports.RetryState = {
    IN_PROGRESS: 'IN_PROGRESS',
    NON_RETRYABLE_FAILURE: 'NON_RETRYABLE_FAILURE',
    TIMEOUT: 'TIMEOUT',
    MAXIMUM_ATTEMPTS_REACHED: 'MAXIMUM_ATTEMPTS_REACHED',
    RETRY_POLICY_NOT_SET: 'RETRY_POLICY_NOT_SET',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    CANCEL_REQUESTED: 'CANCEL_REQUESTED',
    /** @deprecated Use {@link IN_PROGRESS} instead. */
    RETRY_STATE_IN_PROGRESS: 'IN_PROGRESS', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link NON_RETRYABLE_FAILURE} instead. */
    RETRY_STATE_NON_RETRYABLE_FAILURE: 'NON_RETRYABLE_FAILURE', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link TIMEOUT} instead. */
    RETRY_STATE_TIMEOUT: 'TIMEOUT', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link MAXIMUM_ATTEMPTS_REACHED} instead. */
    RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED: 'MAXIMUM_ATTEMPTS_REACHED', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link RETRY_POLICY_NOT_SET} instead. */
    RETRY_STATE_RETRY_POLICY_NOT_SET: 'RETRY_POLICY_NOT_SET', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link INTERNAL_SERVER_ERROR} instead. */
    RETRY_STATE_INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link CANCEL_REQUESTED} instead. */
    RETRY_STATE_CANCEL_REQUESTED: 'CANCEL_REQUESTED', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use `undefined` instead. */
    RETRY_STATE_UNSPECIFIED: undefined, // eslint-disable-line deprecation/deprecation
};
_b = (0, internal_workflow_1.makeProtoEnumConverters)({
    [exports.RetryState.IN_PROGRESS]: 1,
    [exports.RetryState.NON_RETRYABLE_FAILURE]: 2,
    [exports.RetryState.TIMEOUT]: 3,
    [exports.RetryState.MAXIMUM_ATTEMPTS_REACHED]: 4,
    [exports.RetryState.RETRY_POLICY_NOT_SET]: 5,
    [exports.RetryState.INTERNAL_SERVER_ERROR]: 6,
    [exports.RetryState.CANCEL_REQUESTED]: 7,
    UNSPECIFIED: 0,
}, 'RETRY_STATE_'), exports.encodeRetryState = _b[0], exports.decodeRetryState = _b[1];
/**
 * Represents failures that can cross Workflow and Activity boundaries.
 *
 * **Never extend this class or any of its children.**
 *
 * The only child class you should ever throw from your code is {@link ApplicationFailure}.
 */
let TemporalFailure = class TemporalFailure extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
    }
};
exports.TemporalFailure = TemporalFailure;
exports.TemporalFailure = TemporalFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TemporalFailure')
], TemporalFailure);
/** Exceptions originated at the Temporal service. */
let ServerFailure = class ServerFailure extends TemporalFailure {
    constructor(message, nonRetryable, cause) {
        super(message, cause);
        this.nonRetryable = nonRetryable;
    }
};
exports.ServerFailure = ServerFailure;
exports.ServerFailure = ServerFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ServerFailure')
], ServerFailure);
/**
 * `ApplicationFailure`s are used to communicate application-specific failures in Workflows and Activities.
 *
 * The {@link type} property is matched against {@link RetryPolicy.nonRetryableErrorTypes} to determine if an instance
 * of this error is retryable. Another way to avoid retrying is by setting the {@link nonRetryable} flag to `true`.
 *
 * In Workflows, if you throw a non-`ApplicationFailure`, the Workflow Task will fail and be retried. If you throw an
 * `ApplicationFailure`, the Workflow Execution will fail.
 *
 * In Activities, you can either throw an `ApplicationFailure` or another `Error` to fail the Activity Task. In the
 * latter case, the `Error` will be converted to an `ApplicationFailure`. The conversion is done as following:
 *
 * - `type` is set to `error.constructor?.name ?? error.name`
 * - `message` is set to `error.message`
 * - `nonRetryable` is set to false
 * - `details` are set to null
 * - stack trace is copied from the original error
 *
 * When an {@link https://docs.temporal.io/concepts/what-is-an-activity-execution | Activity Execution} fails, the
 * `ApplicationFailure` from the last Activity Task will be the `cause` of the {@link ActivityFailure} thrown in the
 * Workflow.
 */
let ApplicationFailure = class ApplicationFailure extends TemporalFailure {
    /**
     * Alternatively, use {@link fromError} or {@link create}.
     */
    constructor(message, type, nonRetryable, details, cause, nextRetryDelay) {
        super(message, cause);
        this.type = type;
        this.nonRetryable = nonRetryable;
        this.details = details;
        this.nextRetryDelay = nextRetryDelay;
    }
    /**
     * Create a new `ApplicationFailure` from an Error object.
     *
     * First calls {@link ensureApplicationFailure | `ensureApplicationFailure(error)`} and then overrides any fields
     * provided in `overrides`.
     */
    static fromError(error, overrides) {
        const failure = ensureApplicationFailure(error);
        Object.assign(failure, overrides);
        return failure;
    }
    /**
     * Create a new `ApplicationFailure`.
     *
     * By default, will be retryable (unless its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}).
     */
    static create(options) {
        const { message, type, nonRetryable = false, details, nextRetryDelay, cause } = options;
        return new this(message, type, nonRetryable, details, cause, nextRetryDelay);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to false. Note that this error will still
     * not be retried if its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}.
     *
     * @param message Optional error message
     * @param type Optional error type (used by {@link RetryPolicy.nonRetryableErrorTypes})
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static retryable(message, type, ...details) {
        return new this(message, type ?? 'Error', false, details);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to true.
     *
     * When thrown from an Activity or Workflow, the Activity or Workflow will not be retried (even if `type` is not
     * listed in {@link RetryPolicy.nonRetryableErrorTypes}).
     *
     * @param message Optional error message
     * @param type Optional error type
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static nonRetryable(message, type, ...details) {
        return new this(message, type ?? 'Error', true, details);
    }
};
exports.ApplicationFailure = ApplicationFailure;
exports.ApplicationFailure = ApplicationFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ApplicationFailure')
], ApplicationFailure);
/**
 * This error is thrown when Cancellation has been requested. To allow Cancellation to happen, let it propagate. To
 * ignore Cancellation, catch it and continue executing. Note that Cancellation can only be requested a single time, so
 * your Workflow/Activity Execution will not receive further Cancellation requests.
 *
 * When a Workflow or Activity has been successfully cancelled, a `CancelledFailure` will be the `cause`.
 */
let CancelledFailure = class CancelledFailure extends TemporalFailure {
    constructor(message, details = [], cause) {
        super(message, cause);
        this.details = details;
    }
};
exports.CancelledFailure = CancelledFailure;
exports.CancelledFailure = CancelledFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('CancelledFailure')
], CancelledFailure);
/**
 * Used as the `cause` when a Workflow has been terminated
 */
let TerminatedFailure = class TerminatedFailure extends TemporalFailure {
    constructor(message, cause) {
        super(message, cause);
    }
};
exports.TerminatedFailure = TerminatedFailure;
exports.TerminatedFailure = TerminatedFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TerminatedFailure')
], TerminatedFailure);
/**
 * Used to represent timeouts of Activities and Workflows
 */
let TimeoutFailure = class TimeoutFailure extends TemporalFailure {
    constructor(message, lastHeartbeatDetails, timeoutType) {
        super(message);
        this.lastHeartbeatDetails = lastHeartbeatDetails;
        this.timeoutType = timeoutType;
    }
};
exports.TimeoutFailure = TimeoutFailure;
exports.TimeoutFailure = TimeoutFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TimeoutFailure')
], TimeoutFailure);
/**
 * Contains information about an Activity failure. Always contains the original reason for the failure as its `cause`.
 * For example, if an Activity timed out, the cause will be a {@link TimeoutFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
let ActivityFailure = class ActivityFailure extends TemporalFailure {
    constructor(message, activityType, activityId, retryState, identity, cause) {
        super(message, cause);
        this.activityType = activityType;
        this.activityId = activityId;
        this.retryState = retryState;
        this.identity = identity;
    }
};
exports.ActivityFailure = ActivityFailure;
exports.ActivityFailure = ActivityFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ActivityFailure')
], ActivityFailure);
/**
 * Contains information about a Child Workflow failure. Always contains the reason for the failure as its {@link cause}.
 * For example, if the Child was Terminated, the `cause` is a {@link TerminatedFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
let ChildWorkflowFailure = class ChildWorkflowFailure extends TemporalFailure {
    constructor(namespace, execution, workflowType, retryState, cause) {
        super('Child Workflow execution failed', cause);
        this.namespace = namespace;
        this.execution = execution;
        this.workflowType = workflowType;
        this.retryState = retryState;
    }
};
exports.ChildWorkflowFailure = ChildWorkflowFailure;
exports.ChildWorkflowFailure = ChildWorkflowFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ChildWorkflowFailure')
], ChildWorkflowFailure);
/**
 * This exception is thrown in the following cases:
 *  - Workflow with the same Workflow ID is currently running and the {@link WorkflowOptions.workflowIdConflictPolicy} is `WORKFLOW_ID_CONFLICT_POLICY_FAIL`
 *  - There is a closed Workflow with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE`
 *  - There is closed Workflow in the `Completed` state with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY`
 */
let WorkflowExecutionAlreadyStartedError = class WorkflowExecutionAlreadyStartedError extends TemporalFailure {
    constructor(message, workflowId, workflowType) {
        super(message);
        this.workflowId = workflowId;
        this.workflowType = workflowType;
    }
};
exports.WorkflowExecutionAlreadyStartedError = WorkflowExecutionAlreadyStartedError;
exports.WorkflowExecutionAlreadyStartedError = WorkflowExecutionAlreadyStartedError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowExecutionAlreadyStartedError')
], WorkflowExecutionAlreadyStartedError);
/**
 * If `error` is already an `ApplicationFailure`, returns `error`.
 *
 * Otherwise, converts `error` into an `ApplicationFailure` with:
 *
 * - `message`: `error.message` or `String(error)`
 * - `type`: `error.constructor.name` or `error.name`
 * - `stack`: `error.stack` or `''`
 */
function ensureApplicationFailure(error) {
    if (error instanceof ApplicationFailure) {
        return error;
    }
    const message = ((0, type_helpers_1.isRecord)(error) && String(error.message)) || String(error);
    const type = ((0, type_helpers_1.isRecord)(error) && (error.constructor?.name ?? error.name)) || undefined;
    const failure = ApplicationFailure.create({ message, type, nonRetryable: false });
    failure.stack = ((0, type_helpers_1.isRecord)(error) && String(error.stack)) || '';
    return failure;
}
/**
 * If `err` is an Error it is turned into an `ApplicationFailure`.
 *
 * If `err` was already a `TemporalFailure`, returns the original error.
 *
 * Otherwise returns an `ApplicationFailure` with `String(err)` as the message.
 */
function ensureTemporalFailure(err) {
    if (err instanceof TemporalFailure) {
        return err;
    }
    return ensureApplicationFailure(err);
}
/**
 * Get the root cause message of given `error`.
 *
 * In case `error` is a {@link TemporalFailure}, recurse the `cause` chain and return the root `cause.message`.
 * Otherwise, return `error.message`.
 */
function rootCause(error) {
    if (error instanceof TemporalFailure) {
        return error.cause ? rootCause(error.cause) : error.message;
    }
    return (0, type_helpers_1.errorMessage)(error);
}


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/index.js":
/*!******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/index.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * Common library for code that's used across the Client, Worker, and/or Workflow
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.u8 = u8;
exports.str = str;
exports.errorMessage = errorMessage;
exports.errorCode = errorCode;
const encoding = __importStar(__webpack_require__(/*! ./encoding */ "./node_modules/@temporalio/common/lib/encoding.js"));
const helpers = __importStar(__webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js"));
__exportStar(__webpack_require__(/*! ./activity-options */ "./node_modules/@temporalio/common/lib/activity-options.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/data-converter */ "./node_modules/@temporalio/common/lib/converter/data-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/failure-converter */ "./node_modules/@temporalio/common/lib/converter/failure-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-codec */ "./node_modules/@temporalio/common/lib/converter/payload-codec.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/types */ "./node_modules/@temporalio/common/lib/converter/types.js"), exports);
__exportStar(__webpack_require__(/*! ./deprecated-time */ "./node_modules/@temporalio/common/lib/deprecated-time.js"), exports);
__exportStar(__webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./failure */ "./node_modules/@temporalio/common/lib/failure.js"), exports);
__exportStar(__webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/common/lib/interfaces.js"), exports);
__exportStar(__webpack_require__(/*! ./logger */ "./node_modules/@temporalio/common/lib/logger.js"), exports);
__exportStar(__webpack_require__(/*! ./retry-policy */ "./node_modules/@temporalio/common/lib/retry-policy.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-handle */ "./node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-options */ "./node_modules/@temporalio/common/lib/workflow-options.js"), exports);
__exportStar(__webpack_require__(/*! ./versioning-intent */ "./node_modules/@temporalio/common/lib/versioning-intent.js"), exports);
/**
 * Encode a UTF-8 string into a Uint8Array
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function u8(s) {
    return encoding.encode(s);
}
/**
 * Decode a Uint8Array into a UTF-8 string
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function str(arr) {
    return encoding.decode(arr);
}
/**
 * Get `error.message` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorMessage(error) {
    return helpers.errorMessage(error);
}
/**
 * Get `error.code` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorCode(error) {
    return helpers.errorCode(error);
}


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/interceptors.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/interceptors.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.composeInterceptors = composeInterceptors;
/**
 * Compose all interceptor methods into a single function.
 *
 * Calling the composed function results in calling each of the provided interceptor, in order (from the first to
 * the last), followed by the original function provided as argument to `composeInterceptors()`.
 *
 * @param interceptors a list of interceptors
 * @param method the name of the interceptor method to compose
 * @param next the original function to be executed at the end of the interception chain
 */
// ts-prune-ignore-next (imported via lib/interceptors)
function composeInterceptors(interceptors, method, next) {
    for (let i = interceptors.length - 1; i >= 0; --i) {
        const interceptor = interceptors[i];
        if (interceptor[method] !== undefined) {
            const prev = next;
            // We lose type safety here because Typescript can't deduce that interceptor[method] is a function that returns
            // the same type as Next<I, M>
            next = ((input) => interceptor[method](input, prev));
        }
    }
    return next;
}


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/interfaces.js":
/*!***********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/interfaces.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandlerUnfinishedPolicy = void 0;
/**
 * Policy defining actions taken when a workflow exits while update or signal handlers are running.
 * The workflow exit may be due to successful return, failure, cancellation, or continue-as-new.
 */
exports.HandlerUnfinishedPolicy = {
    /**
     * Issue a warning in addition to abandoning the handler execution. The warning will not be issued if the workflow fails.
     */
    WARN_AND_ABANDON: 'WARN_AND_ABANDON',
    /**
     * Abandon the handler execution.
     *
     * In the case of an update handler this means that the client will receive an error rather than
     * the update result.
     */
    ABANDON: 'ABANDON',
};


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/internal-workflow/enums-helpers.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/internal-workflow/enums-helpers.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeProtoEnumConverters = makeProtoEnumConverters;
const errors_1 = __webpack_require__(/*! ../errors */ "./node_modules/@temporalio/common/lib/errors.js");
/**
 * Create encoding and decoding functions to convert between the numeric `enum` types produced by our
 * Protobuf compiler and "const object of strings" enum values that we expose in our public APIs.
 *
 * ### Usage
 *
 * Newly introduced enums should follow the following pattern:
 *
 * ```ts
 *     type ParentClosePolicy = (typeof ParentClosePolicy)[keyof typeof ParentClosePolicy];
 *     const ParentClosePolicy = {
 *       TERMINATE: 'TERMINATE',
 *       ABANDON: 'ABANDON',
 *       REQUEST_CANCEL: 'REQUEST_CANCEL',
 *     } as const;
 *
 *     const [encodeParentClosePolicy, decodeParentClosePolicy] = //
 *       makeProtoEnumConverters<
 *         coresdk.child_workflow.ParentClosePolicy,
 *         typeof coresdk.child_workflow.ParentClosePolicy,
 *         keyof typeof coresdk.child_workflow.ParentClosePolicy,
 *         typeof ParentClosePolicy,
 *         'PARENT_CLOSE_POLICY_'  // This may be an empty string if the proto enum doesn't add a repeated prefix on values
 *       >(
 *         {
 *           [ParentClosePolicy.TERMINATE]: 1, // These numbers must match the ones in the proto enum
 *           [ParentClosePolicy.ABANDON]: 2,
 *           [ParentClosePolicy.REQUEST_CANCEL]: 3,
 *
 *           UNSPECIFIED: 0,
 *         } as const,
 *         'PARENT_CLOSE_POLICY_'
 *       );
 * ```
 *
 * `makeProtoEnumConverters` supports other usage patterns, but they are only meant for
 * backward compatibility with former enum definitions and should not be used for new enums.
 *
 * ### Context
 *
 * Temporal's Protobuf APIs define several `enum` types; our Protobuf compiler transforms these to
 * traditional (i.e. non-const) [TypeScript numeric `enum`s](https://www.typescriptlang.org/docs/handbook/enums.html#numeric-enums).
 *
 * For various reasons, this is far from ideal:
 *
 *  - Due to the dual nature of non-const TypeScript `enum`s (they are both a type and a value),
 *    it is not possible to refer to an enum value from code without a "real" import of the enum type
 *    (i.e. can't simply do `import type ...`). In Workflow code, such an import would result in
 *    loading our entire Protobuf definitions into the workflow sandbox, adding several megabytes to
 *    the per-workflow memory footprint, which is unacceptable; to avoid that, we need to maintain
 *    a mirror copy of each enum types used by in-workflow APIs, and export these from either
 *    `@temporalio/common` or `@temporalio/workflow`.
 *  - It is not desirable for users to need an explicit dependency on `@temporalio/proto` just to
 *    get access to these enum types; we therefore made it a common practice to reexport these enums
 *    from our public facing packages. However, experience demontrated that these reexports effectively
 *    resulted in poor and inconsistent documentation coverage compared to mirrored enums types.
 *  - Our Protobuf enum types tend to follow a verbose and redundant naming convention, which feels
 *    unatural and excessive according to most TypeScript style guides; e.g. instead of
 *    `workflowIdReusePolicy: WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE`,
 *    a TypeScript developer would generally expect to be able to write something similar to
 *    `workflowIdReusePolicy: 'REJECT_DUPLICATE'`.
 *  - Because of the way Protobuf works, many of our enum types contain an `UNSPECIFIED` value, which
 *    is used to explicitly identify a value that is unset. In TypeScript code, the `undefined` value
 *    already serves that purpose, and is definitely more idiomatic to TS developers, whereas these
 *    `UNSPECIFIED` values create noise and confusion in our APIs.
 *  - TypeScript editors generally do a very bad job at providing autocompletion that implies reaching
 *    for values of a TypeScript enum type, forcing developers to explicitly type in at least part
 *    of the name of the enum type before they can get autocompletion for its values. On the other
 *    hand, all TS editors immediately provide autocompletion for string union types.
 *  - The [TypeScript's official documentation](https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums)
 *    itself suggests that, in modern TypeScript, the use of `as const` objects may generally suffice
 *    and may be advantageous over the use of `enum` types.
 *
 * A const object of strings, combined with a union type of possible string values, provides a much
 * more idiomatic syntax and a better DX for TypeScript developers. This however requires a way to
 * convert back and forth between the `enum` values produced by the Protobuf compiler and the
 * equivalent string values.
 *
 * This helper dynamically creates these conversion functions for a given Protobuf enum type,
 * strongly building upon specific conventions that we have adopted in our Protobuf definitions.
 *
 * ### Validations
 *
 * The complex type signature of this helper is there to prevent most potential incoherencies
 * that could result from having to manually synchronize the const object of strings enum and the
 * conversion table with the proto enum, while not requiring a regular import on the Protobuf enum
 * itself (so it can be used safely for enums meant to be used from workflow code).
 *
 * In particular, failing any of the following invariants will result in build time errors:
 *
 * - For every key of the form `PREFIX_KEY: number` in the proto enum, excluding the `UNSPECIFIED` key:
 *   - There MUST be a corresponding `KEY: 'KEY'` entry in the const object of strings enum;
 *   - There MAY be a corresponding `PREFIX_KEY: 'KEY'` in the const object of strings enum
 *     (this is meant to preserve backward compatibility with the former syntax; such aliases should
 *     not be added for new enums and enum entries introduced going forward);
 *   - There MUST be a corresponding `KEY: number` in the mapping table.
 * - If the proto enum contains a `PREFIX_UNSPECIFIED` entry, then:
 *   - There MAY be a corresponding `PREFIX_UNSPECIFIED: undefined` and/or `UNSPECIFIED: undefined`
 *     entries in the const object of strings enum — this is meant to preserve backward compatibility
 *     with the former syntax; this alias should not be added for new enums introduced going forward;
 *   - There MUST be an `UNSPECIFIED: 0` in the mapping table.
 * - The const object of strings enum MUST NOT contain any other keys than the ones mandated or
 *   optionally allowed be the preceeding rules.
 * - The mapping table MUST NOT contain any other keys than the ones mandated above.
 *
 * These rules notably ensure that whenever a new value is added to an existing Proto enum, the code
 * will fail to compile until the corresponding entry is added on the const object of strings enum
 * and the mapping table.
 *
 * @internal
 */
function makeProtoEnumConverters(mapTable, prefix) {
    const reverseTable = Object.fromEntries(Object.entries(mapTable).map(([k, v]) => [v, k]));
    const hasUnspecified = mapTable['UNSPECIFIED'] === 0 || mapTable[`${prefix}UNSPECIFIED`] === 0;
    function isShortStringEnumKeys(x) {
        return typeof x === 'string' && x in mapTable;
    }
    function isNumericEnumValue(x) {
        return typeof x === 'number' && x in reverseTable;
    }
    function encode(input) {
        if (input == null) {
            return undefined;
        }
        else if (typeof input === 'string') {
            let shorten = input;
            if (shorten.startsWith(prefix)) {
                shorten = shorten.slice(prefix.length);
            }
            if (isShortStringEnumKeys(shorten)) {
                return mapTable[shorten];
            }
            throw new errors_1.ValueError(`Invalid enum value: '${input}'`);
        }
        else if (typeof input === 'number') {
            return input;
        }
        else {
            throw new errors_1.ValueError(`Invalid enum value: '${input}' of type ${typeof input}`);
        }
    }
    function decode(input) {
        if (input == null) {
            return undefined;
        }
        else if (typeof input === 'number') {
            if (hasUnspecified && input === 0) {
                return undefined;
            }
            if (isNumericEnumValue(input)) {
                return reverseTable[input];
            }
            // We got a proto enum value that we don't yet know about (i.e. it didn't exist when this code
            // was compiled). This is certainly a possibility, but given how our APIs evolve, this is is
            // unlikely to be a terribly bad thing by itself (we avoid adding new enum values in places
            // that would break backward compatibility with existing deployed code). Therefore, throwing
            // on "unexpected" values is likely to end up causing more problems than it might avoid,
            // especially given that the decoded value may actually never get read anwyay.
            //
            // Therefore, we instead cheat on type constraints and return a string of the form "unknown_23".
            // That somewhat mirrors the behavior we'd get with the pure numerical approach.
            return `unknown_${input}`;
        }
        throw new errors_1.ValueError(`Invalid proto enum value: '${input}' of type ${typeof input}`);
    }
    return [encode, decode];
}


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/internal-workflow/index.js":
/*!************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/internal-workflow/index.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./enums-helpers */ "./node_modules/@temporalio/common/lib/internal-workflow/enums-helpers.js"), exports);


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/logger.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/logger.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SdkComponent = void 0;
/**
 * Possible values of the `sdkComponent` meta attributes on log messages. This
 * attribute indicates which subsystem emitted the log message; this may for
 * example be used to implement fine-grained filtering of log messages.
 *
 * Note that there is no guarantee that this list will remain stable in the
 * future; values may be added or removed, and messages that are currently
 * emitted with some `sdkComponent` value may use a different value in the future.
 */
var SdkComponent;
(function (SdkComponent) {
    /**
     * Component name for messages emited from Workflow code, using the {@link Workflow context logger|workflow.log}.
     * The SDK itself never publishes messages with this component name.
     */
    SdkComponent["workflow"] = "workflow";
    /**
     * Component name for messages emited from an activity, using the {@link activity context logger|Context.log}.
     * The SDK itself never publishes messages with this component name.
     */
    SdkComponent["activity"] = "activity";
    /**
     * Component name for messages emited from a Temporal Worker instance.
     *
     * This notably includes:
     * - Issues with Worker or runtime configuration, or the JS execution environment;
     * - Worker's, Activity's, and Workflow's lifecycle events;
     * - Workflow Activation and Activity Task processing events;
     * - Workflow bundling messages;
     * - Sink processing issues.
     */
    SdkComponent["worker"] = "worker";
    /**
     * Component name for all messages emitted by the Rust Core SDK library.
     */
    SdkComponent["core"] = "core";
})(SdkComponent || (exports.SdkComponent = SdkComponent = {}));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/retry-policy.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/retry-policy.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.compileRetryPolicy = compileRetryPolicy;
exports.decompileRetryPolicy = decompileRetryPolicy;
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js");
const time_1 = __webpack_require__(/*! ./time */ "./node_modules/@temporalio/common/lib/time.js");
/**
 * Turn a TS RetryPolicy into a proto compatible RetryPolicy
 */
function compileRetryPolicy(retryPolicy) {
    if (retryPolicy.backoffCoefficient != null && retryPolicy.backoffCoefficient <= 0) {
        throw new errors_1.ValueError('RetryPolicy.backoffCoefficient must be greater than 0');
    }
    if (retryPolicy.maximumAttempts != null) {
        if (retryPolicy.maximumAttempts === Number.POSITIVE_INFINITY) {
            // drop field (Infinity is the default)
            const { maximumAttempts: _, ...without } = retryPolicy;
            retryPolicy = without;
        }
        else if (retryPolicy.maximumAttempts <= 0) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be a positive integer');
        }
        else if (!Number.isInteger(retryPolicy.maximumAttempts)) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be an integer');
        }
    }
    const maximumInterval = (0, time_1.msOptionalToNumber)(retryPolicy.maximumInterval);
    const initialInterval = (0, time_1.msToNumber)(retryPolicy.initialInterval ?? 1000);
    if (maximumInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be 0');
    }
    if (initialInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.initialInterval cannot be 0');
    }
    if (maximumInterval != null && maximumInterval < initialInterval) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be less than its initialInterval');
    }
    return {
        maximumAttempts: retryPolicy.maximumAttempts,
        initialInterval: (0, time_1.msToTs)(initialInterval),
        maximumInterval: (0, time_1.msOptionalToTs)(maximumInterval),
        backoffCoefficient: retryPolicy.backoffCoefficient,
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes,
    };
}
/**
 * Turn a proto compatible RetryPolicy into a TS RetryPolicy
 */
function decompileRetryPolicy(retryPolicy) {
    if (!retryPolicy) {
        return undefined;
    }
    return {
        backoffCoefficient: retryPolicy.backoffCoefficient ?? undefined,
        maximumAttempts: retryPolicy.maximumAttempts ?? undefined,
        maximumInterval: (0, time_1.optionalTsToMs)(retryPolicy.maximumInterval),
        initialInterval: (0, time_1.optionalTsToMs)(retryPolicy.initialInterval),
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes ?? undefined,
    };
}


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/time.js":
/*!*****************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/time.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalTsToMs = optionalTsToMs;
exports.requiredTsToMs = requiredTsToMs;
exports.tsToMs = tsToMs;
exports.msNumberToTs = msNumberToTs;
exports.msToTs = msToTs;
exports.msOptionalToTs = msOptionalToTs;
exports.msOptionalToNumber = msOptionalToNumber;
exports.msToNumber = msToNumber;
exports.tsToDate = tsToDate;
exports.requiredTsToDate = requiredTsToDate;
exports.optionalTsToDate = optionalTsToDate;
exports.optionalDateToTs = optionalDateToTs;
const long_1 = __importDefault(__webpack_require__(/*! long */ "./node_modules/long/umd/index.js")); // eslint-disable-line import/no-named-as-default
const ms_1 = __importDefault(__webpack_require__(/*! ms */ "./node_modules/ms/dist/index.cjs"));
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js");
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 */
function optionalTsToMs(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return tsToMs(ts);
}
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined, throws a TypeError, with error message including the name of the field.
 */
function requiredTsToMs(ts, fieldName) {
    if (ts === undefined || ts === null) {
        throw new TypeError(`Expected ${fieldName} to be a timestamp, got ${ts}`);
    }
    return tsToMs(ts);
}
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 */
function tsToMs(ts) {
    if (ts === undefined || ts === null) {
        throw new Error(`Expected timestamp, got ${ts}`);
    }
    const { seconds, nanos } = ts;
    return (seconds || long_1.default.UZERO)
        .mul(1000)
        .add(Math.floor((nanos || 0) / 1000000))
        .toNumber();
}
function msNumberToTs(millis) {
    const seconds = Math.floor(millis / 1000);
    const nanos = (millis % 1000) * 1000000;
    if (Number.isNaN(seconds) || Number.isNaN(nanos)) {
        throw new errors_1.ValueError(`Invalid millis ${millis}`);
    }
    return { seconds: long_1.default.fromNumber(seconds), nanos };
}
function msToTs(str) {
    return msNumberToTs(msToNumber(str));
}
function msOptionalToTs(str) {
    return str ? msToTs(str) : undefined;
}
function msOptionalToNumber(val) {
    if (val === undefined)
        return undefined;
    return msToNumber(val);
}
function msToNumber(val) {
    if (typeof val === 'number') {
        return val;
    }
    return msWithValidation(val);
}
function msWithValidation(str) {
    const millis = (0, ms_1.default)(str);
    if (millis == null || isNaN(millis)) {
        throw new TypeError(`Invalid duration string: '${str}'`);
    }
    return millis;
}
function tsToDate(ts) {
    return new Date(tsToMs(ts));
}
// ts-prune-ignore-next
function requiredTsToDate(ts, fieldName) {
    return new Date(requiredTsToMs(ts, fieldName));
}
function optionalTsToDate(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return new Date(tsToMs(ts));
}
// ts-prune-ignore-next (imported via schedule-helpers.ts)
function optionalDateToTs(date) {
    if (date === undefined || date === null) {
        return undefined;
    }
    return msToTs(date.getTime());
}


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/type-helpers.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/type-helpers.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkExtends = checkExtends;
exports.isRecord = isRecord;
exports.hasOwnProperty = hasOwnProperty;
exports.hasOwnProperties = hasOwnProperties;
exports.isError = isError;
exports.isAbortError = isAbortError;
exports.errorMessage = errorMessage;
exports.errorCode = errorCode;
exports.assertNever = assertNever;
exports.SymbolBasedInstanceOfError = SymbolBasedInstanceOfError;
exports.deepFreeze = deepFreeze;
/** Verify that an type _Copy extends _Orig */
function checkExtends() {
    // noop, just type check
}
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function hasOwnProperty(record, prop) {
    return prop in record;
}
function hasOwnProperties(record, props) {
    return props.every((prop) => prop in record);
}
function isError(error) {
    return (isRecord(error) &&
        typeof error.name === 'string' &&
        typeof error.message === 'string' &&
        (error.stack == null || typeof error.stack === 'string'));
}
function isAbortError(error) {
    return isError(error) && error.name === 'AbortError';
}
/**
 * Get `error.message` (or `undefined` if not present)
 */
function errorMessage(error) {
    if (isError(error)) {
        return error.message;
    }
    else if (typeof error === 'string') {
        return error;
    }
    return undefined;
}
function isErrorWithCode(error) {
    return isRecord(error) && typeof error.code === 'string';
}
/**
 * Get `error.code` (or `undefined` if not present)
 */
function errorCode(error) {
    if (isErrorWithCode(error)) {
        return error.code;
    }
    return undefined;
}
/**
 * Asserts that some type is the never type
 */
function assertNever(msg, x) {
    throw new TypeError(msg + ': ' + x);
}
/**
 * A decorator to be used on error classes. It adds the 'name' property AND provides a custom
 * 'instanceof' handler that works correctly across execution contexts.
 *
 * ### Details ###
 *
 * According to the EcmaScript's spec, the default behavior of JavaScript's `x instanceof Y` operator is to walk up the
 * prototype chain of object 'x', checking if any constructor in that hierarchy is _exactly the same object_ as the
 * constructor function 'Y'.
 *
 * Unfortunately, it happens in various situations that different constructor function objects get created for what
 * appears to be the very same class. This leads to surprising behavior where `instanceof` returns false though it is
 * known that the object is indeed an instance of that class. One particular case where this happens is when constructor
 * 'Y' belongs to a different realm than the constuctor with which 'x' was instantiated. Another case is when two copies
 * of the same library gets loaded in the same realm.
 *
 * In practice, this tends to cause issues when crossing the workflow-sandboxing boundary (since Node's vm module
 * really creates new execution realms), as well as when running tests using Jest (see https://github.com/jestjs/jest/issues/2549
 * for some details on that one).
 *
 * This function injects a custom 'instanceof' handler into the prototype of 'clazz', which is both cross-realm safe and
 * cross-copies-of-the-same-lib safe. It works by adding a special symbol property to the prototype of 'clazz', and then
 * checking for the presence of that symbol.
 */
function SymbolBasedInstanceOfError(markerName) {
    return (clazz) => {
        const marker = Symbol.for(`__temporal_is${markerName}`);
        Object.defineProperty(clazz.prototype, 'name', { value: markerName, enumerable: true });
        Object.defineProperty(clazz.prototype, marker, { value: true, enumerable: false });
        Object.defineProperty(clazz, Symbol.hasInstance, {
            // eslint-disable-next-line object-shorthand
            value: function (error) {
                if (this === clazz) {
                    return isRecord(error) && error[marker] === true;
                }
                else {
                    // 'this' must be a _subclass_ of clazz that doesn't redefined [Symbol.hasInstance], so that it inherited
                    // from clazz's [Symbol.hasInstance]. If we don't handle this particular situation, then
                    // `x instanceof SubclassOfParent` would return true for any instance of 'Parent', which is clearly wrong.
                    //
                    // Ideally, it'd be preferable to avoid this case entirely, by making sure that all subclasses of 'clazz'
                    // redefine [Symbol.hasInstance], but we can't enforce that. We therefore fallback to the default instanceof
                    // behavior (which is NOT cross-realm safe).
                    return this.prototype.isPrototypeOf(error); // eslint-disable-line no-prototype-builtins
                }
            },
        });
    };
}
// Thanks MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
function deepFreeze(object) {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);
    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];
        if (value && typeof value === 'object') {
            try {
                deepFreeze(value);
            }
            catch (_err) {
                // This is okay, there are some typed arrays that cannot be frozen (encodingKeys)
            }
        }
        else if (typeof value === 'function') {
            Object.freeze(value);
        }
    }
    return Object.freeze(object);
}


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/versioning-intent-enum.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/versioning-intent-enum.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VersioningIntent = void 0;
exports.versioningIntentToProto = versioningIntentToProto;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from coresdk.common.VersioningIntent
/**
 * Protobuf enum representation of {@link VersioningIntentString}.
 *
 * @experimental
 */
var VersioningIntent;
(function (VersioningIntent) {
    VersioningIntent[VersioningIntent["UNSPECIFIED"] = 0] = "UNSPECIFIED";
    VersioningIntent[VersioningIntent["COMPATIBLE"] = 1] = "COMPATIBLE";
    VersioningIntent[VersioningIntent["DEFAULT"] = 2] = "DEFAULT";
})(VersioningIntent || (exports.VersioningIntent = VersioningIntent = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
function versioningIntentToProto(intent) {
    switch (intent) {
        case 'DEFAULT':
            return VersioningIntent.DEFAULT;
        case 'COMPATIBLE':
            return VersioningIntent.COMPATIBLE;
        case undefined:
            return VersioningIntent.UNSPECIFIED;
        default:
            (0, type_helpers_1.assertNever)('Unexpected VersioningIntent', intent);
    }
}


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/versioning-intent.js":
/*!******************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/versioning-intent.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/workflow-handle.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/workflow-handle.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/workflow-options.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/workflow-options.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeWorkflowIdConflictPolicy = exports.encodeWorkflowIdConflictPolicy = exports.WorkflowIdConflictPolicy = exports.decodeWorkflowIdReusePolicy = exports.encodeWorkflowIdReusePolicy = exports.WorkflowIdReusePolicy = void 0;
exports.extractWorkflowType = extractWorkflowType;
const internal_workflow_1 = __webpack_require__(/*! ./internal-workflow */ "./node_modules/@temporalio/common/lib/internal-workflow/index.js");
/**
 * Defines what happens when trying to start a Workflow with the same ID as a *Closed* Workflow.
 *
 * See {@link WorkflowOptions.workflowIdConflictPolicy} for what happens when trying to start a
 * Workflow with the same ID as a *Running* Workflow.
 *
 * Concept: {@link https://docs.temporal.io/concepts/what-is-a-workflow-id-reuse-policy/ | Workflow Id Reuse Policy}
 *
 * *Note: It is not possible to have two actively running Workflows with the same ID.*
 *
 */
exports.WorkflowIdReusePolicy = {
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state.
     * @default
     */
    ALLOW_DUPLICATE: 'ALLOW_DUPLICATE',
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state that is not Completed.
     */
    ALLOW_DUPLICATE_FAILED_ONLY: 'ALLOW_DUPLICATE_FAILED_ONLY',
    /**
     * The Workflow cannot be started.
     */
    REJECT_DUPLICATE: 'REJECT_DUPLICATE',
    /**
     * Terminate the current Workflow if one is already running; otherwise allow reusing the Workflow ID.
     *
     * @deprecated Use {@link WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE} instead, and
     *             set `WorkflowOptions.workflowIdConflictPolicy` to
     *             {@link WorkflowIdConflictPolicy.WORKFLOW_ID_CONFLICT_POLICY_TERMINATE_EXISTING}.
     *             When using this option, `WorkflowOptions.workflowIdConflictPolicy` must be left unspecified.
     */
    TERMINATE_IF_RUNNING: 'TERMINATE_IF_RUNNING', // eslint-disable-line deprecation/deprecation
    /// Anything below this line has been deprecated
    /**
     * No need to use this. If a `WorkflowIdReusePolicy` is set to this, or is not set at all, the default value will be used.
     *
     * @deprecated Either leave property `undefined`, or use {@link ALLOW_DUPLICATE} instead.
     */
    WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED: undefined, // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link ALLOW_DUPLICATE} instead. */
    WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE: 'ALLOW_DUPLICATE', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link ALLOW_DUPLICATE_FAILED_ONLY} instead. */
    WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY: 'ALLOW_DUPLICATE_FAILED_ONLY', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link REJECT_DUPLICATE} instead. */
    WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE: 'REJECT_DUPLICATE', // eslint-disable-line deprecation/deprecation
    /** @deprecated Use {@link TERMINATE_IF_RUNNING} instead. */
    WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING: 'TERMINATE_IF_RUNNING', // eslint-disable-line deprecation/deprecation
};
_a = (0, internal_workflow_1.makeProtoEnumConverters)({
    [exports.WorkflowIdReusePolicy.ALLOW_DUPLICATE]: 1,
    [exports.WorkflowIdReusePolicy.ALLOW_DUPLICATE_FAILED_ONLY]: 2,
    [exports.WorkflowIdReusePolicy.REJECT_DUPLICATE]: 3,
    [exports.WorkflowIdReusePolicy.TERMINATE_IF_RUNNING]: 4, // eslint-disable-line deprecation/deprecation
    UNSPECIFIED: 0,
}, 'WORKFLOW_ID_REUSE_POLICY_'), exports.encodeWorkflowIdReusePolicy = _a[0], exports.decodeWorkflowIdReusePolicy = _a[1];
exports.WorkflowIdConflictPolicy = {
    /**
     * Do not start a new Workflow. Instead raise a `WorkflowExecutionAlreadyStartedError`.
     */
    FAIL: 'FAIL',
    /**
     * Do not start a new Workflow. Instead return a Workflow Handle for the already Running Workflow.
     */
    USE_EXISTING: 'USE_EXISTING',
    /**
     * Start a new Workflow, terminating the current workflow if one is already running.
     */
    TERMINATE_EXISTING: 'TERMINATE_EXISTING',
};
_b = (0, internal_workflow_1.makeProtoEnumConverters)({
    [exports.WorkflowIdConflictPolicy.FAIL]: 1,
    [exports.WorkflowIdConflictPolicy.USE_EXISTING]: 2,
    [exports.WorkflowIdConflictPolicy.TERMINATE_EXISTING]: 3,
    UNSPECIFIED: 0,
}, 'WORKFLOW_ID_CONFLICT_POLICY_'), exports.encodeWorkflowIdConflictPolicy = _b[0], exports.decodeWorkflowIdConflictPolicy = _b[1];
function extractWorkflowType(workflowTypeOrFunc) {
    if (typeof workflowTypeOrFunc === 'string')
        return workflowTypeOrFunc;
    if (typeof workflowTypeOrFunc === 'function') {
        if (workflowTypeOrFunc?.name)
            return workflowTypeOrFunc.name;
        throw new TypeError('Invalid workflow type: the workflow function is anonymous');
    }
    throw new TypeError(`Invalid workflow type: expected either a string or a function, got '${typeof workflowTypeOrFunc}'`);
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/alea.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/alea.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Mash = void 0;
exports.alea = alea;
// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// Taken and modified from https://github.com/davidbau/seedrandom/blob/released/lib/alea.js
class Alea {
    constructor(seed) {
        const mash = new Mash();
        // Apply the seeding algorithm from Baagoe.
        this.c = 1;
        this.s0 = mash.mash([32]);
        this.s1 = mash.mash([32]);
        this.s2 = mash.mash([32]);
        this.s0 -= mash.mash(seed);
        if (this.s0 < 0) {
            this.s0 += 1;
        }
        this.s1 -= mash.mash(seed);
        if (this.s1 < 0) {
            this.s1 += 1;
        }
        this.s2 -= mash.mash(seed);
        if (this.s2 < 0) {
            this.s2 += 1;
        }
    }
    next() {
        const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
        this.s0 = this.s1;
        this.s1 = this.s2;
        return (this.s2 = t - (this.c = t | 0));
    }
}
function alea(seed) {
    const xg = new Alea(seed);
    return xg.next.bind(xg);
}
class Mash {
    constructor() {
        this.n = 0xefc8249d;
    }
    mash(data) {
        let { n } = this;
        for (let i = 0; i < data.length; i++) {
            n += data[i];
            let h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        this.n = n;
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    }
}
exports.Mash = Mash;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/cancellation-scope.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CancellationScope_cancelRequested;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RootCancellationScope = exports.CancellationScope = exports.AsyncLocalStorage = void 0;
exports.disableStorage = disableStorage;
exports.registerSleepImplementation = registerSleepImplementation;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
// AsyncLocalStorage is injected via vm module into global scope.
// In case Workflow code is imported in Node.js context, replace with an empty class.
exports.AsyncLocalStorage = globalThis.AsyncLocalStorage ?? class {
};
/** Magic symbol used to create the root scope - intentionally not exported */
const NO_PARENT = Symbol('NO_PARENT');
/**
 * Cancellation Scopes provide the mechanic by which a Workflow may gracefully handle incoming requests for cancellation
 * (e.g. in response to {@link WorkflowHandle.cancel} or through the UI or CLI), as well as request cancelation of
 * cancellable operations it owns (e.g. Activities, Timers, Child Workflows, etc).
 *
 * Cancellation Scopes form a tree, with the Workflow's main function running in the root scope of that tree.
 * By default, cancellation propagates down from a parent scope to its children and its cancellable operations.
 * A non-cancellable scope can receive cancellation requests, but is never effectively considered as cancelled,
 * thus shieldding its children and cancellable operations from propagation of cancellation requests it receives.
 *
 * Scopes are created using the `CancellationScope` constructor or the static helper methods {@link cancellable},
 * {@link nonCancellable} and {@link withTimeout}. `withTimeout` creates a scope that automatically cancels itself after
 * some duration.
 *
 * Cancellation of a cancellable scope results in all operations created directly in that scope to throw a
 * {@link CancelledFailure} (either directly, or as the `cause` of an {@link ActivityFailure} or a
 * {@link ChildWorkflowFailure}). Further attempt to create new cancellable scopes or cancellable operations within a
 * scope that has already been cancelled will also immediately throw a {@link CancelledFailure} exception. It is however
 * possible to create a non-cancellable scope at that point; this is often used to execute rollback or cleanup
 * operations. For example:
 *
 * ```ts
 * async function myWorkflow(...): Promise<void> {
 *   try {
 *     // This activity runs in the root cancellation scope. Therefore, a cancelation request on
 *     // the Workflow execution (e.g. through the UI or CLI) automatically propagates to this
 *     // activity. Assuming that the activity properly handle the cancellation request, then the
 *     // call below will throw an `ActivityFailure` exception, with `cause` sets to an
 *     // instance of `CancelledFailure`.
 *     await someActivity();
 *   } catch (e) {
 *     if (isCancellation(e)) {
 *       // Run cleanup activity in a non-cancellable scope
 *       await CancellationScope.nonCancellable(async () => {
 *         await cleanupActivity();
 *       }
 *     } else {
 *       throw e;
 *     }
 *   }
 * }
 * ```
 *
 * A cancellable scope may be programatically cancelled by calling {@link cancel|`scope.cancel()`}`. This may be used,
 * for example, to explicitly request cancellation of an Activity or Child Workflow:
 *
 * ```ts
 * const cancellableActivityScope = new CancellationScope();
 * const activityPromise = cancellableActivityScope.run(() => someActivity());
 * cancellableActivityScope.cancel(); // Cancels the activity
 * await activityPromise; // Throws `ActivityFailure` with `cause` set to `CancelledFailure`
 * ```
 */
class CancellationScope {
    constructor(options) {
        _CancellationScope_cancelRequested.set(this, false);
        this.timeout = (0, time_1.msOptionalToNumber)(options?.timeout);
        this.cancellable = options?.cancellable ?? true;
        this.cancelRequested = new Promise((_, reject) => {
            // @ts-expect-error TSC doesn't understand that the Promise executor runs synchronously
            this.reject = (err) => {
                __classPrivateFieldSet(this, _CancellationScope_cancelRequested, true, "f");
                reject(err);
            };
        });
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested);
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested.catch(() => undefined));
        if (options?.parent !== NO_PARENT) {
            this.parent = options?.parent || CancellationScope.current();
            if (this.parent.cancellable ||
                (__classPrivateFieldGet(this.parent, _CancellationScope_cancelRequested, "f") &&
                    !(0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation))) {
                __classPrivateFieldSet(this, _CancellationScope_cancelRequested, __classPrivateFieldGet(this.parent, _CancellationScope_cancelRequested, "f"), "f");
                (0, stack_helpers_1.untrackPromise)(this.parent.cancelRequested.catch((err) => {
                    this.reject(err);
                }));
            }
            else {
                (0, stack_helpers_1.untrackPromise)(this.parent.cancelRequested.catch((err) => {
                    if (!(0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
                        this.reject(err);
                    }
                }));
            }
        }
    }
    /**
     * Whether the scope was effectively cancelled. A non-cancellable scope can never be considered cancelled.
     */
    get consideredCancelled() {
        return __classPrivateFieldGet(this, _CancellationScope_cancelRequested, "f") && this.cancellable;
    }
    /**
     * Activate the scope as current and run  `fn`
     *
     * Any timers, Activities, Triggers and CancellationScopes created in the body of `fn`
     * automatically link their cancellation to this scope.
     *
     * @return the result of `fn`
     */
    run(fn) {
        return storage.run(this, this.runInContext.bind(this, fn));
    }
    /**
     * Method that runs a function in AsyncLocalStorage context.
     *
     * Could have been written as anonymous function, made into a method for improved stack traces.
     */
    async runInContext(fn) {
        let timerScope;
        if (this.timeout) {
            timerScope = new CancellationScope();
            (0, stack_helpers_1.untrackPromise)(timerScope
                .run(() => sleep(this.timeout))
                .then(() => this.cancel(), () => {
                // scope was already cancelled, ignore
            }));
        }
        try {
            return await fn();
        }
        finally {
            if (timerScope &&
                !timerScope.consideredCancelled &&
                (0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
                timerScope.cancel();
            }
        }
    }
    /**
     * Request to cancel the scope and linked children
     */
    cancel() {
        this.reject(new common_1.CancelledFailure('Cancellation scope cancelled'));
    }
    /**
     * Get the current "active" scope
     */
    static current() {
        // Using globals directly instead of a helper function to avoid circular import
        return storage.getStore() ?? globalThis.__TEMPORAL_ACTIVATOR__.rootScope;
    }
    /** Alias to `new CancellationScope({ cancellable: true }).run(fn)` */
    static cancellable(fn) {
        return new this({ cancellable: true }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: false }).run(fn)` */
    static nonCancellable(fn) {
        return new this({ cancellable: false }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: true, timeout }).run(fn)` */
    static withTimeout(timeout, fn) {
        return new this({ cancellable: true, timeout }).run(fn);
    }
}
exports.CancellationScope = CancellationScope;
_CancellationScope_cancelRequested = new WeakMap();
const storage = new exports.AsyncLocalStorage();
/**
 * Avoid exposing the storage directly so it doesn't get frozen
 */
function disableStorage() {
    storage.disable();
}
class RootCancellationScope extends CancellationScope {
    constructor() {
        super({ cancellable: true, parent: NO_PARENT });
    }
    cancel() {
        this.reject(new common_1.CancelledFailure('Workflow cancelled'));
    }
}
exports.RootCancellationScope = RootCancellationScope;
/** This function is here to avoid a circular dependency between this module and workflow.ts */
let sleep = (_) => {
    throw new common_1.IllegalStateError('Workflow has not been properly initialized');
};
function registerSleepImplementation(fn) {
    sleep = fn;
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/errors.js":
/*!*********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/errors.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalActivityDoBackoff = exports.DeterminismViolationError = exports.WorkflowError = void 0;
exports.isCancellation = isCancellation;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Base class for all workflow errors
 */
let WorkflowError = class WorkflowError extends Error {
};
exports.WorkflowError = WorkflowError;
exports.WorkflowError = WorkflowError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowError')
], WorkflowError);
/**
 * Thrown in workflow when it tries to do something that non-deterministic such as construct a WeakRef()
 */
let DeterminismViolationError = class DeterminismViolationError extends WorkflowError {
};
exports.DeterminismViolationError = DeterminismViolationError;
exports.DeterminismViolationError = DeterminismViolationError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('DeterminismViolationError')
], DeterminismViolationError);
/**
 * A class that acts as a marker for this special result type
 */
let LocalActivityDoBackoff = class LocalActivityDoBackoff extends Error {
    constructor(backoff) {
        super();
        this.backoff = backoff;
    }
};
exports.LocalActivityDoBackoff = LocalActivityDoBackoff;
exports.LocalActivityDoBackoff = LocalActivityDoBackoff = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('LocalActivityDoBackoff')
], LocalActivityDoBackoff);
/**
 * Returns whether provided `err` is caused by cancellation
 */
function isCancellation(err) {
    return (err instanceof common_1.CancelledFailure ||
        ((err instanceof common_1.ActivityFailure || err instanceof common_1.ChildWorkflowFailure) && err.cause instanceof common_1.CancelledFailure));
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/flags.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/flags.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SdkFlags = void 0;
exports.assertValidFlag = assertValidFlag;
const flagsRegistry = new Map();
exports.SdkFlags = {
    /**
     * This flag gates multiple fixes related to cancellation scopes and timers introduced in 1.10.2/1.11.0:
     * - Cancellation of a non-cancellable scope no longer propagates to children scopes
     *   (see https://github.com/temporalio/sdk-typescript/issues/1423).
     * - CancellationScope.withTimeout(fn) now cancel the timer if `fn` completes before expiration
     *   of the timeout, similar to how `condition(fn, timeout)` works.
     * - Timers created using setTimeout can now be intercepted.
     *
     * @since Introduced in 1.10.2/1.11.0. However, due to an SDK bug, SDKs v1.11.0 and v1.11.1 were not
     *        properly writing back the flags to history, possibly resulting in NDE on replay. We therefore
     *        consider that a WFT emitted by Worker v1.11.0 or v1.11.1 to implicitly have this flag on.
     */
    NonCancellableScopesAreShieldedFromPropagation: defineFlag(1, true, [buildIdSdkVersionMatches(/1\.11\.[01]/)]),
    /**
     * Prior to 1.11.0, when processing a Workflow activation, the SDK would execute `notifyHasPatch`
     * and `signalWorkflow` jobs in distinct phases, before other types of jobs. The primary reason
     * behind that multi-phase algorithm was to avoid the possibility that a Workflow execution might
     * complete before all incoming signals have been dispatched (at least to the point that the
     * _synchronous_ part of the handler function has been executed).
     *
     * This flag replaces that multi-phase algorithm with a simpler one where jobs are simply sorted as
     * `(signals and updates) -> others`, but without processing them as distinct batches (i.e. without
     * leaving/reentering the VM context between each group, which automatically triggers the execution
     * of all outstanding microtasks). That single-phase approach resolves a number of quirks of the
     * former algorithm, and yet still satisfies to the original requirement of ensuring that every
     * `signalWorkflow` jobs - and now `doUpdate` jobs as well - have been given a proper chance to
     * execute before the Workflow main function might completes.
     *
     * @since Introduced in 1.11.0. This change is not rollback-safe. However, due to an SDK bug, SDKs
     *        v1.11.0 and v1.11.1 were not properly writing back the flags to history, possibly resulting
     *        in NDE on replay. We therefore consider that a WFT emitted by Worker v1.11.0 or v1.11.1
     *        to implicitely have this flag on.
     */
    ProcessWorkflowActivationJobsAsSingleBatch: defineFlag(2, true, [buildIdSdkVersionMatches(/1\.11\.[01]/)]),
};
function defineFlag(id, def, alternativeConditions) {
    const flag = { id, default: def, alternativeConditions };
    flagsRegistry.set(id, flag);
    return flag;
}
function assertValidFlag(id) {
    if (!flagsRegistry.has(id))
        throw new TypeError(`Unknown SDK flag: ${id}`);
}
function buildIdSdkVersionMatches(version) {
    const regex = new RegExp(`^@temporalio/worker@(${version.source})[+]`);
    return ({ info }) => info.currentBuildId != null && regex.test(info.currentBuildId);
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/global-attributes.js":
/*!********************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/global-attributes.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.maybeGetActivatorUntyped = maybeGetActivatorUntyped;
exports.setActivatorUntyped = setActivatorUntyped;
exports.maybeGetActivator = maybeGetActivator;
exports.assertInWorkflowContext = assertInWorkflowContext;
exports.getActivator = getActivator;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
function maybeGetActivatorUntyped() {
    return globalThis.__TEMPORAL_ACTIVATOR__;
}
function setActivatorUntyped(activator) {
    globalThis.__TEMPORAL_ACTIVATOR__ = activator;
}
function maybeGetActivator() {
    return maybeGetActivatorUntyped();
}
function assertInWorkflowContext(message) {
    const activator = maybeGetActivator();
    if (activator == null)
        throw new common_1.IllegalStateError(message);
    return activator;
}
function getActivator() {
    const activator = maybeGetActivator();
    if (activator === undefined) {
        throw new common_1.IllegalStateError('Workflow uninitialized');
    }
    return activator;
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/global-overrides.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/global-overrides.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.overrideGlobals = overrideGlobals;
/**
 * Overrides some global objects to make them deterministic.
 *
 * @module
 */
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
const workflow_1 = __webpack_require__(/*! ./workflow */ "./node_modules/@temporalio/workflow/lib/workflow.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const global = globalThis;
const OriginalDate = globalThis.Date;
function overrideGlobals() {
    // Mock any weak reference because GC is non-deterministic and the effect is observable from the Workflow.
    // Workflow developer will get a meaningful exception if they try to use these.
    global.WeakRef = function () {
        throw new errors_1.DeterminismViolationError('WeakRef cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.FinalizationRegistry = function () {
        throw new errors_1.DeterminismViolationError('FinalizationRegistry cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.Date = function (...args) {
        if (args.length > 0) {
            return new OriginalDate(...args);
        }
        return new OriginalDate((0, global_attributes_1.getActivator)().now);
    };
    global.Date.now = function () {
        return (0, global_attributes_1.getActivator)().now;
    };
    global.Date.parse = OriginalDate.parse.bind(OriginalDate);
    global.Date.UTC = OriginalDate.UTC.bind(OriginalDate);
    global.Date.prototype = OriginalDate.prototype;
    const timeoutCancelationScopes = new Map();
    /**
     * @param ms sleep duration -  number of milliseconds. If given a negative number, value will be set to 1.
     */
    global.setTimeout = function (cb, ms, ...args) {
        ms = Math.max(1, ms);
        const activator = (0, global_attributes_1.getActivator)();
        if (activator.hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
            // Capture the sequence number that sleep will allocate
            const seq = activator.nextSeqs.timer;
            const timerScope = new cancellation_scope_1.CancellationScope({ cancellable: true });
            const sleepPromise = timerScope.run(() => (0, workflow_1.sleep)(ms));
            sleepPromise.then(() => {
                timeoutCancelationScopes.delete(seq);
                cb(...args);
            }, () => {
                timeoutCancelationScopes.delete(seq);
            });
            (0, stack_helpers_1.untrackPromise)(sleepPromise);
            timeoutCancelationScopes.set(seq, timerScope);
            return seq;
        }
        else {
            const seq = activator.nextSeqs.timer++;
            // Create a Promise for AsyncLocalStorage to be able to track this completion using promise hooks.
            new Promise((resolve, reject) => {
                activator.completions.timer.set(seq, { resolve, reject });
                activator.pushCommand({
                    startTimer: {
                        seq,
                        startToFireTimeout: (0, time_1.msToTs)(ms),
                    },
                });
            }).then(() => cb(...args), () => undefined /* ignore cancellation */);
            return seq;
        }
    };
    global.clearTimeout = function (handle) {
        const activator = (0, global_attributes_1.getActivator)();
        const timerScope = timeoutCancelationScopes.get(handle);
        if (timerScope) {
            timeoutCancelationScopes.delete(handle);
            timerScope.cancel();
        }
        else {
            activator.nextSeqs.timer++; // Shouldn't increase seq number, but that's the legacy behavior
            activator.completions.timer.delete(handle);
            activator.pushCommand({
                cancelTimer: {
                    seq: handle,
                },
            });
        }
    };
    // activator.random is mutable, don't hardcode its reference
    Math.random = () => (0, global_attributes_1.getActivator)().random();
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/index.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/index.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * This library provides tools required for authoring workflows.
 *
 * ## Usage
 * See the {@link https://docs.temporal.io/typescript/hello-world#workflows | tutorial} for writing your first workflow.
 *
 * ### Timers
 *
 * The recommended way of scheduling timers is by using the {@link sleep} function. We've replaced `setTimeout` and
 * `clearTimeout` with deterministic versions so these are also usable but have a limitation that they don't play well
 * with {@link https://docs.temporal.io/typescript/cancellation-scopes | cancellation scopes}.
 *
 * <!--SNIPSTART typescript-sleep-workflow-->
 * <!--SNIPEND-->
 *
 * ### Activities
 *
 * To schedule Activities, use {@link proxyActivities} to obtain an Activity function and call.
 *
 * <!--SNIPSTART typescript-schedule-activity-workflow-->
 * <!--SNIPEND-->
 *
 * ### Updates, Signals and Queries
 *
 * Use {@link setHandler} to set handlers for Updates, Signals, and Queries.
 *
 * Update and Signal handlers can be either async or non-async functions. Update handlers may return a value, but signal
 * handlers may not (return `void` or `Promise<void>`). You may use Activities, Timers, child Workflows, etc in Update
 * and Signal handlers, but this should be done cautiously: for example, note that if you await async operations such as
 * these in an Update or Signal handler, then you are responsible for ensuring that the workflow does not complete first.
 *
 * Query handlers may **not** be async functions, and may **not** mutate any variables or use Activities, Timers,
 * child Workflows, etc.
 *
 * #### Implementation
 *
 * <!--SNIPSTART typescript-workflow-update-signal-query-example-->
 * <!--SNIPEND-->
 *
 * ### More
 *
 * - [Deterministic built-ins](https://docs.temporal.io/typescript/determinism#sources-of-non-determinism)
 * - [Cancellation and scopes](https://docs.temporal.io/typescript/cancellation-scopes)
 *   - {@link CancellationScope}
 *   - {@link Trigger}
 * - [Sinks](https://docs.temporal.io/application-development/observability/?lang=ts#logging)
 *   - {@link Sinks}
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = exports.log = exports.proxySinks = exports.ParentClosePolicy = exports.ContinueAsNew = exports.ChildWorkflowCancellationType = exports.CancellationScope = exports.AsyncLocalStorage = exports.TimeoutFailure = exports.TerminatedFailure = exports.TemporalFailure = exports.ServerFailure = exports.rootCause = exports.defaultPayloadConverter = exports.ChildWorkflowFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ActivityFailure = exports.ActivityCancellationType = void 0;
var common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
Object.defineProperty(exports, "ActivityCancellationType", ({ enumerable: true, get: function () { return common_1.ActivityCancellationType; } }));
Object.defineProperty(exports, "ActivityFailure", ({ enumerable: true, get: function () { return common_1.ActivityFailure; } }));
Object.defineProperty(exports, "ApplicationFailure", ({ enumerable: true, get: function () { return common_1.ApplicationFailure; } }));
Object.defineProperty(exports, "CancelledFailure", ({ enumerable: true, get: function () { return common_1.CancelledFailure; } }));
Object.defineProperty(exports, "ChildWorkflowFailure", ({ enumerable: true, get: function () { return common_1.ChildWorkflowFailure; } }));
Object.defineProperty(exports, "defaultPayloadConverter", ({ enumerable: true, get: function () { return common_1.defaultPayloadConverter; } }));
Object.defineProperty(exports, "rootCause", ({ enumerable: true, get: function () { return common_1.rootCause; } }));
Object.defineProperty(exports, "ServerFailure", ({ enumerable: true, get: function () { return common_1.ServerFailure; } }));
Object.defineProperty(exports, "TemporalFailure", ({ enumerable: true, get: function () { return common_1.TemporalFailure; } }));
Object.defineProperty(exports, "TerminatedFailure", ({ enumerable: true, get: function () { return common_1.TerminatedFailure; } }));
Object.defineProperty(exports, "TimeoutFailure", ({ enumerable: true, get: function () { return common_1.TimeoutFailure; } }));
__exportStar(__webpack_require__(/*! @temporalio/common/lib/errors */ "./node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-handle */ "./node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-options */ "./node_modules/@temporalio/common/lib/workflow-options.js"), exports);
var cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
Object.defineProperty(exports, "AsyncLocalStorage", ({ enumerable: true, get: function () { return cancellation_scope_1.AsyncLocalStorage; } }));
Object.defineProperty(exports, "CancellationScope", ({ enumerable: true, get: function () { return cancellation_scope_1.CancellationScope; } }));
__exportStar(__webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./interceptors */ "./node_modules/@temporalio/workflow/lib/interceptors.js"), exports);
var interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
Object.defineProperty(exports, "ChildWorkflowCancellationType", ({ enumerable: true, get: function () { return interfaces_1.ChildWorkflowCancellationType; } }));
Object.defineProperty(exports, "ContinueAsNew", ({ enumerable: true, get: function () { return interfaces_1.ContinueAsNew; } }));
Object.defineProperty(exports, "ParentClosePolicy", ({ enumerable: true, get: function () { return interfaces_1.ParentClosePolicy; } }));
var sinks_1 = __webpack_require__(/*! ./sinks */ "./node_modules/@temporalio/workflow/lib/sinks.js");
Object.defineProperty(exports, "proxySinks", ({ enumerable: true, get: function () { return sinks_1.proxySinks; } }));
var logs_1 = __webpack_require__(/*! ./logs */ "./node_modules/@temporalio/workflow/lib/logs.js");
Object.defineProperty(exports, "log", ({ enumerable: true, get: function () { return logs_1.log; } }));
var trigger_1 = __webpack_require__(/*! ./trigger */ "./node_modules/@temporalio/workflow/lib/trigger.js");
Object.defineProperty(exports, "Trigger", ({ enumerable: true, get: function () { return trigger_1.Trigger; } }));
__exportStar(__webpack_require__(/*! ./workflow */ "./node_modules/@temporalio/workflow/lib/workflow.js"), exports);


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/interceptors.js":
/*!***************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/interceptors.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Type definitions and generic helpers for interceptors.
 *
 * The Workflow specific interceptors are defined here.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/interfaces.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/interfaces.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeParentClosePolicy = exports.encodeParentClosePolicy = exports.ParentClosePolicy = exports.decodeChildWorkflowCancellationType = exports.encodeChildWorkflowCancellationType = exports.ChildWorkflowCancellationType = exports.ContinueAsNew = void 0;
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
const enums_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/internal-workflow/enums-helpers */ "./node_modules/@temporalio/common/lib/internal-workflow/enums-helpers.js");
/**
 * Not an actual error, used by the Workflow runtime to abort execution when {@link continueAsNew} is called
 */
let ContinueAsNew = class ContinueAsNew extends Error {
    constructor(command) {
        super('Workflow continued as new');
        this.command = command;
    }
};
exports.ContinueAsNew = ContinueAsNew;
exports.ContinueAsNew = ContinueAsNew = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ContinueAsNew')
], ContinueAsNew);
exports.ChildWorkflowCancellationType = {
    /**
     * Don't send a cancellation request to the Child.
     */
    ABANDON: 'ABANDON',
    /**
     * Send a cancellation request to the Child. Immediately throw the error.
     */
    TRY_CANCEL: 'TRY_CANCEL',
    /**
     * Send a cancellation request to the Child. The Child may respect cancellation, in which case an error will be thrown
     * when cancellation has completed, and {@link isCancellation}(error) will be true. On the other hand, the Child may
     * ignore the cancellation request, in which case an error might be thrown with a different cause, or the Child may
     * complete successfully.
     *
     * @default
     */
    WAIT_CANCELLATION_COMPLETED: 'WAIT_CANCELLATION_COMPLETED',
    /**
     * Send a cancellation request to the Child. Throw the error once the Server receives the Child cancellation request.
     */
    WAIT_CANCELLATION_REQUESTED: 'WAIT_CANCELLATION_REQUESTED',
};
// ts-prune-ignore-next
_a = (0, enums_helpers_1.makeProtoEnumConverters)({
    [exports.ChildWorkflowCancellationType.ABANDON]: 0,
    [exports.ChildWorkflowCancellationType.TRY_CANCEL]: 1,
    [exports.ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED]: 2,
    [exports.ChildWorkflowCancellationType.WAIT_CANCELLATION_REQUESTED]: 3,
}, ''), exports.encodeChildWorkflowCancellationType = _a[0], exports.decodeChildWorkflowCancellationType = _a[1];
exports.ParentClosePolicy = {
    /**
     * When the Parent is Closed, the Child is Terminated.
     *
     * @default
     */
    TERMINATE: 'TERMINATE',
    /**
     * When the Parent is Closed, nothing is done to the Child.
     */
    ABANDON: 'ABANDON',
    /**
     * When the Parent is Closed, the Child is Cancelled.
     */
    REQUEST_CANCEL: 'REQUEST_CANCEL',
    /// Anything below this line has been deprecated
    /**
     * If a `ParentClosePolicy` is set to this, or is not set at all, the server default value will be used.
     *
     * @deprecated Either leave property `undefined`, or set an explicit policy instead.
     */
    PARENT_CLOSE_POLICY_UNSPECIFIED: undefined, // eslint-disable-line deprecation/deprecation
    /**
     * When the Parent is Closed, the Child is Terminated.
     *
     * @deprecated Use {@link ParentClosePolicy.TERMINATE} instead.
     */
    PARENT_CLOSE_POLICY_TERMINATE: 'TERMINATE', // eslint-disable-line deprecation/deprecation
    /**
     * When the Parent is Closed, nothing is done to the Child.
     *
     * @deprecated Use {@link ParentClosePolicy.ABANDON} instead.
     */
    PARENT_CLOSE_POLICY_ABANDON: 'ABANDON', // eslint-disable-line deprecation/deprecation
    /**
     * When the Parent is Closed, the Child is Cancelled.
     *
     * @deprecated Use {@link ParentClosePolicy.REQUEST_CANCEL} instead.
     */
    PARENT_CLOSE_POLICY_REQUEST_CANCEL: 'REQUEST_CANCEL', // eslint-disable-line deprecation/deprecation
};
// ts-prune-ignore-next
_b = (0, enums_helpers_1.makeProtoEnumConverters)({
    [exports.ParentClosePolicy.TERMINATE]: 1,
    [exports.ParentClosePolicy.ABANDON]: 2,
    [exports.ParentClosePolicy.REQUEST_CANCEL]: 3,
    UNSPECIFIED: 0,
}, 'PARENT_CLOSE_POLICY_'), exports.encodeParentClosePolicy = _b[0], exports.decodeParentClosePolicy = _b[1];


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/internals.js":
/*!************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/internals.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Activator = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const internal_workflow_1 = __webpack_require__(/*! @temporalio/common/lib/internal-workflow */ "./node_modules/@temporalio/common/lib/internal-workflow/index.js");
const alea_1 = __webpack_require__(/*! ./alea */ "./node_modules/@temporalio/workflow/lib/alea.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const update_scope_1 = __webpack_require__(/*! ./update-scope */ "./node_modules/@temporalio/workflow/lib/update-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const pkg_1 = __importDefault(__webpack_require__(/*! ./pkg */ "./node_modules/@temporalio/workflow/lib/pkg.js"));
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
const logs_1 = __webpack_require__(/*! ./logs */ "./node_modules/@temporalio/workflow/lib/logs.js");
const StartChildWorkflowExecutionFailedCause = {
    WORKFLOW_ALREADY_EXISTS: 'WORKFLOW_ALREADY_EXISTS',
};
const [_encodeStartChildWorkflowExecutionFailedCause, decodeStartChildWorkflowExecutionFailedCause] = (0, internal_workflow_1.makeProtoEnumConverters)({
    [StartChildWorkflowExecutionFailedCause.WORKFLOW_ALREADY_EXISTS]: 1,
    UNSPECIFIED: 0,
}, 'START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_');
/**
 * Keeps all of the Workflow runtime state like pending completions for activities and timers.
 *
 * Implements handlers for all workflow activation jobs.
 *
 * Note that most methods in this class are meant to be called only from within the VM.
 *
 * However, a few methods may be called directly from outside the VM (essentially from `vm-shared.ts`).
 * These methods are specifically marked with a comment and require careful consideration, as the
 * execution context may not properly reflect that of the target workflow execution (e.g.: with Reusable
 * VMs, the `global` may not have been swapped to those of that workflow execution; the active microtask
 * queue may be that of the thread/process, rather than the queue of that VM context; etc). Consequently,
 * methods that are meant to be called from outside of the VM must not do any of the following:
 *
 * - Access any global variable;
 * - Create Promise objects, use async/await, or otherwise schedule microtasks;
 * - Call user-defined functions, including any form of interceptor.
 */
class Activator {
    constructor({ info, now, showStackTraceSources, sourceMap, getTimeOfDay, randomnessSeed, registeredActivityNames, }) {
        /**
         * Cache for modules - referenced in reusable-vm.ts
         */
        this.moduleCache = new Map();
        /**
         * Map of task sequence to a Completion
         */
        this.completions = {
            timer: new Map(),
            activity: new Map(),
            childWorkflowStart: new Map(),
            childWorkflowComplete: new Map(),
            signalWorkflow: new Map(),
            cancelWorkflow: new Map(),
        };
        /**
         * Holds buffered Update calls until a handler is registered
         */
        this.bufferedUpdates = Array();
        /**
         * Holds buffered signal calls until a handler is registered
         */
        this.bufferedSignals = Array();
        /**
         * Mapping of update name to handler and validator
         */
        this.updateHandlers = new Map();
        /**
         * Mapping of signal name to handler
         */
        this.signalHandlers = new Map();
        /**
         * Mapping of in-progress updates to handler execution information.
         */
        this.inProgressUpdates = new Map();
        /**
         * Mapping of in-progress signals to handler execution information.
         */
        this.inProgressSignals = new Map();
        /**
         * A sequence number providing unique identifiers for signal handler executions.
         */
        this.signalHandlerExecutionSeq = 0;
        this.promiseStackStore = {
            promiseToStack: new Map(),
            childToParent: new Map(),
        };
        this.rootScope = new cancellation_scope_1.RootCancellationScope();
        /**
         * Mapping of query name to handler
         */
        this.queryHandlers = new Map([
            [
                '__stack_trace',
                {
                    handler: () => {
                        return this.getStackTraces()
                            .map((s) => s.formatted)
                            .join('\n\n');
                    },
                    description: 'Returns a sensible stack trace.',
                },
            ],
            [
                '__enhanced_stack_trace',
                {
                    handler: () => {
                        const { sourceMap } = this;
                        const sdk = { name: 'typescript', version: pkg_1.default.version };
                        const stacks = this.getStackTraces().map(({ structured: locations }) => ({ locations }));
                        const sources = {};
                        if (this.showStackTraceSources) {
                            for (const { locations } of stacks) {
                                for (const { file_path } of locations) {
                                    if (!file_path)
                                        continue;
                                    const content = sourceMap?.sourcesContent?.[sourceMap?.sources.indexOf(file_path)];
                                    if (!content)
                                        continue;
                                    sources[file_path] = [
                                        {
                                            line_offset: 0,
                                            content,
                                        },
                                    ];
                                }
                            }
                        }
                        return { sdk, stacks, sources };
                    },
                    description: 'Returns a stack trace annotated with source information.',
                },
            ],
            [
                '__temporal_workflow_metadata',
                {
                    handler: () => {
                        const workflowType = this.info.workflowType;
                        const queryDefinitions = Array.from(this.queryHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        const signalDefinitions = Array.from(this.signalHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        const updateDefinitions = Array.from(this.updateHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        return {
                            definition: {
                                type: workflowType,
                                queryDefinitions,
                                signalDefinitions,
                                updateDefinitions,
                            },
                        };
                    },
                    description: 'Returns metadata associated with this workflow.',
                },
            ],
        ]);
        /**
         * Loaded in {@link initRuntime}
         */
        this.interceptors = {
            inbound: [],
            outbound: [],
            internals: [],
        };
        /**
         * Buffer that stores all generated commands, reset after each activation
         */
        this.commands = [];
        /**
         * Stores all {@link condition}s that haven't been unblocked yet
         */
        this.blockedConditions = new Map();
        /**
         * Is this Workflow completed?
         *
         * A Workflow will be considered completed if it generates a command that the
         * system considers as a final Workflow command (e.g.
         * completeWorkflowExecution or failWorkflowExecution).
         */
        this.completed = false;
        /**
         * Was this Workflow cancelled?
         */
        this.cancelled = false;
        /**
         * The next (incremental) sequence to assign when generating completable commands
         */
        this.nextSeqs = {
            timer: 1,
            activity: 1,
            childWorkflow: 1,
            signalWorkflow: 1,
            cancelWorkflow: 1,
            condition: 1,
            // Used internally to keep track of active stack traces
            stack: 1,
        };
        this.payloadConverter = common_1.defaultPayloadConverter;
        this.failureConverter = common_1.defaultFailureConverter;
        /**
         * Patches we know the status of for this workflow, as in {@link patched}
         */
        this.knownPresentPatches = new Set();
        /**
         * Patches we sent to core {@link patched}
         */
        this.sentPatches = new Set();
        this.knownFlags = new Set();
        /**
         * Buffered sink calls per activation
         */
        this.sinkCalls = Array();
        this.getTimeOfDay = getTimeOfDay;
        this.info = info;
        this.now = now;
        this.showStackTraceSources = showStackTraceSources;
        this.sourceMap = sourceMap;
        this.random = (0, alea_1.alea)(randomnessSeed);
        this.registeredActivityNames = registeredActivityNames;
    }
    /**
     * May be invoked from outside the VM.
     */
    mutateWorkflowInfo(fn) {
        this.info = fn(this.info);
    }
    getStackTraces() {
        const { childToParent, promiseToStack } = this.promiseStackStore;
        const internalNodes = [...childToParent.values()].reduce((acc, curr) => {
            for (const p of curr) {
                acc.add(p);
            }
            return acc;
        }, new Set());
        const stacks = new Map();
        for (const child of childToParent.keys()) {
            if (!internalNodes.has(child)) {
                const stack = promiseToStack.get(child);
                if (!stack || !stack.formatted)
                    continue;
                stacks.set(stack.formatted, stack);
            }
        }
        // Not 100% sure where this comes from, just filter it out
        stacks.delete('    at Promise.then (<anonymous>)');
        stacks.delete('    at Promise.then (<anonymous>)\n');
        return [...stacks].map(([_, stack]) => stack);
    }
    /**
     * May be invoked from outside the VM.
     */
    getAndResetSinkCalls() {
        const { sinkCalls } = this;
        this.sinkCalls = [];
        return sinkCalls;
    }
    /**
     * Buffer a Workflow command to be collected at the end of the current activation.
     *
     * Prevents commands from being added after Workflow completion.
     */
    pushCommand(cmd, complete = false) {
        this.commands.push(cmd);
        if (complete) {
            this.completed = true;
        }
    }
    concludeActivation() {
        return {
            commands: this.commands.splice(0),
            usedInternalFlags: [...this.knownFlags],
        };
    }
    async startWorkflowNextHandler({ args }) {
        const { workflow } = this;
        if (workflow === undefined) {
            throw new common_1.IllegalStateError('Workflow uninitialized');
        }
        return await workflow(...args);
    }
    startWorkflow(activation) {
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'execute', this.startWorkflowNextHandler.bind(this));
        (0, stack_helpers_1.untrackPromise)((0, logs_1.executeWithLifecycleLogging)(() => execute({
            headers: activation.headers ?? {},
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
        })).then(this.completeWorkflow.bind(this), this.handleWorkflowFailure.bind(this)));
    }
    initializeWorkflow(activation) {
        const { continuedFailure, lastCompletionResult, memo, searchAttributes } = activation;
        // Most things related to initialization have already been handled in the constructor
        this.mutateWorkflowInfo((info) => ({
            ...info,
            searchAttributes: (0, common_1.mapFromPayloads)(common_1.searchAttributePayloadConverter, searchAttributes?.indexedFields) ?? {},
            memo: (0, common_1.mapFromPayloads)(this.payloadConverter, memo?.fields),
            lastResult: (0, common_1.fromPayloadsAtIndex)(this.payloadConverter, 0, lastCompletionResult?.payloads),
            lastFailure: continuedFailure != null
                ? this.failureConverter.failureToError(continuedFailure, this.payloadConverter)
                : undefined,
        }));
    }
    cancelWorkflow(_activation) {
        this.cancelled = true;
        this.rootScope.cancel();
    }
    fireTimer(activation) {
        // Timers are a special case where their completion might not be in Workflow state,
        // this is due to immediate timer cancellation that doesn't go wait for Core.
        const completion = this.maybeConsumeCompletion('timer', getSeq(activation));
        completion?.resolve(undefined);
    }
    resolveActivity(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveActivity activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('activity', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.backoff) {
            reject(new errors_1.LocalActivityDoBackoff(activation.result.backoff));
        }
    }
    resolveChildWorkflowExecutionStart(activation) {
        const { resolve, reject } = this.consumeCompletion('childWorkflowStart', getSeq(activation));
        if (activation.succeeded) {
            resolve(activation.succeeded.runId);
        }
        else if (activation.failed) {
            if (decodeStartChildWorkflowExecutionFailedCause(activation.failed.cause) !== 'WORKFLOW_ALREADY_EXISTS') {
                throw new common_1.IllegalStateError('Got unknown StartChildWorkflowExecutionFailedCause');
            }
            if (!(activation.seq && activation.failed.workflowId && activation.failed.workflowType)) {
                throw new TypeError('Missing attributes in activation job');
            }
            reject(new common_1.WorkflowExecutionAlreadyStartedError('Workflow execution already started', activation.failed.workflowId, activation.failed.workflowType));
        }
        else if (activation.cancelled) {
            if (!activation.cancelled.failure) {
                throw new TypeError('Got no failure in cancelled variant');
            }
            reject(this.failureToError(activation.cancelled.failure));
        }
        else {
            throw new TypeError('Got ResolveChildWorkflowExecutionStart with no status');
        }
    }
    resolveChildWorkflowExecution(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveChildWorkflowExecution activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('childWorkflowComplete', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got failed result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got cancelled result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
    }
    // Intentionally non-async function so this handler doesn't show up in the stack trace
    queryWorkflowNextHandler({ queryName, args }) {
        const fn = this.queryHandlers.get(queryName)?.handler;
        if (fn === undefined) {
            const knownQueryTypes = [...this.queryHandlers.keys()].join(' ');
            // Fail the query
            return Promise.reject(new ReferenceError(`Workflow did not register a handler for ${queryName}. Registered queries: [${knownQueryTypes}]`));
        }
        try {
            const ret = fn(...args);
            if (ret instanceof Promise) {
                return Promise.reject(new errors_1.DeterminismViolationError('Query handlers should not return a Promise'));
            }
            return Promise.resolve(ret);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    queryWorkflow(activation) {
        const { queryType, queryId, headers } = activation;
        if (!(queryType && queryId)) {
            throw new TypeError('Missing query activation attributes');
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleQuery', this.queryWorkflowNextHandler.bind(this));
        execute({
            queryName: queryType,
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
            queryId,
            headers: headers ?? {},
        }).then((result) => this.completeQuery(queryId, result), (reason) => this.failQuery(queryId, reason));
    }
    doUpdate(activation) {
        const { id: updateId, protocolInstanceId, name, headers, runValidator } = activation;
        if (!updateId) {
            throw new TypeError('Missing activation update id');
        }
        if (!name) {
            throw new TypeError('Missing activation update name');
        }
        if (!protocolInstanceId) {
            throw new TypeError('Missing activation update protocolInstanceId');
        }
        const entry = this.updateHandlers.get(name);
        if (!entry) {
            this.bufferedUpdates.push(activation);
            return;
        }
        const makeInput = () => ({
            updateId,
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.input),
            name,
            headers: headers ?? {},
        });
        // The implementation below is responsible for upholding, and constrained
        // by, the following contract:
        //
        // 1. If no validator is present then validation interceptors will not be run.
        //
        // 2. During validation, any error must fail the Update; during the Update
        //    itself, Temporal errors fail the Update whereas other errors fail the
        //    activation.
        //
        // 3. The handler must not see any mutations of the arguments made by the
        //    validator.
        //
        // 4. Any error when decoding/deserializing input must be caught and result
        //    in rejection of the Update before it is accepted, even if there is no
        //    validator.
        //
        // 5. The initial synchronous portion of the (async) Update handler should
        //    be executed after the (sync) validator completes such that there is
        //    minimal opportunity for a different concurrent task to be scheduled
        //    between them.
        //
        // 6. The stack trace view provided in the Temporal UI must not be polluted
        //    by promises that do not derive from user code. This implies that
        //    async/await syntax may not be used.
        //
        // Note that there is a deliberately unhandled promise rejection below.
        // These are caught elsewhere and fail the corresponding activation.
        const doUpdateImpl = async () => {
            let input;
            try {
                if (runValidator && entry.validator) {
                    const validate = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'validateUpdate', this.validateUpdateNextHandler.bind(this, entry.validator));
                    validate(makeInput());
                }
                input = makeInput();
            }
            catch (error) {
                this.rejectUpdate(protocolInstanceId, error);
                return;
            }
            this.acceptUpdate(protocolInstanceId);
            const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleUpdate', this.updateNextHandler.bind(this, entry.handler));
            const { unfinishedPolicy } = entry;
            this.inProgressUpdates.set(updateId, { name, unfinishedPolicy, id: updateId });
            const res = execute(input)
                .then((result) => this.completeUpdate(protocolInstanceId, result))
                .catch((error) => {
                if (error instanceof common_1.TemporalFailure) {
                    this.rejectUpdate(protocolInstanceId, error);
                }
                else {
                    throw error;
                }
            })
                .finally(() => this.inProgressUpdates.delete(updateId));
            (0, stack_helpers_1.untrackPromise)(res);
            return res;
        };
        (0, stack_helpers_1.untrackPromise)(update_scope_1.UpdateScope.updateWithInfo(updateId, name, doUpdateImpl));
    }
    async updateNextHandler(handler, { args }) {
        return await handler(...args);
    }
    validateUpdateNextHandler(validator, { args }) {
        if (validator) {
            validator(...args);
        }
    }
    dispatchBufferedUpdates() {
        const bufferedUpdates = this.bufferedUpdates;
        while (bufferedUpdates.length) {
            const foundIndex = bufferedUpdates.findIndex((update) => this.updateHandlers.has(update.name));
            if (foundIndex === -1) {
                // No buffered Updates have a handler yet.
                break;
            }
            const [update] = bufferedUpdates.splice(foundIndex, 1);
            this.doUpdate(update);
        }
    }
    rejectBufferedUpdates() {
        while (this.bufferedUpdates.length) {
            const update = this.bufferedUpdates.shift();
            if (update) {
                this.rejectUpdate(
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                update.protocolInstanceId, common_1.ApplicationFailure.nonRetryable(`No registered handler for update: ${update.name}`));
            }
        }
    }
    async signalWorkflowNextHandler({ signalName, args }) {
        const fn = this.signalHandlers.get(signalName)?.handler;
        if (fn) {
            return await fn(...args);
        }
        else if (this.defaultSignalHandler) {
            return await this.defaultSignalHandler(signalName, ...args);
        }
        else {
            throw new common_1.IllegalStateError(`No registered signal handler for signal: ${signalName}`);
        }
    }
    signalWorkflow(activation) {
        const { signalName, headers } = activation;
        if (!signalName) {
            throw new TypeError('Missing activation signalName');
        }
        if (!this.signalHandlers.has(signalName) && !this.defaultSignalHandler) {
            this.bufferedSignals.push(activation);
            return;
        }
        // If we fall through to the default signal handler then the unfinished
        // policy is WARN_AND_ABANDON; users currently have no way to silence any
        // ensuing warnings.
        const unfinishedPolicy = this.signalHandlers.get(signalName)?.unfinishedPolicy ?? common_1.HandlerUnfinishedPolicy.WARN_AND_ABANDON;
        const signalExecutionNum = this.signalHandlerExecutionSeq++;
        this.inProgressSignals.set(signalExecutionNum, { name: signalName, unfinishedPolicy });
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleSignal', this.signalWorkflowNextHandler.bind(this));
        execute({
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.input),
            signalName,
            headers: headers ?? {},
        })
            .catch(this.handleWorkflowFailure.bind(this))
            .finally(() => this.inProgressSignals.delete(signalExecutionNum));
    }
    dispatchBufferedSignals() {
        const bufferedSignals = this.bufferedSignals;
        while (bufferedSignals.length) {
            if (this.defaultSignalHandler) {
                // We have a default signal handler, so all signals are dispatchable
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.signalWorkflow(bufferedSignals.shift());
            }
            else {
                const foundIndex = bufferedSignals.findIndex((signal) => this.signalHandlers.has(signal.signalName));
                if (foundIndex === -1)
                    break;
                const [signal] = bufferedSignals.splice(foundIndex, 1);
                this.signalWorkflow(signal);
            }
        }
    }
    resolveSignalExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('signalWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    resolveRequestCancelExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('cancelWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    warnIfUnfinishedHandlers() {
        const getWarnable = (handlerExecutions) => {
            return Array.from(handlerExecutions).filter((ex) => ex.unfinishedPolicy === common_1.HandlerUnfinishedPolicy.WARN_AND_ABANDON);
        };
        const warnableUpdates = getWarnable(this.inProgressUpdates.values());
        if (warnableUpdates.length > 0) {
            logs_1.log.warn(makeUnfinishedUpdateHandlerMessage(warnableUpdates));
        }
        const warnableSignals = getWarnable(this.inProgressSignals.values());
        if (warnableSignals.length > 0) {
            logs_1.log.warn(makeUnfinishedSignalHandlerMessage(warnableSignals));
        }
    }
    updateRandomSeed(activation) {
        if (!activation.randomnessSeed) {
            throw new TypeError('Expected activation with randomnessSeed attribute');
        }
        this.random = (0, alea_1.alea)(activation.randomnessSeed.toBytes());
    }
    notifyHasPatch(activation) {
        if (!this.info.unsafe.isReplaying)
            throw new common_1.IllegalStateError('Unexpected notifyHasPatch job on non-replay activation');
        if (!activation.patchId)
            throw new TypeError('notifyHasPatch missing patch id');
        this.knownPresentPatches.add(activation.patchId);
    }
    patchInternal(patchId, deprecated) {
        if (this.workflow === undefined) {
            throw new common_1.IllegalStateError('Patches cannot be used before Workflow starts');
        }
        const usePatch = !this.info.unsafe.isReplaying || this.knownPresentPatches.has(patchId);
        // Avoid sending commands for patches core already knows about.
        // This optimization enables development of automatic patching tools.
        if (usePatch && !this.sentPatches.has(patchId)) {
            this.pushCommand({
                setPatchMarker: { patchId, deprecated },
            });
            this.sentPatches.add(patchId);
        }
        return usePatch;
    }
    /**
     * Called early while handling an activation to register known flags.
     * May be invoked from outside the VM.
     */
    addKnownFlags(flags) {
        for (const flag of flags) {
            (0, flags_1.assertValidFlag)(flag);
            this.knownFlags.add(flag);
        }
    }
    /**
     * Check if an SDK Flag may be considered as enabled for the current Workflow Task.
     *
     * SDK flags play a role similar to the `patched()` API, but are meant for internal usage by the
     * SDK itself. They make it possible for the SDK to evolve its behaviors over time, while still
     * maintaining compatibility with Workflow histories produced by older SDKs, without causing
     * determinism violations.
     *
     * May be invoked from outside the VM.
     */
    hasFlag(flag) {
        if (this.knownFlags.has(flag.id))
            return true;
        // If not replaying, enable the flag if it is configured to be enabled by default. Setting a
        // flag's default to false allows progressive rollout of new feature flags, with the possibility
        // of reverting back to a version of the SDK where the flag is supported but disabled by default.
        // It is also useful for testing purpose.
        if (!this.info.unsafe.isReplaying && flag.default) {
            this.knownFlags.add(flag.id);
            return true;
        }
        // When replaying, a flag is considered enabled if it was enabled during the original execution of
        // that Workflow Task; this is normally determined by the presence of the flag ID in the corresponding
        // WFT Completed's `sdkMetadata.langUsedFlags`.
        //
        // SDK Flag Alternate Condition provides an alternative way of determining whether a flag should
        // be considered as enabled for the current WFT; e.g. by looking at the version of the SDK that
        // emitted a WFT. The main use case for this is to retroactively turn on some flags for WFT emitted
        // by previous SDKs that contained a bug. Alt Conditions should only be used as a last resort.
        //
        // Note that conditions are only evaluated while replaying. Also, alternate conditions will not
        // cause the flag to be persisted to the "used flags" set, which means that further Workflow Tasks
        // may not reflect this flag if the condition no longer holds. This is so to avoid incorrect
        // behaviors in case where a Workflow Execution has gone through a newer SDK version then again
        // through an older one.
        if (this.info.unsafe.isReplaying && flag.alternativeConditions) {
            for (const cond of flag.alternativeConditions) {
                if (cond({ info: this.info }))
                    return true;
            }
        }
        return false;
    }
    removeFromCache() {
        throw new common_1.IllegalStateError('removeFromCache activation job should not reach workflow');
    }
    /**
     * Transforms failures into a command to be sent to the server.
     * Used to handle any failure emitted by the Workflow.
     */
    async handleWorkflowFailure(error) {
        if (this.cancelled && (0, errors_1.isCancellation)(error)) {
            this.pushCommand({ cancelWorkflowExecution: {} }, true);
        }
        else if (error instanceof interfaces_1.ContinueAsNew) {
            this.pushCommand({ continueAsNewWorkflowExecution: error.command }, true);
        }
        else {
            if (!(error instanceof common_1.TemporalFailure)) {
                // This results in an unhandled rejection which will fail the activation
                // preventing it from completing.
                throw error;
            }
            // Fail the workflow. We do not want to issue unfinishedHandlers warnings. To achieve that, we
            // mark all handlers as completed now.
            this.inProgressSignals.clear();
            this.inProgressUpdates.clear();
            this.pushCommand({
                failWorkflowExecution: {
                    failure: this.errorToFailure(error),
                },
            }, true);
        }
    }
    completeQuery(queryId, result) {
        this.pushCommand({
            respondToQuery: { queryId, succeeded: { response: this.payloadConverter.toPayload(result) } },
        });
    }
    failQuery(queryId, error) {
        this.pushCommand({
            respondToQuery: {
                queryId,
                failed: this.errorToFailure((0, common_1.ensureTemporalFailure)(error)),
            },
        });
    }
    acceptUpdate(protocolInstanceId) {
        this.pushCommand({ updateResponse: { protocolInstanceId, accepted: {} } });
    }
    completeUpdate(protocolInstanceId, result) {
        this.pushCommand({
            updateResponse: { protocolInstanceId, completed: this.payloadConverter.toPayload(result) },
        });
    }
    rejectUpdate(protocolInstanceId, error) {
        this.pushCommand({
            updateResponse: {
                protocolInstanceId,
                rejected: this.errorToFailure((0, common_1.ensureTemporalFailure)(error)),
            },
        });
    }
    /** Consume a completion if it exists in Workflow state */
    maybeConsumeCompletion(type, taskSeq) {
        const completion = this.completions[type].get(taskSeq);
        if (completion !== undefined) {
            this.completions[type].delete(taskSeq);
        }
        return completion;
    }
    /** Consume a completion if it exists in Workflow state, throws if it doesn't */
    consumeCompletion(type, taskSeq) {
        const completion = this.maybeConsumeCompletion(type, taskSeq);
        if (completion === undefined) {
            throw new common_1.IllegalStateError(`No completion for taskSeq ${taskSeq}`);
        }
        return completion;
    }
    completeWorkflow(result) {
        this.pushCommand({
            completeWorkflowExecution: {
                result: this.payloadConverter.toPayload(result),
            },
        }, true);
    }
    errorToFailure(err) {
        return this.failureConverter.errorToFailure(err, this.payloadConverter);
    }
    failureToError(failure) {
        return this.failureConverter.failureToError(failure, this.payloadConverter);
    }
}
exports.Activator = Activator;
function getSeq(activation) {
    const seq = activation.seq;
    if (seq === undefined || seq === null) {
        throw new TypeError(`Got activation with no seq attribute`);
    }
    return seq;
}
function makeUnfinishedUpdateHandlerMessage(handlerExecutions) {
    const message = `
[TMPRL1102] Workflow finished while an update handler was still running. This may have interrupted work that the
update handler was doing, and the client that sent the update will receive a 'workflow execution
already completed' RPCError instead of the update result. You can wait for all update and signal
handlers to complete by using \`await workflow.condition(workflow.allHandlersFinished)\`.
Alternatively, if both you and the clients sending the update are okay with interrupting running handlers
when the workflow finishes, and causing clients to receive errors, then you can disable this warning by
passing an option when setting the handler:
\`workflow.setHandler(myUpdate, myUpdateHandler, {unfinishedPolicy: HandlerUnfinishedPolicy.ABANDON});\`.`
        .replace(/\n/g, ' ')
        .trim();
    return `${message} The following updates were unfinished (and warnings were not disabled for their handler): ${JSON.stringify(handlerExecutions.map((ex) => ({ name: ex.name, id: ex.id })))}`;
}
function makeUnfinishedSignalHandlerMessage(handlerExecutions) {
    const message = `
[TMPRL1102] Workflow finished while a signal handler was still running. This may have interrupted work that the
signal handler was doing. You can wait for all update and signal handlers to complete by using
\`await workflow.condition(workflow.allHandlersFinished)\`. Alternatively, if both you and the
clients sending the update are okay with interrupting running handlers when the workflow finishes,
then you can disable this warning by passing an option when setting the handler:
\`workflow.setHandler(mySignal, mySignalHandler, {unfinishedPolicy: HandlerUnfinishedPolicy.ABANDON});\`.`
        .replace(/\n/g, ' ')
        .trim();
    const names = new Map();
    for (const ex of handlerExecutions) {
        const count = names.get(ex.name) || 0;
        names.set(ex.name, count + 1);
    }
    return `${message} The following signals were unfinished (and warnings were not disabled for their handler): ${JSON.stringify(Array.from(names.entries()).map(([name, count]) => ({ name, count })))}`;
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/logs.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/logs.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.log = void 0;
exports.executeWithLifecycleLogging = executeWithLifecycleLogging;
exports.workflowLogAttributes = workflowLogAttributes;
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const sinks_1 = __webpack_require__(/*! ./sinks */ "./node_modules/@temporalio/workflow/lib/sinks.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const loggerSink = (0, sinks_1.proxySinks)().__temporal_logger;
/**
 * Symbol used by the SDK logger to extract a timestamp from log attributes.
 * Also defined in `worker/logger.ts` - intentionally not shared.
 */
const LogTimestamp = Symbol.for('log_timestamp');
/**
 * Default workflow logger.
 *
 * This logger is replay-aware and will omit log messages on workflow replay. Messages emitted by this logger are
 * funnelled through a sink that forwards them to the logger registered on {@link Runtime.logger}.
 *
 * Attributes from the current Workflow Execution context are automatically included as metadata on every log
 * entries. An extra `sdkComponent` metadata attribute is also added, with value `workflow`; this can be used for
 * fine-grained filtering of log entries further downstream.
 *
 * To customize log attributes, register a {@link WorkflowOutboundCallsInterceptor} that intercepts the
 * `getLogAttributes()` method.
 *
 * Notice that since sinks are used to power this logger, any log attributes must be transferable via the
 * {@link https://nodejs.org/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist | postMessage}
 * API.
 *
 * NOTE: Specifying a custom logger through {@link defaultSink} or by manually registering a sink named
 * `defaultWorkerLogger` has been deprecated. Please use {@link Runtime.logger} instead.
 */
exports.log = Object.fromEntries(['trace', 'debug', 'info', 'warn', 'error'].map((level) => {
    return [
        level,
        (message, attrs) => {
            const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.log(...) may only be used from workflow context.');
            const getLogAttributes = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'getLogAttributes', (a) => a);
            return loggerSink[level](message, {
                // Inject the call time in nanosecond resolution as expected by the worker logger.
                [LogTimestamp]: activator.getTimeOfDay(),
                sdkComponent: common_1.SdkComponent.workflow,
                ...getLogAttributes(workflowLogAttributes(activator.info)),
                ...attrs,
            });
        },
    ];
}));
function executeWithLifecycleLogging(fn) {
    exports.log.debug('Workflow started', { sdkComponent: common_1.SdkComponent.worker });
    const p = fn().then((res) => {
        exports.log.debug('Workflow completed', { sdkComponent: common_1.SdkComponent.worker });
        return res;
    }, (error) => {
        // Avoid using instanceof checks in case the modules they're defined in loaded more than once,
        // e.g. by jest or when multiple versions are installed.
        if (typeof error === 'object' && error != null) {
            if ((0, errors_1.isCancellation)(error)) {
                exports.log.debug('Workflow completed as cancelled', { sdkComponent: common_1.SdkComponent.worker });
                throw error;
            }
            else if (error instanceof interfaces_1.ContinueAsNew) {
                exports.log.debug('Workflow continued as new', { sdkComponent: common_1.SdkComponent.worker });
                throw error;
            }
        }
        exports.log.warn('Workflow failed', { error, sdkComponent: common_1.SdkComponent.worker });
        throw error;
    });
    // Avoid showing this interceptor in stack trace query
    (0, stack_helpers_1.untrackPromise)(p);
    return p;
}
/**
 * Returns a map of attributes to be set _by default_ on log messages for a given Workflow.
 * Note that this function may be called from outside of the Workflow context (eg. by the worker itself).
 */
function workflowLogAttributes(info) {
    return {
        namespace: info.namespace,
        taskQueue: info.taskQueue,
        workflowId: info.workflowId,
        runId: info.runId,
        workflowType: info.workflowType,
    };
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/pkg.js":
/*!******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/pkg.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// ../package.json is outside of the TS project rootDir which causes TS to complain about this import.
// We do not want to change the rootDir because it messes up the output structure.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const package_json_1 = __importDefault(__webpack_require__(/*! ../package.json */ "./node_modules/@temporalio/workflow/package.json"));
exports["default"] = package_json_1.default;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/sinks.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/sinks.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Type definitions for the Workflow end of the sinks mechanism.
 *
 * Sinks are a mechanism for exporting data from the Workflow isolate to the
 * Node.js environment, they are necessary because the Workflow has no way to
 * communicate with the outside World.
 *
 * Sinks are typically used for exporting logs, metrics and traces out from the
 * Workflow.
 *
 * Sink functions may not return values to the Workflow in order to prevent
 * breaking determinism.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.proxySinks = proxySinks;
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
/**
 * Get a reference to Sinks for exporting data out of the Workflow.
 *
 * These Sinks **must** be registered with the Worker in order for this
 * mechanism to work.
 *
 * @example
 * ```ts
 * import { proxySinks, Sinks } from '@temporalio/workflow';
 *
 * interface MySinks extends Sinks {
 *   logger: {
 *     info(message: string): void;
 *     error(message: string): void;
 *   };
 * }
 *
 * const { logger } = proxySinks<MyDependencies>();
 * logger.info('setting up');
 *
 * export function myWorkflow() {
 *   return {
 *     async execute() {
 *       logger.info("hey ho");
 *       logger.error("lets go");
 *     }
 *   };
 * }
 * ```
 */
function proxySinks() {
    return new Proxy({}, {
        get(_, ifaceName) {
            return new Proxy({}, {
                get(_, fnName) {
                    return (...args) => {
                        const activator = (0, global_attributes_1.assertInWorkflowContext)('Proxied sinks functions may only be used from a Workflow Execution.');
                        activator.sinkCalls.push({
                            ifaceName: ifaceName,
                            fnName: fnName,
                            // Sink function doesn't get called immediately. Make a clone of the sink's args, so that further mutations
                            // to these objects don't corrupt the args that the sink function will receive. Only available from node 17.
                            args: globalThis.structuredClone ? globalThis.structuredClone(args) : args,
                            // activator.info is internally copy-on-write. This ensure that any further mutations
                            // to the workflow state in the context of the present activation will not corrupt the
                            // workflowInfo state that gets passed when the sink function actually gets called.
                            workflowInfo: activator.info,
                        });
                    };
                },
            });
        },
    });
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/stack-helpers.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/stack-helpers.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.untrackPromise = untrackPromise;
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
/**
 * Helper function to remove a promise from being tracked for stack trace query purposes
 */
function untrackPromise(promise) {
    const store = (0, global_attributes_1.maybeGetActivatorUntyped)()?.promiseStackStore;
    if (!store)
        return;
    store.childToParent.delete(promise);
    store.promiseToStack.delete(promise);
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/trigger.js":
/*!**********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/trigger.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = void 0;
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
/**
 * A `PromiseLike` helper which exposes its `resolve` and `reject` methods.
 *
 * Trigger is CancellationScope-aware: it is linked to the current scope on
 * construction and throws when that scope is cancelled.
 *
 * Useful for e.g. waiting for unblocking a Workflow from a Signal.
 *
 * @example
 * <!--SNIPSTART typescript-trigger-workflow-->
 * <!--SNIPEND-->
 */
class Trigger {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            const scope = cancellation_scope_1.CancellationScope.current();
            if (scope.cancellable) {
                (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.resolve = resolve;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.reject = reject;
        });
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.promise.catch(() => undefined));
    }
    then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    }
}
exports.Trigger = Trigger;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/update-scope.js":
/*!***************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/update-scope.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateScope = exports.AsyncLocalStorage = void 0;
exports.disableUpdateStorage = disableUpdateStorage;
// AsyncLocalStorage is injected via vm module into global scope.
// In case Workflow code is imported in Node.js context, replace with an empty class.
exports.AsyncLocalStorage = globalThis.AsyncLocalStorage ?? class {
};
class UpdateScope {
    constructor(options) {
        this.id = options.id;
        this.name = options.name;
    }
    /**
     * Activate the scope as current and run the update handler `fn`.
     *
     * @return the result of `fn`
     */
    run(fn) {
        return storage.run(this, fn);
    }
    /**
     * Get the current "active" update scope.
     */
    static current() {
        return storage.getStore();
    }
    /** Alias to `new UpdateScope({ id, name }).run(fn)` */
    static updateWithInfo(id, name, fn) {
        return new this({ id, name }).run(fn);
    }
}
exports.UpdateScope = UpdateScope;
const storage = new exports.AsyncLocalStorage();
/**
 * Disable the async local storage for updates.
 */
function disableUpdateStorage() {
    storage.disable();
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/worker-interface.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/worker-interface.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initRuntime = initRuntime;
exports.initialize = initialize;
exports.activate = activate;
exports.concludeActivation = concludeActivation;
exports.tryUnblockConditions = tryUnblockConditions;
exports.dispose = dispose;
/**
 * Exported functions for the Worker to interact with the Workflow isolate
 *
 * @module
 */
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const update_scope_1 = __webpack_require__(/*! ./update-scope */ "./node_modules/@temporalio/workflow/lib/update-scope.js");
const internals_1 = __webpack_require__(/*! ./internals */ "./node_modules/@temporalio/workflow/lib/internals.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const global = globalThis;
const OriginalDate = globalThis.Date;
/**
 * Initialize the isolate runtime.
 *
 * Sets required internal state and instantiates the workflow and interceptors.
 */
function initRuntime(options) {
    const activator = new internals_1.Activator({
        ...options,
        info: fixPrototypes({
            ...options.info,
            unsafe: { ...options.info.unsafe, now: OriginalDate.now },
        }),
    });
    // There's one activator per workflow instance, set it globally on the context.
    // We do this before importing any user code so user code can statically reference @temporalio/workflow functions
    // as well as Date and Math.random.
    (0, global_attributes_1.setActivatorUntyped)(activator);
    // webpack alias to payloadConverterPath
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const customPayloadConverter = (__webpack_require__(/*! __temporal_custom_payload_converter */ "?2065").payloadConverter);
    // The `payloadConverter` export is validated in the Worker
    if (customPayloadConverter != null) {
        activator.payloadConverter = customPayloadConverter;
    }
    // webpack alias to failureConverterPath
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const customFailureConverter = (__webpack_require__(/*! __temporal_custom_failure_converter */ "?31ff").failureConverter);
    // The `failureConverter` export is validated in the Worker
    if (customFailureConverter != null) {
        activator.failureConverter = customFailureConverter;
    }
    const { importWorkflows, importInterceptors } = global.__TEMPORAL__;
    if (importWorkflows === undefined || importInterceptors === undefined) {
        throw new common_1.IllegalStateError('Workflow bundle did not register import hooks');
    }
    const interceptors = importInterceptors();
    for (const mod of interceptors) {
        const factory = mod.interceptors;
        if (factory !== undefined) {
            if (typeof factory !== 'function') {
                throw new TypeError(`Failed to initialize workflows interceptors: expected a function, but got: '${factory}'`);
            }
            const interceptors = factory();
            activator.interceptors.inbound.push(...(interceptors.inbound ?? []));
            activator.interceptors.outbound.push(...(interceptors.outbound ?? []));
            activator.interceptors.internals.push(...(interceptors.internals ?? []));
        }
    }
    const mod = importWorkflows();
    const workflowFn = mod[activator.info.workflowType];
    const defaultWorkflowFn = mod['default'];
    if (typeof workflowFn === 'function') {
        activator.workflow = workflowFn;
    }
    else if (typeof defaultWorkflowFn === 'function') {
        activator.workflow = defaultWorkflowFn;
    }
    else {
        const details = workflowFn === undefined
            ? 'no such function is exported by the workflow bundle'
            : `expected a function, but got: '${typeof workflowFn}'`;
        throw new TypeError(`Failed to initialize workflow of type '${activator.info.workflowType}': ${details}`);
    }
}
/**
 * Objects transfered to the VM from outside have prototypes belonging to the
 * outer context, which means that instanceof won't work inside the VM. This
 * function recursively walks over the content of an object, and recreate some
 * of these objects (notably Array, Date and Objects).
 */
function fixPrototypes(obj) {
    if (obj != null && typeof obj === 'object') {
        switch (Object.getPrototypeOf(obj)?.constructor?.name) {
            case 'Array':
                return Array.from(obj.map(fixPrototypes));
            case 'Date':
                return new Date(obj);
            default:
                return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fixPrototypes(v)]));
        }
    }
    else
        return obj;
}
/**
 * Initialize the workflow. Or to be exact, _complete_ initialization, as most part has been done in constructor).
 */
function initialize(initializeWorkflowJob) {
    (0, global_attributes_1.getActivator)().initializeWorkflow(initializeWorkflowJob);
}
/**
 * Run a chunk of activation jobs
 */
function activate(activation, batchIndex = 0) {
    const activator = (0, global_attributes_1.getActivator)();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'activate', ({ activation }) => {
        // Cast from the interface to the class which has the `variant` attribute.
        // This is safe because we know that activation is a proto class.
        const jobs = activation.jobs;
        // Initialization will have been handled already, but we might still need to start the workflow function
        const startWorkflowJob = jobs[0].variant === 'initializeWorkflow' ? jobs.shift()?.initializeWorkflow : undefined;
        for (const job of jobs) {
            if (job.variant === undefined)
                throw new TypeError('Expected job.variant to be defined');
            const variant = job[job.variant];
            if (!variant)
                throw new TypeError(`Expected job.${job.variant} to be set`);
            activator[job.variant](variant /* TS can't infer this type */);
            if (job.variant !== 'queryWorkflow')
                tryUnblockConditions();
        }
        if (startWorkflowJob) {
            const safeJobTypes = [
                'initializeWorkflow',
                'signalWorkflow',
                'doUpdate',
                'cancelWorkflow',
                'updateRandomSeed',
            ];
            if (jobs.some((job) => !safeJobTypes.includes(job.variant))) {
                throw new TypeError('Received both initializeWorkflow and non-signal/non-update jobs in the same activation: ' +
                    JSON.stringify(jobs.map((job) => job.variant)));
            }
            activator.startWorkflow(startWorkflowJob);
            tryUnblockConditions();
        }
    });
    intercept({ activation, batchIndex });
}
/**
 * Conclude a single activation.
 * Should be called after processing all activation jobs and queued microtasks.
 *
 * Activation failures are handled in the main Node.js isolate.
 */
function concludeActivation() {
    const activator = (0, global_attributes_1.getActivator)();
    activator.rejectBufferedUpdates();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'concludeActivation', (input) => input);
    const activationCompletion = activator.concludeActivation();
    const { commands } = intercept({ commands: activationCompletion.commands });
    if (activator.completed) {
        activator.warnIfUnfinishedHandlers();
    }
    return {
        runId: activator.info.runId,
        successful: { ...activationCompletion, commands },
    };
}
/**
 * Loop through all blocked conditions, evaluate and unblock if possible.
 *
 * @returns number of unblocked conditions.
 */
function tryUnblockConditions() {
    let numUnblocked = 0;
    for (;;) {
        const prevUnblocked = numUnblocked;
        for (const [seq, cond] of (0, global_attributes_1.getActivator)().blockedConditions.entries()) {
            if (cond.fn()) {
                cond.resolve();
                numUnblocked++;
                // It is safe to delete elements during map iteration
                (0, global_attributes_1.getActivator)().blockedConditions.delete(seq);
            }
        }
        if (prevUnblocked === numUnblocked) {
            break;
        }
    }
    return numUnblocked;
}
function dispose() {
    const dispose = (0, interceptors_1.composeInterceptors)((0, global_attributes_1.getActivator)().interceptors.internals, 'dispose', async () => {
        (0, cancellation_scope_1.disableStorage)();
        (0, update_scope_1.disableUpdateStorage)();
    });
    dispose({});
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/workflow.js":
/*!***********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/workflow.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.workflowMetadataQuery = exports.enhancedStackTraceQuery = exports.stackTraceQuery = exports.NotAnActivityMethod = void 0;
exports.addDefaultWorkflowOptions = addDefaultWorkflowOptions;
exports.sleep = sleep;
exports.scheduleActivity = scheduleActivity;
exports.scheduleLocalActivity = scheduleLocalActivity;
exports.proxyActivities = proxyActivities;
exports.proxyLocalActivities = proxyLocalActivities;
exports.getExternalWorkflowHandle = getExternalWorkflowHandle;
exports.startChild = startChild;
exports.executeChild = executeChild;
exports.workflowInfo = workflowInfo;
exports.currentUpdateInfo = currentUpdateInfo;
exports.inWorkflowContext = inWorkflowContext;
exports.makeContinueAsNewFunc = makeContinueAsNewFunc;
exports.continueAsNew = continueAsNew;
exports.uuid4 = uuid4;
exports.patched = patched;
exports.deprecatePatch = deprecatePatch;
exports.condition = condition;
exports.defineUpdate = defineUpdate;
exports.defineSignal = defineSignal;
exports.defineQuery = defineQuery;
exports.setHandler = setHandler;
exports.setDefaultSignalHandler = setDefaultSignalHandler;
exports.upsertSearchAttributes = upsertSearchAttributes;
exports.upsertMemo = upsertMemo;
exports.allHandlersFinished = allHandlersFinished;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const versioning_intent_enum_1 = __webpack_require__(/*! @temporalio/common/lib/versioning-intent-enum */ "./node_modules/@temporalio/common/lib/versioning-intent-enum.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const update_scope_1 = __webpack_require__(/*! ./update-scope */ "./node_modules/@temporalio/workflow/lib/update-scope.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
// Avoid a circular dependency
(0, cancellation_scope_1.registerSleepImplementation)(sleep);
/**
 * Adds default values of `workflowId` and `cancellationType` to given workflow options.
 */
function addDefaultWorkflowOptions(opts) {
    const { args, workflowId, ...rest } = opts;
    return {
        workflowId: workflowId ?? uuid4(),
        args: (args ?? []),
        cancellationType: interfaces_1.ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED,
        ...rest,
    };
}
/**
 * Push a startTimer command into state accumulator and register completion
 */
function timerNextHandler(input) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                if (!activator.completions.timer.delete(input.seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    cancelTimer: {
                        seq: input.seq,
                    },
                });
                reject(err);
            }));
        }
        activator.pushCommand({
            startTimer: {
                seq: input.seq,
                startToFireTimeout: (0, time_1.msToTs)(input.durationMs),
            },
        });
        activator.completions.timer.set(input.seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Asynchronous sleep.
 *
 * Schedules a timer on the Temporal service.
 *
 * @param ms sleep duration - number of milliseconds or {@link https://www.npmjs.com/package/ms | ms-formatted string}.
 * If given a negative number or 0, value will be set to 1.
 */
function sleep(ms) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.sleep(...) may only be used from a Workflow Execution');
    const seq = activator.nextSeqs.timer++;
    const durationMs = Math.max(1, (0, time_1.msToNumber)(ms));
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startTimer', timerNextHandler);
    return execute({
        durationMs,
        seq,
    });
}
function validateActivityOptions(options) {
    if (options.scheduleToCloseTimeout === undefined && options.startToCloseTimeout === undefined) {
        throw new TypeError('Required either scheduleToCloseTimeout or startToCloseTimeout');
    }
}
// Use same validation we use for normal activities
const validateLocalActivityOptions = validateActivityOptions;
/**
 * Push a scheduleActivity command into activator accumulator and register completion
 */
function scheduleActivityNextHandler({ options, args, headers, seq, activityType }) {
    const activator = (0, global_attributes_1.getActivator)();
    validateActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleActivity: {
                seq,
                activityId: options.activityId ?? `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info.taskQueue,
                heartbeatTimeout: (0, time_1.msOptionalToTs)(options.heartbeatTimeout),
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                headers,
                cancellationType: (0, common_1.encodeActivityCancellationType)(options.cancellationType),
                doNotEagerlyExecute: !(options.allowEagerDispatch ?? true),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Push a scheduleActivity command into state accumulator and register completion
 */
async function scheduleLocalActivityNextHandler({ options, args, headers, seq, activityType, attempt, originalScheduleTime, }) {
    const activator = (0, global_attributes_1.getActivator)();
    // Eagerly fail the local activity (which will in turn fail the workflow task.
    // Do not fail on replay where the local activities may not be registered on the replay worker.
    if (!activator.info.unsafe.isReplaying && !activator.registeredActivityNames.has(activityType)) {
        throw new ReferenceError(`Local activity of type '${activityType}' not registered on worker`);
    }
    validateLocalActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelLocalActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleLocalActivity: {
                seq,
                attempt,
                originalScheduleTime,
                // Intentionally not exposing activityId as an option
                activityId: `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                localRetryThreshold: (0, time_1.msOptionalToTs)(options.localRetryThreshold),
                headers,
                cancellationType: (0, common_1.encodeActivityCancellationType)(options.cancellationType),
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
function scheduleActivity(activityType, args, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.scheduleActivity(...) may only be used from a Workflow Execution');
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    const seq = activator.nextSeqs.activity++;
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleActivity', scheduleActivityNextHandler);
    return execute({
        activityType,
        headers: {},
        options,
        args,
        seq,
    });
}
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
async function scheduleLocalActivity(activityType, args, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.scheduleLocalActivity(...) may only be used from a Workflow Execution');
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    let attempt = 1;
    let originalScheduleTime = undefined;
    for (;;) {
        const seq = activator.nextSeqs.activity++;
        const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleLocalActivity', scheduleLocalActivityNextHandler);
        try {
            return (await execute({
                activityType,
                headers: {},
                options,
                args,
                seq,
                attempt,
                originalScheduleTime,
            }));
        }
        catch (err) {
            if (err instanceof errors_1.LocalActivityDoBackoff) {
                await sleep((0, time_1.requiredTsToMs)(err.backoff.backoffDuration, 'backoffDuration'));
                if (typeof err.backoff.attempt !== 'number') {
                    throw new TypeError('Invalid backoff attempt type');
                }
                attempt = err.backoff.attempt;
                originalScheduleTime = err.backoff.originalScheduleTime ?? undefined;
            }
            else {
                throw err;
            }
        }
    }
}
function startChildWorkflowExecutionNextHandler({ options, headers, workflowType, seq, }) {
    const activator = (0, global_attributes_1.getActivator)();
    const workflowId = options.workflowId ?? uuid4();
    const startPromise = new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                const complete = !activator.completions.childWorkflowComplete.has(seq);
                if (!complete) {
                    activator.pushCommand({
                        cancelChildWorkflowExecution: { childWorkflowSeq: seq },
                    });
                }
                // Nothing to cancel otherwise
            }));
        }
        activator.pushCommand({
            startChildWorkflowExecution: {
                seq,
                workflowId,
                workflowType,
                input: (0, common_1.toPayloads)(activator.payloadConverter, ...options.args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info.taskQueue,
                workflowExecutionTimeout: (0, time_1.msOptionalToTs)(options.workflowExecutionTimeout),
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
                namespace: activator.info.namespace, // Not configurable
                headers,
                cancellationType: (0, interfaces_1.encodeChildWorkflowCancellationType)(options.cancellationType),
                workflowIdReusePolicy: (0, common_1.encodeWorkflowIdReusePolicy)(options.workflowIdReusePolicy),
                parentClosePolicy: (0, interfaces_1.encodeParentClosePolicy)(options.parentClosePolicy),
                cronSchedule: options.cronSchedule,
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            },
        });
        activator.completions.childWorkflowStart.set(seq, {
            resolve,
            reject,
        });
    });
    // We construct a Promise for the completion of the child Workflow before we know
    // if the Workflow code will await it to capture the result in case it does.
    const completePromise = new Promise((resolve, reject) => {
        // Chain start Promise rejection to the complete Promise.
        (0, stack_helpers_1.untrackPromise)(startPromise.catch(reject));
        activator.completions.childWorkflowComplete.set(seq, {
            resolve,
            reject,
        });
    });
    (0, stack_helpers_1.untrackPromise)(startPromise);
    (0, stack_helpers_1.untrackPromise)(completePromise);
    // Prevent unhandled rejection because the completion might not be awaited
    (0, stack_helpers_1.untrackPromise)(completePromise.catch(() => undefined));
    const ret = new Promise((resolve) => resolve([startPromise, completePromise]));
    (0, stack_helpers_1.untrackPromise)(ret);
    return ret;
}
function signalWorkflowNextHandler({ seq, signalName, args, target, headers }) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.signalWorkflow.has(seq)) {
                    return;
                }
                activator.pushCommand({ cancelSignalWorkflow: { seq } });
            }));
        }
        activator.pushCommand({
            signalExternalWorkflowExecution: {
                seq,
                args: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                signalName,
                ...(target.type === 'external'
                    ? {
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            ...target.workflowExecution,
                        },
                    }
                    : {
                        childWorkflowId: target.childWorkflowId,
                    }),
            },
        });
        activator.completions.signalWorkflow.set(seq, { resolve, reject });
    });
}
/**
 * Symbol used in the return type of proxy methods to mark that an attribute on the source type is not a method.
 *
 * @see {@link ActivityInterfaceFor}
 * @see {@link proxyActivities}
 * @see {@link proxyLocalActivities}
 */
exports.NotAnActivityMethod = Symbol.for('__TEMPORAL_NOT_AN_ACTIVITY_METHOD');
/**
 * Configure Activity functions with given {@link ActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy} for
 *         which each attribute is a callable Activity function
 *
 * @example
 * ```ts
 * import { proxyActivities } from '@temporalio/workflow';
 * import * as activities from '../activities';
 *
 * // Setup Activities from module exports
 * const { httpGet, otherActivity } = proxyActivities<typeof activities>({
 *   startToCloseTimeout: '30 minutes',
 * });
 *
 * // Setup Activities from an explicit interface (e.g. when defined by another SDK)
 * interface JavaActivities {
 *   httpGetFromJava(url: string): Promise<string>
 *   someOtherJavaActivity(arg1: number, arg2: string): Promise<string>;
 * }
 *
 * const {
 *   httpGetFromJava,
 *   someOtherJavaActivity
 * } = proxyActivities<JavaActivities>({
 *   taskQueue: 'java-worker-taskQueue',
 *   startToCloseTimeout: '5m',
 * });
 *
 * export function execute(): Promise<void> {
 *   const response = await httpGet("http://example.com");
 *   // ...
 * }
 * ```
 */
function proxyActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function activityProxyFunction(...args) {
                return scheduleActivity(activityType, args, options);
            };
        },
    });
}
/**
 * Configure Local Activity functions with given {@link LocalActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy}
 *         for which each attribute is a callable Activity function
 *
 * @see {@link proxyActivities} for examples
 */
function proxyLocalActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateLocalActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function localActivityProxyFunction(...args) {
                return scheduleLocalActivity(activityType, args, options);
            };
        },
    });
}
// TODO: deprecate this patch after "enough" time has passed
const EXTERNAL_WF_CANCEL_PATCH = '__temporal_internal_connect_external_handle_cancel_to_scope';
// The name of this patch comes from an attempt to build a generic internal patching mechanism.
// That effort has been abandoned in favor of a newer WorkflowTaskCompletedMetadata based mechanism.
const CONDITION_0_PATCH = '__sdk_internal_patch_number:1';
/**
 * Returns a client-side handle that can be used to signal and cancel an existing Workflow execution.
 * It takes a Workflow ID and optional run ID.
 */
function getExternalWorkflowHandle(workflowId, runId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.getExternalWorkflowHandle(...) may only be used from a Workflow Execution. Consider using Client.workflow.getHandle(...) instead.)');
    return {
        workflowId,
        runId,
        cancel() {
            return new Promise((resolve, reject) => {
                // Connect this cancel operation to the current cancellation scope.
                // This is behavior was introduced after v0.22.0 and is incompatible
                // with histories generated with previous SDK versions and thus requires
                // patching.
                //
                // We try to delay patching as much as possible to avoid polluting
                // histories unless strictly required.
                const scope = cancellation_scope_1.CancellationScope.current();
                if (scope.cancellable) {
                    (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                        if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                            reject(err);
                        }
                    }));
                }
                if (scope.consideredCancelled) {
                    if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                        return;
                    }
                }
                const seq = activator.nextSeqs.cancelWorkflow++;
                activator.pushCommand({
                    requestCancelExternalWorkflowExecution: {
                        seq,
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            workflowId,
                            runId,
                        },
                    },
                });
                activator.completions.cancelWorkflow.set(seq, { resolve, reject });
            });
        },
        signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'external',
                    workflowExecution: { workflowId, runId },
                },
                headers: {},
            });
        },
    };
}
async function startChild(workflowTypeOrFunc, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.startChild(...) may only be used from a Workflow Execution. Consider using Client.workflow.start(...) instead.)');
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = (0, common_1.extractWorkflowType)(workflowTypeOrFunc);
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const [started, completed] = await execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    const firstExecutionRunId = await started;
    return {
        workflowId: optionsWithDefaults.workflowId,
        firstExecutionRunId,
        async result() {
            return (await completed);
        },
        async signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'child',
                    childWorkflowId: optionsWithDefaults.workflowId,
                },
                headers: {},
            });
        },
    };
}
async function executeChild(workflowTypeOrFunc, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.executeChild(...) may only be used from a Workflow Execution. Consider using Client.workflow.execute(...) instead.');
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = (0, common_1.extractWorkflowType)(workflowTypeOrFunc);
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const execPromise = execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    (0, stack_helpers_1.untrackPromise)(execPromise);
    const completedPromise = execPromise.then(([_started, completed]) => completed);
    (0, stack_helpers_1.untrackPromise)(completedPromise);
    return completedPromise;
}
/**
 * Get information about the current Workflow.
 *
 * WARNING: This function returns a frozen copy of WorkflowInfo, at the point where this method has been called.
 * Changes happening at later point in workflow execution will not be reflected in the returned object.
 *
 * For this reason, we recommend calling `workflowInfo()` on every access to {@link WorkflowInfo}'s fields,
 * rather than caching the `WorkflowInfo` object (or part of it) in a local variable. For example:
 *
 * ```ts
 * // GOOD
 * function myWorkflow() {
 *   doSomething(workflowInfo().searchAttributes)
 *   ...
 *   doSomethingElse(workflowInfo().searchAttributes)
 * }
 * ```
 *
 * vs
 *
 * ```ts
 * // BAD
 * function myWorkflow() {
 *   const attributes = workflowInfo().searchAttributes
 *   doSomething(attributes)
 *   ...
 *   doSomethingElse(attributes)
 * }
 * ```
 */
function workflowInfo() {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.workflowInfo(...) may only be used from a Workflow Execution.');
    return activator.info;
}
/**
 * Get information about the current update if any.
 *
 * @return Info for the current update handler the code calling this is executing
 * within if any.
 */
function currentUpdateInfo() {
    (0, global_attributes_1.assertInWorkflowContext)('Workflow.currentUpdateInfo(...) may only be used from a Workflow Execution.');
    return update_scope_1.UpdateScope.current();
}
/**
 * Returns whether or not code is executing in workflow context
 */
function inWorkflowContext() {
    return (0, global_attributes_1.maybeGetActivator)() !== undefined;
}
/**
 * Returns a function `f` that will cause the current Workflow to ContinueAsNew when called.
 *
 * `f` takes the same arguments as the Workflow function supplied to typeparam `F`.
 *
 * Once `f` is called, Workflow Execution immediately completes.
 */
function makeContinueAsNewFunc(options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.continueAsNew(...) and Workflow.makeContinueAsNewFunc(...) may only be used from a Workflow Execution.');
    const info = activator.info;
    const { workflowType, taskQueue, ...rest } = options ?? {};
    const requiredOptions = {
        workflowType: workflowType ?? info.workflowType,
        taskQueue: taskQueue ?? info.taskQueue,
        ...rest,
    };
    return (...args) => {
        const fn = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'continueAsNew', async (input) => {
            const { headers, args, options } = input;
            throw new interfaces_1.ContinueAsNew({
                workflowType: options.workflowType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                taskQueue: options.taskQueue,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            });
        });
        return fn({
            args,
            headers: {},
            options: requiredOptions,
        });
    };
}
/**
 * {@link https://docs.temporal.io/concepts/what-is-continue-as-new/ | Continues-As-New} the current Workflow Execution
 * with default options.
 *
 * Shorthand for `makeContinueAsNewFunc<F>()(...args)`. (See: {@link makeContinueAsNewFunc}.)
 *
 * @example
 *
 *```ts
 *import { continueAsNew } from '@temporalio/workflow';
 *
 *export async function myWorkflow(n: number): Promise<void> {
 *  // ... Workflow logic
 *  await continueAsNew<typeof myWorkflow>(n + 1);
 *}
 *```
 */
function continueAsNew(...args) {
    return makeContinueAsNewFunc()(...args);
}
/**
 * Generate an RFC compliant V4 uuid.
 * Uses the workflow's deterministic PRNG making it safe for use within a workflow.
 * This function is cryptographically insecure.
 * See the {@link https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid | stackoverflow discussion}.
 */
function uuid4() {
    // Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
    const ho = (n, p) => n.toString(16).padStart(p, '0');
    // Create a view backed by a 16-byte buffer
    const view = new DataView(new ArrayBuffer(16));
    // Fill buffer with random values
    view.setUint32(0, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(4, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(8, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(12, (Math.random() * 0x100000000) >>> 0);
    // Patch the 6th byte to reflect a version 4 UUID
    view.setUint8(6, (view.getUint8(6) & 0xf) | 0x40);
    // Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
    view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80);
    // Compile the canonical textual form from the array data
    return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`;
}
/**
 * Patch or upgrade workflow code by checking or stating that this workflow has a certain patch.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * If the workflow is replaying an existing history, then this function returns true if that
 * history was produced by a worker which also had a `patched` call with the same `patchId`.
 * If the history was produced by a worker *without* such a call, then it will return false.
 *
 * If the workflow is not currently replaying, then this call *always* returns true.
 *
 * Your workflow code should run the "new" code if this returns true, if it returns false, you
 * should run the "old" code. By doing this, you can maintain determinism.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function patched(patchId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.patch(...) and Workflow.deprecatePatch may only be used from a Workflow Execution.');
    return activator.patchInternal(patchId, false);
}
/**
 * Indicate that a patch is being phased out.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * Workflows with this call may be deployed alongside workflows with a {@link patched} call, but
 * they must *not* be deployed while any workers still exist running old code without a
 * {@link patched} call, or any runs with histories produced by such workers exist. If either kind
 * of worker encounters a history produced by the other, their behavior is undefined.
 *
 * Once all live workflow runs have been produced by workers with this call, you can deploy workers
 * which are free of either kind of patch call for this ID. Workers with and without this call
 * may coexist, as long as they are both running the "new" code.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function deprecatePatch(patchId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.patch(...) and Workflow.deprecatePatch may only be used from a Workflow Execution.');
    activator.patchInternal(patchId, true);
}
async function condition(fn, timeout) {
    (0, global_attributes_1.assertInWorkflowContext)('Workflow.condition(...) may only be used from a Workflow Execution.');
    // Prior to 1.5.0, `condition(fn, 0)` was treated as equivalent to `condition(fn, undefined)`
    if (timeout === 0 && !patched(CONDITION_0_PATCH)) {
        return conditionInner(fn);
    }
    if (typeof timeout === 'number' || typeof timeout === 'string') {
        return cancellation_scope_1.CancellationScope.cancellable(async () => {
            try {
                return await Promise.race([sleep(timeout).then(() => false), conditionInner(fn).then(() => true)]);
            }
            finally {
                cancellation_scope_1.CancellationScope.current().cancel();
            }
        });
    }
    return conditionInner(fn);
}
function conditionInner(fn) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        const seq = activator.nextSeqs.condition++;
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                activator.blockedConditions.delete(seq);
                reject(err);
            }));
        }
        // Eager evaluation
        if (fn()) {
            resolve();
            return;
        }
        activator.blockedConditions.set(seq, { fn, resolve });
    });
}
/**
 * Define an update method for a Workflow.
 *
 * A definition is used to register a handler in the Workflow via {@link setHandler} and to update a Workflow using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.
 * A definition can be reused in multiple Workflows.
 */
function defineUpdate(name) {
    return {
        type: 'update',
        name,
    };
}
/**
 * Define a signal method for a Workflow.
 *
 * A definition is used to register a handler in the Workflow via {@link setHandler} and to signal a Workflow using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.
 * A definition can be reused in multiple Workflows.
 */
function defineSignal(name) {
    return {
        type: 'signal',
        name,
    };
}
/**
 * Define a query method for a Workflow.
 *
 * A definition is used to register a handler in the Workflow via {@link setHandler} and to query a Workflow using a {@link WorkflowHandle}.
 * A definition can be reused in multiple Workflows.
 */
function defineQuery(name) {
    return {
        type: 'query',
        name,
    };
}
// For Updates and Signals we want to make a public guarantee something like the
// following:
//
//   "If a WFT contains a Signal/Update, and if a handler is available for that
//   Signal/Update, then the handler will be executed.""
//
// However, that statement is not well-defined, leaving several questions open:
//
// 1. What does it mean for a handler to be "available"? What happens if the
//    handler is not present initially but is set at some point during the
//    Workflow code that is executed in that WFT? What happens if the handler is
//    set and then deleted, or replaced with a different handler?
//
// 2. When is the handler executed? (When it first becomes available? At the end
//    of the activation?) What are the execution semantics of Workflow and
//    Signal/Update handler code given that they are concurrent? Can the user
//    rely on Signal/Update side effects being reflected in the Workflow return
//    value, or in the value passed to Continue-As-New? If the handler is an
//    async function / coroutine, how much of it is executed and when is the
//    rest executed?
//
// 3. What happens if the handler is not executed? (i.e. because it wasn't
//    available in the sense defined by (1))
//
// 4. In the case of Update, when is the validation function executed?
//
// The implementation for Typescript is as follows:
//
// 1. sdk-core sorts Signal and Update jobs (and Patches) ahead of all other
//    jobs. Thus if the handler is available at the start of the Activation then
//    the Signal/Update will be executed before Workflow code is executed. If it
//    is not, then the Signal/Update calls are pushed to a buffer.
//
// 2. On each call to setHandler for a given Signal/Update, we make a pass
//    through the buffer list. If a buffered job is associated with the just-set
//    handler, then the job is removed from the buffer and the initial
//    synchronous portion of the handler is invoked on that input (i.e.
//    preempting workflow code).
//
// Thus in the case of Typescript the questions above are answered as follows:
//
// 1. A handler is "available" if it is set at the start of the Activation or
//    becomes set at any point during the Activation. If the handler is not set
//    initially then it is executed as soon as it is set. Subsequent deletion or
//    replacement by a different handler has no impact because the jobs it was
//    handling have already been handled and are no longer in the buffer.
//
// 2. The handler is executed as soon as it becomes available. I.e. if the
//    handler is set at the start of the Activation then it is executed when
//    first attempting to process the Signal/Update job; alternatively, if it is
//    set by a setHandler call made by Workflow code, then it is executed as
//    part of that call (preempting Workflow code). Therefore, a user can rely
//    on Signal/Update side effects being reflected in e.g. the Workflow return
//    value, and in the value passed to Continue-As-New. Activation jobs are
//    processed in the order supplied by sdk-core, i.e. Signals, then Updates,
//    then other jobs. Within each group, the order sent by the server is
//    preserved. If the handler is async, it is executed up to its first yield
//    point.
//
// 3. Signal case: If a handler does not become available for a Signal job then
//    the job remains in the buffer. If a handler for the Signal becomes
//    available in a subsequent Activation (of the same or a subsequent WFT)
//    then the handler will be executed. If not, then the Signal will never be
//    responded to and this causes no error.
//
//    Update case: If a handler does not become available for an Update job then
//    the Update is rejected at the end of the Activation. Thus, if a user does
//    not want an Update to be rejected for this reason, then it is their
//    responsibility to ensure that their application and workflow code interact
//    such that a handler is available for the Update during any Activation
//    which might contain their Update job. (Note that the user often has
//    uncertainty about which WFT their Signal/Update will appear in. For
//    example, if they call startWorkflow() followed by startUpdate(), then they
//    will typically not know whether these will be delivered in one or two
//    WFTs. On the other hand there are situations where they would have reason
//    to believe they are in the same WFT, for example if they do not start
//    Worker polling until after they have verified that both requests have
//    succeeded.)
//
// 4. If an Update has a validation function then it is executed immediately
//    prior to the handler. (Note that the validation function is required to be
//    synchronous).
function setHandler(def, handler, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.setHandler(...) may only be used from a Workflow Execution.');
    const description = options?.description;
    if (def.type === 'update') {
        if (typeof handler === 'function') {
            const updateOptions = options;
            const validator = updateOptions?.validator;
            const unfinishedPolicy = updateOptions?.unfinishedPolicy ?? common_1.HandlerUnfinishedPolicy.WARN_AND_ABANDON;
            activator.updateHandlers.set(def.name, { handler, validator, description, unfinishedPolicy });
            activator.dispatchBufferedUpdates();
        }
        else if (handler == null) {
            activator.updateHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else if (def.type === 'signal') {
        if (typeof handler === 'function') {
            const signalOptions = options;
            const unfinishedPolicy = signalOptions?.unfinishedPolicy ?? common_1.HandlerUnfinishedPolicy.WARN_AND_ABANDON;
            activator.signalHandlers.set(def.name, { handler: handler, description, unfinishedPolicy });
            activator.dispatchBufferedSignals();
        }
        else if (handler == null) {
            activator.signalHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else if (def.type === 'query') {
        if (typeof handler === 'function') {
            activator.queryHandlers.set(def.name, { handler: handler, description });
        }
        else if (handler == null) {
            activator.queryHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else {
        throw new TypeError(`Invalid definition type: ${def.type}`);
    }
}
/**
 * Set a signal handler function that will handle signals calls for non-registered signal names.
 *
 * Signals are dispatched to the default signal handler in the order that they were accepted by the server.
 *
 * If this function is called multiple times for a given signal or query name the last handler will overwrite any previous calls.
 *
 * @param handler a function that will handle signals for non-registered signal names, or `undefined` to unset the handler.
 */
function setDefaultSignalHandler(handler) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.setDefaultSignalHandler(...) may only be used from a Workflow Execution.');
    if (typeof handler === 'function') {
        activator.defaultSignalHandler = handler;
        activator.dispatchBufferedSignals();
    }
    else if (handler == null) {
        activator.defaultSignalHandler = undefined;
    }
    else {
        throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
    }
}
/**
 * Updates this Workflow's Search Attributes by merging the provided `searchAttributes` with the existing Search
 * Attributes, `workflowInfo().searchAttributes`.
 *
 * For example, this Workflow code:
 *
 * ```ts
 * upsertSearchAttributes({
 *   CustomIntField: [1],
 *   CustomBoolField: [true]
 * });
 * upsertSearchAttributes({
 *   CustomIntField: [42],
 *   CustomKeywordField: ['durable code', 'is great']
 * });
 * ```
 *
 * would result in the Workflow having these Search Attributes:
 *
 * ```ts
 * {
 *   CustomIntField: [42],
 *   CustomBoolField: [true],
 *   CustomKeywordField: ['durable code', 'is great']
 * }
 * ```
 *
 * @param searchAttributes The Record to merge. Use a value of `[]` to clear a Search Attribute.
 */
function upsertSearchAttributes(searchAttributes) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.upsertSearchAttributes(...) may only be used from a Workflow Execution.');
    if (searchAttributes == null) {
        throw new Error('searchAttributes must be a non-null SearchAttributes');
    }
    activator.pushCommand({
        upsertWorkflowSearchAttributes: {
            searchAttributes: (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, searchAttributes),
        },
    });
    activator.mutateWorkflowInfo((info) => {
        return {
            ...info,
            searchAttributes: {
                ...info.searchAttributes,
                ...searchAttributes,
            },
        };
    });
}
/**
 * Updates this Workflow's Memos by merging the provided `memo` with existing
 * Memos (as returned by `workflowInfo().memo`).
 *
 * New memo is merged by replacing properties of the same name _at the first
 * level only_. Setting a property to value `undefined` or `null` clears that
 * key from the Memo.
 *
 * For example:
 *
 * ```ts
 * upsertMemo({
 *   key1: value,
 *   key3: { subkey1: value }
 *   key4: value,
 * });
 * upsertMemo({
 *   key2: value
 *   key3: { subkey2: value }
 *   key4: undefined,
 * });
 * ```
 *
 * would result in the Workflow having these Memo:
 *
 * ```ts
 * {
 *   key1: value,
 *   key2: value,
 *   key3: { subkey2: value }  // Note this object was completely replaced
 *   // Note that key4 was completely removed
 * }
 * ```
 *
 * @param memo The Record to merge.
 */
function upsertMemo(memo) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.upsertMemo(...) may only be used from a Workflow Execution.');
    if (memo == null) {
        throw new Error('memo must be a non-null Record');
    }
    activator.pushCommand({
        modifyWorkflowProperties: {
            upsertedMemo: {
                fields: (0, common_1.mapToPayloads)(activator.payloadConverter, 
                // Convert null to undefined
                Object.fromEntries(Object.entries(memo).map(([k, v]) => [k, v ?? undefined]))),
            },
        },
    });
    activator.mutateWorkflowInfo((info) => {
        return {
            ...info,
            memo: Object.fromEntries(Object.entries({
                ...info.memo,
                ...memo,
            }).filter(([_, v]) => v != null)),
        };
    });
}
/**
 * Whether update and signal handlers have finished executing.
 *
 * Consider waiting on this condition before workflow return or continue-as-new, to prevent
 * interruption of in-progress handlers by workflow exit:
 *
 * ```ts
 * await workflow.condition(workflow.allHandlersFinished)
 * ```
 *
 * @returns true if there are no in-progress update or signal handler executions.
 */
function allHandlersFinished() {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('allHandlersFinished() may only be used from a Workflow Execution.');
    return activator.inProgressSignals.size === 0 && activator.inProgressUpdates.size === 0;
}
exports.stackTraceQuery = defineQuery('__stack_trace');
exports.enhancedStackTraceQuery = defineQuery('__enhanced_stack_trace');
exports.workflowMetadataQuery = defineQuery('__temporal_workflow_metadata');


/***/ }),

/***/ "./node_modules/@temporalio/workflow/package.json":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/package.json ***!
  \********************************************************/
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"name":"@temporalio/workflow","version":"1.11.7","description":"Temporal.io SDK Workflow sub-package","keywords":["temporal","workflow","isolate"],"bugs":{"url":"https://github.com/temporalio/sdk-typescript/issues"},"repository":{"type":"git","url":"git+https://github.com/temporalio/sdk-typescript.git","directory":"packages/workflow"},"homepage":"https://github.com/temporalio/sdk-typescript/tree/main/packages/workflow","license":"MIT","author":"Temporal Technologies Inc. <sdk@temporal.io>","main":"lib/index.js","types":"lib/index.d.ts","scripts":{},"dependencies":{"@temporalio/common":"1.11.7","@temporalio/proto":"1.11.7"},"devDependencies":{"source-map":"^0.7.4"},"publishConfig":{"access":"public"},"files":["src","lib"],"gitHead":"44386687128adaf6a284d3c5174181ad86310419"}');

/***/ }),

/***/ "./node_modules/long/umd/index.js":
/*!****************************************!*\
  !*** ./node_modules/long/umd/index.js ***!
  \****************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// GENERATED FILE. DO NOT EDIT.
(function (global, factory) {
  function unwrapDefault(exports) {
    return "default" in exports ? exports.default : exports;
  }
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
      var exports = {};
      factory(exports);
      return unwrapDefault(exports);
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof self !== "undefined"
      ? self
      : this,
  function (_exports) {
    "use strict";

    Object.defineProperty(_exports, "__esModule", {
      value: true,
    });
    _exports.default = void 0;
    /**
     * @license
     * Copyright 2009 The Closure Library Authors
     * Copyright 2020 Daniel Wirtz / The long.js Authors.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * SPDX-License-Identifier: Apache-2.0
     */

    // WebAssembly optimizations to do native i64 multiplication and divide
    var wasm = null;
    try {
      wasm = new WebAssembly.Instance(
        new WebAssembly.Module(
          new Uint8Array([
            // \0asm
            0, 97, 115, 109,
            // version 1
            1, 0, 0, 0,
            // section "type"
            1, 13, 2,
            // 0, () => i32
            96, 0, 1, 127,
            // 1, (i32, i32, i32, i32) => i32
            96, 4, 127, 127, 127, 127, 1, 127,
            // section "function"
            3, 7, 6,
            // 0, type 0
            0,
            // 1, type 1
            1,
            // 2, type 1
            1,
            // 3, type 1
            1,
            // 4, type 1
            1,
            // 5, type 1
            1,
            // section "global"
            6, 6, 1,
            // 0, "high", mutable i32
            127, 1, 65, 0, 11,
            // section "export"
            7, 50, 6,
            // 0, "mul"
            3, 109, 117, 108, 0, 1,
            // 1, "div_s"
            5, 100, 105, 118, 95, 115, 0, 2,
            // 2, "div_u"
            5, 100, 105, 118, 95, 117, 0, 3,
            // 3, "rem_s"
            5, 114, 101, 109, 95, 115, 0, 4,
            // 4, "rem_u"
            5, 114, 101, 109, 95, 117, 0, 5,
            // 5, "get_high"
            8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0,
            // section "code"
            10, 191, 1, 6,
            // 0, "get_high"
            4, 0, 35, 0, 11,
            // 1, "mul"
            36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173,
            32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0,
            32, 4, 167, 11,
            // 2, "div_s"
            36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173,
            32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0,
            32, 4, 167, 11,
            // 3, "div_u"
            36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173,
            32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0,
            32, 4, 167, 11,
            // 4, "rem_s"
            36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173,
            32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0,
            32, 4, 167, 11,
            // 5, "rem_u"
            36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173,
            32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0,
            32, 4, 167, 11,
          ]),
        ),
        {},
      ).exports;
    } catch {
      // no wasm support :(
    }

    /**
     * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
     *  See the from* functions below for more convenient ways of constructing Longs.
     * @exports Long
     * @class A Long class for representing a 64 bit two's-complement integer value.
     * @param {number} low The low (signed) 32 bits of the long
     * @param {number} high The high (signed) 32 bits of the long
     * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
     * @constructor
     */
    function Long(low, high, unsigned) {
      /**
       * The low 32 bits as a signed value.
       * @type {number}
       */
      this.low = low | 0;

      /**
       * The high 32 bits as a signed value.
       * @type {number}
       */
      this.high = high | 0;

      /**
       * Whether unsigned or not.
       * @type {boolean}
       */
      this.unsigned = !!unsigned;
    }

    // The internal representation of a long is the two given signed, 32-bit values.
    // We use 32-bit pieces because these are the size of integers on which
    // Javascript performs bit-operations.  For operations like addition and
    // multiplication, we split each number into 16 bit pieces, which can easily be
    // multiplied within Javascript's floating-point representation without overflow
    // or change in sign.
    //
    // In the algorithms below, we frequently reduce the negative case to the
    // positive case by negating the input(s) and then post-processing the result.
    // Note that we must ALWAYS check specially whether those values are MIN_VALUE
    // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
    // a positive number, it overflows back into a negative).  Not handling this
    // case would often result in infinite recursion.
    //
    // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
    // methods on which they depend.

    /**
     * An indicator used to reliably determine if an object is a Long or not.
     * @type {boolean}
     * @const
     * @private
     */
    Long.prototype.__isLong__;
    Object.defineProperty(Long.prototype, "__isLong__", {
      value: true,
    });

    /**
     * @function
     * @param {*} obj Object
     * @returns {boolean}
     * @inner
     */
    function isLong(obj) {
      return (obj && obj["__isLong__"]) === true;
    }

    /**
     * @function
     * @param {*} value number
     * @returns {number}
     * @inner
     */
    function ctz32(value) {
      var c = Math.clz32(value & -value);
      return value ? 31 - c : c;
    }

    /**
     * Tests if the specified object is a Long.
     * @function
     * @param {*} obj Object
     * @returns {boolean}
     */
    Long.isLong = isLong;

    /**
     * A cache of the Long representations of small integer values.
     * @type {!Object}
     * @inner
     */
    var INT_CACHE = {};

    /**
     * A cache of the Long representations of small unsigned integer values.
     * @type {!Object}
     * @inner
     */
    var UINT_CACHE = {};

    /**
     * @param {number} value
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromInt(value, unsigned) {
      var obj, cachedObj, cache;
      if (unsigned) {
        value >>>= 0;
        if ((cache = 0 <= value && value < 256)) {
          cachedObj = UINT_CACHE[value];
          if (cachedObj) return cachedObj;
        }
        obj = fromBits(value, 0, true);
        if (cache) UINT_CACHE[value] = obj;
        return obj;
      } else {
        value |= 0;
        if ((cache = -128 <= value && value < 128)) {
          cachedObj = INT_CACHE[value];
          if (cachedObj) return cachedObj;
        }
        obj = fromBits(value, value < 0 ? -1 : 0, false);
        if (cache) INT_CACHE[value] = obj;
        return obj;
      }
    }

    /**
     * Returns a Long representing the given 32 bit integer value.
     * @function
     * @param {number} value The 32 bit integer in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromInt = fromInt;

    /**
     * @param {number} value
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromNumber(value, unsigned) {
      if (isNaN(value)) return unsigned ? UZERO : ZERO;
      if (unsigned) {
        if (value < 0) return UZERO;
        if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
      } else {
        if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
        if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
      }
      if (value < 0) return fromNumber(-value, unsigned).neg();
      return fromBits(
        value % TWO_PWR_32_DBL | 0,
        (value / TWO_PWR_32_DBL) | 0,
        unsigned,
      );
    }

    /**
     * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
     * @function
     * @param {number} value The number in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromNumber = fromNumber;

    /**
     * @param {number} lowBits
     * @param {number} highBits
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromBits(lowBits, highBits, unsigned) {
      return new Long(lowBits, highBits, unsigned);
    }

    /**
     * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
     *  assumed to use 32 bits.
     * @function
     * @param {number} lowBits The low 32 bits
     * @param {number} highBits The high 32 bits
     * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromBits = fromBits;

    /**
     * @function
     * @param {number} base
     * @param {number} exponent
     * @returns {number}
     * @inner
     */
    var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)

    /**
     * @param {string} str
     * @param {(boolean|number)=} unsigned
     * @param {number=} radix
     * @returns {!Long}
     * @inner
     */
    function fromString(str, unsigned, radix) {
      if (str.length === 0) throw Error("empty string");
      if (typeof unsigned === "number") {
        // For goog.math.long compatibility
        radix = unsigned;
        unsigned = false;
      } else {
        unsigned = !!unsigned;
      }
      if (
        str === "NaN" ||
        str === "Infinity" ||
        str === "+Infinity" ||
        str === "-Infinity"
      )
        return unsigned ? UZERO : ZERO;
      radix = radix || 10;
      if (radix < 2 || 36 < radix) throw RangeError("radix");
      var p;
      if ((p = str.indexOf("-")) > 0) throw Error("interior hyphen");
      else if (p === 0) {
        return fromString(str.substring(1), unsigned, radix).neg();
      }

      // Do several (8) digits each time through the loop, so as to
      // minimize the calls to the very expensive emulated div.
      var radixToPower = fromNumber(pow_dbl(radix, 8));
      var result = ZERO;
      for (var i = 0; i < str.length; i += 8) {
        var size = Math.min(8, str.length - i),
          value = parseInt(str.substring(i, i + size), radix);
        if (size < 8) {
          var power = fromNumber(pow_dbl(radix, size));
          result = result.mul(power).add(fromNumber(value));
        } else {
          result = result.mul(radixToPower);
          result = result.add(fromNumber(value));
        }
      }
      result.unsigned = unsigned;
      return result;
    }

    /**
     * Returns a Long representation of the given string, written using the specified radix.
     * @function
     * @param {string} str The textual representation of the Long
     * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to signed
     * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
     * @returns {!Long} The corresponding Long value
     */
    Long.fromString = fromString;

    /**
     * @function
     * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromValue(val, unsigned) {
      if (typeof val === "number") return fromNumber(val, unsigned);
      if (typeof val === "string") return fromString(val, unsigned);
      // Throws for non-objects, converts non-instanceof Long:
      return fromBits(
        val.low,
        val.high,
        typeof unsigned === "boolean" ? unsigned : val.unsigned,
      );
    }

    /**
     * Converts the specified value to a Long using the appropriate from* function for its type.
     * @function
     * @param {!Long|number|bigint|string|!{low: number, high: number, unsigned: boolean}} val Value
     * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
     * @returns {!Long}
     */
    Long.fromValue = fromValue;

    // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
    // no runtime penalty for these.

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_16_DBL = 1 << 16;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_24_DBL = 1 << 24;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;

    /**
     * @type {!Long}
     * @const
     * @inner
     */
    var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);

    /**
     * @type {!Long}
     * @inner
     */
    var ZERO = fromInt(0);

    /**
     * Signed zero.
     * @type {!Long}
     */
    Long.ZERO = ZERO;

    /**
     * @type {!Long}
     * @inner
     */
    var UZERO = fromInt(0, true);

    /**
     * Unsigned zero.
     * @type {!Long}
     */
    Long.UZERO = UZERO;

    /**
     * @type {!Long}
     * @inner
     */
    var ONE = fromInt(1);

    /**
     * Signed one.
     * @type {!Long}
     */
    Long.ONE = ONE;

    /**
     * @type {!Long}
     * @inner
     */
    var UONE = fromInt(1, true);

    /**
     * Unsigned one.
     * @type {!Long}
     */
    Long.UONE = UONE;

    /**
     * @type {!Long}
     * @inner
     */
    var NEG_ONE = fromInt(-1);

    /**
     * Signed negative one.
     * @type {!Long}
     */
    Long.NEG_ONE = NEG_ONE;

    /**
     * @type {!Long}
     * @inner
     */
    var MAX_VALUE = fromBits(0xffffffff | 0, 0x7fffffff | 0, false);

    /**
     * Maximum signed value.
     * @type {!Long}
     */
    Long.MAX_VALUE = MAX_VALUE;

    /**
     * @type {!Long}
     * @inner
     */
    var MAX_UNSIGNED_VALUE = fromBits(0xffffffff | 0, 0xffffffff | 0, true);

    /**
     * Maximum unsigned value.
     * @type {!Long}
     */
    Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;

    /**
     * @type {!Long}
     * @inner
     */
    var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);

    /**
     * Minimum signed value.
     * @type {!Long}
     */
    Long.MIN_VALUE = MIN_VALUE;

    /**
     * @alias Long.prototype
     * @inner
     */
    var LongPrototype = Long.prototype;

    /**
     * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
     * @this {!Long}
     * @returns {number}
     */
    LongPrototype.toInt = function toInt() {
      return this.unsigned ? this.low >>> 0 : this.low;
    };

    /**
     * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
     * @this {!Long}
     * @returns {number}
     */
    LongPrototype.toNumber = function toNumber() {
      if (this.unsigned)
        return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
      return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };

    /**
     * Converts the Long to a string written in the specified radix.
     * @this {!Long}
     * @param {number=} radix Radix (2-36), defaults to 10
     * @returns {string}
     * @override
     * @throws {RangeError} If `radix` is out of range
     */
    LongPrototype.toString = function toString(radix) {
      radix = radix || 10;
      if (radix < 2 || 36 < radix) throw RangeError("radix");
      if (this.isZero()) return "0";
      if (this.isNegative()) {
        // Unsigned Longs are never negative
        if (this.eq(MIN_VALUE)) {
          // We need to change the Long value before it can be negated, so we remove
          // the bottom-most digit in this base and then recurse to do the rest.
          var radixLong = fromNumber(radix),
            div = this.div(radixLong),
            rem1 = div.mul(radixLong).sub(this);
          return div.toString(radix) + rem1.toInt().toString(radix);
        } else return "-" + this.neg().toString(radix);
      }

      // Do several (6) digits each time through the loop, so as to
      // minimize the calls to the very expensive emulated div.
      var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
        rem = this;
      var result = "";
      while (true) {
        var remDiv = rem.div(radixToPower),
          intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
          digits = intval.toString(radix);
        rem = remDiv;
        if (rem.isZero()) return digits + result;
        else {
          while (digits.length < 6) digits = "0" + digits;
          result = "" + digits + result;
        }
      }
    };

    /**
     * Gets the high 32 bits as a signed integer.
     * @this {!Long}
     * @returns {number} Signed high bits
     */
    LongPrototype.getHighBits = function getHighBits() {
      return this.high;
    };

    /**
     * Gets the high 32 bits as an unsigned integer.
     * @this {!Long}
     * @returns {number} Unsigned high bits
     */
    LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
      return this.high >>> 0;
    };

    /**
     * Gets the low 32 bits as a signed integer.
     * @this {!Long}
     * @returns {number} Signed low bits
     */
    LongPrototype.getLowBits = function getLowBits() {
      return this.low;
    };

    /**
     * Gets the low 32 bits as an unsigned integer.
     * @this {!Long}
     * @returns {number} Unsigned low bits
     */
    LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
      return this.low >>> 0;
    };

    /**
     * Gets the number of bits needed to represent the absolute value of this Long.
     * @this {!Long}
     * @returns {number}
     */
    LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
      if (this.isNegative())
        // Unsigned Longs are never negative
        return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
      var val = this.high != 0 ? this.high : this.low;
      for (var bit = 31; bit > 0; bit--) if ((val & (1 << bit)) != 0) break;
      return this.high != 0 ? bit + 33 : bit + 1;
    };

    /**
     * Tests if this Long can be safely represented as a JavaScript number.
     * @this {!Long}
     * @returns {boolean}
     */
    LongPrototype.isSafeInteger = function isSafeInteger() {
      // 2^53-1 is the maximum safe value
      var top11Bits = this.high >> 21;
      // [0, 2^53-1]
      if (!top11Bits) return true;
      // > 2^53-1
      if (this.unsigned) return false;
      // [-2^53, -1] except -2^53
      return top11Bits === -1 && !(this.low === 0 && this.high === -0x200000);
    };

    /**
     * Tests if this Long's value equals zero.
     * @this {!Long}
     * @returns {boolean}
     */
    LongPrototype.isZero = function isZero() {
      return this.high === 0 && this.low === 0;
    };

    /**
     * Tests if this Long's value equals zero. This is an alias of {@link Long#isZero}.
     * @returns {boolean}
     */
    LongPrototype.eqz = LongPrototype.isZero;

    /**
     * Tests if this Long's value is negative.
     * @this {!Long}
     * @returns {boolean}
     */
    LongPrototype.isNegative = function isNegative() {
      return !this.unsigned && this.high < 0;
    };

    /**
     * Tests if this Long's value is positive or zero.
     * @this {!Long}
     * @returns {boolean}
     */
    LongPrototype.isPositive = function isPositive() {
      return this.unsigned || this.high >= 0;
    };

    /**
     * Tests if this Long's value is odd.
     * @this {!Long}
     * @returns {boolean}
     */
    LongPrototype.isOdd = function isOdd() {
      return (this.low & 1) === 1;
    };

    /**
     * Tests if this Long's value is even.
     * @this {!Long}
     * @returns {boolean}
     */
    LongPrototype.isEven = function isEven() {
      return (this.low & 1) === 0;
    };

    /**
     * Tests if this Long's value equals the specified's.
     * @this {!Long}
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.equals = function equals(other) {
      if (!isLong(other)) other = fromValue(other);
      if (
        this.unsigned !== other.unsigned &&
        this.high >>> 31 === 1 &&
        other.high >>> 31 === 1
      )
        return false;
      return this.high === other.high && this.low === other.low;
    };

    /**
     * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
     * @function
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.eq = LongPrototype.equals;

    /**
     * Tests if this Long's value differs from the specified's.
     * @this {!Long}
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.notEquals = function notEquals(other) {
      return !this.eq(/* validates */ other);
    };

    /**
     * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
     * @function
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.neq = LongPrototype.notEquals;

    /**
     * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
     * @function
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.ne = LongPrototype.notEquals;

    /**
     * Tests if this Long's value is less than the specified's.
     * @this {!Long}
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lessThan = function lessThan(other) {
      return this.comp(/* validates */ other) < 0;
    };

    /**
     * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
     * @function
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lt = LongPrototype.lessThan;

    /**
     * Tests if this Long's value is less than or equal the specified's.
     * @this {!Long}
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
      return this.comp(/* validates */ other) <= 0;
    };

    /**
     * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
     * @function
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lte = LongPrototype.lessThanOrEqual;

    /**
     * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
     * @function
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.le = LongPrototype.lessThanOrEqual;

    /**
     * Tests if this Long's value is greater than the specified's.
     * @this {!Long}
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.greaterThan = function greaterThan(other) {
      return this.comp(/* validates */ other) > 0;
    };

    /**
     * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
     * @function
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.gt = LongPrototype.greaterThan;

    /**
     * Tests if this Long's value is greater than or equal the specified's.
     * @this {!Long}
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
      return this.comp(/* validates */ other) >= 0;
    };

    /**
     * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
     * @function
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.gte = LongPrototype.greaterThanOrEqual;

    /**
     * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
     * @function
     * @param {!Long|number|bigint|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.ge = LongPrototype.greaterThanOrEqual;

    /**
     * Compares this Long's value with the specified's.
     * @this {!Long}
     * @param {!Long|number|bigint|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     */
    LongPrototype.compare = function compare(other) {
      if (!isLong(other)) other = fromValue(other);
      if (this.eq(other)) return 0;
      var thisNeg = this.isNegative(),
        otherNeg = other.isNegative();
      if (thisNeg && !otherNeg) return -1;
      if (!thisNeg && otherNeg) return 1;
      // At this point the sign bits are the same
      if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1;
      // Both are positive if at least one is unsigned
      return other.high >>> 0 > this.high >>> 0 ||
        (other.high === this.high && other.low >>> 0 > this.low >>> 0)
        ? -1
        : 1;
    };

    /**
     * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
     * @function
     * @param {!Long|number|bigint|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     */
    LongPrototype.comp = LongPrototype.compare;

    /**
     * Negates this Long's value.
     * @this {!Long}
     * @returns {!Long} Negated Long
     */
    LongPrototype.negate = function negate() {
      if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
      return this.not().add(ONE);
    };

    /**
     * Negates this Long's value. This is an alias of {@link Long#negate}.
     * @function
     * @returns {!Long} Negated Long
     */
    LongPrototype.neg = LongPrototype.negate;

    /**
     * Returns the sum of this and the specified Long.
     * @this {!Long}
     * @param {!Long|number|bigint|string} addend Addend
     * @returns {!Long} Sum
     */
    LongPrototype.add = function add(addend) {
      if (!isLong(addend)) addend = fromValue(addend);

      // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

      var a48 = this.high >>> 16;
      var a32 = this.high & 0xffff;
      var a16 = this.low >>> 16;
      var a00 = this.low & 0xffff;
      var b48 = addend.high >>> 16;
      var b32 = addend.high & 0xffff;
      var b16 = addend.low >>> 16;
      var b00 = addend.low & 0xffff;
      var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
      c00 += a00 + b00;
      c16 += c00 >>> 16;
      c00 &= 0xffff;
      c16 += a16 + b16;
      c32 += c16 >>> 16;
      c16 &= 0xffff;
      c32 += a32 + b32;
      c48 += c32 >>> 16;
      c32 &= 0xffff;
      c48 += a48 + b48;
      c48 &= 0xffff;
      return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };

    /**
     * Returns the difference of this and the specified Long.
     * @this {!Long}
     * @param {!Long|number|bigint|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     */
    LongPrototype.subtract = function subtract(subtrahend) {
      if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
      return this.add(subtrahend.neg());
    };

    /**
     * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
     * @function
     * @param {!Long|number|bigint|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     */
    LongPrototype.sub = LongPrototype.subtract;

    /**
     * Returns the product of this and the specified Long.
     * @this {!Long}
     * @param {!Long|number|bigint|string} multiplier Multiplier
     * @returns {!Long} Product
     */
    LongPrototype.multiply = function multiply(multiplier) {
      if (this.isZero()) return this;
      if (!isLong(multiplier)) multiplier = fromValue(multiplier);

      // use wasm support if present
      if (wasm) {
        var low = wasm["mul"](
          this.low,
          this.high,
          multiplier.low,
          multiplier.high,
        );
        return fromBits(low, wasm["get_high"](), this.unsigned);
      }
      if (multiplier.isZero()) return this.unsigned ? UZERO : ZERO;
      if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
      if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
      if (this.isNegative()) {
        if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());
        else return this.neg().mul(multiplier).neg();
      } else if (multiplier.isNegative())
        return this.mul(multiplier.neg()).neg();

      // If both longs are small, use float multiplication
      if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
        return fromNumber(
          this.toNumber() * multiplier.toNumber(),
          this.unsigned,
        );

      // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
      // We can skip products that would overflow.

      var a48 = this.high >>> 16;
      var a32 = this.high & 0xffff;
      var a16 = this.low >>> 16;
      var a00 = this.low & 0xffff;
      var b48 = multiplier.high >>> 16;
      var b32 = multiplier.high & 0xffff;
      var b16 = multiplier.low >>> 16;
      var b00 = multiplier.low & 0xffff;
      var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
      c00 += a00 * b00;
      c16 += c00 >>> 16;
      c00 &= 0xffff;
      c16 += a16 * b00;
      c32 += c16 >>> 16;
      c16 &= 0xffff;
      c16 += a00 * b16;
      c32 += c16 >>> 16;
      c16 &= 0xffff;
      c32 += a32 * b00;
      c48 += c32 >>> 16;
      c32 &= 0xffff;
      c32 += a16 * b16;
      c48 += c32 >>> 16;
      c32 &= 0xffff;
      c32 += a00 * b32;
      c48 += c32 >>> 16;
      c32 &= 0xffff;
      c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
      c48 &= 0xffff;
      return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };

    /**
     * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
     * @function
     * @param {!Long|number|bigint|string} multiplier Multiplier
     * @returns {!Long} Product
     */
    LongPrototype.mul = LongPrototype.multiply;

    /**
     * Returns this Long divided by the specified. The result is signed if this Long is signed or
     *  unsigned if this Long is unsigned.
     * @this {!Long}
     * @param {!Long|number|bigint|string} divisor Divisor
     * @returns {!Long} Quotient
     */
    LongPrototype.divide = function divide(divisor) {
      if (!isLong(divisor)) divisor = fromValue(divisor);
      if (divisor.isZero()) throw Error("division by zero");

      // use wasm support if present
      if (wasm) {
        // guard against signed division overflow: the largest
        // negative number / -1 would be 1 larger than the largest
        // positive number, due to two's complement.
        if (
          !this.unsigned &&
          this.high === -0x80000000 &&
          divisor.low === -1 &&
          divisor.high === -1
        ) {
          // be consistent with non-wasm code path
          return this;
        }
        var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(
          this.low,
          this.high,
          divisor.low,
          divisor.high,
        );
        return fromBits(low, wasm["get_high"](), this.unsigned);
      }
      if (this.isZero()) return this.unsigned ? UZERO : ZERO;
      var approx, rem, res;
      if (!this.unsigned) {
        // This section is only relevant for signed longs and is derived from the
        // closure library as a whole.
        if (this.eq(MIN_VALUE)) {
          if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
            return MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
          else if (divisor.eq(MIN_VALUE)) return ONE;
          else {
            // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
            var halfThis = this.shr(1);
            approx = halfThis.div(divisor).shl(1);
            if (approx.eq(ZERO)) {
              return divisor.isNegative() ? ONE : NEG_ONE;
            } else {
              rem = this.sub(divisor.mul(approx));
              res = approx.add(rem.div(divisor));
              return res;
            }
          }
        } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
        if (this.isNegative()) {
          if (divisor.isNegative()) return this.neg().div(divisor.neg());
          return this.neg().div(divisor).neg();
        } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
        res = ZERO;
      } else {
        // The algorithm below has not been made for unsigned longs. It's therefore
        // required to take special care of the MSB prior to running it.
        if (!divisor.unsigned) divisor = divisor.toUnsigned();
        if (divisor.gt(this)) return UZERO;
        if (divisor.gt(this.shru(1)))
          // 15 >>> 1 = 7 ; with divisor = 8 ; true
          return UONE;
        res = UZERO;
      }

      // Repeat the following until the remainder is less than other:  find a
      // floating-point that approximates remainder / other *from below*, add this
      // into the result, and subtract it from the remainder.  It is critical that
      // the approximate value is less than or equal to the real value so that the
      // remainder never becomes negative.
      rem = this;
      while (rem.gte(divisor)) {
        // Approximate the result of division. This may be a little greater or
        // smaller than the actual value.
        approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));

        // We will tweak the approximate result by changing it in the 48-th digit or
        // the smallest non-fractional digit, whichever is larger.
        var log2 = Math.ceil(Math.log(approx) / Math.LN2),
          delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48),
          // Decrease the approximation until it is smaller than the remainder.  Note
          // that if it is too large, the product overflows and is negative.
          approxRes = fromNumber(approx),
          approxRem = approxRes.mul(divisor);
        while (approxRem.isNegative() || approxRem.gt(rem)) {
          approx -= delta;
          approxRes = fromNumber(approx, this.unsigned);
          approxRem = approxRes.mul(divisor);
        }

        // We know the answer can't be zero... and actually, zero would cause
        // infinite recursion since we would make no progress.
        if (approxRes.isZero()) approxRes = ONE;
        res = res.add(approxRes);
        rem = rem.sub(approxRem);
      }
      return res;
    };

    /**
     * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
     * @function
     * @param {!Long|number|bigint|string} divisor Divisor
     * @returns {!Long} Quotient
     */
    LongPrototype.div = LongPrototype.divide;

    /**
     * Returns this Long modulo the specified.
     * @this {!Long}
     * @param {!Long|number|bigint|string} divisor Divisor
     * @returns {!Long} Remainder
     */
    LongPrototype.modulo = function modulo(divisor) {
      if (!isLong(divisor)) divisor = fromValue(divisor);

      // use wasm support if present
      if (wasm) {
        var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(
          this.low,
          this.high,
          divisor.low,
          divisor.high,
        );
        return fromBits(low, wasm["get_high"](), this.unsigned);
      }
      return this.sub(this.div(divisor).mul(divisor));
    };

    /**
     * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
     * @function
     * @param {!Long|number|bigint|string} divisor Divisor
     * @returns {!Long} Remainder
     */
    LongPrototype.mod = LongPrototype.modulo;

    /**
     * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
     * @function
     * @param {!Long|number|bigint|string} divisor Divisor
     * @returns {!Long} Remainder
     */
    LongPrototype.rem = LongPrototype.modulo;

    /**
     * Returns the bitwise NOT of this Long.
     * @this {!Long}
     * @returns {!Long}
     */
    LongPrototype.not = function not() {
      return fromBits(~this.low, ~this.high, this.unsigned);
    };

    /**
     * Returns count leading zeros of this Long.
     * @this {!Long}
     * @returns {!number}
     */
    LongPrototype.countLeadingZeros = function countLeadingZeros() {
      return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
    };

    /**
     * Returns count leading zeros. This is an alias of {@link Long#countLeadingZeros}.
     * @function
     * @param {!Long}
     * @returns {!number}
     */
    LongPrototype.clz = LongPrototype.countLeadingZeros;

    /**
     * Returns count trailing zeros of this Long.
     * @this {!Long}
     * @returns {!number}
     */
    LongPrototype.countTrailingZeros = function countTrailingZeros() {
      return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
    };

    /**
     * Returns count trailing zeros. This is an alias of {@link Long#countTrailingZeros}.
     * @function
     * @param {!Long}
     * @returns {!number}
     */
    LongPrototype.ctz = LongPrototype.countTrailingZeros;

    /**
     * Returns the bitwise AND of this Long and the specified.
     * @this {!Long}
     * @param {!Long|number|bigint|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.and = function and(other) {
      if (!isLong(other)) other = fromValue(other);
      return fromBits(
        this.low & other.low,
        this.high & other.high,
        this.unsigned,
      );
    };

    /**
     * Returns the bitwise OR of this Long and the specified.
     * @this {!Long}
     * @param {!Long|number|bigint|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.or = function or(other) {
      if (!isLong(other)) other = fromValue(other);
      return fromBits(
        this.low | other.low,
        this.high | other.high,
        this.unsigned,
      );
    };

    /**
     * Returns the bitwise XOR of this Long and the given one.
     * @this {!Long}
     * @param {!Long|number|bigint|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.xor = function xor(other) {
      if (!isLong(other)) other = fromValue(other);
      return fromBits(
        this.low ^ other.low,
        this.high ^ other.high,
        this.unsigned,
      );
    };

    /**
     * Returns this Long with bits shifted to the left by the given amount.
     * @this {!Long}
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftLeft = function shiftLeft(numBits) {
      if (isLong(numBits)) numBits = numBits.toInt();
      if ((numBits &= 63) === 0) return this;
      else if (numBits < 32)
        return fromBits(
          this.low << numBits,
          (this.high << numBits) | (this.low >>> (32 - numBits)),
          this.unsigned,
        );
      else return fromBits(0, this.low << (numBits - 32), this.unsigned);
    };

    /**
     * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shl = LongPrototype.shiftLeft;

    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount.
     * @this {!Long}
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftRight = function shiftRight(numBits) {
      if (isLong(numBits)) numBits = numBits.toInt();
      if ((numBits &= 63) === 0) return this;
      else if (numBits < 32)
        return fromBits(
          (this.low >>> numBits) | (this.high << (32 - numBits)),
          this.high >> numBits,
          this.unsigned,
        );
      else
        return fromBits(
          this.high >> (numBits - 32),
          this.high >= 0 ? 0 : -1,
          this.unsigned,
        );
    };

    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shr = LongPrototype.shiftRight;

    /**
     * Returns this Long with bits logically shifted to the right by the given amount.
     * @this {!Long}
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
      if (isLong(numBits)) numBits = numBits.toInt();
      if ((numBits &= 63) === 0) return this;
      if (numBits < 32)
        return fromBits(
          (this.low >>> numBits) | (this.high << (32 - numBits)),
          this.high >>> numBits,
          this.unsigned,
        );
      if (numBits === 32) return fromBits(this.high, 0, this.unsigned);
      return fromBits(this.high >>> (numBits - 32), 0, this.unsigned);
    };

    /**
     * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shru = LongPrototype.shiftRightUnsigned;

    /**
     * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;

    /**
     * Returns this Long with bits rotated to the left by the given amount.
     * @this {!Long}
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Rotated Long
     */
    LongPrototype.rotateLeft = function rotateLeft(numBits) {
      var b;
      if (isLong(numBits)) numBits = numBits.toInt();
      if ((numBits &= 63) === 0) return this;
      if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
      if (numBits < 32) {
        b = 32 - numBits;
        return fromBits(
          (this.low << numBits) | (this.high >>> b),
          (this.high << numBits) | (this.low >>> b),
          this.unsigned,
        );
      }
      numBits -= 32;
      b = 32 - numBits;
      return fromBits(
        (this.high << numBits) | (this.low >>> b),
        (this.low << numBits) | (this.high >>> b),
        this.unsigned,
      );
    };
    /**
     * Returns this Long with bits rotated to the left by the given amount. This is an alias of {@link Long#rotateLeft}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Rotated Long
     */
    LongPrototype.rotl = LongPrototype.rotateLeft;

    /**
     * Returns this Long with bits rotated to the right by the given amount.
     * @this {!Long}
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Rotated Long
     */
    LongPrototype.rotateRight = function rotateRight(numBits) {
      var b;
      if (isLong(numBits)) numBits = numBits.toInt();
      if ((numBits &= 63) === 0) return this;
      if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
      if (numBits < 32) {
        b = 32 - numBits;
        return fromBits(
          (this.high << b) | (this.low >>> numBits),
          (this.low << b) | (this.high >>> numBits),
          this.unsigned,
        );
      }
      numBits -= 32;
      b = 32 - numBits;
      return fromBits(
        (this.low << b) | (this.high >>> numBits),
        (this.high << b) | (this.low >>> numBits),
        this.unsigned,
      );
    };
    /**
     * Returns this Long with bits rotated to the right by the given amount. This is an alias of {@link Long#rotateRight}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Rotated Long
     */
    LongPrototype.rotr = LongPrototype.rotateRight;

    /**
     * Converts this Long to signed.
     * @this {!Long}
     * @returns {!Long} Signed long
     */
    LongPrototype.toSigned = function toSigned() {
      if (!this.unsigned) return this;
      return fromBits(this.low, this.high, false);
    };

    /**
     * Converts this Long to unsigned.
     * @this {!Long}
     * @returns {!Long} Unsigned long
     */
    LongPrototype.toUnsigned = function toUnsigned() {
      if (this.unsigned) return this;
      return fromBits(this.low, this.high, true);
    };

    /**
     * Converts this Long to its byte representation.
     * @param {boolean=} le Whether little or big endian, defaults to big endian
     * @this {!Long}
     * @returns {!Array.<number>} Byte representation
     */
    LongPrototype.toBytes = function toBytes(le) {
      return le ? this.toBytesLE() : this.toBytesBE();
    };

    /**
     * Converts this Long to its little endian byte representation.
     * @this {!Long}
     * @returns {!Array.<number>} Little endian byte representation
     */
    LongPrototype.toBytesLE = function toBytesLE() {
      var hi = this.high,
        lo = this.low;
      return [
        lo & 0xff,
        (lo >>> 8) & 0xff,
        (lo >>> 16) & 0xff,
        lo >>> 24,
        hi & 0xff,
        (hi >>> 8) & 0xff,
        (hi >>> 16) & 0xff,
        hi >>> 24,
      ];
    };

    /**
     * Converts this Long to its big endian byte representation.
     * @this {!Long}
     * @returns {!Array.<number>} Big endian byte representation
     */
    LongPrototype.toBytesBE = function toBytesBE() {
      var hi = this.high,
        lo = this.low;
      return [
        hi >>> 24,
        (hi >>> 16) & 0xff,
        (hi >>> 8) & 0xff,
        hi & 0xff,
        lo >>> 24,
        (lo >>> 16) & 0xff,
        (lo >>> 8) & 0xff,
        lo & 0xff,
      ];
    };

    /**
     * Creates a Long from its byte representation.
     * @param {!Array.<number>} bytes Byte representation
     * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
     * @param {boolean=} le Whether little or big endian, defaults to big endian
     * @returns {Long} The corresponding Long value
     */
    Long.fromBytes = function fromBytes(bytes, unsigned, le) {
      return le
        ? Long.fromBytesLE(bytes, unsigned)
        : Long.fromBytesBE(bytes, unsigned);
    };

    /**
     * Creates a Long from its little endian byte representation.
     * @param {!Array.<number>} bytes Little endian byte representation
     * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
     * @returns {Long} The corresponding Long value
     */
    Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
      return new Long(
        bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24),
        bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24),
        unsigned,
      );
    };

    /**
     * Creates a Long from its big endian byte representation.
     * @param {!Array.<number>} bytes Big endian byte representation
     * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
     * @returns {Long} The corresponding Long value
     */
    Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
      return new Long(
        (bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7],
        (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3],
        unsigned,
      );
    };

    // Support conversion to/from BigInt where available
    if (typeof BigInt === "function") {
      /**
       * Returns a Long representing the given big integer.
       * @function
       * @param {number} value The big integer value
       * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
       * @returns {!Long} The corresponding Long value
       */
      Long.fromBigInt = function fromBigInt(value, unsigned) {
        var lowBits = Number(BigInt.asIntN(32, value));
        var highBits = Number(BigInt.asIntN(32, value >> BigInt(32)));
        return fromBits(lowBits, highBits, unsigned);
      };

      // Override
      Long.fromValue = function fromValueWithBigInt(value, unsigned) {
        if (typeof value === "bigint") return fromBigInt(value, unsigned);
        return fromValue(value, unsigned);
      };

      /**
       * Converts the Long to its big integer representation.
       * @this {!Long}
       * @returns {bigint}
       */
      LongPrototype.toBigInt = function toBigInt() {
        var lowBigInt = BigInt(this.low >>> 0);
        var highBigInt = BigInt(this.unsigned ? this.high >>> 0 : this.high);
        return (highBigInt << BigInt(32)) | lowBigInt;
      };
    }
    var _default = (_exports.default = Long);
  },
);


/***/ }),

/***/ "./node_modules/ms/dist/index.cjs":
/*!****************************************!*\
  !*** ./node_modules/ms/dist/index.cjs ***!
  \****************************************/
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
// Helpers.
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;
function ms(value, options) {
    try {
        if (typeof value === 'string' && value.length > 0) {
            return parse(value);
        }
        else if (typeof value === 'number' && isFinite(value)) {
            return options?.long ? fmtLong(value) : fmtShort(value);
        }
        throw new Error('Value is not a string or number.');
    }
    catch (error) {
        const message = isError(error)
            ? `${error.message}. value=${JSON.stringify(value)}`
            : 'An unknown error has occured.';
        throw new Error(message);
    }
}
/**
 * Parse the given `str` and return milliseconds.
 */
function parse(str) {
    str = String(str);
    if (str.length > 100) {
        throw new Error('Value exceeds the maximum length of 100 characters.');
    }
    const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return NaN;
    }
    const n = parseFloat(match[1]);
    const type = (match[2] || 'ms').toLowerCase();
    switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * w;
        case 'days':
        case 'day':
        case 'd':
            return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            // This should never occur.
            throw new Error(`The unit ${type} was matched, but no matching case exists.`);
    }
}
exports["default"] = ms;
/**
 * Short format for `ms`.
 */
function fmtShort(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return `${Math.round(ms / d)}d`;
    }
    if (msAbs >= h) {
        return `${Math.round(ms / h)}h`;
    }
    if (msAbs >= m) {
        return `${Math.round(ms / m)}m`;
    }
    if (msAbs >= s) {
        return `${Math.round(ms / s)}s`;
    }
    return `${ms}ms`;
}
/**
 * Long format for `ms`.
 */
function fmtLong(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
    }
    return `${ms} ms`;
}
/**
 * Pluralization helper.
 */
function plural(ms, msAbs, n, name) {
    const isPlural = msAbs >= n * 1.5;
    return `${Math.round(ms / n)} ${name}${isPlural ? 's' : ''}`;
}
/**
 * A type guard for errors.
 */
function isError(error) {
    return typeof error === 'object' && error !== null && 'message' in error;
}
module.exports = exports.default;
module.exports["default"] = exports.default;


/***/ }),

/***/ "./src/components/temporal/workflows/export-workbook/index.ts":
/*!********************************************************************!*\
  !*** ./src/components/temporal/workflows/export-workbook/index.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   exportWorkbook: () => (/* binding */ exportWorkbook)
/* harmony export */ });
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @temporalio/workflow */ "./node_modules/@temporalio/workflow/lib/index.js");
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__);

async function exportWorkbook(params) {
    const { finishExport } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyActivities)({
        // RetryPolicy specifies how to automatically handle retries if an Activity fails.
        retry: {
            initialInterval: '1 second',
            maximumInterval: '1 minute',
            backoffCoefficient: 2,
            maximumAttempts: 500
        },
        startToCloseTimeout: '1 minute'
    });
    const { workflowId } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.workflowInfo)();
    await finishExport({
        exportId: workflowId
    });
    return {
        exportId: workflowId
    };
}


/***/ }),

/***/ "./src/components/temporal/workflows/index.ts":
/*!****************************************************!*\
  !*** ./src/components/temporal/workflows/index.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   exportWorkbook: () => (/* reexport safe */ _export_workbook__WEBPACK_IMPORTED_MODULE_0__.exportWorkbook)
/* harmony export */ });
/* harmony import */ var _export_workbook__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./export-workbook */ "./src/components/temporal/workflows/export-workbook/index.ts");



/***/ }),

/***/ "?2065":
/*!*****************************************************!*\
  !*** __temporal_custom_payload_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?31ff":
/*!*****************************************************!*\
  !*** __temporal_custom_failure_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = globalThis.__webpack_module_cache__;
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!******************************************************************************!*\
  !*** ./src/components/temporal/workflows/index-autogenerated-entrypoint.cjs ***!
  \******************************************************************************/

const api = __webpack_require__(/*! @temporalio/workflow/lib/worker-interface.js */ "./node_modules/@temporalio/workflow/lib/worker-interface.js");
exports.api = api;

const { overrideGlobals } = __webpack_require__(/*! @temporalio/workflow/lib/global-overrides.js */ "./node_modules/@temporalio/workflow/lib/global-overrides.js");
overrideGlobals();

exports.importWorkflows = function importWorkflows() {
  return __webpack_require__(/* webpackMode: "eager" */ /*! ./src/components/temporal/workflows/index.ts */ "./src/components/temporal/workflows/index.ts");
}

exports.importInterceptors = function importInterceptors() {
  return [
    
  ];
}

})();

__TEMPORAL__ = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Zsb3ctYnVuZGxlLWVmMWZlOWQ3NGYyZTA1MTUyNmY0LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUlBLCtJQUE4RDtBQUVqRCxnQ0FBd0IsR0FBRztJQUN0QyxVQUFVLEVBQUUsWUFBWTtJQUN4QiwyQkFBMkIsRUFBRSw2QkFBNkI7SUFDMUQsT0FBTyxFQUFFLFNBQVM7Q0FDVixDQUFDO0FBR0UsS0FBbUUsK0NBQXVCLEVBT3JHO0lBQ0UsQ0FBQyxnQ0FBd0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO0lBQ3hDLENBQUMsZ0NBQXdCLENBQUMsMkJBQTJCLENBQUMsRUFBRSxDQUFDO0lBQ3pELENBQUMsZ0NBQXdCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztDQUM3QixFQUNWLEVBQUUsQ0FDSCxFQWJhLHNDQUE4QixVQUFFLHNDQUE4QixTQWExRTs7Ozs7Ozs7Ozs7Ozs7O0FDMUJGLG1KQUFnRjtBQUVoRixtSkFBZ0Y7QUE0RGhGOzs7O0dBSUc7QUFDVSwrQkFBdUIsR0FBcUIsSUFBSSwyQ0FBdUIsRUFBRSxDQUFDO0FBRXZGOztHQUVHO0FBQ1UsNEJBQW9CLEdBQXdCO0lBQ3ZELGdCQUFnQixFQUFFLDJDQUF1QjtJQUN6QyxnQkFBZ0IsRUFBRSwrQkFBdUI7SUFDekMsYUFBYSxFQUFFLEVBQUU7Q0FDbEIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDMUJGLDRDQVFDO0FBMURELDRHQWVvQjtBQUNwQiwySEFBMEM7QUFDMUMsbUdBQXlDO0FBQ3pDLG1KQUEyRztBQUUzRyxTQUFTLGFBQWEsQ0FBQyxHQUFHLE9BQWlCO0lBQ3pDLE9BQU8sSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyRSxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLHFCQUFxQixHQUFHLGFBQWE7QUFDekMseUJBQXlCO0FBQ3pCLHVGQUF1RjtBQUN2RiwwQkFBMEI7QUFDMUIsa0dBQWtHO0FBQ2xHLHVDQUF1QztBQUN2QywyREFBMkQsQ0FDNUQsQ0FBQztBQUVGOzs7R0FHRztBQUNILE1BQU0sNkJBQTZCLEdBQUcsYUFBYTtBQUNqRCxnRUFBZ0U7QUFDaEUsdUZBQXVGO0FBQ3ZGLGdFQUFnRTtBQUNoRSxpR0FBaUcsQ0FDbEcsQ0FBQztBQUVGOztHQUVHO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQUMsS0FBYztJQUM3QyxNQUFNLEtBQUssR0FBRyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0MsTUFBTSxHQUFHLEdBQUcsS0FBSyxFQUFVLENBQUM7SUFDNUIsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUN6QixJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFBRSxNQUFNO1FBQzVDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBQ0QsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hCLENBQUM7QUF5Q0Q7Ozs7Ozs7R0FPRztBQUNILE1BQWEsdUJBQXVCO0lBR2xDLFlBQVksT0FBaUQ7UUFDM0QsTUFBTSxFQUFFLHNCQUFzQixFQUFFLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUNqRCxJQUFJLENBQUMsT0FBTyxHQUFHO1lBQ2Isc0JBQXNCLEVBQUUsc0JBQXNCLElBQUksS0FBSztTQUN4RCxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxtQkFBbUIsQ0FBQyxPQUFxQixFQUFFLGdCQUFrQztRQUMzRSxJQUFJLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQ25DLE9BQU8sSUFBSSw0QkFBa0IsQ0FDM0IsT0FBTyxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQzVCLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQ25DLE9BQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsWUFBWSxDQUFDLEVBQ3BELHlDQUFpQixFQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQ3JGLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQ3JFLENBQUM7UUFDSixDQUFDO1FBQ0QsSUFBSSxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM5QixPQUFPLElBQUksdUJBQWEsQ0FDdEIsT0FBTyxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQzVCLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLEVBQy9DLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQ3JFLENBQUM7UUFDSixDQUFDO1FBQ0QsSUFBSSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUMvQixPQUFPLElBQUksd0JBQWMsQ0FDdkIsT0FBTyxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQzVCLDJDQUFtQixFQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLEVBQ25HLCtCQUFpQixFQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FDMUQsQ0FBQztRQUNKLENBQUM7UUFDRCxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ2xDLE9BQU8sSUFBSSwyQkFBaUIsQ0FDMUIsT0FBTyxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQzVCLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQ3JFLENBQUM7UUFDSixDQUFDO1FBQ0QsSUFBSSxPQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUNoQyxPQUFPLElBQUksMEJBQWdCLENBQ3pCLE9BQU8sQ0FBQyxPQUFPLElBQUksU0FBUyxFQUM1Qix5Q0FBaUIsRUFBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUNsRixJQUFJLENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUNyRSxDQUFDO1FBQ0osQ0FBQztRQUNELElBQUksT0FBTyxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDckMsT0FBTyxJQUFJLDRCQUFrQixDQUMzQixPQUFPLENBQUMsT0FBTyxJQUFJLFNBQVMsRUFDNUIsZUFBZSxFQUNmLEtBQUssRUFDTCx5Q0FBaUIsRUFBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsd0JBQXdCLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLEVBQ3BHLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQ3JFLENBQUM7UUFDSixDQUFDO1FBQ0QsSUFBSSxPQUFPLENBQUMsaUNBQWlDLEVBQUUsQ0FBQztZQUM5QyxNQUFNLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxVQUFVLEVBQUUsR0FBRyxPQUFPLENBQUMsaUNBQWlDLENBQUM7WUFDN0csSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLElBQUksSUFBSSxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7Z0JBQy9DLE1BQU0sSUFBSSxTQUFTLENBQUMseURBQXlELENBQUMsQ0FBQztZQUNqRixDQUFDO1lBQ0QsT0FBTyxJQUFJLDhCQUFvQixDQUM3QixTQUFTLElBQUksU0FBUyxFQUN0QixpQkFBaUIsRUFDakIsWUFBWSxDQUFDLElBQUksRUFDakIsOEJBQWdCLEVBQUMsVUFBVSxDQUFDLEVBQzVCLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQ3JFLENBQUM7UUFDSixDQUFDO1FBQ0QsSUFBSSxPQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQztnQkFDcEQsTUFBTSxJQUFJLFNBQVMsQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1lBQzNFLENBQUM7WUFDRCxPQUFPLElBQUkseUJBQWUsQ0FDeEIsT0FBTyxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQzVCLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUM3QyxPQUFPLENBQUMsbUJBQW1CLENBQUMsVUFBVSxJQUFJLFNBQVMsRUFDbkQsOEJBQWdCLEVBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxFQUN4RCxPQUFPLENBQUMsbUJBQW1CLENBQUMsUUFBUSxJQUFJLFNBQVMsRUFDakQsSUFBSSxDQUFDLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FDckUsQ0FBQztRQUNKLENBQUM7UUFDRCxPQUFPLElBQUkseUJBQWUsQ0FDeEIsT0FBTyxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQzVCLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQ3JFLENBQUM7SUFDSixDQUFDO0lBRUQsY0FBYyxDQUFDLE9BQXFCLEVBQUUsZ0JBQWtDO1FBQ3RFLElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDOUIsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFrQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN2RywwRUFBMEU7WUFDMUUsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUNoRCxNQUFNLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxHQUFHLEtBQUssQ0FBQztnQkFDdkMsOEJBQThCO2dCQUM5QixPQUFPLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDO2dCQUN6QixJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUNoQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztnQkFDNUIsQ0FBQztnQkFDRCxJQUFJLE9BQU8sV0FBVyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUNwQyxPQUFPLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQztnQkFDbkMsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hFLEdBQUcsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDckMsR0FBRyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdEIsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBRUQsY0FBYyxDQUFDLEdBQVksRUFBRSxnQkFBa0M7UUFDN0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcsT0FBTyxDQUFDO1lBQ3hDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUM7WUFDcEMsT0FBTyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFDeEIsT0FBTyxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUMvRixDQUFDO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELG1CQUFtQixDQUFDLEdBQVksRUFBRSxnQkFBa0M7UUFDbEUsSUFBSSxHQUFHLFlBQVkseUJBQWUsRUFBRSxDQUFDO1lBQ25DLElBQUksR0FBRyxDQUFDLE9BQU87Z0JBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDO1lBQ3BDLE1BQU0sSUFBSSxHQUFHO2dCQUNYLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztnQkFDcEIsVUFBVSxFQUFFLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQ3ZDLEtBQUssRUFBRSxJQUFJLENBQUMsOEJBQThCLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQztnQkFDdkUsTUFBTSxFQUFFLHdCQUFjO2FBQ3ZCLENBQUM7WUFFRixJQUFJLEdBQUcsWUFBWSx5QkFBZSxFQUFFLENBQUM7Z0JBQ25DLE9BQU87b0JBQ0wsR0FBRyxJQUFJO29CQUNQLG1CQUFtQixFQUFFO3dCQUNuQixHQUFHLEdBQUc7d0JBQ04sVUFBVSxFQUFFLDhCQUFnQixFQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7d0JBQzVDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsWUFBWSxFQUFFO3FCQUN6QztpQkFDRixDQUFDO1lBQ0osQ0FBQztZQUNELElBQUksR0FBRyxZQUFZLDhCQUFvQixFQUFFLENBQUM7Z0JBQ3hDLE9BQU87b0JBQ0wsR0FBRyxJQUFJO29CQUNQLGlDQUFpQyxFQUFFO3dCQUNqQyxHQUFHLEdBQUc7d0JBQ04sVUFBVSxFQUFFLDhCQUFnQixFQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7d0JBQzVDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxTQUFTO3dCQUNoQyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRTtxQkFDekM7aUJBQ0YsQ0FBQztZQUNKLENBQUM7WUFDRCxJQUFJLEdBQUcsWUFBWSw0QkFBa0IsRUFBRSxDQUFDO2dCQUN0QyxPQUFPO29CQUNMLEdBQUcsSUFBSTtvQkFDUCxzQkFBc0IsRUFBRTt3QkFDdEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO3dCQUNkLFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWTt3QkFDOUIsT0FBTyxFQUNMLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNOzRCQUMvQixDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsa0NBQVUsRUFBQyxnQkFBZ0IsRUFBRSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTs0QkFDNUQsQ0FBQyxDQUFDLFNBQVM7d0JBQ2YsY0FBYyxFQUFFLHlCQUFjLEVBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztxQkFDbkQ7aUJBQ0YsQ0FBQztZQUNKLENBQUM7WUFDRCxJQUFJLEdBQUcsWUFBWSwwQkFBZ0IsRUFBRSxDQUFDO2dCQUNwQyxPQUFPO29CQUNMLEdBQUcsSUFBSTtvQkFDUCxtQkFBbUIsRUFBRTt3QkFDbkIsT0FBTyxFQUNMLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNOzRCQUMvQixDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsa0NBQVUsRUFBQyxnQkFBZ0IsRUFBRSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTs0QkFDNUQsQ0FBQyxDQUFDLFNBQVM7cUJBQ2hCO2lCQUNGLENBQUM7WUFDSixDQUFDO1lBQ0QsSUFBSSxHQUFHLFlBQVksd0JBQWMsRUFBRSxDQUFDO2dCQUNsQyxPQUFPO29CQUNMLEdBQUcsSUFBSTtvQkFDUCxrQkFBa0IsRUFBRTt3QkFDbEIsV0FBVyxFQUFFLCtCQUFpQixFQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7d0JBQy9DLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxvQkFBb0I7NEJBQzVDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxrQ0FBVSxFQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFOzRCQUN0RSxDQUFDLENBQUMsU0FBUztxQkFDZDtpQkFDRixDQUFDO1lBQ0osQ0FBQztZQUNELElBQUksR0FBRyxZQUFZLHVCQUFhLEVBQUUsQ0FBQztnQkFDakMsT0FBTztvQkFDTCxHQUFHLElBQUk7b0JBQ1AsaUJBQWlCLEVBQUUsRUFBRSxZQUFZLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRTtpQkFDdEQsQ0FBQztZQUNKLENBQUM7WUFDRCxJQUFJLEdBQUcsWUFBWSwyQkFBaUIsRUFBRSxDQUFDO2dCQUNyQyxPQUFPO29CQUNMLEdBQUcsSUFBSTtvQkFDUCxxQkFBcUIsRUFBRSxFQUFFO2lCQUMxQixDQUFDO1lBQ0osQ0FBQztZQUNELHlCQUF5QjtZQUN6QixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRztZQUNYLE1BQU0sRUFBRSx3QkFBYztTQUN2QixDQUFDO1FBRUYsSUFBSSwwQkFBTyxFQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDakIsT0FBTztnQkFDTCxHQUFHLElBQUk7Z0JBQ1AsT0FBTyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtnQkFDbEMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQ3ZDLEtBQUssRUFBRSxJQUFJLENBQUMsOEJBQThCLENBQUUsR0FBVyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQzthQUNqRixDQUFDO1FBQ0osQ0FBQztRQUVELE1BQU0sY0FBYyxHQUFHLDBIQUEwSCxDQUFDO1FBRWxKLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDNUIsT0FBTyxFQUFFLEdBQUcsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsY0FBYyxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUNELElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDNUIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQztnQkFDSCxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQyxDQUFDO1lBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztnQkFDZCxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLENBQUM7WUFDRCxPQUFPLEVBQUUsR0FBRyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sR0FBRyxjQUFjLEVBQUUsQ0FBQztRQUN4RCxDQUFDO1FBRUQsT0FBTyxFQUFFLEdBQUcsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsY0FBYyxFQUFFLENBQUM7SUFDNUQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsOEJBQThCLENBQzVCLE9BQXdDLEVBQ3hDLGdCQUFrQztRQUVsQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQzlFLENBQUM7SUFFRDs7T0FFRztJQUNILDhCQUE4QixDQUFDLEdBQVksRUFBRSxnQkFBa0M7UUFDN0UsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUN0RSxDQUFDO0NBQ0Y7QUFoUUQsMERBZ1FDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FFclVELGdDQU1DO0FBT0Qsc0NBSUM7QUFhRCxrREFNQztBQUtELDhDQUtDO0FBRUQsMENBV0M7QUFqR0QsK0dBQTZDO0FBQzdDLHlHQUE4RDtBQUU5RCwrR0FBNkU7QUEwQjdFOzs7Ozs7OztHQVFHO0FBQ0gsU0FBZ0IsVUFBVSxDQUFDLFNBQTJCLEVBQUUsR0FBRyxNQUFpQjtJQUMxRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDeEIsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFtQixTQUEyQixFQUFFLEdBQW1CO0lBQzlGLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FDdkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBTSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM5RCxDQUFDO0FBQzFCLENBQUM7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsU0FBZ0IsbUJBQW1CLENBQUksU0FBMkIsRUFBRSxLQUFhLEVBQUUsUUFBMkI7SUFDNUcseURBQXlEO0lBQ3pELElBQUksUUFBUSxLQUFLLFNBQVMsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLEtBQUssSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDNUUsT0FBTyxTQUFnQixDQUFDO0lBQzFCLENBQUM7SUFDRCxPQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsU0FBMkIsRUFBRSxRQUEyQjtJQUN4RixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDZCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFDRCxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFnQixFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDNUUsQ0FBQztBQUVELFNBQWdCLGVBQWUsQ0FDN0IsU0FBMkIsRUFDM0IsR0FBMkM7SUFFM0MsSUFBSSxHQUFHLElBQUksSUFBSTtRQUFFLE9BQU8sU0FBUyxDQUFDO0lBQ2xDLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FDdkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsRUFBZ0IsRUFBRTtRQUNyRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQWtCLENBQUMsQ0FBQztRQUN4RCxPQUFPLENBQUMsQ0FBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxDQUNtQixDQUFDO0FBQzFCLENBQUM7QUFtQkQ7Ozs7O0dBS0c7QUFDSCxNQUFhLHlCQUF5QjtJQUlwQyxZQUFZLEdBQUcsVUFBMEM7UUFGaEQsd0JBQW1CLEdBQThDLElBQUksR0FBRyxFQUFFLENBQUM7UUFHbEYsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzVCLE1BQU0sSUFBSSw4QkFBcUIsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1FBQzVGLENBQUM7UUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNsRSxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFNBQVMsQ0FBSSxLQUFRO1FBQzFCLEtBQUssTUFBTSxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ3pCLE9BQU8sTUFBTSxDQUFDO1lBQ2hCLENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxJQUFJLG1CQUFVLENBQUMscUJBQXFCLEtBQUssYUFBYSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVEOztPQUVHO0lBQ0ksV0FBVyxDQUFJLE9BQWdCO1FBQ3BDLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxTQUFTLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNoRSxNQUFNLElBQUksbUJBQVUsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFDRCxNQUFNLFFBQVEsR0FBRyxxQkFBTSxFQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsNkJBQXFCLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekQsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDNUIsTUFBTSxJQUFJLG1CQUFVLENBQUMscUJBQXFCLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUNELE9BQU8sU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QyxDQUFDO0NBQ0Y7QUE1Q0QsOERBNENDO0FBRUQ7O0dBRUc7QUFDSCxNQUFhLHlCQUF5QjtJQUF0QztRQUNTLGlCQUFZLEdBQUcscUJBQWEsQ0FBQyxzQkFBc0IsQ0FBQztJQWlCN0QsQ0FBQztJQWZRLFNBQVMsQ0FBQyxLQUFjO1FBQzdCLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFFRCxPQUFPO1lBQ0wsUUFBUSxFQUFFO2dCQUNSLENBQUMsNkJBQXFCLENBQUMsRUFBRSxvQkFBWSxDQUFDLHNCQUFzQjthQUM3RDtTQUNGLENBQUM7SUFDSixDQUFDO0lBRU0sV0FBVyxDQUFJLFFBQWlCO1FBQ3JDLE9BQU8sU0FBZ0IsQ0FBQyxDQUFDLHdCQUF3QjtJQUNuRCxDQUFDO0NBQ0Y7QUFsQkQsOERBa0JDO0FBRUQ7O0dBRUc7QUFDSCxNQUFhLHNCQUFzQjtJQUFuQztRQUNTLGlCQUFZLEdBQUcscUJBQWEsQ0FBQyxxQkFBcUIsQ0FBQztJQXVCNUQsQ0FBQztJQXJCUSxTQUFTLENBQUMsS0FBYztRQUM3QixJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUNuQyxPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBRUQsT0FBTztZQUNMLFFBQVEsRUFBRTtnQkFDUixDQUFDLDZCQUFxQixDQUFDLEVBQUUsb0JBQVksQ0FBQyxxQkFBcUI7YUFDNUQ7WUFDRCxJQUFJLEVBQUUsS0FBSztTQUNaLENBQUM7SUFDSixDQUFDO0lBRU0sV0FBVyxDQUFJLE9BQWdCO1FBQ3BDLE9BQU87UUFDTCxzRUFBc0U7UUFDdEUsQ0FDRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUN6RyxDQUNULENBQUM7SUFDSixDQUFDO0NBQ0Y7QUF4QkQsd0RBd0JDO0FBRUQ7O0dBRUc7QUFDSCxNQUFhLG9CQUFvQjtJQUFqQztRQUNTLGlCQUFZLEdBQUcscUJBQWEsQ0FBQyxzQkFBc0IsQ0FBQztJQTRCN0QsQ0FBQztJQTFCUSxTQUFTLENBQUMsS0FBYztRQUM3QixJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN4QixPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUM7UUFDVCxJQUFJLENBQUM7WUFDSCxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztZQUNkLE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFFRCxPQUFPO1lBQ0wsUUFBUSxFQUFFO2dCQUNSLENBQUMsNkJBQXFCLENBQUMsRUFBRSxvQkFBWSxDQUFDLHNCQUFzQjthQUM3RDtZQUNELElBQUksRUFBRSxxQkFBTSxFQUFDLElBQUksQ0FBQztTQUNuQixDQUFDO0lBQ0osQ0FBQztJQUVNLFdBQVcsQ0FBSSxPQUFnQjtRQUNwQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDeEQsTUFBTSxJQUFJLG1CQUFVLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFNLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNGO0FBN0JELG9EQTZCQztBQUVEOztHQUVHO0FBQ0gsTUFBYSwrQkFBK0I7SUFBNUM7UUFDRSxrQkFBYSxHQUFHLElBQUksb0JBQW9CLEVBQUUsQ0FBQztRQUMzQyxzQkFBaUIsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7SUEwRHRELENBQUM7SUF4RFEsU0FBUyxDQUFDLE1BQWU7UUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUMzQixNQUFNLElBQUksbUJBQVUsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDdEIsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sU0FBUyxHQUFHLE9BQU8sVUFBVSxDQUFDO1lBQ3BDLElBQUksU0FBUyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUMzQixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7b0JBQzVDLElBQUksQ0FBQyxDQUFDLEtBQUssWUFBWSxJQUFJLENBQUMsRUFBRSxDQUFDO3dCQUM3QixNQUFNLElBQUksbUJBQVUsQ0FDbEIseUZBQXlGLEtBQUssYUFBYSxHQUFHLGVBQWUsT0FBTyxLQUFLLEVBQUUsQ0FDNUksQ0FBQztvQkFDSixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztvQkFDaEQsTUFBTSxJQUFJLG1CQUFVLENBQUMsd0VBQXdFLENBQUMsQ0FBQztnQkFDakcsQ0FBQztnQkFFRCxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7b0JBQzVDLElBQUksT0FBTyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7d0JBQy9CLE1BQU0sSUFBSSxtQkFBVSxDQUNsQiw4RUFBOEUsVUFBVSxZQUFZLFNBQVMsd0JBQXdCLEtBQUssWUFBWSxPQUFPLEtBQUssYUFBYSxHQUFHLEVBQUUsQ0FDckwsQ0FBQztvQkFDSixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUVELCtEQUErRDtRQUMvRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN0QixNQUFNLElBQUksbUJBQVUsQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNJLFdBQVcsQ0FBSSxPQUFnQjtRQUNwQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDaEUsTUFBTSxJQUFJLG1CQUFVLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEQsSUFBSSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFL0QsTUFBTSxtQkFBbUIsR0FBRyxxQkFBTSxFQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUQsSUFBSSxtQkFBbUIsS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUN2QyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUNELE9BQU8saUJBQWlDLENBQUM7SUFDM0MsQ0FBQztDQUNGO0FBNURELDBFQTREQztBQUVZLHVDQUErQixHQUFHLElBQUksK0JBQStCLEVBQUUsQ0FBQztBQUVyRixNQUFhLHVCQUF3QixTQUFRLHlCQUF5QjtJQUNwRSxrR0FBa0c7SUFDbEcsbUhBQW1IO0lBQ25ILGdEQUFnRDtJQUNoRCxFQUFFO0lBQ0YsVUFBVTtJQUNWLDZIQUE2SDtJQUM3SDtRQUNFLEtBQUssQ0FBQyxJQUFJLHlCQUF5QixFQUFFLEVBQUUsSUFBSSxzQkFBc0IsRUFBRSxFQUFFLElBQUksb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO0lBQ25HLENBQUM7Q0FDRjtBQVZELDBEQVVDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDVSwrQkFBdUIsR0FBRyxJQUFJLHVCQUF1QixFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ3RWckUsK0dBQXFDO0FBRXhCLDZCQUFxQixHQUFHLFVBQVUsQ0FBQztBQUNuQyxxQkFBYSxHQUFHO0lBQzNCLHNCQUFzQixFQUFFLGFBQWE7SUFDckMscUJBQXFCLEVBQUUsY0FBYztJQUNyQyxzQkFBc0IsRUFBRSxZQUFZO0lBQ3BDLCtCQUErQixFQUFFLGVBQWU7SUFDaEQsMEJBQTBCLEVBQUUsaUJBQWlCO0NBQ3JDLENBQUM7QUFHRSxvQkFBWSxHQUFHO0lBQzFCLHNCQUFzQixFQUFFLHFCQUFNLEVBQUMscUJBQWEsQ0FBQyxzQkFBc0IsQ0FBQztJQUNwRSxxQkFBcUIsRUFBRSxxQkFBTSxFQUFDLHFCQUFhLENBQUMscUJBQXFCLENBQUM7SUFDbEUsc0JBQXNCLEVBQUUscUJBQU0sRUFBQyxxQkFBYSxDQUFDLHNCQUFzQixDQUFDO0lBQ3BFLCtCQUErQixFQUFFLHFCQUFNLEVBQUMscUJBQWEsQ0FBQywrQkFBK0IsQ0FBQztJQUN0RiwwQkFBMEIsRUFBRSxxQkFBTSxFQUFDLHFCQUFhLENBQUMsMEJBQTBCLENBQUM7Q0FDcEUsQ0FBQztBQUVFLGlDQUF5QixHQUFHLGFBQWEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1Z2RCx3Q0FFQztBQVNELHdCQUVDO0FBTUQsb0NBRUM7QUFNRCx3QkFFQztBQU1ELHdDQUVDO0FBTUQsZ0RBRUM7QUFNRCxnQ0FFQztBQU1ELDRCQUVDO0FBTUQsNENBRUM7QUEvRUQsOEdBQStCO0FBRy9COzs7Ozs7R0FNRztBQUNILFNBQWdCLGNBQWMsQ0FBQyxFQUFnQztJQUM3RCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLE1BQU0sQ0FBQyxFQUFnQztJQUNyRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekIsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLFlBQVksQ0FBQyxNQUFjO0lBQ3pDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsTUFBTSxDQUFDLEdBQWE7SUFDbEMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixjQUFjLENBQUMsR0FBeUI7SUFDdEQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixrQkFBa0IsQ0FBQyxHQUF5QjtJQUMxRCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsVUFBVSxDQUFDLEdBQWE7SUFDdEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixRQUFRLENBQUMsRUFBYTtJQUNwQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLEVBQWdDO0lBQy9ELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25DLENBQUM7Ozs7Ozs7Ozs7Ozs7QUMvRUQsbUpBQW1KO0FBQ25KLDhCQUE4Qjs7O0FBMlQ5Qix3QkFFQztBQUtELHdCQUVDO0FBbFVELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDekMsTUFBTSxhQUFhLEdBQUcsNkRBQTZELENBQUM7QUFDcEYsTUFBTSxZQUFZLEdBQUcsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFekMsTUFBYSxXQUFXO0lBQ3RCLE1BQU0sQ0FBQyxrQkFBZ0U7UUFDckUsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLFlBQVksVUFBVSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUVwSCxJQUFJLGVBQWUsR0FBRyxFQUFFLEVBQ3RCLE1BQU0sR0FBRyxFQUFFLEVBQ1gsS0FBSyxHQUFHLENBQUMsRUFDVCxPQUFPLEdBQUcsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLEVBQ1AsU0FBUyxHQUFHLENBQUMsRUFDYixPQUFPLEdBQUcsQ0FBQyxFQUNYLEdBQUcsR0FBRyxDQUFDLEVBQ1AsR0FBRyxHQUFHLENBQUMsRUFDUCxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWCxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQyxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEMsMkdBQTJHO1FBQzNHLE9BQU8sS0FBSyxHQUFHLEdBQUcsR0FBSSxDQUFDO1lBQ3JCLE9BQU8sR0FBRyxLQUFLLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2RCxPQUFPLEdBQUcsR0FBRyxPQUFPLEVBQUUsS0FBSyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ25FLEdBQUcsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO2dCQUM3QixRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDakIsS0FBSyxFQUFFO3dCQUNMLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBQ2pELElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksVUFBVSxHQUFHLEdBQUcsRUFBRSxDQUFDOzRCQUMxQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUN4QixNQUFNO3dCQUNSLENBQUM7d0JBQ0QsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUM7d0JBQ3RELE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyx5REFBeUQ7d0JBQ3RFLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyw2QkFBNkI7b0JBQzVDLEtBQUssRUFBRTt3QkFDTCxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO3dCQUNqRCxTQUFTLEtBQUssQ0FBQyxDQUFDO3dCQUNoQixTQUFTLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsQ0FBQzt3QkFDeEQsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLHlEQUF5RDt3QkFDL0csR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLDRCQUE0QjtvQkFDM0QsS0FBSyxFQUFFLENBQUM7b0JBQ1IsS0FBSyxFQUFFO3dCQUNMLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBQ2pELFNBQVMsS0FBSyxDQUFDLENBQUM7d0JBQ2hCLFNBQVMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFDO3dCQUN6RCxPQUFPLEdBQUcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUU1Qiw4QkFBOEI7d0JBQzlCLElBQUksS0FBSyxHQUFHLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxTQUFTLElBQUksT0FBTyxJQUFJLFNBQVMsR0FBRyxRQUFRLEVBQUUsQ0FBQzs0QkFDckYsR0FBRyxHQUFHLFNBQVMsQ0FBQzs0QkFDaEIsU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDdEMsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLHNCQUFzQixFQUFFLENBQUM7Z0NBQzFDLGlCQUFpQjtnQ0FDakIsMEJBQTBCO2dDQUUxQixHQUFHLEdBQUcsQ0FBQyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0I7Z0NBQ3hELEdBQUcsR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGdFQUFnRTtnQ0FFMUcsSUFBSSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUM7b0NBQ2IsMEJBQTBCO29DQUMxQixZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO29DQUN4QixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUNwQixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0NBQ1gsQ0FBQztxQ0FBTSxDQUFDO29DQUNOLDZFQUE2RTtvQ0FDN0UsdUZBQXVGO29DQUN2RixHQUFHLEdBQUcsR0FBRyxDQUFDO29DQUNWLEdBQUcsR0FBRyxHQUFHLENBQUM7b0NBQ1YsR0FBRyxHQUFHLEdBQUcsQ0FBQztnQ0FDWixDQUFDOzRCQUNILENBQUM7O2dDQUFNLE9BQU8sR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxtREFBbUQ7d0JBQ3pGLENBQUM7NkJBQU0sQ0FBQzs0QkFDTixzRkFBc0Y7NEJBQ3RGLEdBQUcsS0FBSyxDQUFDLENBQUM7NEJBQ1YsS0FBSyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQywwQ0FBMEM7NEJBQ3pFLEdBQUcsR0FBRyxNQUFNLENBQUM7d0JBQ2YsQ0FBQzt3QkFFRCxzREFBc0Q7d0JBQ3RELE9BQU8sR0FBRyxDQUFDLENBQUM7d0JBQ1osU0FBUyxHQUFHLENBQUMsQ0FBQzt3QkFDZCxPQUFPLEdBQUcsS0FBSyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3pEOzs7Ozs7Ozs7Ozs7OzsrQkFjVztvQkFDWCxTQUFTLDBDQUEwQzt3QkFDakQsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQzt3QkFDeEIsU0FBUztvQkFDWCxLQUFLLEVBQUUsQ0FBQztvQkFDUixLQUFLLEVBQUUsQ0FBQztvQkFDUixLQUFLLENBQUMsQ0FBQztvQkFDUCxLQUFLLENBQUMsQ0FBQztnQkFDVCxDQUFDO2dCQUNELFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQywwQ0FBMEM7WUFDeEUsQ0FBQztZQUNELE1BQU0sSUFBSSxZQUFZLENBQ3BCLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFDZixZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQ2YsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUNmLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFDZixZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQ2YsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUNmLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFDZixZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQ2YsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUNmLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFDZixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLENBQ2pCLENBQUM7WUFDRixJQUFJLEdBQUcsR0FBRyxFQUFFO2dCQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWE7WUFDckUsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFLENBQUM7Z0JBQ2hCLCtHQUErRztnQkFDL0csWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztnQkFDdEIsR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQjtnQkFDeEMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUVULElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxlQUFlLENBQUMsTUFBTTtvQkFBRSxTQUFTO1lBQ3ZELENBQUM7aUJBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDdEIsTUFBTSxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBRUQsZUFBZSxJQUFJLE1BQU0sQ0FBQztZQUMxQixNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUVELE9BQU8sZUFBZSxDQUFDO0lBQ3pCLENBQUM7Q0FDRjtBQTVKRCxrQ0E0SkM7QUFFRCxzRkFBc0Y7QUFDdEYsU0FBUyxlQUFlLENBQUMsYUFBcUI7SUFDNUMseURBQXlEO0lBQ3pELElBQUksS0FBSyxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLElBQUksTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3BCLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ3BCLE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsNkRBQTZEO1lBRS9HLElBQUksTUFBTSxJQUFJLFFBQVEsSUFBSSxRQUFRLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQzdDLGlFQUFpRTtnQkFDakUsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLEdBQUcsUUFBUSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxLQUFLLEdBQUcsTUFBTTtvQkFDaEIsT0FBTyxZQUFZLENBQ2pCLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsRUFDdkMsQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsY0FBYyxFQUMzRCxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjLEVBQzFELENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQ3BELENBQUM7WUFDTixDQUFDOztnQkFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMseURBQXlEO1FBQ3hHLENBQUM7YUFBTSxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUMzQixLQUFLLEdBQUcsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMseURBQXlEO1FBQ2pHLENBQUM7SUFDSCxDQUFDO0lBQ0Q7V0FDTyxDQUFDLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQzVCLE9BQU8sWUFBWSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUUsQ0FBQzs7UUFDQyxPQUFPLFlBQVksQ0FDakIsQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxFQUNyQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjLEVBQzFELENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQ3BELENBQUM7QUFDTixDQUFDO0FBRUQsTUFBYSxXQUFXO0lBQ2YsTUFBTSxDQUFDLFdBQW1CO1FBQy9CLGtFQUFrRTtRQUNsRSxrRUFBa0U7UUFDbEUsTUFBTSxhQUFhLEdBQUcsV0FBVyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxXQUFXLEVBQ2xFLEdBQUcsR0FBRyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2xELElBQUksU0FBcUIsQ0FBQztRQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ1AsR0FBRyxHQUFHLENBQUMsRUFDUCxLQUFLLEdBQUcsQ0FBQyxFQUNULFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLG1CQUFtQixHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsbUNBQW1DO1FBQzFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzFELEtBQUssR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QyxJQUFJLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUN0QixDQUFDO2lCQUFNLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQzlELENBQUM7aUJBQU0sQ0FBQztnQkFDTixVQUFVLEVBQUUsQ0FBQztvQkFDWCxJQUFJLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQzt3QkFDcEIsSUFBSSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7NEJBQ3BCLFFBQVEsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsNkRBQTZEOzRCQUV6SCxJQUFJLE1BQU0sSUFBSSxRQUFRLElBQUksUUFBUSxJQUFJLE1BQU0sRUFBRSxDQUFDO2dDQUM3QyxpRUFBaUU7Z0NBQ2pFLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxHQUFHLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0NBQ25ELElBQUksS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFDO29DQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDO29DQUN0RCxNQUFNLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUM7b0NBQzVGLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQztvQ0FDM0YsTUFBTSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQztvQ0FDcEYsU0FBUztnQ0FDWCxDQUFDO2dDQUNELE1BQU0sVUFBVSxDQUFDOzRCQUNuQixDQUFDOzRCQUNELEtBQUssR0FBRyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQyx5REFBeUQ7d0JBQ2pHLENBQUM7NkJBQU0sSUFBSSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7NEJBQzNCLEtBQUssR0FBRyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQyx5REFBeUQ7d0JBQ2pHLENBQUM7b0JBQ0gsQ0FBQztvQkFDRCxJQUFJLENBQUMsbUJBQW1CLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQ3JFLG1CQUFtQixHQUFHLElBQUksQ0FBQzt3QkFDM0IsU0FBUyxHQUFHLElBQUksVUFBVSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDcEMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDdEIsTUFBTSxHQUFHLFNBQVMsQ0FBQztvQkFDckIsQ0FBQztnQkFDSCxDQUFDO2dCQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQztnQkFDM0YsTUFBTSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUN0RixDQUFDO1FBQ0gsQ0FBQztRQUNELE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVNLFVBQVUsQ0FBQyxXQUFtQixFQUFFLEtBQWlCO1FBQ3RELE1BQU0sYUFBYSxHQUFHLFdBQVcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQy9HLElBQUksR0FBRyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUNoQyxDQUFDLEdBQUcsQ0FBQyxFQUNMLElBQUksR0FBRyxDQUFDLEVBQ1IsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNYLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLElBQUksUUFBUSxHQUFHLEdBQUc7WUFBRSxHQUFHLEdBQUcsUUFBUSxDQUFDO1FBQ25DLFFBQVEsRUFBRSxDQUFDO1lBQ1QsT0FBTyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QyxRQUFRLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDbEIsS0FBSyxDQUFDLENBQUM7b0JBQ1AsS0FBSyxDQUFDLENBQUM7b0JBQ1AsS0FBSyxDQUFDLENBQUM7b0JBQ1AsS0FBSyxDQUFDLENBQUM7b0JBQ1AsS0FBSyxDQUFDLENBQUM7b0JBQ1AsS0FBSyxDQUFDLENBQUM7b0JBQ1AsS0FBSyxDQUFDLENBQUM7b0JBQ1AsS0FBSyxDQUFDO3dCQUNKLElBQUksR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3hCLG9CQUFvQjtvQkFDcEIsS0FBSyxDQUFDLENBQUM7b0JBQ1AsS0FBSyxDQUFDLENBQUM7b0JBQ1AsS0FBSyxFQUFFLENBQUM7b0JBQ1IsS0FBSyxFQUFFO3dCQUNMLE1BQU07b0JBQ1IsS0FBSyxFQUFFLENBQUM7b0JBQ1IsS0FBSyxFQUFFO3dCQUNMLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQzs0QkFDN0IsSUFBSSxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDdEIsTUFBTTt3QkFDUixDQUFDO29CQUNILEtBQUssRUFBRTt3QkFDTCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUM7NEJBQzdCLHVFQUF1RTs0QkFDdkUsSUFBSSxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDdEIsTUFBTTt3QkFDUixDQUFDO29CQUNILEtBQUssRUFBRTt3QkFDTCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUM7NEJBQzdCLElBQUksR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ3RCLE1BQU07d0JBQ1IsQ0FBQztvQkFDSDt3QkFDRSxNQUFNLFFBQVEsQ0FBQztnQkFDbkIsQ0FBQztnQkFDRCx1Q0FBdUM7Z0JBQ3ZDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDbEIsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2RSxDQUFDO0NBQ0Y7QUFoSEQsa0NBZ0hDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixNQUFNLENBQUMsQ0FBUztJQUM5QixPQUFPLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLE1BQU0sQ0FBQyxDQUFhO0lBQ2xDLE9BQU8sV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDclVELDBIQUE0RDtBQUU1RDs7R0FFRztBQUVJLElBQU0sVUFBVSxHQUFoQixNQUFNLFVBQVcsU0FBUSxLQUFLO0lBQ25DLFlBQ0UsT0FBMkIsRUFDWCxLQUFlO1FBRS9CLEtBQUssQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDLENBQUM7UUFGWixVQUFLLEdBQUwsS0FBSyxDQUFVO0lBR2pDLENBQUM7Q0FDRjtBQVBZLGdDQUFVO3FCQUFWLFVBQVU7SUFEdEIsNkNBQTBCLEVBQUMsWUFBWSxDQUFDO0dBQzVCLFVBQVUsQ0FPdEI7QUFFRDs7R0FFRztBQUVJLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsVUFBVTtDQUFHO0FBQTNDLHNEQUFxQjtnQ0FBckIscUJBQXFCO0lBRGpDLDZDQUEwQixFQUFDLHVCQUF1QixDQUFDO0dBQ3ZDLHFCQUFxQixDQUFzQjtBQUV4RDs7R0FFRztBQUVJLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsS0FBSztDQUFHO0FBQWxDLDhDQUFpQjs0QkFBakIsaUJBQWlCO0lBRDdCLDZDQUEwQixFQUFDLG1CQUFtQixDQUFDO0dBQ25DLGlCQUFpQixDQUFpQjtBQUUvQzs7Ozs7O0dBTUc7QUFFSSxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFzQixTQUFRLEtBQUs7SUFDOUMsWUFDRSxPQUFlLEVBQ0MsVUFBa0IsRUFDbEIsS0FBeUI7UUFFekMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBSEMsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUNsQixVQUFLLEdBQUwsS0FBSyxDQUFvQjtJQUczQyxDQUFDO0NBQ0Y7QUFSWSxzREFBcUI7Z0NBQXJCLHFCQUFxQjtJQURqQyw2Q0FBMEIsRUFBQyx1QkFBdUIsQ0FBQztHQUN2QyxxQkFBcUIsQ0FRakM7QUFFRDs7R0FFRztBQUVJLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsS0FBSztJQUMvQyxZQUE0QixTQUFpQjtRQUMzQyxLQUFLLENBQUMseUJBQXlCLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFEbkIsY0FBUyxHQUFULFNBQVMsQ0FBUTtJQUU3QyxDQUFDO0NBQ0Y7QUFKWSx3REFBc0I7aUNBQXRCLHNCQUFzQjtJQURsQyw2Q0FBMEIsRUFBQyx3QkFBd0IsQ0FBQztHQUN4QyxzQkFBc0IsQ0FJbEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNpVUQsNERBVUM7QUFTRCxzREFLQztBQVFELDhCQUtDO0FBMVpELDBIQUFvRjtBQUVwRiwrSUFBOEQ7QUFFakQsc0JBQWMsR0FBRyxlQUFlLENBQUM7QUFHakMsbUJBQVcsR0FBRztJQUN6QixjQUFjLEVBQUUsZ0JBQWdCO0lBQ2hDLGlCQUFpQixFQUFFLG1CQUFtQjtJQUN0QyxpQkFBaUIsRUFBRSxtQkFBbUI7SUFDdEMsU0FBUyxFQUFFLFdBQVc7SUFFdEIsc0RBQXNEO0lBQ3RELDJCQUEyQixFQUFFLGdCQUFnQixFQUFFLDhDQUE4QztJQUU3Rix5REFBeUQ7SUFDekQsOEJBQThCLEVBQUUsbUJBQW1CLEVBQUUsOENBQThDO0lBRW5HLHlEQUF5RDtJQUN6RCw4QkFBOEIsRUFBRSxtQkFBbUIsRUFBRSw4Q0FBOEM7SUFFbkcsaURBQWlEO0lBQ2pELHNCQUFzQixFQUFFLFdBQVcsRUFBRSw4Q0FBOEM7SUFFbkYsMkNBQTJDO0lBQzNDLHdCQUF3QixFQUFFLFNBQVMsRUFBRSw4Q0FBOEM7Q0FDM0UsQ0FBQztBQUdFLEtBQXlDLCtDQUF1QixFQU8zRTtJQUNFLENBQUMsbUJBQVcsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO0lBQy9CLENBQUMsbUJBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7SUFDbEMsQ0FBQyxtQkFBVyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztJQUNsQyxDQUFDLG1CQUFXLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztJQUMxQixXQUFXLEVBQUUsQ0FBQztDQUNOLEVBQ1YsZUFBZSxDQUNoQixFQWZhLHlCQUFpQixVQUFFLHlCQUFpQixTQWVoRDtBQUVXLGtCQUFVLEdBQUc7SUFDeEIsV0FBVyxFQUFFLGFBQWE7SUFDMUIscUJBQXFCLEVBQUUsdUJBQXVCO0lBQzlDLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLHdCQUF3QixFQUFFLDBCQUEwQjtJQUNwRCxvQkFBb0IsRUFBRSxzQkFBc0I7SUFDNUMscUJBQXFCLEVBQUUsdUJBQXVCO0lBQzlDLGdCQUFnQixFQUFFLGtCQUFrQjtJQUVwQyxtREFBbUQ7SUFDbkQsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLDhDQUE4QztJQUV0Riw2REFBNkQ7SUFDN0QsaUNBQWlDLEVBQUUsdUJBQXVCLEVBQUUsOENBQThDO0lBRTFHLCtDQUErQztJQUMvQyxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsOENBQThDO0lBRTlFLGdFQUFnRTtJQUNoRSxvQ0FBb0MsRUFBRSwwQkFBMEIsRUFBRSw4Q0FBOEM7SUFFaEgsNERBQTREO0lBQzVELGdDQUFnQyxFQUFFLHNCQUFzQixFQUFFLDhDQUE4QztJQUV4Ryw2REFBNkQ7SUFDN0QsaUNBQWlDLEVBQUUsdUJBQXVCLEVBQUUsOENBQThDO0lBRTFHLHdEQUF3RDtJQUN4RCw0QkFBNEIsRUFBRSxrQkFBa0IsRUFBRSw4Q0FBOEM7SUFFaEcsMkNBQTJDO0lBQzNDLHVCQUF1QixFQUFFLFNBQVMsRUFBRSw4Q0FBOEM7Q0FDMUUsQ0FBQztBQUdFLEtBQXVDLCtDQUF1QixFQU96RTtJQUNFLENBQUMsa0JBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO0lBQzNCLENBQUMsa0JBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUM7SUFDckMsQ0FBQyxrQkFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7SUFDdkIsQ0FBQyxrQkFBVSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsQ0FBQztJQUN4QyxDQUFDLGtCQUFVLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDO0lBQ3BDLENBQUMsa0JBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUM7SUFDckMsQ0FBQyxrQkFBVSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztJQUNoQyxXQUFXLEVBQUUsQ0FBQztDQUNOLEVBQ1YsY0FBYyxDQUNmLEVBbEJhLHdCQUFnQixVQUFFLHdCQUFnQixTQWtCOUM7QUFJRjs7Ozs7O0dBTUc7QUFFSSxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLEtBQUs7SUFReEMsWUFDRSxPQUFtQyxFQUNuQixLQUFhO1FBRTdCLEtBQUssQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDLENBQUM7UUFGWixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBRy9CLENBQUM7Q0FDRjtBQWRZLDBDQUFlOzBCQUFmLGVBQWU7SUFEM0IsNkNBQTBCLEVBQUMsaUJBQWlCLENBQUM7R0FDakMsZUFBZSxDQWMzQjtBQUVELHFEQUFxRDtBQUU5QyxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsZUFBZTtJQUNoRCxZQUNFLE9BQTJCLEVBQ1gsWUFBcUIsRUFDckMsS0FBYTtRQUViLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFITixpQkFBWSxHQUFaLFlBQVksQ0FBUztJQUl2QyxDQUFDO0NBQ0Y7QUFSWSxzQ0FBYTt3QkFBYixhQUFhO0lBRHpCLDZDQUEwQixFQUFDLGVBQWUsQ0FBQztHQUMvQixhQUFhLENBUXpCO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUVJLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsZUFBZTtJQUNyRDs7T0FFRztJQUNILFlBQ0UsT0FBbUMsRUFDbkIsSUFBZ0MsRUFDaEMsWUFBeUMsRUFDekMsT0FBc0MsRUFDdEQsS0FBYSxFQUNHLGNBQTRDO1FBRTVELEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFOTixTQUFJLEdBQUosSUFBSSxDQUE0QjtRQUNoQyxpQkFBWSxHQUFaLFlBQVksQ0FBNkI7UUFDekMsWUFBTyxHQUFQLE9BQU8sQ0FBK0I7UUFFdEMsbUJBQWMsR0FBZCxjQUFjLENBQThCO0lBRzlELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBc0IsRUFBRSxTQUFxQztRQUNuRixNQUFNLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNsQyxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBa0M7UUFDckQsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsWUFBWSxHQUFHLEtBQUssRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUN4RixPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQXVCLEVBQUUsSUFBb0IsRUFBRSxHQUFHLE9BQWtCO1FBQzFGLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSSxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQXVCLEVBQUUsSUFBb0IsRUFBRSxHQUFHLE9BQWtCO1FBQzdGLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNELENBQUM7Q0FDRjtBQTlEWSxnREFBa0I7NkJBQWxCLGtCQUFrQjtJQUQ5Qiw2Q0FBMEIsRUFBQyxvQkFBb0IsQ0FBQztHQUNwQyxrQkFBa0IsQ0E4RDlCO0FBdUNEOzs7Ozs7R0FNRztBQUVJLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEsZUFBZTtJQUNuRCxZQUNFLE9BQTJCLEVBQ1gsVUFBcUIsRUFBRSxFQUN2QyxLQUFhO1FBRWIsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUhOLFlBQU8sR0FBUCxPQUFPLENBQWdCO0lBSXpDLENBQUM7Q0FDRjtBQVJZLDRDQUFnQjsyQkFBaEIsZ0JBQWdCO0lBRDVCLDZDQUEwQixFQUFDLGtCQUFrQixDQUFDO0dBQ2xDLGdCQUFnQixDQVE1QjtBQUVEOztHQUVHO0FBRUksSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBa0IsU0FBUSxlQUFlO0lBQ3BELFlBQVksT0FBMkIsRUFBRSxLQUFhO1FBQ3BELEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDeEIsQ0FBQztDQUNGO0FBSlksOENBQWlCOzRCQUFqQixpQkFBaUI7SUFEN0IsNkNBQTBCLEVBQUMsbUJBQW1CLENBQUM7R0FDbkMsaUJBQWlCLENBSTdCO0FBRUQ7O0dBRUc7QUFFSSxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsZUFBZTtJQUNqRCxZQUNFLE9BQTJCLEVBQ1gsb0JBQTZCLEVBQzdCLFdBQXdCO1FBRXhDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUhDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBUztRQUM3QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtJQUcxQyxDQUFDO0NBQ0Y7QUFSWSx3Q0FBYzt5QkFBZCxjQUFjO0lBRDFCLDZDQUEwQixFQUFDLGdCQUFnQixDQUFDO0dBQ2hDLGNBQWMsQ0FRMUI7QUFFRDs7Ozs7R0FLRztBQUVJLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsZUFBZTtJQUNsRCxZQUNFLE9BQTJCLEVBQ1gsWUFBb0IsRUFDcEIsVUFBOEIsRUFDOUIsVUFBc0IsRUFDdEIsUUFBNEIsRUFDNUMsS0FBYTtRQUViLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFOTixpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUNwQixlQUFVLEdBQVYsVUFBVSxDQUFvQjtRQUM5QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLGFBQVEsR0FBUixRQUFRLENBQW9CO0lBSTlDLENBQUM7Q0FDRjtBQVhZLDBDQUFlOzBCQUFmLGVBQWU7SUFEM0IsNkNBQTBCLEVBQUMsaUJBQWlCLENBQUM7R0FDakMsZUFBZSxDQVczQjtBQUVEOzs7OztHQUtHO0FBRUksSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxlQUFlO0lBQ3ZELFlBQ2tCLFNBQTZCLEVBQzdCLFNBQTRCLEVBQzVCLFlBQW9CLEVBQ3BCLFVBQXNCLEVBQ3RDLEtBQWE7UUFFYixLQUFLLENBQUMsaUNBQWlDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFOaEMsY0FBUyxHQUFULFNBQVMsQ0FBb0I7UUFDN0IsY0FBUyxHQUFULFNBQVMsQ0FBbUI7UUFDNUIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFDcEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtJQUl4QyxDQUFDO0NBQ0Y7QUFWWSxvREFBb0I7K0JBQXBCLG9CQUFvQjtJQURoQyw2Q0FBMEIsRUFBQyxzQkFBc0IsQ0FBQztHQUN0QyxvQkFBb0IsQ0FVaEM7QUFFRDs7Ozs7OztHQU9HO0FBRUksSUFBTSxvQ0FBb0MsR0FBMUMsTUFBTSxvQ0FBcUMsU0FBUSxlQUFlO0lBQ3ZFLFlBQ0UsT0FBZSxFQUNDLFVBQWtCLEVBQ2xCLFlBQW9CO1FBRXBDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUhDLGVBQVUsR0FBVixVQUFVLENBQVE7UUFDbEIsaUJBQVksR0FBWixZQUFZLENBQVE7SUFHdEMsQ0FBQztDQUNGO0FBUlksb0ZBQW9DOytDQUFwQyxvQ0FBb0M7SUFEaEQsNkNBQTBCLEVBQUMsc0NBQXNDLENBQUM7R0FDdEQsb0NBQW9DLENBUWhEO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxTQUFnQix3QkFBd0IsQ0FBQyxLQUFjO0lBQ3JELElBQUksS0FBSyxZQUFZLGtCQUFrQixFQUFFLENBQUM7UUFDeEMsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsTUFBTSxPQUFPLEdBQUcsQ0FBQywyQkFBUSxFQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUUsTUFBTSxJQUFJLEdBQUcsQ0FBQywyQkFBUSxFQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDO0lBQ3ZGLE1BQU0sT0FBTyxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDbEYsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLDJCQUFRLEVBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMvRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IscUJBQXFCLENBQUMsR0FBWTtJQUNoRCxJQUFJLEdBQUcsWUFBWSxlQUFlLEVBQUUsQ0FBQztRQUNuQyxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxPQUFPLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLFNBQVMsQ0FBQyxLQUFjO0lBQ3RDLElBQUksS0FBSyxZQUFZLGVBQWUsRUFBRSxDQUFDO1FBQ3JDLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUM5RCxDQUFDO0lBQ0QsT0FBTywrQkFBWSxFQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLENBQUM7Ozs7Ozs7Ozs7Ozs7QUMzWkQ7Ozs7R0FJRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCSCxnQkFFQztBQVFELGtCQUVDO0FBUUQsb0NBRUM7QUFRRCw4QkFFQztBQTNERCwwSEFBdUM7QUFDdkMsaUlBQTBDO0FBRTFDLGtJQUFtQztBQUNuQyxrSkFBMkM7QUFDM0Msd0pBQThDO0FBQzlDLGdKQUEwQztBQUMxQyx3SkFBOEM7QUFDOUMsZ0lBQWtDO0FBQ2xDLGdJQUFrQztBQUNsQyw4R0FBeUI7QUFDekIsZ0hBQTBCO0FBRTFCLHNIQUE2QjtBQUM3Qiw4R0FBeUI7QUFDekIsMEhBQStCO0FBRS9CLGdJQUFrQztBQUNsQyxrSUFBbUM7QUFDbkMsb0lBQW9DO0FBRXBDOzs7OztHQUtHO0FBQ0gsU0FBZ0IsRUFBRSxDQUFDLENBQVM7SUFDMUIsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLEdBQUcsQ0FBQyxHQUFlO0lBQ2pDLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixZQUFZLENBQUMsS0FBYztJQUN6QyxPQUFPLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLEtBQWM7SUFDdEMsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xDLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FDekNELGtEQVdDO0FBdEJEOzs7Ozs7Ozs7R0FTRztBQUNILHVEQUF1RDtBQUN2RCxTQUFnQixtQkFBbUIsQ0FBdUIsWUFBaUIsRUFBRSxNQUFTLEVBQUUsSUFBZ0I7SUFDdEcsS0FBSyxJQUFJLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEQsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3RDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUNsQiwrR0FBK0c7WUFDL0csOEJBQThCO1lBQzlCLElBQUksR0FBRyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBRSxXQUFXLENBQUMsTUFBTSxDQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFRLENBQUM7UUFDNUUsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQzJGRDs7O0dBR0c7QUFDVSwrQkFBdUIsR0FBRztJQUNyQzs7T0FFRztJQUNILGdCQUFnQixFQUFFLGtCQUFrQjtJQUVwQzs7Ozs7T0FLRztJQUNILE9BQU8sRUFBRSxTQUFTO0NBQ1YsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUM3QlgsMERBMEdDO0FBNU5ELHlHQUF1QztBQUd2Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4R0c7QUFDSCxTQUFnQix1QkFBdUIsQ0FvQ3JDLFFBQWtCLEVBQ2xCLE1BQWM7SUFPZCxNQUFNLFlBQVksR0FBK0MsTUFBTSxDQUFDLFdBQVcsQ0FDakYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FDakQsQ0FBQztJQUNGLE1BQU0sY0FBYyxHQUFJLFFBQWdCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFLLFFBQWdCLENBQUMsR0FBRyxNQUFNLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVqSCxTQUFTLHFCQUFxQixDQUFDLENBQVU7UUFDdkMsT0FBTyxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQztJQUNoRCxDQUFDO0lBRUQsU0FBUyxrQkFBa0IsQ0FBQyxDQUFVO1FBQ3BDLE9BQU8sT0FBTyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsSUFBSSxZQUFZLENBQUM7SUFDcEQsQ0FBQztJQUVELFNBQVMsTUFBTSxDQUNiLEtBQWdHO1FBRWhHLElBQUksS0FBSyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ2xCLE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7YUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLElBQUksT0FBTyxHQUFXLEtBQUssQ0FBQztZQUM1QixJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFDRCxJQUFJLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ25DLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNCLENBQUM7WUFDRCxNQUFNLElBQUksbUJBQVUsQ0FBQyx3QkFBd0IsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUN6RCxDQUFDO2FBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxJQUFJLG1CQUFVLENBQUMsd0JBQXdCLEtBQUssYUFBYSxPQUFPLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDakYsQ0FBQztJQUNILENBQUM7SUFFRCxTQUFTLE1BQU0sQ0FBQyxLQUF3QztRQUN0RCxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNsQixPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO2FBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxJQUFJLGNBQWMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLE9BQU8sU0FBUyxDQUFDO1lBQ25CLENBQUM7WUFFRCxJQUFJLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzlCLE9BQU8sWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdCLENBQUM7WUFFRCw4RkFBOEY7WUFDOUYsNEZBQTRGO1lBQzVGLDJGQUEyRjtZQUMzRiw0RkFBNEY7WUFDNUYsd0ZBQXdGO1lBQ3hGLDhFQUE4RTtZQUM5RSxFQUFFO1lBQ0YsZ0dBQWdHO1lBQ2hHLGdGQUFnRjtZQUNoRixPQUFPLFdBQVcsS0FBSyxFQUF3QixDQUFDO1FBQ2xELENBQUM7UUFFRCxNQUFNLElBQUksbUJBQVUsQ0FBQyw4QkFBOEIsS0FBSyxhQUFhLE9BQU8sS0FBSyxFQUFFLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQVUsQ0FBQztBQUNuQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNU5ELDhJQUFnQzs7Ozs7Ozs7Ozs7Ozs7O0FDZ0JoQzs7Ozs7Ozs7R0FRRztBQUNILElBQVksWUE2Qlg7QUE3QkQsV0FBWSxZQUFZO0lBQ3RCOzs7T0FHRztJQUNILHFDQUFxQjtJQUVyQjs7O09BR0c7SUFDSCxxQ0FBcUI7SUFFckI7Ozs7Ozs7OztPQVNHO0lBQ0gsaUNBQWlCO0lBRWpCOztPQUVHO0lBQ0gsNkJBQWE7QUFDZixDQUFDLEVBN0JXLFlBQVksNEJBQVosWUFBWSxRQTZCdkI7Ozs7Ozs7Ozs7Ozs7O0FDTkQsZ0RBaUNDO0FBS0Qsb0RBY0M7QUFuR0Qsd0dBQXNDO0FBQ3RDLGtHQUEwRztBQTJDMUc7O0dBRUc7QUFDSCxTQUFnQixrQkFBa0IsQ0FBQyxXQUF3QjtJQUN6RCxJQUFJLFdBQVcsQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLElBQUksV0FBVyxDQUFDLGtCQUFrQixJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2xGLE1BQU0sSUFBSSxtQkFBVSxDQUFDLHVEQUF1RCxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUNELElBQUksV0FBVyxDQUFDLGVBQWUsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QyxJQUFJLFdBQVcsQ0FBQyxlQUFlLEtBQUssTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDN0QsdUNBQXVDO1lBQ3ZDLE1BQU0sRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLEdBQUcsT0FBTyxFQUFFLEdBQUcsV0FBVyxDQUFDO1lBQ3ZELFdBQVcsR0FBRyxPQUFPLENBQUM7UUFDeEIsQ0FBQzthQUFNLElBQUksV0FBVyxDQUFDLGVBQWUsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUM1QyxNQUFNLElBQUksbUJBQVUsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7YUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztZQUMxRCxNQUFNLElBQUksbUJBQVUsQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7SUFDSCxDQUFDO0lBQ0QsTUFBTSxlQUFlLEdBQUcsNkJBQWtCLEVBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3hFLE1BQU0sZUFBZSxHQUFHLHFCQUFVLEVBQUMsV0FBVyxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUN4RSxJQUFJLGVBQWUsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMxQixNQUFNLElBQUksbUJBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFDRCxJQUFJLGVBQWUsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMxQixNQUFNLElBQUksbUJBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFDRCxJQUFJLGVBQWUsSUFBSSxJQUFJLElBQUksZUFBZSxHQUFHLGVBQWUsRUFBRSxDQUFDO1FBQ2pFLE1BQU0sSUFBSSxtQkFBVSxDQUFDLHFFQUFxRSxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUNELE9BQU87UUFDTCxlQUFlLEVBQUUsV0FBVyxDQUFDLGVBQWU7UUFDNUMsZUFBZSxFQUFFLGlCQUFNLEVBQUMsZUFBZSxDQUFDO1FBQ3hDLGVBQWUsRUFBRSx5QkFBYyxFQUFDLGVBQWUsQ0FBQztRQUNoRCxrQkFBa0IsRUFBRSxXQUFXLENBQUMsa0JBQWtCO1FBQ2xELHNCQUFzQixFQUFFLFdBQVcsQ0FBQyxzQkFBc0I7S0FDM0QsQ0FBQztBQUNKLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLG9CQUFvQixDQUNsQyxXQUF3RDtJQUV4RCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakIsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUVELE9BQU87UUFDTCxrQkFBa0IsRUFBRSxXQUFXLENBQUMsa0JBQWtCLElBQUksU0FBUztRQUMvRCxlQUFlLEVBQUUsV0FBVyxDQUFDLGVBQWUsSUFBSSxTQUFTO1FBQ3pELGVBQWUsRUFBRSx5QkFBYyxFQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUM7UUFDNUQsZUFBZSxFQUFFLHlCQUFjLEVBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQztRQUM1RCxzQkFBc0IsRUFBRSxXQUFXLENBQUMsc0JBQXNCLElBQUksU0FBUztLQUN4RSxDQUFDO0FBQ0osQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3RUQsd0NBS0M7QUFNRCx3Q0FLQztBQUtELHdCQVNDO0FBRUQsb0NBT0M7QUFFRCx3QkFFQztBQUVELHdDQUVDO0FBRUQsZ0RBR0M7QUFFRCxnQ0FLQztBQVVELDRCQUVDO0FBR0QsNENBRUM7QUFFRCw0Q0FLQztBQUdELDRDQUtDO0FBbEhELG9HQUF3QixDQUFDLGlEQUFpRDtBQUMxRSxnR0FBcUM7QUFFckMsd0dBQXNDO0FBZ0J0Qzs7O0dBR0c7QUFDSCxTQUFnQixjQUFjLENBQUMsRUFBZ0M7SUFDN0QsSUFBSSxFQUFFLEtBQUssU0FBUyxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUNwQyxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLGNBQWMsQ0FBQyxFQUFnQyxFQUFFLFNBQWlCO0lBQ2hGLElBQUksRUFBRSxLQUFLLFNBQVMsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDcEMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxZQUFZLFNBQVMsMkJBQTJCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLE1BQU0sQ0FBQyxFQUFnQztJQUNyRCxJQUFJLEVBQUUsS0FBSyxTQUFTLElBQUksRUFBRSxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUNELE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQzlCLE9BQU8sQ0FBQyxPQUFPLElBQUksY0FBSSxDQUFDLEtBQUssQ0FBQztTQUMzQixHQUFHLENBQUMsSUFBSSxDQUFDO1NBQ1QsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7U0FDdkMsUUFBUSxFQUFFLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQWdCLFlBQVksQ0FBQyxNQUFjO0lBQ3pDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzFDLE1BQU0sS0FBSyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQztJQUN4QyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2pELE1BQU0sSUFBSSxtQkFBVSxDQUFDLGtCQUFrQixNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFDRCxPQUFPLEVBQUUsT0FBTyxFQUFFLGNBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDdEQsQ0FBQztBQUVELFNBQWdCLE1BQU0sQ0FBQyxHQUFhO0lBQ2xDLE9BQU8sWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRCxTQUFnQixjQUFjLENBQUMsR0FBZ0M7SUFDN0QsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ3ZDLENBQUM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxHQUF5QjtJQUMxRCxJQUFJLEdBQUcsS0FBSyxTQUFTO1FBQUUsT0FBTyxTQUFTLENBQUM7SUFDeEMsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekIsQ0FBQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxHQUFhO0lBQ3RDLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDNUIsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFnQjtJQUN4QyxNQUFNLE1BQU0sR0FBRyxnQkFBRSxFQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNwQyxNQUFNLElBQUksU0FBUyxDQUFDLDZCQUE2QixHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsU0FBZ0IsUUFBUSxDQUFDLEVBQWE7SUFDcEMsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRUQsdUJBQXVCO0FBQ3ZCLFNBQWdCLGdCQUFnQixDQUFDLEVBQWdDLEVBQUUsU0FBaUI7SUFDbEYsT0FBTyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUVELFNBQWdCLGdCQUFnQixDQUFDLEVBQWdDO0lBQy9ELElBQUksRUFBRSxLQUFLLFNBQVMsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDcEMsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUNELE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUVELDBEQUEwRDtBQUMxRCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUE2QjtJQUM1RCxJQUFJLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ3hDLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNoQyxDQUFDOzs7Ozs7Ozs7Ozs7OztBQ3JHRCxvQ0FFQztBQWtGRCw0QkFFQztBQUVELHdDQUtDO0FBRUQsNENBS0M7QUFFRCwwQkFPQztBQUVELG9DQUVDO0FBS0Qsb0NBT0M7QUFhRCw4QkFNQztBQUtELGtDQUVDO0FBK0JELGdFQXdCQztBQUdELGdDQW9CQztBQXRPRCw4Q0FBOEM7QUFDOUMsU0FBZ0IsWUFBWTtJQUMxQix3QkFBd0I7QUFDMUIsQ0FBQztBQWtGRCxTQUFnQixRQUFRLENBQUMsS0FBYztJQUNyQyxPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDO0FBQ3JELENBQUM7QUFFRCxTQUFnQixjQUFjLENBQzVCLE1BQVMsRUFDVCxJQUFPO0lBRVAsT0FBTyxJQUFJLElBQUksTUFBTSxDQUFDO0FBQ3hCLENBQUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FDOUIsTUFBUyxFQUNULEtBQVU7SUFFVixPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRUQsU0FBZ0IsT0FBTyxDQUFDLEtBQWM7SUFDcEMsT0FBTyxDQUNMLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDZixPQUFPLEtBQUssQ0FBQyxJQUFJLEtBQUssUUFBUTtRQUM5QixPQUFPLEtBQUssQ0FBQyxPQUFPLEtBQUssUUFBUTtRQUNqQyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FDekQsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFnQixZQUFZLENBQUMsS0FBYztJQUN6QyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQztBQUN2RCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixZQUFZLENBQUMsS0FBYztJQUN6QyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ25CLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUN2QixDQUFDO1NBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBTUQsU0FBUyxlQUFlLENBQUMsS0FBYztJQUNyQyxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLEtBQUssQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO0FBQzNELENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLFNBQVMsQ0FBQyxLQUFjO0lBQ3RDLElBQUksZUFBZSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDM0IsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixXQUFXLENBQUMsR0FBVyxFQUFFLENBQVE7SUFDL0MsTUFBTSxJQUFJLFNBQVMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFPRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxTQUFnQiwwQkFBMEIsQ0FBa0IsVUFBa0I7SUFDNUUsT0FBTyxDQUFDLEtBQWUsRUFBUSxFQUFFO1FBQy9CLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFeEQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDeEYsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkYsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRTtZQUMvQyw0Q0FBNEM7WUFDNUMsS0FBSyxFQUFFLFVBQXFCLEtBQWE7Z0JBQ3ZDLElBQUksSUFBSSxLQUFLLEtBQUssRUFBRSxDQUFDO29CQUNuQixPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSyxLQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDO2dCQUM1RCxDQUFDO3FCQUFNLENBQUM7b0JBQ04seUdBQXlHO29CQUN6Ryx3RkFBd0Y7b0JBQ3hGLDBHQUEwRztvQkFDMUcsRUFBRTtvQkFDRix5R0FBeUc7b0JBQ3pHLDRHQUE0RztvQkFDNUcsNENBQTRDO29CQUM1QyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsNENBQTRDO2dCQUMxRixDQUFDO1lBQ0gsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCw2R0FBNkc7QUFDN0csU0FBZ0IsVUFBVSxDQUFJLE1BQVM7SUFDckMsZ0RBQWdEO0lBQ2hELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVyRCx5Q0FBeUM7SUFDekMsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUM3QixNQUFNLEtBQUssR0FBSSxNQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFcEMsSUFBSSxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDO2dCQUNILFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwQixDQUFDO1lBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztnQkFDZCxpRkFBaUY7WUFDbkYsQ0FBQztRQUNILENBQUM7YUFBTSxJQUFJLE9BQU8sS0FBSyxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDOU5ELDBEQVdDO0FBN0JELDBIQUEyRDtBQUUzRCwwRUFBMEU7QUFDMUUsOENBQThDO0FBQzlDOzs7O0dBSUc7QUFDSCxJQUFZLGdCQUlYO0FBSkQsV0FBWSxnQkFBZ0I7SUFDMUIscUVBQWU7SUFDZixtRUFBYztJQUNkLDZEQUFXO0FBQ2IsQ0FBQyxFQUpXLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBSTNCO0FBRUQsK0JBQVksR0FBcUQsQ0FBQztBQUNsRSwrQkFBWSxHQUFxRCxDQUFDO0FBRWxFLFNBQWdCLHVCQUF1QixDQUFDLE1BQTBDO0lBQ2hGLFFBQVEsTUFBTSxFQUFFLENBQUM7UUFDZixLQUFLLFNBQVM7WUFDWixPQUFPLGdCQUFnQixDQUFDLE9BQU8sQ0FBQztRQUNsQyxLQUFLLFlBQVk7WUFDZixPQUFPLGdCQUFnQixDQUFDLFVBQVUsQ0FBQztRQUNyQyxLQUFLLFNBQVM7WUFDWixPQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQztRQUN0QztZQUNFLDhCQUFXLEVBQUMsNkJBQTZCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdkQsQ0FBQztBQUNILENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBR2lNRCxrREFTQztBQXJPRCwrSUFBOEQ7QUFFOUQ7Ozs7Ozs7Ozs7R0FVRztBQUNVLDZCQUFxQixHQUFHO0lBQ25DOzs7T0FHRztJQUNILGVBQWUsRUFBRSxpQkFBaUI7SUFFbEM7O09BRUc7SUFDSCwyQkFBMkIsRUFBRSw2QkFBNkI7SUFFMUQ7O09BRUc7SUFDSCxnQkFBZ0IsRUFBRSxrQkFBa0I7SUFFcEM7Ozs7Ozs7T0FPRztJQUNILG9CQUFvQixFQUFFLHNCQUFzQixFQUFFLDhDQUE4QztJQUU1RixnREFBZ0Q7SUFFaEQ7Ozs7T0FJRztJQUNILG9DQUFvQyxFQUFFLFNBQVMsRUFBRSw4Q0FBOEM7SUFFL0YsdURBQXVEO0lBQ3ZELHdDQUF3QyxFQUFFLGlCQUFpQixFQUFFLDhDQUE4QztJQUUzRyxtRUFBbUU7SUFDbkUsb0RBQW9ELEVBQUUsNkJBQTZCLEVBQUUsOENBQThDO0lBRW5JLHdEQUF3RDtJQUN4RCx5Q0FBeUMsRUFBRSxrQkFBa0IsRUFBRSw4Q0FBOEM7SUFFN0csNERBQTREO0lBQzVELDZDQUE2QyxFQUFFLHNCQUFzQixFQUFFLDhDQUE4QztDQUM3RyxDQUFDO0FBR0UsS0FBNkQsK0NBQXVCLEVBTy9GO0lBQ0UsQ0FBQyw2QkFBcUIsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDO0lBQzFDLENBQUMsNkJBQXFCLENBQUMsMkJBQTJCLENBQUMsRUFBRSxDQUFDO0lBQ3RELENBQUMsNkJBQXFCLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO0lBQzNDLENBQUMsNkJBQXFCLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLEVBQUUsOENBQThDO0lBQy9GLFdBQVcsRUFBRSxDQUFDO0NBQ04sRUFDViwyQkFBMkIsQ0FDNUIsRUFmYSxtQ0FBMkIsVUFBRSxtQ0FBMkIsU0FlcEU7QUFXVyxnQ0FBd0IsR0FBRztJQUN0Qzs7T0FFRztJQUNILElBQUksRUFBRSxNQUFNO0lBRVo7O09BRUc7SUFDSCxZQUFZLEVBQUUsY0FBYztJQUU1Qjs7T0FFRztJQUNILGtCQUFrQixFQUFFLG9CQUFvQjtDQUNoQyxDQUFDO0FBRUUsS0FBbUUsK0NBQXVCLEVBT3JHO0lBQ0UsQ0FBQyxnQ0FBd0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ2xDLENBQUMsZ0NBQXdCLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztJQUMxQyxDQUFDLGdDQUF3QixDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQztJQUNoRCxXQUFXLEVBQUUsQ0FBQztDQUNOLEVBQ1YsOEJBQThCLENBQy9CLEVBZGEsc0NBQThCLFVBQUUsc0NBQThCLFNBYzFFO0FBb0dGLFNBQWdCLG1CQUFtQixDQUFxQixrQkFBOEI7SUFDcEYsSUFBSSxPQUFPLGtCQUFrQixLQUFLLFFBQVE7UUFBRSxPQUFPLGtCQUE0QixDQUFDO0lBQ2hGLElBQUksT0FBTyxrQkFBa0IsS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUM3QyxJQUFJLGtCQUFrQixFQUFFLElBQUk7WUFBRSxPQUFPLGtCQUFrQixDQUFDLElBQUksQ0FBQztRQUM3RCxNQUFNLElBQUksU0FBUyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUNELE1BQU0sSUFBSSxTQUFTLENBQ2pCLHVFQUF1RSxPQUFPLGtCQUFrQixHQUFHLENBQ3BHLENBQUM7QUFDSixDQUFDOzs7Ozs7Ozs7Ozs7O0FDek9ELHNFQUFzRTtBQUN0RSxpREFBaUQ7QUFDakQsMEVBQTBFO0FBQzFFLHVDQUF1Qzs7O0FBNkR2QyxvQkFHQztBQTlERCw0REFBNEQ7QUFDNUQsRUFBRTtBQUNGLCtFQUErRTtBQUMvRSxnRkFBZ0Y7QUFDaEYsK0VBQStFO0FBQy9FLDRFQUE0RTtBQUM1RSx3RUFBd0U7QUFDeEUsMkRBQTJEO0FBQzNELEVBQUU7QUFDRiw2RUFBNkU7QUFDN0Usc0RBQXNEO0FBQ3RELEVBQUU7QUFDRiw2RUFBNkU7QUFDN0UsMkVBQTJFO0FBQzNFLDhFQUE4RTtBQUM5RSx5RUFBeUU7QUFDekUsZ0ZBQWdGO0FBQ2hGLDRFQUE0RTtBQUM1RSxnQkFBZ0I7QUFFaEIsMkZBQTJGO0FBRTNGLE1BQU0sSUFBSTtJQU1SLFlBQVksSUFBYztRQUN4QixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3hCLDJDQUEyQztRQUMzQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDZixDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNmLENBQUM7UUFDRCxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2YsQ0FBQztJQUNILENBQUM7SUFFTSxJQUFJO1FBQ1QsTUFBTSxDQUFDLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLFFBQVE7UUFDdkUsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FDRjtBQUlELFNBQWdCLElBQUksQ0FBQyxJQUFjO0lBQ2pDLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVELE1BQWEsSUFBSTtJQUFqQjtRQUNVLE1BQUMsR0FBRyxVQUFVLENBQUM7SUFpQnpCLENBQUM7SUFmUSxJQUFJLENBQUMsSUFBYztRQUN4QixJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDckMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLElBQUksQ0FBQyxHQUFHLG1CQUFtQixHQUFHLENBQUMsQ0FBQztZQUNoQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNaLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDWixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxPQUFPO1FBQy9CLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQyxRQUFRO0lBQ3JELENBQUM7Q0FDRjtBQWxCRCxvQkFrQkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3NLRCx3Q0FFQztBQWlCRCxrRUFFQztBQWpSRCxpSEFBbUY7QUFDbkYsdUhBQWlFO0FBQ2pFLCtIQUFpRDtBQUNqRCwySUFBbUQ7QUFDbkQsdUdBQW1DO0FBRW5DLGlFQUFpRTtBQUNqRSxxRkFBcUY7QUFDeEUseUJBQWlCLEdBQXlCLFVBQWtCLENBQUMsaUJBQWlCLElBQUk7Q0FBUSxDQUFDO0FBRXhHLDhFQUE4RTtBQUM5RSxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7QUF1QnRDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0RHO0FBQ0gsTUFBYSxpQkFBaUI7SUF1QzVCLFlBQVksT0FBa0M7UUFQOUMsNkNBQW1CLEtBQUssRUFBQztRQVF2QixJQUFJLENBQUMsT0FBTyxHQUFHLDZCQUFrQixFQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sRUFBRSxXQUFXLElBQUksSUFBSSxDQUFDO1FBQ2hELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDL0MsdUZBQXVGO1lBQ3ZGLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDcEIsMkJBQUksc0NBQW9CLElBQUksT0FBQztnQkFDN0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSCxrQ0FBYyxFQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNyQyw2QkFBNkI7UUFDN0Isa0NBQWMsRUFBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzVELElBQUksT0FBTyxFQUFFLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sRUFBRSxNQUFNLElBQUksaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0QsSUFDRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVc7Z0JBQ3ZCLENBQUMsMkJBQUksQ0FBQyxNQUFNLDBDQUFpQjtvQkFDM0IsQ0FBQyxvQ0FBWSxHQUFFLENBQUMsT0FBTyxDQUFDLGdCQUFRLENBQUMsOENBQThDLENBQUMsQ0FBQyxFQUNuRixDQUFDO2dCQUNELDJCQUFJLHNDQUFvQiwyQkFBSSxDQUFDLE1BQU0sMENBQWlCLE9BQUM7Z0JBQ3JELGtDQUFjLEVBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7b0JBQ3hDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLENBQUMsQ0FBQyxDQUNILENBQUM7WUFDSixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sa0NBQWMsRUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDeEMsSUFBSSxDQUFDLG9DQUFZLEdBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQVEsQ0FBQyw4Q0FBOEMsQ0FBQyxFQUFFLENBQUM7d0JBQ3JGLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ25CLENBQUM7Z0JBQ0gsQ0FBQyxDQUFDLENBQ0gsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBVyxtQkFBbUI7UUFDNUIsT0FBTywyQkFBSSwwQ0FBaUIsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ25ELENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsR0FBRyxDQUFJLEVBQW9CO1FBQ3pCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBcUIsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRDs7OztPQUlHO0lBQ08sS0FBSyxDQUFDLFlBQVksQ0FBSSxFQUFvQjtRQUNsRCxJQUFJLFVBQXlDLENBQUM7UUFDOUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsVUFBVSxHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztZQUNyQyxrQ0FBYyxFQUNaLFVBQVU7aUJBQ1AsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBaUIsQ0FBQyxDQUFDO2lCQUN4QyxJQUFJLENBQ0gsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUNuQixHQUFHLEVBQUU7Z0JBQ0gsc0NBQXNDO1lBQ3hDLENBQUMsQ0FDRixDQUNKLENBQUM7UUFDSixDQUFDO1FBQ0QsSUFBSSxDQUFDO1lBQ0gsT0FBTyxNQUFNLEVBQUUsRUFBRSxDQUFDO1FBQ3BCLENBQUM7Z0JBQVMsQ0FBQztZQUNULElBQ0UsVUFBVTtnQkFDVixDQUFDLFVBQVUsQ0FBQyxtQkFBbUI7Z0JBQy9CLG9DQUFZLEdBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQVEsQ0FBQyw4Q0FBOEMsQ0FBQyxFQUMvRSxDQUFDO2dCQUNELFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN0QixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU07UUFDSixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUkseUJBQWdCLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU0sQ0FBQyxPQUFPO1FBQ1osK0VBQStFO1FBQy9FLE9BQU8sT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFLLFVBQWtCLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDO0lBQ3BGLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsTUFBTSxDQUFDLFdBQVcsQ0FBSSxFQUFvQjtRQUN4QyxPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCx1RUFBdUU7SUFDdkUsTUFBTSxDQUFDLGNBQWMsQ0FBSSxFQUFvQjtRQUMzQyxPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCwrRUFBK0U7SUFDL0UsTUFBTSxDQUFDLFdBQVcsQ0FBSSxPQUFpQixFQUFFLEVBQW9CO1FBQzNELE9BQU8sSUFBSSxJQUFJLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFELENBQUM7Q0FDRjtBQTlKRCw4Q0E4SkM7O0FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSx5QkFBaUIsRUFBcUIsQ0FBQztBQUUzRDs7R0FFRztBQUNILFNBQWdCLGNBQWM7SUFDNUIsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BCLENBQUM7QUFFRCxNQUFhLHFCQUFzQixTQUFRLGlCQUFpQjtJQUMxRDtRQUNFLEtBQUssQ0FBQyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUkseUJBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO0lBQzFELENBQUM7Q0FDRjtBQVJELHNEQVFDO0FBRUQsK0ZBQStGO0FBQy9GLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBVyxFQUFpQixFQUFFO0lBQ3pDLE1BQU0sSUFBSSwwQkFBaUIsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0FBQzVFLENBQUMsQ0FBQztBQUVGLFNBQWdCLDJCQUEyQixDQUFDLEVBQWdCO0lBQzFELEtBQUssR0FBRyxFQUFFLENBQUM7QUFDYixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyUEQsd0NBS0M7QUFsQ0QsaUhBQTZGO0FBQzdGLCtJQUFpRjtBQUdqRjs7R0FFRztBQUVJLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxLQUFLO0NBQUc7QUFBOUIsc0NBQWE7d0JBQWIsYUFBYTtJQUR6Qiw2Q0FBMEIsRUFBQyxlQUFlLENBQUM7R0FDL0IsYUFBYSxDQUFpQjtBQUUzQzs7R0FFRztBQUVJLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQTBCLFNBQVEsYUFBYTtDQUFHO0FBQWxELDhEQUF5QjtvQ0FBekIseUJBQXlCO0lBRHJDLDZDQUEwQixFQUFDLDJCQUEyQixDQUFDO0dBQzNDLHlCQUF5QixDQUF5QjtBQUUvRDs7R0FFRztBQUVJLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsS0FBSztJQUMvQyxZQUE0QixPQUEyQztRQUNyRSxLQUFLLEVBQUUsQ0FBQztRQURrQixZQUFPLEdBQVAsT0FBTyxDQUFvQztJQUV2RSxDQUFDO0NBQ0Y7QUFKWSx3REFBc0I7aUNBQXRCLHNCQUFzQjtJQURsQyw2Q0FBMEIsRUFBQyx3QkFBd0IsQ0FBQztHQUN4QyxzQkFBc0IsQ0FJbEM7QUFFRDs7R0FFRztBQUNILFNBQWdCLGNBQWMsQ0FBQyxHQUFZO0lBQ3pDLE9BQU8sQ0FDTCxHQUFHLFlBQVkseUJBQWdCO1FBQy9CLENBQUMsQ0FBQyxHQUFHLFlBQVksd0JBQWUsSUFBSSxHQUFHLFlBQVksNkJBQW9CLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxZQUFZLHlCQUFnQixDQUFDLENBQ25ILENBQUM7QUFDSixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNvQkQsMENBRUM7QUFoREQsTUFBTSxhQUFhLEdBQXlCLElBQUksR0FBRyxFQUFFLENBQUM7QUFFekMsZ0JBQVEsR0FBRztJQUN0Qjs7Ozs7Ozs7Ozs7T0FXRztJQUNILDhDQUE4QyxFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsd0JBQXdCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUU5Rzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW1CRztJQUNILDBDQUEwQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsd0JBQXdCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztDQUNsRyxDQUFDO0FBRVgsU0FBUyxVQUFVLENBQUMsRUFBVSxFQUFFLEdBQVksRUFBRSxxQkFBd0M7SUFDcEYsTUFBTSxJQUFJLEdBQUcsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxDQUFDO0lBQ3pELGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVCLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxFQUFVO0lBQ3hDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDN0UsQ0FBQztBQWdCRCxTQUFTLHdCQUF3QixDQUFDLE9BQWU7SUFDL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsd0JBQXdCLE9BQU8sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZFLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN0RixDQUFDOzs7Ozs7Ozs7Ozs7OztBQ3hFRCw0REFFQztBQUVELGtEQUVDO0FBRUQsOENBRUM7QUFFRCwwREFJQztBQUVELG9DQU1DO0FBM0JELGlIQUF1RDtBQUd2RCxTQUFnQix3QkFBd0I7SUFDdEMsT0FBUSxVQUFrQixDQUFDLHNCQUFzQixDQUFDO0FBQ3BELENBQUM7QUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxTQUFrQjtJQUNuRCxVQUFrQixDQUFDLHNCQUFzQixHQUFHLFNBQVMsQ0FBQztBQUN6RCxDQUFDO0FBRUQsU0FBZ0IsaUJBQWlCO0lBQy9CLE9BQU8sd0JBQXdCLEVBQTJCLENBQUM7QUFDN0QsQ0FBQztBQUVELFNBQWdCLHVCQUF1QixDQUFDLE9BQWU7SUFDckQsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQztJQUN0QyxJQUFJLFNBQVMsSUFBSSxJQUFJO1FBQUUsTUFBTSxJQUFJLDBCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFnQixZQUFZO0lBQzFCLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixFQUFFLENBQUM7SUFDdEMsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDNUIsTUFBTSxJQUFJLDBCQUFpQixDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FDWEQsMENBMkZDO0FBM0dEOzs7O0dBSUc7QUFDSCx1SEFBcUQ7QUFDckQsOElBQXlEO0FBQ3pELDBHQUFxRDtBQUNyRCwySUFBbUQ7QUFDbkQsdUdBQW1DO0FBQ25DLGdIQUFtQztBQUNuQywrSEFBaUQ7QUFFakQsTUFBTSxNQUFNLEdBQUcsVUFBaUIsQ0FBQztBQUNqQyxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO0FBRXJDLFNBQWdCLGVBQWU7SUFDN0IsMEdBQTBHO0lBQzFHLCtFQUErRTtJQUMvRSxNQUFNLENBQUMsT0FBTyxHQUFHO1FBQ2YsTUFBTSxJQUFJLGtDQUF5QixDQUFDLHdFQUF3RSxDQUFDLENBQUM7SUFDaEgsQ0FBQyxDQUFDO0lBQ0YsTUFBTSxDQUFDLG9CQUFvQixHQUFHO1FBQzVCLE1BQU0sSUFBSSxrQ0FBeUIsQ0FDakMscUZBQXFGLENBQ3RGLENBQUM7SUFDSixDQUFDLENBQUM7SUFFRixNQUFNLENBQUMsSUFBSSxHQUFHLFVBQVUsR0FBRyxJQUFlO1FBQ3hDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNwQixPQUFPLElBQUssWUFBb0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFDRCxPQUFPLElBQUksWUFBWSxDQUFDLG9DQUFZLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QyxDQUFDLENBQUM7SUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRztRQUNoQixPQUFPLG9DQUFZLEdBQUUsQ0FBQyxHQUFHLENBQUM7SUFDNUIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQztJQUUvQyxNQUFNLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO0lBRXRFOztPQUVHO0lBQ0gsTUFBTSxDQUFDLFVBQVUsR0FBRyxVQUFVLEVBQTJCLEVBQUUsRUFBVSxFQUFFLEdBQUcsSUFBVztRQUNuRixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckIsTUFBTSxTQUFTLEdBQUcsb0NBQVksR0FBRSxDQUFDO1FBQ2pDLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxnQkFBUSxDQUFDLDhDQUE4QyxDQUFDLEVBQUUsQ0FBQztZQUMvRSx1REFBdUQ7WUFDdkQsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDckMsTUFBTSxVQUFVLEdBQUcsSUFBSSxzQ0FBaUIsQ0FBQyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsb0JBQUssRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JELFlBQVksQ0FBQyxJQUFJLENBQ2YsR0FBRyxFQUFFO2dCQUNILHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDckMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDZCxDQUFDLEVBQ0QsR0FBRyxFQUFFO2dCQUNILHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQ0YsQ0FBQztZQUNGLGtDQUFjLEVBQUMsWUFBWSxDQUFDLENBQUM7WUFDN0Isd0JBQXdCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5QyxPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN2QyxrR0FBa0c7WUFDbEcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQzlCLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFDMUQsU0FBUyxDQUFDLFdBQVcsQ0FBQztvQkFDcEIsVUFBVSxFQUFFO3dCQUNWLEdBQUc7d0JBQ0gsa0JBQWtCLEVBQUUsaUJBQU0sRUFBQyxFQUFFLENBQUM7cUJBQy9CO2lCQUNGLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDTCxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFDakIsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUMxQyxDQUFDO1lBQ0YsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsTUFBTSxDQUFDLFlBQVksR0FBRyxVQUFVLE1BQWM7UUFDNUMsTUFBTSxTQUFTLEdBQUcsb0NBQVksR0FBRSxDQUFDO1FBQ2pDLE1BQU0sVUFBVSxHQUFHLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RCxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2Ysd0JBQXdCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN0QixDQUFDO2FBQU0sQ0FBQztZQUNOLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxnRUFBZ0U7WUFDNUYsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLFNBQVMsQ0FBQyxXQUFXLENBQUM7Z0JBQ3BCLFdBQVcsRUFBRTtvQkFDWCxHQUFHLEVBQUUsTUFBTTtpQkFDWjthQUNGLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDLENBQUM7SUFFRiw0REFBNEQ7SUFDNUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxvQ0FBWSxHQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDOUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQzNHRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlERzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCwrR0FlNEI7QUFkMUIsMklBQXdCO0FBQ3hCLHlIQUFlO0FBRWYsK0hBQWtCO0FBQ2xCLDJIQUFnQjtBQUNoQixtSUFBb0I7QUFDcEIseUlBQXVCO0FBR3ZCLDZHQUFTO0FBQ1QscUhBQWE7QUFDYix5SEFBZTtBQUNmLDZIQUFpQjtBQUNqQix1SEFBYztBQUVoQixtSUFBOEM7QUFnQjlDLHFKQUF1RDtBQUN2RCx1SkFBd0Q7QUFDeEQsNElBQXNHO0FBQTdGLHlJQUFpQjtBQUFFLHlJQUFpQjtBQUM3QyxnSEFBeUI7QUFDekIsNEhBQStCO0FBQy9CLG9IQWNzQjtBQWJwQix5SkFBNkI7QUFFN0IseUhBQWE7QUFLYixpSUFBaUI7QUFPbkIscUdBQTBFO0FBQWpFLDhHQUFVO0FBQ25CLGtHQUE2QjtBQUFwQiwrRkFBRztBQUNaLDJHQUFvQztBQUEzQiwwR0FBTztBQUNoQixvSEFBMkI7Ozs7Ozs7Ozs7Ozs7QUMxRzNCOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNPSCwrSUFBaUY7QUFDakYsc0xBQWlHO0FBeU1qRzs7R0FFRztBQUVJLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxLQUFLO0lBQ3RDLFlBQTRCLE9BQWtFO1FBQzVGLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBRFQsWUFBTyxHQUFQLE9BQU8sQ0FBMkQ7SUFFOUYsQ0FBQztDQUNGO0FBSlksc0NBQWE7d0JBQWIsYUFBYTtJQUR6Qiw2Q0FBMEIsRUFBQyxlQUFlLENBQUM7R0FDL0IsYUFBYSxDQUl6QjtBQXFEWSxxQ0FBNkIsR0FBRztJQUMzQzs7T0FFRztJQUNILE9BQU8sRUFBRSxTQUFTO0lBRWxCOztPQUVHO0lBQ0gsVUFBVSxFQUFFLFlBQVk7SUFFeEI7Ozs7Ozs7T0FPRztJQUNILDJCQUEyQixFQUFFLDZCQUE2QjtJQUUxRDs7T0FFRztJQUNILDJCQUEyQixFQUFFLDZCQUE2QjtDQUNsRCxDQUFDO0FBRVgsdUJBQXVCO0FBQ1YsS0FBNkUsMkNBQXVCLEVBTy9HO0lBQ0UsQ0FBQyxxQ0FBNkIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO0lBQzFDLENBQUMscUNBQTZCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztJQUM3QyxDQUFDLHFDQUE2QixDQUFDLDJCQUEyQixDQUFDLEVBQUUsQ0FBQztJQUM5RCxDQUFDLHFDQUE2QixDQUFDLDJCQUEyQixDQUFDLEVBQUUsQ0FBQztDQUN0RCxFQUNWLEVBQUUsQ0FDSCxFQWRhLDJDQUFtQyxVQUFFLDJDQUFtQyxTQWNwRjtBQVFXLHlCQUFpQixHQUFHO0lBQy9COzs7O09BSUc7SUFDSCxTQUFTLEVBQUUsV0FBVztJQUV0Qjs7T0FFRztJQUNILE9BQU8sRUFBRSxTQUFTO0lBRWxCOztPQUVHO0lBQ0gsY0FBYyxFQUFFLGdCQUFnQjtJQUVoQyxnREFBZ0Q7SUFFaEQ7Ozs7T0FJRztJQUNILCtCQUErQixFQUFFLFNBQVMsRUFBRSw4Q0FBOEM7SUFFMUY7Ozs7T0FJRztJQUNILDZCQUE2QixFQUFFLFdBQVcsRUFBRSw4Q0FBOEM7SUFFMUY7Ozs7T0FJRztJQUNILDJCQUEyQixFQUFFLFNBQVMsRUFBRSw4Q0FBOEM7SUFFdEY7Ozs7T0FJRztJQUNILGtDQUFrQyxFQUFFLGdCQUFnQixFQUFFLDhDQUE4QztDQUM1RixDQUFDO0FBRVgsdUJBQXVCO0FBQ1YsS0FBcUQsMkNBQXVCLEVBT3ZGO0lBQ0UsQ0FBQyx5QkFBaUIsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO0lBQ2hDLENBQUMseUJBQWlCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztJQUM5QixDQUFDLHlCQUFpQixDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7SUFDckMsV0FBVyxFQUFFLENBQUM7Q0FDTixFQUNWLHNCQUFzQixDQUN2QixFQWRhLCtCQUF1QixVQUFFLCtCQUF1QixTQWM1RDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcllGLGlIQXVCNEI7QUFDNUIsK0lBQTBFO0FBQzFFLG9LQUFtRjtBQUVuRixvR0FBbUM7QUFDbkMsOElBQTZEO0FBQzdELDRIQUE2QztBQUM3QywwR0FBNkY7QUFFN0Ysc0hBVXNCO0FBRXRCLCtIQUFpRDtBQUNqRCxrSEFBd0I7QUFDeEIsdUdBQW1EO0FBQ25ELG9HQUEwRDtBQUUxRCxNQUFNLHNDQUFzQyxHQUFHO0lBQzdDLHVCQUF1QixFQUFFLHlCQUF5QjtDQUMxQyxDQUFDO0FBSVgsTUFBTSxDQUFDLDZDQUE2QyxFQUFFLDRDQUE0QyxDQUFDLEdBQ2pHLCtDQUF1QixFQU9yQjtJQUNFLENBQUMsc0NBQXNDLENBQUMsdUJBQXVCLENBQUMsRUFBRSxDQUFDO0lBQ25FLFdBQVcsRUFBRSxDQUFDO0NBQ04sRUFDViw4Q0FBOEMsQ0FDL0MsQ0FBQztBQStDSjs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkc7QUFDSCxNQUFhLFNBQVM7SUFvUHBCLFlBQVksRUFDVixJQUFJLEVBQ0osR0FBRyxFQUNILHFCQUFxQixFQUNyQixTQUFTLEVBQ1QsWUFBWSxFQUNaLGNBQWMsRUFDZCx1QkFBdUIsR0FDTztRQTNQaEM7O1dBRUc7UUFDTSxnQkFBVyxHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO1FBQ2xEOztXQUVHO1FBQ00sZ0JBQVcsR0FBRztZQUNyQixLQUFLLEVBQUUsSUFBSSxHQUFHLEVBQXNCO1lBQ3BDLFFBQVEsRUFBRSxJQUFJLEdBQUcsRUFBc0I7WUFDdkMsa0JBQWtCLEVBQUUsSUFBSSxHQUFHLEVBQXNCO1lBQ2pELHFCQUFxQixFQUFFLElBQUksR0FBRyxFQUFzQjtZQUNwRCxjQUFjLEVBQUUsSUFBSSxHQUFHLEVBQXNCO1lBQzdDLGNBQWMsRUFBRSxJQUFJLEdBQUcsRUFBc0I7U0FDOUMsQ0FBQztRQUVGOztXQUVHO1FBQ00sb0JBQWUsR0FBRyxLQUFLLEVBQXlDLENBQUM7UUFFMUU7O1dBRUc7UUFDTSxvQkFBZSxHQUFHLEtBQUssRUFBK0MsQ0FBQztRQUVoRjs7V0FFRztRQUNNLG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQXVDLENBQUM7UUFFekU7O1dBRUc7UUFDTSxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUF1QyxDQUFDO1FBRXpFOztXQUVHO1FBQ00sc0JBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQW1DLENBQUM7UUFFeEU7O1dBRUc7UUFDTSxzQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBbUMsQ0FBQztRQUV4RTs7V0FFRztRQUNPLDhCQUF5QixHQUFHLENBQUMsQ0FBQztRQWlCL0Isc0JBQWlCLEdBQXNCO1lBQzlDLGNBQWMsRUFBRSxJQUFJLEdBQUcsRUFBRTtZQUN6QixhQUFhLEVBQUUsSUFBSSxHQUFHLEVBQUU7U0FDekIsQ0FBQztRQUVjLGNBQVMsR0FBRyxJQUFJLDBDQUFxQixFQUFFLENBQUM7UUFFeEQ7O1dBRUc7UUFDYSxrQkFBYSxHQUFHLElBQUksR0FBRyxDQUFxQztZQUMxRTtnQkFDRSxlQUFlO2dCQUNmO29CQUNFLE9BQU8sRUFBRSxHQUFHLEVBQUU7d0JBQ1osT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFOzZCQUN6QixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7NkJBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDbEIsQ0FBQztvQkFDRCxXQUFXLEVBQUUsaUNBQWlDO2lCQUMvQzthQUNGO1lBQ0Q7Z0JBQ0Usd0JBQXdCO2dCQUN4QjtvQkFDRSxPQUFPLEVBQUUsR0FBdUIsRUFBRTt3QkFDaEMsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQzt3QkFDM0IsTUFBTSxHQUFHLEdBQXNCLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsYUFBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUM1RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQ3pGLE1BQU0sT0FBTyxHQUEwQyxFQUFFLENBQUM7d0JBQzFELElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7NEJBQy9CLEtBQUssTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLE1BQU0sRUFBRSxDQUFDO2dDQUNuQyxLQUFLLE1BQU0sRUFBRSxTQUFTLEVBQUUsSUFBSSxTQUFTLEVBQUUsQ0FBQztvQ0FDdEMsSUFBSSxDQUFDLFNBQVM7d0NBQUUsU0FBUztvQ0FDekIsTUFBTSxPQUFPLEdBQUcsU0FBUyxFQUFFLGNBQWMsRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0NBQ25GLElBQUksQ0FBQyxPQUFPO3dDQUFFLFNBQVM7b0NBQ3ZCLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRzt3Q0FDbkI7NENBQ0UsV0FBVyxFQUFFLENBQUM7NENBQ2QsT0FBTzt5Q0FDUjtxQ0FDRixDQUFDO2dDQUNKLENBQUM7NEJBQ0gsQ0FBQzt3QkFDSCxDQUFDO3dCQUNELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDO29CQUNsQyxDQUFDO29CQUNELFdBQVcsRUFBRSwwREFBMEQ7aUJBQ3hFO2FBQ0Y7WUFDRDtnQkFDRSw4QkFBOEI7Z0JBQzlCO29CQUNFLE9BQU8sRUFBRSxHQUEwQyxFQUFFO3dCQUNuRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQzt3QkFDNUMsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzs0QkFDeEYsSUFBSTs0QkFDSixXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVc7eUJBQy9CLENBQUMsQ0FBQyxDQUFDO3dCQUNKLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7NEJBQzFGLElBQUk7NEJBQ0osV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXO3lCQUMvQixDQUFDLENBQUMsQ0FBQzt3QkFDSixNQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOzRCQUMxRixJQUFJOzRCQUNKLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVzt5QkFDL0IsQ0FBQyxDQUFDLENBQUM7d0JBQ0osT0FBTzs0QkFDTCxVQUFVLEVBQUU7Z0NBQ1YsSUFBSSxFQUFFLFlBQVk7Z0NBQ2xCLGdCQUFnQjtnQ0FDaEIsaUJBQWlCO2dDQUNqQixpQkFBaUI7NkJBQ2xCO3lCQUNGLENBQUM7b0JBQ0osQ0FBQztvQkFDRCxXQUFXLEVBQUUsaURBQWlEO2lCQUMvRDthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUg7O1dBRUc7UUFDYSxpQkFBWSxHQUFtQztZQUM3RCxPQUFPLEVBQUUsRUFBRTtZQUNYLFFBQVEsRUFBRSxFQUFFO1lBQ1osU0FBUyxFQUFFLEVBQUU7U0FDZCxDQUFDO1FBRUY7O1dBRUc7UUFDTyxhQUFRLEdBQWlELEVBQUUsQ0FBQztRQUV0RTs7V0FFRztRQUNhLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUFxQixDQUFDO1FBRWpFOzs7Ozs7V0FNRztRQUNJLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFFekI7O1dBRUc7UUFDTyxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBRTVCOztXQUVHO1FBQ0ksYUFBUSxHQUFHO1lBQ2hCLEtBQUssRUFBRSxDQUFDO1lBQ1IsUUFBUSxFQUFFLENBQUM7WUFDWCxhQUFhLEVBQUUsQ0FBQztZQUNoQixjQUFjLEVBQUUsQ0FBQztZQUNqQixjQUFjLEVBQUUsQ0FBQztZQUNqQixTQUFTLEVBQUUsQ0FBQztZQUNaLHVEQUF1RDtZQUN2RCxLQUFLLEVBQUUsQ0FBQztTQUNULENBQUM7UUF3QksscUJBQWdCLEdBQXFCLGdDQUF1QixDQUFDO1FBQzdELHFCQUFnQixHQUFxQixnQ0FBdUIsQ0FBQztRQUVwRTs7V0FFRztRQUNjLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFFekQ7O1dBRUc7UUFDYyxnQkFBVyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFFaEMsZUFBVSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFFaEQ7O1dBRUc7UUFDSCxjQUFTLEdBQUcsS0FBSyxFQUFZLENBQUM7UUFrQjVCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLHFCQUFxQixHQUFHLHFCQUFxQixDQUFDO1FBQ25ELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsZUFBSSxFQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyx1QkFBdUIsR0FBRyx1QkFBdUIsQ0FBQztJQUN6RCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxrQkFBa0IsQ0FBQyxFQUF3QztRQUN6RCxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVTLGNBQWM7UUFDdEIsTUFBTSxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDakUsTUFBTSxhQUFhLEdBQUcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNyRSxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNyQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQztZQUNELE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNkLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBQ3hDLEtBQUssTUFBTSxLQUFLLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTO29CQUFFLFNBQVM7Z0JBQ3pDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDO1FBQ0gsQ0FBQztRQUNELDBEQUEwRDtRQUMxRCxNQUFNLENBQUMsTUFBTSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxvQkFBb0I7UUFDbEIsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFdBQVcsQ0FBQyxHQUErQyxFQUFFLFFBQVEsR0FBRyxLQUFLO1FBQzNFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN4QixDQUFDO0lBQ0gsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixPQUFPO1lBQ0wsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNqQyxpQkFBaUIsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztTQUN4QyxDQUFDO0lBQ0osQ0FBQztJQUVNLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLElBQUksRUFBd0I7UUFDbEUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUMxQixJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMzQixNQUFNLElBQUksMEJBQWlCLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQ0QsT0FBTyxNQUFNLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFTSxhQUFhLENBQUMsVUFBMkQ7UUFDOUUsTUFBTSxPQUFPLEdBQUcsc0NBQW1CLEVBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVwSCxrQ0FBYyxFQUNaLHNDQUEyQixFQUFDLEdBQUcsRUFBRSxDQUMvQixPQUFPLENBQUM7WUFDTixPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU8sSUFBSSxFQUFFO1lBQ2pDLElBQUksRUFBRSw4QkFBaUIsRUFBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQztTQUNyRSxDQUFDLENBQ0gsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ2hGLENBQUM7SUFDSixDQUFDO0lBRU0sa0JBQWtCLENBQUMsVUFBMkQ7UUFDbkYsTUFBTSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLFVBQVUsQ0FBQztRQUV0RixxRkFBcUY7UUFDckYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLEdBQUcsSUFBSTtZQUNQLGdCQUFnQixFQUNiLDRCQUFlLEVBQUMsd0NBQStCLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxDQUFzQixJQUFJLEVBQUU7WUFDL0csSUFBSSxFQUFFLDRCQUFlLEVBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxNQUFNLENBQUM7WUFDMUQsVUFBVSxFQUFFLGdDQUFtQixFQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxDQUFDO1lBQ3pGLFdBQVcsRUFDVCxnQkFBZ0IsSUFBSSxJQUFJO2dCQUN0QixDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUM7Z0JBQy9FLENBQUMsQ0FBQyxTQUFTO1NBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVNLGNBQWMsQ0FBQyxXQUF3RDtRQUM1RSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTSxTQUFTLENBQUMsVUFBa0Q7UUFDakUsbUZBQW1GO1FBQ25GLDZFQUE2RTtRQUM3RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzVFLFVBQVUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVNLGVBQWUsQ0FBQyxVQUF3RDtRQUM3RSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sSUFBSSxTQUFTLENBQUMsK0NBQStDLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBQ0QsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25GLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNoQyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUM5QyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ2xHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQixDQUFDO2FBQU0sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3BDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUM3QyxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUMvRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDZCxDQUFDO2FBQU0sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNoRCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUMvRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDZCxDQUFDO2FBQU0sSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxJQUFJLCtCQUFzQixDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNoRSxDQUFDO0lBQ0gsQ0FBQztJQUVNLGtDQUFrQyxDQUN2QyxVQUEyRTtRQUUzRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUM3RixJQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN6QixPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QyxDQUFDO2FBQU0sSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSw0Q0FBNEMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLHlCQUF5QixFQUFFLENBQUM7Z0JBQ3hHLE1BQU0sSUFBSSwwQkFBaUIsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO1lBQ3BGLENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztnQkFDeEYsTUFBTSxJQUFJLFNBQVMsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQzlELENBQUM7WUFDRCxNQUFNLENBQ0osSUFBSSw2Q0FBb0MsQ0FDdEMsb0NBQW9DLEVBQ3BDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUM1QixVQUFVLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FDL0IsQ0FDRixDQUFDO1FBQ0osQ0FBQzthQUFNLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNsQyxNQUFNLElBQUksU0FBUyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM1RCxDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sSUFBSSxTQUFTLENBQUMsdURBQXVELENBQUMsQ0FBQztRQUMvRSxDQUFDO0lBQ0gsQ0FBQztJQUVNLDZCQUE2QixDQUFDLFVBQXNFO1FBQ3pHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkIsTUFBTSxJQUFJLFNBQVMsQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7UUFDRCxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNoRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDaEMsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFDOUMsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNsRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEIsQ0FBQzthQUFNLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNwQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDN0MsSUFBSSxPQUFPLEtBQUssU0FBUyxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDOUMsTUFBTSxJQUFJLFNBQVMsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1lBQ3JFLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7YUFBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdkMsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ2hELElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzlDLE1BQU0sSUFBSSxTQUFTLENBQUMsZ0RBQWdELENBQUMsQ0FBQztZQUN4RSxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN2QyxDQUFDO0lBQ0gsQ0FBQztJQUVELHNGQUFzRjtJQUM1RSx3QkFBd0IsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQWM7UUFDaEUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxDQUFDO1FBQ3RELElBQUksRUFBRSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sZUFBZSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pFLGlCQUFpQjtZQUNqQixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQ25CLElBQUksY0FBYyxDQUNoQiwyQ0FBMkMsU0FBUywwQkFBMEIsZUFBZSxHQUFHLENBQ2pHLENBQ0YsQ0FBQztRQUNKLENBQUM7UUFDRCxJQUFJLENBQUM7WUFDSCxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUN4QixJQUFJLEdBQUcsWUFBWSxPQUFPLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksa0NBQXlCLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO1lBQ3JHLENBQUM7WUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDYixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQztJQUNILENBQUM7SUFFTSxhQUFhLENBQUMsVUFBc0Q7UUFDekUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsVUFBVSxDQUFDO1FBQ25ELElBQUksQ0FBQyxDQUFDLFNBQVMsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzVCLE1BQU0sSUFBSSxTQUFTLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsc0NBQW1CLEVBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUN6QixhQUFhLEVBQ2IsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDekMsQ0FBQztRQUNGLE9BQU8sQ0FBQztZQUNOLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLElBQUksRUFBRSw4QkFBaUIsRUFBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQztZQUNwRSxPQUFPO1lBQ1AsT0FBTyxFQUFFLE9BQU8sSUFBSSxFQUFFO1NBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQ0wsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUMvQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQzVDLENBQUM7SUFDSixDQUFDO0lBRU0sUUFBUSxDQUFDLFVBQWlEO1FBQy9ELE1BQU0sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEdBQUcsVUFBVSxDQUFDO1FBQ3JGLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNkLE1BQU0sSUFBSSxTQUFTLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1YsTUFBTSxJQUFJLFNBQVMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFDRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUN4QixNQUFNLElBQUksU0FBUyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNYLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RDLE9BQU87UUFDVCxDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsR0FBZ0IsRUFBRSxDQUFDLENBQUM7WUFDcEMsUUFBUTtZQUNSLElBQUksRUFBRSw4QkFBaUIsRUFBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQztZQUNoRSxJQUFJO1lBQ0osT0FBTyxFQUFFLE9BQU8sSUFBSSxFQUFFO1NBQ3ZCLENBQUMsQ0FBQztRQUVILHlFQUF5RTtRQUN6RSw4QkFBOEI7UUFDOUIsRUFBRTtRQUNGLDhFQUE4RTtRQUM5RSxFQUFFO1FBQ0YsMEVBQTBFO1FBQzFFLDJFQUEyRTtRQUMzRSxpQkFBaUI7UUFDakIsRUFBRTtRQUNGLHlFQUF5RTtRQUN6RSxnQkFBZ0I7UUFDaEIsRUFBRTtRQUNGLDJFQUEyRTtRQUMzRSwyRUFBMkU7UUFDM0UsZ0JBQWdCO1FBQ2hCLEVBQUU7UUFDRiwwRUFBMEU7UUFDMUUseUVBQXlFO1FBQ3pFLHlFQUF5RTtRQUN6RSxtQkFBbUI7UUFDbkIsRUFBRTtRQUNGLDJFQUEyRTtRQUMzRSxzRUFBc0U7UUFDdEUseUNBQXlDO1FBQ3pDLEVBQUU7UUFDRix1RUFBdUU7UUFDdkUsb0VBQW9FO1FBQ3BFLE1BQU0sWUFBWSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQzlCLElBQUksS0FBa0IsQ0FBQztZQUN2QixJQUFJLENBQUM7Z0JBQ0gsSUFBSSxZQUFZLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNwQyxNQUFNLFFBQVEsR0FBRyxzQ0FBbUIsRUFDbEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQ3pCLGdCQUFnQixFQUNoQixJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQzNELENBQUM7b0JBQ0YsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Z0JBQ3hCLENBQUM7Z0JBQ0QsS0FBSyxHQUFHLFNBQVMsRUFBRSxDQUFDO1lBQ3RCLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNmLElBQUksQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzdDLE9BQU87WUFDVCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sT0FBTyxHQUFHLHNDQUFtQixFQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFDekIsY0FBYyxFQUNkLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FDakQsQ0FBQztZQUNGLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLEtBQUssQ0FBQztZQUNuQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMvRSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO2lCQUN2QixJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBQ2pFLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNmLElBQUksS0FBSyxZQUFZLHdCQUFlLEVBQUUsQ0FBQztvQkFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDL0MsQ0FBQztxQkFBTSxDQUFDO29CQUNOLE1BQU0sS0FBSyxDQUFDO2dCQUNkLENBQUM7WUFDSCxDQUFDLENBQUM7aUJBQ0QsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMxRCxrQ0FBYyxFQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQyxDQUFDO1FBQ0Ysa0NBQWMsRUFBQywwQkFBVyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVTLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxPQUEyQixFQUFFLEVBQUUsSUFBSSxFQUFlO1FBQ2xGLE9BQU8sTUFBTSxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRVMseUJBQXlCLENBQUMsU0FBa0QsRUFBRSxFQUFFLElBQUksRUFBZTtRQUMzRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDckIsQ0FBQztJQUNILENBQUM7SUFFTSx1QkFBdUI7UUFDNUIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUM3QyxPQUFPLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QixNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBYyxDQUFDLENBQUMsQ0FBQztZQUN6RyxJQUFJLFVBQVUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN0QiwwQ0FBMEM7Z0JBQzFDLE1BQU07WUFDUixDQUFDO1lBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEIsQ0FBQztJQUNILENBQUM7SUFFTSxxQkFBcUI7UUFDMUIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ25DLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDNUMsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDWCxJQUFJLENBQUMsWUFBWTtnQkFDZiw2REFBNkQ7Z0JBQzdELE1BQU0sQ0FBQyxrQkFBbUIsRUFDMUIsMkJBQWtCLENBQUMsWUFBWSxDQUFDLHFDQUFxQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FDcEYsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVNLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQWU7UUFDdEUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsT0FBTyxDQUFDO1FBQ3hELElBQUksRUFBRSxFQUFFLENBQUM7WUFDUCxPQUFPLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDM0IsQ0FBQzthQUFNLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDckMsT0FBTyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM5RCxDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sSUFBSSwwQkFBaUIsQ0FBQyw0Q0FBNEMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUN4RixDQUFDO0lBQ0gsQ0FBQztJQUVNLGNBQWMsQ0FBQyxVQUF1RDtRQUMzRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxHQUFHLFVBQVUsQ0FBQztRQUMzQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDaEIsTUFBTSxJQUFJLFNBQVMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUN2RSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0QyxPQUFPO1FBQ1QsQ0FBQztRQUVELHVFQUF1RTtRQUN2RSx5RUFBeUU7UUFDekUsb0JBQW9CO1FBQ3BCLE1BQU0sZ0JBQWdCLEdBQ3BCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLGdCQUFnQixJQUFJLGdDQUF1QixDQUFDLGdCQUFnQixDQUFDO1FBRXBHLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDNUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZGLE1BQU0sT0FBTyxHQUFHLHNDQUFtQixFQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFDekIsY0FBYyxFQUNkLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQzFDLENBQUM7UUFDRixPQUFPLENBQUM7WUFDTixJQUFJLEVBQUUsOEJBQWlCLEVBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFDaEUsVUFBVTtZQUNWLE9BQU8sRUFBRSxPQUFPLElBQUksRUFBRTtTQUN2QixDQUFDO2FBQ0MsS0FBSyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDNUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFTSx1QkFBdUI7UUFDNUIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUM3QyxPQUFPLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QixJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUM5QixvRUFBb0U7Z0JBQ3BFLG9FQUFvRTtnQkFDcEUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFHLENBQUMsQ0FBQztZQUNoRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUMvRyxJQUFJLFVBQVUsS0FBSyxDQUFDLENBQUM7b0JBQUUsTUFBTTtnQkFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVNLDZCQUE2QixDQUFDLFVBQXNFO1FBQ3pHLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2xELENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JCLENBQUM7SUFDSCxDQUFDO0lBRU0sb0NBQW9DLENBQ3pDLFVBQTZFO1FBRTdFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2xELENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JCLENBQUM7SUFDSCxDQUFDO0lBRU0sd0JBQXdCO1FBQzdCLE1BQU0sV0FBVyxHQUFHLENBQUMsaUJBQW9ELEVBQTZCLEVBQUU7WUFDdEcsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxDQUN6QyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLGdCQUFnQixLQUFLLGdDQUF1QixDQUFDLGdCQUFnQixDQUN6RSxDQUFDO1FBQ0osQ0FBQyxDQUFDO1FBRUYsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3JFLElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUMvQixVQUFHLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELE1BQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNyRSxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDL0IsVUFBRyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7SUFDSCxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsVUFBeUQ7UUFDL0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUMvQixNQUFNLElBQUksU0FBUyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsZUFBSSxFQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRU0sY0FBYyxDQUFDLFVBQXVEO1FBQzNFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXO1lBQy9CLE1BQU0sSUFBSSwwQkFBaUIsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1FBQ3hGLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTztZQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRU0sYUFBYSxDQUFDLE9BQWUsRUFBRSxVQUFtQjtRQUN2RCxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDaEMsTUFBTSxJQUFJLDBCQUFpQixDQUFDLCtDQUErQyxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUNELE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEYsK0RBQStEO1FBQy9ELHFFQUFxRTtRQUNyRSxJQUFJLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDZixjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFO2FBQ3hDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksYUFBYSxDQUFDLEtBQWU7UUFDbEMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUN6QiwyQkFBZSxFQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0ksT0FBTyxDQUFDLElBQWE7UUFDMUIsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFOUMsNEZBQTRGO1FBQzVGLGdHQUFnRztRQUNoRyxpR0FBaUc7UUFDakcseUNBQXlDO1FBQ3pDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM3QixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxrR0FBa0c7UUFDbEcsc0dBQXNHO1FBQ3RHLCtDQUErQztRQUMvQyxFQUFFO1FBQ0YsZ0dBQWdHO1FBQ2hHLCtGQUErRjtRQUMvRixtR0FBbUc7UUFDbkcsOEZBQThGO1FBQzlGLEVBQUU7UUFDRiwrRkFBK0Y7UUFDL0Ysa0dBQWtHO1FBQ2xHLDRGQUE0RjtRQUM1RiwrRkFBK0Y7UUFDL0Ysd0JBQXdCO1FBQ3hCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQy9ELEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQzlDLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFBRSxPQUFPLElBQUksQ0FBQztZQUM3QyxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVNLGVBQWU7UUFDcEIsTUFBTSxJQUFJLDBCQUFpQixDQUFDLDBEQUEwRCxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxLQUFjO1FBQ3hDLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSwyQkFBYyxFQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFELENBQUM7YUFBTSxJQUFJLEtBQUssWUFBWSwwQkFBYSxFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLDhCQUE4QixFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RSxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxDQUFDLEtBQUssWUFBWSx3QkFBZSxDQUFDLEVBQUUsQ0FBQztnQkFDeEMsd0VBQXdFO2dCQUN4RSxpQ0FBaUM7Z0JBQ2pDLE1BQU0sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELDhGQUE4RjtZQUM5RixzQ0FBc0M7WUFDdEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsV0FBVyxDQUNkO2dCQUNFLHFCQUFxQixFQUFFO29CQUNyQixPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUM7aUJBQ3BDO2FBQ0YsRUFDRCxJQUFJLENBQ0wsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0lBRU8sYUFBYSxDQUFDLE9BQWUsRUFBRSxNQUFlO1FBQ3BELElBQUksQ0FBQyxXQUFXLENBQUM7WUFDZixjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtTQUM5RixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sU0FBUyxDQUFDLE9BQWUsRUFBRSxLQUFjO1FBQy9DLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDZixjQUFjLEVBQUU7Z0JBQ2QsT0FBTztnQkFDUCxNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQ0FBcUIsRUFBQyxLQUFLLENBQUMsQ0FBQzthQUMxRDtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxZQUFZLENBQUMsa0JBQTBCO1FBQzdDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFTyxjQUFjLENBQUMsa0JBQTBCLEVBQUUsTUFBZTtRQUNoRSxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2YsY0FBYyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7U0FDM0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLFlBQVksQ0FBQyxrQkFBMEIsRUFBRSxLQUFjO1FBQzdELElBQUksQ0FBQyxXQUFXLENBQUM7WUFDZixjQUFjLEVBQUU7Z0JBQ2Qsa0JBQWtCO2dCQUNsQixRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQ0FBcUIsRUFBQyxLQUFLLENBQUMsQ0FBQzthQUM1RDtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCwwREFBMEQ7SUFDbEQsc0JBQXNCLENBQUMsSUFBb0MsRUFBRSxPQUFlO1FBQ2xGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZELElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFDRCxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBRUQsZ0ZBQWdGO0lBQ3hFLGlCQUFpQixDQUFDLElBQW9DLEVBQUUsT0FBZTtRQUM3RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzlELElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzdCLE1BQU0sSUFBSSwwQkFBaUIsQ0FBQyw2QkFBNkIsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVPLGdCQUFnQixDQUFDLE1BQWU7UUFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FDZDtZQUNFLHlCQUF5QixFQUFFO2dCQUN6QixNQUFNLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7YUFDaEQ7U0FDRixFQUNELElBQUksQ0FDTCxDQUFDO0lBQ0osQ0FBQztJQUVELGNBQWMsQ0FBQyxHQUFZO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELGNBQWMsQ0FBQyxPQUFxQjtRQUNsQyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzlFLENBQUM7Q0FDRjtBQXo0QkQsOEJBeTRCQztBQUVELFNBQVMsTUFBTSxDQUFvQyxVQUFhO0lBQzlELE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUM7SUFDM0IsSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUN0QyxNQUFNLElBQUksU0FBUyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELFNBQVMsa0NBQWtDLENBQUMsaUJBQTRDO0lBQ3RGLE1BQU0sT0FBTyxHQUFHOzs7Ozs7OzswR0FRd0Y7U0FDckcsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7U0FDbkIsSUFBSSxFQUFFLENBQUM7SUFFVixPQUFPLEdBQUcsT0FBTyw4RkFBOEYsSUFBSSxDQUFDLFNBQVMsQ0FDM0gsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQzlELEVBQUUsQ0FBQztBQUNOLENBQUM7QUFFRCxTQUFTLGtDQUFrQyxDQUFDLGlCQUE0QztJQUN0RixNQUFNLE9BQU8sR0FBRzs7Ozs7OzBHQU13RjtTQUVyRyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztTQUNuQixJQUFJLEVBQUUsQ0FBQztJQUVWLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBQ3hDLEtBQUssTUFBTSxFQUFFLElBQUksaUJBQWlCLEVBQUUsQ0FBQztRQUNuQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsT0FBTyxHQUFHLE9BQU8sOEZBQThGLElBQUksQ0FBQyxTQUFTLENBQzNILEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUN0RSxFQUFFLENBQUM7QUFDTixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUMxK0JELGtFQTBCQztBQU1ELHNEQVFDO0FBOUhELCtJQUEwRTtBQUMxRSxpSEFBa0Q7QUFDbEQsK0hBQWlEO0FBQ2pELHVHQUE0RDtBQUM1RCwwR0FBMEM7QUFDMUMsc0hBQTJEO0FBQzNELDJJQUE4RDtBQWlDOUQsTUFBTSxVQUFVLEdBQUcsc0JBQVUsR0FBdUIsQ0FBQyxpQkFBaUIsQ0FBQztBQUV2RTs7O0dBR0c7QUFDSCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRWpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ1UsV0FBRyxHQUFtQixNQUFNLENBQUMsV0FBVyxDQUNsRCxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQWlDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDekYsT0FBTztRQUNMLEtBQUs7UUFDTCxDQUFDLE9BQWUsRUFBRSxLQUErQixFQUFFLEVBQUU7WUFDbkQsTUFBTSxTQUFTLEdBQUcsK0NBQXVCLEVBQUMsMkRBQTJELENBQUMsQ0FBQztZQUN2RyxNQUFNLGdCQUFnQixHQUFHLHNDQUFtQixFQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RyxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ2hDLGtGQUFrRjtnQkFDbEYsQ0FBQyxZQUFZLENBQUMsRUFBRSxTQUFTLENBQUMsWUFBWSxFQUFFO2dCQUN4QyxZQUFZLEVBQUUscUJBQVksQ0FBQyxRQUFRO2dCQUNuQyxHQUFHLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUQsR0FBRyxLQUFLO2FBQ1QsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDLENBQUMsQ0FDSSxDQUFDO0FBRVQsU0FBZ0IsMkJBQTJCLENBQUMsRUFBMEI7SUFDcEUsV0FBRyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLFlBQVksRUFBRSxxQkFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDckUsTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUNqQixDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ04sV0FBRyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLFlBQVksRUFBRSxxQkFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDdkUsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDLEVBQ0QsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNSLDhGQUE4RjtRQUM5Rix3REFBd0Q7UUFDeEQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQy9DLElBQUksMkJBQWMsRUFBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUMxQixXQUFHLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLEVBQUUsWUFBWSxFQUFFLHFCQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFDcEYsTUFBTSxLQUFLLENBQUM7WUFDZCxDQUFDO2lCQUFNLElBQUksS0FBSyxZQUFZLDBCQUFhLEVBQUUsQ0FBQztnQkFDMUMsV0FBRyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxFQUFFLFlBQVksRUFBRSxxQkFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQzlFLE1BQU0sS0FBSyxDQUFDO1lBQ2QsQ0FBQztRQUNILENBQUM7UUFDRCxXQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxxQkFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDMUUsTUFBTSxLQUFLLENBQUM7SUFDZCxDQUFDLENBQ0YsQ0FBQztJQUNGLHNEQUFzRDtJQUN0RCxrQ0FBYyxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLE9BQU8sQ0FBQyxDQUFDO0FBQ1gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLHFCQUFxQixDQUFDLElBQWtCO0lBQ3RELE9BQU87UUFDTCxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7UUFDekIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1FBQ3pCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtRQUMzQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7UUFDakIsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO0tBQ2hDLENBQUM7QUFDSixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQzlIRCxzR0FBc0c7QUFDdEcsa0ZBQWtGO0FBQ2xGLDZEQUE2RDtBQUM3RCxhQUFhO0FBQ2IsdUlBQWtDO0FBRWxDLHFCQUFlLHNCQUF3QyxDQUFDOzs7Ozs7Ozs7Ozs7O0FDTnhEOzs7Ozs7Ozs7Ozs7OztHQWNHOztBQThESCxnQ0ErQkM7QUExRkQsMklBQThEO0FBNkI5RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E2Qkc7QUFDSCxTQUFnQixVQUFVO0lBQ3hCLE9BQU8sSUFBSSxLQUFLLENBQ2QsRUFBRSxFQUNGO1FBQ0UsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTO1lBQ2QsT0FBTyxJQUFJLEtBQUssQ0FDZCxFQUFFLEVBQ0Y7Z0JBQ0UsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNO29CQUNYLE9BQU8sQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO3dCQUN4QixNQUFNLFNBQVMsR0FBRywrQ0FBdUIsRUFDdkMscUVBQXFFLENBQ3RFLENBQUM7d0JBQ0YsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7NEJBQ3ZCLFNBQVMsRUFBRSxTQUFtQjs0QkFDOUIsTUFBTSxFQUFFLE1BQWdCOzRCQUN4QiwyR0FBMkc7NEJBQzNHLDRHQUE0Rzs0QkFDNUcsSUFBSSxFQUFHLFVBQWtCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBRSxVQUFrQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTs0QkFDNUYscUZBQXFGOzRCQUNyRixzRkFBc0Y7NEJBQ3RGLG1GQUFtRjs0QkFDbkYsWUFBWSxFQUFFLFNBQVMsQ0FBQyxJQUFJO3lCQUM3QixDQUFDLENBQUM7b0JBQ0wsQ0FBQyxDQUFDO2dCQUNKLENBQUM7YUFDRixDQUNGLENBQUM7UUFDSixDQUFDO0tBQ0YsQ0FDSyxDQUFDO0FBQ1gsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUNyR0Qsd0NBS0M7QUFYRCwySUFBK0Q7QUFHL0Q7O0dBRUc7QUFDSCxTQUFnQixjQUFjLENBQUMsT0FBeUI7SUFDdEQsTUFBTSxLQUFLLEdBQUksZ0RBQXdCLEdBQVUsRUFBRSxpQkFBa0QsQ0FBQztJQUN0RyxJQUFJLENBQUMsS0FBSztRQUFFLE9BQU87SUFDbkIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDWEQsOElBQXlEO0FBQ3pELCtIQUFpRDtBQUVqRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQWEsT0FBTztJQVVsQjtRQUNFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDaEQsTUFBTSxLQUFLLEdBQUcsc0NBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDMUMsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3RCLGtDQUFjLEVBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0RCxDQUFDO1lBQ0QsNkRBQTZEO1lBQzdELGFBQWE7WUFDYixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2Qiw2REFBNkQ7WUFDN0QsYUFBYTtZQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsNkJBQTZCO1FBQzdCLGtDQUFjLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsSUFBSSxDQUNGLFdBQWlGLEVBQ2pGLFVBQW1GO1FBRW5GLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3BELENBQUM7Q0FDRjtBQWpDRCwwQkFpQ0M7Ozs7Ozs7Ozs7Ozs7OztBQ2dCRCxvREFFQztBQWpERCxpRUFBaUU7QUFDakUscUZBQXFGO0FBQ3hFLHlCQUFpQixHQUF5QixVQUFrQixDQUFDLGlCQUFpQixJQUFJO0NBQVEsQ0FBQztBQUV4RyxNQUFhLFdBQVc7SUFXdEIsWUFBWSxPQUEyQjtRQUNyQyxJQUFJLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsR0FBRyxDQUFJLEVBQW9CO1FBQ3pCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLE9BQU87UUFDWixPQUFPLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQsdURBQXVEO0lBQ3ZELE1BQU0sQ0FBQyxjQUFjLENBQUksRUFBVSxFQUFFLElBQVksRUFBRSxFQUFvQjtRQUNyRSxPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7Q0FDRjtBQXBDRCxrQ0FvQ0M7QUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLHlCQUFpQixFQUFlLENBQUM7QUFFckQ7O0dBRUc7QUFDSCxTQUFnQixvQkFBb0I7SUFDbEMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BCLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FDeENELGtDQThEQztBQXdCRCxnQ0FFQztBQUtELDRCQXlDQztBQVFELGdEQWNDO0FBT0Qsb0RBaUJDO0FBRUQsMEJBTUM7QUF0TkQ7Ozs7R0FJRztBQUNILGlIQUF1RDtBQUN2RCwrSUFBMEU7QUFFMUUsOElBQXNEO0FBQ3RELDRIQUFzRDtBQUd0RCxtSEFBd0M7QUFDeEMsMklBQXdFO0FBS3hFLE1BQU0sTUFBTSxHQUFHLFVBQWlCLENBQUM7QUFDakMsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztBQUVyQzs7OztHQUlHO0FBQ0gsU0FBZ0IsV0FBVyxDQUFDLE9BQXNDO0lBQ2hFLE1BQU0sU0FBUyxHQUFHLElBQUkscUJBQVMsQ0FBQztRQUM5QixHQUFHLE9BQU87UUFDVixJQUFJLEVBQUUsYUFBYSxDQUFDO1lBQ2xCLEdBQUcsT0FBTyxDQUFDLElBQUk7WUFDZixNQUFNLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxZQUFZLENBQUMsR0FBRyxFQUFFO1NBQzFELENBQUM7S0FDSCxDQUFDLENBQUM7SUFDSCwrRUFBK0U7SUFDL0UsaUhBQWlIO0lBQ2pILG1DQUFtQztJQUNuQywyQ0FBbUIsRUFBQyxTQUFTLENBQUMsQ0FBQztJQUUvQix3Q0FBd0M7SUFDeEMsaUVBQWlFO0lBQ2pFLE1BQU0sc0JBQXNCLEdBQUcsMEZBQStELENBQUM7SUFDL0YsMkRBQTJEO0lBQzNELElBQUksc0JBQXNCLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbkMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLHNCQUFzQixDQUFDO0lBQ3RELENBQUM7SUFDRCx3Q0FBd0M7SUFDeEMsaUVBQWlFO0lBQ2pFLE1BQU0sc0JBQXNCLEdBQUcsMEZBQStELENBQUM7SUFDL0YsMkRBQTJEO0lBQzNELElBQUksc0JBQXNCLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbkMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLHNCQUFzQixDQUFDO0lBQ3RELENBQUM7SUFFRCxNQUFNLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUFFLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUNwRSxJQUFJLGVBQWUsS0FBSyxTQUFTLElBQUksa0JBQWtCLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDdEUsTUFBTSxJQUFJLDBCQUFpQixDQUFDLCtDQUErQyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVELE1BQU0sWUFBWSxHQUFHLGtCQUFrQixFQUFFLENBQUM7SUFDMUMsS0FBSyxNQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUMvQixNQUFNLE9BQU8sR0FBZ0MsR0FBRyxDQUFDLFlBQVksQ0FBQztRQUM5RCxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMxQixJQUFJLE9BQU8sT0FBTyxLQUFLLFVBQVUsRUFBRSxDQUFDO2dCQUNsQyxNQUFNLElBQUksU0FBUyxDQUFDLCtFQUErRSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2pILENBQUM7WUFDRCxNQUFNLFlBQVksR0FBRyxPQUFPLEVBQUUsQ0FBQztZQUMvQixTQUFTLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRSxTQUFTLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RSxTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRSxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU0sR0FBRyxHQUFHLGVBQWUsRUFBRSxDQUFDO0lBQzlCLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3BELE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXpDLElBQUksT0FBTyxVQUFVLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDckMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7SUFDbEMsQ0FBQztTQUFNLElBQUksT0FBTyxpQkFBaUIsS0FBSyxVQUFVLEVBQUUsQ0FBQztRQUNuRCxTQUFTLENBQUMsUUFBUSxHQUFHLGlCQUFpQixDQUFDO0lBQ3pDLENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTSxPQUFPLEdBQ1gsVUFBVSxLQUFLLFNBQVM7WUFDdEIsQ0FBQyxDQUFDLHFEQUFxRDtZQUN2RCxDQUFDLENBQUMsa0NBQWtDLE9BQU8sVUFBVSxHQUFHLENBQUM7UUFDN0QsTUFBTSxJQUFJLFNBQVMsQ0FBQywwQ0FBMEMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLE1BQU0sT0FBTyxFQUFFLENBQUMsQ0FBQztJQUM1RyxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyxhQUFhLENBQUksR0FBTTtJQUM5QixJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDM0MsUUFBUSxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUN0RCxLQUFLLE9BQU87Z0JBQ1YsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFFLEdBQXNCLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFNLENBQUM7WUFDckUsS0FBSyxNQUFNO2dCQUNULE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBc0IsQ0FBTSxDQUFDO1lBQy9DO2dCQUNFLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBTSxDQUFDO1FBQzlHLENBQUM7SUFDSCxDQUFDOztRQUFNLE9BQU8sR0FBRyxDQUFDO0FBQ3BCLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLFVBQVUsQ0FBQyxxQkFBc0U7SUFDL0Ysb0NBQVksR0FBRSxDQUFDLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDM0QsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLFVBQTJELEVBQUUsVUFBVSxHQUFHLENBQUM7SUFDbEcsTUFBTSxTQUFTLEdBQUcsb0NBQVksR0FBRSxDQUFDO0lBQ2pDLE1BQU0sU0FBUyxHQUFHLHNDQUFtQixFQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRTtRQUNyRywwRUFBMEU7UUFDMUUsaUVBQWlFO1FBQ2pFLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUEyRCxDQUFDO1FBRXBGLHdHQUF3RztRQUN4RyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssb0JBQW9CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRWpILEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7WUFDdkIsSUFBSSxHQUFHLENBQUMsT0FBTyxLQUFLLFNBQVM7Z0JBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1lBRXpGLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLE9BQU87Z0JBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLE9BQU8sWUFBWSxDQUFDLENBQUM7WUFFM0UsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFjLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUV0RSxJQUFJLEdBQUcsQ0FBQyxPQUFPLEtBQUssZUFBZTtnQkFBRSxvQkFBb0IsRUFBRSxDQUFDO1FBQzlELENBQUM7UUFFRCxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDckIsTUFBTSxZQUFZLEdBQW1FO2dCQUNuRixvQkFBb0I7Z0JBQ3BCLGdCQUFnQjtnQkFDaEIsVUFBVTtnQkFDVixnQkFBZ0I7Z0JBQ2hCLGtCQUFrQjthQUNuQixDQUFDO1lBQ0YsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDNUQsTUFBTSxJQUFJLFNBQVMsQ0FDakIsMEZBQTBGO29CQUN4RixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUNqRCxDQUFDO1lBQ0osQ0FBQztZQUVELFNBQVMsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMxQyxvQkFBb0IsRUFBRSxDQUFDO1FBQ3pCLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLGtCQUFrQjtJQUNoQyxNQUFNLFNBQVMsR0FBRyxvQ0FBWSxHQUFFLENBQUM7SUFDakMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDbEMsTUFBTSxTQUFTLEdBQUcsc0NBQW1CLEVBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hILE1BQU0sb0JBQW9CLEdBQUcsU0FBUyxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDNUQsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzVFLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hCLFNBQVMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxPQUFPO1FBQ0wsS0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSztRQUMzQixVQUFVLEVBQUUsRUFBRSxHQUFHLG9CQUFvQixFQUFFLFFBQVEsRUFBRTtLQUNsRCxDQUFDO0FBQ0osQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixvQkFBb0I7SUFDbEMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLFNBQVMsQ0FBQztRQUNSLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNuQyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksb0NBQVksR0FBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7WUFDckUsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztnQkFDZCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2YsWUFBWSxFQUFFLENBQUM7Z0JBQ2YscURBQXFEO2dCQUNyRCxvQ0FBWSxHQUFFLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQy9DLENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxhQUFhLEtBQUssWUFBWSxFQUFFLENBQUM7WUFDbkMsTUFBTTtRQUNSLENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQUVELFNBQWdCLE9BQU87SUFDckIsTUFBTSxPQUFPLEdBQUcsc0NBQW1CLEVBQUMsb0NBQVksR0FBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQy9GLHVDQUFjLEdBQUUsQ0FBQztRQUNqQix1Q0FBb0IsR0FBRSxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2QsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDdEpELDhEQVVDO0FBaURELHNCQVlDO0FBbUlELDRDQWlCQztBQU1ELHNEQThDQztBQW9NRCwwQ0FtQkM7QUFZRCxvREFtQkM7QUFZRCw4REErREM7QUEwREQsZ0NBNkNDO0FBd0RELG9DQXdCQztBQWdDRCxvQ0FHQztBQVFELDhDQUdDO0FBS0QsOENBRUM7QUFTRCxzREFxQ0M7QUFtQkQsc0NBRUM7QUFRRCxzQkFtQkM7QUFtQkQsMEJBS0M7QUFtQkQsd0NBS0M7QUFnQkQsOEJBZ0JDO0FBcUNELG9DQU9DO0FBUUQsb0NBT0M7QUFRRCxrQ0FPQztBQTZHRCxnQ0E4Q0M7QUFXRCwwREFZQztBQStCRCx3REF3QkM7QUFzQ0QsZ0NBOEJDO0FBY0Qsa0RBR0M7QUFsN0NELGlIQXNCNEI7QUFDNUIsNktBQXdGO0FBQ3hGLHVIQUEyRztBQUMzRywrSUFBMEU7QUFFMUUsOElBQXNGO0FBQ3RGLDRIQUE2QztBQVE3QyxzSEFnQnNCO0FBQ3RCLDBHQUFrRDtBQUNsRCwySUFBK0Y7QUFDL0YsK0hBQWlEO0FBR2pELDhCQUE4QjtBQUM5QixvREFBMkIsRUFBQyxLQUFLLENBQUMsQ0FBQztBQUVuQzs7R0FFRztBQUNILFNBQWdCLHlCQUF5QixDQUN2QyxJQUErQztJQUUvQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztJQUMzQyxPQUFPO1FBQ0wsVUFBVSxFQUFFLFVBQVUsSUFBSSxLQUFLLEVBQUU7UUFDakMsSUFBSSxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBYztRQUMvQixnQkFBZ0IsRUFBRSwwQ0FBNkIsQ0FBQywyQkFBMkI7UUFDM0UsR0FBRyxJQUFJO0tBQ1IsQ0FBQztBQUNKLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsS0FBaUI7SUFDekMsTUFBTSxTQUFTLEdBQUcsb0NBQVksR0FBRSxDQUFDO0lBQ2pDLE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDM0MsTUFBTSxLQUFLLEdBQUcsc0NBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUMsSUFBSSxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUM5QixrQ0FBYyxFQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDcEQsT0FBTztRQUNULENBQUM7UUFDRCxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN0QixrQ0FBYyxFQUNaLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ25ELE9BQU8sQ0FBQyxzQ0FBc0M7Z0JBQ2hELENBQUM7Z0JBQ0QsU0FBUyxDQUFDLFdBQVcsQ0FBQztvQkFDcEIsV0FBVyxFQUFFO3dCQUNYLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztxQkFDZjtpQkFDRixDQUFDLENBQUM7Z0JBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQ0gsQ0FBQztRQUNKLENBQUM7UUFDRCxTQUFTLENBQUMsV0FBVyxDQUFDO1lBQ3BCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7Z0JBQ2Qsa0JBQWtCLEVBQUUsaUJBQU0sRUFBQyxLQUFLLENBQUMsVUFBVSxDQUFDO2FBQzdDO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDekMsT0FBTztZQUNQLE1BQU07U0FDUCxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLEVBQVk7SUFDaEMsTUFBTSxTQUFTLEdBQUcsK0NBQXVCLEVBQUMsZ0VBQWdFLENBQUMsQ0FBQztJQUM1RyxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBRXZDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLHFCQUFVLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUUvQyxNQUFNLE9BQU8sR0FBRyxzQ0FBbUIsRUFBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUVyRyxPQUFPLE9BQU8sQ0FBQztRQUNiLFVBQVU7UUFDVixHQUFHO0tBQ0osQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsdUJBQXVCLENBQUMsT0FBd0I7SUFDdkQsSUFBSSxPQUFPLENBQUMsc0JBQXNCLEtBQUssU0FBUyxJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUM5RixNQUFNLElBQUksU0FBUyxDQUFDLCtEQUErRCxDQUFDLENBQUM7SUFDdkYsQ0FBQztBQUNILENBQUM7QUFFRCxtREFBbUQ7QUFDbkQsTUFBTSw0QkFBNEIsR0FBRyx1QkFBdUIsQ0FBQztBQUU3RDs7R0FFRztBQUNILFNBQVMsMkJBQTJCLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFpQjtJQUMvRixNQUFNLFNBQVMsR0FBRyxvQ0FBWSxHQUFFLENBQUM7SUFDakMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLEtBQUssR0FBRyxzQ0FBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMxQyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzlCLGtDQUFjLEVBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNwRCxPQUFPO1FBQ1QsQ0FBQztRQUNELElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3RCLGtDQUFjLEVBQ1osS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO2dCQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzdDLE9BQU8sQ0FBQyxzQ0FBc0M7Z0JBQ2hELENBQUM7Z0JBQ0QsU0FBUyxDQUFDLFdBQVcsQ0FBQztvQkFDcEIscUJBQXFCLEVBQUU7d0JBQ3JCLEdBQUc7cUJBQ0o7aUJBQ0YsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQ0gsQ0FBQztRQUNKLENBQUM7UUFDRCxTQUFTLENBQUMsV0FBVyxDQUFDO1lBQ3BCLGdCQUFnQixFQUFFO2dCQUNoQixHQUFHO2dCQUNILFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxJQUFJLEdBQUcsR0FBRyxFQUFFO2dCQUMxQyxZQUFZO2dCQUNaLFNBQVMsRUFBRSx1QkFBVSxFQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLElBQUksQ0FBQztnQkFDMUQsV0FBVyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLCtCQUFrQixFQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDMUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTO2dCQUN4RCxnQkFBZ0IsRUFBRSx5QkFBYyxFQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDMUQsc0JBQXNCLEVBQUUseUJBQWMsRUFBQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7Z0JBQ3RFLG1CQUFtQixFQUFFLHlCQUFjLEVBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDO2dCQUNoRSxzQkFBc0IsRUFBRSx5QkFBYyxFQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztnQkFDdEUsT0FBTztnQkFDUCxnQkFBZ0IsRUFBRSwyQ0FBOEIsRUFBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDO2dCQUMxRCxnQkFBZ0IsRUFBRSxvREFBdUIsRUFBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7YUFDcEU7U0FDRixDQUFDLENBQUM7UUFDSCxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ3RDLE9BQU87WUFDUCxNQUFNO1NBQ1AsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxLQUFLLFVBQVUsZ0NBQWdDLENBQUMsRUFDOUMsT0FBTyxFQUNQLElBQUksRUFDSixPQUFPLEVBQ1AsR0FBRyxFQUNILFlBQVksRUFDWixPQUFPLEVBQ1Asb0JBQW9CLEdBQ0Q7SUFDbkIsTUFBTSxTQUFTLEdBQUcsb0NBQVksR0FBRSxDQUFDO0lBQ2pDLDhFQUE4RTtJQUM5RSwrRkFBK0Y7SUFDL0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztRQUMvRixNQUFNLElBQUksY0FBYyxDQUFDLDJCQUEyQixZQUFZLDRCQUE0QixDQUFDLENBQUM7SUFDaEcsQ0FBQztJQUNELDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXRDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckMsTUFBTSxLQUFLLEdBQUcsc0NBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUMsSUFBSSxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUM5QixrQ0FBYyxFQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDcEQsT0FBTztRQUNULENBQUM7UUFDRCxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN0QixrQ0FBYyxFQUNaLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUM3QyxPQUFPLENBQUMsc0NBQXNDO2dCQUNoRCxDQUFDO2dCQUNELFNBQVMsQ0FBQyxXQUFXLENBQUM7b0JBQ3BCLDBCQUEwQixFQUFFO3dCQUMxQixHQUFHO3FCQUNKO2lCQUNGLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUNILENBQUM7UUFDSixDQUFDO1FBQ0QsU0FBUyxDQUFDLFdBQVcsQ0FBQztZQUNwQixxQkFBcUIsRUFBRTtnQkFDckIsR0FBRztnQkFDSCxPQUFPO2dCQUNQLG9CQUFvQjtnQkFDcEIscURBQXFEO2dCQUNyRCxVQUFVLEVBQUUsR0FBRyxHQUFHLEVBQUU7Z0JBQ3BCLFlBQVk7Z0JBQ1osU0FBUyxFQUFFLHVCQUFVLEVBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxDQUFDO2dCQUMxRCxXQUFXLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsK0JBQWtCLEVBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2dCQUMxRSxzQkFBc0IsRUFBRSx5QkFBYyxFQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztnQkFDdEUsbUJBQW1CLEVBQUUseUJBQWMsRUFBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7Z0JBQ2hFLHNCQUFzQixFQUFFLHlCQUFjLEVBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDO2dCQUN0RSxtQkFBbUIsRUFBRSx5QkFBYyxFQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztnQkFDaEUsT0FBTztnQkFDUCxnQkFBZ0IsRUFBRSwyQ0FBOEIsRUFBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7YUFDM0U7U0FDRixDQUFDLENBQUM7UUFDSCxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ3RDLE9BQU87WUFDUCxNQUFNO1NBQ1AsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQUksWUFBb0IsRUFBRSxJQUFXLEVBQUUsT0FBd0I7SUFDN0YsTUFBTSxTQUFTLEdBQUcsK0NBQXVCLEVBQ3ZDLDJFQUEyRSxDQUM1RSxDQUFDO0lBQ0YsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDMUIsTUFBTSxJQUFJLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFDRCxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzFDLE1BQU0sT0FBTyxHQUFHLHNDQUFtQixFQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFFLDJCQUEyQixDQUFDLENBQUM7SUFFdEgsT0FBTyxPQUFPLENBQUM7UUFDYixZQUFZO1FBQ1osT0FBTyxFQUFFLEVBQUU7UUFDWCxPQUFPO1FBQ1AsSUFBSTtRQUNKLEdBQUc7S0FDSixDQUFlLENBQUM7QUFDbkIsQ0FBQztBQUVEOzs7R0FHRztBQUNJLEtBQUssVUFBVSxxQkFBcUIsQ0FDekMsWUFBb0IsRUFDcEIsSUFBVyxFQUNYLE9BQTZCO0lBRTdCLE1BQU0sU0FBUyxHQUFHLCtDQUF1QixFQUN2QyxnRkFBZ0YsQ0FDakYsQ0FBQztJQUNGLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzFCLE1BQU0sSUFBSSxTQUFTLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLElBQUksb0JBQW9CLEdBQUcsU0FBUyxDQUFDO0lBRXJDLFNBQVMsQ0FBQztRQUNSLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUMsTUFBTSxPQUFPLEdBQUcsc0NBQW1CLEVBQ2pDLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUMvQix1QkFBdUIsRUFDdkIsZ0NBQWdDLENBQ2pDLENBQUM7UUFFRixJQUFJLENBQUM7WUFDSCxPQUFPLENBQUMsTUFBTSxPQUFPLENBQUM7Z0JBQ3BCLFlBQVk7Z0JBQ1osT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsT0FBTztnQkFDUCxJQUFJO2dCQUNKLEdBQUc7Z0JBQ0gsT0FBTztnQkFDUCxvQkFBb0I7YUFDckIsQ0FBQyxDQUFlLENBQUM7UUFDcEIsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDYixJQUFJLEdBQUcsWUFBWSwrQkFBc0IsRUFBRSxDQUFDO2dCQUMxQyxNQUFNLEtBQUssQ0FBQyx5QkFBYyxFQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDNUUsSUFBSSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUM1QyxNQUFNLElBQUksU0FBUyxDQUFDLDhCQUE4QixDQUFDLENBQUM7Z0JBQ3RELENBQUM7Z0JBQ0QsT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO2dCQUM5QixvQkFBb0IsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLG9CQUFvQixJQUFJLFNBQVMsQ0FBQztZQUN2RSxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sTUFBTSxHQUFHLENBQUM7WUFDWixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxzQ0FBc0MsQ0FBQyxFQUM5QyxPQUFPLEVBQ1AsT0FBTyxFQUNQLFlBQVksRUFDWixHQUFHLEdBQzhCO0lBQ2pDLE1BQU0sU0FBUyxHQUFHLG9DQUFZLEdBQUUsQ0FBQztJQUNqQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxJQUFJLEtBQUssRUFBRSxDQUFDO0lBQ2pELE1BQU0sWUFBWSxHQUFHLElBQUksT0FBTyxDQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQzNELE1BQU0sS0FBSyxHQUFHLHNDQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFDLElBQUksS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDOUIsa0NBQWMsRUFBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3BELE9BQU87UUFDVCxDQUFDO1FBQ0QsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdEIsa0NBQWMsRUFDWixLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQy9CLE1BQU0sUUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRXZFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDZCxTQUFTLENBQUMsV0FBVyxDQUFDO3dCQUNwQiw0QkFBNEIsRUFBRSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtxQkFDeEQsQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsOEJBQThCO1lBQ2hDLENBQUMsQ0FBQyxDQUNILENBQUM7UUFDSixDQUFDO1FBQ0QsU0FBUyxDQUFDLFdBQVcsQ0FBQztZQUNwQiwyQkFBMkIsRUFBRTtnQkFDM0IsR0FBRztnQkFDSCxVQUFVO2dCQUNWLFlBQVk7Z0JBQ1osS0FBSyxFQUFFLHVCQUFVLEVBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztnQkFDOUQsV0FBVyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLCtCQUFrQixFQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDMUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTO2dCQUN4RCx3QkFBd0IsRUFBRSx5QkFBYyxFQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQztnQkFDMUUsa0JBQWtCLEVBQUUseUJBQWMsRUFBQyxPQUFPLENBQUMsa0JBQWtCLENBQUM7Z0JBQzlELG1CQUFtQixFQUFFLHlCQUFjLEVBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDO2dCQUNoRSxTQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsbUJBQW1CO2dCQUN4RCxPQUFPO2dCQUNQLGdCQUFnQixFQUFFLG9EQUFtQyxFQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDL0UscUJBQXFCLEVBQUUsd0NBQTJCLEVBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDO2dCQUNqRixpQkFBaUIsRUFBRSx3Q0FBdUIsRUFBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7Z0JBQ3JFLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTtnQkFDbEMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGdCQUFnQjtvQkFDeEMsQ0FBQyxDQUFDLDBCQUFhLEVBQUMsd0NBQStCLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixDQUFDO29CQUMxRSxDQUFDLENBQUMsU0FBUztnQkFDYixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSwwQkFBYSxFQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUM3RSxnQkFBZ0IsRUFBRSxvREFBdUIsRUFBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7YUFDcEU7U0FDRixDQUFDLENBQUM7UUFDSCxTQUFTLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDaEQsT0FBTztZQUNQLE1BQU07U0FDUCxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILGlGQUFpRjtJQUNqRiw0RUFBNEU7SUFDNUUsTUFBTSxlQUFlLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDdEQseURBQXlEO1FBQ3pELGtDQUFjLEVBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzNDLFNBQVMsQ0FBQyxXQUFXLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNuRCxPQUFPO1lBQ1AsTUFBTTtTQUNQLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsa0NBQWMsRUFBQyxZQUFZLENBQUMsQ0FBQztJQUM3QixrQ0FBYyxFQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2hDLDBFQUEwRTtJQUMxRSxrQ0FBYyxFQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUN2RCxNQUFNLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBc0MsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEgsa0NBQWMsRUFBQyxHQUFHLENBQUMsQ0FBQztJQUNwQixPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLHlCQUF5QixDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBdUI7SUFDaEcsTUFBTSxTQUFTLEdBQUcsb0NBQVksR0FBRSxDQUFDO0lBQ2pDLE9BQU8sSUFBSSxPQUFPLENBQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDMUMsTUFBTSxLQUFLLEdBQUcsc0NBQWlCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUMsSUFBSSxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUM5QixrQ0FBYyxFQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDcEQsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN0QixrQ0FBYyxFQUNaLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNuRCxPQUFPO2dCQUNULENBQUM7Z0JBQ0QsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFLG9CQUFvQixFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNELENBQUMsQ0FBQyxDQUNILENBQUM7UUFDSixDQUFDO1FBQ0QsU0FBUyxDQUFDLFdBQVcsQ0FBQztZQUNwQiwrQkFBK0IsRUFBRTtnQkFDL0IsR0FBRztnQkFDSCxJQUFJLEVBQUUsdUJBQVUsRUFBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxJQUFJLENBQUM7Z0JBQ3JELE9BQU87Z0JBQ1AsVUFBVTtnQkFDVixHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVO29CQUM1QixDQUFDLENBQUM7d0JBQ0UsaUJBQWlCLEVBQUU7NEJBQ2pCLFNBQVMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVM7NEJBQ25DLEdBQUcsTUFBTSxDQUFDLGlCQUFpQjt5QkFDNUI7cUJBQ0Y7b0JBQ0gsQ0FBQyxDQUFDO3dCQUNFLGVBQWUsRUFBRSxNQUFNLENBQUMsZUFBZTtxQkFDeEMsQ0FBQzthQUNQO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsU0FBUyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNVLDJCQUFtQixHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQztBQThCbkY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQ0c7QUFDSCxTQUFnQixlQUFlLENBQXdCLE9BQXdCO0lBQzdFLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzFCLE1BQU0sSUFBSSxTQUFTLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBQ0QsNERBQTREO0lBQzVELHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pDLE9BQU8sSUFBSSxLQUFLLENBQ2QsRUFBRSxFQUNGO1FBQ0UsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFZO1lBQ2pCLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ3JDLE1BQU0sSUFBSSxTQUFTLENBQUMsdURBQXVELE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckcsQ0FBQztZQUNELE9BQU8sU0FBUyxxQkFBcUIsQ0FBQyxHQUFHLElBQWU7Z0JBQ3RELE9BQU8sZ0JBQWdCLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN2RCxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0YsQ0FDSyxDQUFDO0FBQ1gsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILFNBQWdCLG9CQUFvQixDQUF3QixPQUE2QjtJQUN2RixJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUMxQixNQUFNLElBQUksU0FBUyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDakQsQ0FBQztJQUNELDREQUE0RDtJQUM1RCw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0QyxPQUFPLElBQUksS0FBSyxDQUNkLEVBQUUsRUFDRjtRQUNFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsWUFBWTtZQUNqQixJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUNyQyxNQUFNLElBQUksU0FBUyxDQUFDLHVEQUF1RCxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JHLENBQUM7WUFDRCxPQUFPLFNBQVMsMEJBQTBCLENBQUMsR0FBRyxJQUFlO2dCQUMzRCxPQUFPLHFCQUFxQixDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDNUQsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNGLENBQ0ssQ0FBQztBQUNYLENBQUM7QUFFRCw0REFBNEQ7QUFDNUQsTUFBTSx3QkFBd0IsR0FBRyw2REFBNkQsQ0FBQztBQUMvRiwrRkFBK0Y7QUFDL0Ysb0dBQW9HO0FBQ3BHLE1BQU0saUJBQWlCLEdBQUcsK0JBQStCLENBQUM7QUFFMUQ7OztHQUdHO0FBQ0gsU0FBZ0IseUJBQXlCLENBQUMsVUFBa0IsRUFBRSxLQUFjO0lBQzFFLE1BQU0sU0FBUyxHQUFHLCtDQUF1QixFQUN2Qyw2SUFBNkksQ0FDOUksQ0FBQztJQUNGLE9BQU87UUFDTCxVQUFVO1FBQ1YsS0FBSztRQUNMLE1BQU07WUFDSixPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUMzQyxtRUFBbUU7Z0JBQ25FLG9FQUFvRTtnQkFDcEUsd0VBQXdFO2dCQUN4RSxZQUFZO2dCQUNaLEVBQUU7Z0JBQ0Ysa0VBQWtFO2dCQUNsRSxzQ0FBc0M7Z0JBQ3RDLE1BQU0sS0FBSyxHQUFHLHNDQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMxQyxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDdEIsa0NBQWMsRUFDWixLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO3dCQUNsQyxJQUFJLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUM7NEJBQ3RDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDZCxDQUFDO29CQUNILENBQUMsQ0FBQyxDQUNILENBQUM7Z0JBQ0osQ0FBQztnQkFDRCxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO29CQUM5QixJQUFJLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUM7d0JBQ3RDLE9BQU87b0JBQ1QsQ0FBQztnQkFDSCxDQUFDO2dCQUVELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ2hELFNBQVMsQ0FBQyxXQUFXLENBQUM7b0JBQ3BCLHNDQUFzQyxFQUFFO3dCQUN0QyxHQUFHO3dCQUNILGlCQUFpQixFQUFFOzRCQUNqQixTQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTOzRCQUNuQyxVQUFVOzRCQUNWLEtBQUs7eUJBQ047cUJBQ0Y7aUJBQ0YsQ0FBQyxDQUFDO2dCQUNILFNBQVMsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNyRSxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRCxNQUFNLENBQXFCLEdBQW9DLEVBQUUsR0FBRyxJQUFVO1lBQzVFLE9BQU8sc0NBQW1CLEVBQ3hCLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUMvQixnQkFBZ0IsRUFDaEIseUJBQXlCLENBQzFCLENBQUM7Z0JBQ0EsR0FBRyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFO2dCQUN4QyxVQUFVLEVBQUUsT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJO2dCQUNwRCxJQUFJO2dCQUNKLE1BQU0sRUFBRTtvQkFDTixJQUFJLEVBQUUsVUFBVTtvQkFDaEIsaUJBQWlCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFO2lCQUN6QztnQkFDRCxPQUFPLEVBQUUsRUFBRTthQUNaLENBQUMsQ0FBQztRQUNMLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQTBETSxLQUFLLFVBQVUsVUFBVSxDQUM5QixrQkFBOEIsRUFDOUIsT0FBbUQ7SUFFbkQsTUFBTSxTQUFTLEdBQUcsK0NBQXVCLEVBQ3ZDLDBIQUEwSCxDQUMzSCxDQUFDO0lBQ0YsTUFBTSxtQkFBbUIsR0FBRyx5QkFBeUIsQ0FBQyxPQUFPLElBQUssRUFBVSxDQUFDLENBQUM7SUFDOUUsTUFBTSxZQUFZLEdBQUcsZ0NBQW1CLEVBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUM3RCxNQUFNLE9BQU8sR0FBRyxzQ0FBbUIsRUFDakMsU0FBUyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQy9CLDZCQUE2QixFQUM3QixzQ0FBc0MsQ0FDdkMsQ0FBQztJQUNGLE1BQU0sQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUM7UUFDekMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFO1FBQ3ZDLE9BQU8sRUFBRSxtQkFBbUI7UUFDNUIsT0FBTyxFQUFFLEVBQUU7UUFDWCxZQUFZO0tBQ2IsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLE9BQU8sQ0FBQztJQUUxQyxPQUFPO1FBQ0wsVUFBVSxFQUFFLG1CQUFtQixDQUFDLFVBQVU7UUFDMUMsbUJBQW1CO1FBQ25CLEtBQUssQ0FBQyxNQUFNO1lBQ1YsT0FBTyxDQUFDLE1BQU0sU0FBUyxDQUFRLENBQUM7UUFDbEMsQ0FBQztRQUNELEtBQUssQ0FBQyxNQUFNLENBQXFCLEdBQW9DLEVBQUUsR0FBRyxJQUFVO1lBQ2xGLE9BQU8sc0NBQW1CLEVBQ3hCLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUMvQixnQkFBZ0IsRUFDaEIseUJBQXlCLENBQzFCLENBQUM7Z0JBQ0EsR0FBRyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFO2dCQUN4QyxVQUFVLEVBQUUsT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJO2dCQUNwRCxJQUFJO2dCQUNKLE1BQU0sRUFBRTtvQkFDTixJQUFJLEVBQUUsT0FBTztvQkFDYixlQUFlLEVBQUUsbUJBQW1CLENBQUMsVUFBVTtpQkFDaEQ7Z0JBQ0QsT0FBTyxFQUFFLEVBQUU7YUFDWixDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUF3RE0sS0FBSyxVQUFVLFlBQVksQ0FDaEMsa0JBQThCLEVBQzlCLE9BQW1EO0lBRW5ELE1BQU0sU0FBUyxHQUFHLCtDQUF1QixFQUN2Qyw2SEFBNkgsQ0FDOUgsQ0FBQztJQUNGLE1BQU0sbUJBQW1CLEdBQUcseUJBQXlCLENBQUMsT0FBTyxJQUFLLEVBQVUsQ0FBQyxDQUFDO0lBQzlFLE1BQU0sWUFBWSxHQUFHLGdDQUFtQixFQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDN0QsTUFBTSxPQUFPLEdBQUcsc0NBQW1CLEVBQ2pDLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUMvQiw2QkFBNkIsRUFDN0Isc0NBQXNDLENBQ3ZDLENBQUM7SUFDRixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUM7UUFDMUIsR0FBRyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFO1FBQ3ZDLE9BQU8sRUFBRSxtQkFBbUI7UUFDNUIsT0FBTyxFQUFFLEVBQUU7UUFDWCxZQUFZO0tBQ2IsQ0FBQyxDQUFDO0lBQ0gsa0NBQWMsRUFBQyxXQUFXLENBQUMsQ0FBQztJQUM1QixNQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDaEYsa0NBQWMsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pDLE9BQU8sZ0JBQWdDLENBQUM7QUFDMUMsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTZCRztBQUNILFNBQWdCLFlBQVk7SUFDMUIsTUFBTSxTQUFTLEdBQUcsK0NBQXVCLEVBQUMsd0VBQXdFLENBQUMsQ0FBQztJQUNwSCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDeEIsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsaUJBQWlCO0lBQy9CLCtDQUF1QixFQUFDLDZFQUE2RSxDQUFDLENBQUM7SUFDdkcsT0FBTywwQkFBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQy9CLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLGlCQUFpQjtJQUMvQixPQUFPLHlDQUFpQixHQUFFLEtBQUssU0FBUyxDQUFDO0FBQzNDLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixxQkFBcUIsQ0FDbkMsT0FBOEI7SUFFOUIsTUFBTSxTQUFTLEdBQUcsK0NBQXVCLEVBQ3ZDLGlIQUFpSCxDQUNsSCxDQUFDO0lBQ0YsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztJQUM1QixNQUFNLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFDM0QsTUFBTSxlQUFlLEdBQUc7UUFDdEIsWUFBWSxFQUFFLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWTtRQUMvQyxTQUFTLEVBQUUsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTO1FBQ3RDLEdBQUcsSUFBSTtLQUNSLENBQUM7SUFFRixPQUFPLENBQUMsR0FBRyxJQUFtQixFQUFrQixFQUFFO1FBQ2hELE1BQU0sRUFBRSxHQUFHLHNDQUFtQixFQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDL0YsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsS0FBSyxDQUFDO1lBQ3pDLE1BQU0sSUFBSSwwQkFBYSxDQUFDO2dCQUN0QixZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7Z0JBQ2xDLFNBQVMsRUFBRSx1QkFBVSxFQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLElBQUksQ0FBQztnQkFDMUQsT0FBTztnQkFDUCxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7Z0JBQzVCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxJQUFJLDBCQUFhLEVBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQzdFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxnQkFBZ0I7b0JBQ3hDLENBQUMsQ0FBQywwQkFBYSxFQUFDLHdDQUErQixFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDMUUsQ0FBQyxDQUFDLFNBQVM7Z0JBQ2Isa0JBQWtCLEVBQUUseUJBQWMsRUFBQyxPQUFPLENBQUMsa0JBQWtCLENBQUM7Z0JBQzlELG1CQUFtQixFQUFFLHlCQUFjLEVBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDO2dCQUNoRSxnQkFBZ0IsRUFBRSxvREFBdUIsRUFBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7YUFDcEUsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEVBQUUsQ0FBQztZQUNSLElBQUk7WUFDSixPQUFPLEVBQUUsRUFBRTtZQUNYLE9BQU8sRUFBRSxlQUFlO1NBQ3pCLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILFNBQWdCLGFBQWEsQ0FBcUIsR0FBRyxJQUFtQjtJQUN0RSxPQUFPLHFCQUFxQixFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixLQUFLO0lBQ25CLG1HQUFtRztJQUNuRyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNyRSwyQ0FBMkM7SUFDM0MsTUFBTSxJQUFJLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMvQyxpQ0FBaUM7SUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDeEQsaURBQWlEO0lBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNsRCx1RUFBdUU7SUFDdkUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ25ELHlEQUF5RDtJQUN6RCxPQUFPLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUM5RixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUNqQixDQUFDLENBQ0YsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQy9ELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILFNBQWdCLE9BQU8sQ0FBQyxPQUFlO0lBQ3JDLE1BQU0sU0FBUyxHQUFHLCtDQUF1QixFQUN2Qyw2RkFBNkYsQ0FDOUYsQ0FBQztJQUNGLE9BQU8sU0FBUyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsU0FBZ0IsY0FBYyxDQUFDLE9BQWU7SUFDNUMsTUFBTSxTQUFTLEdBQUcsK0NBQXVCLEVBQ3ZDLDZGQUE2RixDQUM5RixDQUFDO0lBQ0YsU0FBUyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQWdCTSxLQUFLLFVBQVUsU0FBUyxDQUFDLEVBQWlCLEVBQUUsT0FBa0I7SUFDbkUsK0NBQXVCLEVBQUMscUVBQXFFLENBQUMsQ0FBQztJQUMvRiw2RkFBNkY7SUFDN0YsSUFBSSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztRQUNqRCxPQUFPLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBQ0QsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDL0QsT0FBTyxzQ0FBaUIsQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDOUMsSUFBSSxDQUFDO2dCQUNILE9BQU8sTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRyxDQUFDO29CQUFTLENBQUM7Z0JBQ1Qsc0NBQWlCLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNELE9BQU8sY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxFQUFpQjtJQUN2QyxNQUFNLFNBQVMsR0FBRyxvQ0FBWSxHQUFFLENBQUM7SUFDakMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLEtBQUssR0FBRyxzQ0FBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMxQyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzlCLGtDQUFjLEVBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNwRCxPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0MsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdEIsa0NBQWMsRUFDWixLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNsQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FDSCxDQUFDO1FBQ0osQ0FBQztRQUVELG1CQUFtQjtRQUNuQixJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDVCxPQUFPLEVBQUUsQ0FBQztZQUNWLE9BQU87UUFDVCxDQUFDO1FBRUQsU0FBUyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN4RCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLFlBQVksQ0FDMUIsSUFBVTtJQUVWLE9BQU87UUFDTCxJQUFJLEVBQUUsUUFBUTtRQUNkLElBQUk7S0FDZ0MsQ0FBQztBQUN6QyxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixZQUFZLENBQzFCLElBQVU7SUFFVixPQUFPO1FBQ0wsSUFBSSxFQUFFLFFBQVE7UUFDZCxJQUFJO0tBQzJCLENBQUM7QUFDcEMsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsV0FBVyxDQUN6QixJQUFVO0lBRVYsT0FBTztRQUNMLElBQUksRUFBRSxPQUFPO1FBQ2IsSUFBSTtLQUMrQixDQUFDO0FBQ3hDLENBQUM7QUEyQkQsZ0ZBQWdGO0FBQ2hGLGFBQWE7QUFDYixFQUFFO0FBQ0YsK0VBQStFO0FBQy9FLHdEQUF3RDtBQUN4RCxFQUFFO0FBQ0YsK0VBQStFO0FBQy9FLEVBQUU7QUFDRiw0RUFBNEU7QUFDNUUsMEVBQTBFO0FBQzFFLGdGQUFnRjtBQUNoRixpRUFBaUU7QUFDakUsRUFBRTtBQUNGLGdGQUFnRjtBQUNoRiwwRUFBMEU7QUFDMUUsNkVBQTZFO0FBQzdFLCtFQUErRTtBQUMvRSw0RUFBNEU7QUFDNUUsNEVBQTRFO0FBQzVFLG9CQUFvQjtBQUNwQixFQUFFO0FBQ0YsMEVBQTBFO0FBQzFFLDRDQUE0QztBQUM1QyxFQUFFO0FBQ0Ysc0VBQXNFO0FBQ3RFLEVBQUU7QUFDRixtREFBbUQ7QUFDbkQsRUFBRTtBQUNGLDRFQUE0RTtBQUM1RSxnRkFBZ0Y7QUFDaEYsZ0ZBQWdGO0FBQ2hGLGtFQUFrRTtBQUNsRSxFQUFFO0FBQ0YsMEVBQTBFO0FBQzFFLGdGQUFnRjtBQUNoRixzRUFBc0U7QUFDdEUsdUVBQXVFO0FBQ3ZFLGdDQUFnQztBQUNoQyxFQUFFO0FBQ0YsOEVBQThFO0FBQzlFLEVBQUU7QUFDRiw2RUFBNkU7QUFDN0UsK0VBQStFO0FBQy9FLGdGQUFnRjtBQUNoRiw4RUFBOEU7QUFDOUUseUVBQXlFO0FBQ3pFLEVBQUU7QUFDRiwwRUFBMEU7QUFDMUUsNEVBQTRFO0FBQzVFLGdGQUFnRjtBQUNoRiw0RUFBNEU7QUFDNUUsOEVBQThFO0FBQzlFLCtFQUErRTtBQUMvRSw0RUFBNEU7QUFDNUUsOEVBQThFO0FBQzlFLHlFQUF5RTtBQUN6RSw4RUFBOEU7QUFDOUUsWUFBWTtBQUNaLEVBQUU7QUFDRiwrRUFBK0U7QUFDL0Usd0VBQXdFO0FBQ3hFLDRFQUE0RTtBQUM1RSw4RUFBOEU7QUFDOUUsNENBQTRDO0FBQzVDLEVBQUU7QUFDRixnRkFBZ0Y7QUFDaEYsK0VBQStFO0FBQy9FLHlFQUF5RTtBQUN6RSxnRkFBZ0Y7QUFDaEYsMkVBQTJFO0FBQzNFLHlFQUF5RTtBQUN6RSx5RUFBeUU7QUFDekUsZ0ZBQWdGO0FBQ2hGLDJFQUEyRTtBQUMzRSwrRUFBK0U7QUFDL0UsMkVBQTJFO0FBQzNFLDJFQUEyRTtBQUMzRSxpQkFBaUI7QUFDakIsRUFBRTtBQUNGLDRFQUE0RTtBQUM1RSxnRkFBZ0Y7QUFDaEYsbUJBQW1CO0FBQ25CLFNBQWdCLFVBQVUsQ0FLeEIsR0FBTSxFQUNOLE9BQTBDLEVBQzFDLE9BQWlGO0lBRWpGLE1BQU0sU0FBUyxHQUFHLCtDQUF1QixFQUFDLHNFQUFzRSxDQUFDLENBQUM7SUFDbEgsTUFBTSxXQUFXLEdBQUcsT0FBTyxFQUFFLFdBQVcsQ0FBQztJQUN6QyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDMUIsSUFBSSxPQUFPLE9BQU8sS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUNsQyxNQUFNLGFBQWEsR0FBRyxPQUFpRCxDQUFDO1lBRXhFLE1BQU0sU0FBUyxHQUFHLGFBQWEsRUFBRSxTQUFvRCxDQUFDO1lBQ3RGLE1BQU0sZ0JBQWdCLEdBQUcsYUFBYSxFQUFFLGdCQUFnQixJQUFJLGdDQUF1QixDQUFDLGdCQUFnQixDQUFDO1lBQ3JHLFNBQVMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7WUFDOUYsU0FBUyxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDdEMsQ0FBQzthQUFNLElBQUksT0FBTyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQzNCLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QyxDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sSUFBSSxTQUFTLENBQUMsa0VBQWtFLE9BQU8sT0FBTyxHQUFHLENBQUMsQ0FBQztRQUMzRyxDQUFDO0lBQ0gsQ0FBQztTQUFNLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNqQyxJQUFJLE9BQU8sT0FBTyxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sYUFBYSxHQUFHLE9BQTJDLENBQUM7WUFDbEUsTUFBTSxnQkFBZ0IsR0FBRyxhQUFhLEVBQUUsZ0JBQWdCLElBQUksZ0NBQXVCLENBQUMsZ0JBQWdCLENBQUM7WUFDckcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFjLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztZQUNuRyxTQUFTLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUN0QyxDQUFDO2FBQU0sSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFLENBQUM7WUFDM0IsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxJQUFJLFNBQVMsQ0FBQyxrRUFBa0UsT0FBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQzNHLENBQUM7SUFDSCxDQUFDO1NBQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO1FBQ2hDLElBQUksT0FBTyxPQUFPLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDbEMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFjLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUNsRixDQUFDO2FBQU0sSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFLENBQUM7WUFDM0IsU0FBUyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxJQUFJLFNBQVMsQ0FBQyxrRUFBa0UsT0FBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQzNHLENBQUM7SUFDSCxDQUFDO1NBQU0sQ0FBQztRQUNOLE1BQU0sSUFBSSxTQUFTLENBQUMsNEJBQTZCLEdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxTQUFnQix1QkFBdUIsQ0FBQyxPQUF5QztJQUMvRSxNQUFNLFNBQVMsR0FBRywrQ0FBdUIsRUFDdkMsbUZBQW1GLENBQ3BGLENBQUM7SUFDRixJQUFJLE9BQU8sT0FBTyxLQUFLLFVBQVUsRUFBRSxDQUFDO1FBQ2xDLFNBQVMsQ0FBQyxvQkFBb0IsR0FBRyxPQUFPLENBQUM7UUFDekMsU0FBUyxDQUFDLHVCQUF1QixFQUFFLENBQUM7SUFDdEMsQ0FBQztTQUFNLElBQUksT0FBTyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzNCLFNBQVMsQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUM7SUFDN0MsQ0FBQztTQUFNLENBQUM7UUFDTixNQUFNLElBQUksU0FBUyxDQUFDLGtFQUFrRSxPQUFPLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDM0csQ0FBQztBQUNILENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNILFNBQWdCLHNCQUFzQixDQUFDLGdCQUFrQztJQUN2RSxNQUFNLFNBQVMsR0FBRywrQ0FBdUIsRUFDdkMsa0ZBQWtGLENBQ25GLENBQUM7SUFFRixJQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRSxDQUFDO1FBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRUQsU0FBUyxDQUFDLFdBQVcsQ0FBQztRQUNwQiw4QkFBOEIsRUFBRTtZQUM5QixnQkFBZ0IsRUFBRSwwQkFBYSxFQUFDLHdDQUErQixFQUFFLGdCQUFnQixDQUFDO1NBQ25GO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBa0IsRUFBZ0IsRUFBRTtRQUNoRSxPQUFPO1lBQ0wsR0FBRyxJQUFJO1lBQ1AsZ0JBQWdCLEVBQUU7Z0JBQ2hCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQjtnQkFDeEIsR0FBRyxnQkFBZ0I7YUFDcEI7U0FDRixDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUNHO0FBQ0gsU0FBZ0IsVUFBVSxDQUFDLElBQTZCO0lBQ3RELE1BQU0sU0FBUyxHQUFHLCtDQUF1QixFQUFDLHNFQUFzRSxDQUFDLENBQUM7SUFFbEgsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxTQUFTLENBQUMsV0FBVyxDQUFDO1FBQ3BCLHdCQUF3QixFQUFFO1lBQ3hCLFlBQVksRUFBRTtnQkFDWixNQUFNLEVBQUUsMEJBQWEsRUFDbkIsU0FBUyxDQUFDLGdCQUFnQjtnQkFDMUIsNEJBQTRCO2dCQUM1QixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQzlFO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQWtCLEVBQWdCLEVBQUU7UUFDaEUsT0FBTztZQUNMLEdBQUcsSUFBSTtZQUNQLElBQUksRUFBRSxNQUFNLENBQUMsV0FBVyxDQUN0QixNQUFNLENBQUMsT0FBTyxDQUFDO2dCQUNiLEdBQUcsSUFBSSxDQUFDLElBQUk7Z0JBQ1osR0FBRyxJQUFJO2FBQ1IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQ2pDO1NBQ0YsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsU0FBZ0IsbUJBQW1CO0lBQ2pDLE1BQU0sU0FBUyxHQUFHLCtDQUF1QixFQUFDLG1FQUFtRSxDQUFDLENBQUM7SUFDL0csT0FBTyxTQUFTLENBQUMsaUJBQWlCLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsaUJBQWlCLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQztBQUMxRixDQUFDO0FBRVksdUJBQWUsR0FBRyxXQUFXLENBQVMsZUFBZSxDQUFDLENBQUM7QUFDdkQsK0JBQXVCLEdBQUcsV0FBVyxDQUFxQix3QkFBd0IsQ0FBQyxDQUFDO0FBQ3BGLDZCQUFxQixHQUFHLFdBQVcsQ0FBd0MsOEJBQThCLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3Q3Q3hIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNLElBQTBDO0FBQ2hELElBQUksaUNBQU8sRUFBRSxtQ0FBRTtBQUNmO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFBQSxrR0FBQztBQUNOLElBQUksS0FBSyxFQVNOO0FBQ0gsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLFFBQVE7QUFDdkIsZUFBZSxVQUFVO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxlQUFlLEdBQUc7QUFDbEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGVBQWUsR0FBRztBQUNsQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsR0FBRztBQUNsQixpQkFBaUI7QUFDakI7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLFVBQVU7QUFDekIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLFVBQVU7QUFDekIsaUJBQWlCLE9BQU87QUFDeEI7QUFDQTs7QUFFQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLFVBQVU7QUFDekIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLFVBQVU7QUFDekIsaUJBQWlCLE9BQU87QUFDeEI7QUFDQTs7QUFFQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLFFBQVE7QUFDdkIsZUFBZSxVQUFVO0FBQ3pCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsUUFBUTtBQUN2QixlQUFlLFVBQVU7QUFDekIsaUJBQWlCLE9BQU87QUFDeEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsUUFBUTtBQUN2QixpQkFBaUI7QUFDakI7QUFDQTtBQUNBLDRCQUE0Qjs7QUFFNUI7QUFDQSxlQUFlLFFBQVE7QUFDdkIsZUFBZSxtQkFBbUI7QUFDbEMsZUFBZSxTQUFTO0FBQ3hCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGdCQUFnQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLG1CQUFtQjtBQUNsQyxlQUFlLFNBQVM7QUFDeEIsaUJBQWlCLE9BQU87QUFDeEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxzQkFBc0IsK0NBQStDO0FBQ3BGLGVBQWUsVUFBVTtBQUN6QixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsNkJBQTZCLCtDQUErQztBQUMzRixlQUFlLFVBQVU7QUFDekIsaUJBQWlCO0FBQ2pCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7O0FBRUE7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aUI7WUFDakJDLG9CQUFvQjtZQUNwQkMsaUJBQWlCO1FBRXJCO1FBQ0FDLHFCQUFxQjtJQUN6QjtJQUVBLE1BQU0sRUFBQ0MsVUFBVSxFQUFDLEdBQUdWLGtFQUFZQTtJQUVqQyxNQUFNRyxhQUFhO1FBQUNRLFVBQVVEO0lBQVU7SUFFeEMsT0FBTztRQUFDQyxVQUFVRDtJQUFVO0FBQ2hDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZCa0M7Ozs7Ozs7Ozs7O0FDQWxDOzs7Ozs7Ozs7O0FDQUE7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7QUNMQSxZQUFZLG1CQUFPLENBQUMsaUhBQThDO0FBQ2xFLFdBQVc7O0FBRVgsUUFBUSxrQkFBa0IsRUFBRSxtQkFBTyxDQUFDLGlIQUE4QztBQUNsRjs7QUFFQSx1QkFBdUI7QUFDdkIsU0FBUyxtQkFBTyw0QkFBNEIsa0dBQW9GO0FBQ2hJOztBQUVBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2FjdGl2aXR5LW9wdGlvbnMudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL2RhdGEtY29udmVydGVyLnRzIiwiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci9mYWlsdXJlLWNvbnZlcnRlci50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvcGF5bG9hZC1jb2RlYy50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvcGF5bG9hZC1jb252ZXJ0ZXIudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL3R5cGVzLnRzIiwiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2RlcHJlY2F0ZWQtdGltZS50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9lbmNvZGluZy50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9lcnJvcnMudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZmFpbHVyZS50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9pbmRleC50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9pbnRlcmNlcHRvcnMudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvaW50ZXJmYWNlcy50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9pbnRlcm5hbC13b3JrZmxvdy9lbnVtcy1oZWxwZXJzLnRzIiwiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2ludGVybmFsLXdvcmtmbG93L2luZGV4LnRzIiwiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2xvZ2dlci50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9yZXRyeS1wb2xpY3kudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvdGltZS50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy90eXBlLWhlbHBlcnMudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvdmVyc2lvbmluZy1pbnRlbnQtZW51bS50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy92ZXJzaW9uaW5nLWludGVudC50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy93b3JrZmxvdy1oYW5kbGUudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvd29ya2Zsb3ctb3B0aW9ucy50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2FsZWEudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9jYW5jZWxsYXRpb24tc2NvcGUudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9lcnJvcnMudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9mbGFncy50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2dsb2JhbC1hdHRyaWJ1dGVzLnRzIiwiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvZ2xvYmFsLW92ZXJyaWRlcy50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2luZGV4LnRzIiwiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW50ZXJjZXB0b3JzLnRzIiwiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW50ZXJmYWNlcy50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2ludGVybmFscy50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2xvZ3MudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9wa2cudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9zaW5rcy50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3N0YWNrLWhlbHBlcnMudHMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy90cmlnZ2VyLnRzIiwiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvdXBkYXRlLXNjb3BlLnRzIiwiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvd29ya2VyLWludGVyZmFjZS50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3dvcmtmbG93LnRzIiwiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL25vZGVfbW9kdWxlcy9sb25nL3VtZC9pbmRleC5qcyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvbXMvZGlzdC9pbmRleC5janMiLCIvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvc3JjL2NvbXBvbmVudHMvdGVtcG9yYWwvd29ya2Zsb3dzL2V4cG9ydC13b3JrYm9vay9pbmRleC50cyIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9zcmMvY29tcG9uZW50cy90ZW1wb3JhbC93b3JrZmxvd3MvaW5kZXgudHMiLCJpZ25vcmVkfC9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvbGlifF9fdGVtcG9yYWxfY3VzdG9tX3BheWxvYWRfY29udmVydGVyIiwiaWdub3JlZHwvVXNlcnMvZW5kdXJhbmNlL3dvcmsvZGF0YWxlbnMtdHJhbnNmZXIvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYnxfX3RlbXBvcmFsX2N1c3RvbV9mYWlsdXJlX2NvbnZlcnRlciIsIndlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIi9Vc2Vycy9lbmR1cmFuY2Uvd29yay9kYXRhbGVucy10cmFuc2Zlci9zcmMvY29tcG9uZW50cy90ZW1wb3JhbC93b3JrZmxvd3MvaW5kZXgtYXV0b2dlbmVyYXRlZC1lbnRyeXBvaW50LmNqcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBSZXRyeVBvbGljeSB9IGZyb20gJy4vcmV0cnktcG9saWN5JztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnLi90aW1lJztcbmltcG9ydCB7IFZlcnNpb25pbmdJbnRlbnQgfSBmcm9tICcuL3ZlcnNpb25pbmctaW50ZW50JztcbmltcG9ydCB7IG1ha2VQcm90b0VudW1Db252ZXJ0ZXJzIH0gZnJvbSAnLi9pbnRlcm5hbC13b3JrZmxvdyc7XG5cbmV4cG9ydCBjb25zdCBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUgPSB7XG4gIFRSWV9DQU5DRUw6ICdUUllfQ0FOQ0VMJyxcbiAgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEOiAnV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEJyxcbiAgQUJBTkRPTjogJ0FCQU5ET04nLFxufSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSA9ICh0eXBlb2YgQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlKVtrZXlvZiB0eXBlb2YgQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlXTtcblxuZXhwb3J0IGNvbnN0IFtlbmNvZGVBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsIGRlY29kZUFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZV0gPSBtYWtlUHJvdG9FbnVtQ29udmVydGVyczxcbiAgY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsXG4gIHR5cGVvZiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSxcbiAga2V5b2YgdHlwZW9mIGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLFxuICB0eXBlb2YgQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLFxuICAnJ1xuPihcbiAge1xuICAgIFtBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUuVFJZX0NBTkNFTF06IDAsXG4gICAgW0FjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZS5XQUlUX0NBTkNFTExBVElPTl9DT01QTEVURURdOiAxLFxuICAgIFtBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUuQUJBTkRPTl06IDIsXG4gIH0gYXMgY29uc3QsXG4gICcnXG4pO1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHJlbW90ZSBhY3Rpdml0eSBpbnZvY2F0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlPcHRpb25zIHtcbiAgLyoqXG4gICAqIElkZW50aWZpZXIgdG8gdXNlIGZvciB0cmFja2luZyB0aGUgYWN0aXZpdHkgaW4gV29ya2Zsb3cgaGlzdG9yeS5cbiAgICogVGhlIGBhY3Rpdml0eUlkYCBjYW4gYmUgYWNjZXNzZWQgYnkgdGhlIGFjdGl2aXR5IGZ1bmN0aW9uLlxuICAgKiBEb2VzIG5vdCBuZWVkIHRvIGJlIHVuaXF1ZS5cbiAgICpcbiAgICogQGRlZmF1bHQgYW4gaW5jcmVtZW50YWwgc2VxdWVuY2UgbnVtYmVyXG4gICAqL1xuICBhY3Rpdml0eUlkPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUYXNrIHF1ZXVlIG5hbWUuXG4gICAqXG4gICAqIEBkZWZhdWx0IGN1cnJlbnQgd29ya2VyIHRhc2sgcXVldWVcbiAgICovXG4gIHRhc2tRdWV1ZT86IHN0cmluZztcblxuICAvKipcbiAgICogSGVhcnRiZWF0IGludGVydmFsLiBBY3Rpdml0eSBtdXN0IGhlYXJ0YmVhdCBiZWZvcmUgdGhpcyBpbnRlcnZhbCBwYXNzZXMgYWZ0ZXIgYSBsYXN0IGhlYXJ0YmVhdCBvciBhY3Rpdml0eSBzdGFydC5cbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBoZWFydGJlYXRUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIFJldHJ5UG9saWN5IHRoYXQgZGVmaW5lIGhvdyBhY3Rpdml0eSBpcyByZXRyaWVkIGluIGNhc2Ugb2YgZmFpbHVyZS4gSWYgdGhpcyBpcyBub3Qgc2V0LCB0aGVuIHRoZSBzZXJ2ZXItZGVmaW5lZCBkZWZhdWx0IGFjdGl2aXR5IHJldHJ5IHBvbGljeSB3aWxsIGJlIHVzZWQuIFRvIGVuc3VyZSB6ZXJvIHJldHJpZXMsIHNldCBtYXhpbXVtIGF0dGVtcHRzIHRvIDEuXG4gICAqL1xuICByZXRyeT86IFJldHJ5UG9saWN5O1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIHRpbWUgb2YgYSBzaW5nbGUgQWN0aXZpdHkgZXhlY3V0aW9uIGF0dGVtcHQuIE5vdGUgdGhhdCB0aGUgVGVtcG9yYWwgU2VydmVyIGRvZXNuJ3QgZGV0ZWN0IFdvcmtlciBwcm9jZXNzXG4gICAqIGZhaWx1cmVzIGRpcmVjdGx5OiBpbnN0ZWFkLCBpdCByZWxpZXMgb24gdGhpcyB0aW1lb3V0IHRvIGRldGVjdCB0aGF0IGFuIEFjdGl2aXR5IGRpZG4ndCBjb21wbGV0ZSBvbiB0aW1lLiBUaGVyZWZvcmUsIHRoaXNcbiAgICogdGltZW91dCBzaG91bGQgYmUgYXMgc2hvcnQgYXMgdGhlIGxvbmdlc3QgcG9zc2libGUgZXhlY3V0aW9uIG9mIHRoZSBBY3Rpdml0eSBib2R5LiBQb3RlbnRpYWxseSBsb25nLXJ1bm5pbmdcbiAgICogQWN0aXZpdGllcyBtdXN0IHNwZWNpZnkge0BsaW5rIGhlYXJ0YmVhdFRpbWVvdXR9IGFuZCBjYWxsIHtAbGluayBhY3Rpdml0eS5Db250ZXh0LmhlYXJ0YmVhdH0gcGVyaW9kaWNhbGx5IGZvclxuICAgKiB0aW1lbHkgZmFpbHVyZSBkZXRlY3Rpb24uXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IGBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0YCBvciB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzdGFydFRvQ2xvc2VUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIFRpbWUgdGhhdCB0aGUgQWN0aXZpdHkgVGFzayBjYW4gc3RheSBpbiB0aGUgVGFzayBRdWV1ZSBiZWZvcmUgaXQgaXMgcGlja2VkIHVwIGJ5IGEgV29ya2VyLiBEbyBub3Qgc3BlY2lmeSB0aGlzIHRpbWVvdXQgdW5sZXNzIHVzaW5nIGhvc3Qtc3BlY2lmaWMgVGFzayBRdWV1ZXMgZm9yIEFjdGl2aXR5IFRhc2tzIGFyZSBiZWluZyB1c2VkIGZvciByb3V0aW5nLlxuICAgKiBgc2NoZWR1bGVUb1N0YXJ0VGltZW91dGAgaXMgYWx3YXlzIG5vbi1yZXRyeWFibGUuIFJldHJ5aW5nIGFmdGVyIHRoaXMgdGltZW91dCBkb2Vzbid0IG1ha2Ugc2Vuc2UgYXMgaXQgd291bGQganVzdCBwdXQgdGhlIEFjdGl2aXR5IFRhc2sgYmFjayBpbnRvIHRoZSBzYW1lIFRhc2sgUXVldWUuXG4gICAqXG4gICAqIEBkZWZhdWx0IGBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0YCBvciB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIFRvdGFsIHRpbWUgdGhhdCBhIHdvcmtmbG93IGlzIHdpbGxpbmcgdG8gd2FpdCBmb3IgdGhlIEFjdGl2aXR5IHRvIGNvbXBsZXRlLlxuICAgKiBgc2NoZWR1bGVUb0Nsb3NlVGltZW91dGAgbGltaXRzIHRoZSB0b3RhbCB0aW1lIG9mIGFuIEFjdGl2aXR5J3MgZXhlY3V0aW9uIGluY2x1ZGluZyByZXRyaWVzICh1c2Uge0BsaW5rIHN0YXJ0VG9DbG9zZVRpbWVvdXR9IHRvIGxpbWl0IHRoZSB0aW1lIG9mIGEgc2luZ2xlIGF0dGVtcHQpLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHN0YXJ0VG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAZGVmYXVsdCB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hhdCB0aGUgU0RLIGRvZXMgd2hlbiB0aGUgQWN0aXZpdHkgaXMgY2FuY2VsbGVkLlxuICAgKiAtIGBUUllfQ0FOQ0VMYCAtIEluaXRpYXRlIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKiAtIGBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURURgIC0gV2FpdCBmb3IgYWN0aXZpdHkgY2FuY2VsbGF0aW9uIGNvbXBsZXRpb24uIE5vdGUgdGhhdCBhY3Rpdml0eSBtdXN0IGhlYXJ0YmVhdCB0byByZWNlaXZlIGFcbiAgICogICBjYW5jZWxsYXRpb24gbm90aWZpY2F0aW9uLiBUaGlzIGNhbiBibG9jayB0aGUgY2FuY2VsbGF0aW9uIGZvciBhIGxvbmcgdGltZSBpZiBhY3Rpdml0eSBkb2Vzbid0XG4gICAqICAgaGVhcnRiZWF0IG9yIGNob29zZXMgdG8gaWdub3JlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdC5cbiAgICogLSBgQUJBTkRPTmAgLSBEbyBub3QgcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgdGhlIGFjdGl2aXR5IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICovXG4gIGNhbmNlbGxhdGlvblR5cGU/OiBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU7XG5cbiAgLyoqXG4gICAqIEVhZ2VyIGRpc3BhdGNoIGlzIGFuIG9wdGltaXphdGlvbiB0aGF0IGltcHJvdmVzIHRoZSB0aHJvdWdocHV0IGFuZCBsb2FkIG9uIHRoZSBzZXJ2ZXIgZm9yIHNjaGVkdWxpbmcgQWN0aXZpdGllcy5cbiAgICogV2hlbiB1c2VkLCB0aGUgc2VydmVyIHdpbGwgaGFuZCBvdXQgQWN0aXZpdHkgdGFza3MgYmFjayB0byB0aGUgV29ya2VyIHdoZW4gaXQgY29tcGxldGVzIGEgV29ya2Zsb3cgdGFzay5cbiAgICogSXQgaXMgYXZhaWxhYmxlIGZyb20gc2VydmVyIHZlcnNpb24gMS4xNyBiZWhpbmQgdGhlIGBzeXN0ZW0uZW5hYmxlQWN0aXZpdHlFYWdlckV4ZWN1dGlvbmAgZmVhdHVyZSBmbGFnLlxuICAgKlxuICAgKiBFYWdlciBkaXNwYXRjaCB3aWxsIG9ubHkgYmUgdXNlZCBpZiBgYWxsb3dFYWdlckRpc3BhdGNoYCBpcyBlbmFibGVkICh0aGUgZGVmYXVsdCkgYW5kIHtAbGluayB0YXNrUXVldWV9IGlzIGVpdGhlclxuICAgKiBvbWl0dGVkIG9yIHRoZSBzYW1lIGFzIHRoZSBjdXJyZW50IFdvcmtmbG93LlxuICAgKlxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBhbGxvd0VhZ2VyRGlzcGF0Y2g/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBXaGVuIHVzaW5nIHRoZSBXb3JrZXIgVmVyc2lvbmluZyBmZWF0dXJlLCBzcGVjaWZpZXMgd2hldGhlciB0aGlzIEFjdGl2aXR5IHNob3VsZCBydW4gb24gYVxuICAgKiB3b3JrZXIgd2l0aCBhIGNvbXBhdGlibGUgQnVpbGQgSWQgb3Igbm90LiBTZWUge0BsaW5rIFZlcnNpb25pbmdJbnRlbnR9LlxuICAgKlxuICAgKiBAZGVmYXVsdCAnQ09NUEFUSUJMRSdcbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgdmVyc2lvbmluZ0ludGVudD86IFZlcnNpb25pbmdJbnRlbnQ7XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgbG9jYWwgYWN0aXZpdHkgaW52b2NhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2FsQWN0aXZpdHlPcHRpb25zIHtcbiAgLyoqXG4gICAqIFJldHJ5UG9saWN5IHRoYXQgZGVmaW5lcyBob3cgYW4gYWN0aXZpdHkgaXMgcmV0cmllZCBpbiBjYXNlIG9mIGZhaWx1cmUuIElmIHRoaXMgaXMgbm90IHNldCwgdGhlbiB0aGUgU0RLLWRlZmluZWQgZGVmYXVsdCBhY3Rpdml0eSByZXRyeSBwb2xpY3kgd2lsbCBiZSB1c2VkLlxuICAgKiBOb3RlIHRoYXQgbG9jYWwgYWN0aXZpdGllcyBhcmUgYWx3YXlzIGV4ZWN1dGVkIGF0IGxlYXN0IG9uY2UsIGV2ZW4gaWYgbWF4aW11bSBhdHRlbXB0cyBpcyBzZXQgdG8gMSBkdWUgdG8gV29ya2Zsb3cgdGFzayByZXRyaWVzLlxuICAgKi9cbiAgcmV0cnk/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogTWF4aW11bSB0aW1lIHRoZSBsb2NhbCBhY3Rpdml0eSBpcyBhbGxvd2VkIHRvIGV4ZWN1dGUgYWZ0ZXIgdGhlIHRhc2sgaXMgZGlzcGF0Y2hlZC4gVGhpc1xuICAgKiB0aW1lb3V0IGlzIGFsd2F5cyByZXRyeWFibGUuXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqIElmIHNldCwgdGhpcyBtdXN0IGJlIDw9IHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSwgb3RoZXJ3aXNlLCBpdCB3aWxsIGJlIGNsYW1wZWQgZG93bi5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzdGFydFRvQ2xvc2VUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIExpbWl0cyB0aW1lIHRoZSBsb2NhbCBhY3Rpdml0eSBjYW4gaWRsZSBpbnRlcm5hbGx5IGJlZm9yZSBiZWluZyBleGVjdXRlZC4gVGhhdCBjYW4gaGFwcGVuIGlmXG4gICAqIHRoZSB3b3JrZXIgaXMgY3VycmVudGx5IGF0IG1heCBjb25jdXJyZW50IGxvY2FsIGFjdGl2aXR5IGV4ZWN1dGlvbnMuIFRoaXMgdGltZW91dCBpcyBhbHdheXNcbiAgICogbm9uIHJldHJ5YWJsZSBhcyBhbGwgYSByZXRyeSB3b3VsZCBhY2hpZXZlIGlzIHRvIHB1dCBpdCBiYWNrIGludG8gdGhlIHNhbWUgcXVldWUuIERlZmF1bHRzXG4gICAqIHRvIHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSBpZiBub3Qgc3BlY2lmaWVkIGFuZCB0aGF0IGlzIHNldC4gTXVzdCBiZSA8PVxuICAgKiB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gd2hlbiBzZXQsIG90aGVyd2lzZSwgaXQgd2lsbCBiZSBjbGFtcGVkIGRvd24uXG4gICAqXG4gICAqIEBkZWZhdWx0IHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogSW5kaWNhdGVzIGhvdyBsb25nIHRoZSBjYWxsZXIgaXMgd2lsbGluZyB0byB3YWl0IGZvciBsb2NhbCBhY3Rpdml0eSBjb21wbGV0aW9uLiBMaW1pdHMgaG93XG4gICAqIGxvbmcgcmV0cmllcyB3aWxsIGJlIGF0dGVtcHRlZC5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzdGFydFRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICpcbiAgICogQGRlZmF1bHQgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBJZiB0aGUgYWN0aXZpdHkgaXMgcmV0cnlpbmcgYW5kIGJhY2tvZmYgd291bGQgZXhjZWVkIHRoaXMgdmFsdWUsIGEgc2VydmVyIHNpZGUgdGltZXIgd2lsbCBiZSBzY2hlZHVsZWQgZm9yIHRoZSBuZXh0IGF0dGVtcHQuXG4gICAqIE90aGVyd2lzZSwgYmFja29mZiB3aWxsIGhhcHBlbiBpbnRlcm5hbGx5IGluIHRoZSBTREsuXG4gICAqXG4gICAqIEBkZWZhdWx0IDEgbWludXRlXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKiovXG4gIGxvY2FsUmV0cnlUaHJlc2hvbGQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGF0IHRoZSBTREsgZG9lcyB3aGVuIHRoZSBBY3Rpdml0eSBpcyBjYW5jZWxsZWQuXG4gICAqIC0gYFRSWV9DQU5DRUxgIC0gSW5pdGlhdGUgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCBhbmQgaW1tZWRpYXRlbHkgcmVwb3J0IGNhbmNlbGxhdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqIC0gYFdBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRGAgLSBXYWl0IGZvciBhY3Rpdml0eSBjYW5jZWxsYXRpb24gY29tcGxldGlvbi4gTm90ZSB0aGF0IGFjdGl2aXR5IG11c3QgaGVhcnRiZWF0IHRvIHJlY2VpdmUgYVxuICAgKiAgIGNhbmNlbGxhdGlvbiBub3RpZmljYXRpb24uIFRoaXMgY2FuIGJsb2NrIHRoZSBjYW5jZWxsYXRpb24gZm9yIGEgbG9uZyB0aW1lIGlmIGFjdGl2aXR5IGRvZXNuJ3RcbiAgICogICBoZWFydGJlYXQgb3IgY2hvb3NlcyB0byBpZ25vcmUgdGhlIGNhbmNlbGxhdGlvbiByZXF1ZXN0LlxuICAgKiAtIGBBQkFORE9OYCAtIERvIG5vdCByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiB0aGUgYWN0aXZpdHkgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKi9cbiAgY2FuY2VsbGF0aW9uVHlwZT86IEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZTtcbn1cbiIsImltcG9ydCB7IERlZmF1bHRGYWlsdXJlQ29udmVydGVyLCBGYWlsdXJlQ29udmVydGVyIH0gZnJvbSAnLi9mYWlsdXJlLWNvbnZlcnRlcic7XG5pbXBvcnQgeyBQYXlsb2FkQ29kZWMgfSBmcm9tICcuL3BheWxvYWQtY29kZWMnO1xuaW1wb3J0IHsgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIsIFBheWxvYWRDb252ZXJ0ZXIgfSBmcm9tICcuL3BheWxvYWQtY29udmVydGVyJztcblxuLyoqXG4gKiBXaGVuIHlvdXIgZGF0YSAoYXJndW1lbnRzIGFuZCByZXR1cm4gdmFsdWVzKSBpcyBzZW50IG92ZXIgdGhlIHdpcmUgYW5kIHN0b3JlZCBieSBUZW1wb3JhbCBTZXJ2ZXIsIGl0IGlzIGVuY29kZWQgaW5cbiAqIGJpbmFyeSBpbiBhIHtAbGluayBQYXlsb2FkfSBQcm90b2J1ZiBtZXNzYWdlLlxuICpcbiAqIFRoZSBkZWZhdWx0IGBEYXRhQ29udmVydGVyYCBzdXBwb3J0cyBgdW5kZWZpbmVkYCwgYFVpbnQ4QXJyYXlgLCBhbmQgSlNPTiBzZXJpYWxpemFibGVzIChzbyBpZlxuICoge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0pTT04vc3RyaW5naWZ5I2Rlc2NyaXB0aW9uIHwgYEpTT04uc3RyaW5naWZ5KHlvdXJBcmdPclJldHZhbClgfVxuICogd29ya3MsIHRoZSBkZWZhdWx0IGRhdGEgY29udmVydGVyIHdpbGwgd29yaykuIFByb3RvYnVmcyBhcmUgc3VwcG9ydGVkIHZpYVxuICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2RhdGEtY29udmVydGVycyNwcm90b2J1ZnMgfCB0aGlzIEFQSX0uXG4gKlxuICogVXNlIGEgY3VzdG9tIGBEYXRhQ29udmVydGVyYCB0byBjb250cm9sIHRoZSBjb250ZW50cyBvZiB5b3VyIHtAbGluayBQYXlsb2FkfXMuIENvbW1vbiByZWFzb25zIGZvciB1c2luZyBhIGN1c3RvbVxuICogYERhdGFDb252ZXJ0ZXJgIGFyZTpcbiAqIC0gQ29udmVydGluZyB2YWx1ZXMgdGhhdCBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgZGVmYXVsdCBgRGF0YUNvbnZlcnRlcmAgKGZvciBleGFtcGxlLCBgSlNPTi5zdHJpbmdpZnkoKWAgZG9lc24ndFxuICogICBoYW5kbGUgYEJpZ0ludGBzLCBzbyBpZiB5b3Ugd2FudCB0byByZXR1cm4gYHsgdG90YWw6IDEwMDBuIH1gIGZyb20gYSBXb3JrZmxvdywgU2lnbmFsLCBvciBBY3Rpdml0eSwgeW91IG5lZWQgeW91clxuICogICBvd24gYERhdGFDb252ZXJ0ZXJgKS5cbiAqIC0gRW5jcnlwdGluZyB2YWx1ZXMgdGhhdCBtYXkgY29udGFpbiBwcml2YXRlIGluZm9ybWF0aW9uIHRoYXQgeW91IGRvbid0IHdhbnQgc3RvcmVkIGluIHBsYWludGV4dCBpbiBUZW1wb3JhbCBTZXJ2ZXInc1xuICogICBkYXRhYmFzZS5cbiAqIC0gQ29tcHJlc3NpbmcgdmFsdWVzIHRvIHJlZHVjZSBkaXNrIG9yIG5ldHdvcmsgdXNhZ2UuXG4gKlxuICogVG8gdXNlIHlvdXIgY3VzdG9tIGBEYXRhQ29udmVydGVyYCwgcHJvdmlkZSBpdCB0byB0aGUge0BsaW5rIFdvcmtmbG93Q2xpZW50fSwge0BsaW5rIFdvcmtlcn0sIGFuZFxuICoge0BsaW5rIGJ1bmRsZVdvcmtmbG93Q29kZX0gKGlmIHlvdSB1c2UgaXQpOlxuICogLSBgbmV3IFdvcmtmbG93Q2xpZW50KHsgLi4uLCBkYXRhQ29udmVydGVyIH0pYFxuICogLSBgV29ya2VyLmNyZWF0ZSh7IC4uLiwgZGF0YUNvbnZlcnRlciB9KWBcbiAqIC0gYGJ1bmRsZVdvcmtmbG93Q29kZSh7IC4uLiwgcGF5bG9hZENvbnZlcnRlclBhdGggfSlgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGF0YUNvbnZlcnRlciB7XG4gIC8qKlxuICAgKiBQYXRoIG9mIGEgZmlsZSB0aGF0IGhhcyBhIGBwYXlsb2FkQ29udmVydGVyYCBuYW1lZCBleHBvcnQuXG4gICAqIGBwYXlsb2FkQ29udmVydGVyYCBzaG91bGQgYmUgYW4gb2JqZWN0IHRoYXQgaW1wbGVtZW50cyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqIElmIG5vIHBhdGggaXMgcHJvdmlkZWQsIHtAbGluayBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcn0gaXMgdXNlZC5cbiAgICovXG4gIHBheWxvYWRDb252ZXJ0ZXJQYXRoPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBQYXRoIG9mIGEgZmlsZSB0aGF0IGhhcyBhIGBmYWlsdXJlQ29udmVydGVyYCBuYW1lZCBleHBvcnQuXG4gICAqIGBmYWlsdXJlQ29udmVydGVyYCBzaG91bGQgYmUgYW4gb2JqZWN0IHRoYXQgaW1wbGVtZW50cyB7QGxpbmsgRmFpbHVyZUNvbnZlcnRlcn0uXG4gICAqIElmIG5vIHBhdGggaXMgcHJvdmlkZWQsIHtAbGluayBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcn0gaXMgdXNlZC5cbiAgICovXG4gIGZhaWx1cmVDb252ZXJ0ZXJQYXRoPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZENvZGVjfSBpbnN0YW5jZXMuXG4gICAqXG4gICAqIFBheWxvYWRzIGFyZSBlbmNvZGVkIGluIHRoZSBvcmRlciBvZiB0aGUgYXJyYXkgYW5kIGRlY29kZWQgaW4gdGhlIG9wcG9zaXRlIG9yZGVyLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgYVxuICAgKiBjb21wcmVzc2lvbiBjb2RlYyBhbmQgYW4gZW5jcnlwdGlvbiBjb2RlYywgdGhlbiB5b3Ugd2FudCBkYXRhIHRvIGJlIGVuY29kZWQgd2l0aCB0aGUgY29tcHJlc3Npb24gY29kZWMgZmlyc3QsIHNvXG4gICAqIHlvdSdkIGRvIGBwYXlsb2FkQ29kZWNzOiBbY29tcHJlc3Npb25Db2RlYywgZW5jcnlwdGlvbkNvZGVjXWAuXG4gICAqL1xuICBwYXlsb2FkQ29kZWNzPzogUGF5bG9hZENvZGVjW107XG59XG5cbi8qKlxuICogQSB7QGxpbmsgRGF0YUNvbnZlcnRlcn0gdGhhdCBoYXMgYmVlbiBsb2FkZWQgdmlhIHtAbGluayBsb2FkRGF0YUNvbnZlcnRlcn0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9hZGVkRGF0YUNvbnZlcnRlciB7XG4gIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXI7XG4gIGZhaWx1cmVDb252ZXJ0ZXI6IEZhaWx1cmVDb252ZXJ0ZXI7XG4gIHBheWxvYWRDb2RlY3M6IFBheWxvYWRDb2RlY1tdO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBGYWlsdXJlQ29udmVydGVyfSB1c2VkIGJ5IHRoZSBTREsuXG4gKlxuICogRXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcyBhcmUgc2VyaXphbGl6ZWQgYXMgcGxhaW4gdGV4dC5cbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRGYWlsdXJlQ29udmVydGVyOiBGYWlsdXJlQ29udmVydGVyID0gbmV3IERlZmF1bHRGYWlsdXJlQ29udmVydGVyKCk7XG5cbi8qKlxuICogQSBcImxvYWRlZFwiIGRhdGEgY29udmVydGVyIHRoYXQgdXNlcyB0aGUgZGVmYXVsdCBzZXQgb2YgZmFpbHVyZSBhbmQgcGF5bG9hZCBjb252ZXJ0ZXJzLlxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdERhdGFDb252ZXJ0ZXI6IExvYWRlZERhdGFDb252ZXJ0ZXIgPSB7XG4gIHBheWxvYWRDb252ZXJ0ZXI6IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBmYWlsdXJlQ29udmVydGVyOiBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcixcbiAgcGF5bG9hZENvZGVjczogW10sXG59O1xuIiwiaW1wb3J0IHtcbiAgQWN0aXZpdHlGYWlsdXJlLFxuICBBcHBsaWNhdGlvbkZhaWx1cmUsXG4gIENhbmNlbGxlZEZhaWx1cmUsXG4gIENoaWxkV29ya2Zsb3dGYWlsdXJlLFxuICBkZWNvZGVSZXRyeVN0YXRlLFxuICBkZWNvZGVUaW1lb3V0VHlwZSxcbiAgZW5jb2RlUmV0cnlTdGF0ZSxcbiAgZW5jb2RlVGltZW91dFR5cGUsXG4gIEZBSUxVUkVfU09VUkNFLFxuICBQcm90b0ZhaWx1cmUsXG4gIFNlcnZlckZhaWx1cmUsXG4gIFRlbXBvcmFsRmFpbHVyZSxcbiAgVGVybWluYXRlZEZhaWx1cmUsXG4gIFRpbWVvdXRGYWlsdXJlLFxufSBmcm9tICcuLi9mYWlsdXJlJztcbmltcG9ydCB7IGlzRXJyb3IgfSBmcm9tICcuLi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgbXNPcHRpb25hbFRvVHMgfSBmcm9tICcuLi90aW1lJztcbmltcG9ydCB7IGFycmF5RnJvbVBheWxvYWRzLCBmcm9tUGF5bG9hZHNBdEluZGV4LCBQYXlsb2FkQ29udmVydGVyLCB0b1BheWxvYWRzIH0gZnJvbSAnLi9wYXlsb2FkLWNvbnZlcnRlcic7XG5cbmZ1bmN0aW9uIGNvbWJpbmVSZWdFeHAoLi4ucmVnZXhwczogUmVnRXhwW10pOiBSZWdFeHAge1xuICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleHBzLm1hcCgoeCkgPT4gYCg/OiR7eC5zb3VyY2V9KWApLmpvaW4oJ3wnKSk7XG59XG5cbi8qKlxuICogU3RhY2sgdHJhY2VzIHdpbGwgYmUgY3V0b2ZmIHdoZW4gb24gb2YgdGhlc2UgcGF0dGVybnMgaXMgbWF0Y2hlZFxuICovXG5jb25zdCBDVVRPRkZfU1RBQ0tfUEFUVEVSTlMgPSBjb21iaW5lUmVnRXhwKFxuICAvKiogQWN0aXZpdHkgZXhlY3V0aW9uICovXG4gIC9cXHMrYXQgQWN0aXZpdHlcXC5leGVjdXRlIFxcKC4qW1xcXFwvXXdvcmtlcltcXFxcL10oPzpzcmN8bGliKVtcXFxcL11hY3Rpdml0eVxcLltqdF1zOlxcZCs6XFxkK1xcKS8sXG4gIC8qKiBXb3JrZmxvdyBhY3RpdmF0aW9uICovXG4gIC9cXHMrYXQgQWN0aXZhdG9yXFwuXFxTK05leHRIYW5kbGVyIFxcKC4qW1xcXFwvXXdvcmtmbG93W1xcXFwvXSg/OnNyY3xsaWIpW1xcXFwvXWludGVybmFsc1xcLltqdF1zOlxcZCs6XFxkK1xcKS8sXG4gIC8qKiBXb3JrZmxvdyBydW4gYW55dGhpbmcgaW4gY29udGV4dCAqL1xuICAvXFxzK2F0IFNjcmlwdFxcLnJ1bkluQ29udGV4dCBcXCgoPzpub2RlOnZtfHZtXFwuanMpOlxcZCs6XFxkK1xcKS9cbik7XG5cbi8qKlxuICogQW55IHN0YWNrIHRyYWNlIGZyYW1lcyB0aGF0IG1hdGNoIGFueSBvZiB0aG9zZSB3aWwgYmUgZG9wcGVkLlxuICogVGhlIFwibnVsbC5cIiBwcmVmaXggb24gc29tZSBjYXNlcyBpcyB0byBhdm9pZCBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvaXNzdWVzLzQyNDE3XG4gKi9cbmNvbnN0IERST1BQRURfU1RBQ0tfRlJBTUVTX1BBVFRFUk5TID0gY29tYmluZVJlZ0V4cChcbiAgLyoqIEludGVybmFsIGZ1bmN0aW9ucyB1c2VkIHRvIHJlY3Vyc2l2ZWx5IGNoYWluIGludGVyY2VwdG9ycyAqL1xuICAvXFxzK2F0IChudWxsXFwuKT9uZXh0IFxcKC4qW1xcXFwvXWNvbW1vbltcXFxcL10oPzpzcmN8bGliKVtcXFxcL11pbnRlcmNlcHRvcnNcXC5banRdczpcXGQrOlxcZCtcXCkvLFxuICAvKiogSW50ZXJuYWwgZnVuY3Rpb25zIHVzZWQgdG8gcmVjdXJzaXZlbHkgY2hhaW4gaW50ZXJjZXB0b3JzICovXG4gIC9cXHMrYXQgKG51bGxcXC4pP2V4ZWN1dGVOZXh0SGFuZGxlciBcXCguKltcXFxcL113b3JrZXJbXFxcXC9dKD86c3JjfGxpYilbXFxcXC9dYWN0aXZpdHlcXC5banRdczpcXGQrOlxcZCtcXCkvXG4pO1xuXG4vKipcbiAqIEN1dHMgb3V0IHRoZSBmcmFtZXdvcmsgcGFydCBvZiBhIHN0YWNrIHRyYWNlLCBsZWF2aW5nIG9ubHkgdXNlciBjb2RlIGVudHJpZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGN1dG9mZlN0YWNrVHJhY2Uoc3RhY2s/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBsaW5lcyA9IChzdGFjayA/PyAnJykuc3BsaXQoL1xccj9cXG4vKTtcbiAgY29uc3QgYWNjID0gQXJyYXk8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBpZiAoQ1VUT0ZGX1NUQUNLX1BBVFRFUk5TLnRlc3QobGluZSkpIGJyZWFrO1xuICAgIGlmICghRFJPUFBFRF9TVEFDS19GUkFNRVNfUEFUVEVSTlMudGVzdChsaW5lKSkgYWNjLnB1c2gobGluZSk7XG4gIH1cbiAgcmV0dXJuIGFjYy5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBBIGBGYWlsdXJlQ29udmVydGVyYCBpcyByZXNwb25zaWJsZSBmb3IgY29udmVydGluZyBmcm9tIHByb3RvIGBGYWlsdXJlYCBpbnN0YW5jZXMgdG8gSlMgYEVycm9yc2AgYW5kIGJhY2suXG4gKlxuICogV2UgcmVjb21tZW5kZWQgdXNpbmcgdGhlIHtAbGluayBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlcn0gaW5zdGVhZCBvZiBjdXN0b21pemluZyB0aGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBpbiBvcmRlclxuICogdG8gbWFpbnRhaW4gY3Jvc3MtbGFuZ3VhZ2UgRmFpbHVyZSBzZXJpYWxpemF0aW9uIGNvbXBhdGliaWxpdHkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFpbHVyZUNvbnZlcnRlciB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIGNhdWdodCBlcnJvciB0byBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZS5cbiAgICovXG4gIGVycm9yVG9GYWlsdXJlKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZTtcblxuICAvKipcbiAgICogQ29udmVydHMgYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgdG8gYSBKUyBFcnJvciBvYmplY3QuXG4gICAqXG4gICAqIFRoZSByZXR1cm5lZCBlcnJvciBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGBUZW1wb3JhbEZhaWx1cmVgLlxuICAgKi9cbiAgZmFpbHVyZVRvRXJyb3IoZXJyOiBQcm90b0ZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBUZW1wb3JhbEZhaWx1cmU7XG59XG5cbi8qKlxuICogVGhlIFwic2hhcGVcIiBvZiB0aGUgYXR0cmlidXRlcyBzZXQgYXMgdGhlIHtAbGluayBQcm90b0ZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXN9IHBheWxvYWQgaW4gY2FzZVxuICoge0BsaW5rIERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXMuZW5jb2RlQ29tbW9uQXR0cmlidXRlc30gaXMgc2V0IHRvIGB0cnVlYC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWZhdWx0RW5jb2RlZEZhaWx1cmVBdHRyaWJ1dGVzIHtcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBzdGFja190cmFjZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHRoZSB7QGxpbmsgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJ9IGNvbnN0cnVjdG9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlZmF1bHRGYWlsdXJlQ29udmVydGVyT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGVuY29kZSBlcnJvciBtZXNzYWdlcyBhbmQgc3RhY2sgdHJhY2VzIChmb3IgZW5jcnlwdGluZyB0aGVzZSBhdHRyaWJ1dGVzIHVzZSBhIHtAbGluayBQYXlsb2FkQ29kZWN9KS5cbiAgICovXG4gIGVuY29kZUNvbW1vbkF0dHJpYnV0ZXM6IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGVmYXVsdCwgY3Jvc3MtbGFuZ3VhZ2UtY29tcGF0aWJsZSBGYWlsdXJlIGNvbnZlcnRlci5cbiAqXG4gKiBCeSBkZWZhdWx0LCBpdCB3aWxsIGxlYXZlIGVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMgYXMgcGxhaW4gdGV4dC4gSW4gb3JkZXIgdG8gZW5jcnlwdCB0aGVtLCBzZXRcbiAqIGBlbmNvZGVDb21tb25BdHRyaWJ1dGVzYCB0byBgdHJ1ZWAgaW4gdGhlIGNvbnN0cnVjdG9yIG9wdGlvbnMgYW5kIHVzZSBhIHtAbGluayBQYXlsb2FkQ29kZWN9IHRoYXQgY2FuIGVuY3J5cHQgL1xuICogZGVjcnlwdCBQYXlsb2FkcyBpbiB5b3VyIHtAbGluayBXb3JrZXJPcHRpb25zLmRhdGFDb252ZXJ0ZXIgfCBXb3JrZXJ9IGFuZFxuICoge0BsaW5rIENsaWVudE9wdGlvbnMuZGF0YUNvbnZlcnRlciB8IENsaWVudCBvcHRpb25zfS5cbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRGYWlsdXJlQ29udmVydGVyIGltcGxlbWVudHMgRmFpbHVyZUNvbnZlcnRlciB7XG4gIHB1YmxpYyByZWFkb25seSBvcHRpb25zOiBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlck9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFBhcnRpYWw8RGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJPcHRpb25zPikge1xuICAgIGNvbnN0IHsgZW5jb2RlQ29tbW9uQXR0cmlidXRlcyB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICBlbmNvZGVDb21tb25BdHRyaWJ1dGVzOiBlbmNvZGVDb21tb25BdHRyaWJ1dGVzID8/IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgdG8gYSBKUyBFcnJvciBvYmplY3QuXG4gICAqXG4gICAqIERvZXMgbm90IHNldCBjb21tb24gcHJvcGVydGllcywgdGhhdCBpcyBkb25lIGluIHtAbGluayBmYWlsdXJlVG9FcnJvcn0uXG4gICAqL1xuICBmYWlsdXJlVG9FcnJvcklubmVyKGZhaWx1cmU6IFByb3RvRmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFRlbXBvcmFsRmFpbHVyZSB7XG4gICAgaWYgKGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBBcHBsaWNhdGlvbkZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mby50eXBlLFxuICAgICAgICBCb29sZWFuKGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mby5ub25SZXRyeWFibGUpLFxuICAgICAgICBhcnJheUZyb21QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBmYWlsdXJlLmFwcGxpY2F0aW9uRmFpbHVyZUluZm8uZGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuc2VydmVyRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgU2VydmVyRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgQm9vbGVhbihmYWlsdXJlLnNlcnZlckZhaWx1cmVJbmZvLm5vblJldHJ5YWJsZSksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgVGltZW91dEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZyb21QYXlsb2Fkc0F0SW5kZXgocGF5bG9hZENvbnZlcnRlciwgMCwgZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8ubGFzdEhlYXJ0YmVhdERldGFpbHM/LnBheWxvYWRzKSxcbiAgICAgICAgZGVjb2RlVGltZW91dFR5cGUoZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8udGltZW91dFR5cGUpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS50ZXJtaW5hdGVkRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgVGVybWluYXRlZEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5jYW5jZWxlZEZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IENhbmNlbGxlZEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGFycmF5RnJvbVBheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGZhaWx1cmUuY2FuY2VsZWRGYWlsdXJlSW5mby5kZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5yZXNldFdvcmtmbG93RmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgQXBwbGljYXRpb25GYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICAnUmVzZXRXb3JrZmxvdycsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBhcnJheUZyb21QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBmYWlsdXJlLnJlc2V0V29ya2Zsb3dGYWlsdXJlSW5mby5sYXN0SGVhcnRiZWF0RGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvKSB7XG4gICAgICBjb25zdCB7IG5hbWVzcGFjZSwgd29ya2Zsb3dUeXBlLCB3b3JrZmxvd0V4ZWN1dGlvbiwgcmV0cnlTdGF0ZSB9ID0gZmFpbHVyZS5jaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm87XG4gICAgICBpZiAoISh3b3JrZmxvd1R5cGU/Lm5hbWUgJiYgd29ya2Zsb3dFeGVjdXRpb24pKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYXR0cmlidXRlcyBvbiBjaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm8nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUoXG4gICAgICAgIG5hbWVzcGFjZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIHdvcmtmbG93RXhlY3V0aW9uLFxuICAgICAgICB3b3JrZmxvd1R5cGUubmFtZSxcbiAgICAgICAgZGVjb2RlUmV0cnlTdGF0ZShyZXRyeVN0YXRlKSxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8pIHtcbiAgICAgIGlmICghZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmFjdGl2aXR5VHlwZT8ubmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2aXR5VHlwZT8ubmFtZSBvbiBhY3Rpdml0eUZhaWx1cmVJbmZvJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEFjdGl2aXR5RmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmFjdGl2aXR5VHlwZS5uYW1lLFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uYWN0aXZpdHlJZCA/PyB1bmRlZmluZWQsXG4gICAgICAgIGRlY29kZVJldHJ5U3RhdGUoZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLnJldHJ5U3RhdGUpLFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uaWRlbnRpdHkgPz8gdW5kZWZpbmVkLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZW1wb3JhbEZhaWx1cmUoXG4gICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICApO1xuICB9XG5cbiAgZmFpbHVyZVRvRXJyb3IoZmFpbHVyZTogUHJvdG9GYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogVGVtcG9yYWxGYWlsdXJlIHtcbiAgICBpZiAoZmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlcykge1xuICAgICAgY29uc3QgYXR0cnMgPSBwYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkPERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXM+KGZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXMpO1xuICAgICAgLy8gRG9uJ3QgYXBwbHkgZW5jb2RlZEF0dHJpYnV0ZXMgdW5sZXNzIHRoZXkgY29uZm9ybSB0byBhbiBleHBlY3RlZCBzY2hlbWFcbiAgICAgIGlmICh0eXBlb2YgYXR0cnMgPT09ICdvYmplY3QnICYmIGF0dHJzICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHsgbWVzc2FnZSwgc3RhY2tfdHJhY2UgfSA9IGF0dHJzO1xuICAgICAgICAvLyBBdm9pZCBtdXRhdGluZyB0aGUgYXJndW1lbnRcbiAgICAgICAgZmFpbHVyZSA9IHsgLi4uZmFpbHVyZSB9O1xuICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgZmFpbHVyZS5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHN0YWNrX3RyYWNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGZhaWx1cmUuc3RhY2tUcmFjZSA9IHN0YWNrX3RyYWNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGVyciA9IHRoaXMuZmFpbHVyZVRvRXJyb3JJbm5lcihmYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyKTtcbiAgICBlcnIuc3RhY2sgPSBmYWlsdXJlLnN0YWNrVHJhY2UgPz8gJyc7XG4gICAgZXJyLmZhaWx1cmUgPSBmYWlsdXJlO1xuICAgIHJldHVybiBlcnI7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZShlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmUge1xuICAgIGNvbnN0IGZhaWx1cmUgPSB0aGlzLmVycm9yVG9GYWlsdXJlSW5uZXIoZXJyLCBwYXlsb2FkQ29udmVydGVyKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVuY29kZUNvbW1vbkF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IHsgbWVzc2FnZSwgc3RhY2tUcmFjZSB9ID0gZmFpbHVyZTtcbiAgICAgIGZhaWx1cmUubWVzc2FnZSA9ICdFbmNvZGVkIGZhaWx1cmUnO1xuICAgICAgZmFpbHVyZS5zdGFja1RyYWNlID0gJyc7XG4gICAgICBmYWlsdXJlLmVuY29kZWRBdHRyaWJ1dGVzID0gcGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQoeyBtZXNzYWdlLCBzdGFja190cmFjZTogc3RhY2tUcmFjZSB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGZhaWx1cmU7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZUlubmVyKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgICAgaWYgKGVyci5mYWlsdXJlKSByZXR1cm4gZXJyLmZhaWx1cmU7XG4gICAgICBjb25zdCBiYXNlID0ge1xuICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgc3RhY2tUcmFjZTogY3V0b2ZmU3RhY2tUcmFjZShlcnIuc3RhY2spLFxuICAgICAgICBjYXVzZTogdGhpcy5vcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoZXJyLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKSxcbiAgICAgICAgc291cmNlOiBGQUlMVVJFX1NPVVJDRSxcbiAgICAgIH07XG5cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBBY3Rpdml0eUZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGFjdGl2aXR5RmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIC4uLmVycixcbiAgICAgICAgICAgIHJldHJ5U3RhdGU6IGVuY29kZVJldHJ5U3RhdGUoZXJyLnJldHJ5U3RhdGUpLFxuICAgICAgICAgICAgYWN0aXZpdHlUeXBlOiB7IG5hbWU6IGVyci5hY3Rpdml0eVR5cGUgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIENoaWxkV29ya2Zsb3dGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBjaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIC4uLmVycixcbiAgICAgICAgICAgIHJldHJ5U3RhdGU6IGVuY29kZVJldHJ5U3RhdGUoZXJyLnJldHJ5U3RhdGUpLFxuICAgICAgICAgICAgd29ya2Zsb3dFeGVjdXRpb246IGVyci5leGVjdXRpb24sXG4gICAgICAgICAgICB3b3JrZmxvd1R5cGU6IHsgbmFtZTogZXJyLndvcmtmbG93VHlwZSB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQXBwbGljYXRpb25GYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBhcHBsaWNhdGlvbkZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICB0eXBlOiBlcnIudHlwZSxcbiAgICAgICAgICAgIG5vblJldHJ5YWJsZTogZXJyLm5vblJldHJ5YWJsZSxcbiAgICAgICAgICAgIGRldGFpbHM6XG4gICAgICAgICAgICAgIGVyci5kZXRhaWxzICYmIGVyci5kZXRhaWxzLmxlbmd0aFxuICAgICAgICAgICAgICAgID8geyBwYXlsb2FkczogdG9QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCAuLi5lcnIuZGV0YWlscykgfVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmV4dFJldHJ5RGVsYXk6IG1zT3B0aW9uYWxUb1RzKGVyci5uZXh0UmV0cnlEZWxheSksXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDYW5jZWxsZWRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBjYW5jZWxlZEZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICBkZXRhaWxzOlxuICAgICAgICAgICAgICBlcnIuZGV0YWlscyAmJiBlcnIuZGV0YWlscy5sZW5ndGhcbiAgICAgICAgICAgICAgICA/IHsgcGF5bG9hZHM6IHRvUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgLi4uZXJyLmRldGFpbHMpIH1cbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIFRpbWVvdXRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICB0aW1lb3V0RmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIHRpbWVvdXRUeXBlOiBlbmNvZGVUaW1lb3V0VHlwZShlcnIudGltZW91dFR5cGUpLFxuICAgICAgICAgICAgbGFzdEhlYXJ0YmVhdERldGFpbHM6IGVyci5sYXN0SGVhcnRiZWF0RGV0YWlsc1xuICAgICAgICAgICAgICA/IHsgcGF5bG9hZHM6IHRvUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgZXJyLmxhc3RIZWFydGJlYXREZXRhaWxzKSB9XG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgU2VydmVyRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgc2VydmVyRmFpbHVyZUluZm86IHsgbm9uUmV0cnlhYmxlOiBlcnIubm9uUmV0cnlhYmxlIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgVGVybWluYXRlZEZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIHRlcm1pbmF0ZWRGYWlsdXJlSW5mbzoge30sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyBKdXN0IGEgVGVtcG9yYWxGYWlsdXJlXG4gICAgICByZXR1cm4gYmFzZTtcbiAgICB9XG5cbiAgICBjb25zdCBiYXNlID0ge1xuICAgICAgc291cmNlOiBGQUlMVVJFX1NPVVJDRSxcbiAgICB9O1xuXG4gICAgaWYgKGlzRXJyb3IoZXJyKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgbWVzc2FnZTogU3RyaW5nKGVyci5tZXNzYWdlKSA/PyAnJyxcbiAgICAgICAgc3RhY2tUcmFjZTogY3V0b2ZmU3RhY2tUcmFjZShlcnIuc3RhY2spLFxuICAgICAgICBjYXVzZTogdGhpcy5vcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoKGVyciBhcyBhbnkpLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcmVjb21tZW5kYXRpb24gPSBgIFtBIG5vbi1FcnJvciB2YWx1ZSB3YXMgdGhyb3duIGZyb20geW91ciBjb2RlLiBXZSByZWNvbW1lbmQgdGhyb3dpbmcgRXJyb3Igb2JqZWN0cyBzbyB0aGF0IHdlIGNhbiBwcm92aWRlIGEgc3RhY2sgdHJhY2VdYDtcblxuICAgIGlmICh0eXBlb2YgZXJyID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgLi4uYmFzZSwgbWVzc2FnZTogZXJyICsgcmVjb21tZW5kYXRpb24gfTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlcnIgPT09ICdvYmplY3QnKSB7XG4gICAgICBsZXQgbWVzc2FnZSA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgbWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgICB9IGNhdGNoIChfZXJyKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBTdHJpbmcoZXJyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IC4uLmJhc2UsIG1lc3NhZ2U6IG1lc3NhZ2UgKyByZWNvbW1lbmRhdGlvbiB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IC4uLmJhc2UsIG1lc3NhZ2U6IFN0cmluZyhlcnIpICsgcmVjb21tZW5kYXRpb24gfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSB0byBhIEpTIEVycm9yIG9iamVjdCBpZiBkZWZpbmVkIG9yIHJldHVybnMgdW5kZWZpbmVkLlxuICAgKi9cbiAgb3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKFxuICAgIGZhaWx1cmU6IFByb3RvRmFpbHVyZSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlclxuICApOiBUZW1wb3JhbEZhaWx1cmUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBmYWlsdXJlID8gdGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhbiBlcnJvciB0byBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSBpZiBkZWZpbmVkIG9yIHJldHVybnMgdW5kZWZpbmVkXG4gICAqL1xuICBvcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoZXJyOiB1bmtub3duLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogUHJvdG9GYWlsdXJlIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gZXJyID8gdGhpcy5lcnJvclRvRmFpbHVyZShlcnIsIHBheWxvYWRDb252ZXJ0ZXIpIDogdW5kZWZpbmVkO1xuICB9XG59XG4iLCJpbXBvcnQgeyBQYXlsb2FkIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogYFBheWxvYWRDb2RlY2AgaXMgYW4gb3B0aW9uYWwgc3RlcCB0aGF0IGhhcHBlbnMgYmV0d2VlbiB0aGUgd2lyZSBhbmQgdGhlIHtAbGluayBQYXlsb2FkQ29udmVydGVyfTpcbiAqXG4gKiBUZW1wb3JhbCBTZXJ2ZXIgPC0tPiBXaXJlIDwtLT4gYFBheWxvYWRDb2RlY2AgPC0tPiBgUGF5bG9hZENvbnZlcnRlcmAgPC0tPiBVc2VyIGNvZGVcbiAqXG4gKiBJbXBsZW1lbnQgdGhpcyB0byB0cmFuc2Zvcm0gYW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWR9cyB0by9mcm9tIHRoZSBmb3JtYXQgc2VudCBvdmVyIHRoZSB3aXJlIGFuZCBzdG9yZWQgYnkgVGVtcG9yYWwgU2VydmVyLlxuICogQ29tbW9uIHRyYW5zZm9ybWF0aW9ucyBhcmUgZW5jcnlwdGlvbiBhbmQgY29tcHJlc3Npb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZENvZGVjIHtcbiAgLyoqXG4gICAqIEVuY29kZSBhbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZH1zIGZvciBzZW5kaW5nIG92ZXIgdGhlIHdpcmUuXG4gICAqIEBwYXJhbSBwYXlsb2FkcyBNYXkgaGF2ZSBsZW5ndGggMC5cbiAgICovXG4gIGVuY29kZShwYXlsb2FkczogUGF5bG9hZFtdKTogUHJvbWlzZTxQYXlsb2FkW10+O1xuXG4gIC8qKlxuICAgKiBEZWNvZGUgYW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWR9cyByZWNlaXZlZCBmcm9tIHRoZSB3aXJlLlxuICAgKi9cbiAgZGVjb2RlKHBheWxvYWRzOiBQYXlsb2FkW10pOiBQcm9taXNlPFBheWxvYWRbXT47XG59XG4iLCJpbXBvcnQgeyBkZWNvZGUsIGVuY29kZSB9IGZyb20gJy4uL2VuY29kaW5nJztcbmltcG9ydCB7IFBheWxvYWRDb252ZXJ0ZXJFcnJvciwgVmFsdWVFcnJvciB9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQgeyBQYXlsb2FkIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBlbmNvZGluZ0tleXMsIGVuY29kaW5nVHlwZXMsIE1FVEFEQVRBX0VOQ09ESU5HX0tFWSB9IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIFVzZWQgYnkgdGhlIGZyYW1ld29yayB0byBzZXJpYWxpemUvZGVzZXJpYWxpemUgZGF0YSBsaWtlIHBhcmFtZXRlcnMgYW5kIHJldHVybiB2YWx1ZXMuXG4gKlxuICogVGhpcyBpcyBjYWxsZWQgaW5zaWRlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvZGV0ZXJtaW5pc20gfCBXb3JrZmxvdyBpc29sYXRlfS5cbiAqIFRvIHdyaXRlIGFzeW5jIGNvZGUgb3IgdXNlIE5vZGUgQVBJcyAob3IgdXNlIHBhY2thZ2VzIHRoYXQgdXNlIE5vZGUgQVBJcyksIHVzZSBhIHtAbGluayBQYXlsb2FkQ29kZWN9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBheWxvYWRDb252ZXJ0ZXIge1xuICAvKipcbiAgICogQ29udmVydHMgYSB2YWx1ZSB0byBhIHtAbGluayBQYXlsb2FkfS5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LiBFeGFtcGxlIHZhbHVlcyBpbmNsdWRlIHRoZSBXb3JrZmxvdyBhcmdzIHNlbnQgZnJvbSB0aGUgQ2xpZW50IGFuZCB0aGUgdmFsdWVzIHJldHVybmVkIGJ5IGEgV29ya2Zsb3cgb3IgQWN0aXZpdHkuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqXG4gICAqIFNob3VsZCB0aHJvdyB7QGxpbmsgVmFsdWVFcnJvcn0gaWYgdW5hYmxlIHRvIGNvbnZlcnQuXG4gICAqL1xuICB0b1BheWxvYWQ8VD4odmFsdWU6IFQpOiBQYXlsb2FkO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHtAbGluayBQYXlsb2FkfSBiYWNrIHRvIGEgdmFsdWUuXG4gICAqL1xuICBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVDtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRzIGNvbnZlcnNpb24gb2YgYSBsaXN0IG9mIHZhbHVlcy5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyXG4gKiBAcGFyYW0gdmFsdWVzIEpTIHZhbHVlcyB0byBjb252ZXJ0IHRvIFBheWxvYWRzXG4gKiBAcmV0dXJuIGxpc3Qgb2Yge0BsaW5rIFBheWxvYWR9c1xuICogQHRocm93cyB7QGxpbmsgVmFsdWVFcnJvcn0gaWYgY29udmVyc2lvbiBvZiB0aGUgdmFsdWUgcGFzc2VkIGFzIHBhcmFtZXRlciBmYWlsZWQgZm9yIGFueVxuICogICAgIHJlYXNvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvUGF5bG9hZHMoY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCAuLi52YWx1ZXM6IHVua25vd25bXSk6IFBheWxvYWRbXSB8IHVuZGVmaW5lZCB7XG4gIGlmICh2YWx1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZXMubWFwKCh2YWx1ZSkgPT4gY29udmVydGVyLnRvUGF5bG9hZCh2YWx1ZSkpO1xufVxuXG4vKipcbiAqIFJ1biB7QGxpbmsgUGF5bG9hZENvbnZlcnRlci50b1BheWxvYWR9IG9uIGVhY2ggdmFsdWUgaW4gdGhlIG1hcC5cbiAqXG4gKiBAdGhyb3dzIHtAbGluayBWYWx1ZUVycm9yfSBpZiBjb252ZXJzaW9uIG9mIGFueSB2YWx1ZSBpbiB0aGUgbWFwIGZhaWxzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBUb1BheWxvYWRzPEsgZXh0ZW5kcyBzdHJpbmc+KGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgbWFwOiBSZWNvcmQ8SywgYW55Pik6IFJlY29yZDxLLCBQYXlsb2FkPiB7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMobWFwKS5tYXAoKFtrLCB2XSk6IFtLLCBQYXlsb2FkXSA9PiBbayBhcyBLLCBjb252ZXJ0ZXIudG9QYXlsb2FkKHYpXSlcbiAgKSBhcyBSZWNvcmQ8SywgUGF5bG9hZD47XG59XG5cbi8qKlxuICogSW1wbGVtZW50cyBjb252ZXJzaW9uIG9mIGFuIGFycmF5IG9mIHZhbHVlcyBvZiBkaWZmZXJlbnQgdHlwZXMuIFVzZWZ1bCBmb3IgZGVzZXJpYWxpemluZ1xuICogYXJndW1lbnRzIG9mIGZ1bmN0aW9uIGludm9jYXRpb25zLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJcbiAqIEBwYXJhbSBpbmRleCBpbmRleCBvZiB0aGUgdmFsdWUgaW4gdGhlIHBheWxvYWRzXG4gKiBAcGFyYW0gcGF5bG9hZHMgc2VyaWFsaXplZCB2YWx1ZSB0byBjb252ZXJ0IHRvIEpTIHZhbHVlcy5cbiAqIEByZXR1cm4gY29udmVydGVkIEpTIHZhbHVlXG4gKiBAdGhyb3dzIHtAbGluayBQYXlsb2FkQ29udmVydGVyRXJyb3J9IGlmIGNvbnZlcnNpb24gb2YgdGhlIGRhdGEgcGFzc2VkIGFzIHBhcmFtZXRlciBmYWlsZWQgZm9yIGFueVxuICogICAgIHJlYXNvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21QYXlsb2Fkc0F0SW5kZXg8VD4oY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCBpbmRleDogbnVtYmVyLCBwYXlsb2Fkcz86IFBheWxvYWRbXSB8IG51bGwpOiBUIHtcbiAgLy8gVG8gbWFrZSBhZGRpbmcgYXJndW1lbnRzIGEgYmFja3dhcmRzIGNvbXBhdGlibGUgY2hhbmdlXG4gIGlmIChwYXlsb2FkcyA9PT0gdW5kZWZpbmVkIHx8IHBheWxvYWRzID09PSBudWxsIHx8IGluZGV4ID49IHBheWxvYWRzLmxlbmd0aCkge1xuICAgIHJldHVybiB1bmRlZmluZWQgYXMgYW55O1xuICB9XG4gIHJldHVybiBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZHNbaW5kZXhdKTtcbn1cblxuLyoqXG4gKiBSdW4ge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXIuZnJvbVBheWxvYWR9IG9uIGVhY2ggdmFsdWUgaW4gdGhlIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlGcm9tUGF5bG9hZHMoY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCBwYXlsb2Fkcz86IFBheWxvYWRbXSB8IG51bGwpOiB1bmtub3duW10ge1xuICBpZiAoIXBheWxvYWRzKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIHJldHVybiBwYXlsb2Fkcy5tYXAoKHBheWxvYWQ6IFBheWxvYWQpID0+IGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2FkKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXBGcm9tUGF5bG9hZHM8SyBleHRlbmRzIHN0cmluZz4oXG4gIGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcixcbiAgbWFwPzogUmVjb3JkPEssIFBheWxvYWQ+IHwgbnVsbCB8IHVuZGVmaW5lZFxuKTogUmVjb3JkPEssIHVua25vd24+IHwgdW5kZWZpbmVkIHtcbiAgaWYgKG1hcCA9PSBudWxsKSByZXR1cm4gdW5kZWZpbmVkO1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKG1hcCkubWFwKChbaywgcGF5bG9hZF0pOiBbSywgdW5rbm93bl0gPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCBhcyBQYXlsb2FkKTtcbiAgICAgIHJldHVybiBbayBhcyBLLCB2YWx1ZV07XG4gICAgfSlcbiAgKSBhcyBSZWNvcmQ8SywgdW5rbm93bj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHZhbHVlIHRvIGEge0BsaW5rIFBheWxvYWR9LlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuIEV4YW1wbGUgdmFsdWVzIGluY2x1ZGUgdGhlIFdvcmtmbG93IGFyZ3Mgc2VudCBmcm9tIHRoZSBDbGllbnQgYW5kIHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgYSBXb3JrZmxvdyBvciBBY3Rpdml0eS5cbiAgICogQHJldHVybnMgVGhlIHtAbGluayBQYXlsb2FkfSwgb3IgYHVuZGVmaW5lZGAgaWYgdW5hYmxlIHRvIGNvbnZlcnQuXG4gICAqL1xuICB0b1BheWxvYWQ8VD4odmFsdWU6IFQpOiBQYXlsb2FkIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHtAbGluayBQYXlsb2FkfSBiYWNrIHRvIGEgdmFsdWUuXG4gICAqL1xuICBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVDtcblxuICByZWFkb25seSBlbmNvZGluZ1R5cGU6IHN0cmluZztcbn1cblxuLyoqXG4gKiBUcmllcyB0byBjb252ZXJ0IHZhbHVlcyB0byB7QGxpbmsgUGF5bG9hZH1zIHVzaW5nIHRoZSB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZ31zIHByb3ZpZGVkIHRvIHRoZSBjb25zdHJ1Y3RvciwgaW4gdGhlIG9yZGVyIHByb3ZpZGVkLlxuICpcbiAqIENvbnZlcnRzIFBheWxvYWRzIHRvIHZhbHVlcyBiYXNlZCBvbiB0aGUgYFBheWxvYWQubWV0YWRhdGEuZW5jb2RpbmdgIGZpZWxkLCB3aGljaCBtYXRjaGVzIHRoZSB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZy5lbmNvZGluZ1R5cGV9XG4gKiBvZiB0aGUgY29udmVydGVyIHRoYXQgY3JlYXRlZCB0aGUgUGF5bG9hZC5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZVBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyIHtcbiAgcmVhZG9ubHkgY29udmVydGVyczogUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZ1tdO1xuICByZWFkb25seSBjb252ZXJ0ZXJCeUVuY29kaW5nOiBNYXA8c3RyaW5nLCBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nPiA9IG5ldyBNYXAoKTtcblxuICBjb25zdHJ1Y3RvciguLi5jb252ZXJ0ZXJzOiBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nW10pIHtcbiAgICBpZiAoY29udmVydGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBQYXlsb2FkQ29udmVydGVyRXJyb3IoJ011c3QgcHJvdmlkZSBhdCBsZWFzdCBvbmUgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZycpO1xuICAgIH1cblxuICAgIHRoaXMuY29udmVydGVycyA9IGNvbnZlcnRlcnM7XG4gICAgZm9yIChjb25zdCBjb252ZXJ0ZXIgb2YgY29udmVydGVycykge1xuICAgICAgdGhpcy5jb252ZXJ0ZXJCeUVuY29kaW5nLnNldChjb252ZXJ0ZXIuZW5jb2RpbmdUeXBlLCBjb252ZXJ0ZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmllcyB0byBydW4gYC50b1BheWxvYWQodmFsdWUpYCBvbiBlYWNoIGNvbnZlcnRlciBpbiB0aGUgb3JkZXIgcHJvdmlkZWQgYXQgY29uc3RydWN0aW9uLlxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBzdWNjZXNzZnVsIHJlc3VsdCwgdGhyb3dzIHtAbGluayBWYWx1ZUVycm9yfSBpZiB0aGVyZSBpcyBubyBjb252ZXJ0ZXIgdGhhdCBjYW4gaGFuZGxlIHRoZSB2YWx1ZS5cbiAgICovXG4gIHB1YmxpYyB0b1BheWxvYWQ8VD4odmFsdWU6IFQpOiBQYXlsb2FkIHtcbiAgICBmb3IgKGNvbnN0IGNvbnZlcnRlciBvZiB0aGlzLmNvbnZlcnRlcnMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbnZlcnRlci50b1BheWxvYWQodmFsdWUpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFVuYWJsZSB0byBjb252ZXJ0ICR7dmFsdWV9IHRvIHBheWxvYWRgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4ge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmcuZnJvbVBheWxvYWR9IGJhc2VkIG9uIHRoZSBgZW5jb2RpbmdgIG1ldGFkYXRhIG9mIHRoZSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqL1xuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQge1xuICAgIGlmIChwYXlsb2FkLm1ldGFkYXRhID09PSB1bmRlZmluZWQgfHwgcGF5bG9hZC5tZXRhZGF0YSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ01pc3NpbmcgcGF5bG9hZCBtZXRhZGF0YScpO1xuICAgIH1cbiAgICBjb25zdCBlbmNvZGluZyA9IGRlY29kZShwYXlsb2FkLm1ldGFkYXRhW01FVEFEQVRBX0VOQ09ESU5HX0tFWV0pO1xuICAgIGNvbnN0IGNvbnZlcnRlciA9IHRoaXMuY29udmVydGVyQnlFbmNvZGluZy5nZXQoZW5jb2RpbmcpO1xuICAgIGlmIChjb252ZXJ0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFVua25vd24gZW5jb2Rpbmc6ICR7ZW5jb2Rpbmd9YCk7XG4gICAgfVxuICAgIHJldHVybiBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBiZXR3ZWVuIEpTIHVuZGVmaW5lZCBhbmQgTlVMTCBQYXlsb2FkXG4gKi9cbmV4cG9ydCBjbGFzcyBVbmRlZmluZWRQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIHB1YmxpYyBlbmNvZGluZ1R5cGUgPSBlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEw7XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBbTUVUQURBVEFfRU5DT0RJTkdfS0VZXTogZW5jb2RpbmdLZXlzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEwsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4oX2NvbnRlbnQ6IFBheWxvYWQpOiBUIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkIGFzIGFueTsgLy8gSnVzdCByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBiZXR3ZWVuIGJpbmFyeSBkYXRhIHR5cGVzIGFuZCBSQVcgUGF5bG9hZFxuICovXG5leHBvcnQgY2xhc3MgQmluYXJ5UGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmcge1xuICBwdWJsaWMgZW5jb2RpbmdUeXBlID0gZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19SQVc7XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheSkpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIFtNRVRBREFUQV9FTkNPRElOR19LRVldOiBlbmNvZGluZ0tleXMuTUVUQURBVEFfRU5DT0RJTkdfUkFXLFxuICAgICAgfSxcbiAgICAgIGRhdGE6IHZhbHVlLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4oY29udGVudDogUGF5bG9hZCk6IFQge1xuICAgIHJldHVybiAoXG4gICAgICAvLyBXcmFwIHdpdGggVWludDhBcnJheSBmcm9tIHRoaXMgY29udGV4dCB0byBlbnN1cmUgYGluc3RhbmNlb2ZgIHdvcmtzXG4gICAgICAoXG4gICAgICAgIGNvbnRlbnQuZGF0YSA/IG5ldyBVaW50OEFycmF5KGNvbnRlbnQuZGF0YS5idWZmZXIsIGNvbnRlbnQuZGF0YS5ieXRlT2Zmc2V0LCBjb250ZW50LmRhdGEubGVuZ3RoKSA6IGNvbnRlbnQuZGF0YVxuICAgICAgKSBhcyBhbnlcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgYmV0d2VlbiBub24tdW5kZWZpbmVkIHZhbHVlcyBhbmQgc2VyaWFsaXplZCBKU09OIFBheWxvYWRcbiAqL1xuZXhwb3J0IGNsYXNzIEpzb25QYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIHB1YmxpYyBlbmNvZGluZ1R5cGUgPSBlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX0pTT047XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxldCBqc29uO1xuICAgIHRyeSB7XG4gICAgICBqc29uID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIH0gY2F0Y2ggKF9lcnIpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIFtNRVRBREFUQV9FTkNPRElOR19LRVldOiBlbmNvZGluZ0tleXMuTUVUQURBVEFfRU5DT0RJTkdfSlNPTixcbiAgICAgIH0sXG4gICAgICBkYXRhOiBlbmNvZGUoanNvbiksXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihjb250ZW50OiBQYXlsb2FkKTogVCB7XG4gICAgaWYgKGNvbnRlbnQuZGF0YSA9PT0gdW5kZWZpbmVkIHx8IGNvbnRlbnQuZGF0YSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ0dvdCBwYXlsb2FkIHdpdGggbm8gZGF0YScpO1xuICAgIH1cbiAgICByZXR1cm4gSlNPTi5wYXJzZShkZWNvZGUoY29udGVudC5kYXRhKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBTZWFyY2ggQXR0cmlidXRlIHZhbHVlcyB1c2luZyBKc29uUGF5bG9hZENvbnZlcnRlclxuICovXG5leHBvcnQgY2xhc3MgU2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXIge1xuICBqc29uQ29udmVydGVyID0gbmV3IEpzb25QYXlsb2FkQ29udmVydGVyKCk7XG4gIHZhbGlkTm9uRGF0ZVR5cGVzID0gWydzdHJpbmcnLCAnbnVtYmVyJywgJ2Jvb2xlYW4nXTtcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlczogdW5rbm93bik6IFBheWxvYWQge1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgU2VhcmNoQXR0cmlidXRlIHZhbHVlIG11c3QgYmUgYW4gYXJyYXlgKTtcbiAgICB9XG5cbiAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGZpcnN0VmFsdWUgPSB2YWx1ZXNbMF07XG4gICAgICBjb25zdCBmaXJzdFR5cGUgPSB0eXBlb2YgZmlyc3RWYWx1ZTtcbiAgICAgIGlmIChmaXJzdFR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2lkeCwgdmFsdWVdIG9mIHZhbHVlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihcbiAgICAgICAgICAgICAgYFNlYXJjaEF0dHJpYnV0ZSB2YWx1ZXMgbXVzdCBhcnJheXMgb2Ygc3RyaW5ncywgbnVtYmVycywgYm9vbGVhbnMsIG9yIERhdGVzLiBUaGUgdmFsdWUgJHt2YWx1ZX0gYXQgaW5kZXggJHtpZHh9IGlzIG9mIHR5cGUgJHt0eXBlb2YgdmFsdWV9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghdGhpcy52YWxpZE5vbkRhdGVUeXBlcy5pbmNsdWRlcyhmaXJzdFR5cGUpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFNlYXJjaEF0dHJpYnV0ZSBhcnJheSB2YWx1ZXMgbXVzdCBiZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IERhdGVgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgW2lkeCwgdmFsdWVdIG9mIHZhbHVlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBmaXJzdFR5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKFxuICAgICAgICAgICAgICBgQWxsIFNlYXJjaEF0dHJpYnV0ZSBhcnJheSB2YWx1ZXMgbXVzdCBiZSBvZiB0aGUgc2FtZSB0eXBlLiBUaGUgZmlyc3QgdmFsdWUgJHtmaXJzdFZhbHVlfSBvZiB0eXBlICR7Zmlyc3RUeXBlfSBkb2Vzbid0IG1hdGNoIHZhbHVlICR7dmFsdWV9IG9mIHR5cGUgJHt0eXBlb2YgdmFsdWV9IGF0IGluZGV4ICR7aWR4fWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSlNPTi5zdHJpbmdpZnkgdGFrZXMgY2FyZSBvZiBjb252ZXJ0aW5nIERhdGVzIHRvIElTTyBzdHJpbmdzXG4gICAgY29uc3QgcmV0ID0gdGhpcy5qc29uQ29udmVydGVyLnRvUGF5bG9hZCh2YWx1ZXMpO1xuICAgIGlmIChyZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ0NvdWxkIG5vdCBjb252ZXJ0IHNlYXJjaCBhdHRyaWJ1dGVzIHRvIHBheWxvYWRzJyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvKipcbiAgICogRGF0ZXRpbWUgU2VhcmNoIEF0dHJpYnV0ZSB2YWx1ZXMgYXJlIGNvbnZlcnRlZCB0byBgRGF0ZWBzXG4gICAqL1xuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQge1xuICAgIGlmIChwYXlsb2FkLm1ldGFkYXRhID09PSB1bmRlZmluZWQgfHwgcGF5bG9hZC5tZXRhZGF0YSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ01pc3NpbmcgcGF5bG9hZCBtZXRhZGF0YScpO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5qc29uQ29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWQpO1xuICAgIGxldCBhcnJheVdyYXBwZWRWYWx1ZSA9IEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBbdmFsdWVdO1xuXG4gICAgY29uc3Qgc2VhcmNoQXR0cmlidXRlVHlwZSA9IGRlY29kZShwYXlsb2FkLm1ldGFkYXRhLnR5cGUpO1xuICAgIGlmIChzZWFyY2hBdHRyaWJ1dGVUeXBlID09PSAnRGF0ZXRpbWUnKSB7XG4gICAgICBhcnJheVdyYXBwZWRWYWx1ZSA9IGFycmF5V3JhcHBlZFZhbHVlLm1hcCgoZGF0ZVN0cmluZykgPT4gbmV3IERhdGUoZGF0ZVN0cmluZykpO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXlXcmFwcGVkVmFsdWUgYXMgdW5rbm93biBhcyBUO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyID0gbmV3IFNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIoKTtcblxuZXhwb3J0IGNsYXNzIERlZmF1bHRQYXlsb2FkQ29udmVydGVyIGV4dGVuZHMgQ29tcG9zaXRlUGF5bG9hZENvbnZlcnRlciB7XG4gIC8vIE1hdGNoIHRoZSBvcmRlciB1c2VkIGluIG90aGVyIFNES3MsIGJ1dCBleGNsdWRlIFByb3RvYnVmIGNvbnZlcnRlcnMgc28gdGhhdCB0aGUgY29kZSwgaW5jbHVkaW5nXG4gIC8vIGBwcm90bzMtanNvbi1zZXJpYWxpemVyYCwgZG9lc24ndCB0YWtlIHNwYWNlIGluIFdvcmtmbG93IGJ1bmRsZXMgdGhhdCBkb24ndCB1c2UgUHJvdG9idWZzLiBUbyB1c2UgUHJvdG9idWZzLCB1c2VcbiAgLy8ge0BsaW5rIERlZmF1bHRQYXlsb2FkQ29udmVydGVyV2l0aFByb3RvYnVmc30uXG4gIC8vXG4gIC8vIEdvIFNESzpcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3RlbXBvcmFsaW8vc2RrLWdvL2Jsb2IvNWU1NjQ1ZjBjNTUwZGNmNzE3YzA5NWFlMzJjNzZhNzA4N2QyZTk4NS9jb252ZXJ0ZXIvZGVmYXVsdF9kYXRhX2NvbnZlcnRlci5nbyNMMjhcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIobmV3IFVuZGVmaW5lZFBheWxvYWRDb252ZXJ0ZXIoKSwgbmV3IEJpbmFyeVBheWxvYWRDb252ZXJ0ZXIoKSwgbmV3IEpzb25QYXlsb2FkQ29udmVydGVyKCkpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9IHVzZWQgYnkgdGhlIFNESy4gU3VwcG9ydHMgYFVpbnQ4QXJyYXlgIGFuZCBKU09OIHNlcmlhbGl6YWJsZXMgKHNvIGlmXG4gKiB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvSlNPTi9zdHJpbmdpZnkjZGVzY3JpcHRpb24gfCBgSlNPTi5zdHJpbmdpZnkoeW91ckFyZ09yUmV0dmFsKWB9XG4gKiB3b3JrcywgdGhlIGRlZmF1bHQgcGF5bG9hZCBjb252ZXJ0ZXIgd2lsbCB3b3JrKS5cbiAqXG4gKiBUbyBhbHNvIHN1cHBvcnQgUHJvdG9idWZzLCBjcmVhdGUgYSBjdXN0b20gcGF5bG9hZCBjb252ZXJ0ZXIgd2l0aCB7QGxpbmsgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXJ9OlxuICpcbiAqIGBjb25zdCBteUNvbnZlcnRlciA9IG5ldyBEZWZhdWx0UGF5bG9hZENvbnZlcnRlcih7IHByb3RvYnVmUm9vdCB9KWBcbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyID0gbmV3IERlZmF1bHRQYXlsb2FkQ29udmVydGVyKCk7XG4iLCJpbXBvcnQgeyBlbmNvZGUgfSBmcm9tICcuLi9lbmNvZGluZyc7XG5cbmV4cG9ydCBjb25zdCBNRVRBREFUQV9FTkNPRElOR19LRVkgPSAnZW5jb2RpbmcnO1xuZXhwb3J0IGNvbnN0IGVuY29kaW5nVHlwZXMgPSB7XG4gIE1FVEFEQVRBX0VOQ09ESU5HX05VTEw6ICdiaW5hcnkvbnVsbCcsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1JBVzogJ2JpbmFyeS9wbGFpbicsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX0pTT046ICdqc29uL3BsYWluJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUZfSlNPTjogJ2pzb24vcHJvdG9idWYnLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRjogJ2JpbmFyeS9wcm90b2J1ZicsXG59IGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgRW5jb2RpbmdUeXBlID0gKHR5cGVvZiBlbmNvZGluZ1R5cGVzKVtrZXlvZiB0eXBlb2YgZW5jb2RpbmdUeXBlc107XG5cbmV4cG9ydCBjb25zdCBlbmNvZGluZ0tleXMgPSB7XG4gIE1FVEFEQVRBX0VOQ09ESU5HX05VTEw6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEwpLFxuICBNRVRBREFUQV9FTkNPRElOR19SQVc6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1JBVyksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX0pTT046IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX0pTT04pLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OKSxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUY6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGKSxcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBNRVRBREFUQV9NRVNTQUdFX1RZUEVfS0VZID0gJ21lc3NhZ2VUeXBlJztcbiIsImltcG9ydCAqIGFzIHRpbWUgZnJvbSAnLi90aW1lJztcbmltcG9ydCB7IHR5cGUgVGltZXN0YW1wLCBEdXJhdGlvbiB9IGZyb20gJy4vdGltZSc7XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93LlxuICogSWYgdHMgaXMgbnVsbCBvciB1bmRlZmluZWQgcmV0dXJucyB1bmRlZmluZWQuXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUub3B0aW9uYWxUc1RvTXModHMpO1xufVxuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvd1xuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgcmV0dXJuIHRpbWUudHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNOdW1iZXJUb1RzKG1pbGxpczogbnVtYmVyKTogVGltZXN0YW1wIHtcbiAgcmV0dXJuIHRpbWUubXNOdW1iZXJUb1RzKG1pbGxpcyk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zVG9UcyhzdHI6IER1cmF0aW9uKTogVGltZXN0YW1wIHtcbiAgcmV0dXJuIHRpbWUubXNUb1RzKHN0cik7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb1RzKHN0cjogRHVyYXRpb24gfCB1bmRlZmluZWQpOiBUaW1lc3RhbXAgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdGltZS5tc09wdGlvbmFsVG9UcyhzdHIpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9OdW1iZXIodmFsOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm1zT3B0aW9uYWxUb051bWJlcih2YWwpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc1RvTnVtYmVyKHZhbDogRHVyYXRpb24pOiBudW1iZXIge1xuICByZXR1cm4gdGltZS5tc1RvTnVtYmVyKHZhbCk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRzVG9EYXRlKHRzOiBUaW1lc3RhbXApOiBEYXRlIHtcbiAgcmV0dXJuIHRpbWUudHNUb0RhdGUodHMpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9EYXRlKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm9wdGlvbmFsVHNUb0RhdGUodHMpO1xufVxuIiwiLy8gUGFzdGVkIHdpdGggbW9kaWZpY2F0aW9ucyBmcm9tOiBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vYW5vbnljby9GYXN0ZXN0U21hbGxlc3RUZXh0RW5jb2RlckRlY29kZXIvbWFzdGVyL0VuY29kZXJEZWNvZGVyVG9nZXRoZXIuc3JjLmpzXG4vKiBlc2xpbnQgbm8tZmFsbHRocm91Z2g6IDAgKi9cblxuY29uc3QgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcbmNvbnN0IGVuY29kZXJSZWdleHAgPSAvW1xceDgwLVxcdUQ3ZmZcXHVEQzAwLVxcdUZGRkZdfFtcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0/L2c7XG5jb25zdCB0bXBCdWZmZXJVMTYgPSBuZXcgVWludDE2QXJyYXkoMzIpO1xuXG5leHBvcnQgY2xhc3MgVGV4dERlY29kZXIge1xuICBkZWNvZGUoaW5wdXRBcnJheU9yQnVmZmVyOiBVaW50OEFycmF5IHwgQXJyYXlCdWZmZXIgfCBTaGFyZWRBcnJheUJ1ZmZlcik6IHN0cmluZyB7XG4gICAgY29uc3QgaW5wdXRBczggPSBpbnB1dEFycmF5T3JCdWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gaW5wdXRBcnJheU9yQnVmZmVyIDogbmV3IFVpbnQ4QXJyYXkoaW5wdXRBcnJheU9yQnVmZmVyKTtcblxuICAgIGxldCByZXN1bHRpbmdTdHJpbmcgPSAnJyxcbiAgICAgIHRtcFN0ciA9ICcnLFxuICAgICAgaW5kZXggPSAwLFxuICAgICAgbmV4dEVuZCA9IDAsXG4gICAgICBjcDAgPSAwLFxuICAgICAgY29kZVBvaW50ID0gMCxcbiAgICAgIG1pbkJpdHMgPSAwLFxuICAgICAgY3AxID0gMCxcbiAgICAgIHBvcyA9IDAsXG4gICAgICB0bXAgPSAtMTtcbiAgICBjb25zdCBsZW4gPSBpbnB1dEFzOC5sZW5ndGggfCAwO1xuICAgIGNvbnN0IGxlbk1pbnVzMzIgPSAobGVuIC0gMzIpIHwgMDtcbiAgICAvLyBOb3RlIHRoYXQgdG1wIHJlcHJlc2VudHMgdGhlIDJuZCBoYWxmIG9mIGEgc3Vycm9nYXRlIHBhaXIgaW5jYXNlIGEgc3Vycm9nYXRlIGdldHMgZGl2aWRlZCBiZXR3ZWVuIGJsb2Nrc1xuICAgIGZvciAoOyBpbmRleCA8IGxlbjsgKSB7XG4gICAgICBuZXh0RW5kID0gaW5kZXggPD0gbGVuTWludXMzMiA/IDMyIDogKGxlbiAtIGluZGV4KSB8IDA7XG4gICAgICBmb3IgKDsgcG9zIDwgbmV4dEVuZDsgaW5kZXggPSAoaW5kZXggKyAxKSB8IDAsIHBvcyA9IChwb3MgKyAxKSB8IDApIHtcbiAgICAgICAgY3AwID0gaW5wdXRBczhbaW5kZXhdICYgMHhmZjtcbiAgICAgICAgc3dpdGNoIChjcDAgPj4gNCkge1xuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICBjcDEgPSBpbnB1dEFzOFsoaW5kZXggPSAoaW5kZXggKyAxKSB8IDApXSAmIDB4ZmY7XG4gICAgICAgICAgICBpZiAoY3AxID4+IDYgIT09IDBiMTAgfHwgMGIxMTExMDExMSA8IGNwMCkge1xuICAgICAgICAgICAgICBpbmRleCA9IChpbmRleCAtIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSAoKGNwMCAmIDBiMTExKSA8PCA2KSB8IChjcDEgJiAwYjAwMTExMTExKTtcbiAgICAgICAgICAgIG1pbkJpdHMgPSA1OyAvLyAyMCBlbnN1cmVzIGl0IG5ldmVyIHBhc3NlcyAtPiBhbGwgaW52YWxpZCByZXBsYWNlbWVudHNcbiAgICAgICAgICAgIGNwMCA9IDB4MTAwOyAvLyAga2VlcCB0cmFjayBvZiB0aCBiaXQgc2l6ZVxuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICBjcDEgPSBpbnB1dEFzOFsoaW5kZXggPSAoaW5kZXggKyAxKSB8IDApXSAmIDB4ZmY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPDw9IDY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgfD0gKChjcDAgJiAwYjExMTEpIDw8IDYpIHwgKGNwMSAmIDBiMDAxMTExMTEpO1xuICAgICAgICAgICAgbWluQml0cyA9IGNwMSA+PiA2ID09PSAwYjEwID8gKG1pbkJpdHMgKyA0KSB8IDAgOiAyNDsgLy8gMjQgZW5zdXJlcyBpdCBuZXZlciBwYXNzZXMgLT4gYWxsIGludmFsaWQgcmVwbGFjZW1lbnRzXG4gICAgICAgICAgICBjcDAgPSAoY3AwICsgMHgxMDApICYgMHgzMDA7IC8vIGtlZXAgdHJhY2sgb2YgdGggYml0IHNpemVcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBjcDEgPSBpbnB1dEFzOFsoaW5kZXggPSAoaW5kZXggKyAxKSB8IDApXSAmIDB4ZmY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPDw9IDY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgfD0gKChjcDAgJiAwYjExMTExKSA8PCA2KSB8IChjcDEgJiAwYjAwMTExMTExKTtcbiAgICAgICAgICAgIG1pbkJpdHMgPSAobWluQml0cyArIDcpIHwgMDtcblxuICAgICAgICAgICAgLy8gTm93LCBwcm9jZXNzIHRoZSBjb2RlIHBvaW50XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBsZW4gJiYgY3AxID4+IDYgPT09IDBiMTAgJiYgY29kZVBvaW50ID4+IG1pbkJpdHMgJiYgY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY3AwID0gY29kZVBvaW50O1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSAoY29kZVBvaW50IC0gMHgxMDAwMCkgfCAwO1xuICAgICAgICAgICAgICBpZiAoMCA8PSBjb2RlUG9pbnQgLyoweGZmZmYgPCBjb2RlUG9pbnQqLykge1xuICAgICAgICAgICAgICAgIC8vIEJNUCBjb2RlIHBvaW50XG4gICAgICAgICAgICAgICAgLy9uZXh0RW5kID0gbmV4dEVuZCAtIDF8MDtcblxuICAgICAgICAgICAgICAgIHRtcCA9ICgoY29kZVBvaW50ID4+IDEwKSArIDB4ZDgwMCkgfCAwOyAvLyBoaWdoU3Vycm9nYXRlXG4gICAgICAgICAgICAgICAgY3AwID0gKChjb2RlUG9pbnQgJiAweDNmZikgKyAweGRjMDApIHwgMDsgLy8gbG93U3Vycm9nYXRlICh3aWxsIGJlIGluc2VydGVkIGxhdGVyIGluIHRoZSBzd2l0Y2gtc3RhdGVtZW50KVxuXG4gICAgICAgICAgICAgICAgaWYgKHBvcyA8IDMxKSB7XG4gICAgICAgICAgICAgICAgICAvLyBub3RpY2UgMzEgaW5zdGVhZCBvZiAzMlxuICAgICAgICAgICAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSB0bXA7XG4gICAgICAgICAgICAgICAgICBwb3MgPSAocG9zICsgMSkgfCAwO1xuICAgICAgICAgICAgICAgICAgdG1wID0gLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIGVsc2UsIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBpbnB1dEFzOCBhbmQgbGV0IHRtcDAgYmUgZmlsbGVkIGluIGxhdGVyIG9uXG4gICAgICAgICAgICAgICAgICAvLyBOT1RFIHRoYXQgY3AxIGlzIGJlaW5nIHVzZWQgYXMgYSB0ZW1wb3JhcnkgdmFyaWFibGUgZm9yIHRoZSBzd2FwcGluZyBvZiB0bXAgd2l0aCBjcDBcbiAgICAgICAgICAgICAgICAgIGNwMSA9IHRtcDtcbiAgICAgICAgICAgICAgICAgIHRtcCA9IGNwMDtcbiAgICAgICAgICAgICAgICAgIGNwMCA9IGNwMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBuZXh0RW5kID0gKG5leHRFbmQgKyAxKSB8IDA7IC8vIGJlY2F1c2Ugd2UgYXJlIGFkdmFuY2luZyBpIHdpdGhvdXQgYWR2YW5jaW5nIHBvc1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gaW52YWxpZCBjb2RlIHBvaW50IG1lYW5zIHJlcGxhY2luZyB0aGUgd2hvbGUgdGhpbmcgd2l0aCBudWxsIHJlcGxhY2VtZW50IGNoYXJhY3RlcnNcbiAgICAgICAgICAgICAgY3AwID4+PSA4O1xuICAgICAgICAgICAgICBpbmRleCA9IChpbmRleCAtIGNwMCAtIDEpIHwgMDsgLy8gcmVzZXQgaW5kZXggIGJhY2sgdG8gd2hhdCBpdCB3YXMgYmVmb3JlXG4gICAgICAgICAgICAgIGNwMCA9IDB4ZmZmZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmluYWxseSwgcmVzZXQgdGhlIHZhcmlhYmxlcyBmb3IgdGhlIG5leHQgZ28tYXJvdW5kXG4gICAgICAgICAgICBtaW5CaXRzID0gMDtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IDA7XG4gICAgICAgICAgICBuZXh0RW5kID0gaW5kZXggPD0gbGVuTWludXMzMiA/IDMyIDogKGxlbiAtIGluZGV4KSB8IDA7XG4gICAgICAgICAgLypjYXNlIDExOlxuICAgICAgICBjYXNlIDEwOlxuICAgICAgICBjYXNlIDk6XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICBjb2RlUG9pbnQgPyBjb2RlUG9pbnQgPSAwIDogY3AwID0gMHhmZmZkOyAvLyBmaWxsIHdpdGggaW52YWxpZCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICBjYXNlIDY6XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICBjYXNlIDM6XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSBjcDA7XG4gICAgICAgICAgY29udGludWU7Ki9cbiAgICAgICAgICBkZWZhdWx0OiAvLyBmaWxsIHdpdGggaW52YWxpZCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcbiAgICAgICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gY3AwO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICBjYXNlIDg6XG4gICAgICAgIH1cbiAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSAweGZmZmQ7IC8vIGZpbGwgd2l0aCBpbnZhbGlkIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuICAgICAgfVxuICAgICAgdG1wU3RyICs9IGZyb21DaGFyQ29kZShcbiAgICAgICAgdG1wQnVmZmVyVTE2WzBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzNdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbNF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls1XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzZdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbN10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls4XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzldLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTFdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTJdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTNdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTRdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTVdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTZdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTddLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMThdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTldLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjFdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjJdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjNdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjRdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjVdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjZdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjddLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjhdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjldLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMzBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMzFdXG4gICAgICApO1xuICAgICAgaWYgKHBvcyA8IDMyKSB0bXBTdHIgPSB0bXBTdHIuc2xpY2UoMCwgKHBvcyAtIDMyKSB8IDApOyAvLy0oMzItcG9zKSk7XG4gICAgICBpZiAoaW5kZXggPCBsZW4pIHtcbiAgICAgICAgLy9mcm9tQ2hhckNvZGUuYXBwbHkoMCwgdG1wQnVmZmVyVTE2IDogVWludDhBcnJheSA/ICB0bXBCdWZmZXJVMTYuc3ViYXJyYXkoMCxwb3MpIDogdG1wQnVmZmVyVTE2LnNsaWNlKDAscG9zKSk7XG4gICAgICAgIHRtcEJ1ZmZlclUxNlswXSA9IHRtcDtcbiAgICAgICAgcG9zID0gfnRtcCA+Pj4gMzE7IC8vdG1wICE9PSAtMSA/IDEgOiAwO1xuICAgICAgICB0bXAgPSAtMTtcblxuICAgICAgICBpZiAodG1wU3RyLmxlbmd0aCA8IHJlc3VsdGluZ1N0cmluZy5sZW5ndGgpIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmICh0bXAgIT09IC0xKSB7XG4gICAgICAgIHRtcFN0ciArPSBmcm9tQ2hhckNvZGUodG1wKTtcbiAgICAgIH1cblxuICAgICAgcmVzdWx0aW5nU3RyaW5nICs9IHRtcFN0cjtcbiAgICAgIHRtcFN0ciA9ICcnO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRpbmdTdHJpbmc7XG4gIH1cbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmZ1bmN0aW9uIGVuY29kZXJSZXBsYWNlcihub25Bc2NpaUNoYXJzOiBzdHJpbmcpIHtcbiAgLy8gbWFrZSB0aGUgVVRGIHN0cmluZyBpbnRvIGEgYmluYXJ5IFVURi04IGVuY29kZWQgc3RyaW5nXG4gIGxldCBwb2ludCA9IG5vbkFzY2lpQ2hhcnMuY2hhckNvZGVBdCgwKSB8IDA7XG4gIGlmICgweGQ4MDAgPD0gcG9pbnQpIHtcbiAgICBpZiAocG9pbnQgPD0gMHhkYmZmKSB7XG4gICAgICBjb25zdCBuZXh0Y29kZSA9IG5vbkFzY2lpQ2hhcnMuY2hhckNvZGVBdCgxKSB8IDA7IC8vIGRlZmF1bHRzIHRvIDAgd2hlbiBOYU4sIGNhdXNpbmcgbnVsbCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcblxuICAgICAgaWYgKDB4ZGMwMCA8PSBuZXh0Y29kZSAmJiBuZXh0Y29kZSA8PSAweGRmZmYpIHtcbiAgICAgICAgLy9wb2ludCA9ICgocG9pbnQgLSAweEQ4MDApPDwxMCkgKyBuZXh0Y29kZSAtIDB4REMwMCArIDB4MTAwMDB8MDtcbiAgICAgICAgcG9pbnQgPSAoKHBvaW50IDw8IDEwKSArIG5leHRjb2RlIC0gMHgzNWZkYzAwKSB8IDA7XG4gICAgICAgIGlmIChwb2ludCA+IDB4ZmZmZilcbiAgICAgICAgICByZXR1cm4gZnJvbUNoYXJDb2RlKFxuICAgICAgICAgICAgKDB4MWUgLyowYjExMTEwKi8gPDwgMykgfCAocG9pbnQgPj4gMTgpLFxuICAgICAgICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gMTIpICYgMHgzZikgLyowYjAwMTExMTExKi8sXG4gICAgICAgICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovLFxuICAgICAgICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovXG4gICAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgIH0gZWxzZSBpZiAocG9pbnQgPD0gMHhkZmZmKSB7XG4gICAgICBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgIH1cbiAgfVxuICAvKmlmIChwb2ludCA8PSAweDAwN2YpIHJldHVybiBub25Bc2NpaUNoYXJzO1xuICBlbHNlICovIGlmIChwb2ludCA8PSAweDA3ZmYpIHtcbiAgICByZXR1cm4gZnJvbUNoYXJDb2RlKCgweDYgPDwgNSkgfCAocG9pbnQgPj4gNiksICgweDIgPDwgNikgfCAocG9pbnQgJiAweDNmKSk7XG4gIH0gZWxzZVxuICAgIHJldHVybiBmcm9tQ2hhckNvZGUoXG4gICAgICAoMHhlIC8qMGIxMTEwKi8gPDwgNCkgfCAocG9pbnQgPj4gMTIpLFxuICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLyxcbiAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqL1xuICAgICk7XG59XG5cbmV4cG9ydCBjbGFzcyBUZXh0RW5jb2RlciB7XG4gIHB1YmxpYyBlbmNvZGUoaW5wdXRTdHJpbmc6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICAgIC8vIDB4YzAgPT4gMGIxMTAwMDAwMDsgMHhmZiA9PiAwYjExMTExMTExOyAweGMwLTB4ZmYgPT4gMGIxMXh4eHh4eFxuICAgIC8vIDB4ODAgPT4gMGIxMDAwMDAwMDsgMHhiZiA9PiAwYjEwMTExMTExOyAweDgwLTB4YmYgPT4gMGIxMHh4eHh4eFxuICAgIGNvbnN0IGVuY29kZWRTdHJpbmcgPSBpbnB1dFN0cmluZyA9PT0gdm9pZCAwID8gJycgOiAnJyArIGlucHV0U3RyaW5nLFxuICAgICAgbGVuID0gZW5jb2RlZFN0cmluZy5sZW5ndGggfCAwO1xuICAgIGxldCByZXN1bHQgPSBuZXcgVWludDhBcnJheSgoKGxlbiA8PCAxKSArIDgpIHwgMCk7XG4gICAgbGV0IHRtcFJlc3VsdDogVWludDhBcnJheTtcbiAgICBsZXQgaSA9IDAsXG4gICAgICBwb3MgPSAwLFxuICAgICAgcG9pbnQgPSAwLFxuICAgICAgbmV4dGNvZGUgPSAwO1xuICAgIGxldCB1cGdyYWRlZGVkQXJyYXlTaXplID0gIVVpbnQ4QXJyYXk7IC8vIG5vcm1hbCBhcnJheXMgYXJlIGF1dG8tZXhwYW5kaW5nXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSA9IChpICsgMSkgfCAwLCBwb3MgPSAocG9zICsgMSkgfCAwKSB7XG4gICAgICBwb2ludCA9IGVuY29kZWRTdHJpbmcuY2hhckNvZGVBdChpKSB8IDA7XG4gICAgICBpZiAocG9pbnQgPD0gMHgwMDdmKSB7XG4gICAgICAgIHJlc3VsdFtwb3NdID0gcG9pbnQ7XG4gICAgICB9IGVsc2UgaWYgKHBvaW50IDw9IDB4MDdmZikge1xuICAgICAgICByZXN1bHRbcG9zXSA9ICgweDYgPDwgNSkgfCAocG9pbnQgPj4gNik7XG4gICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiA8PCA2KSB8IChwb2ludCAmIDB4M2YpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2lkZW5DaGVjazoge1xuICAgICAgICAgIGlmICgweGQ4MDAgPD0gcG9pbnQpIHtcbiAgICAgICAgICAgIGlmIChwb2ludCA8PSAweGRiZmYpIHtcbiAgICAgICAgICAgICAgbmV4dGNvZGUgPSBlbmNvZGVkU3RyaW5nLmNoYXJDb2RlQXQoKGkgPSAoaSArIDEpIHwgMCkpIHwgMDsgLy8gZGVmYXVsdHMgdG8gMCB3aGVuIE5hTiwgY2F1c2luZyBudWxsIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuXG4gICAgICAgICAgICAgIGlmICgweGRjMDAgPD0gbmV4dGNvZGUgJiYgbmV4dGNvZGUgPD0gMHhkZmZmKSB7XG4gICAgICAgICAgICAgICAgLy9wb2ludCA9ICgocG9pbnQgLSAweEQ4MDApPDwxMCkgKyBuZXh0Y29kZSAtIDB4REMwMCArIDB4MTAwMDB8MDtcbiAgICAgICAgICAgICAgICBwb2ludCA9ICgocG9pbnQgPDwgMTApICsgbmV4dGNvZGUgLSAweDM1ZmRjMDApIHwgMDtcbiAgICAgICAgICAgICAgICBpZiAocG9pbnQgPiAweGZmZmYpIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFtwb3NdID0gKDB4MWUgLyowYjExMTEwKi8gPDwgMykgfCAocG9pbnQgPj4gMTgpO1xuICAgICAgICAgICAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiAxMikgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrIHdpZGVuQ2hlY2s7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocG9pbnQgPD0gMHhkZmZmKSB7XG4gICAgICAgICAgICAgIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghdXBncmFkZWRlZEFycmF5U2l6ZSAmJiBpIDw8IDEgPCBwb3MgJiYgaSA8PCAxIDwgKChwb3MgLSA3KSB8IDApKSB7XG4gICAgICAgICAgICB1cGdyYWRlZGVkQXJyYXlTaXplID0gdHJ1ZTtcbiAgICAgICAgICAgIHRtcFJlc3VsdCA9IG5ldyBVaW50OEFycmF5KGxlbiAqIDMpO1xuICAgICAgICAgICAgdG1wUmVzdWx0LnNldChyZXN1bHQpO1xuICAgICAgICAgICAgcmVzdWx0ID0gdG1wUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbcG9zXSA9ICgweGUgLyowYjExMTAqLyA8PCA0KSB8IChwb2ludCA+PiAxMik7XG4gICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBVaW50OEFycmF5ID8gcmVzdWx0LnN1YmFycmF5KDAsIHBvcykgOiByZXN1bHQuc2xpY2UoMCwgcG9zKTtcbiAgfVxuXG4gIHB1YmxpYyBlbmNvZGVJbnRvKGlucHV0U3RyaW5nOiBzdHJpbmcsIHU4QXJyOiBVaW50OEFycmF5KTogeyB3cml0dGVuOiBudW1iZXI7IHJlYWQ6IG51bWJlciB9IHtcbiAgICBjb25zdCBlbmNvZGVkU3RyaW5nID0gaW5wdXRTdHJpbmcgPT09IHZvaWQgMCA/ICcnIDogKCcnICsgaW5wdXRTdHJpbmcpLnJlcGxhY2UoZW5jb2RlclJlZ2V4cCwgZW5jb2RlclJlcGxhY2VyKTtcbiAgICBsZXQgbGVuID0gZW5jb2RlZFN0cmluZy5sZW5ndGggfCAwLFxuICAgICAgaSA9IDAsXG4gICAgICBjaGFyID0gMCxcbiAgICAgIHJlYWQgPSAwO1xuICAgIGNvbnN0IHU4QXJyTGVuID0gdThBcnIubGVuZ3RoIHwgMDtcbiAgICBjb25zdCBpbnB1dExlbmd0aCA9IGlucHV0U3RyaW5nLmxlbmd0aCB8IDA7XG4gICAgaWYgKHU4QXJyTGVuIDwgbGVuKSBsZW4gPSB1OEFyckxlbjtcbiAgICBwdXRDaGFyczoge1xuICAgICAgZm9yICg7IGkgPCBsZW47IGkgPSAoaSArIDEpIHwgMCkge1xuICAgICAgICBjaGFyID0gZW5jb2RlZFN0cmluZy5jaGFyQ29kZUF0KGkpIHwgMDtcbiAgICAgICAgc3dpdGNoIChjaGFyID4+IDQpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgIC8vIGV4dGVuc2lvbiBwb2ludHM6XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICBpZiAoKChpICsgMSkgfCAwKSA8IHU4QXJyTGVuKSB7XG4gICAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgIGlmICgoKGkgKyAyKSB8IDApIDwgdThBcnJMZW4pIHtcbiAgICAgICAgICAgICAgLy9pZiAoIShjaGFyID09PSAweEVGICYmIGVuY29kZWRTdHJpbmcuc3Vic3RyKGkrMXwwLDIpID09PSBcIlxceEJGXFx4QkRcIikpXG4gICAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgIGlmICgoKGkgKyAzKSB8IDApIDwgdThBcnJMZW4pIHtcbiAgICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWsgcHV0Q2hhcnM7XG4gICAgICAgIH1cbiAgICAgICAgLy9yZWFkID0gcmVhZCArICgoY2hhciA+PiA2KSAhPT0gMikgfDA7XG4gICAgICAgIHU4QXJyW2ldID0gY2hhcjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgd3JpdHRlbjogaSwgcmVhZDogaW5wdXRMZW5ndGggPCByZWFkID8gaW5wdXRMZW5ndGggOiByZWFkIH07XG4gIH1cbn1cblxuLyoqXG4gKiBFbmNvZGUgYSBVVEYtOCBzdHJpbmcgaW50byBhIFVpbnQ4QXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZShzOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIFRleHRFbmNvZGVyLnByb3RvdHlwZS5lbmNvZGUocyk7XG59XG5cbi8qKlxuICogRGVjb2RlIGEgVWludDhBcnJheSBpbnRvIGEgVVRGLTggc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGUoYTogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIHJldHVybiBUZXh0RGVjb2Rlci5wcm90b3R5cGUuZGVjb2RlKGEpO1xufVxuIiwiaW1wb3J0IHsgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbi8qKlxuICogVGhyb3duIGZyb20gY29kZSB0aGF0IHJlY2VpdmVzIGEgdmFsdWUgdGhhdCBpcyB1bmV4cGVjdGVkIG9yIHRoYXQgaXQncyB1bmFibGUgdG8gaGFuZGxlLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1ZhbHVlRXJyb3InKVxuZXhwb3J0IGNsYXNzIFZhbHVlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgY2F1c2U/OiB1bmtub3duXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gdW5kZWZpbmVkKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgUGF5bG9hZCBDb252ZXJ0ZXIgaXMgbWlzY29uZmlndXJlZC5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdQYXlsb2FkQ29udmVydGVyRXJyb3InKVxuZXhwb3J0IGNsYXNzIFBheWxvYWRDb252ZXJ0ZXJFcnJvciBleHRlbmRzIFZhbHVlRXJyb3Ige31cblxuLyoqXG4gKiBVc2VkIGluIGRpZmZlcmVudCBwYXJ0cyBvZiB0aGUgU0RLIHRvIG5vdGUgdGhhdCBzb21ldGhpbmcgdW5leHBlY3RlZCBoYXMgaGFwcGVuZWQuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignSWxsZWdhbFN0YXRlRXJyb3InKVxuZXhwb3J0IGNsYXNzIElsbGVnYWxTdGF0ZUVycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIFdvcmtmbG93IHdpdGggdGhlIGdpdmVuIElkIGlzIG5vdCBrbm93biB0byBUZW1wb3JhbCBTZXJ2ZXIuXG4gKiBJdCBjb3VsZCBiZSBiZWNhdXNlOlxuICogLSBJZCBwYXNzZWQgaXMgaW5jb3JyZWN0XG4gKiAtIFdvcmtmbG93IGlzIGNsb3NlZCAoZm9yIHNvbWUgY2FsbHMsIGUuZy4gYHRlcm1pbmF0ZWApXG4gKiAtIFdvcmtmbG93IHdhcyBkZWxldGVkIGZyb20gdGhlIFNlcnZlciBhZnRlciByZWFjaGluZyBpdHMgcmV0ZW50aW9uIGxpbWl0XG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignV29ya2Zsb3dOb3RGb3VuZEVycm9yJylcbmV4cG9ydCBjbGFzcyBXb3JrZmxvd05vdEZvdW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBydW5JZDogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gdGhlIHNwZWNpZmllZCBuYW1lc3BhY2UgaXMgbm90IGtub3duIHRvIFRlbXBvcmFsIFNlcnZlci5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdOYW1lc3BhY2VOb3RGb3VuZEVycm9yJylcbmV4cG9ydCBjbGFzcyBOYW1lc3BhY2VOb3RGb3VuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgbmFtZXNwYWNlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgTmFtZXNwYWNlIG5vdCBmb3VuZDogJyR7bmFtZXNwYWNlfSdgKTtcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IGVycm9yTWVzc2FnZSwgaXNSZWNvcmQsIFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICcuL3RpbWUnO1xuaW1wb3J0IHsgbWFrZVByb3RvRW51bUNvbnZlcnRlcnMgfSBmcm9tICcuL2ludGVybmFsLXdvcmtmbG93JztcblxuZXhwb3J0IGNvbnN0IEZBSUxVUkVfU09VUkNFID0gJ1R5cGVTY3JpcHRTREsnO1xuZXhwb3J0IHR5cGUgUHJvdG9GYWlsdXJlID0gdGVtcG9yYWwuYXBpLmZhaWx1cmUudjEuSUZhaWx1cmU7XG5cbmV4cG9ydCBjb25zdCBUaW1lb3V0VHlwZSA9IHtcbiAgU1RBUlRfVE9fQ0xPU0U6ICdTVEFSVF9UT19DTE9TRScsXG4gIFNDSEVEVUxFX1RPX1NUQVJUOiAnU0NIRURVTEVfVE9fU1RBUlQnLFxuICBTQ0hFRFVMRV9UT19DTE9TRTogJ1NDSEVEVUxFX1RPX0NMT1NFJyxcbiAgSEVBUlRCRUFUOiAnSEVBUlRCRUFUJyxcblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBTVEFSVF9UT19DTE9TRX0gaW5zdGVhZC4gKi9cbiAgVElNRU9VVF9UWVBFX1NUQVJUX1RPX0NMT1NFOiAnU1RBUlRfVE9fQ0xPU0UnLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG5cbiAgLyoqIEBkZXByZWNhdGVkIFVzZSB7QGxpbmsgU0NIRURVTEVfVE9fU1RBUlR9IGluc3RlYWQuICovXG4gIFRJTUVPVVRfVFlQRV9TQ0hFRFVMRV9UT19TVEFSVDogJ1NDSEVEVUxFX1RPX1NUQVJUJywgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvblxuXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2Uge0BsaW5rIFNDSEVEVUxFX1RPX0NMT1NFfSBpbnN0ZWFkLiAqL1xuICBUSU1FT1VUX1RZUEVfU0NIRURVTEVfVE9fQ0xPU0U6ICdTQ0hFRFVMRV9UT19DTE9TRScsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBIRUFSVEJFQVR9IGluc3RlYWQuICovXG4gIFRJTUVPVVRfVFlQRV9IRUFSVEJFQVQ6ICdIRUFSVEJFQVQnLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG5cbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgdW5kZWZpbmVkYCBpbnN0ZWFkLiAqL1xuICBUSU1FT1VUX1RZUEVfVU5TUEVDSUZJRUQ6IHVuZGVmaW5lZCwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvblxufSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIFRpbWVvdXRUeXBlID0gKHR5cGVvZiBUaW1lb3V0VHlwZSlba2V5b2YgdHlwZW9mIFRpbWVvdXRUeXBlXTtcblxuZXhwb3J0IGNvbnN0IFtlbmNvZGVUaW1lb3V0VHlwZSwgZGVjb2RlVGltZW91dFR5cGVdID0gbWFrZVByb3RvRW51bUNvbnZlcnRlcnM8XG4gIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5UaW1lb3V0VHlwZSxcbiAgdHlwZW9mIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5UaW1lb3V0VHlwZSxcbiAga2V5b2YgdHlwZW9mIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5UaW1lb3V0VHlwZSxcbiAgdHlwZW9mIFRpbWVvdXRUeXBlLFxuICAnVElNRU9VVF9UWVBFXydcbj4oXG4gIHtcbiAgICBbVGltZW91dFR5cGUuU1RBUlRfVE9fQ0xPU0VdOiAxLFxuICAgIFtUaW1lb3V0VHlwZS5TQ0hFRFVMRV9UT19TVEFSVF06IDIsXG4gICAgW1RpbWVvdXRUeXBlLlNDSEVEVUxFX1RPX0NMT1NFXTogMyxcbiAgICBbVGltZW91dFR5cGUuSEVBUlRCRUFUXTogNCxcbiAgICBVTlNQRUNJRklFRDogMCxcbiAgfSBhcyBjb25zdCxcbiAgJ1RJTUVPVVRfVFlQRV8nXG4pO1xuXG5leHBvcnQgY29uc3QgUmV0cnlTdGF0ZSA9IHtcbiAgSU5fUFJPR1JFU1M6ICdJTl9QUk9HUkVTUycsXG4gIE5PTl9SRVRSWUFCTEVfRkFJTFVSRTogJ05PTl9SRVRSWUFCTEVfRkFJTFVSRScsXG4gIFRJTUVPVVQ6ICdUSU1FT1VUJyxcbiAgTUFYSU1VTV9BVFRFTVBUU19SRUFDSEVEOiAnTUFYSU1VTV9BVFRFTVBUU19SRUFDSEVEJyxcbiAgUkVUUllfUE9MSUNZX05PVF9TRVQ6ICdSRVRSWV9QT0xJQ1lfTk9UX1NFVCcsXG4gIElOVEVSTkFMX1NFUlZFUl9FUlJPUjogJ0lOVEVSTkFMX1NFUlZFUl9FUlJPUicsXG4gIENBTkNFTF9SRVFVRVNURUQ6ICdDQU5DRUxfUkVRVUVTVEVEJyxcblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBJTl9QUk9HUkVTU30gaW5zdGVhZC4gKi9cbiAgUkVUUllfU1RBVEVfSU5fUFJPR1JFU1M6ICdJTl9QUk9HUkVTUycsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBOT05fUkVUUllBQkxFX0ZBSUxVUkV9IGluc3RlYWQuICovXG4gIFJFVFJZX1NUQVRFX05PTl9SRVRSWUFCTEVfRkFJTFVSRTogJ05PTl9SRVRSWUFCTEVfRkFJTFVSRScsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBUSU1FT1VUfSBpbnN0ZWFkLiAqL1xuICBSRVRSWV9TVEFURV9USU1FT1VUOiAnVElNRU9VVCcsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBNQVhJTVVNX0FUVEVNUFRTX1JFQUNIRUR9IGluc3RlYWQuICovXG4gIFJFVFJZX1NUQVRFX01BWElNVU1fQVRURU1QVFNfUkVBQ0hFRDogJ01BWElNVU1fQVRURU1QVFNfUkVBQ0hFRCcsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBSRVRSWV9QT0xJQ1lfTk9UX1NFVH0gaW5zdGVhZC4gKi9cbiAgUkVUUllfU1RBVEVfUkVUUllfUE9MSUNZX05PVF9TRVQ6ICdSRVRSWV9QT0xJQ1lfTk9UX1NFVCcsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBJTlRFUk5BTF9TRVJWRVJfRVJST1J9IGluc3RlYWQuICovXG4gIFJFVFJZX1NUQVRFX0lOVEVSTkFMX1NFUlZFUl9FUlJPUjogJ0lOVEVSTkFMX1NFUlZFUl9FUlJPUicsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBDQU5DRUxfUkVRVUVTVEVEfSBpbnN0ZWFkLiAqL1xuICBSRVRSWV9TVEFURV9DQU5DRUxfUkVRVUVTVEVEOiAnQ0FOQ0VMX1JFUVVFU1RFRCcsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIGB1bmRlZmluZWRgIGluc3RlYWQuICovXG4gIFJFVFJZX1NUQVRFX1VOU1BFQ0lGSUVEOiB1bmRlZmluZWQsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cbn0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBSZXRyeVN0YXRlID0gKHR5cGVvZiBSZXRyeVN0YXRlKVtrZXlvZiB0eXBlb2YgUmV0cnlTdGF0ZV07XG5cbmV4cG9ydCBjb25zdCBbZW5jb2RlUmV0cnlTdGF0ZSwgZGVjb2RlUmV0cnlTdGF0ZV0gPSBtYWtlUHJvdG9FbnVtQ29udmVydGVyczxcbiAgdGVtcG9yYWwuYXBpLmVudW1zLnYxLlJldHJ5U3RhdGUsXG4gIHR5cGVvZiB0ZW1wb3JhbC5hcGkuZW51bXMudjEuUmV0cnlTdGF0ZSxcbiAga2V5b2YgdHlwZW9mIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5SZXRyeVN0YXRlLFxuICB0eXBlb2YgUmV0cnlTdGF0ZSxcbiAgJ1JFVFJZX1NUQVRFXydcbj4oXG4gIHtcbiAgICBbUmV0cnlTdGF0ZS5JTl9QUk9HUkVTU106IDEsXG4gICAgW1JldHJ5U3RhdGUuTk9OX1JFVFJZQUJMRV9GQUlMVVJFXTogMixcbiAgICBbUmV0cnlTdGF0ZS5USU1FT1VUXTogMyxcbiAgICBbUmV0cnlTdGF0ZS5NQVhJTVVNX0FUVEVNUFRTX1JFQUNIRURdOiA0LFxuICAgIFtSZXRyeVN0YXRlLlJFVFJZX1BPTElDWV9OT1RfU0VUXTogNSxcbiAgICBbUmV0cnlTdGF0ZS5JTlRFUk5BTF9TRVJWRVJfRVJST1JdOiA2LFxuICAgIFtSZXRyeVN0YXRlLkNBTkNFTF9SRVFVRVNURURdOiA3LFxuICAgIFVOU1BFQ0lGSUVEOiAwLFxuICB9IGFzIGNvbnN0LFxuICAnUkVUUllfU1RBVEVfJ1xuKTtcblxuZXhwb3J0IHR5cGUgV29ya2Zsb3dFeGVjdXRpb24gPSB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklXb3JrZmxvd0V4ZWN1dGlvbjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGZhaWx1cmVzIHRoYXQgY2FuIGNyb3NzIFdvcmtmbG93IGFuZCBBY3Rpdml0eSBib3VuZGFyaWVzLlxuICpcbiAqICoqTmV2ZXIgZXh0ZW5kIHRoaXMgY2xhc3Mgb3IgYW55IG9mIGl0cyBjaGlsZHJlbi4qKlxuICpcbiAqIFRoZSBvbmx5IGNoaWxkIGNsYXNzIHlvdSBzaG91bGQgZXZlciB0aHJvdyBmcm9tIHlvdXIgY29kZSBpcyB7QGxpbmsgQXBwbGljYXRpb25GYWlsdXJlfS5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdUZW1wb3JhbEZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIFRlbXBvcmFsRmFpbHVyZSBleHRlbmRzIEVycm9yIHtcbiAgLyoqXG4gICAqIFRoZSBvcmlnaW5hbCBmYWlsdXJlIHRoYXQgY29uc3RydWN0ZWQgdGhpcyBlcnJvci5cbiAgICpcbiAgICogT25seSBwcmVzZW50IGlmIHRoaXMgZXJyb3Igd2FzIGdlbmVyYXRlZCBmcm9tIGFuIGV4dGVybmFsIG9wZXJhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBmYWlsdXJlPzogUHJvdG9GYWlsdXJlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U/OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gdW5kZWZpbmVkKTtcbiAgfVxufVxuXG4vKiogRXhjZXB0aW9ucyBvcmlnaW5hdGVkIGF0IHRoZSBUZW1wb3JhbCBzZXJ2aWNlLiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdTZXJ2ZXJGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBTZXJ2ZXJGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBub25SZXRyeWFibGU6IGJvb2xlYW4sXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYHMgYXJlIHVzZWQgdG8gY29tbXVuaWNhdGUgYXBwbGljYXRpb24tc3BlY2lmaWMgZmFpbHVyZXMgaW4gV29ya2Zsb3dzIGFuZCBBY3Rpdml0aWVzLlxuICpcbiAqIFRoZSB7QGxpbmsgdHlwZX0gcHJvcGVydHkgaXMgbWF0Y2hlZCBhZ2FpbnN0IHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSB0byBkZXRlcm1pbmUgaWYgYW4gaW5zdGFuY2VcbiAqIG9mIHRoaXMgZXJyb3IgaXMgcmV0cnlhYmxlLiBBbm90aGVyIHdheSB0byBhdm9pZCByZXRyeWluZyBpcyBieSBzZXR0aW5nIHRoZSB7QGxpbmsgbm9uUmV0cnlhYmxlfSBmbGFnIHRvIGB0cnVlYC5cbiAqXG4gKiBJbiBXb3JrZmxvd3MsIGlmIHlvdSB0aHJvdyBhIG5vbi1gQXBwbGljYXRpb25GYWlsdXJlYCwgdGhlIFdvcmtmbG93IFRhc2sgd2lsbCBmYWlsIGFuZCBiZSByZXRyaWVkLiBJZiB5b3UgdGhyb3cgYW5cbiAqIGBBcHBsaWNhdGlvbkZhaWx1cmVgLCB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uIHdpbGwgZmFpbC5cbiAqXG4gKiBJbiBBY3Rpdml0aWVzLCB5b3UgY2FuIGVpdGhlciB0aHJvdyBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCBvciBhbm90aGVyIGBFcnJvcmAgdG8gZmFpbCB0aGUgQWN0aXZpdHkgVGFzay4gSW4gdGhlXG4gKiBsYXR0ZXIgY2FzZSwgdGhlIGBFcnJvcmAgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAuIFRoZSBjb252ZXJzaW9uIGlzIGRvbmUgYXMgZm9sbG93aW5nOlxuICpcbiAqIC0gYHR5cGVgIGlzIHNldCB0byBgZXJyb3IuY29uc3RydWN0b3I/Lm5hbWUgPz8gZXJyb3IubmFtZWBcbiAqIC0gYG1lc3NhZ2VgIGlzIHNldCB0byBgZXJyb3IubWVzc2FnZWBcbiAqIC0gYG5vblJldHJ5YWJsZWAgaXMgc2V0IHRvIGZhbHNlXG4gKiAtIGBkZXRhaWxzYCBhcmUgc2V0IHRvIG51bGxcbiAqIC0gc3RhY2sgdHJhY2UgaXMgY29waWVkIGZyb20gdGhlIG9yaWdpbmFsIGVycm9yXG4gKlxuICogV2hlbiBhbiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYW4tYWN0aXZpdHktZXhlY3V0aW9uIHwgQWN0aXZpdHkgRXhlY3V0aW9ufSBmYWlscywgdGhlXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYCBmcm9tIHRoZSBsYXN0IEFjdGl2aXR5IFRhc2sgd2lsbCBiZSB0aGUgYGNhdXNlYCBvZiB0aGUge0BsaW5rIEFjdGl2aXR5RmFpbHVyZX0gdGhyb3duIGluIHRoZVxuICogV29ya2Zsb3cuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQXBwbGljYXRpb25GYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbkZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICAvKipcbiAgICogQWx0ZXJuYXRpdmVseSwgdXNlIHtAbGluayBmcm9tRXJyb3J9IG9yIHtAbGluayBjcmVhdGV9LlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZT86IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcHVibGljIHJlYWRvbmx5IHR5cGU/OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSBub25SZXRyeWFibGU/OiBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgZGV0YWlscz86IHVua25vd25bXSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgY2F1c2U/OiBFcnJvcixcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmV4dFJldHJ5RGVsYXk/OiBEdXJhdGlvbiB8IHVuZGVmaW5lZCB8IG51bGxcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYCBmcm9tIGFuIEVycm9yIG9iamVjdC5cbiAgICpcbiAgICogRmlyc3QgY2FsbHMge0BsaW5rIGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZSB8IGBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyb3IpYH0gYW5kIHRoZW4gb3ZlcnJpZGVzIGFueSBmaWVsZHNcbiAgICogcHJvdmlkZWQgaW4gYG92ZXJyaWRlc2AuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21FcnJvcihlcnJvcjogRXJyb3IgfCB1bmtub3duLCBvdmVycmlkZXM/OiBBcHBsaWNhdGlvbkZhaWx1cmVPcHRpb25zKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICBjb25zdCBmYWlsdXJlID0gZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycm9yKTtcbiAgICBPYmplY3QuYXNzaWduKGZhaWx1cmUsIG92ZXJyaWRlcyk7XG4gICAgcmV0dXJuIGZhaWx1cmU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCB3aWxsIGJlIHJldHJ5YWJsZSAodW5sZXNzIGl0cyBgdHlwZWAgaXMgaW5jbHVkZWQgaW4ge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IEFwcGxpY2F0aW9uRmFpbHVyZU9wdGlvbnMpOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgdHlwZSwgbm9uUmV0cnlhYmxlID0gZmFsc2UsIGRldGFpbHMsIG5leHRSZXRyeURlbGF5LCBjYXVzZSB9ID0gb3B0aW9ucztcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSwgdHlwZSwgbm9uUmV0cnlhYmxlLCBkZXRhaWxzLCBjYXVzZSwgbmV4dFJldHJ5RGVsYXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoIHRoZSB7QGxpbmsgbm9uUmV0cnlhYmxlfSBmbGFnIHNldCB0byBmYWxzZS4gTm90ZSB0aGF0IHRoaXMgZXJyb3Igd2lsbCBzdGlsbFxuICAgKiBub3QgYmUgcmV0cmllZCBpZiBpdHMgYHR5cGVgIGlzIGluY2x1ZGVkIGluIHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfS5cbiAgICpcbiAgICogQHBhcmFtIG1lc3NhZ2UgT3B0aW9uYWwgZXJyb3IgbWVzc2FnZVxuICAgKiBAcGFyYW0gdHlwZSBPcHRpb25hbCBlcnJvciB0eXBlICh1c2VkIGJ5IHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSlcbiAgICogQHBhcmFtIGRldGFpbHMgT3B0aW9uYWwgZGV0YWlscyBhYm91dCB0aGUgZmFpbHVyZS4gU2VyaWFsaXplZCBieSB0aGUgV29ya2VyJ3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZXRyeWFibGUobWVzc2FnZT86IHN0cmluZyB8IG51bGwsIHR5cGU/OiBzdHJpbmcgfCBudWxsLCAuLi5kZXRhaWxzOiB1bmtub3duW10pOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlLCB0eXBlID8/ICdFcnJvcicsIGZhbHNlLCBkZXRhaWxzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aCB0aGUge0BsaW5rIG5vblJldHJ5YWJsZX0gZmxhZyBzZXQgdG8gdHJ1ZS5cbiAgICpcbiAgICogV2hlbiB0aHJvd24gZnJvbSBhbiBBY3Rpdml0eSBvciBXb3JrZmxvdywgdGhlIEFjdGl2aXR5IG9yIFdvcmtmbG93IHdpbGwgbm90IGJlIHJldHJpZWQgKGV2ZW4gaWYgYHR5cGVgIGlzIG5vdFxuICAgKiBsaXN0ZWQgaW4ge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KS5cbiAgICpcbiAgICogQHBhcmFtIG1lc3NhZ2UgT3B0aW9uYWwgZXJyb3IgbWVzc2FnZVxuICAgKiBAcGFyYW0gdHlwZSBPcHRpb25hbCBlcnJvciB0eXBlXG4gICAqIEBwYXJhbSBkZXRhaWxzIE9wdGlvbmFsIGRldGFpbHMgYWJvdXQgdGhlIGZhaWx1cmUuIFNlcmlhbGl6ZWQgYnkgdGhlIFdvcmtlcidzIHtAbGluayBQYXlsb2FkQ29udmVydGVyfS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbm9uUmV0cnlhYmxlKG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsLCB0eXBlPzogc3RyaW5nIHwgbnVsbCwgLi4uZGV0YWlsczogdW5rbm93bltdKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSwgdHlwZSA/PyAnRXJyb3InLCB0cnVlLCBkZXRhaWxzKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFwcGxpY2F0aW9uRmFpbHVyZU9wdGlvbnMge1xuICAvKipcbiAgICogRXJyb3IgbWVzc2FnZVxuICAgKi9cbiAgbWVzc2FnZT86IHN0cmluZztcblxuICAvKipcbiAgICogRXJyb3IgdHlwZSAodXNlZCBieSB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pXG4gICAqL1xuICB0eXBlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjdXJyZW50IEFjdGl2aXR5IG9yIFdvcmtmbG93IGNhbiBiZSByZXRyaWVkXG4gICAqXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBub25SZXRyeWFibGU/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBEZXRhaWxzIGFib3V0IHRoZSBmYWlsdXJlLiBTZXJpYWxpemVkIGJ5IHRoZSBXb3JrZXIncyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqL1xuICBkZXRhaWxzPzogdW5rbm93bltdO1xuXG4gIC8qKlxuICAgKiBJZiBzZXQsIG92ZXJyaWRlcyB0aGUgZGVsYXkgdW50aWwgdGhlIG5leHQgcmV0cnkgb2YgdGhpcyBBY3Rpdml0eSAvIFdvcmtmbG93IFRhc2suXG4gICAqXG4gICAqIFJldHJ5IGF0dGVtcHRzIHdpbGwgc3RpbGwgYmUgc3ViamVjdCB0byB0aGUgbWF4aW11bSByZXRyaWVzIGxpbWl0IGFuZCB0b3RhbCB0aW1lIGxpbWl0IGRlZmluZWRcbiAgICogYnkgdGhlIHBvbGljeS5cbiAgICovXG4gIG5leHRSZXRyeURlbGF5PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIENhdXNlIG9mIHRoZSBmYWlsdXJlXG4gICAqL1xuICBjYXVzZT86IEVycm9yO1xufVxuXG4vKipcbiAqIFRoaXMgZXJyb3IgaXMgdGhyb3duIHdoZW4gQ2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC4gVG8gYWxsb3cgQ2FuY2VsbGF0aW9uIHRvIGhhcHBlbiwgbGV0IGl0IHByb3BhZ2F0ZS4gVG9cbiAqIGlnbm9yZSBDYW5jZWxsYXRpb24sIGNhdGNoIGl0IGFuZCBjb250aW51ZSBleGVjdXRpbmcuIE5vdGUgdGhhdCBDYW5jZWxsYXRpb24gY2FuIG9ubHkgYmUgcmVxdWVzdGVkIGEgc2luZ2xlIHRpbWUsIHNvXG4gKiB5b3VyIFdvcmtmbG93L0FjdGl2aXR5IEV4ZWN1dGlvbiB3aWxsIG5vdCByZWNlaXZlIGZ1cnRoZXIgQ2FuY2VsbGF0aW9uIHJlcXVlc3RzLlxuICpcbiAqIFdoZW4gYSBXb3JrZmxvdyBvciBBY3Rpdml0eSBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgY2FuY2VsbGVkLCBhIGBDYW5jZWxsZWRGYWlsdXJlYCB3aWxsIGJlIHRoZSBgY2F1c2VgLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0NhbmNlbGxlZEZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIENhbmNlbGxlZEZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGRldGFpbHM6IHVua25vd25bXSA9IFtdLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogVXNlZCBhcyB0aGUgYGNhdXNlYCB3aGVuIGEgV29ya2Zsb3cgaGFzIGJlZW4gdGVybWluYXRlZFxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1Rlcm1pbmF0ZWRGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBUZXJtaW5hdGVkRmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCwgY2F1c2U/OiBFcnJvcikge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIFVzZWQgdG8gcmVwcmVzZW50IHRpbWVvdXRzIG9mIEFjdGl2aXRpZXMgYW5kIFdvcmtmbG93c1xuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1RpbWVvdXRGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBUaW1lb3V0RmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgbGFzdEhlYXJ0YmVhdERldGFpbHM6IHVua25vd24sXG4gICAgcHVibGljIHJlYWRvbmx5IHRpbWVvdXRUeXBlOiBUaW1lb3V0VHlwZVxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IGFuIEFjdGl2aXR5IGZhaWx1cmUuIEFsd2F5cyBjb250YWlucyB0aGUgb3JpZ2luYWwgcmVhc29uIGZvciB0aGUgZmFpbHVyZSBhcyBpdHMgYGNhdXNlYC5cbiAqIEZvciBleGFtcGxlLCBpZiBhbiBBY3Rpdml0eSB0aW1lZCBvdXQsIHRoZSBjYXVzZSB3aWxsIGJlIGEge0BsaW5rIFRpbWVvdXRGYWlsdXJlfS5cbiAqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyBleHBlY3RlZCB0byBiZSB0aHJvd24gb25seSBieSB0aGUgZnJhbWV3b3JrIGNvZGUuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQWN0aXZpdHlGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBBY3Rpdml0eUZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBhY3Rpdml0eVR5cGU6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgYWN0aXZpdHlJZDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSByZXRyeVN0YXRlOiBSZXRyeVN0YXRlLFxuICAgIHB1YmxpYyByZWFkb25seSBpZGVudGl0eTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogQ29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgYSBDaGlsZCBXb3JrZmxvdyBmYWlsdXJlLiBBbHdheXMgY29udGFpbnMgdGhlIHJlYXNvbiBmb3IgdGhlIGZhaWx1cmUgYXMgaXRzIHtAbGluayBjYXVzZX0uXG4gKiBGb3IgZXhhbXBsZSwgaWYgdGhlIENoaWxkIHdhcyBUZXJtaW5hdGVkLCB0aGUgYGNhdXNlYCBpcyBhIHtAbGluayBUZXJtaW5hdGVkRmFpbHVyZX0uXG4gKlxuICogVGhpcyBleGNlcHRpb24gaXMgZXhwZWN0ZWQgdG8gYmUgdGhyb3duIG9ubHkgYnkgdGhlIGZyYW1ld29yayBjb2RlLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0NoaWxkV29ya2Zsb3dGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBDaGlsZFdvcmtmbG93RmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZXNwYWNlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGV4ZWN1dGlvbjogV29ya2Zsb3dFeGVjdXRpb24sXG4gICAgcHVibGljIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSByZXRyeVN0YXRlOiBSZXRyeVN0YXRlLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIoJ0NoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBmYWlsZWQnLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyB0aHJvd24gaW4gdGhlIGZvbGxvd2luZyBjYXNlczpcbiAqICAtIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgV29ya2Zsb3cgSUQgaXMgY3VycmVudGx5IHJ1bm5pbmcgYW5kIHRoZSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93SWRDb25mbGljdFBvbGljeX0gaXMgYFdPUktGTE9XX0lEX0NPTkZMSUNUX1BPTElDWV9GQUlMYFxuICogIC0gVGhlcmUgaXMgYSBjbG9zZWQgV29ya2Zsb3cgd2l0aCB0aGUgc2FtZSBXb3JrZmxvdyBJZCBhbmQgdGhlIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dJZFJldXNlUG9saWN5fVxuICogICAgaXMgYFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9SRUpFQ1RfRFVQTElDQVRFYFxuICogIC0gVGhlcmUgaXMgY2xvc2VkIFdvcmtmbG93IGluIHRoZSBgQ29tcGxldGVkYCBzdGF0ZSB3aXRoIHRoZSBzYW1lIFdvcmtmbG93IElkIGFuZCB0aGUge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd0lkUmV1c2VQb2xpY3l9XG4gKiAgICBpcyBgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX0FMTE9XX0RVUExJQ0FURV9GQUlMRURfT05MWWBcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3InKVxuZXhwb3J0IGNsYXNzIFdvcmtmbG93RXhlY3V0aW9uQWxyZWFkeVN0YXJ0ZWRFcnJvciBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd1R5cGU6IHN0cmluZ1xuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIElmIGBlcnJvcmAgaXMgYWxyZWFkeSBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCwgcmV0dXJucyBgZXJyb3JgLlxuICpcbiAqIE90aGVyd2lzZSwgY29udmVydHMgYGVycm9yYCBpbnRvIGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgIHdpdGg6XG4gKlxuICogLSBgbWVzc2FnZWA6IGBlcnJvci5tZXNzYWdlYCBvciBgU3RyaW5nKGVycm9yKWBcbiAqIC0gYHR5cGVgOiBgZXJyb3IuY29uc3RydWN0b3IubmFtZWAgb3IgYGVycm9yLm5hbWVgXG4gKiAtIGBzdGFja2A6IGBlcnJvci5zdGFja2Agb3IgYCcnYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycm9yOiB1bmtub3duKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgQXBwbGljYXRpb25GYWlsdXJlKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG5cbiAgY29uc3QgbWVzc2FnZSA9IChpc1JlY29yZChlcnJvcikgJiYgU3RyaW5nKGVycm9yLm1lc3NhZ2UpKSB8fCBTdHJpbmcoZXJyb3IpO1xuICBjb25zdCB0eXBlID0gKGlzUmVjb3JkKGVycm9yKSAmJiAoZXJyb3IuY29uc3RydWN0b3I/Lm5hbWUgPz8gZXJyb3IubmFtZSkpIHx8IHVuZGVmaW5lZDtcbiAgY29uc3QgZmFpbHVyZSA9IEFwcGxpY2F0aW9uRmFpbHVyZS5jcmVhdGUoeyBtZXNzYWdlLCB0eXBlLCBub25SZXRyeWFibGU6IGZhbHNlIH0pO1xuICBmYWlsdXJlLnN0YWNrID0gKGlzUmVjb3JkKGVycm9yKSAmJiBTdHJpbmcoZXJyb3Iuc3RhY2spKSB8fCAnJztcbiAgcmV0dXJuIGZhaWx1cmU7XG59XG5cbi8qKlxuICogSWYgYGVycmAgaXMgYW4gRXJyb3IgaXQgaXMgdHVybmVkIGludG8gYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAuXG4gKlxuICogSWYgYGVycmAgd2FzIGFscmVhZHkgYSBgVGVtcG9yYWxGYWlsdXJlYCwgcmV0dXJucyB0aGUgb3JpZ2luYWwgZXJyb3IuXG4gKlxuICogT3RoZXJ3aXNlIHJldHVybnMgYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aCBgU3RyaW5nKGVycilgIGFzIHRoZSBtZXNzYWdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlVGVtcG9yYWxGYWlsdXJlKGVycjogdW5rbm93bik6IFRlbXBvcmFsRmFpbHVyZSB7XG4gIGlmIChlcnIgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpIHtcbiAgICByZXR1cm4gZXJyO1xuICB9XG4gIHJldHVybiBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHJvb3QgY2F1c2UgbWVzc2FnZSBvZiBnaXZlbiBgZXJyb3JgLlxuICpcbiAqIEluIGNhc2UgYGVycm9yYCBpcyBhIHtAbGluayBUZW1wb3JhbEZhaWx1cmV9LCByZWN1cnNlIHRoZSBgY2F1c2VgIGNoYWluIGFuZCByZXR1cm4gdGhlIHJvb3QgYGNhdXNlLm1lc3NhZ2VgLlxuICogT3RoZXJ3aXNlLCByZXR1cm4gYGVycm9yLm1lc3NhZ2VgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcm9vdENhdXNlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgcmV0dXJuIGVycm9yLmNhdXNlID8gcm9vdENhdXNlKGVycm9yLmNhdXNlKSA6IGVycm9yLm1lc3NhZ2U7XG4gIH1cbiAgcmV0dXJuIGVycm9yTWVzc2FnZShlcnJvcik7XG59XG4iLCIvKipcbiAqIENvbW1vbiBsaWJyYXJ5IGZvciBjb2RlIHRoYXQncyB1c2VkIGFjcm9zcyB0aGUgQ2xpZW50LCBXb3JrZXIsIGFuZC9vciBXb3JrZmxvd1xuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgKiBhcyBlbmNvZGluZyBmcm9tICcuL2VuY29kaW5nJztcbmltcG9ydCAqIGFzIGhlbHBlcnMgZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG5leHBvcnQgKiBmcm9tICcuL2FjdGl2aXR5LW9wdGlvbnMnO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvZGF0YS1jb252ZXJ0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvZmFpbHVyZS1jb252ZXJ0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvcGF5bG9hZC1jb2RlYyc7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9wYXlsb2FkLWNvbnZlcnRlcic7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci90eXBlcyc7XG5leHBvcnQgKiBmcm9tICcuL2RlcHJlY2F0ZWQtdGltZSc7XG5leHBvcnQgKiBmcm9tICcuL2Vycm9ycyc7XG5leHBvcnQgKiBmcm9tICcuL2ZhaWx1cmUnO1xuZXhwb3J0IHsgSGVhZGVycywgTmV4dCB9IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmV4cG9ydCAqIGZyb20gJy4vaW50ZXJmYWNlcyc7XG5leHBvcnQgKiBmcm9tICcuL2xvZ2dlcic7XG5leHBvcnQgKiBmcm9tICcuL3JldHJ5LXBvbGljeSc7XG5leHBvcnQgdHlwZSB7IFRpbWVzdGFtcCwgRHVyYXRpb24sIFN0cmluZ1ZhbHVlIH0gZnJvbSAnLi90aW1lJztcbmV4cG9ydCAqIGZyb20gJy4vd29ya2Zsb3ctaGFuZGxlJztcbmV4cG9ydCAqIGZyb20gJy4vd29ya2Zsb3ctb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL3ZlcnNpb25pbmctaW50ZW50JztcblxuLyoqXG4gKiBFbmNvZGUgYSBVVEYtOCBzdHJpbmcgaW50byBhIFVpbnQ4QXJyYXlcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gdTgoczogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBlbmNvZGluZy5lbmNvZGUocyk7XG59XG5cbi8qKlxuICogRGVjb2RlIGEgVWludDhBcnJheSBpbnRvIGEgVVRGLTggc3RyaW5nXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhcnI6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICByZXR1cm4gZW5jb2RpbmcuZGVjb2RlKGFycik7XG59XG5cbi8qKlxuICogR2V0IGBlcnJvci5tZXNzYWdlYCAob3IgYHVuZGVmaW5lZGAgaWYgbm90IHByZXNlbnQpXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yTWVzc2FnZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBoZWxwZXJzLmVycm9yTWVzc2FnZShlcnJvcik7XG59XG5cbi8qKlxuICogR2V0IGBlcnJvci5jb2RlYCAob3IgYHVuZGVmaW5lZGAgaWYgbm90IHByZXNlbnQpXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yQ29kZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBoZWxwZXJzLmVycm9yQ29kZShlcnJvcik7XG59XG4iLCJpbXBvcnQgeyBBbnlGdW5jLCBPbWl0TGFzdFBhcmFtIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgUGF5bG9hZCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogVHlwZSBvZiB0aGUgbmV4dCBmdW5jdGlvbiBmb3IgYSBnaXZlbiBpbnRlcmNlcHRvciBmdW5jdGlvblxuICpcbiAqIENhbGxlZCBmcm9tIGFuIGludGVyY2VwdG9yIHRvIGNvbnRpbnVlIHRoZSBpbnRlcmNlcHRpb24gY2hhaW5cbiAqL1xuZXhwb3J0IHR5cGUgTmV4dDxJRiwgRk4gZXh0ZW5kcyBrZXlvZiBJRj4gPSBSZXF1aXJlZDxJRj5bRk5dIGV4dGVuZHMgQW55RnVuYyA/IE9taXRMYXN0UGFyYW08UmVxdWlyZWQ8SUY+W0ZOXT4gOiBuZXZlcjtcblxuLyoqIEhlYWRlcnMgYXJlIGp1c3QgYSBtYXBwaW5nIG9mIGhlYWRlciBuYW1lIHRvIFBheWxvYWQgKi9cbmV4cG9ydCB0eXBlIEhlYWRlcnMgPSBSZWNvcmQ8c3RyaW5nLCBQYXlsb2FkPjtcblxuLyoqXG4gKiBDb21wb3NlIGFsbCBpbnRlcmNlcHRvciBtZXRob2RzIGludG8gYSBzaW5nbGUgZnVuY3Rpb24uXG4gKlxuICogQ2FsbGluZyB0aGUgY29tcG9zZWQgZnVuY3Rpb24gcmVzdWx0cyBpbiBjYWxsaW5nIGVhY2ggb2YgdGhlIHByb3ZpZGVkIGludGVyY2VwdG9yLCBpbiBvcmRlciAoZnJvbSB0aGUgZmlyc3QgdG9cbiAqIHRoZSBsYXN0KSwgZm9sbG93ZWQgYnkgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHByb3ZpZGVkIGFzIGFyZ3VtZW50IHRvIGBjb21wb3NlSW50ZXJjZXB0b3JzKClgLlxuICpcbiAqIEBwYXJhbSBpbnRlcmNlcHRvcnMgYSBsaXN0IG9mIGludGVyY2VwdG9yc1xuICogQHBhcmFtIG1ldGhvZCB0aGUgbmFtZSBvZiB0aGUgaW50ZXJjZXB0b3IgbWV0aG9kIHRvIGNvbXBvc2VcbiAqIEBwYXJhbSBuZXh0IHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCBhdCB0aGUgZW5kIG9mIHRoZSBpbnRlcmNlcHRpb24gY2hhaW5cbiAqL1xuLy8gdHMtcHJ1bmUtaWdub3JlLW5leHQgKGltcG9ydGVkIHZpYSBsaWIvaW50ZXJjZXB0b3JzKVxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2VJbnRlcmNlcHRvcnM8SSwgTSBleHRlbmRzIGtleW9mIEk+KGludGVyY2VwdG9yczogSVtdLCBtZXRob2Q6IE0sIG5leHQ6IE5leHQ8SSwgTT4pOiBOZXh0PEksIE0+IHtcbiAgZm9yIChsZXQgaSA9IGludGVyY2VwdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgIGNvbnN0IGludGVyY2VwdG9yID0gaW50ZXJjZXB0b3JzW2ldO1xuICAgIGlmIChpbnRlcmNlcHRvclttZXRob2RdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHByZXYgPSBuZXh0O1xuICAgICAgLy8gV2UgbG9zZSB0eXBlIHNhZmV0eSBoZXJlIGJlY2F1c2UgVHlwZXNjcmlwdCBjYW4ndCBkZWR1Y2UgdGhhdCBpbnRlcmNlcHRvclttZXRob2RdIGlzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zXG4gICAgICAvLyB0aGUgc2FtZSB0eXBlIGFzIE5leHQ8SSwgTT5cbiAgICAgIG5leHQgPSAoKGlucHV0OiBhbnkpID0+IChpbnRlcmNlcHRvclttZXRob2RdIGFzIGFueSkoaW5wdXQsIHByZXYpKSBhcyBhbnk7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXh0O1xufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcblxuZXhwb3J0IHR5cGUgUGF5bG9hZCA9IHRlbXBvcmFsLmFwaS5jb21tb24udjEuSVBheWxvYWQ7XG5cbi8qKiBUeXBlIHRoYXQgY2FuIGJlIHJldHVybmVkIGZyb20gYSBXb3JrZmxvdyBgZXhlY3V0ZWAgZnVuY3Rpb24gKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93UmV0dXJuVHlwZSA9IFByb21pc2U8YW55PjtcbmV4cG9ydCB0eXBlIFdvcmtmbG93VXBkYXRlVHlwZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gUHJvbWlzZTxhbnk+IHwgYW55O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dVcGRhdGVBbm5vdGF0ZWRUeXBlID0ge1xuICBoYW5kbGVyOiBXb3JrZmxvd1VwZGF0ZVR5cGU7XG4gIHVuZmluaXNoZWRQb2xpY3k6IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5O1xuICB2YWxpZGF0b3I/OiBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGU7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIFdvcmtmbG93U2lnbmFsVHlwZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1NpZ25hbEFubm90YXRlZFR5cGUgPSB7XG4gIGhhbmRsZXI6IFdvcmtmbG93U2lnbmFsVHlwZTtcbiAgdW5maW5pc2hlZFBvbGljeTogSGFuZGxlclVuZmluaXNoZWRQb2xpY3k7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIFdvcmtmbG93UXVlcnlUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1F1ZXJ5QW5ub3RhdGVkVHlwZSA9IHsgaGFuZGxlcjogV29ya2Zsb3dRdWVyeVR5cGU7IGRlc2NyaXB0aW9uPzogc3RyaW5nIH07XG5cbi8qKlxuICogQnJvYWQgV29ya2Zsb3cgZnVuY3Rpb24gZGVmaW5pdGlvbiwgc3BlY2lmaWMgV29ya2Zsb3dzIHdpbGwgdHlwaWNhbGx5IHVzZSBhIG5hcnJvd2VyIHR5cGUgZGVmaW5pdGlvbiwgZS5nOlxuICogYGBgdHNcbiAqIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBteVdvcmtmbG93KGFyZzE6IG51bWJlciwgYXJnMjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+O1xuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93ID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBXb3JrZmxvd1JldHVyblR5cGU7XG5cbmRlY2xhcmUgY29uc3QgYXJnc0JyYW5kOiB1bmlxdWUgc3ltYm9sO1xuZGVjbGFyZSBjb25zdCByZXRCcmFuZDogdW5pcXVlIHN5bWJvbDtcblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgcmVwcmVzZW50aW5nIGEgV29ya2Zsb3cgdXBkYXRlIGRlZmluaXRpb24sIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVVwZGF0ZX1cbiAqXG4gKiBAcmVtYXJrcyBgQXJnc2AgY2FuIGJlIHVzZWQgZm9yIHBhcmFtZXRlciB0eXBlIGluZmVyZW5jZSBpbiBoYW5kbGVyIGZ1bmN0aW9ucyBhbmQgV29ya2Zsb3dIYW5kbGUgbWV0aG9kcy5cbiAqIGBOYW1lYCBjYW4gb3B0aW9uYWxseSBiZSBzcGVjaWZpZWQgd2l0aCBhIHN0cmluZyBsaXRlcmFsIHR5cGUgdG8gcHJlc2VydmUgdHlwZS1sZXZlbCBrbm93bGVkZ2Ugb2YgdGhlIHVwZGF0ZSBuYW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4ge1xuICB0eXBlOiAndXBkYXRlJztcbiAgbmFtZTogTmFtZTtcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFVwZGF0ZURlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IGFyZ3MuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbYXJnc0JyYW5kXTogQXJncztcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFVwZGF0ZURlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IHJldHVybiB0eXBlcy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFtyZXRCcmFuZF06IFJldDtcbn1cblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgcmVwcmVzZW50aW5nIGEgV29ya2Zsb3cgc2lnbmFsIGRlZmluaXRpb24sIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVNpZ25hbH1cbiAqXG4gKiBAcmVtYXJrcyBgQXJnc2AgY2FuIGJlIHVzZWQgZm9yIHBhcmFtZXRlciB0eXBlIGluZmVyZW5jZSBpbiBoYW5kbGVyIGZ1bmN0aW9ucyBhbmQgV29ya2Zsb3dIYW5kbGUgbWV0aG9kcy5cbiAqIGBOYW1lYCBjYW4gb3B0aW9uYWxseSBiZSBzcGVjaWZpZWQgd2l0aCBhIHN0cmluZyBsaXRlcmFsIHR5cGUgdG8gcHJlc2VydmUgdHlwZS1sZXZlbCBrbm93bGVkZ2Ugb2YgdGhlIHNpZ25hbCBuYW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25hbERlZmluaXRpb248QXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+IHtcbiAgdHlwZTogJ3NpZ25hbCc7XG4gIG5hbWU6IE5hbWU7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBTaWduYWxEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCBhcmdzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW2FyZ3NCcmFuZF06IEFyZ3M7XG59XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHJlcHJlc2VudGluZyBhIFdvcmtmbG93IHF1ZXJ5IGRlZmluaXRpb24gYXMgcmV0dXJuZWQgZnJvbSB7QGxpbmsgZGVmaW5lUXVlcnl9XG4gKlxuICogQHJlbWFya3MgYEFyZ3NgIGFuZCBgUmV0YCBjYW4gYmUgdXNlZCBmb3IgcGFyYW1ldGVyIHR5cGUgaW5mZXJlbmNlIGluIGhhbmRsZXIgZnVuY3Rpb25zIGFuZCBXb3JrZmxvd0hhbmRsZSBtZXRob2RzLlxuICogYE5hbWVgIGNhbiBvcHRpb25hbGx5IGJlIHNwZWNpZmllZCB3aXRoIGEgc3RyaW5nIGxpdGVyYWwgdHlwZSB0byBwcmVzZXJ2ZSB0eXBlLWxldmVsIGtub3dsZWRnZSBvZiB0aGUgcXVlcnkgbmFtZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4ge1xuICB0eXBlOiAncXVlcnknO1xuICBuYW1lOiBOYW1lO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgUXVlcnlEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCBhcmdzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW2FyZ3NCcmFuZF06IEFyZ3M7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBRdWVyeURlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IHJldHVybiB0eXBlcy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFtyZXRCcmFuZF06IFJldDtcbn1cblxuLyoqIEdldCB0aGUgXCJ1bndyYXBwZWRcIiByZXR1cm4gdHlwZSAod2l0aG91dCBQcm9taXNlKSBvZiB0aGUgZXhlY3V0ZSBoYW5kbGVyIGZyb20gV29ya2Zsb3cgdHlwZSBgV2AgKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93UmVzdWx0VHlwZTxXIGV4dGVuZHMgV29ya2Zsb3c+ID0gUmV0dXJuVHlwZTxXPiBleHRlbmRzIFByb21pc2U8aW5mZXIgUj4gPyBSIDogbmV2ZXI7XG5cbi8qKlxuICogSWYgYW5vdGhlciBTREsgY3JlYXRlcyBhIFNlYXJjaCBBdHRyaWJ1dGUgdGhhdCdzIG5vdCBhbiBhcnJheSwgd2Ugd3JhcCBpdCBpbiBhbiBhcnJheS5cbiAqXG4gKiBEYXRlcyBhcmUgc2VyaWFsaXplZCBhcyBJU08gc3RyaW5ncy5cbiAqL1xuZXhwb3J0IHR5cGUgU2VhcmNoQXR0cmlidXRlcyA9IFJlY29yZDxzdHJpbmcsIFNlYXJjaEF0dHJpYnV0ZVZhbHVlIHwgUmVhZG9ubHk8U2VhcmNoQXR0cmlidXRlVmFsdWU+IHwgdW5kZWZpbmVkPjtcbmV4cG9ydCB0eXBlIFNlYXJjaEF0dHJpYnV0ZVZhbHVlID0gc3RyaW5nW10gfCBudW1iZXJbXSB8IGJvb2xlYW5bXSB8IERhdGVbXTtcblxuZXhwb3J0IGludGVyZmFjZSBBY3Rpdml0eUZ1bmN0aW9uPFAgZXh0ZW5kcyBhbnlbXSA9IGFueVtdLCBSID0gYW55PiB7XG4gICguLi5hcmdzOiBQKTogUHJvbWlzZTxSPjtcbn1cblxuLyoqXG4gKiBNYXBwaW5nIG9mIEFjdGl2aXR5IG5hbWUgdG8gZnVuY3Rpb25cbiAqIEBkZXByZWNhdGVkIG5vdCByZXF1aXJlZCBhbnltb3JlLCBmb3IgdW50eXBlZCBhY3Rpdml0aWVzIHVzZSB7QGxpbmsgVW50eXBlZEFjdGl2aXRpZXN9XG4gKi9cbmV4cG9ydCB0eXBlIEFjdGl2aXR5SW50ZXJmYWNlID0gUmVjb3JkPHN0cmluZywgQWN0aXZpdHlGdW5jdGlvbj47XG5cbi8qKlxuICogTWFwcGluZyBvZiBBY3Rpdml0eSBuYW1lIHRvIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIFVudHlwZWRBY3Rpdml0aWVzID0gUmVjb3JkPHN0cmluZywgQWN0aXZpdHlGdW5jdGlvbj47XG5cbi8qKlxuICogQSB3b3JrZmxvdydzIGhpc3RvcnkgYW5kIElELiBVc2VmdWwgZm9yIHJlcGxheS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIaXN0b3J5QW5kV29ya2Zsb3dJZCB7XG4gIHdvcmtmbG93SWQ6IHN0cmluZztcbiAgaGlzdG9yeTogdGVtcG9yYWwuYXBpLmhpc3RvcnkudjEuSGlzdG9yeSB8IHVua25vd24gfCB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUG9saWN5IGRlZmluaW5nIGFjdGlvbnMgdGFrZW4gd2hlbiBhIHdvcmtmbG93IGV4aXRzIHdoaWxlIHVwZGF0ZSBvciBzaWduYWwgaGFuZGxlcnMgYXJlIHJ1bm5pbmcuXG4gKiBUaGUgd29ya2Zsb3cgZXhpdCBtYXkgYmUgZHVlIHRvIHN1Y2Nlc3NmdWwgcmV0dXJuLCBmYWlsdXJlLCBjYW5jZWxsYXRpb24sIG9yIGNvbnRpbnVlLWFzLW5ldy5cbiAqL1xuZXhwb3J0IGNvbnN0IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5ID0ge1xuICAvKipcbiAgICogSXNzdWUgYSB3YXJuaW5nIGluIGFkZGl0aW9uIHRvIGFiYW5kb25pbmcgdGhlIGhhbmRsZXIgZXhlY3V0aW9uLiBUaGUgd2FybmluZyB3aWxsIG5vdCBiZSBpc3N1ZWQgaWYgdGhlIHdvcmtmbG93IGZhaWxzLlxuICAgKi9cbiAgV0FSTl9BTkRfQUJBTkRPTjogJ1dBUk5fQU5EX0FCQU5ET04nLFxuXG4gIC8qKlxuICAgKiBBYmFuZG9uIHRoZSBoYW5kbGVyIGV4ZWN1dGlvbi5cbiAgICpcbiAgICogSW4gdGhlIGNhc2Ugb2YgYW4gdXBkYXRlIGhhbmRsZXIgdGhpcyBtZWFucyB0aGF0IHRoZSBjbGllbnQgd2lsbCByZWNlaXZlIGFuIGVycm9yIHJhdGhlciB0aGFuXG4gICAqIHRoZSB1cGRhdGUgcmVzdWx0LlxuICAgKi9cbiAgQUJBTkRPTjogJ0FCQU5ET04nLFxufSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5ID0gKHR5cGVvZiBIYW5kbGVyVW5maW5pc2hlZFBvbGljeSlba2V5b2YgdHlwZW9mIEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5XTtcbiIsImltcG9ydCB7IFZhbHVlRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHsgRXhhY3QsIFJlbW92ZVByZWZpeCwgVW5pb25Ub0ludGVyc2VjdGlvbiB9IGZyb20gJy4uL3R5cGUtaGVscGVycyc7XG5cbi8qKlxuICogQ3JlYXRlIGVuY29kaW5nIGFuZCBkZWNvZGluZyBmdW5jdGlvbnMgdG8gY29udmVydCBiZXR3ZWVuIHRoZSBudW1lcmljIGBlbnVtYCB0eXBlcyBwcm9kdWNlZCBieSBvdXJcbiAqIFByb3RvYnVmIGNvbXBpbGVyIGFuZCBcImNvbnN0IG9iamVjdCBvZiBzdHJpbmdzXCIgZW51bSB2YWx1ZXMgdGhhdCB3ZSBleHBvc2UgaW4gb3VyIHB1YmxpYyBBUElzLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIE5ld2x5IGludHJvZHVjZWQgZW51bXMgc2hvdWxkIGZvbGxvdyB0aGUgZm9sbG93aW5nIHBhdHRlcm46XG4gKlxuICogYGBgdHNcbiAqICAgICB0eXBlIFBhcmVudENsb3NlUG9saWN5ID0gKHR5cGVvZiBQYXJlbnRDbG9zZVBvbGljeSlba2V5b2YgdHlwZW9mIFBhcmVudENsb3NlUG9saWN5XTtcbiAqICAgICBjb25zdCBQYXJlbnRDbG9zZVBvbGljeSA9IHtcbiAqICAgICAgIFRFUk1JTkFURTogJ1RFUk1JTkFURScsXG4gKiAgICAgICBBQkFORE9OOiAnQUJBTkRPTicsXG4gKiAgICAgICBSRVFVRVNUX0NBTkNFTDogJ1JFUVVFU1RfQ0FOQ0VMJyxcbiAqICAgICB9IGFzIGNvbnN0O1xuICpcbiAqICAgICBjb25zdCBbZW5jb2RlUGFyZW50Q2xvc2VQb2xpY3ksIGRlY29kZVBhcmVudENsb3NlUG9saWN5XSA9IC8vXG4gKiAgICAgICBtYWtlUHJvdG9FbnVtQ29udmVydGVyczxcbiAqICAgICAgICAgY29yZXNkay5jaGlsZF93b3JrZmxvdy5QYXJlbnRDbG9zZVBvbGljeSxcbiAqICAgICAgICAgdHlwZW9mIGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuUGFyZW50Q2xvc2VQb2xpY3ksXG4gKiAgICAgICAgIGtleW9mIHR5cGVvZiBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlBhcmVudENsb3NlUG9saWN5LFxuICogICAgICAgICB0eXBlb2YgUGFyZW50Q2xvc2VQb2xpY3ksXG4gKiAgICAgICAgICdQQVJFTlRfQ0xPU0VfUE9MSUNZXycgIC8vIFRoaXMgbWF5IGJlIGFuIGVtcHR5IHN0cmluZyBpZiB0aGUgcHJvdG8gZW51bSBkb2Vzbid0IGFkZCBhIHJlcGVhdGVkIHByZWZpeCBvbiB2YWx1ZXNcbiAqICAgICAgID4oXG4gKiAgICAgICAgIHtcbiAqICAgICAgICAgICBbUGFyZW50Q2xvc2VQb2xpY3kuVEVSTUlOQVRFXTogMSwgLy8gVGhlc2UgbnVtYmVycyBtdXN0IG1hdGNoIHRoZSBvbmVzIGluIHRoZSBwcm90byBlbnVtXG4gKiAgICAgICAgICAgW1BhcmVudENsb3NlUG9saWN5LkFCQU5ET05dOiAyLFxuICogICAgICAgICAgIFtQYXJlbnRDbG9zZVBvbGljeS5SRVFVRVNUX0NBTkNFTF06IDMsXG4gKlxuICogICAgICAgICAgIFVOU1BFQ0lGSUVEOiAwLFxuICogICAgICAgICB9IGFzIGNvbnN0LFxuICogICAgICAgICAnUEFSRU5UX0NMT1NFX1BPTElDWV8nXG4gKiAgICAgICApO1xuICogYGBgXG4gKlxuICogYG1ha2VQcm90b0VudW1Db252ZXJ0ZXJzYCBzdXBwb3J0cyBvdGhlciB1c2FnZSBwYXR0ZXJucywgYnV0IHRoZXkgYXJlIG9ubHkgbWVhbnQgZm9yXG4gKiBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggZm9ybWVyIGVudW0gZGVmaW5pdGlvbnMgYW5kIHNob3VsZCBub3QgYmUgdXNlZCBmb3IgbmV3IGVudW1zLlxuICpcbiAqICMjIyBDb250ZXh0XG4gKlxuICogVGVtcG9yYWwncyBQcm90b2J1ZiBBUElzIGRlZmluZSBzZXZlcmFsIGBlbnVtYCB0eXBlczsgb3VyIFByb3RvYnVmIGNvbXBpbGVyIHRyYW5zZm9ybXMgdGhlc2UgdG9cbiAqIHRyYWRpdGlvbmFsIChpLmUuIG5vbi1jb25zdCkgW1R5cGVTY3JpcHQgbnVtZXJpYyBgZW51bWBzXShodHRwczovL3d3dy50eXBlc2NyaXB0bGFuZy5vcmcvZG9jcy9oYW5kYm9vay9lbnVtcy5odG1sI251bWVyaWMtZW51bXMpLlxuICpcbiAqIEZvciB2YXJpb3VzIHJlYXNvbnMsIHRoaXMgaXMgZmFyIGZyb20gaWRlYWw6XG4gKlxuICogIC0gRHVlIHRvIHRoZSBkdWFsIG5hdHVyZSBvZiBub24tY29uc3QgVHlwZVNjcmlwdCBgZW51bWBzICh0aGV5IGFyZSBib3RoIGEgdHlwZSBhbmQgYSB2YWx1ZSksXG4gKiAgICBpdCBpcyBub3QgcG9zc2libGUgdG8gcmVmZXIgdG8gYW4gZW51bSB2YWx1ZSBmcm9tIGNvZGUgd2l0aG91dCBhIFwicmVhbFwiIGltcG9ydCBvZiB0aGUgZW51bSB0eXBlXG4gKiAgICAoaS5lLiBjYW4ndCBzaW1wbHkgZG8gYGltcG9ydCB0eXBlIC4uLmApLiBJbiBXb3JrZmxvdyBjb2RlLCBzdWNoIGFuIGltcG9ydCB3b3VsZCByZXN1bHQgaW5cbiAqICAgIGxvYWRpbmcgb3VyIGVudGlyZSBQcm90b2J1ZiBkZWZpbml0aW9ucyBpbnRvIHRoZSB3b3JrZmxvdyBzYW5kYm94LCBhZGRpbmcgc2V2ZXJhbCBtZWdhYnl0ZXMgdG9cbiAqICAgIHRoZSBwZXItd29ya2Zsb3cgbWVtb3J5IGZvb3RwcmludCwgd2hpY2ggaXMgdW5hY2NlcHRhYmxlOyB0byBhdm9pZCB0aGF0LCB3ZSBuZWVkIHRvIG1haW50YWluXG4gKiAgICBhIG1pcnJvciBjb3B5IG9mIGVhY2ggZW51bSB0eXBlcyB1c2VkIGJ5IGluLXdvcmtmbG93IEFQSXMsIGFuZCBleHBvcnQgdGhlc2UgZnJvbSBlaXRoZXJcbiAqICAgIGBAdGVtcG9yYWxpby9jb21tb25gIG9yIGBAdGVtcG9yYWxpby93b3JrZmxvd2AuXG4gKiAgLSBJdCBpcyBub3QgZGVzaXJhYmxlIGZvciB1c2VycyB0byBuZWVkIGFuIGV4cGxpY2l0IGRlcGVuZGVuY3kgb24gYEB0ZW1wb3JhbGlvL3Byb3RvYCBqdXN0IHRvXG4gKiAgICBnZXQgYWNjZXNzIHRvIHRoZXNlIGVudW0gdHlwZXM7IHdlIHRoZXJlZm9yZSBtYWRlIGl0IGEgY29tbW9uIHByYWN0aWNlIHRvIHJlZXhwb3J0IHRoZXNlIGVudW1zXG4gKiAgICBmcm9tIG91ciBwdWJsaWMgZmFjaW5nIHBhY2thZ2VzLiBIb3dldmVyLCBleHBlcmllbmNlIGRlbW9udHJhdGVkIHRoYXQgdGhlc2UgcmVleHBvcnRzIGVmZmVjdGl2ZWx5XG4gKiAgICByZXN1bHRlZCBpbiBwb29yIGFuZCBpbmNvbnNpc3RlbnQgZG9jdW1lbnRhdGlvbiBjb3ZlcmFnZSBjb21wYXJlZCB0byBtaXJyb3JlZCBlbnVtcyB0eXBlcy5cbiAqICAtIE91ciBQcm90b2J1ZiBlbnVtIHR5cGVzIHRlbmQgdG8gZm9sbG93IGEgdmVyYm9zZSBhbmQgcmVkdW5kYW50IG5hbWluZyBjb252ZW50aW9uLCB3aGljaCBmZWVsc1xuICogICAgdW5hdHVyYWwgYW5kIGV4Y2Vzc2l2ZSBhY2NvcmRpbmcgdG8gbW9zdCBUeXBlU2NyaXB0IHN0eWxlIGd1aWRlczsgZS5nLiBpbnN0ZWFkIG9mXG4gKiAgICBgd29ya2Zsb3dJZFJldXNlUG9saWN5OiBXb3JrZmxvd0lkUmV1c2VQb2xpY3kuV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1JFSkVDVF9EVVBMSUNBVEVgLFxuICogICAgYSBUeXBlU2NyaXB0IGRldmVsb3BlciB3b3VsZCBnZW5lcmFsbHkgZXhwZWN0IHRvIGJlIGFibGUgdG8gd3JpdGUgc29tZXRoaW5nIHNpbWlsYXIgdG9cbiAqICAgIGB3b3JrZmxvd0lkUmV1c2VQb2xpY3k6ICdSRUpFQ1RfRFVQTElDQVRFJ2AuXG4gKiAgLSBCZWNhdXNlIG9mIHRoZSB3YXkgUHJvdG9idWYgd29ya3MsIG1hbnkgb2Ygb3VyIGVudW0gdHlwZXMgY29udGFpbiBhbiBgVU5TUEVDSUZJRURgIHZhbHVlLCB3aGljaFxuICogICAgaXMgdXNlZCB0byBleHBsaWNpdGx5IGlkZW50aWZ5IGEgdmFsdWUgdGhhdCBpcyB1bnNldC4gSW4gVHlwZVNjcmlwdCBjb2RlLCB0aGUgYHVuZGVmaW5lZGAgdmFsdWVcbiAqICAgIGFscmVhZHkgc2VydmVzIHRoYXQgcHVycG9zZSwgYW5kIGlzIGRlZmluaXRlbHkgbW9yZSBpZGlvbWF0aWMgdG8gVFMgZGV2ZWxvcGVycywgd2hlcmVhcyB0aGVzZVxuICogICAgYFVOU1BFQ0lGSUVEYCB2YWx1ZXMgY3JlYXRlIG5vaXNlIGFuZCBjb25mdXNpb24gaW4gb3VyIEFQSXMuXG4gKiAgLSBUeXBlU2NyaXB0IGVkaXRvcnMgZ2VuZXJhbGx5IGRvIGEgdmVyeSBiYWQgam9iIGF0IHByb3ZpZGluZyBhdXRvY29tcGxldGlvbiB0aGF0IGltcGxpZXMgcmVhY2hpbmdcbiAqICAgIGZvciB2YWx1ZXMgb2YgYSBUeXBlU2NyaXB0IGVudW0gdHlwZSwgZm9yY2luZyBkZXZlbG9wZXJzIHRvIGV4cGxpY2l0bHkgdHlwZSBpbiBhdCBsZWFzdCBwYXJ0XG4gKiAgICBvZiB0aGUgbmFtZSBvZiB0aGUgZW51bSB0eXBlIGJlZm9yZSB0aGV5IGNhbiBnZXQgYXV0b2NvbXBsZXRpb24gZm9yIGl0cyB2YWx1ZXMuIE9uIHRoZSBvdGhlclxuICogICAgaGFuZCwgYWxsIFRTIGVkaXRvcnMgaW1tZWRpYXRlbHkgcHJvdmlkZSBhdXRvY29tcGxldGlvbiBmb3Igc3RyaW5nIHVuaW9uIHR5cGVzLlxuICogIC0gVGhlIFtUeXBlU2NyaXB0J3Mgb2ZmaWNpYWwgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svZW51bXMuaHRtbCNvYmplY3RzLXZzLWVudW1zKVxuICogICAgaXRzZWxmIHN1Z2dlc3RzIHRoYXQsIGluIG1vZGVybiBUeXBlU2NyaXB0LCB0aGUgdXNlIG9mIGBhcyBjb25zdGAgb2JqZWN0cyBtYXkgZ2VuZXJhbGx5IHN1ZmZpY2VcbiAqICAgIGFuZCBtYXkgYmUgYWR2YW50YWdlb3VzIG92ZXIgdGhlIHVzZSBvZiBgZW51bWAgdHlwZXMuXG4gKlxuICogQSBjb25zdCBvYmplY3Qgb2Ygc3RyaW5ncywgY29tYmluZWQgd2l0aCBhIHVuaW9uIHR5cGUgb2YgcG9zc2libGUgc3RyaW5nIHZhbHVlcywgcHJvdmlkZXMgYSBtdWNoXG4gKiBtb3JlIGlkaW9tYXRpYyBzeW50YXggYW5kIGEgYmV0dGVyIERYIGZvciBUeXBlU2NyaXB0IGRldmVsb3BlcnMuIFRoaXMgaG93ZXZlciByZXF1aXJlcyBhIHdheSB0b1xuICogY29udmVydCBiYWNrIGFuZCBmb3J0aCBiZXR3ZWVuIHRoZSBgZW51bWAgdmFsdWVzIHByb2R1Y2VkIGJ5IHRoZSBQcm90b2J1ZiBjb21waWxlciBhbmQgdGhlXG4gKiBlcXVpdmFsZW50IHN0cmluZyB2YWx1ZXMuXG4gKlxuICogVGhpcyBoZWxwZXIgZHluYW1pY2FsbHkgY3JlYXRlcyB0aGVzZSBjb252ZXJzaW9uIGZ1bmN0aW9ucyBmb3IgYSBnaXZlbiBQcm90b2J1ZiBlbnVtIHR5cGUsXG4gKiBzdHJvbmdseSBidWlsZGluZyB1cG9uIHNwZWNpZmljIGNvbnZlbnRpb25zIHRoYXQgd2UgaGF2ZSBhZG9wdGVkIGluIG91ciBQcm90b2J1ZiBkZWZpbml0aW9ucy5cbiAqXG4gKiAjIyMgVmFsaWRhdGlvbnNcbiAqXG4gKiBUaGUgY29tcGxleCB0eXBlIHNpZ25hdHVyZSBvZiB0aGlzIGhlbHBlciBpcyB0aGVyZSB0byBwcmV2ZW50IG1vc3QgcG90ZW50aWFsIGluY29oZXJlbmNpZXNcbiAqIHRoYXQgY291bGQgcmVzdWx0IGZyb20gaGF2aW5nIHRvIG1hbnVhbGx5IHN5bmNocm9uaXplIHRoZSBjb25zdCBvYmplY3Qgb2Ygc3RyaW5ncyBlbnVtIGFuZCB0aGVcbiAqIGNvbnZlcnNpb24gdGFibGUgd2l0aCB0aGUgcHJvdG8gZW51bSwgd2hpbGUgbm90IHJlcXVpcmluZyBhIHJlZ3VsYXIgaW1wb3J0IG9uIHRoZSBQcm90b2J1ZiBlbnVtXG4gKiBpdHNlbGYgKHNvIGl0IGNhbiBiZSB1c2VkIHNhZmVseSBmb3IgZW51bXMgbWVhbnQgdG8gYmUgdXNlZCBmcm9tIHdvcmtmbG93IGNvZGUpLlxuICpcbiAqIEluIHBhcnRpY3VsYXIsIGZhaWxpbmcgYW55IG9mIHRoZSBmb2xsb3dpbmcgaW52YXJpYW50cyB3aWxsIHJlc3VsdCBpbiBidWlsZCB0aW1lIGVycm9yczpcbiAqXG4gKiAtIEZvciBldmVyeSBrZXkgb2YgdGhlIGZvcm0gYFBSRUZJWF9LRVk6IG51bWJlcmAgaW4gdGhlIHByb3RvIGVudW0sIGV4Y2x1ZGluZyB0aGUgYFVOU1BFQ0lGSUVEYCBrZXk6XG4gKiAgIC0gVGhlcmUgTVVTVCBiZSBhIGNvcnJlc3BvbmRpbmcgYEtFWTogJ0tFWSdgIGVudHJ5IGluIHRoZSBjb25zdCBvYmplY3Qgb2Ygc3RyaW5ncyBlbnVtO1xuICogICAtIFRoZXJlIE1BWSBiZSBhIGNvcnJlc3BvbmRpbmcgYFBSRUZJWF9LRVk6ICdLRVknYCBpbiB0aGUgY29uc3Qgb2JqZWN0IG9mIHN0cmluZ3MgZW51bVxuICogICAgICh0aGlzIGlzIG1lYW50IHRvIHByZXNlcnZlIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgZm9ybWVyIHN5bnRheDsgc3VjaCBhbGlhc2VzIHNob3VsZFxuICogICAgIG5vdCBiZSBhZGRlZCBmb3IgbmV3IGVudW1zIGFuZCBlbnVtIGVudHJpZXMgaW50cm9kdWNlZCBnb2luZyBmb3J3YXJkKTtcbiAqICAgLSBUaGVyZSBNVVNUIGJlIGEgY29ycmVzcG9uZGluZyBgS0VZOiBudW1iZXJgIGluIHRoZSBtYXBwaW5nIHRhYmxlLlxuICogLSBJZiB0aGUgcHJvdG8gZW51bSBjb250YWlucyBhIGBQUkVGSVhfVU5TUEVDSUZJRURgIGVudHJ5LCB0aGVuOlxuICogICAtIFRoZXJlIE1BWSBiZSBhIGNvcnJlc3BvbmRpbmcgYFBSRUZJWF9VTlNQRUNJRklFRDogdW5kZWZpbmVkYCBhbmQvb3IgYFVOU1BFQ0lGSUVEOiB1bmRlZmluZWRgXG4gKiAgICAgZW50cmllcyBpbiB0aGUgY29uc3Qgb2JqZWN0IG9mIHN0cmluZ3MgZW51bSDigJQgdGhpcyBpcyBtZWFudCB0byBwcmVzZXJ2ZSBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gKiAgICAgd2l0aCB0aGUgZm9ybWVyIHN5bnRheDsgdGhpcyBhbGlhcyBzaG91bGQgbm90IGJlIGFkZGVkIGZvciBuZXcgZW51bXMgaW50cm9kdWNlZCBnb2luZyBmb3J3YXJkO1xuICogICAtIFRoZXJlIE1VU1QgYmUgYW4gYFVOU1BFQ0lGSUVEOiAwYCBpbiB0aGUgbWFwcGluZyB0YWJsZS5cbiAqIC0gVGhlIGNvbnN0IG9iamVjdCBvZiBzdHJpbmdzIGVudW0gTVVTVCBOT1QgY29udGFpbiBhbnkgb3RoZXIga2V5cyB0aGFuIHRoZSBvbmVzIG1hbmRhdGVkIG9yXG4gKiAgIG9wdGlvbmFsbHkgYWxsb3dlZCBiZSB0aGUgcHJlY2VlZGluZyBydWxlcy5cbiAqIC0gVGhlIG1hcHBpbmcgdGFibGUgTVVTVCBOT1QgY29udGFpbiBhbnkgb3RoZXIga2V5cyB0aGFuIHRoZSBvbmVzIG1hbmRhdGVkIGFib3ZlLlxuICpcbiAqIFRoZXNlIHJ1bGVzIG5vdGFibHkgZW5zdXJlIHRoYXQgd2hlbmV2ZXIgYSBuZXcgdmFsdWUgaXMgYWRkZWQgdG8gYW4gZXhpc3RpbmcgUHJvdG8gZW51bSwgdGhlIGNvZGVcbiAqIHdpbGwgZmFpbCB0byBjb21waWxlIHVudGlsIHRoZSBjb3JyZXNwb25kaW5nIGVudHJ5IGlzIGFkZGVkIG9uIHRoZSBjb25zdCBvYmplY3Qgb2Ygc3RyaW5ncyBlbnVtXG4gKiBhbmQgdGhlIG1hcHBpbmcgdGFibGUuXG4gKlxuICogQGludGVybmFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlUHJvdG9FbnVtQ29udmVydGVyczxcbiAgUHJvdG9FbnVtVmFsdWUgZXh0ZW5kcyBudW1iZXIsXG4gIFByb3RvRW51bSBleHRlbmRzIHsgW2sgaW4gUHJvdG9FbnVtS2V5XTogUHJvdG9FbnVtVmFsdWUgfSxcbiAgUHJvdG9FbnVtS2V5IGV4dGVuZHMgYCR7UHJlZml4fSR7c3RyaW5nfWAsXG4gIFN0cmluZ0VudW1UeXBlQWN0dWFsIGV4dGVuZHMgRXhhY3Q8U3RyaW5nRW51bVR5cGUsIFN0cmluZ0VudW1UeXBlQWN0dWFsPixcbiAgUHJlZml4IGV4dGVuZHMgc3RyaW5nLFxuICAvL1xuICAvLyBQYXJhbWV0ZXJzIGFmdGVyIHRoaXMgcG9pbnQgd2lsbCBiZSBpbmZlcnJlZDsgdGhleSdyZSBub3QgbWVhbnQgbm90IHRvIGJlIHNwZWNpZmllZCBieSBkZXZlbG9wZXJzXG4gIFVuc3BlY2lmaWVkID0gUHJvdG9FbnVtS2V5IGV4dGVuZHMgYCR7UHJlZml4fVVOU1BFQ0lGSUVEYCA/ICdVTlNQRUNJRklFRCcgOiBuZXZlcixcbiAgU2hvcnRTdHJpbmdFbnVtS2V5IGV4dGVuZHMgUmVtb3ZlUHJlZml4PFByZWZpeCwgUHJvdG9FbnVtS2V5PiA9IEV4Y2x1ZGU8XG4gICAgUmVtb3ZlUHJlZml4PFByZWZpeCwgUHJvdG9FbnVtS2V5PixcbiAgICBVbnNwZWNpZmllZFxuICA+LFxuICBTdHJpbmdFbnVtVHlwZSBleHRlbmRzIFByb3RvQ29uc3RPYmplY3RPZlN0cmluZ3NFbnVtPFxuICAgIFNob3J0U3RyaW5nRW51bUtleSxcbiAgICBQcmVmaXgsXG4gICAgVW5zcGVjaWZpZWRcbiAgPiA9IFByb3RvQ29uc3RPYmplY3RPZlN0cmluZ3NFbnVtPFNob3J0U3RyaW5nRW51bUtleSwgUHJlZml4LCBVbnNwZWNpZmllZD4sXG4gIE1hcFRhYmxlIGV4dGVuZHMgUHJvdG9FbnVtVG9Db25zdE9iamVjdE9mU3RyaW5nTWFwVGFibGU8XG4gICAgU3RyaW5nRW51bVR5cGUsXG4gICAgUHJvdG9FbnVtVmFsdWUsXG4gICAgUHJvdG9FbnVtLFxuICAgIFByb3RvRW51bUtleSxcbiAgICBQcmVmaXgsXG4gICAgVW5zcGVjaWZpZWQsXG4gICAgU2hvcnRTdHJpbmdFbnVtS2V5XG4gID4gPSBQcm90b0VudW1Ub0NvbnN0T2JqZWN0T2ZTdHJpbmdNYXBUYWJsZTxcbiAgICBTdHJpbmdFbnVtVHlwZSxcbiAgICBQcm90b0VudW1WYWx1ZSxcbiAgICBQcm90b0VudW0sXG4gICAgUHJvdG9FbnVtS2V5LFxuICAgIFByZWZpeCxcbiAgICBVbnNwZWNpZmllZCxcbiAgICBTaG9ydFN0cmluZ0VudW1LZXlcbiAgPixcbj4oXG4gIG1hcFRhYmxlOiBNYXBUYWJsZSxcbiAgcHJlZml4OiBQcmVmaXhcbik6IFtcbiAgKFxuICAgIGlucHV0OiBTaG9ydFN0cmluZ0VudW1LZXkgfCBgJHtQcmVmaXh9JHtTaG9ydFN0cmluZ0VudW1LZXl9YCB8IFByb3RvRW51bVZhbHVlIHwgbnVsbCB8IHVuZGVmaW5lZFxuICApID0+IFByb3RvRW51bVZhbHVlIHwgdW5kZWZpbmVkLCAvL1xuICAoaW5wdXQ6IFByb3RvRW51bVZhbHVlIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4gU2hvcnRTdHJpbmdFbnVtS2V5IHwgdW5kZWZpbmVkLCAvL1xuXSB7XG4gIGNvbnN0IHJldmVyc2VUYWJsZTogUmVjb3JkPFByb3RvRW51bVZhbHVlLCBTaG9ydFN0cmluZ0VudW1LZXk+ID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKG1hcFRhYmxlKS5tYXAoKFtrLCB2XSkgPT4gW3YsIGtdKVxuICApO1xuICBjb25zdCBoYXNVbnNwZWNpZmllZCA9IChtYXBUYWJsZSBhcyBhbnkpWydVTlNQRUNJRklFRCddID09PSAwIHx8IChtYXBUYWJsZSBhcyBhbnkpW2Ake3ByZWZpeH1VTlNQRUNJRklFRGBdID09PSAwO1xuXG4gIGZ1bmN0aW9uIGlzU2hvcnRTdHJpbmdFbnVtS2V5cyh4OiB1bmtub3duKTogeCBpcyBTaG9ydFN0cmluZ0VudW1LZXkge1xuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ3N0cmluZycgJiYgeCBpbiBtYXBUYWJsZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTnVtZXJpY0VudW1WYWx1ZSh4OiB1bmtub3duKTogeCBpcyBQcm90b0VudW1ba2V5b2YgUHJvdG9FbnVtXSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnbnVtYmVyJyAmJiB4IGluIHJldmVyc2VUYWJsZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuY29kZShcbiAgICBpbnB1dDogU2hvcnRTdHJpbmdFbnVtS2V5IHwgYCR7UHJlZml4fSR7U2hvcnRTdHJpbmdFbnVtS2V5fWAgfCBQcm90b0VudW1WYWx1ZSB8IG51bGwgfCB1bmRlZmluZWRcbiAgKTogUHJvdG9FbnVtVmFsdWUgfCB1bmRlZmluZWQge1xuICAgIGlmIChpbnB1dCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgbGV0IHNob3J0ZW46IHN0cmluZyA9IGlucHV0O1xuICAgICAgaWYgKHNob3J0ZW4uc3RhcnRzV2l0aChwcmVmaXgpKSB7XG4gICAgICAgIHNob3J0ZW4gPSBzaG9ydGVuLnNsaWNlKHByZWZpeC5sZW5ndGgpO1xuICAgICAgfVxuICAgICAgaWYgKGlzU2hvcnRTdHJpbmdFbnVtS2V5cyhzaG9ydGVuKSkge1xuICAgICAgICByZXR1cm4gbWFwVGFibGVbc2hvcnRlbl07XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgSW52YWxpZCBlbnVtIHZhbHVlOiAnJHtpbnB1dH0nYCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBJbnZhbGlkIGVudW0gdmFsdWU6ICcke2lucHV0fScgb2YgdHlwZSAke3R5cGVvZiBpbnB1dH1gKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoaW5wdXQ6IFByb3RvRW51bVZhbHVlIHwgbnVsbCB8IHVuZGVmaW5lZCk6IFNob3J0U3RyaW5nRW51bUtleSB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKGlucHV0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdudW1iZXInKSB7XG4gICAgICBpZiAoaGFzVW5zcGVjaWZpZWQgJiYgaW5wdXQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzTnVtZXJpY0VudW1WYWx1ZShpbnB1dCkpIHtcbiAgICAgICAgcmV0dXJuIHJldmVyc2VUYWJsZVtpbnB1dF07XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGdvdCBhIHByb3RvIGVudW0gdmFsdWUgdGhhdCB3ZSBkb24ndCB5ZXQga25vdyBhYm91dCAoaS5lLiBpdCBkaWRuJ3QgZXhpc3Qgd2hlbiB0aGlzIGNvZGVcbiAgICAgIC8vIHdhcyBjb21waWxlZCkuIFRoaXMgaXMgY2VydGFpbmx5IGEgcG9zc2liaWxpdHksIGJ1dCBnaXZlbiBob3cgb3VyIEFQSXMgZXZvbHZlLCB0aGlzIGlzIGlzXG4gICAgICAvLyB1bmxpa2VseSB0byBiZSBhIHRlcnJpYmx5IGJhZCB0aGluZyBieSBpdHNlbGYgKHdlIGF2b2lkIGFkZGluZyBuZXcgZW51bSB2YWx1ZXMgaW4gcGxhY2VzXG4gICAgICAvLyB0aGF0IHdvdWxkIGJyZWFrIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aCBleGlzdGluZyBkZXBsb3llZCBjb2RlKS4gVGhlcmVmb3JlLCB0aHJvd2luZ1xuICAgICAgLy8gb24gXCJ1bmV4cGVjdGVkXCIgdmFsdWVzIGlzIGxpa2VseSB0byBlbmQgdXAgY2F1c2luZyBtb3JlIHByb2JsZW1zIHRoYW4gaXQgbWlnaHQgYXZvaWQsXG4gICAgICAvLyBlc3BlY2lhbGx5IGdpdmVuIHRoYXQgdGhlIGRlY29kZWQgdmFsdWUgbWF5IGFjdHVhbGx5IG5ldmVyIGdldCByZWFkIGFud3lheS5cbiAgICAgIC8vXG4gICAgICAvLyBUaGVyZWZvcmUsIHdlIGluc3RlYWQgY2hlYXQgb24gdHlwZSBjb25zdHJhaW50cyBhbmQgcmV0dXJuIGEgc3RyaW5nIG9mIHRoZSBmb3JtIFwidW5rbm93bl8yM1wiLlxuICAgICAgLy8gVGhhdCBzb21ld2hhdCBtaXJyb3JzIHRoZSBiZWhhdmlvciB3ZSdkIGdldCB3aXRoIHRoZSBwdXJlIG51bWVyaWNhbCBhcHByb2FjaC5cbiAgICAgIHJldHVybiBgdW5rbm93bl8ke2lucHV0fWAgYXMgU2hvcnRTdHJpbmdFbnVtS2V5O1xuICAgIH1cblxuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBJbnZhbGlkIHByb3RvIGVudW0gdmFsdWU6ICcke2lucHV0fScgb2YgdHlwZSAke3R5cGVvZiBpbnB1dH1gKTtcbiAgfVxuXG4gIHJldHVybiBbZW5jb2RlLCBkZWNvZGVdIGFzIGNvbnN0O1xufVxuXG4vKipcbiAqIEdpdmVuIHRoZSBleHBsb2RlZCBwYXJhbWV0ZXJzIG9mIGEgcHJvdG8gZW51bSAoaS5lLiBzaG9ydCBrZXlzLCBwcmVmaXgsIGFuZCBzaG9ydCBrZXkgb2YgdGhlXG4gKiB1bnNwZWNpZmllZCB2YWx1ZSksIG1ha2UgYSB0eXBlIHRoYXQgX2V4YWN0bHlfIGNvcnJlc3BvbmRzIHRvIHRoZSBjb25zdCBvYmplY3Qgb2Ygc3RyaW5ncyBlbnVtLFxuICogZS5nLiB0aGUgdHlwZSB0aGF0IHRoZSBkZXZlbG9wZXIgaXMgZXhwZWN0ZWQgdG8gd3JpdGUuXG4gKlxuICogRm9yIGV4YW1wbGUsIGZvciBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlBhcmVudENsb3NlUG9saWN5LCB0aGlzIGV2YWx1YXRlcyB0bzpcbiAqXG4gKiB7XG4gKiAgIFRFUk1JTkFURTogXCJURVJNSU5BVEVcIjtcbiAqICAgQUJBTkRPTjogXCJBQkFORE9OXCI7XG4gKiAgIFJFUVVFU1RfQ0FOQ0VMOiBcIlJFUVVFU1RfQ0FOQ0VMXCI7XG4gKlxuICogICBQQVJFTlRfQ0xPU0VfUE9MSUNZX1RFUk1JTkFURT86IFwiVEVSTUlOQVRFXCI7XG4gKiAgIFBBUkVOVF9DTE9TRV9QT0xJQ1lfQUJBTkRPTj86IFwiQUJBTkRPTlwiO1xuICogICBQQVJFTlRfQ0xPU0VfUE9MSUNZX1JFUVVFU1RfQ0FOQ0VMPzogXCJSRVFVRVNUX0NBTkNFTFwiO1xuICpcbiAqICAgUEFSRU5UX0NMT1NFX1BPTElDWV9VTlNQRUNJRklFRD86IHVuZGVmaW5lZDtcbiAqIH1cbiAqL1xudHlwZSBQcm90b0NvbnN0T2JqZWN0T2ZTdHJpbmdzRW51bTxcbiAgU2hvcnRTdHJpbmdFbnVtS2V5IGV4dGVuZHMgc3RyaW5nLFxuICBQcmVmaXggZXh0ZW5kcyBzdHJpbmcsXG4gIFVuc3BlY2lmaWVkLCAvLyBlLmcuICdVTlNQRUNJRklFRCdcbj4gPSBVbmlvblRvSW50ZXJzZWN0aW9uPFxuICB8IHtcbiAgICAgIC8vIGUuZy46IFwiVEVSTUlOQVRFXCI6IFwiVEVSTUlOQVRFXCJcbiAgICAgIHJlYWRvbmx5IFtrIGluIFNob3J0U3RyaW5nRW51bUtleV06IGs7XG4gICAgfVxuICB8IHtcbiAgICAgIFtrIGluIFNob3J0U3RyaW5nRW51bUtleV06IFByZWZpeCBleHRlbmRzICcnXG4gICAgICAgID8gb2JqZWN0XG4gICAgICAgIDoge1xuICAgICAgICAgICAgLy8gZS5nLjogXCJQQVJFTlRfQ0xPU0VfUE9MSUNZX1RFUk1JTkFURVwiPzogXCJURVJNSU5BVEVcIlxuICAgICAgICAgICAgcmVhZG9ubHkgW2trIGluIGAke1ByZWZpeH0ke2t9YF0/OiBrO1xuICAgICAgICAgIH07XG4gICAgfVtTaG9ydFN0cmluZ0VudW1LZXldXG4gIHwgKFVuc3BlY2lmaWVkIGV4dGVuZHMgc3RyaW5nXG4gICAgICA/IHtcbiAgICAgICAgICAvLyBlLmcuOiBcIlBBUkVOVF9DTE9TRV9QT0xJQ1lfVU5TUEVDSUZJRURcIj86IHVuZGVmaW5lZFxuICAgICAgICAgIFtrIGluIGAke1ByZWZpeH0ke1Vuc3BlY2lmaWVkfWBdPzogdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICA6IG9iamVjdClcbiAgfCAoVW5zcGVjaWZpZWQgZXh0ZW5kcyBzdHJpbmdcbiAgICAgID8ge1xuICAgICAgICAgIC8vIGUuZy46IFwiVU5TUEVDSUZJRURcIj86IHVuZGVmaW5lZFxuICAgICAgICAgIFtrIGluIGAke1Vuc3BlY2lmaWVkfWBdPzogdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICA6IG9iamVjdClcbj47XG5cbi8qKlxuICogR2l2ZW4gdGhlIGV4cGxvZGVkIHBhcmFtZXRlcnMgb2YgYSBwcm90byBlbnVtIChpLmUuIHNob3J0IGtleXMsIHByZWZpeCwgYW5kIHNob3J0IGtleSBvZiB0aGVcbiAqIHVuc3BlY2lmaWVkIHZhbHVlKSwgbWFrZSBhIHR5cGUgdGhhdCBfZXhhY3RseV8gY29ycmVzcG9uZHMgdG8gdGhlIG1hcHBpbmcgdGFibGUgdGhhdCB0aGUgdXNlciBpc1xuICogZXhwZWN0ZWQgdG8gcHJvdmlkZS5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgZm9yIGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuUGFyZW50Q2xvc2VQb2xpY3ksIHRoaXMgZXZhbHVhdGVzIHRvOlxuICpcbiAqIHtcbiAqICBVTlNQRUNJRklFRDogMCxcbiAqICBURVJNSU5BVEU6IDEsXG4gKiAgQUJBTkRPTjogMixcbiAqICBSRVFVRVNUX0NBTkNFTDogMyxcbiAqIH1cbiAqL1xudHlwZSBQcm90b0VudW1Ub0NvbnN0T2JqZWN0T2ZTdHJpbmdNYXBUYWJsZTxcbiAgX1N0cmluZ0VudW0gZXh0ZW5kcyBQcm90b0NvbnN0T2JqZWN0T2ZTdHJpbmdzRW51bTxTaG9ydFN0cmluZ0VudW1LZXksIFByZWZpeCwgVW5zcGVjaWZpZWQ+LFxuICBQcm90b0VudW1WYWx1ZSBleHRlbmRzIG51bWJlcixcbiAgUHJvdG9FbnVtIGV4dGVuZHMgeyBbayBpbiBQcm90b0VudW1LZXldOiBQcm90b0VudW1WYWx1ZSB9LFxuICBQcm90b0VudW1LZXkgZXh0ZW5kcyBgJHtQcmVmaXh9JHtzdHJpbmd9YCxcbiAgUHJlZml4IGV4dGVuZHMgc3RyaW5nLFxuICBVbnNwZWNpZmllZCxcbiAgU2hvcnRTdHJpbmdFbnVtS2V5IGV4dGVuZHMgUmVtb3ZlUHJlZml4PFByZWZpeCwgUHJvdG9FbnVtS2V5Pixcbj4gPSBVbmlvblRvSW50ZXJzZWN0aW9uPFxuICB7XG4gICAgW2sgaW4gUHJvdG9FbnVtS2V5XToge1xuICAgICAgW2trIGluIFJlbW92ZVByZWZpeDxQcmVmaXgsIGs+XTogUHJvdG9FbnVtW2tdIGV4dGVuZHMgbnVtYmVyID8gUHJvdG9FbnVtW2tdIDogbmV2ZXI7XG4gICAgfTtcbiAgfVtQcm90b0VudW1LZXldXG4+O1xuIiwiZXhwb3J0ICogZnJvbSAnLi9lbnVtcy1oZWxwZXJzJztcbiIsImV4cG9ydCB0eXBlIExvZ0xldmVsID0gJ1RSQUNFJyB8ICdERUJVRycgfCAnSU5GTycgfCAnV0FSTicgfCAnRVJST1InO1xuXG5leHBvcnQgdHlwZSBMb2dNZXRhZGF0YSA9IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIGFueT47XG5cbi8qKlxuICogSW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlIGluIG9yZGVyIHRvIGN1c3RvbWl6ZSB3b3JrZXIgbG9nZ2luZ1xuICovXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gIGxvZyhsZXZlbDogTG9nTGV2ZWwsIG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICB0cmFjZShtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIGluZm8obWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIHdhcm4obWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xufVxuXG4vKipcbiAqIFBvc3NpYmxlIHZhbHVlcyBvZiB0aGUgYHNka0NvbXBvbmVudGAgbWV0YSBhdHRyaWJ1dGVzIG9uIGxvZyBtZXNzYWdlcy4gVGhpc1xuICogYXR0cmlidXRlIGluZGljYXRlcyB3aGljaCBzdWJzeXN0ZW0gZW1pdHRlZCB0aGUgbG9nIG1lc3NhZ2U7IHRoaXMgbWF5IGZvclxuICogZXhhbXBsZSBiZSB1c2VkIHRvIGltcGxlbWVudCBmaW5lLWdyYWluZWQgZmlsdGVyaW5nIG9mIGxvZyBtZXNzYWdlcy5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgdGhpcyBsaXN0IHdpbGwgcmVtYWluIHN0YWJsZSBpbiB0aGVcbiAqIGZ1dHVyZTsgdmFsdWVzIG1heSBiZSBhZGRlZCBvciByZW1vdmVkLCBhbmQgbWVzc2FnZXMgdGhhdCBhcmUgY3VycmVudGx5XG4gKiBlbWl0dGVkIHdpdGggc29tZSBgc2RrQ29tcG9uZW50YCB2YWx1ZSBtYXkgdXNlIGEgZGlmZmVyZW50IHZhbHVlIGluIHRoZSBmdXR1cmUuXG4gKi9cbmV4cG9ydCBlbnVtIFNka0NvbXBvbmVudCB7XG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgbWVzc2FnZXMgZW1pdGVkIGZyb20gV29ya2Zsb3cgY29kZSwgdXNpbmcgdGhlIHtAbGluayBXb3JrZmxvdyBjb250ZXh0IGxvZ2dlcnx3b3JrZmxvdy5sb2d9LlxuICAgKiBUaGUgU0RLIGl0c2VsZiBuZXZlciBwdWJsaXNoZXMgbWVzc2FnZXMgd2l0aCB0aGlzIGNvbXBvbmVudCBuYW1lLlxuICAgKi9cbiAgd29ya2Zsb3cgPSAnd29ya2Zsb3cnLFxuXG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgbWVzc2FnZXMgZW1pdGVkIGZyb20gYW4gYWN0aXZpdHksIHVzaW5nIHRoZSB7QGxpbmsgYWN0aXZpdHkgY29udGV4dCBsb2dnZXJ8Q29udGV4dC5sb2d9LlxuICAgKiBUaGUgU0RLIGl0c2VsZiBuZXZlciBwdWJsaXNoZXMgbWVzc2FnZXMgd2l0aCB0aGlzIGNvbXBvbmVudCBuYW1lLlxuICAgKi9cbiAgYWN0aXZpdHkgPSAnYWN0aXZpdHknLFxuXG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgbWVzc2FnZXMgZW1pdGVkIGZyb20gYSBUZW1wb3JhbCBXb3JrZXIgaW5zdGFuY2UuXG4gICAqXG4gICAqIFRoaXMgbm90YWJseSBpbmNsdWRlczpcbiAgICogLSBJc3N1ZXMgd2l0aCBXb3JrZXIgb3IgcnVudGltZSBjb25maWd1cmF0aW9uLCBvciB0aGUgSlMgZXhlY3V0aW9uIGVudmlyb25tZW50O1xuICAgKiAtIFdvcmtlcidzLCBBY3Rpdml0eSdzLCBhbmQgV29ya2Zsb3cncyBsaWZlY3ljbGUgZXZlbnRzO1xuICAgKiAtIFdvcmtmbG93IEFjdGl2YXRpb24gYW5kIEFjdGl2aXR5IFRhc2sgcHJvY2Vzc2luZyBldmVudHM7XG4gICAqIC0gV29ya2Zsb3cgYnVuZGxpbmcgbWVzc2FnZXM7XG4gICAqIC0gU2luayBwcm9jZXNzaW5nIGlzc3Vlcy5cbiAgICovXG4gIHdvcmtlciA9ICd3b3JrZXInLFxuXG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgYWxsIG1lc3NhZ2VzIGVtaXR0ZWQgYnkgdGhlIFJ1c3QgQ29yZSBTREsgbGlicmFyeS5cbiAgICovXG4gIGNvcmUgPSAnY29yZScsXG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgVmFsdWVFcnJvciB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IER1cmF0aW9uLCBtc09wdGlvbmFsVG9OdW1iZXIsIG1zT3B0aW9uYWxUb1RzLCBtc1RvTnVtYmVyLCBtc1RvVHMsIG9wdGlvbmFsVHNUb01zIH0gZnJvbSAnLi90aW1lJztcblxuLyoqXG4gKiBPcHRpb25zIGZvciByZXRyeWluZyBXb3JrZmxvd3MgYW5kIEFjdGl2aXRpZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXRyeVBvbGljeSB7XG4gIC8qKlxuICAgKiBDb2VmZmljaWVudCB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgbmV4dCByZXRyeSBpbnRlcnZhbC5cbiAgICogVGhlIG5leHQgcmV0cnkgaW50ZXJ2YWwgaXMgcHJldmlvdXMgaW50ZXJ2YWwgbXVsdGlwbGllZCBieSB0aGlzIGNvZWZmaWNpZW50LlxuICAgKiBAbWluaW11bSAxXG4gICAqIEBkZWZhdWx0IDJcbiAgICovXG4gIGJhY2tvZmZDb2VmZmljaWVudD86IG51bWJlcjtcbiAgLyoqXG4gICAqIEludGVydmFsIG9mIHRoZSBmaXJzdCByZXRyeS5cbiAgICogSWYgY29lZmZpY2llbnQgaXMgMSB0aGVuIGl0IGlzIHVzZWQgZm9yIGFsbCByZXRyaWVzXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKiBAZGVmYXVsdCAxIHNlY29uZFxuICAgKi9cbiAgaW5pdGlhbEludGVydmFsPzogRHVyYXRpb247XG4gIC8qKlxuICAgKiBNYXhpbXVtIG51bWJlciBvZiBhdHRlbXB0cy4gV2hlbiBleGNlZWRlZCwgcmV0cmllcyBzdG9wIChldmVuIGlmIHtAbGluayBBY3Rpdml0eU9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dH1cbiAgICogaGFzbid0IGJlZW4gcmVhY2hlZCkuXG4gICAqXG4gICAqIEBkZWZhdWx0IEluZmluaXR5XG4gICAqL1xuICBtYXhpbXVtQXR0ZW1wdHM/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBNYXhpbXVtIGludGVydmFsIGJldHdlZW4gcmV0cmllcy5cbiAgICogRXhwb25lbnRpYWwgYmFja29mZiBsZWFkcyB0byBpbnRlcnZhbCBpbmNyZWFzZS5cbiAgICogVGhpcyB2YWx1ZSBpcyB0aGUgY2FwIG9mIHRoZSBpbmNyZWFzZS5cbiAgICpcbiAgICogQGRlZmF1bHQgMTAweCBvZiB7QGxpbmsgaW5pdGlhbEludGVydmFsfVxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIG1heGltdW1JbnRlcnZhbD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBMaXN0IG9mIGFwcGxpY2F0aW9uIGZhaWx1cmVzIHR5cGVzIHRvIG5vdCByZXRyeS5cbiAgICovXG4gIG5vblJldHJ5YWJsZUVycm9yVHlwZXM/OiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBUdXJuIGEgVFMgUmV0cnlQb2xpY3kgaW50byBhIHByb3RvIGNvbXBhdGlibGUgUmV0cnlQb2xpY3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVSZXRyeVBvbGljeShyZXRyeVBvbGljeTogUmV0cnlQb2xpY3kpOiB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklSZXRyeVBvbGljeSB7XG4gIGlmIChyZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgIT0gbnVsbCAmJiByZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgPD0gMCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgbXVzdCBiZSBncmVhdGVyIHRoYW4gMCcpO1xuICB9XG4gIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgIT0gbnVsbCkge1xuICAgIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xuICAgICAgLy8gZHJvcCBmaWVsZCAoSW5maW5pdHkgaXMgdGhlIGRlZmF1bHQpXG4gICAgICBjb25zdCB7IG1heGltdW1BdHRlbXB0czogXywgLi4ud2l0aG91dCB9ID0gcmV0cnlQb2xpY3k7XG4gICAgICByZXRyeVBvbGljeSA9IHdpdGhvdXQ7XG4gICAgfSBlbHNlIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPD0gMCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlcicpO1xuICAgIH0gZWxzZSBpZiAoIU51bWJlci5pc0ludGVnZXIocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzKSkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyBtdXN0IGJlIGFuIGludGVnZXInKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgbWF4aW11bUludGVydmFsID0gbXNPcHRpb25hbFRvTnVtYmVyKHJldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCk7XG4gIGNvbnN0IGluaXRpYWxJbnRlcnZhbCA9IG1zVG9OdW1iZXIocmV0cnlQb2xpY3kuaW5pdGlhbEludGVydmFsID8/IDEwMDApO1xuICBpZiAobWF4aW11bUludGVydmFsID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCBjYW5ub3QgYmUgMCcpO1xuICB9XG4gIGlmIChpbml0aWFsSW50ZXJ2YWwgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kuaW5pdGlhbEludGVydmFsIGNhbm5vdCBiZSAwJyk7XG4gIH1cbiAgaWYgKG1heGltdW1JbnRlcnZhbCAhPSBudWxsICYmIG1heGltdW1JbnRlcnZhbCA8IGluaXRpYWxJbnRlcnZhbCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwgY2Fubm90IGJlIGxlc3MgdGhhbiBpdHMgaW5pdGlhbEludGVydmFsJyk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBtYXhpbXVtQXR0ZW1wdHM6IHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyxcbiAgICBpbml0aWFsSW50ZXJ2YWw6IG1zVG9Ucyhpbml0aWFsSW50ZXJ2YWwpLFxuICAgIG1heGltdW1JbnRlcnZhbDogbXNPcHRpb25hbFRvVHMobWF4aW11bUludGVydmFsKSxcbiAgICBiYWNrb2ZmQ29lZmZpY2llbnQ6IHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCxcbiAgICBub25SZXRyeWFibGVFcnJvclR5cGVzOiByZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzLFxuICB9O1xufVxuXG4vKipcbiAqIFR1cm4gYSBwcm90byBjb21wYXRpYmxlIFJldHJ5UG9saWN5IGludG8gYSBUUyBSZXRyeVBvbGljeVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb21waWxlUmV0cnlQb2xpY3koXG4gIHJldHJ5UG9saWN5PzogdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JUmV0cnlQb2xpY3kgfCBudWxsXG4pOiBSZXRyeVBvbGljeSB8IHVuZGVmaW5lZCB7XG4gIGlmICghcmV0cnlQb2xpY3kpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiYWNrb2ZmQ29lZmZpY2llbnQ6IHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCA/PyB1bmRlZmluZWQsXG4gICAgbWF4aW11bUF0dGVtcHRzOiByZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPz8gdW5kZWZpbmVkLFxuICAgIG1heGltdW1JbnRlcnZhbDogb3B0aW9uYWxUc1RvTXMocmV0cnlQb2xpY3kubWF4aW11bUludGVydmFsKSxcbiAgICBpbml0aWFsSW50ZXJ2YWw6IG9wdGlvbmFsVHNUb01zKHJldHJ5UG9saWN5LmluaXRpYWxJbnRlcnZhbCksXG4gICAgbm9uUmV0cnlhYmxlRXJyb3JUeXBlczogcmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlcyA/PyB1bmRlZmluZWQsXG4gIH07XG59XG4iLCJpbXBvcnQgTG9uZyBmcm9tICdsb25nJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBpbXBvcnQvbm8tbmFtZWQtYXMtZGVmYXVsdFxuaW1wb3J0IG1zLCB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuaW1wb3J0IHR5cGUgeyBnb29nbGUgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBWYWx1ZUVycm9yIH0gZnJvbSAnLi9lcnJvcnMnO1xuXG4vLyBOT1RFOiB0aGVzZSBhcmUgdGhlIHNhbWUgaW50ZXJmYWNlIGluIEpTXG4vLyBnb29nbGUucHJvdG9idWYuSUR1cmF0aW9uO1xuLy8gZ29vZ2xlLnByb3RvYnVmLklUaW1lc3RhbXA7XG4vLyBUaGUgY29udmVyc2lvbiBmdW5jdGlvbnMgYmVsb3cgc2hvdWxkIHdvcmsgZm9yIGJvdGhcblxuZXhwb3J0IHR5cGUgVGltZXN0YW1wID0gZ29vZ2xlLnByb3RvYnVmLklUaW1lc3RhbXA7XG5cbi8qKlxuICogQSBkdXJhdGlvbiwgZXhwcmVzc2VkIGVpdGhlciBhcyBhIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIG9yIGFzIGEge0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ30uXG4gKi9cbmV4cG9ydCB0eXBlIER1cmF0aW9uID0gU3RyaW5nVmFsdWUgfCBudW1iZXI7XG5cbmV4cG9ydCB0eXBlIHsgU3RyaW5nVmFsdWUgfSBmcm9tICdtcyc7XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93LlxuICogSWYgdHMgaXMgbnVsbCBvciB1bmRlZmluZWQgcmV0dXJucyB1bmRlZmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gdHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3cuXG4gKiBJZiB0cyBpcyBudWxsIG9yIHVuZGVmaW5lZCwgdGhyb3dzIGEgVHlwZUVycm9yLCB3aXRoIGVycm9yIG1lc3NhZ2UgaW5jbHVkaW5nIHRoZSBuYW1lIG9mIHRoZSBmaWVsZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVkVHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkLCBmaWVsZE5hbWU6IHN0cmluZyk6IG51bWJlciB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgJHtmaWVsZE5hbWV9IHRvIGJlIGEgdGltZXN0YW1wLCBnb3QgJHt0c31gKTtcbiAgfVxuICByZXR1cm4gdHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCB0aW1lc3RhbXAsIGdvdCAke3RzfWApO1xuICB9XG4gIGNvbnN0IHsgc2Vjb25kcywgbmFub3MgfSA9IHRzO1xuICByZXR1cm4gKHNlY29uZHMgfHwgTG9uZy5VWkVSTylcbiAgICAubXVsKDEwMDApXG4gICAgLmFkZChNYXRoLmZsb29yKChuYW5vcyB8fCAwKSAvIDEwMDAwMDApKVxuICAgIC50b051bWJlcigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNOdW1iZXJUb1RzKG1pbGxpczogbnVtYmVyKTogVGltZXN0YW1wIHtcbiAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IobWlsbGlzIC8gMTAwMCk7XG4gIGNvbnN0IG5hbm9zID0gKG1pbGxpcyAlIDEwMDApICogMTAwMDAwMDtcbiAgaWYgKE51bWJlci5pc05hTihzZWNvbmRzKSB8fCBOdW1iZXIuaXNOYU4obmFub3MpKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYEludmFsaWQgbWlsbGlzICR7bWlsbGlzfWApO1xuICB9XG4gIHJldHVybiB7IHNlY29uZHM6IExvbmcuZnJvbU51bWJlcihzZWNvbmRzKSwgbmFub3MgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zVG9UcyhzdHI6IER1cmF0aW9uKTogVGltZXN0YW1wIHtcbiAgcmV0dXJuIG1zTnVtYmVyVG9Ucyhtc1RvTnVtYmVyKHN0cikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNPcHRpb25hbFRvVHMoc3RyOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCB8IG51bGwpOiBUaW1lc3RhbXAgfCB1bmRlZmluZWQge1xuICByZXR1cm4gc3RyID8gbXNUb1RzKHN0cikgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9OdW1iZXIodmFsOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgcmV0dXJuIG1zVG9OdW1iZXIodmFsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zVG9OdW1iZXIodmFsOiBEdXJhdGlvbik6IG51bWJlciB7XG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbiAgcmV0dXJuIG1zV2l0aFZhbGlkYXRpb24odmFsKTtcbn1cblxuZnVuY3Rpb24gbXNXaXRoVmFsaWRhdGlvbihzdHI6IFN0cmluZ1ZhbHVlKTogbnVtYmVyIHtcbiAgY29uc3QgbWlsbGlzID0gbXMoc3RyKTtcbiAgaWYgKG1pbGxpcyA9PSBudWxsIHx8IGlzTmFOKG1pbGxpcykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGR1cmF0aW9uIHN0cmluZzogJyR7c3RyfSdgKTtcbiAgfVxuICByZXR1cm4gbWlsbGlzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHNUb0RhdGUodHM6IFRpbWVzdGFtcCk6IERhdGUge1xuICByZXR1cm4gbmV3IERhdGUodHNUb01zKHRzKSk7XG59XG5cbi8vIHRzLXBydW5lLWlnbm9yZS1uZXh0XG5leHBvcnQgZnVuY3Rpb24gcmVxdWlyZWRUc1RvRGF0ZSh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCwgZmllbGROYW1lOiBzdHJpbmcpOiBEYXRlIHtcbiAgcmV0dXJuIG5ldyBEYXRlKHJlcXVpcmVkVHNUb01zKHRzLCBmaWVsZE5hbWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb0RhdGUodHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHRzID09PSB1bmRlZmluZWQgfHwgdHMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiBuZXcgRGF0ZSh0c1RvTXModHMpKTtcbn1cblxuLy8gdHMtcHJ1bmUtaWdub3JlLW5leHQgKGltcG9ydGVkIHZpYSBzY2hlZHVsZS1oZWxwZXJzLnRzKVxuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsRGF0ZVRvVHMoZGF0ZTogRGF0ZSB8IG51bGwgfCB1bmRlZmluZWQpOiBUaW1lc3RhbXAgfCB1bmRlZmluZWQge1xuICBpZiAoZGF0ZSA9PT0gdW5kZWZpbmVkIHx8IGRhdGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiBtc1RvVHMoZGF0ZS5nZXRUaW1lKCkpO1xufVxuIiwiLyoqIFNob3J0aGFuZCBhbGlhcyAqL1xuZXhwb3J0IHR5cGUgQW55RnVuYyA9ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55O1xuLyoqIEEgdHVwbGUgd2l0aG91dCBpdHMgbGFzdCBlbGVtZW50ICovXG5leHBvcnQgdHlwZSBPbWl0TGFzdDxUPiA9IFQgZXh0ZW5kcyBbLi4uaW5mZXIgUkVTVCwgYW55XSA/IFJFU1QgOiBuZXZlcjtcbi8qKiBGIHdpdGggYWxsIGFyZ3VtZW50cyBidXQgdGhlIGxhc3QgKi9cbmV4cG9ydCB0eXBlIE9taXRMYXN0UGFyYW08RiBleHRlbmRzIEFueUZ1bmM+ID0gKC4uLmFyZ3M6IE9taXRMYXN0PFBhcmFtZXRlcnM8Rj4+KSA9PiBSZXR1cm5UeXBlPEY+O1xuLyoqIFJlcXVpcmUgdGhhdCBUIGhhcyBhdCBsZWFzdCBvbmUgb2YgdGhlIHByb3ZpZGVkIHByb3BlcnRpZXMgZGVmaW5lZCAqL1xuZXhwb3J0IHR5cGUgUmVxdWlyZUF0TGVhc3RPbmU8VCwgS2V5cyBleHRlbmRzIGtleW9mIFQgPSBrZXlvZiBUPiA9IFBpY2s8VCwgRXhjbHVkZTxrZXlvZiBULCBLZXlzPj4gJlxuICB7XG4gICAgW0sgaW4gS2V5c10tPzogUmVxdWlyZWQ8UGljazxULCBLPj4gJiBQYXJ0aWFsPFBpY2s8VCwgRXhjbHVkZTxLZXlzLCBLPj4+O1xuICB9W0tleXNdO1xuXG4vKiogVmVyaWZ5IHRoYXQgYW4gdHlwZSBfQ29weSBleHRlbmRzIF9PcmlnICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tFeHRlbmRzPF9PcmlnLCBfQ29weSBleHRlbmRzIF9PcmlnPigpOiB2b2lkIHtcbiAgLy8gbm9vcCwganVzdCB0eXBlIGNoZWNrXG59XG5cbmV4cG9ydCB0eXBlIFJlcGxhY2U8QmFzZSwgTmV3PiA9IE9taXQ8QmFzZSwga2V5b2YgTmV3PiAmIE5ldztcblxuLy8gRnJvbSBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3R5cGUtZmVzdC9ibG9iL21haW4vc291cmNlL3VuaW9uLXRvLWludGVyc2VjdGlvbi5kLnRzXG4vLyBNSVQgb3IgQ0MwLTEuMCDigJQgSXQgaXMgbWVhbnQgdG8gYmUgY29waWVkIGludG8geW91ciBjb2RlYmFzZSByYXRoZXIgdGhhbiBiZWluZyB1c2VkIGFzIGEgZGVwZW5kZW5jeS5cbmV4cG9ydCB0eXBlIFVuaW9uVG9JbnRlcnNlY3Rpb248VW5pb24+ID1cbiAgLy8gYGV4dGVuZHMgdW5rbm93bmAgaXMgYWx3YXlzIGdvaW5nIHRvIGJlIHRoZSBjYXNlIGFuZCBpcyB1c2VkIHRvIGNvbnZlcnQgdGhlIGBVbmlvbmAgaW50byBhXG4gIC8vIFtkaXN0cmlidXRpdmUgY29uZGl0aW9uYWwgdHlwZV0oaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svcmVsZWFzZS1ub3Rlcy90eXBlc2NyaXB0LTItOC5odG1sI2Rpc3RyaWJ1dGl2ZS1jb25kaXRpb25hbC10eXBlcykuXG4gIChcbiAgICBVbmlvbiBleHRlbmRzIHVua25vd25cbiAgICAgID8gLy8gVGhlIHVuaW9uIHR5cGUgaXMgdXNlZCBhcyB0aGUgb25seSBhcmd1bWVudCB0byBhIGZ1bmN0aW9uIHNpbmNlIHRoZSB1bmlvblxuICAgICAgICAvLyBvZiBmdW5jdGlvbiBhcmd1bWVudHMgaXMgYW4gaW50ZXJzZWN0aW9uLlxuICAgICAgICAoZGlzdHJpYnV0ZWRVbmlvbjogVW5pb24pID0+IHZvaWRcbiAgICAgIDogLy8gVGhpcyB3b24ndCBoYXBwZW4uXG4gICAgICAgIG5ldmVyXG4gICkgZXh0ZW5kcyAvLyBJbmZlciB0aGUgYEludGVyc2VjdGlvbmAgdHlwZSBzaW5jZSBUeXBlU2NyaXB0IHJlcHJlc2VudHMgdGhlIHBvc2l0aW9uYWxcbiAgLy8gYXJndW1lbnRzIG9mIHVuaW9ucyBvZiBmdW5jdGlvbnMgYXMgYW4gaW50ZXJzZWN0aW9uIG9mIHRoZSB1bmlvbi5cbiAgKG1lcmdlZEludGVyc2VjdGlvbjogaW5mZXIgSW50ZXJzZWN0aW9uKSA9PiB2b2lkXG4gICAgPyAvLyBUaGUgYCYgVW5pb25gIGlzIHRvIGFsbG93IGluZGV4aW5nIGJ5IHRoZSByZXN1bHRpbmcgdHlwZVxuICAgICAgSW50ZXJzZWN0aW9uICYgVW5pb25cbiAgICA6IG5ldmVyO1xuXG50eXBlIElzRXF1YWw8QSwgQj4gPSAoPEc+KCkgPT4gRyBleHRlbmRzIEEgPyAxIDogMikgZXh0ZW5kcyA8Rz4oKSA9PiBHIGV4dGVuZHMgQiA/IDEgOiAyID8gdHJ1ZSA6IGZhbHNlO1xuXG50eXBlIFByaW1pdGl2ZSA9IG51bGwgfCB1bmRlZmluZWQgfCBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgc3ltYm9sIHwgYmlnaW50O1xuXG50eXBlIElzTnVsbDxUPiA9IFtUXSBleHRlbmRzIFtudWxsXSA/IHRydWUgOiBmYWxzZTtcblxudHlwZSBJc1Vua25vd248VD4gPSB1bmtub3duIGV4dGVuZHMgVCAvLyBgVGAgY2FuIGJlIGB1bmtub3duYCBvciBgYW55YFxuICA/IElzTnVsbDxUPiBleHRlbmRzIGZhbHNlIC8vIGBhbnlgIGNhbiBiZSBgbnVsbGAsIGJ1dCBgdW5rbm93bmAgY2FuJ3QgYmVcbiAgICA/IHRydWVcbiAgICA6IGZhbHNlXG4gIDogZmFsc2U7XG5cbnR5cGUgT2JqZWN0VmFsdWU8VCwgSz4gPSBLIGV4dGVuZHMga2V5b2YgVFxuICA/IFRbS11cbiAgOiBUb1N0cmluZzxLPiBleHRlbmRzIGtleW9mIFRcbiAgICA/IFRbVG9TdHJpbmc8Sz5dXG4gICAgOiBLIGV4dGVuZHMgYCR7aW5mZXIgTnVtYmVySyBleHRlbmRzIG51bWJlcn1gXG4gICAgICA/IE51bWJlcksgZXh0ZW5kcyBrZXlvZiBUXG4gICAgICAgID8gVFtOdW1iZXJLXVxuICAgICAgICA6IG5ldmVyXG4gICAgICA6IG5ldmVyO1xuXG50eXBlIFRvU3RyaW5nPFQ+ID0gVCBleHRlbmRzIHN0cmluZyB8IG51bWJlciA/IGAke1R9YCA6IG5ldmVyO1xuXG50eXBlIEtleXNPZlVuaW9uPE9iamVjdFR5cGU+ID0gT2JqZWN0VHlwZSBleHRlbmRzIHVua25vd24gPyBrZXlvZiBPYmplY3RUeXBlIDogbmV2ZXI7XG5cbnR5cGUgQXJyYXlFbGVtZW50PFQ+ID0gVCBleHRlbmRzIHJlYWRvbmx5IHVua25vd25bXSA/IFRbMF0gOiBuZXZlcjtcblxudHlwZSBFeGFjdE9iamVjdDxQYXJhbWV0ZXJUeXBlLCBJbnB1dFR5cGU+ID0ge1xuICBbS2V5IGluIGtleW9mIFBhcmFtZXRlclR5cGVdOiBFeGFjdDxQYXJhbWV0ZXJUeXBlW0tleV0sIE9iamVjdFZhbHVlPElucHV0VHlwZSwgS2V5Pj47XG59ICYgUmVjb3JkPEV4Y2x1ZGU8a2V5b2YgSW5wdXRUeXBlLCBLZXlzT2ZVbmlvbjxQYXJhbWV0ZXJUeXBlPj4sIG5ldmVyPjtcblxuZXhwb3J0IHR5cGUgRXhhY3Q8UGFyYW1ldGVyVHlwZSwgSW5wdXRUeXBlPiA9XG4gIC8vIEJlZm9yZSBkaXN0cmlidXRpbmcsIGNoZWNrIGlmIHRoZSB0d28gdHlwZXMgYXJlIGVxdWFsIGFuZCBpZiBzbywgcmV0dXJuIHRoZSBwYXJhbWV0ZXIgdHlwZSBpbW1lZGlhdGVseVxuICBJc0VxdWFsPFBhcmFtZXRlclR5cGUsIElucHV0VHlwZT4gZXh0ZW5kcyB0cnVlXG4gICAgPyBQYXJhbWV0ZXJUeXBlXG4gICAgOiAvLyBJZiB0aGUgcGFyYW1ldGVyIGlzIGEgcHJpbWl0aXZlLCByZXR1cm4gaXQgYXMgaXMgaW1tZWRpYXRlbHkgdG8gYXZvaWQgaXQgYmVpbmcgY29udmVydGVkIHRvIGEgY29tcGxleCB0eXBlXG4gICAgICBQYXJhbWV0ZXJUeXBlIGV4dGVuZHMgUHJpbWl0aXZlXG4gICAgICA/IFBhcmFtZXRlclR5cGVcbiAgICAgIDogLy8gSWYgdGhlIHBhcmFtZXRlciBpcyBhbiB1bmtub3duLCByZXR1cm4gaXQgYXMgaXMgaW1tZWRpYXRlbHkgdG8gYXZvaWQgaXQgYmVpbmcgY29udmVydGVkIHRvIGEgY29tcGxleCB0eXBlXG4gICAgICAgIElzVW5rbm93bjxQYXJhbWV0ZXJUeXBlPiBleHRlbmRzIHRydWVcbiAgICAgICAgPyB1bmtub3duXG4gICAgICAgIDogLy8gSWYgdGhlIHBhcmFtZXRlciBpcyBhIEZ1bmN0aW9uLCByZXR1cm4gaXQgYXMgaXMgYmVjYXVzZSB0aGlzIHR5cGUgaXMgbm90IGNhcGFibGUgb2YgaGFuZGxpbmcgZnVuY3Rpb24sIGxlYXZlIGl0IHRvIFR5cGVTY3JpcHRcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1mdW5jdGlvbi10eXBlXG4gICAgICAgICAgUGFyYW1ldGVyVHlwZSBleHRlbmRzIEZ1bmN0aW9uXG4gICAgICAgICAgPyBQYXJhbWV0ZXJUeXBlXG4gICAgICAgICAgOiAvLyBDb252ZXJ0IHVuaW9uIG9mIGFycmF5IHRvIGFycmF5IG9mIHVuaW9uOiBBW10gJiBCW10gPT4gKEEgJiBCKVtdXG4gICAgICAgICAgICBQYXJhbWV0ZXJUeXBlIGV4dGVuZHMgdW5rbm93bltdXG4gICAgICAgICAgICA/IEFycmF5PEV4YWN0PEFycmF5RWxlbWVudDxQYXJhbWV0ZXJUeXBlPiwgQXJyYXlFbGVtZW50PElucHV0VHlwZT4+PlxuICAgICAgICAgICAgOiAvLyBJbiBUeXBlU2NyaXB0LCBBcnJheSBpcyBhIHN1YnR5cGUgb2YgUmVhZG9ubHlBcnJheSwgc28gYWx3YXlzIHRlc3QgQXJyYXkgYmVmb3JlIFJlYWRvbmx5QXJyYXkuXG4gICAgICAgICAgICAgIFBhcmFtZXRlclR5cGUgZXh0ZW5kcyByZWFkb25seSB1bmtub3duW11cbiAgICAgICAgICAgICAgPyBSZWFkb25seUFycmF5PEV4YWN0PEFycmF5RWxlbWVudDxQYXJhbWV0ZXJUeXBlPiwgQXJyYXlFbGVtZW50PElucHV0VHlwZT4+PlxuICAgICAgICAgICAgICA6IEV4YWN0T2JqZWN0PFBhcmFtZXRlclR5cGUsIElucHV0VHlwZT47XG4vLyBFbmQgb2YgYm9ycm93IGZyb20gIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvdHlwZS1mZXN0L2Jsb2IvbWFpbi9zb3VyY2UvdW5pb24tdG8taW50ZXJzZWN0aW9uLmQudHNcblxuZXhwb3J0IHR5cGUgUmVtb3ZlUHJlZml4PFByZWZpeCBleHRlbmRzIHN0cmluZywgS2V5cyBleHRlbmRzIHN0cmluZz4gPSB7XG4gIFtrIGluIEtleXNdOiBrIGV4dGVuZHMgYCR7UHJlZml4fSR7aW5mZXIgU3VmZml4fWAgPyBTdWZmaXggOiBuZXZlcjtcbn1bS2V5c107XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlY29yZCh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eTxYIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIFkgZXh0ZW5kcyBQcm9wZXJ0eUtleT4oXG4gIHJlY29yZDogWCxcbiAgcHJvcDogWVxuKTogcmVjb3JkIGlzIFggJiBSZWNvcmQ8WSwgdW5rbm93bj4ge1xuICByZXR1cm4gcHJvcCBpbiByZWNvcmQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0aWVzPFggZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgWSBleHRlbmRzIFByb3BlcnR5S2V5PihcbiAgcmVjb3JkOiBYLFxuICBwcm9wczogWVtdXG4pOiByZWNvcmQgaXMgWCAmIFJlY29yZDxZLCB1bmtub3duPiB7XG4gIHJldHVybiBwcm9wcy5ldmVyeSgocHJvcCkgPT4gcHJvcCBpbiByZWNvcmQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFcnJvcihlcnJvcjogdW5rbm93bik6IGVycm9yIGlzIEVycm9yIHtcbiAgcmV0dXJuIChcbiAgICBpc1JlY29yZChlcnJvcikgJiZcbiAgICB0eXBlb2YgZXJyb3IubmFtZSA9PT0gJ3N0cmluZycgJiZcbiAgICB0eXBlb2YgZXJyb3IubWVzc2FnZSA9PT0gJ3N0cmluZycgJiZcbiAgICAoZXJyb3Iuc3RhY2sgPT0gbnVsbCB8fCB0eXBlb2YgZXJyb3Iuc3RhY2sgPT09ICdzdHJpbmcnKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBYm9ydEVycm9yKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgRXJyb3IgJiB7IG5hbWU6ICdBYm9ydEVycm9yJyB9IHtcbiAgcmV0dXJuIGlzRXJyb3IoZXJyb3IpICYmIGVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJztcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLm1lc3NhZ2VgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yTWVzc2FnZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc0Vycm9yKGVycm9yKSkge1xuICAgIHJldHVybiBlcnJvci5tZXNzYWdlO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuaW50ZXJmYWNlIEVycm9yV2l0aENvZGUge1xuICBjb2RlOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGlzRXJyb3JXaXRoQ29kZShlcnJvcjogdW5rbm93bik6IGVycm9yIGlzIEVycm9yV2l0aENvZGUge1xuICByZXR1cm4gaXNSZWNvcmQoZXJyb3IpICYmIHR5cGVvZiBlcnJvci5jb2RlID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLmNvZGVgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yQ29kZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc0Vycm9yV2l0aENvZGUoZXJyb3IpKSB7XG4gICAgcmV0dXJuIGVycm9yLmNvZGU7XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEFzc2VydHMgdGhhdCBzb21lIHR5cGUgaXMgdGhlIG5ldmVyIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5ldmVyKG1zZzogc3RyaW5nLCB4OiBuZXZlcik6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihtc2cgKyAnOiAnICsgeCk7XG59XG5cbmV4cG9ydCB0eXBlIENsYXNzPEUgZXh0ZW5kcyBFcnJvcj4gPSB7XG4gIG5ldyAoLi4uYXJnczogYW55W10pOiBFO1xuICBwcm90b3R5cGU6IEU7XG59O1xuXG4vKipcbiAqIEEgZGVjb3JhdG9yIHRvIGJlIHVzZWQgb24gZXJyb3IgY2xhc3Nlcy4gSXQgYWRkcyB0aGUgJ25hbWUnIHByb3BlcnR5IEFORCBwcm92aWRlcyBhIGN1c3RvbVxuICogJ2luc3RhbmNlb2YnIGhhbmRsZXIgdGhhdCB3b3JrcyBjb3JyZWN0bHkgYWNyb3NzIGV4ZWN1dGlvbiBjb250ZXh0cy5cbiAqXG4gKiAjIyMgRGV0YWlscyAjIyNcbiAqXG4gKiBBY2NvcmRpbmcgdG8gdGhlIEVjbWFTY3JpcHQncyBzcGVjLCB0aGUgZGVmYXVsdCBiZWhhdmlvciBvZiBKYXZhU2NyaXB0J3MgYHggaW5zdGFuY2VvZiBZYCBvcGVyYXRvciBpcyB0byB3YWxrIHVwIHRoZVxuICogcHJvdG90eXBlIGNoYWluIG9mIG9iamVjdCAneCcsIGNoZWNraW5nIGlmIGFueSBjb25zdHJ1Y3RvciBpbiB0aGF0IGhpZXJhcmNoeSBpcyBfZXhhY3RseSB0aGUgc2FtZSBvYmplY3RfIGFzIHRoZVxuICogY29uc3RydWN0b3IgZnVuY3Rpb24gJ1knLlxuICpcbiAqIFVuZm9ydHVuYXRlbHksIGl0IGhhcHBlbnMgaW4gdmFyaW91cyBzaXR1YXRpb25zIHRoYXQgZGlmZmVyZW50IGNvbnN0cnVjdG9yIGZ1bmN0aW9uIG9iamVjdHMgZ2V0IGNyZWF0ZWQgZm9yIHdoYXRcbiAqIGFwcGVhcnMgdG8gYmUgdGhlIHZlcnkgc2FtZSBjbGFzcy4gVGhpcyBsZWFkcyB0byBzdXJwcmlzaW5nIGJlaGF2aW9yIHdoZXJlIGBpbnN0YW5jZW9mYCByZXR1cm5zIGZhbHNlIHRob3VnaCBpdCBpc1xuICoga25vd24gdGhhdCB0aGUgb2JqZWN0IGlzIGluZGVlZCBhbiBpbnN0YW5jZSBvZiB0aGF0IGNsYXNzLiBPbmUgcGFydGljdWxhciBjYXNlIHdoZXJlIHRoaXMgaGFwcGVucyBpcyB3aGVuIGNvbnN0cnVjdG9yXG4gKiAnWScgYmVsb25ncyB0byBhIGRpZmZlcmVudCByZWFsbSB0aGFuIHRoZSBjb25zdHVjdG9yIHdpdGggd2hpY2ggJ3gnIHdhcyBpbnN0YW50aWF0ZWQuIEFub3RoZXIgY2FzZSBpcyB3aGVuIHR3byBjb3BpZXNcbiAqIG9mIHRoZSBzYW1lIGxpYnJhcnkgZ2V0cyBsb2FkZWQgaW4gdGhlIHNhbWUgcmVhbG0uXG4gKlxuICogSW4gcHJhY3RpY2UsIHRoaXMgdGVuZHMgdG8gY2F1c2UgaXNzdWVzIHdoZW4gY3Jvc3NpbmcgdGhlIHdvcmtmbG93LXNhbmRib3hpbmcgYm91bmRhcnkgKHNpbmNlIE5vZGUncyB2bSBtb2R1bGVcbiAqIHJlYWxseSBjcmVhdGVzIG5ldyBleGVjdXRpb24gcmVhbG1zKSwgYXMgd2VsbCBhcyB3aGVuIHJ1bm5pbmcgdGVzdHMgdXNpbmcgSmVzdCAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qZXN0anMvamVzdC9pc3N1ZXMvMjU0OVxuICogZm9yIHNvbWUgZGV0YWlscyBvbiB0aGF0IG9uZSkuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpbmplY3RzIGEgY3VzdG9tICdpbnN0YW5jZW9mJyBoYW5kbGVyIGludG8gdGhlIHByb3RvdHlwZSBvZiAnY2xhenonLCB3aGljaCBpcyBib3RoIGNyb3NzLXJlYWxtIHNhZmUgYW5kXG4gKiBjcm9zcy1jb3BpZXMtb2YtdGhlLXNhbWUtbGliIHNhZmUuIEl0IHdvcmtzIGJ5IGFkZGluZyBhIHNwZWNpYWwgc3ltYm9sIHByb3BlcnR5IHRvIHRoZSBwcm90b3R5cGUgb2YgJ2NsYXp6JywgYW5kIHRoZW5cbiAqIGNoZWNraW5nIGZvciB0aGUgcHJlc2VuY2Ugb2YgdGhhdCBzeW1ib2wuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcjxFIGV4dGVuZHMgRXJyb3I+KG1hcmtlck5hbWU6IHN0cmluZyk6IChjbGF6ejogQ2xhc3M8RT4pID0+IHZvaWQge1xuICByZXR1cm4gKGNsYXp6OiBDbGFzczxFPik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IG1hcmtlciA9IFN5bWJvbC5mb3IoYF9fdGVtcG9yYWxfaXMke21hcmtlck5hbWV9YCk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xhenoucHJvdG90eXBlLCAnbmFtZScsIHsgdmFsdWU6IG1hcmtlck5hbWUsIGVudW1lcmFibGU6IHRydWUgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNsYXp6LnByb3RvdHlwZSwgbWFya2VyLCB7IHZhbHVlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xhenosIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG9iamVjdC1zaG9ydGhhbmRcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiAodGhpczogYW55LCBlcnJvcjogb2JqZWN0KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzID09PSBjbGF6eikge1xuICAgICAgICAgIHJldHVybiBpc1JlY29yZChlcnJvcikgJiYgKGVycm9yIGFzIGFueSlbbWFya2VyXSA9PT0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyAndGhpcycgbXVzdCBiZSBhIF9zdWJjbGFzc18gb2YgY2xhenogdGhhdCBkb2Vzbid0IHJlZGVmaW5lZCBbU3ltYm9sLmhhc0luc3RhbmNlXSwgc28gdGhhdCBpdCBpbmhlcml0ZWRcbiAgICAgICAgICAvLyBmcm9tIGNsYXp6J3MgW1N5bWJvbC5oYXNJbnN0YW5jZV0uIElmIHdlIGRvbid0IGhhbmRsZSB0aGlzIHBhcnRpY3VsYXIgc2l0dWF0aW9uLCB0aGVuXG4gICAgICAgICAgLy8gYHggaW5zdGFuY2VvZiBTdWJjbGFzc09mUGFyZW50YCB3b3VsZCByZXR1cm4gdHJ1ZSBmb3IgYW55IGluc3RhbmNlIG9mICdQYXJlbnQnLCB3aGljaCBpcyBjbGVhcmx5IHdyb25nLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gSWRlYWxseSwgaXQnZCBiZSBwcmVmZXJhYmxlIHRvIGF2b2lkIHRoaXMgY2FzZSBlbnRpcmVseSwgYnkgbWFraW5nIHN1cmUgdGhhdCBhbGwgc3ViY2xhc3NlcyBvZiAnY2xhenonXG4gICAgICAgICAgLy8gcmVkZWZpbmUgW1N5bWJvbC5oYXNJbnN0YW5jZV0sIGJ1dCB3ZSBjYW4ndCBlbmZvcmNlIHRoYXQuIFdlIHRoZXJlZm9yZSBmYWxsYmFjayB0byB0aGUgZGVmYXVsdCBpbnN0YW5jZW9mXG4gICAgICAgICAgLy8gYmVoYXZpb3IgKHdoaWNoIGlzIE5PVCBjcm9zcy1yZWFsbSBzYWZlKS5cbiAgICAgICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihlcnJvcik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG59XG5cbi8vIFRoYW5rcyBNRE46IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9mcmVlemVcbmV4cG9ydCBmdW5jdGlvbiBkZWVwRnJlZXplPFQ+KG9iamVjdDogVCk6IFQge1xuICAvLyBSZXRyaWV2ZSB0aGUgcHJvcGVydHkgbmFtZXMgZGVmaW5lZCBvbiBvYmplY3RcbiAgY29uc3QgcHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KTtcblxuICAvLyBGcmVlemUgcHJvcGVydGllcyBiZWZvcmUgZnJlZXppbmcgc2VsZlxuICBmb3IgKGNvbnN0IG5hbWUgb2YgcHJvcE5hbWVzKSB7XG4gICAgY29uc3QgdmFsdWUgPSAob2JqZWN0IGFzIGFueSlbbmFtZV07XG5cbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGVlcEZyZWV6ZSh2YWx1ZSk7XG4gICAgICB9IGNhdGNoIChfZXJyKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgb2theSwgdGhlcmUgYXJlIHNvbWUgdHlwZWQgYXJyYXlzIHRoYXQgY2Fubm90IGJlIGZyb3plbiAoZW5jb2RpbmdLZXlzKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBPYmplY3QuZnJlZXplKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZShvYmplY3QpO1xufVxuIiwiaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHR5cGUgeyBWZXJzaW9uaW5nSW50ZW50IGFzIFZlcnNpb25pbmdJbnRlbnRTdHJpbmcgfSBmcm9tICcuL3ZlcnNpb25pbmctaW50ZW50JztcbmltcG9ydCB7IGFzc2VydE5ldmVyLCBjaGVja0V4dGVuZHMgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSBjb3Jlc2RrLmNvbW1vbi5WZXJzaW9uaW5nSW50ZW50XG4vKipcbiAqIFByb3RvYnVmIGVudW0gcmVwcmVzZW50YXRpb24gb2Yge0BsaW5rIFZlcnNpb25pbmdJbnRlbnRTdHJpbmd9LlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGVudW0gVmVyc2lvbmluZ0ludGVudCB7XG4gIFVOU1BFQ0lGSUVEID0gMCxcbiAgQ09NUEFUSUJMRSA9IDEsXG4gIERFRkFVTFQgPSAyLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay5jb21tb24uVmVyc2lvbmluZ0ludGVudCwgVmVyc2lvbmluZ0ludGVudD4oKTtcbmNoZWNrRXh0ZW5kczxWZXJzaW9uaW5nSW50ZW50LCBjb3Jlc2RrLmNvbW1vbi5WZXJzaW9uaW5nSW50ZW50PigpO1xuXG5leHBvcnQgZnVuY3Rpb24gdmVyc2lvbmluZ0ludGVudFRvUHJvdG8oaW50ZW50OiBWZXJzaW9uaW5nSW50ZW50U3RyaW5nIHwgdW5kZWZpbmVkKTogVmVyc2lvbmluZ0ludGVudCB7XG4gIHN3aXRjaCAoaW50ZW50KSB7XG4gICAgY2FzZSAnREVGQVVMVCc6XG4gICAgICByZXR1cm4gVmVyc2lvbmluZ0ludGVudC5ERUZBVUxUO1xuICAgIGNhc2UgJ0NPTVBBVElCTEUnOlxuICAgICAgcmV0dXJuIFZlcnNpb25pbmdJbnRlbnQuQ09NUEFUSUJMRTtcbiAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgIHJldHVybiBWZXJzaW9uaW5nSW50ZW50LlVOU1BFQ0lGSUVEO1xuICAgIGRlZmF1bHQ6XG4gICAgICBhc3NlcnROZXZlcignVW5leHBlY3RlZCBWZXJzaW9uaW5nSW50ZW50JywgaW50ZW50KTtcbiAgfVxufVxuIiwiLyoqXG4gKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgdXNlciBpbnRlbmRzIGNlcnRhaW4gY29tbWFuZHMgdG8gYmUgcnVuIG9uIGEgY29tcGF0aWJsZSB3b3JrZXIgQnVpbGQgSWQgdmVyc2lvbiBvciBub3QuXG4gKlxuICogYENPTVBBVElCTEVgIGluZGljYXRlcyB0aGF0IHRoZSBjb21tYW5kIHNob3VsZCBydW4gb24gYSB3b3JrZXIgd2l0aCBjb21wYXRpYmxlIHZlcnNpb24gaWYgcG9zc2libGUuIEl0IG1heSBub3QgYmVcbiAqIHBvc3NpYmxlIGlmIHRoZSB0YXJnZXQgdGFzayBxdWV1ZSBkb2VzIG5vdCBhbHNvIGhhdmUga25vd2xlZGdlIG9mIHRoZSBjdXJyZW50IHdvcmtlcidzIEJ1aWxkIElkLlxuICpcbiAqIGBERUZBVUxUYCBpbmRpY2F0ZXMgdGhhdCB0aGUgY29tbWFuZCBzaG91bGQgcnVuIG9uIHRoZSB0YXJnZXQgdGFzayBxdWV1ZSdzIGN1cnJlbnQgb3ZlcmFsbC1kZWZhdWx0IEJ1aWxkIElkLlxuICpcbiAqIFdoZXJlIHRoaXMgdHlwZSBpcyBhY2NlcHRlZCBvcHRpb25hbGx5LCBhbiB1bnNldCB2YWx1ZSBpbmRpY2F0ZXMgdGhhdCB0aGUgU0RLIHNob3VsZCBjaG9vc2UgdGhlIG1vc3Qgc2Vuc2libGUgZGVmYXVsdFxuICogYmVoYXZpb3IgZm9yIHRoZSB0eXBlIG9mIGNvbW1hbmQsIGFjY291bnRpbmcgZm9yIHdoZXRoZXIgdGhlIGNvbW1hbmQgd2lsbCBiZSBydW4gb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyB0aGVcbiAqIGN1cnJlbnQgd29ya2VyLiBUaGUgZGVmYXVsdCBiZWhhdmlvciBmb3Igc3RhcnRpbmcgV29ya2Zsb3dzIGlzIGBERUZBVUxUYC4gVGhlIGRlZmF1bHQgYmVoYXZpb3IgZm9yIFdvcmtmbG93cyBzdGFydGluZ1xuICogQWN0aXZpdGllcywgc3RhcnRpbmcgQ2hpbGQgV29ya2Zsb3dzLCBvciBDb250aW51aW5nIEFzIE5ldyBpcyBgQ09NUEFUSUJMRWAuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgdHlwZSBWZXJzaW9uaW5nSW50ZW50ID0gJ0NPTVBBVElCTEUnIHwgJ0RFRkFVTFQnO1xuIiwiaW1wb3J0IHsgV29ya2Zsb3csIFdvcmtmbG93UmVzdWx0VHlwZSwgU2lnbmFsRGVmaW5pdGlvbiB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogQmFzZSBXb3JrZmxvd0hhbmRsZSBpbnRlcmZhY2UsIGV4dGVuZGVkIGluIHdvcmtmbG93IGFuZCBjbGllbnQgbGlicy5cbiAqXG4gKiBUcmFuc2Zvcm1zIGEgd29ya2Zsb3cgaW50ZXJmYWNlIGBUYCBpbnRvIGEgY2xpZW50IGludGVyZmFjZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBCYXNlV29ya2Zsb3dIYW5kbGU8VCBleHRlbmRzIFdvcmtmbG93PiB7XG4gIC8qKlxuICAgKiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBXb3JrZmxvdyBleGVjdXRpb24gY29tcGxldGVzXG4gICAqL1xuICByZXN1bHQoKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG4gIC8qKlxuICAgKiBTaWduYWwgYSBydW5uaW5nIFdvcmtmbG93LlxuICAgKlxuICAgKiBAcGFyYW0gZGVmIGEgc2lnbmFsIGRlZmluaXRpb24gYXMgcmV0dXJuZWQgZnJvbSB7QGxpbmsgZGVmaW5lU2lnbmFsfVxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiBhd2FpdCBoYW5kbGUuc2lnbmFsKGluY3JlbWVudFNpZ25hbCwgMyk7XG4gICAqIGBgYFxuICAgKi9cbiAgc2lnbmFsPEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgICBkZWY6IFNpZ25hbERlZmluaXRpb248QXJncywgTmFtZT4gfCBzdHJpbmcsXG4gICAgLi4uYXJnczogQXJnc1xuICApOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBUaGUgd29ya2Zsb3dJZCBvZiB0aGUgY3VycmVudCBXb3JrZmxvd1xuICAgKi9cbiAgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nO1xufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IFNlYXJjaEF0dHJpYnV0ZXMsIFdvcmtmbG93IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFJldHJ5UG9saWN5IH0gZnJvbSAnLi9yZXRyeS1wb2xpY3knO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICcuL3RpbWUnO1xuaW1wb3J0IHsgbWFrZVByb3RvRW51bUNvbnZlcnRlcnMgfSBmcm9tICcuL2ludGVybmFsLXdvcmtmbG93JztcblxuLyoqXG4gKiBEZWZpbmVzIHdoYXQgaGFwcGVucyB3aGVuIHRyeWluZyB0byBzdGFydCBhIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgSUQgYXMgYSAqQ2xvc2VkKiBXb3JrZmxvdy5cbiAqXG4gKiBTZWUge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd0lkQ29uZmxpY3RQb2xpY3l9IGZvciB3aGF0IGhhcHBlbnMgd2hlbiB0cnlpbmcgdG8gc3RhcnQgYVxuICogV29ya2Zsb3cgd2l0aCB0aGUgc2FtZSBJRCBhcyBhICpSdW5uaW5nKiBXb3JrZmxvdy5cbiAqXG4gKiBDb25jZXB0OiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYS13b3JrZmxvdy1pZC1yZXVzZS1wb2xpY3kvIHwgV29ya2Zsb3cgSWQgUmV1c2UgUG9saWN5fVxuICpcbiAqICpOb3RlOiBJdCBpcyBub3QgcG9zc2libGUgdG8gaGF2ZSB0d28gYWN0aXZlbHkgcnVubmluZyBXb3JrZmxvd3Mgd2l0aCB0aGUgc2FtZSBJRC4qXG4gKlxuICovXG5leHBvcnQgY29uc3QgV29ya2Zsb3dJZFJldXNlUG9saWN5ID0ge1xuICAvKipcbiAgICogVGhlIFdvcmtmbG93IGNhbiBiZSBzdGFydGVkIGlmIHRoZSBwcmV2aW91cyBXb3JrZmxvdyBpcyBpbiBhIENsb3NlZCBzdGF0ZS5cbiAgICogQGRlZmF1bHRcbiAgICovXG4gIEFMTE9XX0RVUExJQ0FURTogJ0FMTE9XX0RVUExJQ0FURScsXG5cbiAgLyoqXG4gICAqIFRoZSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCBpZiB0aGUgcHJldmlvdXMgV29ya2Zsb3cgaXMgaW4gYSBDbG9zZWQgc3RhdGUgdGhhdCBpcyBub3QgQ29tcGxldGVkLlxuICAgKi9cbiAgQUxMT1dfRFVQTElDQVRFX0ZBSUxFRF9PTkxZOiAnQUxMT1dfRFVQTElDQVRFX0ZBSUxFRF9PTkxZJyxcblxuICAvKipcbiAgICogVGhlIFdvcmtmbG93IGNhbm5vdCBiZSBzdGFydGVkLlxuICAgKi9cbiAgUkVKRUNUX0RVUExJQ0FURTogJ1JFSkVDVF9EVVBMSUNBVEUnLFxuXG4gIC8qKlxuICAgKiBUZXJtaW5hdGUgdGhlIGN1cnJlbnQgV29ya2Zsb3cgaWYgb25lIGlzIGFscmVhZHkgcnVubmluZzsgb3RoZXJ3aXNlIGFsbG93IHJldXNpbmcgdGhlIFdvcmtmbG93IElELlxuICAgKlxuICAgKiBAZGVwcmVjYXRlZCBVc2Uge0BsaW5rIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEV9IGluc3RlYWQsIGFuZFxuICAgKiAgICAgICAgICAgICBzZXQgYFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd0lkQ29uZmxpY3RQb2xpY3lgIHRvXG4gICAqICAgICAgICAgICAgIHtAbGluayBXb3JrZmxvd0lkQ29uZmxpY3RQb2xpY3kuV09SS0ZMT1dfSURfQ09ORkxJQ1RfUE9MSUNZX1RFUk1JTkFURV9FWElTVElOR30uXG4gICAqICAgICAgICAgICAgIFdoZW4gdXNpbmcgdGhpcyBvcHRpb24sIGBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dJZENvbmZsaWN0UG9saWN5YCBtdXN0IGJlIGxlZnQgdW5zcGVjaWZpZWQuXG4gICAqL1xuICBURVJNSU5BVEVfSUZfUlVOTklORzogJ1RFUk1JTkFURV9JRl9SVU5OSU5HJywgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvblxuXG4gIC8vLyBBbnl0aGluZyBiZWxvdyB0aGlzIGxpbmUgaGFzIGJlZW4gZGVwcmVjYXRlZFxuXG4gIC8qKlxuICAgKiBObyBuZWVkIHRvIHVzZSB0aGlzLiBJZiBhIGBXb3JrZmxvd0lkUmV1c2VQb2xpY3lgIGlzIHNldCB0byB0aGlzLCBvciBpcyBub3Qgc2V0IGF0IGFsbCwgdGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkLlxuICAgKlxuICAgKiBAZGVwcmVjYXRlZCBFaXRoZXIgbGVhdmUgcHJvcGVydHkgYHVuZGVmaW5lZGAsIG9yIHVzZSB7QGxpbmsgQUxMT1dfRFVQTElDQVRFfSBpbnN0ZWFkLlxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1VOU1BFQ0lGSUVEOiB1bmRlZmluZWQsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBBTExPV19EVVBMSUNBVEV9IGluc3RlYWQuICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEU6ICdBTExPV19EVVBMSUNBVEUnLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG5cbiAgLyoqIEBkZXByZWNhdGVkIFVzZSB7QGxpbmsgQUxMT1dfRFVQTElDQVRFX0ZBSUxFRF9PTkxZfSBpbnN0ZWFkLiAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfQUxMT1dfRFVQTElDQVRFX0ZBSUxFRF9PTkxZOiAnQUxMT1dfRFVQTElDQVRFX0ZBSUxFRF9PTkxZJywgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvblxuXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2Uge0BsaW5rIFJFSkVDVF9EVVBMSUNBVEV9IGluc3RlYWQuICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9SRUpFQ1RfRFVQTElDQVRFOiAnUkVKRUNUX0RVUExJQ0FURScsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cblxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIHtAbGluayBURVJNSU5BVEVfSUZfUlVOTklOR30gaW5zdGVhZC4gKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1RFUk1JTkFURV9JRl9SVU5OSU5HOiAnVEVSTUlOQVRFX0lGX1JVTk5JTkcnLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG59IGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dJZFJldXNlUG9saWN5ID0gKHR5cGVvZiBXb3JrZmxvd0lkUmV1c2VQb2xpY3kpW2tleW9mIHR5cGVvZiBXb3JrZmxvd0lkUmV1c2VQb2xpY3ldO1xuXG5leHBvcnQgY29uc3QgW2VuY29kZVdvcmtmbG93SWRSZXVzZVBvbGljeSwgZGVjb2RlV29ya2Zsb3dJZFJldXNlUG9saWN5XSA9IG1ha2VQcm90b0VudW1Db252ZXJ0ZXJzPFxuICB0ZW1wb3JhbC5hcGkuZW51bXMudjEuV29ya2Zsb3dJZFJldXNlUG9saWN5LFxuICB0eXBlb2YgdGVtcG9yYWwuYXBpLmVudW1zLnYxLldvcmtmbG93SWRSZXVzZVBvbGljeSxcbiAga2V5b2YgdHlwZW9mIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5Xb3JrZmxvd0lkUmV1c2VQb2xpY3ksXG4gIHR5cGVvZiBXb3JrZmxvd0lkUmV1c2VQb2xpY3ksXG4gICdXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfJ1xuPihcbiAge1xuICAgIFtXb3JrZmxvd0lkUmV1c2VQb2xpY3kuQUxMT1dfRFVQTElDQVRFXTogMSxcbiAgICBbV29ya2Zsb3dJZFJldXNlUG9saWN5LkFMTE9XX0RVUExJQ0FURV9GQUlMRURfT05MWV06IDIsXG4gICAgW1dvcmtmbG93SWRSZXVzZVBvbGljeS5SRUpFQ1RfRFVQTElDQVRFXTogMyxcbiAgICBbV29ya2Zsb3dJZFJldXNlUG9saWN5LlRFUk1JTkFURV9JRl9SVU5OSU5HXTogNCwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvblxuICAgIFVOU1BFQ0lGSUVEOiAwLFxuICB9IGFzIGNvbnN0LFxuICAnV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZXydcbik7XG5cbi8qKlxuICogRGVmaW5lcyB3aGF0IGhhcHBlbnMgd2hlbiB0cnlpbmcgdG8gc3RhcnQgYSBXb3JrZmxvdyB3aXRoIHRoZSBzYW1lIElEIGFzIGEgKlJ1bm5pbmcqIFdvcmtmbG93LlxuICpcbiAqIFNlZSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeX0gZm9yIHdoYXQgaGFwcGVucyB3aGVuIHRyeWluZyB0byBzdGFydCBhIFdvcmtmbG93XG4gKiB3aXRoIHRoZSBzYW1lIElEIGFzIGEgKkNsb3NlZCogV29ya2Zsb3cuXG4gKlxuICogKk5vdGU6IEl0IGlzIG5ldmVyIHBvc3NpYmxlIHRvIGhhdmUgdHdvIF9hY3RpdmVseSBydW5uaW5nXyBXb3JrZmxvd3Mgd2l0aCB0aGUgc2FtZSBJRC4qXG4gKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93SWRDb25mbGljdFBvbGljeSA9ICh0eXBlb2YgV29ya2Zsb3dJZENvbmZsaWN0UG9saWN5KVtrZXlvZiB0eXBlb2YgV29ya2Zsb3dJZENvbmZsaWN0UG9saWN5XTtcbmV4cG9ydCBjb25zdCBXb3JrZmxvd0lkQ29uZmxpY3RQb2xpY3kgPSB7XG4gIC8qKlxuICAgKiBEbyBub3Qgc3RhcnQgYSBuZXcgV29ya2Zsb3cuIEluc3RlYWQgcmFpc2UgYSBgV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yYC5cbiAgICovXG4gIEZBSUw6ICdGQUlMJyxcblxuICAvKipcbiAgICogRG8gbm90IHN0YXJ0IGEgbmV3IFdvcmtmbG93LiBJbnN0ZWFkIHJldHVybiBhIFdvcmtmbG93IEhhbmRsZSBmb3IgdGhlIGFscmVhZHkgUnVubmluZyBXb3JrZmxvdy5cbiAgICovXG4gIFVTRV9FWElTVElORzogJ1VTRV9FWElTVElORycsXG5cbiAgLyoqXG4gICAqIFN0YXJ0IGEgbmV3IFdvcmtmbG93LCB0ZXJtaW5hdGluZyB0aGUgY3VycmVudCB3b3JrZmxvdyBpZiBvbmUgaXMgYWxyZWFkeSBydW5uaW5nLlxuICAgKi9cbiAgVEVSTUlOQVRFX0VYSVNUSU5HOiAnVEVSTUlOQVRFX0VYSVNUSU5HJyxcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBbZW5jb2RlV29ya2Zsb3dJZENvbmZsaWN0UG9saWN5LCBkZWNvZGVXb3JrZmxvd0lkQ29uZmxpY3RQb2xpY3ldID0gbWFrZVByb3RvRW51bUNvbnZlcnRlcnM8XG4gIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5Xb3JrZmxvd0lkQ29uZmxpY3RQb2xpY3ksXG4gIHR5cGVvZiB0ZW1wb3JhbC5hcGkuZW51bXMudjEuV29ya2Zsb3dJZENvbmZsaWN0UG9saWN5LFxuICBrZXlvZiB0eXBlb2YgdGVtcG9yYWwuYXBpLmVudW1zLnYxLldvcmtmbG93SWRDb25mbGljdFBvbGljeSxcbiAgdHlwZW9mIFdvcmtmbG93SWRDb25mbGljdFBvbGljeSxcbiAgJ1dPUktGTE9XX0lEX0NPTkZMSUNUX1BPTElDWV8nXG4+KFxuICB7XG4gICAgW1dvcmtmbG93SWRDb25mbGljdFBvbGljeS5GQUlMXTogMSxcbiAgICBbV29ya2Zsb3dJZENvbmZsaWN0UG9saWN5LlVTRV9FWElTVElOR106IDIsXG4gICAgW1dvcmtmbG93SWRDb25mbGljdFBvbGljeS5URVJNSU5BVEVfRVhJU1RJTkddOiAzLFxuICAgIFVOU1BFQ0lGSUVEOiAwLFxuICB9IGFzIGNvbnN0LFxuICAnV09SS0ZMT1dfSURfQ09ORkxJQ1RfUE9MSUNZXydcbik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZVdvcmtmbG93T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBEZWZpbmVzIHdoYXQgaGFwcGVucyB3aGVuIHRyeWluZyB0byBzdGFydCBhIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgSUQgYXMgYSAqQ2xvc2VkKiBXb3JrZmxvdy5cbiAgICpcbiAgICogKk5vdGU6IEl0IGlzIG5vdCBwb3NzaWJsZSB0byBoYXZlIHR3byBhY3RpdmVseSBydW5uaW5nIFdvcmtmbG93cyB3aXRoIHRoZSBzYW1lIElELipcbiAgICpcbiAgICogQGRlZmF1bHQge0BsaW5rIFdvcmtmbG93SWRSZXVzZVBvbGljeS5XT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfQUxMT1dfRFVQTElDQVRFfVxuICAgKi9cbiAgd29ya2Zsb3dJZFJldXNlUG9saWN5PzogV29ya2Zsb3dJZFJldXNlUG9saWN5O1xuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHdoYXQgaGFwcGVucyB3aGVuIHRyeWluZyB0byBzdGFydCBhIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgSUQgYXMgYSAqUnVubmluZyogV29ya2Zsb3cuXG4gICAqXG4gICAqICpOb3RlOiBJdCBpcyBub3QgcG9zc2libGUgdG8gaGF2ZSB0d28gYWN0aXZlbHkgcnVubmluZyBXb3JrZmxvd3Mgd2l0aCB0aGUgc2FtZSBJRC4qXG4gICAqXG4gICAqIEBkZWZhdWx0IHtAbGluayBXb3JrZmxvd0lkQ29uZmxpY3RQb2xpY3kuV09SS0ZMT1dfSURfQ09ORkxJQ1RfUE9MSUNZX1VOU1BFQ0lGSUVEfVxuICAgKi9cbiAgd29ya2Zsb3dJZENvbmZsaWN0UG9saWN5PzogV29ya2Zsb3dJZENvbmZsaWN0UG9saWN5O1xuXG4gIC8qKlxuICAgKiBDb250cm9scyBob3cgYSBXb3JrZmxvdyBFeGVjdXRpb24gaXMgcmV0cmllZC5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgV29ya2Zsb3cgRXhlY3V0aW9ucyBhcmUgbm90IHJldHJpZWQuIERvIG5vdCBvdmVycmlkZSB0aGlzIGJlaGF2aW9yIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSdyZSBkb2luZy5cbiAgICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWEtcmV0cnktcG9saWN5LyB8IE1vcmUgaW5mb3JtYXRpb259LlxuICAgKi9cbiAgcmV0cnk/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogT3B0aW9uYWwgY3JvbiBzY2hlZHVsZSBmb3IgV29ya2Zsb3cuIElmIGEgY3JvbiBzY2hlZHVsZSBpcyBzcGVjaWZpZWQsIHRoZSBXb3JrZmxvdyB3aWxsIHJ1biBhcyBhIGNyb24gYmFzZWQgb24gdGhlXG4gICAqIHNjaGVkdWxlLiBUaGUgc2NoZWR1bGluZyB3aWxsIGJlIGJhc2VkIG9uIFVUQyB0aW1lLiBUaGUgc2NoZWR1bGUgZm9yIHRoZSBuZXh0IHJ1biBvbmx5IGhhcHBlbnMgYWZ0ZXIgdGhlIGN1cnJlbnRcbiAgICogcnVuIGlzIGNvbXBsZXRlZC9mYWlsZWQvdGltZW91dC4gSWYgYSBSZXRyeVBvbGljeSBpcyBhbHNvIHN1cHBsaWVkLCBhbmQgdGhlIFdvcmtmbG93IGZhaWxlZCBvciB0aW1lZCBvdXQsIHRoZVxuICAgKiBXb3JrZmxvdyB3aWxsIGJlIHJldHJpZWQgYmFzZWQgb24gdGhlIHJldHJ5IHBvbGljeS4gV2hpbGUgdGhlIFdvcmtmbG93IGlzIHJldHJ5aW5nLCBpdCB3b24ndCBzY2hlZHVsZSBpdHMgbmV4dCBydW4uXG4gICAqIElmIHRoZSBuZXh0IHNjaGVkdWxlIGlzIGR1ZSB3aGlsZSB0aGUgV29ya2Zsb3cgaXMgcnVubmluZyAob3IgcmV0cnlpbmcpLCB0aGVuIGl0IHdpbGwgc2tpcCB0aGF0IHNjaGVkdWxlLiBDcm9uXG4gICAqIFdvcmtmbG93IHdpbGwgbm90IHN0b3AgdW50aWwgaXQgaXMgdGVybWluYXRlZCBvciBjYW5jZWxsZWQgKGJ5IHJldHVybmluZyB0ZW1wb3JhbC5DYW5jZWxlZEVycm9yKS5cbiAgICogaHR0cHM6Ly9jcm9udGFiLmd1cnUvIGlzIHVzZWZ1bCBmb3IgdGVzdGluZyB5b3VyIGNyb24gZXhwcmVzc2lvbnMuXG4gICAqL1xuICBjcm9uU2NoZWR1bGU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhZGRpdGlvbmFsIG5vbi1pbmRleGVkIGluZm9ybWF0aW9uIHRvIGF0dGFjaCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uLiBUaGUgdmFsdWVzIGNhbiBiZSBhbnl0aGluZyB0aGF0XG4gICAqIGlzIHNlcmlhbGl6YWJsZSBieSB7QGxpbmsgRGF0YUNvbnZlcnRlcn0uXG4gICAqL1xuICBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhZGRpdGlvbmFsIGluZGV4ZWQgaW5mb3JtYXRpb24gdG8gYXR0YWNoIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24uIE1vcmUgaW5mbzpcbiAgICogaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2RvY3MvdHlwZXNjcmlwdC9zZWFyY2gtYXR0cmlidXRlc1xuICAgKlxuICAgKiBWYWx1ZXMgYXJlIGFsd2F5cyBjb252ZXJ0ZWQgdXNpbmcge0BsaW5rIEpzb25QYXlsb2FkQ29udmVydGVyfSwgZXZlbiB3aGVuIGEgY3VzdG9tIGRhdGEgY29udmVydGVyIGlzIHByb3ZpZGVkLlxuICAgKi9cbiAgc2VhcmNoQXR0cmlidXRlcz86IFNlYXJjaEF0dHJpYnV0ZXM7XG59XG5cbmV4cG9ydCB0eXBlIFdpdGhXb3JrZmxvd0FyZ3M8VyBleHRlbmRzIFdvcmtmbG93LCBUPiA9IFQgJlxuICAoUGFyYW1ldGVyczxXPiBleHRlbmRzIFthbnksIC4uLmFueVtdXVxuICAgID8ge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIFdvcmtmbG93XG4gICAgICAgICAqL1xuICAgICAgICBhcmdzOiBQYXJhbWV0ZXJzPFc+IHwgUmVhZG9ubHk8UGFyYW1ldGVyczxXPj47XG4gICAgICB9XG4gICAgOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgV29ya2Zsb3dcbiAgICAgICAgICovXG4gICAgICAgIGFyZ3M/OiBQYXJhbWV0ZXJzPFc+IHwgUmVhZG9ubHk8UGFyYW1ldGVyczxXPj47XG4gICAgICB9KTtcblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0R1cmF0aW9uT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaGUgdGltZSBhZnRlciB3aGljaCB3b3JrZmxvdyBydW4gaXMgYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIHNlcnZpY2UuIERvIG5vdFxuICAgKiByZWx5IG9uIHJ1biB0aW1lb3V0IGZvciBidXNpbmVzcyBsZXZlbCB0aW1lb3V0cy4gSXQgaXMgcHJlZmVycmVkIHRvIHVzZSBpbiB3b3JrZmxvdyB0aW1lcnNcbiAgICogZm9yIHRoaXMgcHVycG9zZS5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1J1blRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICpcbiAgICogVGhlIHRpbWUgYWZ0ZXIgd2hpY2ggd29ya2Zsb3cgZXhlY3V0aW9uICh3aGljaCBpbmNsdWRlcyBydW4gcmV0cmllcyBhbmQgY29udGludWUgYXMgbmV3KSBpc1xuICAgKiBhdXRvbWF0aWNhbGx5IHRlcm1pbmF0ZWQgYnkgVGVtcG9yYWwgc2VydmljZS4gRG8gbm90IHJlbHkgb24gZXhlY3V0aW9uIHRpbWVvdXQgZm9yIGJ1c2luZXNzXG4gICAqIGxldmVsIHRpbWVvdXRzLiBJdCBpcyBwcmVmZXJyZWQgdG8gdXNlIGluIHdvcmtmbG93IHRpbWVycyBmb3IgdGhpcyBwdXJwb3NlLlxuICAgKlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93RXhlY3V0aW9uVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIGV4ZWN1dGlvbiB0aW1lIG9mIGEgc2luZ2xlIHdvcmtmbG93IHRhc2suIERlZmF1bHQgaXMgMTAgc2Vjb25kcy5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1Rhc2tUaW1lb3V0PzogRHVyYXRpb247XG59XG5cbmV4cG9ydCB0eXBlIENvbW1vbldvcmtmbG93T3B0aW9ucyA9IEJhc2VXb3JrZmxvd09wdGlvbnMgJiBXb3JrZmxvd0R1cmF0aW9uT3B0aW9ucztcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RXb3JrZmxvd1R5cGU8VCBleHRlbmRzIFdvcmtmbG93Pih3b3JrZmxvd1R5cGVPckZ1bmM6IHN0cmluZyB8IFQpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuYyA9PT0gJ3N0cmluZycpIHJldHVybiB3b3JrZmxvd1R5cGVPckZ1bmMgYXMgc3RyaW5nO1xuICBpZiAodHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuYyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICh3b3JrZmxvd1R5cGVPckZ1bmM/Lm5hbWUpIHJldHVybiB3b3JrZmxvd1R5cGVPckZ1bmMubmFtZTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIHdvcmtmbG93IHR5cGU6IHRoZSB3b3JrZmxvdyBmdW5jdGlvbiBpcyBhbm9ueW1vdXMnKTtcbiAgfVxuICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgIGBJbnZhbGlkIHdvcmtmbG93IHR5cGU6IGV4cGVjdGVkIGVpdGhlciBhIHN0cmluZyBvciBhIGZ1bmN0aW9uLCBnb3QgJyR7dHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuY30nYFxuICApO1xufVxuIiwiLy8gQSBwb3J0IG9mIGFuIGFsZ29yaXRobSBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbi8vIGh0dHA6Ly9iYWFnb2UuY29tL2VuL1JhbmRvbU11c2luZ3MvamF2YXNjcmlwdC9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucXVpbmxhbi9iZXR0ZXItcmFuZG9tLW51bWJlcnMtZm9yLWphdmFzY3JpcHQtbWlycm9yXG4vLyBPcmlnaW5hbCB3b3JrIGlzIHVuZGVyIE1JVCBsaWNlbnNlIC1cblxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2Uub3JnPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIFRha2VuIGFuZCBtb2RpZmllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGJhdS9zZWVkcmFuZG9tL2Jsb2IvcmVsZWFzZWQvbGliL2FsZWEuanNcblxuY2xhc3MgQWxlYSB7XG4gIHB1YmxpYyBjOiBudW1iZXI7XG4gIHB1YmxpYyBzMDogbnVtYmVyO1xuICBwdWJsaWMgczE6IG51bWJlcjtcbiAgcHVibGljIHMyOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc2VlZDogbnVtYmVyW10pIHtcbiAgICBjb25zdCBtYXNoID0gbmV3IE1hc2goKTtcbiAgICAvLyBBcHBseSB0aGUgc2VlZGluZyBhbGdvcml0aG0gZnJvbSBCYWFnb2UuXG4gICAgdGhpcy5jID0gMTtcbiAgICB0aGlzLnMwID0gbWFzaC5tYXNoKFszMl0pO1xuICAgIHRoaXMuczEgPSBtYXNoLm1hc2goWzMyXSk7XG4gICAgdGhpcy5zMiA9IG1hc2gubWFzaChbMzJdKTtcbiAgICB0aGlzLnMwIC09IG1hc2gubWFzaChzZWVkKTtcbiAgICBpZiAodGhpcy5zMCA8IDApIHtcbiAgICAgIHRoaXMuczAgKz0gMTtcbiAgICB9XG4gICAgdGhpcy5zMSAtPSBtYXNoLm1hc2goc2VlZCk7XG4gICAgaWYgKHRoaXMuczEgPCAwKSB7XG4gICAgICB0aGlzLnMxICs9IDE7XG4gICAgfVxuICAgIHRoaXMuczIgLT0gbWFzaC5tYXNoKHNlZWQpO1xuICAgIGlmICh0aGlzLnMyIDwgMCkge1xuICAgICAgdGhpcy5zMiArPSAxO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBuZXh0KCk6IG51bWJlciB7XG4gICAgY29uc3QgdCA9IDIwOTE2MzkgKiB0aGlzLnMwICsgdGhpcy5jICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICB0aGlzLnMwID0gdGhpcy5zMTtcbiAgICB0aGlzLnMxID0gdGhpcy5zMjtcbiAgICByZXR1cm4gKHRoaXMuczIgPSB0IC0gKHRoaXMuYyA9IHQgfCAwKSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgUk5HID0gKCkgPT4gbnVtYmVyO1xuXG5leHBvcnQgZnVuY3Rpb24gYWxlYShzZWVkOiBudW1iZXJbXSk6IFJORyB7XG4gIGNvbnN0IHhnID0gbmV3IEFsZWEoc2VlZCk7XG4gIHJldHVybiB4Zy5uZXh0LmJpbmQoeGcpO1xufVxuXG5leHBvcnQgY2xhc3MgTWFzaCB7XG4gIHByaXZhdGUgbiA9IDB4ZWZjODI0OWQ7XG5cbiAgcHVibGljIG1hc2goZGF0YTogbnVtYmVyW10pOiBudW1iZXIge1xuICAgIGxldCB7IG4gfSA9IHRoaXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBuICs9IGRhdGFbaV07XG4gICAgICBsZXQgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBoICo9IG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgfVxuICAgIHRoaXMubiA9IG47XG4gICAgcmV0dXJuIChuID4+PiAwKSAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgQXN5bmNMb2NhbFN0b3JhZ2UgYXMgQUxTIH0gZnJvbSAnbm9kZTphc3luY19ob29rcyc7XG5pbXBvcnQgeyBDYW5jZWxsZWRGYWlsdXJlLCBEdXJhdGlvbiwgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgbXNPcHRpb25hbFRvTnVtYmVyIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90aW1lJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCB7IGdldEFjdGl2YXRvciB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHsgU2RrRmxhZ3MgfSBmcm9tICcuL2ZsYWdzJztcblxuLy8gQXN5bmNMb2NhbFN0b3JhZ2UgaXMgaW5qZWN0ZWQgdmlhIHZtIG1vZHVsZSBpbnRvIGdsb2JhbCBzY29wZS5cbi8vIEluIGNhc2UgV29ya2Zsb3cgY29kZSBpcyBpbXBvcnRlZCBpbiBOb2RlLmpzIGNvbnRleHQsIHJlcGxhY2Ugd2l0aCBhbiBlbXB0eSBjbGFzcy5cbmV4cG9ydCBjb25zdCBBc3luY0xvY2FsU3RvcmFnZTogbmV3IDxUPigpID0+IEFMUzxUPiA9IChnbG9iYWxUaGlzIGFzIGFueSkuQXN5bmNMb2NhbFN0b3JhZ2UgPz8gY2xhc3Mge307XG5cbi8qKiBNYWdpYyBzeW1ib2wgdXNlZCB0byBjcmVhdGUgdGhlIHJvb3Qgc2NvcGUgLSBpbnRlbnRpb25hbGx5IG5vdCBleHBvcnRlZCAqL1xuY29uc3QgTk9fUEFSRU5UID0gU3ltYm9sKCdOT19QQVJFTlQnKTtcblxuLyoqXG4gKiBPcHRpb24gZm9yIGNvbnN0cnVjdGluZyBhIENhbmNlbGxhdGlvblNjb3BlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGF0aW9uU2NvcGVPcHRpb25zIHtcbiAgLyoqXG4gICAqIFRpbWUgaW4gbWlsbGlzZWNvbmRzIGJlZm9yZSB0aGUgc2NvcGUgY2FuY2VsbGF0aW9uIGlzIGF1dG9tYXRpY2FsbHkgcmVxdWVzdGVkXG4gICAqL1xuICB0aW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIElmIGZhbHNlLCBwcmV2ZW50IG91dGVyIGNhbmNlbGxhdGlvbiBmcm9tIHByb3BhZ2F0aW5nIHRvIGlubmVyIHNjb3BlcywgQWN0aXZpdGllcywgdGltZXJzLCBhbmQgVHJpZ2dlcnMsIGRlZmF1bHRzIHRvIHRydWUuXG4gICAqIChTY29wZSBzdGlsbCBwcm9wYWdhdGVzIENhbmNlbGxlZEZhaWx1cmUgdGhyb3duIGZyb20gd2l0aGluKS5cbiAgICovXG4gIGNhbmNlbGxhYmxlOiBib29sZWFuO1xuICAvKipcbiAgICogQW4gb3B0aW9uYWwgQ2FuY2VsbGF0aW9uU2NvcGUgKHVzZWZ1bCBmb3IgcnVubmluZyBiYWNrZ3JvdW5kIHRhc2tzKS5cbiAgICogVGhlIGBOT19QQVJFTlRgIHN5bWJvbCBpcyByZXNlcnZlZCBmb3IgdGhlIHJvb3Qgc2NvcGUuXG4gICAqL1xuICBwYXJlbnQ/OiBDYW5jZWxsYXRpb25TY29wZSB8IHR5cGVvZiBOT19QQVJFTlQ7XG59XG5cbi8qKlxuICogQ2FuY2VsbGF0aW9uIFNjb3BlcyBwcm92aWRlIHRoZSBtZWNoYW5pYyBieSB3aGljaCBhIFdvcmtmbG93IG1heSBncmFjZWZ1bGx5IGhhbmRsZSBpbmNvbWluZyByZXF1ZXN0cyBmb3IgY2FuY2VsbGF0aW9uXG4gKiAoZS5nLiBpbiByZXNwb25zZSB0byB7QGxpbmsgV29ya2Zsb3dIYW5kbGUuY2FuY2VsfSBvciB0aHJvdWdoIHRoZSBVSSBvciBDTEkpLCBhcyB3ZWxsIGFzIHJlcXVlc3QgY2FuY2VsYXRpb24gb2ZcbiAqIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMgaXQgb3ducyAoZS5nLiBBY3Rpdml0aWVzLCBUaW1lcnMsIENoaWxkIFdvcmtmbG93cywgZXRjKS5cbiAqXG4gKiBDYW5jZWxsYXRpb24gU2NvcGVzIGZvcm0gYSB0cmVlLCB3aXRoIHRoZSBXb3JrZmxvdydzIG1haW4gZnVuY3Rpb24gcnVubmluZyBpbiB0aGUgcm9vdCBzY29wZSBvZiB0aGF0IHRyZWUuXG4gKiBCeSBkZWZhdWx0LCBjYW5jZWxsYXRpb24gcHJvcGFnYXRlcyBkb3duIGZyb20gYSBwYXJlbnQgc2NvcGUgdG8gaXRzIGNoaWxkcmVuIGFuZCBpdHMgY2FuY2VsbGFibGUgb3BlcmF0aW9ucy5cbiAqIEEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIGNhbiByZWNlaXZlIGNhbmNlbGxhdGlvbiByZXF1ZXN0cywgYnV0IGlzIG5ldmVyIGVmZmVjdGl2ZWx5IGNvbnNpZGVyZWQgYXMgY2FuY2VsbGVkLFxuICogdGh1cyBzaGllbGRkaW5nIGl0cyBjaGlsZHJlbiBhbmQgY2FuY2VsbGFibGUgb3BlcmF0aW9ucyBmcm9tIHByb3BhZ2F0aW9uIG9mIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBpdCByZWNlaXZlcy5cbiAqXG4gKiBTY29wZXMgYXJlIGNyZWF0ZWQgdXNpbmcgdGhlIGBDYW5jZWxsYXRpb25TY29wZWAgY29uc3RydWN0b3Igb3IgdGhlIHN0YXRpYyBoZWxwZXIgbWV0aG9kcyB7QGxpbmsgY2FuY2VsbGFibGV9LFxuICoge0BsaW5rIG5vbkNhbmNlbGxhYmxlfSBhbmQge0BsaW5rIHdpdGhUaW1lb3V0fS4gYHdpdGhUaW1lb3V0YCBjcmVhdGVzIGEgc2NvcGUgdGhhdCBhdXRvbWF0aWNhbGx5IGNhbmNlbHMgaXRzZWxmIGFmdGVyXG4gKiBzb21lIGR1cmF0aW9uLlxuICpcbiAqIENhbmNlbGxhdGlvbiBvZiBhIGNhbmNlbGxhYmxlIHNjb3BlIHJlc3VsdHMgaW4gYWxsIG9wZXJhdGlvbnMgY3JlYXRlZCBkaXJlY3RseSBpbiB0aGF0IHNjb3BlIHRvIHRocm93IGFcbiAqIHtAbGluayBDYW5jZWxsZWRGYWlsdXJlfSAoZWl0aGVyIGRpcmVjdGx5LCBvciBhcyB0aGUgYGNhdXNlYCBvZiBhbiB7QGxpbmsgQWN0aXZpdHlGYWlsdXJlfSBvciBhXG4gKiB7QGxpbmsgQ2hpbGRXb3JrZmxvd0ZhaWx1cmV9KS4gRnVydGhlciBhdHRlbXB0IHRvIGNyZWF0ZSBuZXcgY2FuY2VsbGFibGUgc2NvcGVzIG9yIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMgd2l0aGluIGFcbiAqIHNjb3BlIHRoYXQgaGFzIGFscmVhZHkgYmVlbiBjYW5jZWxsZWQgd2lsbCBhbHNvIGltbWVkaWF0ZWx5IHRocm93IGEge0BsaW5rIENhbmNlbGxlZEZhaWx1cmV9IGV4Y2VwdGlvbi4gSXQgaXMgaG93ZXZlclxuICogcG9zc2libGUgdG8gY3JlYXRlIGEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIGF0IHRoYXQgcG9pbnQ7IHRoaXMgaXMgb2Z0ZW4gdXNlZCB0byBleGVjdXRlIHJvbGxiYWNrIG9yIGNsZWFudXBcbiAqIG9wZXJhdGlvbnMuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYHRzXG4gKiBhc3luYyBmdW5jdGlvbiBteVdvcmtmbG93KC4uLik6IFByb21pc2U8dm9pZD4ge1xuICogICB0cnkge1xuICogICAgIC8vIFRoaXMgYWN0aXZpdHkgcnVucyBpbiB0aGUgcm9vdCBjYW5jZWxsYXRpb24gc2NvcGUuIFRoZXJlZm9yZSwgYSBjYW5jZWxhdGlvbiByZXF1ZXN0IG9uXG4gKiAgICAgLy8gdGhlIFdvcmtmbG93IGV4ZWN1dGlvbiAoZS5nLiB0aHJvdWdoIHRoZSBVSSBvciBDTEkpIGF1dG9tYXRpY2FsbHkgcHJvcGFnYXRlcyB0byB0aGlzXG4gKiAgICAgLy8gYWN0aXZpdHkuIEFzc3VtaW5nIHRoYXQgdGhlIGFjdGl2aXR5IHByb3Blcmx5IGhhbmRsZSB0aGUgY2FuY2VsbGF0aW9uIHJlcXVlc3QsIHRoZW4gdGhlXG4gKiAgICAgLy8gY2FsbCBiZWxvdyB3aWxsIHRocm93IGFuIGBBY3Rpdml0eUZhaWx1cmVgIGV4Y2VwdGlvbiwgd2l0aCBgY2F1c2VgIHNldHMgdG8gYW5cbiAqICAgICAvLyBpbnN0YW5jZSBvZiBgQ2FuY2VsbGVkRmFpbHVyZWAuXG4gKiAgICAgYXdhaXQgc29tZUFjdGl2aXR5KCk7XG4gKiAgIH0gY2F0Y2ggKGUpIHtcbiAqICAgICBpZiAoaXNDYW5jZWxsYXRpb24oZSkpIHtcbiAqICAgICAgIC8vIFJ1biBjbGVhbnVwIGFjdGl2aXR5IGluIGEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlXG4gKiAgICAgICBhd2FpdCBDYW5jZWxsYXRpb25TY29wZS5ub25DYW5jZWxsYWJsZShhc3luYyAoKSA9PiB7XG4gKiAgICAgICAgIGF3YWl0IGNsZWFudXBBY3Rpdml0eSgpO1xuICogICAgICAgfVxuICogICAgIH0gZWxzZSB7XG4gKiAgICAgICB0aHJvdyBlO1xuICogICAgIH1cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQSBjYW5jZWxsYWJsZSBzY29wZSBtYXkgYmUgcHJvZ3JhbWF0aWNhbGx5IGNhbmNlbGxlZCBieSBjYWxsaW5nIHtAbGluayBjYW5jZWx8YHNjb3BlLmNhbmNlbCgpYH1gLiBUaGlzIG1heSBiZSB1c2VkLFxuICogZm9yIGV4YW1wbGUsIHRvIGV4cGxpY2l0bHkgcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gQWN0aXZpdHkgb3IgQ2hpbGQgV29ya2Zsb3c6XG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGNhbmNlbGxhYmxlQWN0aXZpdHlTY29wZSA9IG5ldyBDYW5jZWxsYXRpb25TY29wZSgpO1xuICogY29uc3QgYWN0aXZpdHlQcm9taXNlID0gY2FuY2VsbGFibGVBY3Rpdml0eVNjb3BlLnJ1bigoKSA9PiBzb21lQWN0aXZpdHkoKSk7XG4gKiBjYW5jZWxsYWJsZUFjdGl2aXR5U2NvcGUuY2FuY2VsKCk7IC8vIENhbmNlbHMgdGhlIGFjdGl2aXR5XG4gKiBhd2FpdCBhY3Rpdml0eVByb21pc2U7IC8vIFRocm93cyBgQWN0aXZpdHlGYWlsdXJlYCB3aXRoIGBjYXVzZWAgc2V0IHRvIGBDYW5jZWxsZWRGYWlsdXJlYFxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBDYW5jZWxsYXRpb25TY29wZSB7XG4gIC8qKlxuICAgKiBUaW1lIGluIG1pbGxpc2Vjb25kcyBiZWZvcmUgdGhlIHNjb3BlIGNhbmNlbGxhdGlvbiBpcyBhdXRvbWF0aWNhbGx5IHJlcXVlc3RlZFxuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHRpbWVvdXQ/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIElmIGZhbHNlLCB0aGVuIHRoaXMgc2NvcGUgd2lsbCBuZXZlciBiZSBjb25zaWRlcmVkIGNhbmNlbGxlZCwgZXZlbiBpZiBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IGlzIHJlY2VpdmVkIChlaXRoZXJcbiAgICogZGlyZWN0bHkgYnkgY2FsbGluZyBgc2NvcGUuY2FuY2VsKClgIG9yIGluZGlyZWN0bHkgYnkgY2FuY2VsbGluZyBhIGNhbmNlbGxhYmxlIHBhcmVudCBzY29wZSkuIFRoaXMgZWZmZWN0aXZlbHlcbiAgICogc2hpZWxkcyB0aGUgc2NvcGUncyBjaGlsZHJlbiBhbmQgY2FuY2VsbGFibGUgb3BlcmF0aW9ucyBmcm9tIHByb3BhZ2F0aW9uIG9mIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBtYWRlIG9uIHRoZVxuICAgKiBub24tY2FuY2VsbGFibGUgc2NvcGUuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB0aGUgUHJvbWlzZSByZXR1cm5lZCBieSB0aGUgYHJ1bmAgZnVuY3Rpb24gb2Ygbm9uLWNhbmNlbGxhYmxlIHNjb3BlIG1heSBzdGlsbCB0aHJvdyBhIGBDYW5jZWxsZWRGYWlsdXJlYFxuICAgKiBpZiBzdWNoIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSB3aXRoaW4gdGhhdCBzY29wZSAoZS5nLiBieSBkaXJlY3RseSBjYW5jZWxsaW5nIGEgY2FuY2VsbGFibGUgY2hpbGQgc2NvcGUpLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGNhbmNlbGxhYmxlOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBDYW5jZWxsYXRpb25TY29wZSAodXNlZnVsIGZvciBydW5uaW5nIGJhY2tncm91bmQgdGFza3MpLCBkZWZhdWx0cyB0byB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudH0oKVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHBhcmVudD86IENhbmNlbGxhdGlvblNjb3BlO1xuXG4gIC8qKlxuICAgKiBBIFByb21pc2UgdGhhdCB0aHJvd3Mgd2hlbiBhIGNhbmNlbGxhYmxlIHNjb3BlIHJlY2VpdmVzIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QsIGVpdGhlciBkaXJlY3RseVxuICAgKiAoaS5lLiBgc2NvcGUuY2FuY2VsKClgKSwgb3IgaW5kaXJlY3RseSAoYnkgY2FuY2VsbGluZyBhIGNhbmNlbGxhYmxlIHBhcmVudCBzY29wZSkuXG4gICAqXG4gICAqIE5vdGUgdGhhdCBhIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBtYXkgcmVjZWl2ZSBjYW5jZWxsYXRpb24gcmVxdWVzdHMsIHJlc3VsdGluZyBpbiB0aGUgYGNhbmNlbFJlcXVlc3RlZGAgcHJvbWlzZSBmb3JcbiAgICogdGhhdCBzY29wZSB0byB0aHJvdywgdGhvdWdoIHRoZSBzY29wZSB3aWxsIG5vdCBlZmZlY3RpdmVseSBnZXQgY2FuY2VsbGVkIChpLmUuIGBjb25zaWRlcmVkQ2FuY2VsbGVkYCB3aWxsIHN0aWxsXG4gICAqIHJldHVybiBgZmFsc2VgLCBhbmQgY2FuY2VsbGF0aW9uIHdpbGwgbm90IGJlIHByb3BhZ2F0ZWQgdG8gY2hpbGQgc2NvcGVzIGFuZCBjb250YWluZWQgb3BlcmF0aW9ucykuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgY2FuY2VsUmVxdWVzdGVkOiBQcm9taXNlPG5ldmVyPjtcblxuICAjY2FuY2VsUmVxdWVzdGVkID0gZmFsc2U7XG5cbiAgLy8gVHlwZXNjcmlwdCBkb2VzIG5vdCB1bmRlcnN0YW5kIHRoYXQgdGhlIFByb21pc2UgZXhlY3V0b3IgcnVucyBzeW5jaHJvbm91c2x5IGluIHRoZSBjb25zdHJ1Y3RvclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gIC8vIEB0cy1pZ25vcmVcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogQ2FuY2VsbGF0aW9uU2NvcGVPcHRpb25zKSB7XG4gICAgdGhpcy50aW1lb3V0ID0gbXNPcHRpb25hbFRvTnVtYmVyKG9wdGlvbnM/LnRpbWVvdXQpO1xuICAgIHRoaXMuY2FuY2VsbGFibGUgPSBvcHRpb25zPy5jYW5jZWxsYWJsZSA/PyB0cnVlO1xuICAgIHRoaXMuY2FuY2VsUmVxdWVzdGVkID0gbmV3IFByb21pc2UoKF8sIHJlamVjdCkgPT4ge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUU0MgZG9lc24ndCB1bmRlcnN0YW5kIHRoYXQgdGhlIFByb21pc2UgZXhlY3V0b3IgcnVucyBzeW5jaHJvbm91c2x5XG4gICAgICB0aGlzLnJlamVjdCA9IChlcnIpID0+IHtcbiAgICAgICAgdGhpcy4jY2FuY2VsUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9O1xuICAgIH0pO1xuICAgIHVudHJhY2tQcm9taXNlKHRoaXMuY2FuY2VsUmVxdWVzdGVkKTtcbiAgICAvLyBBdm9pZCB1bmhhbmRsZWQgcmVqZWN0aW9uc1xuICAgIHVudHJhY2tQcm9taXNlKHRoaXMuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHVuZGVmaW5lZCkpO1xuICAgIGlmIChvcHRpb25zPy5wYXJlbnQgIT09IE5PX1BBUkVOVCkge1xuICAgICAgdGhpcy5wYXJlbnQgPSBvcHRpb25zPy5wYXJlbnQgfHwgQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLnBhcmVudC5jYW5jZWxsYWJsZSB8fFxuICAgICAgICAodGhpcy5wYXJlbnQuI2NhbmNlbFJlcXVlc3RlZCAmJlxuICAgICAgICAgICFnZXRBY3RpdmF0b3IoKS5oYXNGbGFnKFNka0ZsYWdzLk5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb24pKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuI2NhbmNlbFJlcXVlc3RlZCA9IHRoaXMucGFyZW50LiNjYW5jZWxSZXF1ZXN0ZWQ7XG4gICAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICAgIHRoaXMucGFyZW50LmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlamVjdChlcnIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgICB0aGlzLnBhcmVudC5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKCFnZXRBY3RpdmF0b3IoKS5oYXNGbGFnKFNka0ZsYWdzLk5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb24pKSB7XG4gICAgICAgICAgICAgIHRoaXMucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgc2NvcGUgd2FzIGVmZmVjdGl2ZWx5IGNhbmNlbGxlZC4gQSBub24tY2FuY2VsbGFibGUgc2NvcGUgY2FuIG5ldmVyIGJlIGNvbnNpZGVyZWQgY2FuY2VsbGVkLlxuICAgKi9cbiAgcHVibGljIGdldCBjb25zaWRlcmVkQ2FuY2VsbGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLiNjYW5jZWxSZXF1ZXN0ZWQgJiYgdGhpcy5jYW5jZWxsYWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSB0aGUgc2NvcGUgYXMgY3VycmVudCBhbmQgcnVuICBgZm5gXG4gICAqXG4gICAqIEFueSB0aW1lcnMsIEFjdGl2aXRpZXMsIFRyaWdnZXJzIGFuZCBDYW5jZWxsYXRpb25TY29wZXMgY3JlYXRlZCBpbiB0aGUgYm9keSBvZiBgZm5gXG4gICAqIGF1dG9tYXRpY2FsbHkgbGluayB0aGVpciBjYW5jZWxsYXRpb24gdG8gdGhpcyBzY29wZS5cbiAgICpcbiAgICogQHJldHVybiB0aGUgcmVzdWx0IG9mIGBmbmBcbiAgICovXG4gIHJ1bjxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBzdG9yYWdlLnJ1bih0aGlzLCB0aGlzLnJ1bkluQ29udGV4dC5iaW5kKHRoaXMsIGZuKSBhcyAoKSA9PiBQcm9taXNlPFQ+KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdGhhdCBydW5zIGEgZnVuY3Rpb24gaW4gQXN5bmNMb2NhbFN0b3JhZ2UgY29udGV4dC5cbiAgICpcbiAgICogQ291bGQgaGF2ZSBiZWVuIHdyaXR0ZW4gYXMgYW5vbnltb3VzIGZ1bmN0aW9uLCBtYWRlIGludG8gYSBtZXRob2QgZm9yIGltcHJvdmVkIHN0YWNrIHRyYWNlcy5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBydW5JbkNvbnRleHQ8VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICBsZXQgdGltZXJTY29wZTogQ2FuY2VsbGF0aW9uU2NvcGUgfCB1bmRlZmluZWQ7XG4gICAgaWYgKHRoaXMudGltZW91dCkge1xuICAgICAgdGltZXJTY29wZSA9IG5ldyBDYW5jZWxsYXRpb25TY29wZSgpO1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHRpbWVyU2NvcGVcbiAgICAgICAgICAucnVuKCgpID0+IHNsZWVwKHRoaXMudGltZW91dCBhcyBudW1iZXIpKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgKCkgPT4gdGhpcy5jYW5jZWwoKSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgLy8gc2NvcGUgd2FzIGFscmVhZHkgY2FuY2VsbGVkLCBpZ25vcmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGZuKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChcbiAgICAgICAgdGltZXJTY29wZSAmJlxuICAgICAgICAhdGltZXJTY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkICYmXG4gICAgICAgIGdldEFjdGl2YXRvcigpLmhhc0ZsYWcoU2RrRmxhZ3MuTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbilcbiAgICAgICkge1xuICAgICAgICB0aW1lclNjb3BlLmNhbmNlbCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0IHRvIGNhbmNlbCB0aGUgc2NvcGUgYW5kIGxpbmtlZCBjaGlsZHJlblxuICAgKi9cbiAgY2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMucmVqZWN0KG5ldyBDYW5jZWxsZWRGYWlsdXJlKCdDYW5jZWxsYXRpb24gc2NvcGUgY2FuY2VsbGVkJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBcImFjdGl2ZVwiIHNjb3BlXG4gICAqL1xuICBzdGF0aWMgY3VycmVudCgpOiBDYW5jZWxsYXRpb25TY29wZSB7XG4gICAgLy8gVXNpbmcgZ2xvYmFscyBkaXJlY3RseSBpbnN0ZWFkIG9mIGEgaGVscGVyIGZ1bmN0aW9uIHRvIGF2b2lkIGNpcmN1bGFyIGltcG9ydFxuICAgIHJldHVybiBzdG9yYWdlLmdldFN0b3JlKCkgPz8gKGdsb2JhbFRoaXMgYXMgYW55KS5fX1RFTVBPUkFMX0FDVElWQVRPUl9fLnJvb3RTY29wZTtcbiAgfVxuXG4gIC8qKiBBbGlhcyB0byBgbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IHRydWUgfSkucnVuKGZuKWAgKi9cbiAgc3RhdGljIGNhbmNlbGxhYmxlPFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHsgY2FuY2VsbGFibGU6IHRydWUgfSkucnVuKGZuKTtcbiAgfVxuXG4gIC8qKiBBbGlhcyB0byBgbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IGZhbHNlIH0pLnJ1bihmbilgICovXG4gIHN0YXRpYyBub25DYW5jZWxsYWJsZTxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgdGhpcyh7IGNhbmNlbGxhYmxlOiBmYWxzZSB9KS5ydW4oZm4pO1xuICB9XG5cbiAgLyoqIEFsaWFzIHRvIGBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoeyBjYW5jZWxsYWJsZTogdHJ1ZSwgdGltZW91dCB9KS5ydW4oZm4pYCAqL1xuICBzdGF0aWMgd2l0aFRpbWVvdXQ8VD4odGltZW91dDogRHVyYXRpb24sIGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHsgY2FuY2VsbGFibGU6IHRydWUsIHRpbWVvdXQgfSkucnVuKGZuKTtcbiAgfVxufVxuXG5jb25zdCBzdG9yYWdlID0gbmV3IEFzeW5jTG9jYWxTdG9yYWdlPENhbmNlbGxhdGlvblNjb3BlPigpO1xuXG4vKipcbiAqIEF2b2lkIGV4cG9zaW5nIHRoZSBzdG9yYWdlIGRpcmVjdGx5IHNvIGl0IGRvZXNuJ3QgZ2V0IGZyb3plblxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZVN0b3JhZ2UoKTogdm9pZCB7XG4gIHN0b3JhZ2UuZGlzYWJsZSgpO1xufVxuXG5leHBvcnQgY2xhc3MgUm9vdENhbmNlbGxhdGlvblNjb3BlIGV4dGVuZHMgQ2FuY2VsbGF0aW9uU2NvcGUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7IGNhbmNlbGxhYmxlOiB0cnVlLCBwYXJlbnQ6IE5PX1BBUkVOVCB9KTtcbiAgfVxuXG4gIGNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlamVjdChuZXcgQ2FuY2VsbGVkRmFpbHVyZSgnV29ya2Zsb3cgY2FuY2VsbGVkJykpO1xuICB9XG59XG5cbi8qKiBUaGlzIGZ1bmN0aW9uIGlzIGhlcmUgdG8gYXZvaWQgYSBjaXJjdWxhciBkZXBlbmRlbmN5IGJldHdlZW4gdGhpcyBtb2R1bGUgYW5kIHdvcmtmbG93LnRzICovXG5sZXQgc2xlZXAgPSAoXzogRHVyYXRpb24pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyBoYXMgbm90IGJlZW4gcHJvcGVybHkgaW5pdGlhbGl6ZWQnKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclNsZWVwSW1wbGVtZW50YXRpb24oZm46IHR5cGVvZiBzbGVlcCk6IHZvaWQge1xuICBzbGVlcCA9IGZuO1xufVxuIiwiaW1wb3J0IHsgQWN0aXZpdHlGYWlsdXJlLCBDYW5jZWxsZWRGYWlsdXJlLCBDaGlsZFdvcmtmbG93RmFpbHVyZSB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdHlwZS1oZWxwZXJzJztcbmltcG9ydCB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYWxsIHdvcmtmbG93IGVycm9yc1xuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1dvcmtmbG93RXJyb3InKVxuZXhwb3J0IGNsYXNzIFdvcmtmbG93RXJyb3IgZXh0ZW5kcyBFcnJvciB7fVxuXG4vKipcbiAqIFRocm93biBpbiB3b3JrZmxvdyB3aGVuIGl0IHRyaWVzIHRvIGRvIHNvbWV0aGluZyB0aGF0IG5vbi1kZXRlcm1pbmlzdGljIHN1Y2ggYXMgY29uc3RydWN0IGEgV2Vha1JlZigpXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcicpXG5leHBvcnQgY2xhc3MgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige31cblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgYWN0cyBhcyBhIG1hcmtlciBmb3IgdGhpcyBzcGVjaWFsIHJlc3VsdCB0eXBlXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignTG9jYWxBY3Rpdml0eURvQmFja29mZicpXG5leHBvcnQgY2xhc3MgTG9jYWxBY3Rpdml0eURvQmFja29mZiBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGJhY2tvZmY6IGNvcmVzZGsuYWN0aXZpdHlfcmVzdWx0LklEb0JhY2tvZmYpIHtcbiAgICBzdXBlcigpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHByb3ZpZGVkIGBlcnJgIGlzIGNhdXNlZCBieSBjYW5jZWxsYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2FuY2VsbGF0aW9uKGVycjogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGVyciBpbnN0YW5jZW9mIENhbmNlbGxlZEZhaWx1cmUgfHxcbiAgICAoKGVyciBpbnN0YW5jZW9mIEFjdGl2aXR5RmFpbHVyZSB8fCBlcnIgaW5zdGFuY2VvZiBDaGlsZFdvcmtmbG93RmFpbHVyZSkgJiYgZXJyLmNhdXNlIGluc3RhbmNlb2YgQ2FuY2VsbGVkRmFpbHVyZSlcbiAgKTtcbn1cbiIsImltcG9ydCB0eXBlIHsgV29ya2Zsb3dJbmZvIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuZXhwb3J0IHR5cGUgU2RrRmxhZyA9IHtcbiAgZ2V0IGlkKCk6IG51bWJlcjtcbiAgZ2V0IGRlZmF1bHQoKTogYm9vbGVhbjtcbiAgZ2V0IGFsdGVybmF0aXZlQ29uZGl0aW9ucygpOiBBbHRDb25kaXRpb25GbltdIHwgdW5kZWZpbmVkO1xufTtcblxuY29uc3QgZmxhZ3NSZWdpc3RyeTogTWFwPG51bWJlciwgU2RrRmxhZz4gPSBuZXcgTWFwKCk7XG5cbmV4cG9ydCBjb25zdCBTZGtGbGFncyA9IHtcbiAgLyoqXG4gICAqIFRoaXMgZmxhZyBnYXRlcyBtdWx0aXBsZSBmaXhlcyByZWxhdGVkIHRvIGNhbmNlbGxhdGlvbiBzY29wZXMgYW5kIHRpbWVycyBpbnRyb2R1Y2VkIGluIDEuMTAuMi8xLjExLjA6XG4gICAqIC0gQ2FuY2VsbGF0aW9uIG9mIGEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIG5vIGxvbmdlciBwcm9wYWdhdGVzIHRvIGNoaWxkcmVuIHNjb3Blc1xuICAgKiAgIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3RlbXBvcmFsaW8vc2RrLXR5cGVzY3JpcHQvaXNzdWVzLzE0MjMpLlxuICAgKiAtIENhbmNlbGxhdGlvblNjb3BlLndpdGhUaW1lb3V0KGZuKSBub3cgY2FuY2VsIHRoZSB0aW1lciBpZiBgZm5gIGNvbXBsZXRlcyBiZWZvcmUgZXhwaXJhdGlvblxuICAgKiAgIG9mIHRoZSB0aW1lb3V0LCBzaW1pbGFyIHRvIGhvdyBgY29uZGl0aW9uKGZuLCB0aW1lb3V0KWAgd29ya3MuXG4gICAqIC0gVGltZXJzIGNyZWF0ZWQgdXNpbmcgc2V0VGltZW91dCBjYW4gbm93IGJlIGludGVyY2VwdGVkLlxuICAgKlxuICAgKiBAc2luY2UgSW50cm9kdWNlZCBpbiAxLjEwLjIvMS4xMS4wLiBIb3dldmVyLCBkdWUgdG8gYW4gU0RLIGJ1ZywgU0RLcyB2MS4xMS4wIGFuZCB2MS4xMS4xIHdlcmUgbm90XG4gICAqICAgICAgICBwcm9wZXJseSB3cml0aW5nIGJhY2sgdGhlIGZsYWdzIHRvIGhpc3RvcnksIHBvc3NpYmx5IHJlc3VsdGluZyBpbiBOREUgb24gcmVwbGF5LiBXZSB0aGVyZWZvcmVcbiAgICogICAgICAgIGNvbnNpZGVyIHRoYXQgYSBXRlQgZW1pdHRlZCBieSBXb3JrZXIgdjEuMTEuMCBvciB2MS4xMS4xIHRvIGltcGxpY2l0bHkgaGF2ZSB0aGlzIGZsYWcgb24uXG4gICAqL1xuICBOb25DYW5jZWxsYWJsZVNjb3Blc0FyZVNoaWVsZGVkRnJvbVByb3BhZ2F0aW9uOiBkZWZpbmVGbGFnKDEsIHRydWUsIFtidWlsZElkU2RrVmVyc2lvbk1hdGNoZXMoLzFcXC4xMVxcLlswMV0vKV0pLFxuXG4gIC8qKlxuICAgKiBQcmlvciB0byAxLjExLjAsIHdoZW4gcHJvY2Vzc2luZyBhIFdvcmtmbG93IGFjdGl2YXRpb24sIHRoZSBTREsgd291bGQgZXhlY3V0ZSBgbm90aWZ5SGFzUGF0Y2hgXG4gICAqIGFuZCBgc2lnbmFsV29ya2Zsb3dgIGpvYnMgaW4gZGlzdGluY3QgcGhhc2VzLCBiZWZvcmUgb3RoZXIgdHlwZXMgb2Ygam9icy4gVGhlIHByaW1hcnkgcmVhc29uXG4gICAqIGJlaGluZCB0aGF0IG11bHRpLXBoYXNlIGFsZ29yaXRobSB3YXMgdG8gYXZvaWQgdGhlIHBvc3NpYmlsaXR5IHRoYXQgYSBXb3JrZmxvdyBleGVjdXRpb24gbWlnaHRcbiAgICogY29tcGxldGUgYmVmb3JlIGFsbCBpbmNvbWluZyBzaWduYWxzIGhhdmUgYmVlbiBkaXNwYXRjaGVkIChhdCBsZWFzdCB0byB0aGUgcG9pbnQgdGhhdCB0aGVcbiAgICogX3N5bmNocm9ub3VzXyBwYXJ0IG9mIHRoZSBoYW5kbGVyIGZ1bmN0aW9uIGhhcyBiZWVuIGV4ZWN1dGVkKS5cbiAgICpcbiAgICogVGhpcyBmbGFnIHJlcGxhY2VzIHRoYXQgbXVsdGktcGhhc2UgYWxnb3JpdGhtIHdpdGggYSBzaW1wbGVyIG9uZSB3aGVyZSBqb2JzIGFyZSBzaW1wbHkgc29ydGVkIGFzXG4gICAqIGAoc2lnbmFscyBhbmQgdXBkYXRlcykgLT4gb3RoZXJzYCwgYnV0IHdpdGhvdXQgcHJvY2Vzc2luZyB0aGVtIGFzIGRpc3RpbmN0IGJhdGNoZXMgKGkuZS4gd2l0aG91dFxuICAgKiBsZWF2aW5nL3JlZW50ZXJpbmcgdGhlIFZNIGNvbnRleHQgYmV0d2VlbiBlYWNoIGdyb3VwLCB3aGljaCBhdXRvbWF0aWNhbGx5IHRyaWdnZXJzIHRoZSBleGVjdXRpb25cbiAgICogb2YgYWxsIG91dHN0YW5kaW5nIG1pY3JvdGFza3MpLiBUaGF0IHNpbmdsZS1waGFzZSBhcHByb2FjaCByZXNvbHZlcyBhIG51bWJlciBvZiBxdWlya3Mgb2YgdGhlXG4gICAqIGZvcm1lciBhbGdvcml0aG0sIGFuZCB5ZXQgc3RpbGwgc2F0aXNmaWVzIHRvIHRoZSBvcmlnaW5hbCByZXF1aXJlbWVudCBvZiBlbnN1cmluZyB0aGF0IGV2ZXJ5XG4gICAqIGBzaWduYWxXb3JrZmxvd2Agam9icyAtIGFuZCBub3cgYGRvVXBkYXRlYCBqb2JzIGFzIHdlbGwgLSBoYXZlIGJlZW4gZ2l2ZW4gYSBwcm9wZXIgY2hhbmNlIHRvXG4gICAqIGV4ZWN1dGUgYmVmb3JlIHRoZSBXb3JrZmxvdyBtYWluIGZ1bmN0aW9uIG1pZ2h0IGNvbXBsZXRlcy5cbiAgICpcbiAgICogQHNpbmNlIEludHJvZHVjZWQgaW4gMS4xMS4wLiBUaGlzIGNoYW5nZSBpcyBub3Qgcm9sbGJhY2stc2FmZS4gSG93ZXZlciwgZHVlIHRvIGFuIFNESyBidWcsIFNES3NcbiAgICogICAgICAgIHYxLjExLjAgYW5kIHYxLjExLjEgd2VyZSBub3QgcHJvcGVybHkgd3JpdGluZyBiYWNrIHRoZSBmbGFncyB0byBoaXN0b3J5LCBwb3NzaWJseSByZXN1bHRpbmdcbiAgICogICAgICAgIGluIE5ERSBvbiByZXBsYXkuIFdlIHRoZXJlZm9yZSBjb25zaWRlciB0aGF0IGEgV0ZUIGVtaXR0ZWQgYnkgV29ya2VyIHYxLjExLjAgb3IgdjEuMTEuMVxuICAgKiAgICAgICAgdG8gaW1wbGljaXRlbHkgaGF2ZSB0aGlzIGZsYWcgb24uXG4gICAqL1xuICBQcm9jZXNzV29ya2Zsb3dBY3RpdmF0aW9uSm9ic0FzU2luZ2xlQmF0Y2g6IGRlZmluZUZsYWcoMiwgdHJ1ZSwgW2J1aWxkSWRTZGtWZXJzaW9uTWF0Y2hlcygvMVxcLjExXFwuWzAxXS8pXSksXG59IGFzIGNvbnN0O1xuXG5mdW5jdGlvbiBkZWZpbmVGbGFnKGlkOiBudW1iZXIsIGRlZjogYm9vbGVhbiwgYWx0ZXJuYXRpdmVDb25kaXRpb25zPzogQWx0Q29uZGl0aW9uRm5bXSk6IFNka0ZsYWcge1xuICBjb25zdCBmbGFnID0geyBpZCwgZGVmYXVsdDogZGVmLCBhbHRlcm5hdGl2ZUNvbmRpdGlvbnMgfTtcbiAgZmxhZ3NSZWdpc3RyeS5zZXQoaWQsIGZsYWcpO1xuICByZXR1cm4gZmxhZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFZhbGlkRmxhZyhpZDogbnVtYmVyKTogdm9pZCB7XG4gIGlmICghZmxhZ3NSZWdpc3RyeS5oYXMoaWQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBVbmtub3duIFNESyBmbGFnOiAke2lkfWApO1xufVxuXG4vKipcbiAqIEFuIFNESyBGbGFnIEFsdGVybmF0ZSBDb25kaXRpb24gcHJvdmlkZXMgYW4gYWx0ZXJuYXRpdmUgd2F5IG9mIGRldGVybWluaW5nIHdoZXRoZXIgYSBmbGFnXG4gKiBzaG91bGQgYmUgY29uc2lkZXJlZCBhcyBlbmFibGVkIGZvciB0aGUgY3VycmVudCBXRlQ7IGUuZy4gYnkgbG9va2luZyBhdCB0aGUgdmVyc2lvbiBvZiB0aGUgU0RLXG4gKiB0aGF0IGVtaXR0ZWQgYSBXRlQuIFRoZSBtYWluIHVzZSBjYXNlIGZvciB0aGlzIGlzIHRvIHJldHJvYWN0aXZlbHkgdHVybiBvbiBzb21lIGZsYWdzIGZvciBXRlRcbiAqIGVtaXR0ZWQgYnkgcHJldmlvdXMgU0RLcyB0aGF0IGNvbnRhaW5lZCBhIGJ1Zy5cbiAqXG4gKiBOb3RlIHRoYXQgY29uZGl0aW9ucyBhcmUgb25seSBldmFsdWF0ZWQgd2hpbGUgcmVwbGF5aW5nLCBhbmQgb25seSBpZiB0aGUgY29ycmVzcG9uaW5nIGZsYWcgaXNcbiAqIG5vdCBhbHJlYWR5IHNldC4gQWxzbywgYWx0ZXJuYXRlIGNvbmRpdGlvbnMgd2lsbCBub3QgY2F1c2UgdGhlIGZsYWcgdG8gYmUgcGVyc2lzdGVkIHRvIHRoZVxuICogXCJ1c2VkIGZsYWdzXCIgc2V0LCB3aGljaCBtZWFucyB0aGF0IGZ1cnRoZXIgV29ya2Zsb3cgVGFza3MgbWF5IG5vdCByZWZsZWN0IHRoaXMgZmxhZyBpZiB0aGVcbiAqIGNvbmRpdGlvbiBubyBsb25nZXIgaG9sZHMuIFRoaXMgaXMgc28gdG8gYXZvaWQgaW5jb3JyZWN0IGJlaGF2aW9ycyBpbiBjYXNlIHdoZXJlIGEgV29ya2Zsb3dcbiAqIEV4ZWN1dGlvbiBoYXMgZ29uZSB0aHJvdWdoIGEgbmV3ZXIgU0RLIHZlcnNpb24gdGhlbiBhZ2FpbiB0aHJvdWdoIGFuIG9sZGVyIG9uZS5cbiAqL1xudHlwZSBBbHRDb25kaXRpb25GbiA9IChjdHg6IHsgaW5mbzogV29ya2Zsb3dJbmZvIH0pID0+IGJvb2xlYW47XG5cbmZ1bmN0aW9uIGJ1aWxkSWRTZGtWZXJzaW9uTWF0Y2hlcyh2ZXJzaW9uOiBSZWdFeHApOiBBbHRDb25kaXRpb25GbiB7XG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgXkB0ZW1wb3JhbGlvL3dvcmtlckAoJHt2ZXJzaW9uLnNvdXJjZX0pWytdYCk7XG4gIHJldHVybiAoeyBpbmZvIH0pID0+IGluZm8uY3VycmVudEJ1aWxkSWQgIT0gbnVsbCAmJiByZWdleC50ZXN0KGluZm8uY3VycmVudEJ1aWxkSWQpO1xufVxuIiwiaW1wb3J0IHsgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdHlwZSBBY3RpdmF0b3IgfSBmcm9tICcuL2ludGVybmFscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXliZUdldEFjdGl2YXRvclVudHlwZWQoKTogdW5rbm93biB7XG4gIHJldHVybiAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fVEVNUE9SQUxfQUNUSVZBVE9SX187XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRBY3RpdmF0b3JVbnR5cGVkKGFjdGl2YXRvcjogdW5rbm93bik6IHZvaWQge1xuICAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fVEVNUE9SQUxfQUNUSVZBVE9SX18gPSBhY3RpdmF0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXliZUdldEFjdGl2YXRvcigpOiBBY3RpdmF0b3IgfCB1bmRlZmluZWQge1xuICByZXR1cm4gbWF5YmVHZXRBY3RpdmF0b3JVbnR5cGVkKCkgYXMgQWN0aXZhdG9yIHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQobWVzc2FnZTogc3RyaW5nKTogQWN0aXZhdG9yIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gbWF5YmVHZXRBY3RpdmF0b3IoKTtcbiAgaWYgKGFjdGl2YXRvciA9PSBudWxsKSB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBhY3RpdmF0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3RpdmF0b3IoKTogQWN0aXZhdG9yIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gbWF5YmVHZXRBY3RpdmF0b3IoKTtcbiAgaWYgKGFjdGl2YXRvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyB1bmluaXRpYWxpemVkJyk7XG4gIH1cbiAgcmV0dXJuIGFjdGl2YXRvcjtcbn1cbiIsIi8qKlxuICogT3ZlcnJpZGVzIHNvbWUgZ2xvYmFsIG9iamVjdHMgdG8gbWFrZSB0aGVtIGRldGVybWluaXN0aWMuXG4gKlxuICogQG1vZHVsZVxuICovXG5pbXBvcnQgeyBtc1RvVHMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3RpbWUnO1xuaW1wb3J0IHsgQ2FuY2VsbGF0aW9uU2NvcGUgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgZ2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5pbXBvcnQgeyBTZGtGbGFncyB9IGZyb20gJy4vZmxhZ3MnO1xuaW1wb3J0IHsgc2xlZXAgfSBmcm9tICcuL3dvcmtmbG93JztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcblxuY29uc3QgZ2xvYmFsID0gZ2xvYmFsVGhpcyBhcyBhbnk7XG5jb25zdCBPcmlnaW5hbERhdGUgPSBnbG9iYWxUaGlzLkRhdGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBvdmVycmlkZUdsb2JhbHMoKTogdm9pZCB7XG4gIC8vIE1vY2sgYW55IHdlYWsgcmVmZXJlbmNlIGJlY2F1c2UgR0MgaXMgbm9uLWRldGVybWluaXN0aWMgYW5kIHRoZSBlZmZlY3QgaXMgb2JzZXJ2YWJsZSBmcm9tIHRoZSBXb3JrZmxvdy5cbiAgLy8gV29ya2Zsb3cgZGV2ZWxvcGVyIHdpbGwgZ2V0IGEgbWVhbmluZ2Z1bCBleGNlcHRpb24gaWYgdGhleSB0cnkgdG8gdXNlIHRoZXNlLlxuICBnbG9iYWwuV2Vha1JlZiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcignV2Vha1JlZiBjYW5ub3QgYmUgdXNlZCBpbiBXb3JrZmxvd3MgYmVjYXVzZSB2OCBHQyBpcyBub24tZGV0ZXJtaW5pc3RpYycpO1xuICB9O1xuICBnbG9iYWwuRmluYWxpemF0aW9uUmVnaXN0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhyb3cgbmV3IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IoXG4gICAgICAnRmluYWxpemF0aW9uUmVnaXN0cnkgY2Fubm90IGJlIHVzZWQgaW4gV29ya2Zsb3dzIGJlY2F1c2UgdjggR0MgaXMgbm9uLWRldGVybWluaXN0aWMnXG4gICAgKTtcbiAgfTtcblxuICBnbG9iYWwuRGF0ZSA9IGZ1bmN0aW9uICguLi5hcmdzOiB1bmtub3duW10pIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gbmV3IChPcmlnaW5hbERhdGUgYXMgYW55KSguLi5hcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBPcmlnaW5hbERhdGUoZ2V0QWN0aXZhdG9yKCkubm93KTtcbiAgfTtcblxuICBnbG9iYWwuRGF0ZS5ub3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGdldEFjdGl2YXRvcigpLm5vdztcbiAgfTtcblxuICBnbG9iYWwuRGF0ZS5wYXJzZSA9IE9yaWdpbmFsRGF0ZS5wYXJzZS5iaW5kKE9yaWdpbmFsRGF0ZSk7XG4gIGdsb2JhbC5EYXRlLlVUQyA9IE9yaWdpbmFsRGF0ZS5VVEMuYmluZChPcmlnaW5hbERhdGUpO1xuXG4gIGdsb2JhbC5EYXRlLnByb3RvdHlwZSA9IE9yaWdpbmFsRGF0ZS5wcm90b3R5cGU7XG5cbiAgY29uc3QgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzID0gbmV3IE1hcDxudW1iZXIsIENhbmNlbGxhdGlvblNjb3BlPigpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbXMgc2xlZXAgZHVyYXRpb24gLSAgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy4gSWYgZ2l2ZW4gYSBuZWdhdGl2ZSBudW1iZXIsIHZhbHVlIHdpbGwgYmUgc2V0IHRvIDEuXG4gICAqL1xuICBnbG9iYWwuc2V0VGltZW91dCA9IGZ1bmN0aW9uIChjYjogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnksIG1zOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogbnVtYmVyIHtcbiAgICBtcyA9IE1hdGgubWF4KDEsIG1zKTtcbiAgICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgICBpZiAoYWN0aXZhdG9yLmhhc0ZsYWcoU2RrRmxhZ3MuTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbikpIHtcbiAgICAgIC8vIENhcHR1cmUgdGhlIHNlcXVlbmNlIG51bWJlciB0aGF0IHNsZWVwIHdpbGwgYWxsb2NhdGVcbiAgICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcjtcbiAgICAgIGNvbnN0IHRpbWVyU2NvcGUgPSBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoeyBjYW5jZWxsYWJsZTogdHJ1ZSB9KTtcbiAgICAgIGNvbnN0IHNsZWVwUHJvbWlzZSA9IHRpbWVyU2NvcGUucnVuKCgpID0+IHNsZWVwKG1zKSk7XG4gICAgICBzbGVlcFByb21pc2UudGhlbihcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5kZWxldGUoc2VxKTtcbiAgICAgICAgICBjYiguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5kZWxldGUoc2VxKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNsZWVwUHJvbWlzZSk7XG4gICAgICB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMuc2V0KHNlcSwgdGltZXJTY29wZSk7XG4gICAgICByZXR1cm4gc2VxO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMudGltZXIrKztcbiAgICAgIC8vIENyZWF0ZSBhIFByb21pc2UgZm9yIEFzeW5jTG9jYWxTdG9yYWdlIHRvIGJlIGFibGUgdG8gdHJhY2sgdGhpcyBjb21wbGV0aW9uIHVzaW5nIHByb21pc2UgaG9va3MuXG4gICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5zZXQoc2VxLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICBzdGFydFRpbWVyOiB7XG4gICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICBzdGFydFRvRmlyZVRpbWVvdXQ6IG1zVG9UcyhtcyksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9KS50aGVuKFxuICAgICAgICAoKSA9PiBjYiguLi5hcmdzKSxcbiAgICAgICAgKCkgPT4gdW5kZWZpbmVkIC8qIGlnbm9yZSBjYW5jZWxsYXRpb24gKi9cbiAgICAgICk7XG4gICAgICByZXR1cm4gc2VxO1xuICAgIH1cbiAgfTtcblxuICBnbG9iYWwuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24gKGhhbmRsZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gICAgY29uc3QgdGltZXJTY29wZSA9IHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5nZXQoaGFuZGxlKTtcbiAgICBpZiAodGltZXJTY29wZSkge1xuICAgICAgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzLmRlbGV0ZShoYW5kbGUpO1xuICAgICAgdGltZXJTY29wZS5jYW5jZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aXZhdG9yLm5leHRTZXFzLnRpbWVyKys7IC8vIFNob3VsZG4ndCBpbmNyZWFzZSBzZXEgbnVtYmVyLCBidXQgdGhhdCdzIHRoZSBsZWdhY3kgYmVoYXZpb3JcbiAgICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5kZWxldGUoaGFuZGxlKTtcbiAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgIGNhbmNlbFRpbWVyOiB7XG4gICAgICAgICAgc2VxOiBoYW5kbGUsXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgLy8gYWN0aXZhdG9yLnJhbmRvbSBpcyBtdXRhYmxlLCBkb24ndCBoYXJkY29kZSBpdHMgcmVmZXJlbmNlXG4gIE1hdGgucmFuZG9tID0gKCkgPT4gZ2V0QWN0aXZhdG9yKCkucmFuZG9tKCk7XG59XG4iLCIvKipcbiAqIFRoaXMgbGlicmFyeSBwcm92aWRlcyB0b29scyByZXF1aXJlZCBmb3IgYXV0aG9yaW5nIHdvcmtmbG93cy5cbiAqXG4gKiAjIyBVc2FnZVxuICogU2VlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvaGVsbG8td29ybGQjd29ya2Zsb3dzIHwgdHV0b3JpYWx9IGZvciB3cml0aW5nIHlvdXIgZmlyc3Qgd29ya2Zsb3cuXG4gKlxuICogIyMjIFRpbWVyc1xuICpcbiAqIFRoZSByZWNvbW1lbmRlZCB3YXkgb2Ygc2NoZWR1bGluZyB0aW1lcnMgaXMgYnkgdXNpbmcgdGhlIHtAbGluayBzbGVlcH0gZnVuY3Rpb24uIFdlJ3ZlIHJlcGxhY2VkIGBzZXRUaW1lb3V0YCBhbmRcbiAqIGBjbGVhclRpbWVvdXRgIHdpdGggZGV0ZXJtaW5pc3RpYyB2ZXJzaW9ucyBzbyB0aGVzZSBhcmUgYWxzbyB1c2FibGUgYnV0IGhhdmUgYSBsaW1pdGF0aW9uIHRoYXQgdGhleSBkb24ndCBwbGF5IHdlbGxcbiAqIHdpdGgge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2NhbmNlbGxhdGlvbi1zY29wZXMgfCBjYW5jZWxsYXRpb24gc2NvcGVzfS5cbiAqXG4gKiA8IS0tU05JUFNUQVJUIHR5cGVzY3JpcHQtc2xlZXAtd29ya2Zsb3ctLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKlxuICogIyMjIEFjdGl2aXRpZXNcbiAqXG4gKiBUbyBzY2hlZHVsZSBBY3Rpdml0aWVzLCB1c2Uge0BsaW5rIHByb3h5QWN0aXZpdGllc30gdG8gb2J0YWluIGFuIEFjdGl2aXR5IGZ1bmN0aW9uIGFuZCBjYWxsLlxuICpcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC1zY2hlZHVsZS1hY3Rpdml0eS13b3JrZmxvdy0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqXG4gKiAjIyMgVXBkYXRlcywgU2lnbmFscyBhbmQgUXVlcmllc1xuICpcbiAqIFVzZSB7QGxpbmsgc2V0SGFuZGxlcn0gdG8gc2V0IGhhbmRsZXJzIGZvciBVcGRhdGVzLCBTaWduYWxzLCBhbmQgUXVlcmllcy5cbiAqXG4gKiBVcGRhdGUgYW5kIFNpZ25hbCBoYW5kbGVycyBjYW4gYmUgZWl0aGVyIGFzeW5jIG9yIG5vbi1hc3luYyBmdW5jdGlvbnMuIFVwZGF0ZSBoYW5kbGVycyBtYXkgcmV0dXJuIGEgdmFsdWUsIGJ1dCBzaWduYWxcbiAqIGhhbmRsZXJzIG1heSBub3QgKHJldHVybiBgdm9pZGAgb3IgYFByb21pc2U8dm9pZD5gKS4gWW91IG1heSB1c2UgQWN0aXZpdGllcywgVGltZXJzLCBjaGlsZCBXb3JrZmxvd3MsIGV0YyBpbiBVcGRhdGVcbiAqIGFuZCBTaWduYWwgaGFuZGxlcnMsIGJ1dCB0aGlzIHNob3VsZCBiZSBkb25lIGNhdXRpb3VzbHk6IGZvciBleGFtcGxlLCBub3RlIHRoYXQgaWYgeW91IGF3YWl0IGFzeW5jIG9wZXJhdGlvbnMgc3VjaCBhc1xuICogdGhlc2UgaW4gYW4gVXBkYXRlIG9yIFNpZ25hbCBoYW5kbGVyLCB0aGVuIHlvdSBhcmUgcmVzcG9uc2libGUgZm9yIGVuc3VyaW5nIHRoYXQgdGhlIHdvcmtmbG93IGRvZXMgbm90IGNvbXBsZXRlIGZpcnN0LlxuICpcbiAqIFF1ZXJ5IGhhbmRsZXJzIG1heSAqKm5vdCoqIGJlIGFzeW5jIGZ1bmN0aW9ucywgYW5kIG1heSAqKm5vdCoqIG11dGF0ZSBhbnkgdmFyaWFibGVzIG9yIHVzZSBBY3Rpdml0aWVzLCBUaW1lcnMsXG4gKiBjaGlsZCBXb3JrZmxvd3MsIGV0Yy5cbiAqXG4gKiAjIyMjIEltcGxlbWVudGF0aW9uXG4gKlxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXdvcmtmbG93LXVwZGF0ZS1zaWduYWwtcXVlcnktZXhhbXBsZS0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqXG4gKiAjIyMgTW9yZVxuICpcbiAqIC0gW0RldGVybWluaXN0aWMgYnVpbHQtaW5zXShodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9kZXRlcm1pbmlzbSNzb3VyY2VzLW9mLW5vbi1kZXRlcm1pbmlzbSlcbiAqIC0gW0NhbmNlbGxhdGlvbiBhbmQgc2NvcGVzXShodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9jYW5jZWxsYXRpb24tc2NvcGVzKVxuICogICAtIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1cbiAqICAgLSB7QGxpbmsgVHJpZ2dlcn1cbiAqIC0gW1NpbmtzXShodHRwczovL2RvY3MudGVtcG9yYWwuaW8vYXBwbGljYXRpb24tZGV2ZWxvcG1lbnQvb2JzZXJ2YWJpbGl0eS8/bGFuZz10cyNsb2dnaW5nKVxuICogICAtIHtAbGluayBTaW5rc31cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuZXhwb3J0IHtcbiAgQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLFxuICBBY3Rpdml0eUZhaWx1cmUsXG4gIEFjdGl2aXR5T3B0aW9ucyxcbiAgQXBwbGljYXRpb25GYWlsdXJlLFxuICBDYW5jZWxsZWRGYWlsdXJlLFxuICBDaGlsZFdvcmtmbG93RmFpbHVyZSxcbiAgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIsXG4gIFBheWxvYWRDb252ZXJ0ZXIsXG4gIFJldHJ5UG9saWN5LFxuICByb290Q2F1c2UsXG4gIFNlcnZlckZhaWx1cmUsXG4gIFRlbXBvcmFsRmFpbHVyZSxcbiAgVGVybWluYXRlZEZhaWx1cmUsXG4gIFRpbWVvdXRGYWlsdXJlLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuZXhwb3J0ICogZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9lcnJvcnMnO1xuZXhwb3J0IHtcbiAgQWN0aXZpdHlGdW5jdGlvbixcbiAgQWN0aXZpdHlJbnRlcmZhY2UsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cbiAgUGF5bG9hZCxcbiAgUXVlcnlEZWZpbml0aW9uLFxuICBTZWFyY2hBdHRyaWJ1dGVzLFxuICBTZWFyY2hBdHRyaWJ1dGVWYWx1ZSxcbiAgU2lnbmFsRGVmaW5pdGlvbixcbiAgVW50eXBlZEFjdGl2aXRpZXMsXG4gIFdvcmtmbG93LFxuICBXb3JrZmxvd1F1ZXJ5VHlwZSxcbiAgV29ya2Zsb3dSZXN1bHRUeXBlLFxuICBXb3JrZmxvd1JldHVyblR5cGUsXG4gIFdvcmtmbG93U2lnbmFsVHlwZSxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmZhY2VzJztcbmV4cG9ydCAqIGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvd29ya2Zsb3ctaGFuZGxlJztcbmV4cG9ydCAqIGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvd29ya2Zsb3ctb3B0aW9ucyc7XG5leHBvcnQgeyBBc3luY0xvY2FsU3RvcmFnZSwgQ2FuY2VsbGF0aW9uU2NvcGUsIENhbmNlbGxhdGlvblNjb3BlT3B0aW9ucyB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmV4cG9ydCAqIGZyb20gJy4vZXJyb3JzJztcbmV4cG9ydCAqIGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmV4cG9ydCB7XG4gIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLFxuICBDaGlsZFdvcmtmbG93T3B0aW9ucyxcbiAgQ29udGludWVBc05ldyxcbiAgQ29udGludWVBc05ld09wdGlvbnMsXG4gIEVuaGFuY2VkU3RhY2tUcmFjZSxcbiAgU3RhY2tUcmFjZUZpbGVMb2NhdGlvbixcbiAgU3RhY2tUcmFjZUZpbGVTbGljZSxcbiAgUGFyZW50Q2xvc2VQb2xpY3ksXG4gIFBhcmVudFdvcmtmbG93SW5mbyxcbiAgU3RhY2tUcmFjZVNES0luZm8sXG4gIFN0YWNrVHJhY2UsXG4gIFVuc2FmZVdvcmtmbG93SW5mbyxcbiAgV29ya2Zsb3dJbmZvLFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuZXhwb3J0IHsgcHJveHlTaW5rcywgU2luaywgU2lua0NhbGwsIFNpbmtGdW5jdGlvbiwgU2lua3MgfSBmcm9tICcuL3NpbmtzJztcbmV4cG9ydCB7IGxvZyB9IGZyb20gJy4vbG9ncyc7XG5leHBvcnQgeyBUcmlnZ2VyIH0gZnJvbSAnLi90cmlnZ2VyJztcbmV4cG9ydCAqIGZyb20gJy4vd29ya2Zsb3cnO1xuZXhwb3J0IHsgQ2hpbGRXb3JrZmxvd0hhbmRsZSwgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSB9IGZyb20gJy4vd29ya2Zsb3ctaGFuZGxlJztcblxuLy8gQW55dGhpbmcgYmVsb3cgdGhpcyBsaW5lIGlzIGRlcHJlY2F0ZWRcblxuZXhwb3J0IHtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIERvIG5vdCB1c2UgTG9nZ2VyU2lua3MgZGlyZWN0bHkuIFRvIGxvZyBmcm9tIFdvcmtmbG93IGNvZGUsIHVzZSB0aGUgYGxvZ2Agb2JqZWN0XG4gICAqICAgICAgICAgICAgIGV4cG9ydGVkIGJ5IHRoZSBgQHRlbXBvcmFsaW8vd29ya2Zsb3dgIHBhY2thZ2UuIFRvIGNhcHR1cmUgbG9nIG1lc3NhZ2VzIGVtaXR0ZWRcbiAgICogICAgICAgICAgICAgYnkgV29ya2Zsb3cgY29kZSwgc2V0IHRoZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IHByb3BlcnR5LlxuICAgKi9cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG4gIExvZ2dlclNpbmtzRGVwcmVjYXRlZCBhcyBMb2dnZXJTaW5rcyxcbn0gZnJvbSAnLi9sb2dzJztcbiIsIi8qKlxuICogVHlwZSBkZWZpbml0aW9ucyBhbmQgZ2VuZXJpYyBoZWxwZXJzIGZvciBpbnRlcmNlcHRvcnMuXG4gKlxuICogVGhlIFdvcmtmbG93IHNwZWNpZmljIGludGVyY2VwdG9ycyBhcmUgZGVmaW5lZCBoZXJlLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgeyBBY3Rpdml0eU9wdGlvbnMsIEhlYWRlcnMsIExvY2FsQWN0aXZpdHlPcHRpb25zLCBOZXh0LCBUaW1lc3RhbXAsIFdvcmtmbG93RXhlY3V0aW9uIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB0eXBlIHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzLCBDb250aW51ZUFzTmV3T3B0aW9ucyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCB7IE5leHQsIEhlYWRlcnMgfTtcblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmV4ZWN1dGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dFeGVjdXRlSW5wdXQge1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5oYW5kbGVVcGRhdGUgYW5kXG4gKiBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLnZhbGlkYXRlVXBkYXRlICovXG5leHBvcnQgaW50ZXJmYWNlIFVwZGF0ZUlucHV0IHtcbiAgcmVhZG9ubHkgdXBkYXRlSWQ6IHN0cmluZztcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5oYW5kbGVTaWduYWwgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmFsSW5wdXQge1xuICByZWFkb25seSBzaWduYWxOYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmhhbmRsZVF1ZXJ5ICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXJ5SW5wdXQge1xuICByZWFkb25seSBxdWVyeUlkOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHF1ZXJ5TmFtZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKlxuICogSW1wbGVtZW50IGFueSBvZiB0aGVzZSBtZXRob2RzIHRvIGludGVyY2VwdCBXb3JrZmxvdyBpbmJvdW5kIGNhbGxzIGxpa2UgZXhlY3V0aW9uLCBhbmQgc2lnbmFsIGFuZCBxdWVyeSBoYW5kbGluZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IGV4ZWN1dGUgbWV0aG9kIGlzIGNhbGxlZFxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgV29ya2Zsb3cgZXhlY3V0aW9uXG4gICAqL1xuICBleGVjdXRlPzogKGlucHV0OiBXb3JrZmxvd0V4ZWN1dGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnZXhlY3V0ZSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xuXG4gIC8qKiBDYWxsZWQgd2hlbiBVcGRhdGUgaGFuZGxlciBpcyBjYWxsZWRcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIFVwZGF0ZVxuICAgKi9cbiAgaGFuZGxlVXBkYXRlPzogKGlucHV0OiBVcGRhdGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnaGFuZGxlVXBkYXRlJz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqIENhbGxlZCB3aGVuIHVwZGF0ZSB2YWxpZGF0b3IgY2FsbGVkICovXG4gIHZhbGlkYXRlVXBkYXRlPzogKGlucHV0OiBVcGRhdGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAndmFsaWRhdGVVcGRhdGUnPikgPT4gdm9pZDtcblxuICAvKiogQ2FsbGVkIHdoZW4gc2lnbmFsIGlzIGRlbGl2ZXJlZCB0byBhIFdvcmtmbG93IGV4ZWN1dGlvbiAqL1xuICBoYW5kbGVTaWduYWw/OiAoaW5wdXQ6IFNpZ25hbElucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdoYW5kbGVTaWduYWwnPikgPT4gUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBXb3JrZmxvdyBpcyBxdWVyaWVkXG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBxdWVyeVxuICAgKi9cbiAgaGFuZGxlUXVlcnk/OiAoaW5wdXQ6IFF1ZXJ5SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2hhbmRsZVF1ZXJ5Jz4pID0+IFByb21pc2U8dW5rbm93bj47XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc2NoZWR1bGVBY3Rpdml0eSAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3Rpdml0eUlucHV0IHtcbiAgcmVhZG9ubHkgYWN0aXZpdHlUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgb3B0aW9uczogQWN0aXZpdHlPcHRpb25zO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zY2hlZHVsZUxvY2FsQWN0aXZpdHkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxBY3Rpdml0eUlucHV0IHtcbiAgcmVhZG9ubHkgYWN0aXZpdHlUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgb3B0aW9uczogTG9jYWxBY3Rpdml0eU9wdGlvbnM7XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xuICByZWFkb25seSBvcmlnaW5hbFNjaGVkdWxlVGltZT86IFRpbWVzdGFtcDtcbiAgcmVhZG9ubHkgYXR0ZW1wdDogbnVtYmVyO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCB7XG4gIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nO1xuICByZWFkb25seSBvcHRpb25zOiBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cztcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc3RhcnRUaW1lciAqL1xuZXhwb3J0IGludGVyZmFjZSBUaW1lcklucHV0IHtcbiAgcmVhZG9ubHkgZHVyYXRpb25NczogbnVtYmVyO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBTYW1lIGFzIENvbnRpbnVlQXNOZXdPcHRpb25zIGJ1dCB3b3JrZmxvd1R5cGUgbXVzdCBiZSBkZWZpbmVkXG4gKi9cbmV4cG9ydCB0eXBlIENvbnRpbnVlQXNOZXdJbnB1dE9wdGlvbnMgPSBDb250aW51ZUFzTmV3T3B0aW9ucyAmIFJlcXVpcmVkPFBpY2s8Q29udGludWVBc05ld09wdGlvbnMsICd3b3JrZmxvd1R5cGUnPj47XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3IuY29udGludWVBc05ldyAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250aW51ZUFzTmV3SW5wdXQge1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IENvbnRpbnVlQXNOZXdJbnB1dE9wdGlvbnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc2lnbmFsV29ya2Zsb3cgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmFsV29ya2Zsb3dJbnB1dCB7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xuICByZWFkb25seSBzaWduYWxOYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgdGFyZ2V0OlxuICAgIHwge1xuICAgICAgICByZWFkb25seSB0eXBlOiAnZXh0ZXJuYWwnO1xuICAgICAgICByZWFkb25seSB3b3JrZmxvd0V4ZWN1dGlvbjogV29ya2Zsb3dFeGVjdXRpb247XG4gICAgICB9XG4gICAgfCB7XG4gICAgICAgIHJlYWRvbmx5IHR5cGU6ICdjaGlsZCc7XG4gICAgICAgIHJlYWRvbmx5IGNoaWxkV29ya2Zsb3dJZDogc3RyaW5nO1xuICAgICAgfTtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5nZXRMb2dBdHRyaWJ1dGVzICovXG5leHBvcnQgdHlwZSBHZXRMb2dBdHRyaWJ1dGVzSW5wdXQgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuLyoqXG4gKiBJbXBsZW1lbnQgYW55IG9mIHRoZXNlIG1ldGhvZHMgdG8gaW50ZXJjZXB0IFdvcmtmbG93IGNvZGUgY2FsbHMgdG8gdGhlIFRlbXBvcmFsIEFQSXMsIGxpa2Ugc2NoZWR1bGluZyBhbiBhY3Rpdml0eSBhbmQgc3RhcnRpbmcgYSB0aW1lclxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHNjaGVkdWxlcyBhbiBBY3Rpdml0eVxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgYWN0aXZpdHkgZXhlY3V0aW9uXG4gICAqL1xuICBzY2hlZHVsZUFjdGl2aXR5PzogKGlucHV0OiBBY3Rpdml0eUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzY2hlZHVsZUFjdGl2aXR5Jz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHNjaGVkdWxlcyBhIGxvY2FsIEFjdGl2aXR5XG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBhY3Rpdml0eSBleGVjdXRpb25cbiAgICovXG4gIHNjaGVkdWxlTG9jYWxBY3Rpdml0eT86IChpbnB1dDogTG9jYWxBY3Rpdml0eUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzY2hlZHVsZUxvY2FsQWN0aXZpdHknPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc3RhcnRzIGEgdGltZXJcbiAgICovXG4gIHN0YXJ0VGltZXI/OiAoaW5wdXQ6IFRpbWVySW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3N0YXJ0VGltZXInPikgPT4gUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgY2FsbHMgY29udGludWVBc05ld1xuICAgKi9cbiAgY29udGludWVBc05ldz86IChpbnB1dDogQ29udGludWVBc05ld0lucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdjb250aW51ZUFzTmV3Jz4pID0+IFByb21pc2U8bmV2ZXI+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzaWduYWxzIGEgY2hpbGQgb3IgZXh0ZXJuYWwgV29ya2Zsb3dcbiAgICovXG4gIHNpZ25hbFdvcmtmbG93PzogKGlucHV0OiBTaWduYWxXb3JrZmxvd0lucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzaWduYWxXb3JrZmxvdyc+KSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzdGFydHMgYSBjaGlsZCB3b3JrZmxvdyBleGVjdXRpb24sIHRoZSBpbnRlcmNlcHRvciBmdW5jdGlvbiByZXR1cm5zIDIgcHJvbWlzZXM6XG4gICAqXG4gICAqIC0gVGhlIGZpcnN0IHJlc29sdmVzIHdpdGggdGhlIGBydW5JZGAgd2hlbiB0aGUgY2hpbGQgd29ya2Zsb3cgaGFzIHN0YXJ0ZWQgb3IgcmVqZWN0cyBpZiBmYWlsZWQgdG8gc3RhcnQuXG4gICAqIC0gVGhlIHNlY29uZCByZXNvbHZlcyB3aXRoIHRoZSB3b3JrZmxvdyByZXN1bHQgd2hlbiB0aGUgY2hpbGQgd29ya2Zsb3cgY29tcGxldGVzIG9yIHJlamVjdHMgb24gZmFpbHVyZS5cbiAgICovXG4gIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbj86IChcbiAgICBpbnB1dDogU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQsXG4gICAgbmV4dDogTmV4dDx0aGlzLCAnc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uJz5cbiAgKSA9PiBQcm9taXNlPFtQcm9taXNlPHN0cmluZz4sIFByb21pc2U8dW5rbm93bj5dPjtcblxuICAvKipcbiAgICogQ2FsbGVkIG9uIGVhY2ggaW52b2NhdGlvbiBvZiB0aGUgYHdvcmtmbG93LmxvZ2AgbWV0aG9kcy5cbiAgICpcbiAgICogVGhlIGF0dHJpYnV0ZXMgcmV0dXJuZWQgaW4gdGhpcyBjYWxsIGFyZSBhdHRhY2hlZCB0byBldmVyeSBsb2cgbWVzc2FnZS5cbiAgICovXG4gIGdldExvZ0F0dHJpYnV0ZXM/OiAoaW5wdXQ6IEdldExvZ0F0dHJpYnV0ZXNJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnZ2V0TG9nQXR0cmlidXRlcyc+KSA9PiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmNvbmNsdWRlQWN0aXZhdGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb25jbHVkZUFjdGl2YXRpb25JbnB1dCB7XG4gIGNvbW1hbmRzOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmRbXTtcbn1cblxuLyoqIE91dHB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5jb25jbHVkZUFjdGl2YXRpb24gKi9cbmV4cG9ydCB0eXBlIENvbmNsdWRlQWN0aXZhdGlvbk91dHB1dCA9IENvbmNsdWRlQWN0aXZhdGlvbklucHV0O1xuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3IuYWN0aXZhdGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZhdGVJbnB1dCB7XG4gIGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uO1xuICBiYXRjaEluZGV4OiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5kaXNwb3NlICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LW9iamVjdC10eXBlXG5leHBvcnQgaW50ZXJmYWNlIERpc3Bvc2VJbnB1dCB7fVxuXG4vKipcbiAqIEludGVyY2VwdG9yIGZvciB0aGUgaW50ZXJuYWxzIG9mIHRoZSBXb3JrZmxvdyBydW50aW1lLlxuICpcbiAqIFVzZSB0byBtYW5pcHVsYXRlIG9yIHRyYWNlIFdvcmtmbG93IGFjdGl2YXRpb25zLlxuICpcbiAqIEBleHBlcmltZW50YWwgVGhpcyBBUEkgaXMgZm9yIGFkdmFuY2VkIHVzZSBjYXNlcyBhbmQgbWF5IGNoYW5nZSBpbiB0aGUgZnV0dXJlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIFdvcmtmbG93IHJ1bnRpbWUgcnVucyBhIFdvcmtmbG93QWN0aXZhdGlvbkpvYi5cbiAgICovXG4gIGFjdGl2YXRlPyhpbnB1dDogQWN0aXZhdGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnYWN0aXZhdGUnPik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIENhbGxlZCBhZnRlciBhbGwgYFdvcmtmbG93QWN0aXZhdGlvbkpvYmBzIGhhdmUgYmVlbiBwcm9jZXNzZWQgZm9yIGFuIGFjdGl2YXRpb24uXG4gICAqXG4gICAqIENhbiBtYW5pcHVsYXRlIHRoZSBjb21tYW5kcyBnZW5lcmF0ZWQgYnkgdGhlIFdvcmtmbG93XG4gICAqL1xuICBjb25jbHVkZUFjdGl2YXRpb24/KGlucHV0OiBDb25jbHVkZUFjdGl2YXRpb25JbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnY29uY2x1ZGVBY3RpdmF0aW9uJz4pOiBDb25jbHVkZUFjdGl2YXRpb25PdXRwdXQ7XG5cbiAgLyoqXG4gICAqIENhbGxlZCBiZWZvcmUgZGlzcG9zaW5nIHRoZSBXb3JrZmxvdyBpc29sYXRlIGNvbnRleHQuXG4gICAqXG4gICAqIEltcGxlbWVudCB0aGlzIG1ldGhvZCB0byBwZXJmb3JtIGFueSByZXNvdXJjZSBjbGVhbnVwLlxuICAgKi9cbiAgZGlzcG9zZT8oaW5wdXQ6IERpc3Bvc2VJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnZGlzcG9zZSc+KTogdm9pZDtcbn1cblxuLyoqXG4gKiBBIG1hcHBpbmcgZnJvbSBpbnRlcmNlcHRvciB0eXBlIHRvIGFuIG9wdGlvbmFsIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbnRlcmNlcHRvcnMge1xuICBpbmJvdW5kPzogV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvcltdO1xuICBvdXRib3VuZD86IFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yW107XG4gIGludGVybmFscz86IFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3JbXTtcbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB7QGxpbmsgV29ya2Zsb3dJbnRlcmNlcHRvcnN9IGFuZCB0YWtlcyBubyBhcmd1bWVudHMuXG4gKlxuICogV29ya2Zsb3cgaW50ZXJjZXB0b3IgbW9kdWxlcyBzaG91bGQgZXhwb3J0IGFuIGBpbnRlcmNlcHRvcnNgIGZ1bmN0aW9uIG9mIHRoaXMgdHlwZS5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGBgYHRzXG4gKiBleHBvcnQgZnVuY3Rpb24gaW50ZXJjZXB0b3JzKCk6IFdvcmtmbG93SW50ZXJjZXB0b3JzIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICBpbmJvdW5kOiBbXSwgICAvLyBQb3B1bGF0ZSB3aXRoIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKiAgICAgb3V0Ym91bmQ6IFtdLCAgLy8gUG9wdWxhdGUgd2l0aCBsaXN0IG9mIGludGVyY2VwdG9yIGltcGxlbWVudGF0aW9uc1xuICogICAgIGludGVybmFsczogW10sIC8vIFBvcHVsYXRlIHdpdGggbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqICAgfTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBXb3JrZmxvd0ludGVyY2VwdG9yc0ZhY3RvcnkgPSAoKSA9PiBXb3JrZmxvd0ludGVyY2VwdG9ycztcbiIsImltcG9ydCB0eXBlIHsgUmF3U291cmNlTWFwIH0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQge1xuICBSZXRyeVBvbGljeSxcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBDb21tb25Xb3JrZmxvd09wdGlvbnMsXG4gIEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LFxuICBTZWFyY2hBdHRyaWJ1dGVzLFxuICBTaWduYWxEZWZpbml0aW9uLFxuICBVcGRhdGVEZWZpbml0aW9uLFxuICBRdWVyeURlZmluaXRpb24sXG4gIER1cmF0aW9uLFxuICBWZXJzaW9uaW5nSW50ZW50LFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBtYWtlUHJvdG9FbnVtQ29udmVydGVycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJuYWwtd29ya2Zsb3cvZW51bXMtaGVscGVycyc7XG5pbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5cbi8qKlxuICogV29ya2Zsb3cgRXhlY3V0aW9uIGluZm9ybWF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbmZvIHtcbiAgLyoqXG4gICAqIElEIG9mIHRoZSBXb3JrZmxvdywgdGhpcyBjYW4gYmUgc2V0IGJ5IHRoZSBjbGllbnQgZHVyaW5nIFdvcmtmbG93IGNyZWF0aW9uLlxuICAgKiBBIHNpbmdsZSBXb3JrZmxvdyBtYXkgcnVuIG11bHRpcGxlIHRpbWVzIGUuZy4gd2hlbiBzY2hlZHVsZWQgd2l0aCBjcm9uLlxuICAgKi9cbiAgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBJRCBvZiBhIHNpbmdsZSBXb3JrZmxvdyBydW5cbiAgICovXG4gIHJlYWRvbmx5IHJ1bklkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFdvcmtmbG93IGZ1bmN0aW9uJ3MgbmFtZVxuICAgKi9cbiAgcmVhZG9ubHkgd29ya2Zsb3dUeXBlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEluZGV4ZWQgaW5mb3JtYXRpb24gYXR0YWNoZWQgdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvblxuICAgKlxuICAgKiBUaGlzIHZhbHVlIG1heSBjaGFuZ2UgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqL1xuICByZWFkb25seSBzZWFyY2hBdHRyaWJ1dGVzOiBTZWFyY2hBdHRyaWJ1dGVzO1xuXG4gIC8qKlxuICAgKiBOb24taW5kZXhlZCBpbmZvcm1hdGlvbiBhdHRhY2hlZCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uXG4gICAqL1xuICByZWFkb25seSBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLyoqXG4gICAqIFBhcmVudCBXb3JrZmxvdyBpbmZvIChwcmVzZW50IGlmIHRoaXMgaXMgYSBDaGlsZCBXb3JrZmxvdylcbiAgICovXG4gIHJlYWRvbmx5IHBhcmVudD86IFBhcmVudFdvcmtmbG93SW5mbztcblxuICAvKipcbiAgICogUmVzdWx0IGZyb20gdGhlIHByZXZpb3VzIFJ1biAocHJlc2VudCBpZiB0aGlzIGlzIGEgQ3JvbiBXb3JrZmxvdyBvciB3YXMgQ29udGludWVkIEFzIE5ldykuXG4gICAqXG4gICAqIEFuIGFycmF5IG9mIHZhbHVlcywgc2luY2Ugb3RoZXIgU0RLcyBtYXkgcmV0dXJuIG11bHRpcGxlIHZhbHVlcyBmcm9tIGEgV29ya2Zsb3cuXG4gICAqL1xuICByZWFkb25seSBsYXN0UmVzdWx0PzogdW5rbm93bjtcblxuICAvKipcbiAgICogRmFpbHVyZSBmcm9tIHRoZSBwcmV2aW91cyBSdW4gKHByZXNlbnQgd2hlbiB0aGlzIFJ1biBpcyBhIHJldHJ5LCBvciB0aGUgbGFzdCBSdW4gb2YgYSBDcm9uIFdvcmtmbG93IGZhaWxlZClcbiAgICovXG4gIHJlYWRvbmx5IGxhc3RGYWlsdXJlPzogVGVtcG9yYWxGYWlsdXJlO1xuXG4gIC8qKlxuICAgKiBMZW5ndGggb2YgV29ya2Zsb3cgaGlzdG9yeSB1cCB1bnRpbCB0aGUgY3VycmVudCBXb3JrZmxvdyBUYXNrLlxuICAgKlxuICAgKiBUaGlzIHZhbHVlIGNoYW5nZXMgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqXG4gICAqIFlvdSBtYXkgc2FmZWx5IHVzZSB0aGlzIGluZm9ybWF0aW9uIHRvIGRlY2lkZSB3aGVuIHRvIHtAbGluayBjb250aW51ZUFzTmV3fS5cbiAgICovXG4gIHJlYWRvbmx5IGhpc3RvcnlMZW5ndGg6IG51bWJlcjtcblxuICAvKipcbiAgICogU2l6ZSBvZiBXb3JrZmxvdyBoaXN0b3J5IGluIGJ5dGVzIHVudGlsIHRoZSBjdXJyZW50IFdvcmtmbG93IFRhc2suXG4gICAqXG4gICAqIFRoaXMgdmFsdWUgY2hhbmdlcyBkdXJpbmcgdGhlIGxpZmV0aW1lIG9mIGFuIEV4ZWN1dGlvbi5cbiAgICpcbiAgICogU3VwcG9ydGVkIG9ubHkgb24gVGVtcG9yYWwgU2VydmVyIDEuMjArLCBhbHdheXMgemVybyBvbiBvbGRlciBzZXJ2ZXJzLlxuICAgKlxuICAgKiBZb3UgbWF5IHNhZmVseSB1c2UgdGhpcyBpbmZvcm1hdGlvbiB0byBkZWNpZGUgd2hlbiB0byB7QGxpbmsgY29udGludWVBc05ld30uXG4gICAqL1xuICByZWFkb25seSBoaXN0b3J5U2l6ZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBBIGhpbnQgcHJvdmlkZWQgYnkgdGhlIGN1cnJlbnQgV29ya2Zsb3dUYXNrU3RhcnRlZCBldmVudCByZWNvbW1lbmRpbmcgd2hldGhlciB0b1xuICAgKiB7QGxpbmsgY29udGludWVBc05ld30uXG4gICAqXG4gICAqIFRoaXMgdmFsdWUgY2hhbmdlcyBkdXJpbmcgdGhlIGxpZmV0aW1lIG9mIGFuIEV4ZWN1dGlvbi5cbiAgICpcbiAgICogU3VwcG9ydGVkIG9ubHkgb24gVGVtcG9yYWwgU2VydmVyIDEuMjArLCBhbHdheXMgYGZhbHNlYCBvbiBvbGRlciBzZXJ2ZXJzLlxuICAgKi9cbiAgcmVhZG9ubHkgY29udGludWVBc05ld1N1Z2dlc3RlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogVGFzayBxdWV1ZSB0aGlzIFdvcmtmbG93IGlzIGV4ZWN1dGluZyBvblxuICAgKi9cbiAgcmVhZG9ubHkgdGFza1F1ZXVlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIE5hbWVzcGFjZSB0aGlzIFdvcmtmbG93IGlzIGV4ZWN1dGluZyBpblxuICAgKi9cbiAgcmVhZG9ubHkgbmFtZXNwYWNlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFJ1biBJZCBvZiB0aGUgZmlyc3QgUnVuIGluIHRoaXMgRXhlY3V0aW9uIENoYWluXG4gICAqL1xuICByZWFkb25seSBmaXJzdEV4ZWN1dGlvblJ1bklkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBsYXN0IFJ1biBJZCBpbiB0aGlzIEV4ZWN1dGlvbiBDaGFpblxuICAgKi9cbiAgcmVhZG9ubHkgY29udGludWVkRnJvbUV4ZWN1dGlvblJ1bklkPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaW1lIGF0IHdoaWNoIHRoaXMgW1dvcmtmbG93IEV4ZWN1dGlvbiBDaGFpbl0oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3dvcmtmbG93cyN3b3JrZmxvdy1leGVjdXRpb24tY2hhaW4pIHdhcyBzdGFydGVkXG4gICAqL1xuICByZWFkb25seSBzdGFydFRpbWU6IERhdGU7XG5cbiAgLyoqXG4gICAqIFRpbWUgYXQgd2hpY2ggdGhlIGN1cnJlbnQgV29ya2Zsb3cgUnVuIHN0YXJ0ZWRcbiAgICovXG4gIHJlYWRvbmx5IHJ1blN0YXJ0VGltZTogRGF0ZTtcblxuICAvKipcbiAgICogTWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24gaXMgYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIFNlcnZlci4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93RXhlY3V0aW9uVGltZW91dH0uXG4gICAqL1xuICByZWFkb25seSBleGVjdXRpb25UaW1lb3V0TXM/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRpbWUgYXQgd2hpY2ggdGhlIFdvcmtmbG93IEV4ZWN1dGlvbiBleHBpcmVzXG4gICAqL1xuICByZWFkb25seSBleGVjdXRpb25FeHBpcmF0aW9uVGltZT86IERhdGU7XG5cbiAgLyoqXG4gICAqIE1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgV29ya2Zsb3cgUnVuIGlzIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBTZXJ2ZXIuIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd1J1blRpbWVvdXR9LlxuICAgKi9cbiAgcmVhZG9ubHkgcnVuVGltZW91dE1zPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIGV4ZWN1dGlvbiB0aW1lIG9mIGEgV29ya2Zsb3cgVGFzayBpbiBtaWxsaXNlY29uZHMuIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd1Rhc2tUaW1lb3V0fS5cbiAgICovXG4gIHJlYWRvbmx5IHRhc2tUaW1lb3V0TXM6IG51bWJlcjtcblxuICAvKipcbiAgICogUmV0cnkgUG9saWN5IGZvciB0aGlzIEV4ZWN1dGlvbi4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLnJldHJ5fS5cbiAgICovXG4gIHJlYWRvbmx5IHJldHJ5UG9saWN5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBhdCAxIGFuZCBpbmNyZW1lbnRzIGZvciBldmVyeSByZXRyeSBpZiB0aGVyZSBpcyBhIGByZXRyeVBvbGljeWBcbiAgICovXG4gIHJlYWRvbmx5IGF0dGVtcHQ6IG51bWJlcjtcblxuICAvKipcbiAgICogQ3JvbiBTY2hlZHVsZSBmb3IgdGhpcyBFeGVjdXRpb24uIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy5jcm9uU2NoZWR1bGV9LlxuICAgKi9cbiAgcmVhZG9ubHkgY3JvblNjaGVkdWxlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBNaWxsaXNlY29uZHMgYmV0d2VlbiBDcm9uIFJ1bnNcbiAgICovXG4gIHJlYWRvbmx5IGNyb25TY2hlZHVsZVRvU2NoZWR1bGVJbnRlcnZhbD86IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIEJ1aWxkIElEIG9mIHRoZSB3b3JrZXIgd2hpY2ggZXhlY3V0ZWQgdGhlIGN1cnJlbnQgV29ya2Zsb3cgVGFzay4gTWF5IGJlIHVuZGVmaW5lZCBpZiB0aGVcbiAgICogdGFzayB3YXMgY29tcGxldGVkIGJ5IGEgd29ya2VyIHdpdGhvdXQgYSBCdWlsZCBJRC4gSWYgdGhpcyB3b3JrZXIgaXMgdGhlIG9uZSBleGVjdXRpbmcgdGhpc1xuICAgKiB0YXNrIGZvciB0aGUgZmlyc3QgdGltZSBhbmQgaGFzIGEgQnVpbGQgSUQgc2V0LCB0aGVuIGl0cyBJRCB3aWxsIGJlIHVzZWQuIFRoaXMgdmFsdWUgbWF5IGNoYW5nZVxuICAgKiBvdmVyIHRoZSBsaWZldGltZSBvZiB0aGUgd29ya2Zsb3cgcnVuLCBidXQgaXMgZGV0ZXJtaW5pc3RpYyBhbmQgc2FmZSB0byB1c2UgZm9yIGJyYW5jaGluZy5cbiAgICovXG4gIHJlYWRvbmx5IGN1cnJlbnRCdWlsZElkPzogc3RyaW5nO1xuXG4gIHJlYWRvbmx5IHVuc2FmZTogVW5zYWZlV29ya2Zsb3dJbmZvO1xufVxuXG4vKipcbiAqIFVuc2FmZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBXb3JrZmxvdyBFeGVjdXRpb24uXG4gKlxuICogTmV2ZXIgcmVseSBvbiB0aGlzIGluZm9ybWF0aW9uIGluIFdvcmtmbG93IGxvZ2ljIGFzIGl0IHdpbGwgY2F1c2Ugbm9uLWRldGVybWluaXN0aWMgYmVoYXZpb3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVW5zYWZlV29ya2Zsb3dJbmZvIHtcbiAgLyoqXG4gICAqIEN1cnJlbnQgc3lzdGVtIHRpbWUgaW4gbWlsbGlzZWNvbmRzXG4gICAqXG4gICAqIFRoZSBzYWZlIHZlcnNpb24gb2YgdGltZSBpcyBgbmV3IERhdGUoKWAgYW5kIGBEYXRlLm5vdygpYCwgd2hpY2ggYXJlIHNldCBvbiB0aGUgZmlyc3QgaW52b2NhdGlvbiBvZiBhIFdvcmtmbG93XG4gICAqIFRhc2sgYW5kIHN0YXkgY29uc3RhbnQgZm9yIHRoZSBkdXJhdGlvbiBvZiB0aGUgVGFzayBhbmQgZHVyaW5nIHJlcGxheS5cbiAgICovXG4gIHJlYWRvbmx5IG5vdzogKCkgPT4gbnVtYmVyO1xuXG4gIHJlYWRvbmx5IGlzUmVwbGF5aW5nOiBib29sZWFuO1xufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IGEgd29ya2Zsb3cgdXBkYXRlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVwZGF0ZUluZm8ge1xuICAvKipcbiAgICogIEEgd29ya2Zsb3ctdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgdXBkYXRlLlxuICAgKi9cbiAgcmVhZG9ubHkgaWQ6IHN0cmluZztcblxuICAvKipcbiAgICogIFRoZSB1cGRhdGUgdHlwZSBuYW1lLlxuICAgKi9cbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhcmVudFdvcmtmbG93SW5mbyB7XG4gIHdvcmtmbG93SWQ6IHN0cmluZztcbiAgcnVuSWQ6IHN0cmluZztcbiAgbmFtZXNwYWNlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogTm90IGFuIGFjdHVhbCBlcnJvciwgdXNlZCBieSB0aGUgV29ya2Zsb3cgcnVudGltZSB0byBhYm9ydCBleGVjdXRpb24gd2hlbiB7QGxpbmsgY29udGludWVBc05ld30gaXMgY2FsbGVkXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQ29udGludWVBc05ldycpXG5leHBvcnQgY2xhc3MgQ29udGludWVBc05ldyBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGNvbW1hbmQ6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSUNvbnRpbnVlQXNOZXdXb3JrZmxvd0V4ZWN1dGlvbikge1xuICAgIHN1cGVyKCdXb3JrZmxvdyBjb250aW51ZWQgYXMgbmV3Jyk7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciBjb250aW51aW5nIGEgV29ya2Zsb3cgYXMgbmV3XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGludWVBc05ld09wdGlvbnMge1xuICAvKipcbiAgICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBXb3JrZmxvdyB0eXBlIG5hbWUsIGUuZy4gdGhlIGZpbGVuYW1lIGluIHRoZSBOb2RlLmpzIFNESyBvciBjbGFzcyBuYW1lIGluIEphdmFcbiAgICovXG4gIHdvcmtmbG93VHlwZT86IHN0cmluZztcbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgdG8gY29udGludWUgdGhlIFdvcmtmbG93IGluXG4gICAqL1xuICB0YXNrUXVldWU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaW1lb3V0IGZvciB0aGUgZW50aXJlIFdvcmtmbG93IHJ1blxuICAgKiBAZm9ybWF0IHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1J1blRpbWVvdXQ/OiBEdXJhdGlvbjtcbiAgLyoqXG4gICAqIFRpbWVvdXQgZm9yIGEgc2luZ2xlIFdvcmtmbG93IHRhc2tcbiAgICogQGZvcm1hdCB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dUYXNrVGltZW91dD86IER1cmF0aW9uO1xuICAvKipcbiAgICogTm9uLXNlYXJjaGFibGUgYXR0cmlidXRlcyB0byBhdHRhY2ggdG8gbmV4dCBXb3JrZmxvdyBydW5cbiAgICovXG4gIG1lbW8/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgLyoqXG4gICAqIFNlYXJjaGFibGUgYXR0cmlidXRlcyB0byBhdHRhY2ggdG8gbmV4dCBXb3JrZmxvdyBydW5cbiAgICovXG4gIHNlYXJjaEF0dHJpYnV0ZXM/OiBTZWFyY2hBdHRyaWJ1dGVzO1xuICAvKipcbiAgICogV2hlbiB1c2luZyB0aGUgV29ya2VyIFZlcnNpb25pbmcgZmVhdHVyZSwgc3BlY2lmaWVzIHdoZXRoZXIgdGhpcyBXb3JrZmxvdyBzaG91bGRcbiAgICogQ29udGludWUtYXMtTmV3IG9udG8gYSB3b3JrZXIgd2l0aCBhIGNvbXBhdGlibGUgQnVpbGQgSWQgb3Igbm90LiBTZWUge0BsaW5rIFZlcnNpb25pbmdJbnRlbnR9LlxuICAgKlxuICAgKiBAZGVmYXVsdCAnQ09NUEFUSUJMRSdcbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgdmVyc2lvbmluZ0ludGVudD86IFZlcnNpb25pbmdJbnRlbnQ7XG59XG5cbi8qKlxuICogU3BlY2lmaWVzOlxuICogLSB3aGV0aGVyIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBhcmUgc2VudCB0byB0aGUgQ2hpbGRcbiAqIC0gd2hldGhlciBhbmQgd2hlbiBhIHtAbGluayBDYW5jZWxlZEZhaWx1cmV9IGlzIHRocm93biBmcm9tIHtAbGluayBleGVjdXRlQ2hpbGR9IG9yXG4gKiAgIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlLnJlc3VsdH1cbiAqXG4gKiBAZGVmYXVsdCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUuV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEfVxuICovXG5leHBvcnQgdHlwZSBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSA9XG4gICh0eXBlb2YgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUpW2tleW9mIHR5cGVvZiBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZV07XG5leHBvcnQgY29uc3QgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUgPSB7XG4gIC8qKlxuICAgKiBEb24ndCBzZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLlxuICAgKi9cbiAgQUJBTkRPTjogJ0FCQU5ET04nLFxuXG4gIC8qKlxuICAgKiBTZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLiBJbW1lZGlhdGVseSB0aHJvdyB0aGUgZXJyb3IuXG4gICAqL1xuICBUUllfQ0FOQ0VMOiAnVFJZX0NBTkNFTCcsXG5cbiAgLyoqXG4gICAqIFNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuIFRoZSBDaGlsZCBtYXkgcmVzcGVjdCBjYW5jZWxsYXRpb24sIGluIHdoaWNoIGNhc2UgYW4gZXJyb3Igd2lsbCBiZSB0aHJvd25cbiAgICogd2hlbiBjYW5jZWxsYXRpb24gaGFzIGNvbXBsZXRlZCwgYW5kIHtAbGluayBpc0NhbmNlbGxhdGlvbn0oZXJyb3IpIHdpbGwgYmUgdHJ1ZS4gT24gdGhlIG90aGVyIGhhbmQsIHRoZSBDaGlsZCBtYXlcbiAgICogaWdub3JlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdCwgaW4gd2hpY2ggY2FzZSBhbiBlcnJvciBtaWdodCBiZSB0aHJvd24gd2l0aCBhIGRpZmZlcmVudCBjYXVzZSwgb3IgdGhlIENoaWxkIG1heVxuICAgKiBjb21wbGV0ZSBzdWNjZXNzZnVsbHkuXG4gICAqXG4gICAqIEBkZWZhdWx0XG4gICAqL1xuICBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUQ6ICdXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUQnLFxuXG4gIC8qKlxuICAgKiBTZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLiBUaHJvdyB0aGUgZXJyb3Igb25jZSB0aGUgU2VydmVyIHJlY2VpdmVzIHRoZSBDaGlsZCBjYW5jZWxsYXRpb24gcmVxdWVzdC5cbiAgICovXG4gIFdBSVRfQ0FOQ0VMTEFUSU9OX1JFUVVFU1RFRDogJ1dBSVRfQ0FOQ0VMTEFUSU9OX1JFUVVFU1RFRCcsXG59IGFzIGNvbnN0O1xuXG4vLyB0cy1wcnVuZS1pZ25vcmUtbmV4dFxuZXhwb3J0IGNvbnN0IFtlbmNvZGVDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSwgZGVjb2RlQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGVdID0gbWFrZVByb3RvRW51bUNvbnZlcnRlcnM8XG4gIGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsXG4gIHR5cGVvZiBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LkNoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLFxuICBrZXlvZiB0eXBlb2YgY29yZXNkay5jaGlsZF93b3JrZmxvdy5DaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSxcbiAgdHlwZW9mIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLFxuICAnJ1xuPihcbiAge1xuICAgIFtDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZS5BQkFORE9OXTogMCxcbiAgICBbQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUuVFJZX0NBTkNFTF06IDEsXG4gICAgW0NoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRF06IDIsXG4gICAgW0NoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX1JFUVVFU1RFRF06IDMsXG4gIH0gYXMgY29uc3QsXG4gICcnXG4pO1xuXG4vKipcbiAqIEhvdyBhIENoaWxkIFdvcmtmbG93IHJlYWN0cyB0byB0aGUgUGFyZW50IFdvcmtmbG93IHJlYWNoaW5nIGEgQ2xvc2VkIHN0YXRlLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWEtcGFyZW50LWNsb3NlLXBvbGljeS8gfCBQYXJlbnQgQ2xvc2UgUG9saWN5fVxuICovXG5leHBvcnQgdHlwZSBQYXJlbnRDbG9zZVBvbGljeSA9ICh0eXBlb2YgUGFyZW50Q2xvc2VQb2xpY3kpW2tleW9mIHR5cGVvZiBQYXJlbnRDbG9zZVBvbGljeV07XG5leHBvcnQgY29uc3QgUGFyZW50Q2xvc2VQb2xpY3kgPSB7XG4gIC8qKlxuICAgKiBXaGVuIHRoZSBQYXJlbnQgaXMgQ2xvc2VkLCB0aGUgQ2hpbGQgaXMgVGVybWluYXRlZC5cbiAgICpcbiAgICogQGRlZmF1bHRcbiAgICovXG4gIFRFUk1JTkFURTogJ1RFUk1JTkFURScsXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIG5vdGhpbmcgaXMgZG9uZSB0byB0aGUgQ2hpbGQuXG4gICAqL1xuICBBQkFORE9OOiAnQUJBTkRPTicsXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIHRoZSBDaGlsZCBpcyBDYW5jZWxsZWQuXG4gICAqL1xuICBSRVFVRVNUX0NBTkNFTDogJ1JFUVVFU1RfQ0FOQ0VMJyxcblxuICAvLy8gQW55dGhpbmcgYmVsb3cgdGhpcyBsaW5lIGhhcyBiZWVuIGRlcHJlY2F0ZWRcblxuICAvKipcbiAgICogSWYgYSBgUGFyZW50Q2xvc2VQb2xpY3lgIGlzIHNldCB0byB0aGlzLCBvciBpcyBub3Qgc2V0IGF0IGFsbCwgdGhlIHNlcnZlciBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZC5cbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgRWl0aGVyIGxlYXZlIHByb3BlcnR5IGB1bmRlZmluZWRgLCBvciBzZXQgYW4gZXhwbGljaXQgcG9saWN5IGluc3RlYWQuXG4gICAqL1xuICBQQVJFTlRfQ0xPU0VfUE9MSUNZX1VOU1BFQ0lGSUVEOiB1bmRlZmluZWQsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cblxuICAvKipcbiAgICogV2hlbiB0aGUgUGFyZW50IGlzIENsb3NlZCwgdGhlIENoaWxkIGlzIFRlcm1pbmF0ZWQuXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIFVzZSB7QGxpbmsgUGFyZW50Q2xvc2VQb2xpY3kuVEVSTUlOQVRFfSBpbnN0ZWFkLlxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9URVJNSU5BVEU6ICdURVJNSU5BVEUnLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIG5vdGhpbmcgaXMgZG9uZSB0byB0aGUgQ2hpbGQuXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIFVzZSB7QGxpbmsgUGFyZW50Q2xvc2VQb2xpY3kuQUJBTkRPTn0gaW5zdGVhZC5cbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfQUJBTkRPTjogJ0FCQU5ET04nLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIHRoZSBDaGlsZCBpcyBDYW5jZWxsZWQuXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIFVzZSB7QGxpbmsgUGFyZW50Q2xvc2VQb2xpY3kuUkVRVUVTVF9DQU5DRUx9IGluc3RlYWQuXG4gICAqL1xuICBQQVJFTlRfQ0xPU0VfUE9MSUNZX1JFUVVFU1RfQ0FOQ0VMOiAnUkVRVUVTVF9DQU5DRUwnLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG59IGFzIGNvbnN0O1xuXG4vLyB0cy1wcnVuZS1pZ25vcmUtbmV4dFxuZXhwb3J0IGNvbnN0IFtlbmNvZGVQYXJlbnRDbG9zZVBvbGljeSwgZGVjb2RlUGFyZW50Q2xvc2VQb2xpY3ldID0gbWFrZVByb3RvRW51bUNvbnZlcnRlcnM8XG4gIGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuUGFyZW50Q2xvc2VQb2xpY3ksXG4gIHR5cGVvZiBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlBhcmVudENsb3NlUG9saWN5LFxuICBrZXlvZiB0eXBlb2YgY29yZXNkay5jaGlsZF93b3JrZmxvdy5QYXJlbnRDbG9zZVBvbGljeSxcbiAgdHlwZW9mIFBhcmVudENsb3NlUG9saWN5LFxuICAnUEFSRU5UX0NMT1NFX1BPTElDWV8nXG4+KFxuICB7XG4gICAgW1BhcmVudENsb3NlUG9saWN5LlRFUk1JTkFURV06IDEsXG4gICAgW1BhcmVudENsb3NlUG9saWN5LkFCQU5ET05dOiAyLFxuICAgIFtQYXJlbnRDbG9zZVBvbGljeS5SRVFVRVNUX0NBTkNFTF06IDMsXG4gICAgVU5TUEVDSUZJRUQ6IDAsXG4gIH0gYXMgY29uc3QsXG4gICdQQVJFTlRfQ0xPU0VfUE9MSUNZXydcbik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hpbGRXb3JrZmxvd09wdGlvbnMgZXh0ZW5kcyBDb21tb25Xb3JrZmxvd09wdGlvbnMge1xuICAvKipcbiAgICogV29ya2Zsb3cgaWQgdG8gdXNlIHdoZW4gc3RhcnRpbmcuIElmIG5vdCBzcGVjaWZpZWQgYSBVVUlEIGlzIGdlbmVyYXRlZC4gTm90ZSB0aGF0IGl0IGlzXG4gICAqIGRhbmdlcm91cyBhcyBpbiBjYXNlIG9mIGNsaWVudCBzaWRlIHJldHJpZXMgbm8gZGVkdXBsaWNhdGlvbiB3aWxsIGhhcHBlbiBiYXNlZCBvbiB0aGVcbiAgICogZ2VuZXJhdGVkIGlkLiBTbyBwcmVmZXIgYXNzaWduaW5nIGJ1c2luZXNzIG1lYW5pbmdmdWwgaWRzIGlmIHBvc3NpYmxlLlxuICAgKi9cbiAgd29ya2Zsb3dJZD86IHN0cmluZztcblxuICAvKipcbiAgICogVGFzayBxdWV1ZSB0byB1c2UgZm9yIFdvcmtmbG93IHRhc2tzLiBJdCBzaG91bGQgbWF0Y2ggYSB0YXNrIHF1ZXVlIHNwZWNpZmllZCB3aGVuIGNyZWF0aW5nIGFcbiAgICogYFdvcmtlcmAgdGhhdCBob3N0cyB0aGUgV29ya2Zsb3cgY29kZS5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgYSBjaGlsZCBpcyBzY2hlZHVsZWQgb24gdGhlIHNhbWUgVGFzayBRdWV1ZSBhcyB0aGUgcGFyZW50LlxuICAgKi9cbiAgdGFza1F1ZXVlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXM6XG4gICAqIC0gd2hldGhlciBjYW5jZWxsYXRpb24gcmVxdWVzdHMgYXJlIHNlbnQgdG8gdGhlIENoaWxkXG4gICAqIC0gd2hldGhlciBhbmQgd2hlbiBhbiBlcnJvciBpcyB0aHJvd24gZnJvbSB7QGxpbmsgZXhlY3V0ZUNoaWxkfSBvclxuICAgKiAgIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlLnJlc3VsdH1cbiAgICpcbiAgICogQGRlZmF1bHQge0BsaW5rIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRH1cbiAgICovXG4gIGNhbmNlbGxhdGlvblR5cGU/OiBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZTtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGhvdyB0aGUgQ2hpbGQgcmVhY3RzIHRvIHRoZSBQYXJlbnQgV29ya2Zsb3cgcmVhY2hpbmcgYSBDbG9zZWQgc3RhdGUuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtAbGluayBQYXJlbnRDbG9zZVBvbGljeS5QQVJFTlRfQ0xPU0VfUE9MSUNZX1RFUk1JTkFURX1cbiAgICovXG4gIHBhcmVudENsb3NlUG9saWN5PzogUGFyZW50Q2xvc2VQb2xpY3k7XG5cbiAgLyoqXG4gICAqIFdoZW4gdXNpbmcgdGhlIFdvcmtlciBWZXJzaW9uaW5nIGZlYXR1cmUsIHNwZWNpZmllcyB3aGV0aGVyIHRoaXMgQ2hpbGQgV29ya2Zsb3cgc2hvdWxkIHJ1biBvblxuICAgKiBhIHdvcmtlciB3aXRoIGEgY29tcGF0aWJsZSBCdWlsZCBJZCBvciBub3QuIFNlZSB7QGxpbmsgVmVyc2lvbmluZ0ludGVudH0uXG4gICAqXG4gICAqIEBkZWZhdWx0ICdDT01QQVRJQkxFJ1xuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsXG4gICAqL1xuICB2ZXJzaW9uaW5nSW50ZW50PzogVmVyc2lvbmluZ0ludGVudDtcbn1cblxuZXhwb3J0IHR5cGUgUmVxdWlyZWRDaGlsZFdvcmtmbG93T3B0aW9ucyA9IFJlcXVpcmVkPFBpY2s8Q2hpbGRXb3JrZmxvd09wdGlvbnMsICd3b3JrZmxvd0lkJyB8ICdjYW5jZWxsYXRpb25UeXBlJz4+ICYge1xuICBhcmdzOiB1bmtub3duW107XG59O1xuXG5leHBvcnQgdHlwZSBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cyA9IENoaWxkV29ya2Zsb3dPcHRpb25zICYgUmVxdWlyZWRDaGlsZFdvcmtmbG93T3B0aW9ucztcblxuZXhwb3J0IGludGVyZmFjZSBTdGFja1RyYWNlU0RLSW5mbyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmVyc2lvbjogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzbGljZSBvZiBhIGZpbGUgc3RhcnRpbmcgYXQgbGluZU9mZnNldFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrVHJhY2VGaWxlU2xpY2Uge1xuICAvKipcbiAgICogT25seSB1c2VkIHBvc3NpYmxlIHRvIHRyaW0gdGhlIGZpbGUgd2l0aG91dCBicmVha2luZyBzeW50YXggaGlnaGxpZ2h0aW5nLlxuICAgKi9cbiAgbGluZV9vZmZzZXQ6IG51bWJlcjtcbiAgLyoqXG4gICAqIHNsaWNlIG9mIGEgZmlsZSB3aXRoIGBcXG5gIChuZXdsaW5lKSBsaW5lIHRlcm1pbmF0b3IuXG4gICAqL1xuICBjb250ZW50OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBwb2ludGVyIHRvIGEgbG9jYXRpb24gaW4gYSBmaWxlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhY2tUcmFjZUZpbGVMb2NhdGlvbiB7XG4gIC8qKlxuICAgKiBQYXRoIHRvIHNvdXJjZSBmaWxlIChhYnNvbHV0ZSBvciByZWxhdGl2ZSkuXG4gICAqIFdoZW4gdXNpbmcgYSByZWxhdGl2ZSBwYXRoLCBtYWtlIHN1cmUgYWxsIHBhdGhzIGFyZSByZWxhdGl2ZSB0byB0aGUgc2FtZSByb290LlxuICAgKi9cbiAgZmlsZV9wYXRoPzogc3RyaW5nO1xuICAvKipcbiAgICogSWYgcG9zc2libGUsIFNESyBzaG91bGQgc2VuZCB0aGlzLCByZXF1aXJlZCBmb3IgZGlzcGxheWluZyB0aGUgY29kZSBsb2NhdGlvbi5cbiAgICovXG4gIGxpbmU/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBJZiBwb3NzaWJsZSwgU0RLIHNob3VsZCBzZW5kIHRoaXMuXG4gICAqL1xuICBjb2x1bW4/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiBuYW1lIHRoaXMgbGluZSBiZWxvbmdzIHRvIChpZiBhcHBsaWNhYmxlKS5cbiAgICogVXNlZCBmb3IgZmFsbGluZyBiYWNrIHRvIHN0YWNrIHRyYWNlIHZpZXcuXG4gICAqL1xuICBmdW5jdGlvbl9uYW1lPzogc3RyaW5nO1xuICAvKipcbiAgICogRmxhZyB0byBtYXJrIHRoaXMgYXMgaW50ZXJuYWwgU0RLIGNvZGUgYW5kIGhpZGUgYnkgZGVmYXVsdCBpbiB0aGUgVUkuXG4gICAqL1xuICBpbnRlcm5hbF9jb2RlOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrVHJhY2Uge1xuICBsb2NhdGlvbnM6IFN0YWNrVHJhY2VGaWxlTG9jYXRpb25bXTtcbn1cblxuLyoqXG4gKiBVc2VkIGFzIHRoZSByZXN1bHQgZm9yIHRoZSBlbmhhbmNlZCBzdGFjayB0cmFjZSBxdWVyeVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVuaGFuY2VkU3RhY2tUcmFjZSB7XG4gIHNkazogU3RhY2tUcmFjZVNES0luZm87XG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIGZpbGUgcGF0aCB0byBmaWxlIGNvbnRlbnRzLlxuICAgKiBTREsgbWF5IGNob29zZSB0byBzZW5kIG5vLCBzb21lIG9yIGFsbCBzb3VyY2VzLlxuICAgKiBTb3VyY2VzIG1pZ2h0IGJlIHRyaW1tZWQsIGFuZCBzb21lIHRpbWUgb25seSB0aGUgZmlsZShzKSBvZiB0aGUgdG9wIGVsZW1lbnQgb2YgdGhlIHRyYWNlIHdpbGwgYmUgc2VudC5cbiAgICovXG4gIHNvdXJjZXM6IFJlY29yZDxzdHJpbmcsIFN0YWNrVHJhY2VGaWxlU2xpY2VbXT47XG4gIHN0YWNrczogU3RhY2tUcmFjZVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93Q3JlYXRlT3B0aW9ucyB7XG4gIGluZm86IFdvcmtmbG93SW5mbztcbiAgcmFuZG9tbmVzc1NlZWQ6IG51bWJlcltdO1xuICBub3c6IG51bWJlcjtcbiAgc2hvd1N0YWNrVHJhY2VTb3VyY2VzOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsIGV4dGVuZHMgV29ya2Zsb3dDcmVhdGVPcHRpb25zIHtcbiAgc291cmNlTWFwOiBSYXdTb3VyY2VNYXA7XG4gIHJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzOiBTZXQ8c3RyaW5nPjtcbiAgZ2V0VGltZU9mRGF5KCk6IGJpZ2ludDtcbn1cblxuLyoqXG4gKiBBIGhhbmRsZXIgZnVuY3Rpb24gY2FwYWJsZSBvZiBhY2NlcHRpbmcgdGhlIGFyZ3VtZW50cyBmb3IgYSBnaXZlbiBVcGRhdGVEZWZpbml0aW9uLCBTaWduYWxEZWZpbml0aW9uIG9yIFF1ZXJ5RGVmaW5pdGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgSGFuZGxlcjxcbiAgUmV0LFxuICBBcmdzIGV4dGVuZHMgYW55W10sXG4gIFQgZXh0ZW5kcyBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncz4gfCBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncz4sXG4+ID0gVCBleHRlbmRzIFVwZGF0ZURlZmluaXRpb248aW5mZXIgUiwgaW5mZXIgQT5cbiAgPyAoLi4uYXJnczogQSkgPT4gUiB8IFByb21pc2U8Uj5cbiAgOiBUIGV4dGVuZHMgU2lnbmFsRGVmaW5pdGlvbjxpbmZlciBBPlxuICAgID8gKC4uLmFyZ3M6IEEpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+XG4gICAgOiBUIGV4dGVuZHMgUXVlcnlEZWZpbml0aW9uPGluZmVyIFIsIGluZmVyIEE+XG4gICAgICA/ICguLi5hcmdzOiBBKSA9PiBSXG4gICAgICA6IG5ldmVyO1xuXG4vKipcbiAqIEEgaGFuZGxlciBmdW5jdGlvbiBhY2NlcHRpbmcgc2lnbmFsIGNhbGxzIGZvciBub24tcmVnaXN0ZXJlZCBzaWduYWwgbmFtZXMuXG4gKi9cbmV4cG9ydCB0eXBlIERlZmF1bHRTaWduYWxIYW5kbGVyID0gKHNpZ25hbE5hbWU6IHN0cmluZywgLi4uYXJnczogdW5rbm93bltdKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcblxuLyoqXG4gKiBBIHZhbGlkYXRpb24gZnVuY3Rpb24gY2FwYWJsZSBvZiBhY2NlcHRpbmcgdGhlIGFyZ3VtZW50cyBmb3IgYSBnaXZlbiBVcGRhdGVEZWZpbml0aW9uLlxuICovXG5leHBvcnQgdHlwZSBVcGRhdGVWYWxpZGF0b3I8QXJncyBleHRlbmRzIGFueVtdPiA9ICguLi5hcmdzOiBBcmdzKSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZGVzY3JpcHRpb24gb2YgYSBxdWVyeSBoYW5kbGVyLlxuICovXG5leHBvcnQgdHlwZSBRdWVyeUhhbmRsZXJPcHRpb25zID0geyBkZXNjcmlwdGlvbj86IHN0cmluZyB9O1xuXG4vKipcbiAqIEEgZGVzY3JpcHRpb24gb2YgYSBzaWduYWwgaGFuZGxlci5cbiAqL1xuZXhwb3J0IHR5cGUgU2lnbmFsSGFuZGxlck9wdGlvbnMgPSB7IGRlc2NyaXB0aW9uPzogc3RyaW5nOyB1bmZpbmlzaGVkUG9saWN5PzogSGFuZGxlclVuZmluaXNoZWRQb2xpY3kgfTtcblxuLyoqXG4gKiBBIHZhbGlkYXRvciBhbmQgZGVzY3JpcHRpb24gb2YgYW4gdXBkYXRlIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCB0eXBlIFVwZGF0ZUhhbmRsZXJPcHRpb25zPEFyZ3MgZXh0ZW5kcyBhbnlbXT4gPSB7XG4gIHZhbGlkYXRvcj86IFVwZGF0ZVZhbGlkYXRvcjxBcmdzPjtcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIHVuZmluaXNoZWRQb2xpY3k/OiBIYW5kbGVyVW5maW5pc2hlZFBvbGljeTtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZhdGlvbkNvbXBsZXRpb24ge1xuICBjb21tYW5kczogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JV29ya2Zsb3dDb21tYW5kW107XG4gIHVzZWRJbnRlcm5hbEZsYWdzOiBudW1iZXJbXTtcbn1cbiIsImltcG9ydCB0eXBlIHsgUmF3U291cmNlTWFwIH0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQge1xuICBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcixcbiAgRmFpbHVyZUNvbnZlcnRlcixcbiAgUGF5bG9hZENvbnZlcnRlcixcbiAgYXJyYXlGcm9tUGF5bG9hZHMsXG4gIGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBlbnN1cmVUZW1wb3JhbEZhaWx1cmUsXG4gIEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LFxuICBJbGxlZ2FsU3RhdGVFcnJvcixcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBXb3JrZmxvdyxcbiAgV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yLFxuICBXb3JrZmxvd1F1ZXJ5QW5ub3RhdGVkVHlwZSxcbiAgV29ya2Zsb3dTaWduYWxBbm5vdGF0ZWRUeXBlLFxuICBXb3JrZmxvd1VwZGF0ZUFubm90YXRlZFR5cGUsXG4gIFByb3RvRmFpbHVyZSxcbiAgQXBwbGljYXRpb25GYWlsdXJlLFxuICBXb3JrZmxvd1VwZGF0ZVR5cGUsXG4gIFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZSxcbiAgbWFwRnJvbVBheWxvYWRzLFxuICBzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLFxuICBmcm9tUGF5bG9hZHNBdEluZGV4LFxuICBTZWFyY2hBdHRyaWJ1dGVzLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IG1ha2VQcm90b0VudW1Db252ZXJ0ZXJzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcm5hbC13b3JrZmxvdyc7XG5pbXBvcnQgdHlwZSB7IGNvcmVzZGssIHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgYWxlYSwgUk5HIH0gZnJvbSAnLi9hbGVhJztcbmltcG9ydCB7IFJvb3RDYW5jZWxsYXRpb25TY29wZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IFVwZGF0ZVNjb3BlIH0gZnJvbSAnLi91cGRhdGUtc2NvcGUnO1xuaW1wb3J0IHsgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvciwgTG9jYWxBY3Rpdml0eURvQmFja29mZiwgaXNDYW5jZWxsYXRpb24gfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBRdWVyeUlucHV0LCBTaWduYWxJbnB1dCwgVXBkYXRlSW5wdXQsIFdvcmtmbG93RXhlY3V0ZUlucHV0LCBXb3JrZmxvd0ludGVyY2VwdG9ycyB9IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7XG4gIENvbnRpbnVlQXNOZXcsXG4gIERlZmF1bHRTaWduYWxIYW5kbGVyLFxuICBTdGFja1RyYWNlU0RLSW5mbyxcbiAgU3RhY2tUcmFjZUZpbGVTbGljZSxcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBTdGFja1RyYWNlRmlsZUxvY2F0aW9uLFxuICBXb3JrZmxvd0luZm8sXG4gIFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsLFxuICBBY3RpdmF0aW9uQ29tcGxldGlvbixcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IHR5cGUgU2lua0NhbGwgfSBmcm9tICcuL3NpbmtzJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCBwa2cgZnJvbSAnLi9wa2cnO1xuaW1wb3J0IHsgU2RrRmxhZywgYXNzZXJ0VmFsaWRGbGFnIH0gZnJvbSAnLi9mbGFncyc7XG5pbXBvcnQgeyBleGVjdXRlV2l0aExpZmVjeWNsZUxvZ2dpbmcsIGxvZyB9IGZyb20gJy4vbG9ncyc7XG5cbmNvbnN0IFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlID0ge1xuICBXT1JLRkxPV19BTFJFQURZX0VYSVNUUzogJ1dPUktGTE9XX0FMUkVBRFlfRVhJU1RTJyxcbn0gYXMgY29uc3Q7XG50eXBlIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlID1cbiAgKHR5cGVvZiBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSlba2V5b2YgdHlwZW9mIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlXTtcblxuY29uc3QgW19lbmNvZGVTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSwgZGVjb2RlU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2VdID1cbiAgbWFrZVByb3RvRW51bUNvbnZlcnRlcnM8XG4gICAgY29yZXNkay5jaGlsZF93b3JrZmxvdy5TdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSxcbiAgICB0eXBlb2YgY29yZXNkay5jaGlsZF93b3JrZmxvdy5TdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSxcbiAgICBrZXlvZiB0eXBlb2YgY29yZXNkay5jaGlsZF93b3JrZmxvdy5TdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSxcbiAgICB0eXBlb2YgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UsXG4gICAgJ1NUQVJUX0NISUxEX1dPUktGTE9XX0VYRUNVVElPTl9GQUlMRURfQ0FVU0VfJ1xuICA+KFxuICAgIHtcbiAgICAgIFtTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZS5XT1JLRkxPV19BTFJFQURZX0VYSVNUU106IDEsXG4gICAgICBVTlNQRUNJRklFRDogMCxcbiAgICB9IGFzIGNvbnN0LFxuICAgICdTVEFSVF9DSElMRF9XT1JLRkxPV19FWEVDVVRJT05fRkFJTEVEX0NBVVNFXydcbiAgKTtcblxuZXhwb3J0IGludGVyZmFjZSBTdGFjayB7XG4gIGZvcm1hdHRlZDogc3RyaW5nO1xuICBzdHJ1Y3R1cmVkOiBTdGFja1RyYWNlRmlsZUxvY2F0aW9uW107XG59XG5cbi8qKlxuICogR2xvYmFsIHN0b3JlIHRvIHRyYWNrIHByb21pc2Ugc3RhY2tzIGZvciBzdGFjayB0cmFjZSBxdWVyeVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb21pc2VTdGFja1N0b3JlIHtcbiAgY2hpbGRUb1BhcmVudDogTWFwPFByb21pc2U8dW5rbm93bj4sIFNldDxQcm9taXNlPHVua25vd24+Pj47XG4gIHByb21pc2VUb1N0YWNrOiBNYXA8UHJvbWlzZTx1bmtub3duPiwgU3RhY2s+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBsZXRpb24ge1xuICByZXNvbHZlKHZhbDogdW5rbm93bik6IHVua25vd247XG5cbiAgcmVqZWN0KHJlYXNvbjogdW5rbm93bik6IHVua25vd247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZGl0aW9uIHtcbiAgZm4oKTogYm9vbGVhbjtcblxuICByZXNvbHZlKCk6IHZvaWQ7XG59XG5cbmV4cG9ydCB0eXBlIEFjdGl2YXRpb25IYW5kbGVyRnVuY3Rpb248SyBleHRlbmRzIGtleW9mIGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uSm9iPiA9IChcbiAgYWN0aXZhdGlvbjogTm9uTnVsbGFibGU8Y29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Kb2JbS10+XG4pID0+IHZvaWQ7XG5cbi8qKlxuICogVmVyaWZpZXMgYWxsIGFjdGl2YXRpb24gam9iIGhhbmRsaW5nIG1ldGhvZHMgYXJlIGltcGxlbWVudGVkXG4gKi9cbmV4cG9ydCB0eXBlIEFjdGl2YXRpb25IYW5kbGVyID0ge1xuICBbUCBpbiBrZXlvZiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYl06IEFjdGl2YXRpb25IYW5kbGVyRnVuY3Rpb248UD47XG59O1xuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IGFuIHVwZGF0ZSBvciBzaWduYWwgaGFuZGxlciBleGVjdXRpb24uXG4gKi9cbmludGVyZmFjZSBNZXNzYWdlSGFuZGxlckV4ZWN1dGlvbiB7XG4gIG5hbWU6IHN0cmluZztcbiAgdW5maW5pc2hlZFBvbGljeTogSGFuZGxlclVuZmluaXNoZWRQb2xpY3k7XG4gIGlkPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEtlZXBzIGFsbCBvZiB0aGUgV29ya2Zsb3cgcnVudGltZSBzdGF0ZSBsaWtlIHBlbmRpbmcgY29tcGxldGlvbnMgZm9yIGFjdGl2aXRpZXMgYW5kIHRpbWVycy5cbiAqXG4gKiBJbXBsZW1lbnRzIGhhbmRsZXJzIGZvciBhbGwgd29ya2Zsb3cgYWN0aXZhdGlvbiBqb2JzLlxuICpcbiAqIE5vdGUgdGhhdCBtb3N0IG1ldGhvZHMgaW4gdGhpcyBjbGFzcyBhcmUgbWVhbnQgdG8gYmUgY2FsbGVkIG9ubHkgZnJvbSB3aXRoaW4gdGhlIFZNLlxuICpcbiAqIEhvd2V2ZXIsIGEgZmV3IG1ldGhvZHMgbWF5IGJlIGNhbGxlZCBkaXJlY3RseSBmcm9tIG91dHNpZGUgdGhlIFZNIChlc3NlbnRpYWxseSBmcm9tIGB2bS1zaGFyZWQudHNgKS5cbiAqIFRoZXNlIG1ldGhvZHMgYXJlIHNwZWNpZmljYWxseSBtYXJrZWQgd2l0aCBhIGNvbW1lbnQgYW5kIHJlcXVpcmUgY2FyZWZ1bCBjb25zaWRlcmF0aW9uLCBhcyB0aGVcbiAqIGV4ZWN1dGlvbiBjb250ZXh0IG1heSBub3QgcHJvcGVybHkgcmVmbGVjdCB0aGF0IG9mIHRoZSB0YXJnZXQgd29ya2Zsb3cgZXhlY3V0aW9uIChlLmcuOiB3aXRoIFJldXNhYmxlXG4gKiBWTXMsIHRoZSBgZ2xvYmFsYCBtYXkgbm90IGhhdmUgYmVlbiBzd2FwcGVkIHRvIHRob3NlIG9mIHRoYXQgd29ya2Zsb3cgZXhlY3V0aW9uOyB0aGUgYWN0aXZlIG1pY3JvdGFza1xuICogcXVldWUgbWF5IGJlIHRoYXQgb2YgdGhlIHRocmVhZC9wcm9jZXNzLCByYXRoZXIgdGhhbiB0aGUgcXVldWUgb2YgdGhhdCBWTSBjb250ZXh0OyBldGMpLiBDb25zZXF1ZW50bHksXG4gKiBtZXRob2RzIHRoYXQgYXJlIG1lYW50IHRvIGJlIGNhbGxlZCBmcm9tIG91dHNpZGUgb2YgdGhlIFZNIG11c3Qgbm90IGRvIGFueSBvZiB0aGUgZm9sbG93aW5nOlxuICpcbiAqIC0gQWNjZXNzIGFueSBnbG9iYWwgdmFyaWFibGU7XG4gKiAtIENyZWF0ZSBQcm9taXNlIG9iamVjdHMsIHVzZSBhc3luYy9hd2FpdCwgb3Igb3RoZXJ3aXNlIHNjaGVkdWxlIG1pY3JvdGFza3M7XG4gKiAtIENhbGwgdXNlci1kZWZpbmVkIGZ1bmN0aW9ucywgaW5jbHVkaW5nIGFueSBmb3JtIG9mIGludGVyY2VwdG9yLlxuICovXG5leHBvcnQgY2xhc3MgQWN0aXZhdG9yIGltcGxlbWVudHMgQWN0aXZhdGlvbkhhbmRsZXIge1xuICAvKipcbiAgICogQ2FjaGUgZm9yIG1vZHVsZXMgLSByZWZlcmVuY2VkIGluIHJldXNhYmxlLXZtLnRzXG4gICAqL1xuICByZWFkb25seSBtb2R1bGVDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCB1bmtub3duPigpO1xuICAvKipcbiAgICogTWFwIG9mIHRhc2sgc2VxdWVuY2UgdG8gYSBDb21wbGV0aW9uXG4gICAqL1xuICByZWFkb25seSBjb21wbGV0aW9ucyA9IHtcbiAgICB0aW1lcjogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgYWN0aXZpdHk6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGNoaWxkV29ya2Zsb3dTdGFydDogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgY2hpbGRXb3JrZmxvd0NvbXBsZXRlOiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBzaWduYWxXb3JrZmxvdzogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgY2FuY2VsV29ya2Zsb3c6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICB9O1xuXG4gIC8qKlxuICAgKiBIb2xkcyBidWZmZXJlZCBVcGRhdGUgY2FsbHMgdW50aWwgYSBoYW5kbGVyIGlzIHJlZ2lzdGVyZWRcbiAgICovXG4gIHJlYWRvbmx5IGJ1ZmZlcmVkVXBkYXRlcyA9IEFycmF5PGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JRG9VcGRhdGU+KCk7XG5cbiAgLyoqXG4gICAqIEhvbGRzIGJ1ZmZlcmVkIHNpZ25hbCBjYWxscyB1bnRpbCBhIGhhbmRsZXIgaXMgcmVnaXN0ZXJlZFxuICAgKi9cbiAgcmVhZG9ubHkgYnVmZmVyZWRTaWduYWxzID0gQXJyYXk8Y29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklTaWduYWxXb3JrZmxvdz4oKTtcblxuICAvKipcbiAgICogTWFwcGluZyBvZiB1cGRhdGUgbmFtZSB0byBoYW5kbGVyIGFuZCB2YWxpZGF0b3JcbiAgICovXG4gIHJlYWRvbmx5IHVwZGF0ZUhhbmRsZXJzID0gbmV3IE1hcDxzdHJpbmcsIFdvcmtmbG93VXBkYXRlQW5ub3RhdGVkVHlwZT4oKTtcblxuICAvKipcbiAgICogTWFwcGluZyBvZiBzaWduYWwgbmFtZSB0byBoYW5kbGVyXG4gICAqL1xuICByZWFkb25seSBzaWduYWxIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCBXb3JrZmxvd1NpZ25hbEFubm90YXRlZFR5cGU+KCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgaW4tcHJvZ3Jlc3MgdXBkYXRlcyB0byBoYW5kbGVyIGV4ZWN1dGlvbiBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHJlYWRvbmx5IGluUHJvZ3Jlc3NVcGRhdGVzID0gbmV3IE1hcDxzdHJpbmcsIE1lc3NhZ2VIYW5kbGVyRXhlY3V0aW9uPigpO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIGluLXByb2dyZXNzIHNpZ25hbHMgdG8gaGFuZGxlciBleGVjdXRpb24gaW5mb3JtYXRpb24uXG4gICAqL1xuICByZWFkb25seSBpblByb2dyZXNzU2lnbmFscyA9IG5ldyBNYXA8bnVtYmVyLCBNZXNzYWdlSGFuZGxlckV4ZWN1dGlvbj4oKTtcblxuICAvKipcbiAgICogQSBzZXF1ZW5jZSBudW1iZXIgcHJvdmlkaW5nIHVuaXF1ZSBpZGVudGlmaWVycyBmb3Igc2lnbmFsIGhhbmRsZXIgZXhlY3V0aW9ucy5cbiAgICovXG4gIHByb3RlY3RlZCBzaWduYWxIYW5kbGVyRXhlY3V0aW9uU2VxID0gMDtcblxuICAvKipcbiAgICogQSBzaWduYWwgaGFuZGxlciB0aGF0IGNhdGNoZXMgY2FsbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcy5cbiAgICovXG4gIGRlZmF1bHRTaWduYWxIYW5kbGVyPzogRGVmYXVsdFNpZ25hbEhhbmRsZXI7XG5cbiAgLyoqXG4gICAqIFNvdXJjZSBtYXAgZmlsZSBmb3IgbG9va2luZyB1cCB0aGUgc291cmNlIGZpbGVzIGluIHJlc3BvbnNlIHRvIF9fZW5oYW5jZWRfc3RhY2tfdHJhY2VcbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSBzb3VyY2VNYXA6IFJhd1NvdXJjZU1hcDtcblxuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdG8gc2VuZCB0aGUgc291cmNlcyBpbiBlbmhhbmNlZCBzdGFjayB0cmFjZSBxdWVyeSByZXNwb25zZXNcbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSBzaG93U3RhY2tUcmFjZVNvdXJjZXM7XG5cbiAgcmVhZG9ubHkgcHJvbWlzZVN0YWNrU3RvcmU6IFByb21pc2VTdGFja1N0b3JlID0ge1xuICAgIHByb21pc2VUb1N0YWNrOiBuZXcgTWFwKCksXG4gICAgY2hpbGRUb1BhcmVudDogbmV3IE1hcCgpLFxuICB9O1xuXG4gIHB1YmxpYyByZWFkb25seSByb290U2NvcGUgPSBuZXcgUm9vdENhbmNlbGxhdGlvblNjb3BlKCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgcXVlcnkgbmFtZSB0byBoYW5kbGVyXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcXVlcnlIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCBXb3JrZmxvd1F1ZXJ5QW5ub3RhdGVkVHlwZT4oW1xuICAgIFtcbiAgICAgICdfX3N0YWNrX3RyYWNlJyxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlcjogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldFN0YWNrVHJhY2VzKClcbiAgICAgICAgICAgIC5tYXAoKHMpID0+IHMuZm9ybWF0dGVkKVxuICAgICAgICAgICAgLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICB9LFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JldHVybnMgYSBzZW5zaWJsZSBzdGFjayB0cmFjZS4nLFxuICAgICAgfSxcbiAgICBdLFxuICAgIFtcbiAgICAgICdfX2VuaGFuY2VkX3N0YWNrX3RyYWNlJyxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlcjogKCk6IEVuaGFuY2VkU3RhY2tUcmFjZSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBzb3VyY2VNYXAgfSA9IHRoaXM7XG4gICAgICAgICAgY29uc3Qgc2RrOiBTdGFja1RyYWNlU0RLSW5mbyA9IHsgbmFtZTogJ3R5cGVzY3JpcHQnLCB2ZXJzaW9uOiBwa2cudmVyc2lvbiB9O1xuICAgICAgICAgIGNvbnN0IHN0YWNrcyA9IHRoaXMuZ2V0U3RhY2tUcmFjZXMoKS5tYXAoKHsgc3RydWN0dXJlZDogbG9jYXRpb25zIH0pID0+ICh7IGxvY2F0aW9ucyB9KSk7XG4gICAgICAgICAgY29uc3Qgc291cmNlczogUmVjb3JkPHN0cmluZywgU3RhY2tUcmFjZUZpbGVTbGljZVtdPiA9IHt9O1xuICAgICAgICAgIGlmICh0aGlzLnNob3dTdGFja1RyYWNlU291cmNlcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IGxvY2F0aW9ucyB9IG9mIHN0YWNrcykge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHsgZmlsZV9wYXRoIH0gb2YgbG9jYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlX3BhdGgpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBzb3VyY2VNYXA/LnNvdXJjZXNDb250ZW50Py5bc291cmNlTWFwPy5zb3VyY2VzLmluZGV4T2YoZmlsZV9wYXRoKV07XG4gICAgICAgICAgICAgICAgaWYgKCFjb250ZW50KSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBzb3VyY2VzW2ZpbGVfcGF0aF0gPSBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVfb2Zmc2V0OiAwLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IHNkaywgc3RhY2tzLCBzb3VyY2VzIH07XG4gICAgICAgIH0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmV0dXJucyBhIHN0YWNrIHRyYWNlIGFubm90YXRlZCB3aXRoIHNvdXJjZSBpbmZvcm1hdGlvbi4nLFxuICAgICAgfSxcbiAgICBdLFxuICAgIFtcbiAgICAgICdfX3RlbXBvcmFsX3dvcmtmbG93X21ldGFkYXRhJyxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlcjogKCk6IHRlbXBvcmFsLmFwaS5zZGsudjEuSVdvcmtmbG93TWV0YWRhdGEgPT4ge1xuICAgICAgICAgIGNvbnN0IHdvcmtmbG93VHlwZSA9IHRoaXMuaW5mby53b3JrZmxvd1R5cGU7XG4gICAgICAgICAgY29uc3QgcXVlcnlEZWZpbml0aW9ucyA9IEFycmF5LmZyb20odGhpcy5xdWVyeUhhbmRsZXJzLmVudHJpZXMoKSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoe1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB2YWx1ZS5kZXNjcmlwdGlvbixcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgY29uc3Qgc2lnbmFsRGVmaW5pdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMuc2lnbmFsSGFuZGxlcnMuZW50cmllcygpKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHZhbHVlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBjb25zdCB1cGRhdGVEZWZpbml0aW9ucyA9IEFycmF5LmZyb20odGhpcy51cGRhdGVIYW5kbGVycy5lbnRyaWVzKCkpLm1hcCgoW25hbWUsIHZhbHVlXSkgPT4gKHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdmFsdWUuZGVzY3JpcHRpb24sXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgICAgICAgIHR5cGU6IHdvcmtmbG93VHlwZSxcbiAgICAgICAgICAgICAgcXVlcnlEZWZpbml0aW9ucyxcbiAgICAgICAgICAgICAgc2lnbmFsRGVmaW5pdGlvbnMsXG4gICAgICAgICAgICAgIHVwZGF0ZURlZmluaXRpb25zLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JldHVybnMgbWV0YWRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoaXMgd29ya2Zsb3cuJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgXSk7XG5cbiAgLyoqXG4gICAqIExvYWRlZCBpbiB7QGxpbmsgaW5pdFJ1bnRpbWV9XG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgaW50ZXJjZXB0b3JzOiBSZXF1aXJlZDxXb3JrZmxvd0ludGVyY2VwdG9ycz4gPSB7XG4gICAgaW5ib3VuZDogW10sXG4gICAgb3V0Ym91bmQ6IFtdLFxuICAgIGludGVybmFsczogW10sXG4gIH07XG5cbiAgLyoqXG4gICAqIEJ1ZmZlciB0aGF0IHN0b3JlcyBhbGwgZ2VuZXJhdGVkIGNvbW1hbmRzLCByZXNldCBhZnRlciBlYWNoIGFjdGl2YXRpb25cbiAgICovXG4gIHByb3RlY3RlZCBjb21tYW5kczogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JV29ya2Zsb3dDb21tYW5kW10gPSBbXTtcblxuICAvKipcbiAgICogU3RvcmVzIGFsbCB7QGxpbmsgY29uZGl0aW9ufXMgdGhhdCBoYXZlbid0IGJlZW4gdW5ibG9ja2VkIHlldFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGJsb2NrZWRDb25kaXRpb25zID0gbmV3IE1hcDxudW1iZXIsIENvbmRpdGlvbj4oKTtcblxuICAvKipcbiAgICogSXMgdGhpcyBXb3JrZmxvdyBjb21wbGV0ZWQ/XG4gICAqXG4gICAqIEEgV29ya2Zsb3cgd2lsbCBiZSBjb25zaWRlcmVkIGNvbXBsZXRlZCBpZiBpdCBnZW5lcmF0ZXMgYSBjb21tYW5kIHRoYXQgdGhlXG4gICAqIHN5c3RlbSBjb25zaWRlcnMgYXMgYSBmaW5hbCBXb3JrZmxvdyBjb21tYW5kIChlLmcuXG4gICAqIGNvbXBsZXRlV29ya2Zsb3dFeGVjdXRpb24gb3IgZmFpbFdvcmtmbG93RXhlY3V0aW9uKS5cbiAgICovXG4gIHB1YmxpYyBjb21wbGV0ZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogV2FzIHRoaXMgV29ya2Zsb3cgY2FuY2VsbGVkP1xuICAgKi9cbiAgcHJvdGVjdGVkIGNhbmNlbGxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGUgbmV4dCAoaW5jcmVtZW50YWwpIHNlcXVlbmNlIHRvIGFzc2lnbiB3aGVuIGdlbmVyYXRpbmcgY29tcGxldGFibGUgY29tbWFuZHNcbiAgICovXG4gIHB1YmxpYyBuZXh0U2VxcyA9IHtcbiAgICB0aW1lcjogMSxcbiAgICBhY3Rpdml0eTogMSxcbiAgICBjaGlsZFdvcmtmbG93OiAxLFxuICAgIHNpZ25hbFdvcmtmbG93OiAxLFxuICAgIGNhbmNlbFdvcmtmbG93OiAxLFxuICAgIGNvbmRpdGlvbjogMSxcbiAgICAvLyBVc2VkIGludGVybmFsbHkgdG8ga2VlcCB0cmFjayBvZiBhY3RpdmUgc3RhY2sgdHJhY2VzXG4gICAgc3RhY2s6IDEsXG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgc2V0IGV2ZXJ5IHRpbWUgdGhlIHdvcmtmbG93IGV4ZWN1dGVzIGFuIGFjdGl2YXRpb25cbiAgICogTWF5IGJlIGFjY2Vzc2VkIGFuZCBtb2RpZmllZCBmcm9tIG91dHNpZGUgdGhlIFZNLlxuICAgKi9cbiAgbm93OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBXb3JrZmxvdywgaW5pdGlhbGl6ZWQgd2hlbiBhIFdvcmtmbG93IGlzIHN0YXJ0ZWRcbiAgICovXG4gIHB1YmxpYyB3b3JrZmxvdz86IFdvcmtmbG93O1xuXG4gIC8qKlxuICAgKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBXb3JrZmxvd1xuICAgKiBNYXkgYmUgYWNjZXNzZWQgZnJvbSBvdXRzaWRlIHRoZSBWTS5cbiAgICovXG4gIHB1YmxpYyBpbmZvOiBXb3JrZmxvd0luZm87XG5cbiAgLyoqXG4gICAqIEEgZGV0ZXJtaW5pc3RpYyBSTkcsIHVzZWQgYnkgdGhlIGlzb2xhdGUncyBvdmVycmlkZGVuIE1hdGgucmFuZG9tXG4gICAqL1xuICBwdWJsaWMgcmFuZG9tOiBSTkc7XG5cbiAgcHVibGljIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIgPSBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcjtcbiAgcHVibGljIGZhaWx1cmVDb252ZXJ0ZXI6IEZhaWx1cmVDb252ZXJ0ZXIgPSBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcjtcblxuICAvKipcbiAgICogUGF0Y2hlcyB3ZSBrbm93IHRoZSBzdGF0dXMgb2YgZm9yIHRoaXMgd29ya2Zsb3csIGFzIGluIHtAbGluayBwYXRjaGVkfVxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBrbm93blByZXNlbnRQYXRjaGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgLyoqXG4gICAqIFBhdGNoZXMgd2Ugc2VudCB0byBjb3JlIHtAbGluayBwYXRjaGVkfVxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBzZW50UGF0Y2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkga25vd25GbGFncyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuXG4gIC8qKlxuICAgKiBCdWZmZXJlZCBzaW5rIGNhbGxzIHBlciBhY3RpdmF0aW9uXG4gICAqL1xuICBzaW5rQ2FsbHMgPSBBcnJheTxTaW5rQ2FsbD4oKTtcblxuICAvKipcbiAgICogQSBuYW5vc2Vjb25kIHJlc29sdXRpb24gdGltZSBmdW5jdGlvbiwgZXh0ZXJuYWxseSBpbmplY3RlZFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGdldFRpbWVPZkRheTogKCkgPT4gYmlnaW50O1xuXG4gIHB1YmxpYyByZWFkb25seSByZWdpc3RlcmVkQWN0aXZpdHlOYW1lczogU2V0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIGluZm8sXG4gICAgbm93LFxuICAgIHNob3dTdGFja1RyYWNlU291cmNlcyxcbiAgICBzb3VyY2VNYXAsXG4gICAgZ2V0VGltZU9mRGF5LFxuICAgIHJhbmRvbW5lc3NTZWVkLFxuICAgIHJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzLFxuICB9OiBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCkge1xuICAgIHRoaXMuZ2V0VGltZU9mRGF5ID0gZ2V0VGltZU9mRGF5O1xuICAgIHRoaXMuaW5mbyA9IGluZm87XG4gICAgdGhpcy5ub3cgPSBub3c7XG4gICAgdGhpcy5zaG93U3RhY2tUcmFjZVNvdXJjZXMgPSBzaG93U3RhY2tUcmFjZVNvdXJjZXM7XG4gICAgdGhpcy5zb3VyY2VNYXAgPSBzb3VyY2VNYXA7XG4gICAgdGhpcy5yYW5kb20gPSBhbGVhKHJhbmRvbW5lc3NTZWVkKTtcbiAgICB0aGlzLnJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzID0gcmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXM7XG4gIH1cblxuICAvKipcbiAgICogTWF5IGJlIGludm9rZWQgZnJvbSBvdXRzaWRlIHRoZSBWTS5cbiAgICovXG4gIG11dGF0ZVdvcmtmbG93SW5mbyhmbjogKGluZm86IFdvcmtmbG93SW5mbykgPT4gV29ya2Zsb3dJbmZvKTogdm9pZCB7XG4gICAgdGhpcy5pbmZvID0gZm4odGhpcy5pbmZvKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTdGFja1RyYWNlcygpOiBTdGFja1tdIHtcbiAgICBjb25zdCB7IGNoaWxkVG9QYXJlbnQsIHByb21pc2VUb1N0YWNrIH0gPSB0aGlzLnByb21pc2VTdGFja1N0b3JlO1xuICAgIGNvbnN0IGludGVybmFsTm9kZXMgPSBbLi4uY2hpbGRUb1BhcmVudC52YWx1ZXMoKV0ucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiBjdXJyKSB7XG4gICAgICAgIGFjYy5hZGQocCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIG5ldyBTZXQoKSk7XG4gICAgY29uc3Qgc3RhY2tzID0gbmV3IE1hcDxzdHJpbmcsIFN0YWNrPigpO1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRUb1BhcmVudC5rZXlzKCkpIHtcbiAgICAgIGlmICghaW50ZXJuYWxOb2Rlcy5oYXMoY2hpbGQpKSB7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gcHJvbWlzZVRvU3RhY2suZ2V0KGNoaWxkKTtcbiAgICAgICAgaWYgKCFzdGFjayB8fCAhc3RhY2suZm9ybWF0dGVkKSBjb250aW51ZTtcbiAgICAgICAgc3RhY2tzLnNldChzdGFjay5mb3JtYXR0ZWQsIHN0YWNrKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gTm90IDEwMCUgc3VyZSB3aGVyZSB0aGlzIGNvbWVzIGZyb20sIGp1c3QgZmlsdGVyIGl0IG91dFxuICAgIHN0YWNrcy5kZWxldGUoJyAgICBhdCBQcm9taXNlLnRoZW4gKDxhbm9ueW1vdXM+KScpO1xuICAgIHN0YWNrcy5kZWxldGUoJyAgICBhdCBQcm9taXNlLnRoZW4gKDxhbm9ueW1vdXM+KVxcbicpO1xuICAgIHJldHVybiBbLi4uc3RhY2tzXS5tYXAoKFtfLCBzdGFja10pID0+IHN0YWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXkgYmUgaW52b2tlZCBmcm9tIG91dHNpZGUgdGhlIFZNLlxuICAgKi9cbiAgZ2V0QW5kUmVzZXRTaW5rQ2FsbHMoKTogU2lua0NhbGxbXSB7XG4gICAgY29uc3QgeyBzaW5rQ2FsbHMgfSA9IHRoaXM7XG4gICAgdGhpcy5zaW5rQ2FsbHMgPSBbXTtcbiAgICByZXR1cm4gc2lua0NhbGxzO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1ZmZlciBhIFdvcmtmbG93IGNvbW1hbmQgdG8gYmUgY29sbGVjdGVkIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgYWN0aXZhdGlvbi5cbiAgICpcbiAgICogUHJldmVudHMgY29tbWFuZHMgZnJvbSBiZWluZyBhZGRlZCBhZnRlciBXb3JrZmxvdyBjb21wbGV0aW9uLlxuICAgKi9cbiAgcHVzaENvbW1hbmQoY21kOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmQsIGNvbXBsZXRlID0gZmFsc2UpOiB2b2lkIHtcbiAgICB0aGlzLmNvbW1hbmRzLnB1c2goY21kKTtcbiAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgIHRoaXMuY29tcGxldGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBjb25jbHVkZUFjdGl2YXRpb24oKTogQWN0aXZhdGlvbkNvbXBsZXRpb24ge1xuICAgIHJldHVybiB7XG4gICAgICBjb21tYW5kczogdGhpcy5jb21tYW5kcy5zcGxpY2UoMCksXG4gICAgICB1c2VkSW50ZXJuYWxGbGFnczogWy4uLnRoaXMua25vd25GbGFnc10sXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdGFydFdvcmtmbG93TmV4dEhhbmRsZXIoeyBhcmdzIH06IFdvcmtmbG93RXhlY3V0ZUlucHV0KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCB7IHdvcmtmbG93IH0gPSB0aGlzO1xuICAgIGlmICh3b3JrZmxvdyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IHVuaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHdvcmtmbG93KC4uLmFyZ3MpO1xuICB9XG5cbiAgcHVibGljIHN0YXJ0V29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklJbml0aWFsaXplV29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyh0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLCAnZXhlY3V0ZScsIHRoaXMuc3RhcnRXb3JrZmxvd05leHRIYW5kbGVyLmJpbmQodGhpcykpO1xuXG4gICAgdW50cmFja1Byb21pc2UoXG4gICAgICBleGVjdXRlV2l0aExpZmVjeWNsZUxvZ2dpbmcoKCkgPT5cbiAgICAgICAgZXhlY3V0ZSh7XG4gICAgICAgICAgaGVhZGVyczogYWN0aXZhdGlvbi5oZWFkZXJzID8/IHt9LFxuICAgICAgICAgIGFyZ3M6IGFycmF5RnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgYWN0aXZhdGlvbi5hcmd1bWVudHMpLFxuICAgICAgICB9KVxuICAgICAgKS50aGVuKHRoaXMuY29tcGxldGVXb3JrZmxvdy5iaW5kKHRoaXMpLCB0aGlzLmhhbmRsZVdvcmtmbG93RmFpbHVyZS5iaW5kKHRoaXMpKVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgaW5pdGlhbGl6ZVdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JSW5pdGlhbGl6ZVdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250aW51ZWRGYWlsdXJlLCBsYXN0Q29tcGxldGlvblJlc3VsdCwgbWVtbywgc2VhcmNoQXR0cmlidXRlcyB9ID0gYWN0aXZhdGlvbjtcblxuICAgIC8vIE1vc3QgdGhpbmdzIHJlbGF0ZWQgdG8gaW5pdGlhbGl6YXRpb24gaGF2ZSBhbHJlYWR5IGJlZW4gaGFuZGxlZCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICB0aGlzLm11dGF0ZVdvcmtmbG93SW5mbygoaW5mbykgPT4gKHtcbiAgICAgIC4uLmluZm8sXG4gICAgICBzZWFyY2hBdHRyaWJ1dGVzOlxuICAgICAgICAobWFwRnJvbVBheWxvYWRzKHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsIHNlYXJjaEF0dHJpYnV0ZXM/LmluZGV4ZWRGaWVsZHMpIGFzIFNlYXJjaEF0dHJpYnV0ZXMpID8/IHt9LFxuICAgICAgbWVtbzogbWFwRnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgbWVtbz8uZmllbGRzKSxcbiAgICAgIGxhc3RSZXN1bHQ6IGZyb21QYXlsb2Fkc0F0SW5kZXgodGhpcy5wYXlsb2FkQ29udmVydGVyLCAwLCBsYXN0Q29tcGxldGlvblJlc3VsdD8ucGF5bG9hZHMpLFxuICAgICAgbGFzdEZhaWx1cmU6XG4gICAgICAgIGNvbnRpbnVlZEZhaWx1cmUgIT0gbnVsbFxuICAgICAgICAgID8gdGhpcy5mYWlsdXJlQ29udmVydGVyLmZhaWx1cmVUb0Vycm9yKGNvbnRpbnVlZEZhaWx1cmUsIHRoaXMucGF5bG9hZENvbnZlcnRlcilcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICB9KSk7XG4gIH1cblxuICBwdWJsaWMgY2FuY2VsV29ya2Zsb3coX2FjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JQ2FuY2VsV29ya2Zsb3cpOiB2b2lkIHtcbiAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgdGhpcy5yb290U2NvcGUuY2FuY2VsKCk7XG4gIH1cblxuICBwdWJsaWMgZmlyZVRpbWVyKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JRmlyZVRpbWVyKTogdm9pZCB7XG4gICAgLy8gVGltZXJzIGFyZSBhIHNwZWNpYWwgY2FzZSB3aGVyZSB0aGVpciBjb21wbGV0aW9uIG1pZ2h0IG5vdCBiZSBpbiBXb3JrZmxvdyBzdGF0ZSxcbiAgICAvLyB0aGlzIGlzIGR1ZSB0byBpbW1lZGlhdGUgdGltZXIgY2FuY2VsbGF0aW9uIHRoYXQgZG9lc24ndCBnbyB3YWl0IGZvciBDb3JlLlxuICAgIGNvbnN0IGNvbXBsZXRpb24gPSB0aGlzLm1heWJlQ29uc3VtZUNvbXBsZXRpb24oJ3RpbWVyJywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBjb21wbGV0aW9uPy5yZXNvbHZlKHVuZGVmaW5lZCk7XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZUFjdGl2aXR5KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZUFjdGl2aXR5KTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnJlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IFJlc29sdmVBY3Rpdml0eSBhY3RpdmF0aW9uIHdpdGggbm8gcmVzdWx0Jyk7XG4gICAgfVxuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdhY3Rpdml0eScsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZCkge1xuICAgICAgY29uc3QgY29tcGxldGVkID0gYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkO1xuICAgICAgY29uc3QgcmVzdWx0ID0gY29tcGxldGVkLnJlc3VsdCA/IHRoaXMucGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZChjb21wbGV0ZWQucmVzdWx0KSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQ7XG4gICAgICBjb25zdCBlcnIgPSBmYWlsdXJlID8gdGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZDtcbiAgICAgIGNvbnN0IGVyciA9IGZhaWx1cmUgPyB0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUpIDogdW5kZWZpbmVkO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5iYWNrb2ZmKSB7XG4gICAgICByZWplY3QobmV3IExvY2FsQWN0aXZpdHlEb0JhY2tvZmYoYWN0aXZhdGlvbi5yZXN1bHQuYmFja29mZikpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvblN0YXJ0KFxuICAgIGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb25TdGFydFxuICApOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignY2hpbGRXb3JrZmxvd1N0YXJ0JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5zdWNjZWVkZWQpIHtcbiAgICAgIHJlc29sdmUoYWN0aXZhdGlvbi5zdWNjZWVkZWQucnVuSWQpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5mYWlsZWQpIHtcbiAgICAgIGlmIChkZWNvZGVTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZShhY3RpdmF0aW9uLmZhaWxlZC5jYXVzZSkgIT09ICdXT1JLRkxPV19BTFJFQURZX0VYSVNUUycpIHtcbiAgICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdHb3QgdW5rbm93biBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZScpO1xuICAgICAgfVxuICAgICAgaWYgKCEoYWN0aXZhdGlvbi5zZXEgJiYgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dJZCAmJiBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd1R5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYXR0cmlidXRlcyBpbiBhY3RpdmF0aW9uIGpvYicpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KFxuICAgICAgICBuZXcgV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yKFxuICAgICAgICAgICdXb3JrZmxvdyBleGVjdXRpb24gYWxyZWFkeSBzdGFydGVkJyxcbiAgICAgICAgICBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd0lkLFxuICAgICAgICAgIGFjdGl2YXRpb24uZmFpbGVkLndvcmtmbG93VHlwZVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5jYW5jZWxsZWQpIHtcbiAgICAgIGlmICghYWN0aXZhdGlvbi5jYW5jZWxsZWQuZmFpbHVyZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3Qgbm8gZmFpbHVyZSBpbiBjYW5jZWxsZWQgdmFyaWFudCcpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoYWN0aXZhdGlvbi5jYW5jZWxsZWQuZmFpbHVyZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgUmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb25TdGFydCB3aXRoIG5vIHN0YXR1cycpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbihhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnJlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IFJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uIGFjdGl2YXRpb24gd2l0aCBubyByZXN1bHQnKTtcbiAgICB9XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2NoaWxkV29ya2Zsb3dDb21wbGV0ZScsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZCkge1xuICAgICAgY29uc3QgY29tcGxldGVkID0gYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkO1xuICAgICAgY29uc3QgcmVzdWx0ID0gY29tcGxldGVkLnJlc3VsdCA/IHRoaXMucGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZChjb21wbGV0ZWQucmVzdWx0KSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQ7XG4gICAgICBpZiAoZmFpbHVyZSA9PT0gdW5kZWZpbmVkIHx8IGZhaWx1cmUgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGZhaWxlZCByZXN1bHQgd2l0aCBubyBmYWlsdXJlIGF0dHJpYnV0ZScpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZDtcbiAgICAgIGlmIChmYWlsdXJlID09PSB1bmRlZmluZWQgfHwgZmFpbHVyZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgY2FuY2VsbGVkIHJlc3VsdCB3aXRoIG5vIGZhaWx1cmUgYXR0cmlidXRlJyk7XG4gICAgICB9XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSW50ZW50aW9uYWxseSBub24tYXN5bmMgZnVuY3Rpb24gc28gdGhpcyBoYW5kbGVyIGRvZXNuJ3Qgc2hvdyB1cCBpbiB0aGUgc3RhY2sgdHJhY2VcbiAgcHJvdGVjdGVkIHF1ZXJ5V29ya2Zsb3dOZXh0SGFuZGxlcih7IHF1ZXJ5TmFtZSwgYXJncyB9OiBRdWVyeUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgZm4gPSB0aGlzLnF1ZXJ5SGFuZGxlcnMuZ2V0KHF1ZXJ5TmFtZSk/LmhhbmRsZXI7XG4gICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGtub3duUXVlcnlUeXBlcyA9IFsuLi50aGlzLnF1ZXJ5SGFuZGxlcnMua2V5cygpXS5qb2luKCcgJyk7XG4gICAgICAvLyBGYWlsIHRoZSBxdWVyeVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFxuICAgICAgICBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgYFdvcmtmbG93IGRpZCBub3QgcmVnaXN0ZXIgYSBoYW5kbGVyIGZvciAke3F1ZXJ5TmFtZX0uIFJlZ2lzdGVyZWQgcXVlcmllczogWyR7a25vd25RdWVyeVR5cGVzfV1gXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXQgPSBmbiguLi5hcmdzKTtcbiAgICAgIGlmIChyZXQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcignUXVlcnkgaGFuZGxlcnMgc2hvdWxkIG5vdCByZXR1cm4gYSBQcm9taXNlJykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHF1ZXJ5V29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklRdWVyeVdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgeyBxdWVyeVR5cGUsIHF1ZXJ5SWQsIGhlYWRlcnMgfSA9IGFjdGl2YXRpb247XG4gICAgaWYgKCEocXVlcnlUeXBlICYmIHF1ZXJ5SWQpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIHF1ZXJ5IGFjdGl2YXRpb24gYXR0cmlidXRlcycpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgdGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCxcbiAgICAgICdoYW5kbGVRdWVyeScsXG4gICAgICB0aGlzLnF1ZXJ5V29ya2Zsb3dOZXh0SGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICBleGVjdXRlKHtcbiAgICAgIHF1ZXJ5TmFtZTogcXVlcnlUeXBlLFxuICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmFyZ3VtZW50cyksXG4gICAgICBxdWVyeUlkLFxuICAgICAgaGVhZGVyczogaGVhZGVycyA/PyB7fSxcbiAgICB9KS50aGVuKFxuICAgICAgKHJlc3VsdCkgPT4gdGhpcy5jb21wbGV0ZVF1ZXJ5KHF1ZXJ5SWQsIHJlc3VsdCksXG4gICAgICAocmVhc29uKSA9PiB0aGlzLmZhaWxRdWVyeShxdWVyeUlkLCByZWFzb24pXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBkb1VwZGF0ZShhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSURvVXBkYXRlKTogdm9pZCB7XG4gICAgY29uc3QgeyBpZDogdXBkYXRlSWQsIHByb3RvY29sSW5zdGFuY2VJZCwgbmFtZSwgaGVhZGVycywgcnVuVmFsaWRhdG9yIH0gPSBhY3RpdmF0aW9uO1xuICAgIGlmICghdXBkYXRlSWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiB1cGRhdGUgaWQnKTtcbiAgICB9XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gdXBkYXRlIG5hbWUnKTtcbiAgICB9XG4gICAgaWYgKCFwcm90b2NvbEluc3RhbmNlSWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiB1cGRhdGUgcHJvdG9jb2xJbnN0YW5jZUlkJyk7XG4gICAgfVxuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy51cGRhdGVIYW5kbGVycy5nZXQobmFtZSk7XG4gICAgaWYgKCFlbnRyeSkge1xuICAgICAgdGhpcy5idWZmZXJlZFVwZGF0ZXMucHVzaChhY3RpdmF0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtYWtlSW5wdXQgPSAoKTogVXBkYXRlSW5wdXQgPT4gKHtcbiAgICAgIHVwZGF0ZUlkLFxuICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmlucHV0KSxcbiAgICAgIG5hbWUsXG4gICAgICBoZWFkZXJzOiBoZWFkZXJzID8/IHt9LFxuICAgIH0pO1xuXG4gICAgLy8gVGhlIGltcGxlbWVudGF0aW9uIGJlbG93IGlzIHJlc3BvbnNpYmxlIGZvciB1cGhvbGRpbmcsIGFuZCBjb25zdHJhaW5lZFxuICAgIC8vIGJ5LCB0aGUgZm9sbG93aW5nIGNvbnRyYWN0OlxuICAgIC8vXG4gICAgLy8gMS4gSWYgbm8gdmFsaWRhdG9yIGlzIHByZXNlbnQgdGhlbiB2YWxpZGF0aW9uIGludGVyY2VwdG9ycyB3aWxsIG5vdCBiZSBydW4uXG4gICAgLy9cbiAgICAvLyAyLiBEdXJpbmcgdmFsaWRhdGlvbiwgYW55IGVycm9yIG11c3QgZmFpbCB0aGUgVXBkYXRlOyBkdXJpbmcgdGhlIFVwZGF0ZVxuICAgIC8vICAgIGl0c2VsZiwgVGVtcG9yYWwgZXJyb3JzIGZhaWwgdGhlIFVwZGF0ZSB3aGVyZWFzIG90aGVyIGVycm9ycyBmYWlsIHRoZVxuICAgIC8vICAgIGFjdGl2YXRpb24uXG4gICAgLy9cbiAgICAvLyAzLiBUaGUgaGFuZGxlciBtdXN0IG5vdCBzZWUgYW55IG11dGF0aW9ucyBvZiB0aGUgYXJndW1lbnRzIG1hZGUgYnkgdGhlXG4gICAgLy8gICAgdmFsaWRhdG9yLlxuICAgIC8vXG4gICAgLy8gNC4gQW55IGVycm9yIHdoZW4gZGVjb2RpbmcvZGVzZXJpYWxpemluZyBpbnB1dCBtdXN0IGJlIGNhdWdodCBhbmQgcmVzdWx0XG4gICAgLy8gICAgaW4gcmVqZWN0aW9uIG9mIHRoZSBVcGRhdGUgYmVmb3JlIGl0IGlzIGFjY2VwdGVkLCBldmVuIGlmIHRoZXJlIGlzIG5vXG4gICAgLy8gICAgdmFsaWRhdG9yLlxuICAgIC8vXG4gICAgLy8gNS4gVGhlIGluaXRpYWwgc3luY2hyb25vdXMgcG9ydGlvbiBvZiB0aGUgKGFzeW5jKSBVcGRhdGUgaGFuZGxlciBzaG91bGRcbiAgICAvLyAgICBiZSBleGVjdXRlZCBhZnRlciB0aGUgKHN5bmMpIHZhbGlkYXRvciBjb21wbGV0ZXMgc3VjaCB0aGF0IHRoZXJlIGlzXG4gICAgLy8gICAgbWluaW1hbCBvcHBvcnR1bml0eSBmb3IgYSBkaWZmZXJlbnQgY29uY3VycmVudCB0YXNrIHRvIGJlIHNjaGVkdWxlZFxuICAgIC8vICAgIGJldHdlZW4gdGhlbS5cbiAgICAvL1xuICAgIC8vIDYuIFRoZSBzdGFjayB0cmFjZSB2aWV3IHByb3ZpZGVkIGluIHRoZSBUZW1wb3JhbCBVSSBtdXN0IG5vdCBiZSBwb2xsdXRlZFxuICAgIC8vICAgIGJ5IHByb21pc2VzIHRoYXQgZG8gbm90IGRlcml2ZSBmcm9tIHVzZXIgY29kZS4gVGhpcyBpbXBsaWVzIHRoYXRcbiAgICAvLyAgICBhc3luYy9hd2FpdCBzeW50YXggbWF5IG5vdCBiZSB1c2VkLlxuICAgIC8vXG4gICAgLy8gTm90ZSB0aGF0IHRoZXJlIGlzIGEgZGVsaWJlcmF0ZWx5IHVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbiBiZWxvdy5cbiAgICAvLyBUaGVzZSBhcmUgY2F1Z2h0IGVsc2V3aGVyZSBhbmQgZmFpbCB0aGUgY29ycmVzcG9uZGluZyBhY3RpdmF0aW9uLlxuICAgIGNvbnN0IGRvVXBkYXRlSW1wbCA9IGFzeW5jICgpID0+IHtcbiAgICAgIGxldCBpbnB1dDogVXBkYXRlSW5wdXQ7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocnVuVmFsaWRhdG9yICYmIGVudHJ5LnZhbGlkYXRvcikge1xuICAgICAgICAgIGNvbnN0IHZhbGlkYXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgICAgICAgIHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsXG4gICAgICAgICAgICAndmFsaWRhdGVVcGRhdGUnLFxuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZVVwZGF0ZU5leHRIYW5kbGVyLmJpbmQodGhpcywgZW50cnkudmFsaWRhdG9yKVxuICAgICAgICAgICk7XG4gICAgICAgICAgdmFsaWRhdGUobWFrZUlucHV0KCkpO1xuICAgICAgICB9XG4gICAgICAgIGlucHV0ID0gbWFrZUlucHV0KCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aGlzLnJlamVjdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5hY2NlcHRVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkKTtcbiAgICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICB0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLFxuICAgICAgICAnaGFuZGxlVXBkYXRlJyxcbiAgICAgICAgdGhpcy51cGRhdGVOZXh0SGFuZGxlci5iaW5kKHRoaXMsIGVudHJ5LmhhbmRsZXIpXG4gICAgICApO1xuICAgICAgY29uc3QgeyB1bmZpbmlzaGVkUG9saWN5IH0gPSBlbnRyeTtcbiAgICAgIHRoaXMuaW5Qcm9ncmVzc1VwZGF0ZXMuc2V0KHVwZGF0ZUlkLCB7IG5hbWUsIHVuZmluaXNoZWRQb2xpY3ksIGlkOiB1cGRhdGVJZCB9KTtcbiAgICAgIGNvbnN0IHJlcyA9IGV4ZWN1dGUoaW5wdXQpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHRoaXMuY29tcGxldGVVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkLCByZXN1bHQpKVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgICAgICAgICB0aGlzLnJlamVjdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQsIGVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuZmluYWxseSgoKSA9PiB0aGlzLmluUHJvZ3Jlc3NVcGRhdGVzLmRlbGV0ZSh1cGRhdGVJZCkpO1xuICAgICAgdW50cmFja1Byb21pc2UocmVzKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICB1bnRyYWNrUHJvbWlzZShVcGRhdGVTY29wZS51cGRhdGVXaXRoSW5mbyh1cGRhdGVJZCwgbmFtZSwgZG9VcGRhdGVJbXBsKSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgdXBkYXRlTmV4dEhhbmRsZXIoaGFuZGxlcjogV29ya2Zsb3dVcGRhdGVUeXBlLCB7IGFyZ3MgfTogVXBkYXRlSW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICByZXR1cm4gYXdhaXQgaGFuZGxlciguLi5hcmdzKTtcbiAgfVxuXG4gIHByb3RlY3RlZCB2YWxpZGF0ZVVwZGF0ZU5leHRIYW5kbGVyKHZhbGlkYXRvcjogV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlIHwgdW5kZWZpbmVkLCB7IGFyZ3MgfTogVXBkYXRlSW5wdXQpOiB2b2lkIHtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YWxpZGF0b3IoLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGRpc3BhdGNoQnVmZmVyZWRVcGRhdGVzKCk6IHZvaWQge1xuICAgIGNvbnN0IGJ1ZmZlcmVkVXBkYXRlcyA9IHRoaXMuYnVmZmVyZWRVcGRhdGVzO1xuICAgIHdoaWxlIChidWZmZXJlZFVwZGF0ZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBmb3VuZEluZGV4ID0gYnVmZmVyZWRVcGRhdGVzLmZpbmRJbmRleCgodXBkYXRlKSA9PiB0aGlzLnVwZGF0ZUhhbmRsZXJzLmhhcyh1cGRhdGUubmFtZSBhcyBzdHJpbmcpKTtcbiAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkge1xuICAgICAgICAvLyBObyBidWZmZXJlZCBVcGRhdGVzIGhhdmUgYSBoYW5kbGVyIHlldC5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjb25zdCBbdXBkYXRlXSA9IGJ1ZmZlcmVkVXBkYXRlcy5zcGxpY2UoZm91bmRJbmRleCwgMSk7XG4gICAgICB0aGlzLmRvVXBkYXRlKHVwZGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlamVjdEJ1ZmZlcmVkVXBkYXRlcygpOiB2b2lkIHtcbiAgICB3aGlsZSAodGhpcy5idWZmZXJlZFVwZGF0ZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB1cGRhdGUgPSB0aGlzLmJ1ZmZlcmVkVXBkYXRlcy5zaGlmdCgpO1xuICAgICAgaWYgKHVwZGF0ZSkge1xuICAgICAgICB0aGlzLnJlamVjdFVwZGF0ZShcbiAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uICovXG4gICAgICAgICAgdXBkYXRlLnByb3RvY29sSW5zdGFuY2VJZCEsXG4gICAgICAgICAgQXBwbGljYXRpb25GYWlsdXJlLm5vblJldHJ5YWJsZShgTm8gcmVnaXN0ZXJlZCBoYW5kbGVyIGZvciB1cGRhdGU6ICR7dXBkYXRlLm5hbWV9YClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlcih7IHNpZ25hbE5hbWUsIGFyZ3MgfTogU2lnbmFsSW5wdXQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmbiA9IHRoaXMuc2lnbmFsSGFuZGxlcnMuZ2V0KHNpZ25hbE5hbWUpPy5oYW5kbGVyO1xuICAgIGlmIChmbikge1xuICAgICAgcmV0dXJuIGF3YWl0IGZuKC4uLmFyZ3MpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0U2lnbmFsSGFuZGxlcikge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIoc2lnbmFsTmFtZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihgTm8gcmVnaXN0ZXJlZCBzaWduYWwgaGFuZGxlciBmb3Igc2lnbmFsOiAke3NpZ25hbE5hbWV9YCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNpZ25hbFdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JU2lnbmFsV29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpZ25hbE5hbWUsIGhlYWRlcnMgfSA9IGFjdGl2YXRpb247XG4gICAgaWYgKCFzaWduYWxOYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gc2lnbmFsTmFtZScpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5zaWduYWxIYW5kbGVycy5oYXMoc2lnbmFsTmFtZSkgJiYgIXRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIpIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRTaWduYWxzLnB1c2goYWN0aXZhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZmFsbCB0aHJvdWdoIHRvIHRoZSBkZWZhdWx0IHNpZ25hbCBoYW5kbGVyIHRoZW4gdGhlIHVuZmluaXNoZWRcbiAgICAvLyBwb2xpY3kgaXMgV0FSTl9BTkRfQUJBTkRPTjsgdXNlcnMgY3VycmVudGx5IGhhdmUgbm8gd2F5IHRvIHNpbGVuY2UgYW55XG4gICAgLy8gZW5zdWluZyB3YXJuaW5ncy5cbiAgICBjb25zdCB1bmZpbmlzaGVkUG9saWN5ID1cbiAgICAgIHRoaXMuc2lnbmFsSGFuZGxlcnMuZ2V0KHNpZ25hbE5hbWUpPy51bmZpbmlzaGVkUG9saWN5ID8/IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LldBUk5fQU5EX0FCQU5ET047XG5cbiAgICBjb25zdCBzaWduYWxFeGVjdXRpb25OdW0gPSB0aGlzLnNpZ25hbEhhbmRsZXJFeGVjdXRpb25TZXErKztcbiAgICB0aGlzLmluUHJvZ3Jlc3NTaWduYWxzLnNldChzaWduYWxFeGVjdXRpb25OdW0sIHsgbmFtZTogc2lnbmFsTmFtZSwgdW5maW5pc2hlZFBvbGljeSB9KTtcbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgIHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsXG4gICAgICAnaGFuZGxlU2lnbmFsJyxcbiAgICAgIHRoaXMuc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICBleGVjdXRlKHtcbiAgICAgIGFyZ3M6IGFycmF5RnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgYWN0aXZhdGlvbi5pbnB1dCksXG4gICAgICBzaWduYWxOYW1lLFxuICAgICAgaGVhZGVyczogaGVhZGVycyA/PyB7fSxcbiAgICB9KVxuICAgICAgLmNhdGNoKHRoaXMuaGFuZGxlV29ya2Zsb3dGYWlsdXJlLmJpbmQodGhpcykpXG4gICAgICAuZmluYWxseSgoKSA9PiB0aGlzLmluUHJvZ3Jlc3NTaWduYWxzLmRlbGV0ZShzaWduYWxFeGVjdXRpb25OdW0pKTtcbiAgfVxuXG4gIHB1YmxpYyBkaXNwYXRjaEJ1ZmZlcmVkU2lnbmFscygpOiB2b2lkIHtcbiAgICBjb25zdCBidWZmZXJlZFNpZ25hbHMgPSB0aGlzLmJ1ZmZlcmVkU2lnbmFscztcbiAgICB3aGlsZSAoYnVmZmVyZWRTaWduYWxzLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIpIHtcbiAgICAgICAgLy8gV2UgaGF2ZSBhIGRlZmF1bHQgc2lnbmFsIGhhbmRsZXIsIHNvIGFsbCBzaWduYWxzIGFyZSBkaXNwYXRjaGFibGVcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICAgICAgdGhpcy5zaWduYWxXb3JrZmxvdyhidWZmZXJlZFNpZ25hbHMuc2hpZnQoKSEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZm91bmRJbmRleCA9IGJ1ZmZlcmVkU2lnbmFscy5maW5kSW5kZXgoKHNpZ25hbCkgPT4gdGhpcy5zaWduYWxIYW5kbGVycy5oYXMoc2lnbmFsLnNpZ25hbE5hbWUgYXMgc3RyaW5nKSk7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgYnJlYWs7XG4gICAgICAgIGNvbnN0IFtzaWduYWxdID0gYnVmZmVyZWRTaWduYWxzLnNwbGljZShmb3VuZEluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5zaWduYWxXb3JrZmxvdyhzaWduYWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlU2lnbmFsRXh0ZXJuYWxXb3JrZmxvdyhhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVTaWduYWxFeHRlcm5hbFdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ3NpZ25hbFdvcmtmbG93JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5mYWlsdXJlKSB7XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihhY3RpdmF0aW9uLmZhaWx1cmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlUmVxdWVzdENhbmNlbEV4dGVybmFsV29ya2Zsb3coXG4gICAgYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlUmVxdWVzdENhbmNlbEV4dGVybmFsV29ya2Zsb3dcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2NhbmNlbFdvcmtmbG93JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5mYWlsdXJlKSB7XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihhY3RpdmF0aW9uLmZhaWx1cmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB3YXJuSWZVbmZpbmlzaGVkSGFuZGxlcnMoKTogdm9pZCB7XG4gICAgY29uc3QgZ2V0V2FybmFibGUgPSAoaGFuZGxlckV4ZWN1dGlvbnM6IEl0ZXJhYmxlPE1lc3NhZ2VIYW5kbGVyRXhlY3V0aW9uPik6IE1lc3NhZ2VIYW5kbGVyRXhlY3V0aW9uW10gPT4ge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20oaGFuZGxlckV4ZWN1dGlvbnMpLmZpbHRlcihcbiAgICAgICAgKGV4KSA9PiBleC51bmZpbmlzaGVkUG9saWN5ID09PSBIYW5kbGVyVW5maW5pc2hlZFBvbGljeS5XQVJOX0FORF9BQkFORE9OXG4gICAgICApO1xuICAgIH07XG5cbiAgICBjb25zdCB3YXJuYWJsZVVwZGF0ZXMgPSBnZXRXYXJuYWJsZSh0aGlzLmluUHJvZ3Jlc3NVcGRhdGVzLnZhbHVlcygpKTtcbiAgICBpZiAod2FybmFibGVVcGRhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxvZy53YXJuKG1ha2VVbmZpbmlzaGVkVXBkYXRlSGFuZGxlck1lc3NhZ2Uod2FybmFibGVVcGRhdGVzKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgd2FybmFibGVTaWduYWxzID0gZ2V0V2FybmFibGUodGhpcy5pblByb2dyZXNzU2lnbmFscy52YWx1ZXMoKSk7XG4gICAgaWYgKHdhcm5hYmxlU2lnbmFscy5sZW5ndGggPiAwKSB7XG4gICAgICBsb2cud2FybihtYWtlVW5maW5pc2hlZFNpZ25hbEhhbmRsZXJNZXNzYWdlKHdhcm5hYmxlU2lnbmFscykpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGVSYW5kb21TZWVkKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JVXBkYXRlUmFuZG9tU2VlZCk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbi5yYW5kb21uZXNzU2VlZCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYWN0aXZhdGlvbiB3aXRoIHJhbmRvbW5lc3NTZWVkIGF0dHJpYnV0ZScpO1xuICAgIH1cbiAgICB0aGlzLnJhbmRvbSA9IGFsZWEoYWN0aXZhdGlvbi5yYW5kb21uZXNzU2VlZC50b0J5dGVzKCkpO1xuICB9XG5cbiAgcHVibGljIG5vdGlmeUhhc1BhdGNoKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JTm90aWZ5SGFzUGF0Y2gpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaW5mby51bnNhZmUuaXNSZXBsYXlpbmcpXG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1VuZXhwZWN0ZWQgbm90aWZ5SGFzUGF0Y2ggam9iIG9uIG5vbi1yZXBsYXkgYWN0aXZhdGlvbicpO1xuICAgIGlmICghYWN0aXZhdGlvbi5wYXRjaElkKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3RpZnlIYXNQYXRjaCBtaXNzaW5nIHBhdGNoIGlkJyk7XG4gICAgdGhpcy5rbm93blByZXNlbnRQYXRjaGVzLmFkZChhY3RpdmF0aW9uLnBhdGNoSWQpO1xuICB9XG5cbiAgcHVibGljIHBhdGNoSW50ZXJuYWwocGF0Y2hJZDogc3RyaW5nLCBkZXByZWNhdGVkOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMud29ya2Zsb3cgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdQYXRjaGVzIGNhbm5vdCBiZSB1c2VkIGJlZm9yZSBXb3JrZmxvdyBzdGFydHMnKTtcbiAgICB9XG4gICAgY29uc3QgdXNlUGF0Y2ggPSAhdGhpcy5pbmZvLnVuc2FmZS5pc1JlcGxheWluZyB8fCB0aGlzLmtub3duUHJlc2VudFBhdGNoZXMuaGFzKHBhdGNoSWQpO1xuICAgIC8vIEF2b2lkIHNlbmRpbmcgY29tbWFuZHMgZm9yIHBhdGNoZXMgY29yZSBhbHJlYWR5IGtub3dzIGFib3V0LlxuICAgIC8vIFRoaXMgb3B0aW1pemF0aW9uIGVuYWJsZXMgZGV2ZWxvcG1lbnQgb2YgYXV0b21hdGljIHBhdGNoaW5nIHRvb2xzLlxuICAgIGlmICh1c2VQYXRjaCAmJiAhdGhpcy5zZW50UGF0Y2hlcy5oYXMocGF0Y2hJZCkpIHtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgICBzZXRQYXRjaE1hcmtlcjogeyBwYXRjaElkLCBkZXByZWNhdGVkIH0sXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2VudFBhdGNoZXMuYWRkKHBhdGNoSWQpO1xuICAgIH1cbiAgICByZXR1cm4gdXNlUGF0Y2g7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGVhcmx5IHdoaWxlIGhhbmRsaW5nIGFuIGFjdGl2YXRpb24gdG8gcmVnaXN0ZXIga25vd24gZmxhZ3MuXG4gICAqIE1heSBiZSBpbnZva2VkIGZyb20gb3V0c2lkZSB0aGUgVk0uXG4gICAqL1xuICBwdWJsaWMgYWRkS25vd25GbGFncyhmbGFnczogbnVtYmVyW10pOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGZsYWcgb2YgZmxhZ3MpIHtcbiAgICAgIGFzc2VydFZhbGlkRmxhZyhmbGFnKTtcbiAgICAgIHRoaXMua25vd25GbGFncy5hZGQoZmxhZyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGFuIFNESyBGbGFnIG1heSBiZSBjb25zaWRlcmVkIGFzIGVuYWJsZWQgZm9yIHRoZSBjdXJyZW50IFdvcmtmbG93IFRhc2suXG4gICAqXG4gICAqIFNESyBmbGFncyBwbGF5IGEgcm9sZSBzaW1pbGFyIHRvIHRoZSBgcGF0Y2hlZCgpYCBBUEksIGJ1dCBhcmUgbWVhbnQgZm9yIGludGVybmFsIHVzYWdlIGJ5IHRoZVxuICAgKiBTREsgaXRzZWxmLiBUaGV5IG1ha2UgaXQgcG9zc2libGUgZm9yIHRoZSBTREsgdG8gZXZvbHZlIGl0cyBiZWhhdmlvcnMgb3ZlciB0aW1lLCB3aGlsZSBzdGlsbFxuICAgKiBtYWludGFpbmluZyBjb21wYXRpYmlsaXR5IHdpdGggV29ya2Zsb3cgaGlzdG9yaWVzIHByb2R1Y2VkIGJ5IG9sZGVyIFNES3MsIHdpdGhvdXQgY2F1c2luZ1xuICAgKiBkZXRlcm1pbmlzbSB2aW9sYXRpb25zLlxuICAgKlxuICAgKiBNYXkgYmUgaW52b2tlZCBmcm9tIG91dHNpZGUgdGhlIFZNLlxuICAgKi9cbiAgcHVibGljIGhhc0ZsYWcoZmxhZzogU2RrRmxhZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmtub3duRmxhZ3MuaGFzKGZsYWcuaWQpKSByZXR1cm4gdHJ1ZTtcblxuICAgIC8vIElmIG5vdCByZXBsYXlpbmcsIGVuYWJsZSB0aGUgZmxhZyBpZiBpdCBpcyBjb25maWd1cmVkIHRvIGJlIGVuYWJsZWQgYnkgZGVmYXVsdC4gU2V0dGluZyBhXG4gICAgLy8gZmxhZydzIGRlZmF1bHQgdG8gZmFsc2UgYWxsb3dzIHByb2dyZXNzaXZlIHJvbGxvdXQgb2YgbmV3IGZlYXR1cmUgZmxhZ3MsIHdpdGggdGhlIHBvc3NpYmlsaXR5XG4gICAgLy8gb2YgcmV2ZXJ0aW5nIGJhY2sgdG8gYSB2ZXJzaW9uIG9mIHRoZSBTREsgd2hlcmUgdGhlIGZsYWcgaXMgc3VwcG9ydGVkIGJ1dCBkaXNhYmxlZCBieSBkZWZhdWx0LlxuICAgIC8vIEl0IGlzIGFsc28gdXNlZnVsIGZvciB0ZXN0aW5nIHB1cnBvc2UuXG4gICAgaWYgKCF0aGlzLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nICYmIGZsYWcuZGVmYXVsdCkge1xuICAgICAgdGhpcy5rbm93bkZsYWdzLmFkZChmbGFnLmlkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFdoZW4gcmVwbGF5aW5nLCBhIGZsYWcgaXMgY29uc2lkZXJlZCBlbmFibGVkIGlmIGl0IHdhcyBlbmFibGVkIGR1cmluZyB0aGUgb3JpZ2luYWwgZXhlY3V0aW9uIG9mXG4gICAgLy8gdGhhdCBXb3JrZmxvdyBUYXNrOyB0aGlzIGlzIG5vcm1hbGx5IGRldGVybWluZWQgYnkgdGhlIHByZXNlbmNlIG9mIHRoZSBmbGFnIElEIGluIHRoZSBjb3JyZXNwb25kaW5nXG4gICAgLy8gV0ZUIENvbXBsZXRlZCdzIGBzZGtNZXRhZGF0YS5sYW5nVXNlZEZsYWdzYC5cbiAgICAvL1xuICAgIC8vIFNESyBGbGFnIEFsdGVybmF0ZSBDb25kaXRpb24gcHJvdmlkZXMgYW4gYWx0ZXJuYXRpdmUgd2F5IG9mIGRldGVybWluaW5nIHdoZXRoZXIgYSBmbGFnIHNob3VsZFxuICAgIC8vIGJlIGNvbnNpZGVyZWQgYXMgZW5hYmxlZCBmb3IgdGhlIGN1cnJlbnQgV0ZUOyBlLmcuIGJ5IGxvb2tpbmcgYXQgdGhlIHZlcnNpb24gb2YgdGhlIFNESyB0aGF0XG4gICAgLy8gZW1pdHRlZCBhIFdGVC4gVGhlIG1haW4gdXNlIGNhc2UgZm9yIHRoaXMgaXMgdG8gcmV0cm9hY3RpdmVseSB0dXJuIG9uIHNvbWUgZmxhZ3MgZm9yIFdGVCBlbWl0dGVkXG4gICAgLy8gYnkgcHJldmlvdXMgU0RLcyB0aGF0IGNvbnRhaW5lZCBhIGJ1Zy4gQWx0IENvbmRpdGlvbnMgc2hvdWxkIG9ubHkgYmUgdXNlZCBhcyBhIGxhc3QgcmVzb3J0LlxuICAgIC8vXG4gICAgLy8gTm90ZSB0aGF0IGNvbmRpdGlvbnMgYXJlIG9ubHkgZXZhbHVhdGVkIHdoaWxlIHJlcGxheWluZy4gQWxzbywgYWx0ZXJuYXRlIGNvbmRpdGlvbnMgd2lsbCBub3RcbiAgICAvLyBjYXVzZSB0aGUgZmxhZyB0byBiZSBwZXJzaXN0ZWQgdG8gdGhlIFwidXNlZCBmbGFnc1wiIHNldCwgd2hpY2ggbWVhbnMgdGhhdCBmdXJ0aGVyIFdvcmtmbG93IFRhc2tzXG4gICAgLy8gbWF5IG5vdCByZWZsZWN0IHRoaXMgZmxhZyBpZiB0aGUgY29uZGl0aW9uIG5vIGxvbmdlciBob2xkcy4gVGhpcyBpcyBzbyB0byBhdm9pZCBpbmNvcnJlY3RcbiAgICAvLyBiZWhhdmlvcnMgaW4gY2FzZSB3aGVyZSBhIFdvcmtmbG93IEV4ZWN1dGlvbiBoYXMgZ29uZSB0aHJvdWdoIGEgbmV3ZXIgU0RLIHZlcnNpb24gdGhlbiBhZ2FpblxuICAgIC8vIHRocm91Z2ggYW4gb2xkZXIgb25lLlxuICAgIGlmICh0aGlzLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nICYmIGZsYWcuYWx0ZXJuYXRpdmVDb25kaXRpb25zKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvbmQgb2YgZmxhZy5hbHRlcm5hdGl2ZUNvbmRpdGlvbnMpIHtcbiAgICAgICAgaWYgKGNvbmQoeyBpbmZvOiB0aGlzLmluZm8gfSkpIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVGcm9tQ2FjaGUoKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdyZW1vdmVGcm9tQ2FjaGUgYWN0aXZhdGlvbiBqb2Igc2hvdWxkIG5vdCByZWFjaCB3b3JrZmxvdycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgZmFpbHVyZXMgaW50byBhIGNvbW1hbmQgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICAgKiBVc2VkIHRvIGhhbmRsZSBhbnkgZmFpbHVyZSBlbWl0dGVkIGJ5IHRoZSBXb3JrZmxvdy5cbiAgICovXG4gIGFzeW5jIGhhbmRsZVdvcmtmbG93RmFpbHVyZShlcnJvcjogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmNhbmNlbGxlZCAmJiBpc0NhbmNlbGxhdGlvbihlcnJvcikpIHtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoeyBjYW5jZWxXb3JrZmxvd0V4ZWN1dGlvbjoge30gfSwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIENvbnRpbnVlQXNOZXcpIHtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoeyBjb250aW51ZUFzTmV3V29ya2Zsb3dFeGVjdXRpb246IGVycm9yLmNvbW1hbmQgfSwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSkge1xuICAgICAgICAvLyBUaGlzIHJlc3VsdHMgaW4gYW4gdW5oYW5kbGVkIHJlamVjdGlvbiB3aGljaCB3aWxsIGZhaWwgdGhlIGFjdGl2YXRpb25cbiAgICAgICAgLy8gcHJldmVudGluZyBpdCBmcm9tIGNvbXBsZXRpbmcuXG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgICAgLy8gRmFpbCB0aGUgd29ya2Zsb3cuIFdlIGRvIG5vdCB3YW50IHRvIGlzc3VlIHVuZmluaXNoZWRIYW5kbGVycyB3YXJuaW5ncy4gVG8gYWNoaWV2ZSB0aGF0LCB3ZVxuICAgICAgLy8gbWFyayBhbGwgaGFuZGxlcnMgYXMgY29tcGxldGVkIG5vdy5cbiAgICAgIHRoaXMuaW5Qcm9ncmVzc1NpZ25hbHMuY2xlYXIoKTtcbiAgICAgIHRoaXMuaW5Qcm9ncmVzc1VwZGF0ZXMuY2xlYXIoKTtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoXG4gICAgICAgIHtcbiAgICAgICAgICBmYWlsV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICAgIGZhaWx1cmU6IHRoaXMuZXJyb3JUb0ZhaWx1cmUoZXJyb3IpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHRydWVcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb21wbGV0ZVF1ZXJ5KHF1ZXJ5SWQ6IHN0cmluZywgcmVzdWx0OiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICByZXNwb25kVG9RdWVyeTogeyBxdWVyeUlkLCBzdWNjZWVkZWQ6IHsgcmVzcG9uc2U6IHRoaXMucGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQocmVzdWx0KSB9IH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGZhaWxRdWVyeShxdWVyeUlkOiBzdHJpbmcsIGVycm9yOiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICByZXNwb25kVG9RdWVyeToge1xuICAgICAgICBxdWVyeUlkLFxuICAgICAgICBmYWlsZWQ6IHRoaXMuZXJyb3JUb0ZhaWx1cmUoZW5zdXJlVGVtcG9yYWxGYWlsdXJlKGVycm9yKSksXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhY2NlcHRVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHsgdXBkYXRlUmVzcG9uc2U6IHsgcHJvdG9jb2xJbnN0YW5jZUlkLCBhY2NlcHRlZDoge30gfSB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcGxldGVVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkOiBzdHJpbmcsIHJlc3VsdDogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgdXBkYXRlUmVzcG9uc2U6IHsgcHJvdG9jb2xJbnN0YW5jZUlkLCBjb21wbGV0ZWQ6IHRoaXMucGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQocmVzdWx0KSB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZWplY3RVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkOiBzdHJpbmcsIGVycm9yOiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICB1cGRhdGVSZXNwb25zZToge1xuICAgICAgICBwcm90b2NvbEluc3RhbmNlSWQsXG4gICAgICAgIHJlamVjdGVkOiB0aGlzLmVycm9yVG9GYWlsdXJlKGVuc3VyZVRlbXBvcmFsRmFpbHVyZShlcnJvcikpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBDb25zdW1lIGEgY29tcGxldGlvbiBpZiBpdCBleGlzdHMgaW4gV29ya2Zsb3cgc3RhdGUgKi9cbiAgcHJpdmF0ZSBtYXliZUNvbnN1bWVDb21wbGV0aW9uKHR5cGU6IGtleW9mIEFjdGl2YXRvclsnY29tcGxldGlvbnMnXSwgdGFza1NlcTogbnVtYmVyKTogQ29tcGxldGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY29tcGxldGlvbiA9IHRoaXMuY29tcGxldGlvbnNbdHlwZV0uZ2V0KHRhc2tTZXEpO1xuICAgIGlmIChjb21wbGV0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY29tcGxldGlvbnNbdHlwZV0uZGVsZXRlKHRhc2tTZXEpO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGxldGlvbjtcbiAgfVxuXG4gIC8qKiBDb25zdW1lIGEgY29tcGxldGlvbiBpZiBpdCBleGlzdHMgaW4gV29ya2Zsb3cgc3RhdGUsIHRocm93cyBpZiBpdCBkb2Vzbid0ICovXG4gIHByaXZhdGUgY29uc3VtZUNvbXBsZXRpb24odHlwZToga2V5b2YgQWN0aXZhdG9yWydjb21wbGV0aW9ucyddLCB0YXNrU2VxOiBudW1iZXIpOiBDb21wbGV0aW9uIHtcbiAgICBjb25zdCBjb21wbGV0aW9uID0gdGhpcy5tYXliZUNvbnN1bWVDb21wbGV0aW9uKHR5cGUsIHRhc2tTZXEpO1xuICAgIGlmIChjb21wbGV0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihgTm8gY29tcGxldGlvbiBmb3IgdGFza1NlcSAke3Rhc2tTZXF9YCk7XG4gICAgfVxuICAgIHJldHVybiBjb21wbGV0aW9uO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21wbGV0ZVdvcmtmbG93KHJlc3VsdDogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoXG4gICAgICB7XG4gICAgICAgIGNvbXBsZXRlV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICByZXN1bHQ6IHRoaXMucGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQocmVzdWx0KSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIGVycm9yVG9GYWlsdXJlKGVycjogdW5rbm93bik6IFByb3RvRmFpbHVyZSB7XG4gICAgcmV0dXJuIHRoaXMuZmFpbHVyZUNvbnZlcnRlci5lcnJvclRvRmFpbHVyZShlcnIsIHRoaXMucGF5bG9hZENvbnZlcnRlcik7XG4gIH1cblxuICBmYWlsdXJlVG9FcnJvcihmYWlsdXJlOiBQcm90b0ZhaWx1cmUpOiBFcnJvciB7XG4gICAgcmV0dXJuIHRoaXMuZmFpbHVyZUNvbnZlcnRlci5mYWlsdXJlVG9FcnJvcihmYWlsdXJlLCB0aGlzLnBheWxvYWRDb252ZXJ0ZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNlcTxUIGV4dGVuZHMgeyBzZXE/OiBudW1iZXIgfCBudWxsIH0+KGFjdGl2YXRpb246IFQpOiBudW1iZXIge1xuICBjb25zdCBzZXEgPSBhY3RpdmF0aW9uLnNlcTtcbiAgaWYgKHNlcSA9PT0gdW5kZWZpbmVkIHx8IHNlcSA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEdvdCBhY3RpdmF0aW9uIHdpdGggbm8gc2VxIGF0dHJpYnV0ZWApO1xuICB9XG4gIHJldHVybiBzZXE7XG59XG5cbmZ1bmN0aW9uIG1ha2VVbmZpbmlzaGVkVXBkYXRlSGFuZGxlck1lc3NhZ2UoaGFuZGxlckV4ZWN1dGlvbnM6IE1lc3NhZ2VIYW5kbGVyRXhlY3V0aW9uW10pOiBzdHJpbmcge1xuICBjb25zdCBtZXNzYWdlID0gYFxuW1RNUFJMMTEwMl0gV29ya2Zsb3cgZmluaXNoZWQgd2hpbGUgYW4gdXBkYXRlIGhhbmRsZXIgd2FzIHN0aWxsIHJ1bm5pbmcuIFRoaXMgbWF5IGhhdmUgaW50ZXJydXB0ZWQgd29yayB0aGF0IHRoZVxudXBkYXRlIGhhbmRsZXIgd2FzIGRvaW5nLCBhbmQgdGhlIGNsaWVudCB0aGF0IHNlbnQgdGhlIHVwZGF0ZSB3aWxsIHJlY2VpdmUgYSAnd29ya2Zsb3cgZXhlY3V0aW9uXG5hbHJlYWR5IGNvbXBsZXRlZCcgUlBDRXJyb3IgaW5zdGVhZCBvZiB0aGUgdXBkYXRlIHJlc3VsdC4gWW91IGNhbiB3YWl0IGZvciBhbGwgdXBkYXRlIGFuZCBzaWduYWxcbmhhbmRsZXJzIHRvIGNvbXBsZXRlIGJ5IHVzaW5nIFxcYGF3YWl0IHdvcmtmbG93LmNvbmRpdGlvbih3b3JrZmxvdy5hbGxIYW5kbGVyc0ZpbmlzaGVkKVxcYC5cbkFsdGVybmF0aXZlbHksIGlmIGJvdGggeW91IGFuZCB0aGUgY2xpZW50cyBzZW5kaW5nIHRoZSB1cGRhdGUgYXJlIG9rYXkgd2l0aCBpbnRlcnJ1cHRpbmcgcnVubmluZyBoYW5kbGVyc1xud2hlbiB0aGUgd29ya2Zsb3cgZmluaXNoZXMsIGFuZCBjYXVzaW5nIGNsaWVudHMgdG8gcmVjZWl2ZSBlcnJvcnMsIHRoZW4geW91IGNhbiBkaXNhYmxlIHRoaXMgd2FybmluZyBieVxucGFzc2luZyBhbiBvcHRpb24gd2hlbiBzZXR0aW5nIHRoZSBoYW5kbGVyOlxuXFxgd29ya2Zsb3cuc2V0SGFuZGxlcihteVVwZGF0ZSwgbXlVcGRhdGVIYW5kbGVyLCB7dW5maW5pc2hlZFBvbGljeTogSGFuZGxlclVuZmluaXNoZWRQb2xpY3kuQUJBTkRPTn0pO1xcYC5gXG4gICAgLnJlcGxhY2UoL1xcbi9nLCAnICcpXG4gICAgLnRyaW0oKTtcblxuICByZXR1cm4gYCR7bWVzc2FnZX0gVGhlIGZvbGxvd2luZyB1cGRhdGVzIHdlcmUgdW5maW5pc2hlZCAoYW5kIHdhcm5pbmdzIHdlcmUgbm90IGRpc2FibGVkIGZvciB0aGVpciBoYW5kbGVyKTogJHtKU09OLnN0cmluZ2lmeShcbiAgICBoYW5kbGVyRXhlY3V0aW9ucy5tYXAoKGV4KSA9PiAoeyBuYW1lOiBleC5uYW1lLCBpZDogZXguaWQgfSkpXG4gICl9YDtcbn1cblxuZnVuY3Rpb24gbWFrZVVuZmluaXNoZWRTaWduYWxIYW5kbGVyTWVzc2FnZShoYW5kbGVyRXhlY3V0aW9uczogTWVzc2FnZUhhbmRsZXJFeGVjdXRpb25bXSk6IHN0cmluZyB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBgXG5bVE1QUkwxMTAyXSBXb3JrZmxvdyBmaW5pc2hlZCB3aGlsZSBhIHNpZ25hbCBoYW5kbGVyIHdhcyBzdGlsbCBydW5uaW5nLiBUaGlzIG1heSBoYXZlIGludGVycnVwdGVkIHdvcmsgdGhhdCB0aGVcbnNpZ25hbCBoYW5kbGVyIHdhcyBkb2luZy4gWW91IGNhbiB3YWl0IGZvciBhbGwgdXBkYXRlIGFuZCBzaWduYWwgaGFuZGxlcnMgdG8gY29tcGxldGUgYnkgdXNpbmdcblxcYGF3YWl0IHdvcmtmbG93LmNvbmRpdGlvbih3b3JrZmxvdy5hbGxIYW5kbGVyc0ZpbmlzaGVkKVxcYC4gQWx0ZXJuYXRpdmVseSwgaWYgYm90aCB5b3UgYW5kIHRoZVxuY2xpZW50cyBzZW5kaW5nIHRoZSB1cGRhdGUgYXJlIG9rYXkgd2l0aCBpbnRlcnJ1cHRpbmcgcnVubmluZyBoYW5kbGVycyB3aGVuIHRoZSB3b3JrZmxvdyBmaW5pc2hlcyxcbnRoZW4geW91IGNhbiBkaXNhYmxlIHRoaXMgd2FybmluZyBieSBwYXNzaW5nIGFuIG9wdGlvbiB3aGVuIHNldHRpbmcgdGhlIGhhbmRsZXI6XG5cXGB3b3JrZmxvdy5zZXRIYW5kbGVyKG15U2lnbmFsLCBteVNpZ25hbEhhbmRsZXIsIHt1bmZpbmlzaGVkUG9saWN5OiBIYW5kbGVyVW5maW5pc2hlZFBvbGljeS5BQkFORE9OfSk7XFxgLmBcblxuICAgIC5yZXBsYWNlKC9cXG4vZywgJyAnKVxuICAgIC50cmltKCk7XG5cbiAgY29uc3QgbmFtZXMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICBmb3IgKGNvbnN0IGV4IG9mIGhhbmRsZXJFeGVjdXRpb25zKSB7XG4gICAgY29uc3QgY291bnQgPSBuYW1lcy5nZXQoZXgubmFtZSkgfHwgMDtcbiAgICBuYW1lcy5zZXQoZXgubmFtZSwgY291bnQgKyAxKTtcbiAgfVxuXG4gIHJldHVybiBgJHttZXNzYWdlfSBUaGUgZm9sbG93aW5nIHNpZ25hbHMgd2VyZSB1bmZpbmlzaGVkIChhbmQgd2FybmluZ3Mgd2VyZSBub3QgZGlzYWJsZWQgZm9yIHRoZWlyIGhhbmRsZXIpOiAke0pTT04uc3RyaW5naWZ5KFxuICAgIEFycmF5LmZyb20obmFtZXMuZW50cmllcygpKS5tYXAoKFtuYW1lLCBjb3VudF0pID0+ICh7IG5hbWUsIGNvdW50IH0pKVxuICApfWA7XG59XG4iLCJpbXBvcnQgeyBjb21wb3NlSW50ZXJjZXB0b3JzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgU2RrQ29tcG9uZW50IH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCB7IHR5cGUgU2luaywgdHlwZSBTaW5rcywgcHJveHlTaW5rcyB9IGZyb20gJy4vc2lua3MnO1xuaW1wb3J0IHsgaXNDYW5jZWxsYXRpb24gfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBXb3JrZmxvd0luZm8sIENvbnRpbnVlQXNOZXcgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0xvZ2dlciBleHRlbmRzIFNpbmsge1xuICB0cmFjZShtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xuICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xuICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG4gIHdhcm4obWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbn1cblxuLyoqXG4gKiBTaW5rIGludGVyZmFjZSBmb3IgZm9yd2FyZGluZyBsb2dzIGZyb20gdGhlIFdvcmtmbG93IHNhbmRib3ggdG8gdGhlIFdvcmtlclxuICpcbiAqIEBkZXByZWNhdGVkIERvIG5vdCB1c2UgTG9nZ2VyU2lua3MgZGlyZWN0bHkuIFRvIGxvZyBmcm9tIFdvcmtmbG93IGNvZGUsIHVzZSB0aGUgYGxvZ2Agb2JqZWN0XG4gKiAgICAgICAgICAgICBleHBvcnRlZCBieSB0aGUgYEB0ZW1wb3JhbGlvL3dvcmtmbG93YCBwYWNrYWdlLiBUbyBjYXB0dXJlIGxvZyBtZXNzYWdlcyBlbWl0dGVkXG4gKiAgICAgICAgICAgICBieSBXb3JrZmxvdyBjb2RlLCBzZXQgdGhlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyU2lua3NEZXByZWNhdGVkIGV4dGVuZHMgU2lua3Mge1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgRG8gbm90IHVzZSBMb2dnZXJTaW5rcyBkaXJlY3RseS4gVG8gbG9nIGZyb20gV29ya2Zsb3cgY29kZSwgdXNlIHRoZSBgbG9nYCBvYmplY3RcbiAgICogICAgICAgICAgICAgZXhwb3J0ZWQgYnkgdGhlIGBAdGVtcG9yYWxpby93b3JrZmxvd2AgcGFja2FnZS4gVG8gY2FwdHVyZSBsb2cgbWVzc2FnZXMgZW1pdHRlZFxuICAgKiAgICAgICAgICAgICBieSBXb3JrZmxvdyBjb2RlLCBzZXQgdGhlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gcHJvcGVydHkuXG4gICAqL1xuICBkZWZhdWx0V29ya2VyTG9nZ2VyOiBXb3JrZmxvd0xvZ2dlcjtcbn1cblxuLyoqXG4gKiBTaW5rIGludGVyZmFjZSBmb3IgZm9yd2FyZGluZyBsb2dzIGZyb20gdGhlIFdvcmtmbG93IHNhbmRib3ggdG8gdGhlIFdvcmtlclxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlclNpbmtzSW50ZXJuYWwgZXh0ZW5kcyBTaW5rcyB7XG4gIF9fdGVtcG9yYWxfbG9nZ2VyOiBXb3JrZmxvd0xvZ2dlcjtcbn1cblxuY29uc3QgbG9nZ2VyU2luayA9IHByb3h5U2lua3M8TG9nZ2VyU2lua3NJbnRlcm5hbD4oKS5fX3RlbXBvcmFsX2xvZ2dlcjtcblxuLyoqXG4gKiBTeW1ib2wgdXNlZCBieSB0aGUgU0RLIGxvZ2dlciB0byBleHRyYWN0IGEgdGltZXN0YW1wIGZyb20gbG9nIGF0dHJpYnV0ZXMuXG4gKiBBbHNvIGRlZmluZWQgaW4gYHdvcmtlci9sb2dnZXIudHNgIC0gaW50ZW50aW9uYWxseSBub3Qgc2hhcmVkLlxuICovXG5jb25zdCBMb2dUaW1lc3RhbXAgPSBTeW1ib2wuZm9yKCdsb2dfdGltZXN0YW1wJyk7XG5cbi8qKlxuICogRGVmYXVsdCB3b3JrZmxvdyBsb2dnZXIuXG4gKlxuICogVGhpcyBsb2dnZXIgaXMgcmVwbGF5LWF3YXJlIGFuZCB3aWxsIG9taXQgbG9nIG1lc3NhZ2VzIG9uIHdvcmtmbG93IHJlcGxheS4gTWVzc2FnZXMgZW1pdHRlZCBieSB0aGlzIGxvZ2dlciBhcmVcbiAqIGZ1bm5lbGxlZCB0aHJvdWdoIGEgc2luayB0aGF0IGZvcndhcmRzIHRoZW0gdG8gdGhlIGxvZ2dlciByZWdpc3RlcmVkIG9uIHtAbGluayBSdW50aW1lLmxvZ2dlcn0uXG4gKlxuICogQXR0cmlidXRlcyBmcm9tIHRoZSBjdXJyZW50IFdvcmtmbG93IEV4ZWN1dGlvbiBjb250ZXh0IGFyZSBhdXRvbWF0aWNhbGx5IGluY2x1ZGVkIGFzIG1ldGFkYXRhIG9uIGV2ZXJ5IGxvZ1xuICogZW50cmllcy4gQW4gZXh0cmEgYHNka0NvbXBvbmVudGAgbWV0YWRhdGEgYXR0cmlidXRlIGlzIGFsc28gYWRkZWQsIHdpdGggdmFsdWUgYHdvcmtmbG93YDsgdGhpcyBjYW4gYmUgdXNlZCBmb3JcbiAqIGZpbmUtZ3JhaW5lZCBmaWx0ZXJpbmcgb2YgbG9nIGVudHJpZXMgZnVydGhlciBkb3duc3RyZWFtLlxuICpcbiAqIFRvIGN1c3RvbWl6ZSBsb2cgYXR0cmlidXRlcywgcmVnaXN0ZXIgYSB7QGxpbmsgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3J9IHRoYXQgaW50ZXJjZXB0cyB0aGVcbiAqIGBnZXRMb2dBdHRyaWJ1dGVzKClgIG1ldGhvZC5cbiAqXG4gKiBOb3RpY2UgdGhhdCBzaW5jZSBzaW5rcyBhcmUgdXNlZCB0byBwb3dlciB0aGlzIGxvZ2dlciwgYW55IGxvZyBhdHRyaWJ1dGVzIG11c3QgYmUgdHJhbnNmZXJhYmxlIHZpYSB0aGVcbiAqIHtAbGluayBodHRwczovL25vZGVqcy5vcmcvYXBpL3dvcmtlcl90aHJlYWRzLmh0bWwjd29ya2VyX3RocmVhZHNfcG9ydF9wb3N0bWVzc2FnZV92YWx1ZV90cmFuc2Zlcmxpc3QgfCBwb3N0TWVzc2FnZX1cbiAqIEFQSS5cbiAqXG4gKiBOT1RFOiBTcGVjaWZ5aW5nIGEgY3VzdG9tIGxvZ2dlciB0aHJvdWdoIHtAbGluayBkZWZhdWx0U2lua30gb3IgYnkgbWFudWFsbHkgcmVnaXN0ZXJpbmcgYSBzaW5rIG5hbWVkXG4gKiBgZGVmYXVsdFdvcmtlckxvZ2dlcmAgaGFzIGJlZW4gZGVwcmVjYXRlZC4gUGxlYXNlIHVzZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBsb2c6IFdvcmtmbG93TG9nZ2VyID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAoWyd0cmFjZScsICdkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSBhcyBBcnJheTxrZXlvZiBXb3JrZmxvd0xvZ2dlcj4pLm1hcCgobGV2ZWwpID0+IHtcbiAgICByZXR1cm4gW1xuICAgICAgbGV2ZWwsXG4gICAgICAobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5sb2coLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gd29ya2Zsb3cgY29udGV4dC4nKTtcbiAgICAgICAgY29uc3QgZ2V0TG9nQXR0cmlidXRlcyA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ2dldExvZ0F0dHJpYnV0ZXMnLCAoYSkgPT4gYSk7XG4gICAgICAgIHJldHVybiBsb2dnZXJTaW5rW2xldmVsXShtZXNzYWdlLCB7XG4gICAgICAgICAgLy8gSW5qZWN0IHRoZSBjYWxsIHRpbWUgaW4gbmFub3NlY29uZCByZXNvbHV0aW9uIGFzIGV4cGVjdGVkIGJ5IHRoZSB3b3JrZXIgbG9nZ2VyLlxuICAgICAgICAgIFtMb2dUaW1lc3RhbXBdOiBhY3RpdmF0b3IuZ2V0VGltZU9mRGF5KCksXG4gICAgICAgICAgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2Zsb3csXG4gICAgICAgICAgLi4uZ2V0TG9nQXR0cmlidXRlcyh3b3JrZmxvd0xvZ0F0dHJpYnV0ZXMoYWN0aXZhdG9yLmluZm8pKSxcbiAgICAgICAgICAuLi5hdHRycyxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIF07XG4gIH0pXG4pIGFzIGFueTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVXaXRoTGlmZWN5Y2xlTG9nZ2luZyhmbjogKCkgPT4gUHJvbWlzZTx1bmtub3duPik6IFByb21pc2U8dW5rbm93bj4ge1xuICBsb2cuZGVidWcoJ1dvcmtmbG93IHN0YXJ0ZWQnLCB7IHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtlciB9KTtcbiAgY29uc3QgcCA9IGZuKCkudGhlbihcbiAgICAocmVzKSA9PiB7XG4gICAgICBsb2cuZGVidWcoJ1dvcmtmbG93IGNvbXBsZXRlZCcsIHsgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9LFxuICAgIChlcnJvcikgPT4ge1xuICAgICAgLy8gQXZvaWQgdXNpbmcgaW5zdGFuY2VvZiBjaGVja3MgaW4gY2FzZSB0aGUgbW9kdWxlcyB0aGV5J3JlIGRlZmluZWQgaW4gbG9hZGVkIG1vcmUgdGhhbiBvbmNlLFxuICAgICAgLy8gZS5nLiBieSBqZXN0IG9yIHdoZW4gbXVsdGlwbGUgdmVyc2lvbnMgYXJlIGluc3RhbGxlZC5cbiAgICAgIGlmICh0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmIGVycm9yICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGlzQ2FuY2VsbGF0aW9uKGVycm9yKSkge1xuICAgICAgICAgIGxvZy5kZWJ1ZygnV29ya2Zsb3cgY29tcGxldGVkIGFzIGNhbmNlbGxlZCcsIHsgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9IGVsc2UgaWYgKGVycm9yIGluc3RhbmNlb2YgQ29udGludWVBc05ldykge1xuICAgICAgICAgIGxvZy5kZWJ1ZygnV29ya2Zsb3cgY29udGludWVkIGFzIG5ldycsIHsgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsb2cud2FybignV29ya2Zsb3cgZmFpbGVkJywgeyBlcnJvciwgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICApO1xuICAvLyBBdm9pZCBzaG93aW5nIHRoaXMgaW50ZXJjZXB0b3IgaW4gc3RhY2sgdHJhY2UgcXVlcnlcbiAgdW50cmFja1Byb21pc2UocCk7XG4gIHJldHVybiBwO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBtYXAgb2YgYXR0cmlidXRlcyB0byBiZSBzZXQgX2J5IGRlZmF1bHRfIG9uIGxvZyBtZXNzYWdlcyBmb3IgYSBnaXZlbiBXb3JrZmxvdy5cbiAqIE5vdGUgdGhhdCB0aGlzIGZ1bmN0aW9uIG1heSBiZSBjYWxsZWQgZnJvbSBvdXRzaWRlIG9mIHRoZSBXb3JrZmxvdyBjb250ZXh0IChlZy4gYnkgdGhlIHdvcmtlciBpdHNlbGYpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd29ya2Zsb3dMb2dBdHRyaWJ1dGVzKGluZm86IFdvcmtmbG93SW5mbyk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lc3BhY2U6IGluZm8ubmFtZXNwYWNlLFxuICAgIHRhc2tRdWV1ZTogaW5mby50YXNrUXVldWUsXG4gICAgd29ya2Zsb3dJZDogaW5mby53b3JrZmxvd0lkLFxuICAgIHJ1bklkOiBpbmZvLnJ1bklkLFxuICAgIHdvcmtmbG93VHlwZTogaW5mby53b3JrZmxvd1R5cGUsXG4gIH07XG59XG4iLCIvLyAuLi9wYWNrYWdlLmpzb24gaXMgb3V0c2lkZSBvZiB0aGUgVFMgcHJvamVjdCByb290RGlyIHdoaWNoIGNhdXNlcyBUUyB0byBjb21wbGFpbiBhYm91dCB0aGlzIGltcG9ydC5cbi8vIFdlIGRvIG5vdCB3YW50IHRvIGNoYW5nZSB0aGUgcm9vdERpciBiZWNhdXNlIGl0IG1lc3NlcyB1cCB0aGUgb3V0cHV0IHN0cnVjdHVyZS5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBwa2cgZnJvbSAnLi4vcGFja2FnZS5qc29uJztcblxuZXhwb3J0IGRlZmF1bHQgcGtnIGFzIHsgbmFtZTogc3RyaW5nOyB2ZXJzaW9uOiBzdHJpbmcgfTtcbiIsIi8qKlxuICogVHlwZSBkZWZpbml0aW9ucyBmb3IgdGhlIFdvcmtmbG93IGVuZCBvZiB0aGUgc2lua3MgbWVjaGFuaXNtLlxuICpcbiAqIFNpbmtzIGFyZSBhIG1lY2hhbmlzbSBmb3IgZXhwb3J0aW5nIGRhdGEgZnJvbSB0aGUgV29ya2Zsb3cgaXNvbGF0ZSB0byB0aGVcbiAqIE5vZGUuanMgZW52aXJvbm1lbnQsIHRoZXkgYXJlIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBXb3JrZmxvdyBoYXMgbm8gd2F5IHRvXG4gKiBjb21tdW5pY2F0ZSB3aXRoIHRoZSBvdXRzaWRlIFdvcmxkLlxuICpcbiAqIFNpbmtzIGFyZSB0eXBpY2FsbHkgdXNlZCBmb3IgZXhwb3J0aW5nIGxvZ3MsIG1ldHJpY3MgYW5kIHRyYWNlcyBvdXQgZnJvbSB0aGVcbiAqIFdvcmtmbG93LlxuICpcbiAqIFNpbmsgZnVuY3Rpb25zIG1heSBub3QgcmV0dXJuIHZhbHVlcyB0byB0aGUgV29ya2Zsb3cgaW4gb3JkZXIgdG8gcHJldmVudFxuICogYnJlYWtpbmcgZGV0ZXJtaW5pc20uXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IFdvcmtmbG93SW5mbyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhc3NlcnRJbldvcmtmbG93Q29udGV4dCB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuXG4vKipcbiAqIEFueSBmdW5jdGlvbiBzaWduYXR1cmUgY2FuIGJlIHVzZWQgZm9yIFNpbmsgZnVuY3Rpb25zIGFzIGxvbmcgYXMgdGhlIHJldHVybiB0eXBlIGlzIGB2b2lkYC5cbiAqXG4gKiBXaGVuIGNhbGxpbmcgYSBTaW5rIGZ1bmN0aW9uLCBhcmd1bWVudHMgYXJlIGNvcGllZCBmcm9tIHRoZSBXb3JrZmxvdyBpc29sYXRlIHRvIHRoZSBOb2RlLmpzIGVudmlyb25tZW50IHVzaW5nXG4gKiB7QGxpbmsgaHR0cHM6Ly9ub2RlanMub3JnL2FwaS93b3JrZXJfdGhyZWFkcy5odG1sI3dvcmtlcl90aHJlYWRzX3BvcnRfcG9zdG1lc3NhZ2VfdmFsdWVfdHJhbnNmZXJsaXN0IHwgcG9zdE1lc3NhZ2V9LlxuXG4gKiBUaGlzIGNvbnN0cmFpbnMgdGhlIGFyZ3VtZW50IHR5cGVzIHRvIHByaW1pdGl2ZXMgKGV4Y2x1ZGluZyBTeW1ib2xzKS5cbiAqL1xuZXhwb3J0IHR5cGUgU2lua0Z1bmN0aW9uID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkO1xuXG4vKiogQSBtYXBwaW5nIG9mIG5hbWUgdG8gZnVuY3Rpb24sIGRlZmluZXMgYSBzaW5nbGUgc2luayAoZS5nLiBsb2dnZXIpICovXG5leHBvcnQgdHlwZSBTaW5rID0gUmVjb3JkPHN0cmluZywgU2lua0Z1bmN0aW9uPjtcbi8qKlxuICogV29ya2Zsb3cgU2luayBhcmUgYSBtYXBwaW5nIG9mIG5hbWUgdG8ge0BsaW5rIFNpbmt9XG4gKi9cbmV4cG9ydCB0eXBlIFNpbmtzID0gUmVjb3JkPHN0cmluZywgU2luaz47XG5cbi8qKlxuICogQ2FsbCBpbmZvcm1hdGlvbiBmb3IgYSBTaW5rXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lua0NhbGwge1xuICBpZmFjZU5hbWU6IHN0cmluZztcbiAgZm5OYW1lOiBzdHJpbmc7XG4gIGFyZ3M6IGFueVtdO1xuICB3b3JrZmxvd0luZm86IFdvcmtmbG93SW5mbztcbn1cblxuLyoqXG4gKiBHZXQgYSByZWZlcmVuY2UgdG8gU2lua3MgZm9yIGV4cG9ydGluZyBkYXRhIG91dCBvZiB0aGUgV29ya2Zsb3cuXG4gKlxuICogVGhlc2UgU2lua3MgKiptdXN0KiogYmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBXb3JrZXIgaW4gb3JkZXIgZm9yIHRoaXNcbiAqIG1lY2hhbmlzbSB0byB3b3JrLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcHJveHlTaW5rcywgU2lua3MgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG4gKlxuICogaW50ZXJmYWNlIE15U2lua3MgZXh0ZW5kcyBTaW5rcyB7XG4gKiAgIGxvZ2dlcjoge1xuICogICAgIGluZm8obWVzc2FnZTogc3RyaW5nKTogdm9pZDtcbiAqICAgICBlcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xuICogICB9O1xuICogfVxuICpcbiAqIGNvbnN0IHsgbG9nZ2VyIH0gPSBwcm94eVNpbmtzPE15RGVwZW5kZW5jaWVzPigpO1xuICogbG9nZ2VyLmluZm8oJ3NldHRpbmcgdXAnKTtcbiAqXG4gKiBleHBvcnQgZnVuY3Rpb24gbXlXb3JrZmxvdygpIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICBhc3luYyBleGVjdXRlKCkge1xuICogICAgICAgbG9nZ2VyLmluZm8oXCJoZXkgaG9cIik7XG4gKiAgICAgICBsb2dnZXIuZXJyb3IoXCJsZXRzIGdvXCIpO1xuICogICAgIH1cbiAqICAgfTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJveHlTaW5rczxUIGV4dGVuZHMgU2lua3M+KCk6IFQge1xuICByZXR1cm4gbmV3IFByb3h5KFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGdldChfLCBpZmFjZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eShcbiAgICAgICAgICB7fSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBnZXQoXywgZm5OYW1lKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAgICAgICAgICAgICAgICdQcm94aWVkIHNpbmtzIGZ1bmN0aW9ucyBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYWN0aXZhdG9yLnNpbmtDYWxscy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIGlmYWNlTmFtZTogaWZhY2VOYW1lIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgIGZuTmFtZTogZm5OYW1lIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgIC8vIFNpbmsgZnVuY3Rpb24gZG9lc24ndCBnZXQgY2FsbGVkIGltbWVkaWF0ZWx5LiBNYWtlIGEgY2xvbmUgb2YgdGhlIHNpbmsncyBhcmdzLCBzbyB0aGF0IGZ1cnRoZXIgbXV0YXRpb25zXG4gICAgICAgICAgICAgICAgICAvLyB0byB0aGVzZSBvYmplY3RzIGRvbid0IGNvcnJ1cHQgdGhlIGFyZ3MgdGhhdCB0aGUgc2luayBmdW5jdGlvbiB3aWxsIHJlY2VpdmUuIE9ubHkgYXZhaWxhYmxlIGZyb20gbm9kZSAxNy5cbiAgICAgICAgICAgICAgICAgIGFyZ3M6IChnbG9iYWxUaGlzIGFzIGFueSkuc3RydWN0dXJlZENsb25lID8gKGdsb2JhbFRoaXMgYXMgYW55KS5zdHJ1Y3R1cmVkQ2xvbmUoYXJncykgOiBhcmdzLFxuICAgICAgICAgICAgICAgICAgLy8gYWN0aXZhdG9yLmluZm8gaXMgaW50ZXJuYWxseSBjb3B5LW9uLXdyaXRlLiBUaGlzIGVuc3VyZSB0aGF0IGFueSBmdXJ0aGVyIG11dGF0aW9uc1xuICAgICAgICAgICAgICAgICAgLy8gdG8gdGhlIHdvcmtmbG93IHN0YXRlIGluIHRoZSBjb250ZXh0IG9mIHRoZSBwcmVzZW50IGFjdGl2YXRpb24gd2lsbCBub3QgY29ycnVwdCB0aGVcbiAgICAgICAgICAgICAgICAgIC8vIHdvcmtmbG93SW5mbyBzdGF0ZSB0aGF0IGdldHMgcGFzc2VkIHdoZW4gdGhlIHNpbmsgZnVuY3Rpb24gYWN0dWFsbHkgZ2V0cyBjYWxsZWQuXG4gICAgICAgICAgICAgICAgICB3b3JrZmxvd0luZm86IGFjdGl2YXRvci5pbmZvLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9LFxuICAgIH1cbiAgKSBhcyBhbnk7XG59XG4iLCJpbXBvcnQgeyBtYXliZUdldEFjdGl2YXRvclVudHlwZWQgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB0eXBlIHsgUHJvbWlzZVN0YWNrU3RvcmUgfSBmcm9tICcuL2ludGVybmFscyc7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHJlbW92ZSBhIHByb21pc2UgZnJvbSBiZWluZyB0cmFja2VkIGZvciBzdGFjayB0cmFjZSBxdWVyeSBwdXJwb3Nlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdW50cmFja1Byb21pc2UocHJvbWlzZTogUHJvbWlzZTx1bmtub3duPik6IHZvaWQge1xuICBjb25zdCBzdG9yZSA9IChtYXliZUdldEFjdGl2YXRvclVudHlwZWQoKSBhcyBhbnkpPy5wcm9taXNlU3RhY2tTdG9yZSBhcyBQcm9taXNlU3RhY2tTdG9yZSB8IHVuZGVmaW5lZDtcbiAgaWYgKCFzdG9yZSkgcmV0dXJuO1xuICBzdG9yZS5jaGlsZFRvUGFyZW50LmRlbGV0ZShwcm9taXNlKTtcbiAgc3RvcmUucHJvbWlzZVRvU3RhY2suZGVsZXRlKHByb21pc2UpO1xufVxuIiwiaW1wb3J0IHsgQ2FuY2VsbGF0aW9uU2NvcGUgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5cbi8qKlxuICogQSBgUHJvbWlzZUxpa2VgIGhlbHBlciB3aGljaCBleHBvc2VzIGl0cyBgcmVzb2x2ZWAgYW5kIGByZWplY3RgIG1ldGhvZHMuXG4gKlxuICogVHJpZ2dlciBpcyBDYW5jZWxsYXRpb25TY29wZS1hd2FyZTogaXQgaXMgbGlua2VkIHRvIHRoZSBjdXJyZW50IHNjb3BlIG9uXG4gKiBjb25zdHJ1Y3Rpb24gYW5kIHRocm93cyB3aGVuIHRoYXQgc2NvcGUgaXMgY2FuY2VsbGVkLlxuICpcbiAqIFVzZWZ1bCBmb3IgZS5nLiB3YWl0aW5nIGZvciB1bmJsb2NraW5nIGEgV29ya2Zsb3cgZnJvbSBhIFNpZ25hbC5cbiAqXG4gKiBAZXhhbXBsZVxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXRyaWdnZXItd29ya2Zsb3ctLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKi9cbmV4cG9ydCBjbGFzcyBUcmlnZ2VyPFQ+IGltcGxlbWVudHMgUHJvbWlzZUxpa2U8VD4ge1xuICAvLyBUeXBlc2NyaXB0IGRvZXMgbm90IHJlYWxpemUgdGhhdCB0aGUgcHJvbWlzZSBleGVjdXRvciBpcyBydW4gc3luY2hyb25vdXNseSBpbiB0aGUgY29uc3RydWN0b3JcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHB1YmxpYyByZWFkb25seSByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZDtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHB1YmxpYyByZWFkb25seSByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQ7XG4gIHByb3RlY3RlZCByZWFkb25seSBwcm9taXNlOiBQcm9taXNlPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIH1cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcbiAgICAvLyBBdm9pZCB1bmhhbmRsZWQgcmVqZWN0aW9uc1xuICAgIHVudHJhY2tQcm9taXNlKHRoaXMucHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpKTtcbiAgfVxuXG4gIHRoZW48VFJlc3VsdDEgPSBULCBUUmVzdWx0MiA9IG5ldmVyPihcbiAgICBvbmZ1bGZpbGxlZD86ICgodmFsdWU6IFQpID0+IFRSZXN1bHQxIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDE+KSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgb25yZWplY3RlZD86ICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQyIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDI+KSB8IHVuZGVmaW5lZCB8IG51bGxcbiAgKTogUHJvbWlzZUxpa2U8VFJlc3VsdDEgfCBUUmVzdWx0Mj4ge1xuICAgIHJldHVybiB0aGlzLnByb21pc2UudGhlbihvbmZ1bGZpbGxlZCwgb25yZWplY3RlZCk7XG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgQXN5bmNMb2NhbFN0b3JhZ2UgYXMgQUxTIH0gZnJvbSAnbm9kZTphc3luY19ob29rcyc7XG5cbi8qKlxuICogT3B0aW9uIGZvciBjb25zdHJ1Y3RpbmcgYSBVcGRhdGVTY29wZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVwZGF0ZVNjb3BlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiAgQSB3b3JrZmxvdy11bmlxdWUgaWRlbnRpZmllciBmb3IgdGhpcyB1cGRhdGUuXG4gICAqL1xuICBpZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiAgVGhlIHVwZGF0ZSB0eXBlIG5hbWUuXG4gICAqL1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbi8vIEFzeW5jTG9jYWxTdG9yYWdlIGlzIGluamVjdGVkIHZpYSB2bSBtb2R1bGUgaW50byBnbG9iYWwgc2NvcGUuXG4vLyBJbiBjYXNlIFdvcmtmbG93IGNvZGUgaXMgaW1wb3J0ZWQgaW4gTm9kZS5qcyBjb250ZXh0LCByZXBsYWNlIHdpdGggYW4gZW1wdHkgY2xhc3MuXG5leHBvcnQgY29uc3QgQXN5bmNMb2NhbFN0b3JhZ2U6IG5ldyA8VD4oKSA9PiBBTFM8VD4gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLkFzeW5jTG9jYWxTdG9yYWdlID8/IGNsYXNzIHt9O1xuXG5leHBvcnQgY2xhc3MgVXBkYXRlU2NvcGUge1xuICAvKipcbiAgICogIEEgd29ya2Zsb3ctdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgdXBkYXRlLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqICBUaGUgdXBkYXRlIHR5cGUgbmFtZS5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogVXBkYXRlU2NvcGVPcHRpb25zKSB7XG4gICAgdGhpcy5pZCA9IG9wdGlvbnMuaWQ7XG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlIHRoZSBzY29wZSBhcyBjdXJyZW50IGFuZCBydW4gdGhlIHVwZGF0ZSBoYW5kbGVyIGBmbmAuXG4gICAqXG4gICAqIEByZXR1cm4gdGhlIHJlc3VsdCBvZiBgZm5gXG4gICAqL1xuICBydW48VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gc3RvcmFnZS5ydW4odGhpcywgZm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBcImFjdGl2ZVwiIHVwZGF0ZSBzY29wZS5cbiAgICovXG4gIHN0YXRpYyBjdXJyZW50KCk6IFVwZGF0ZVNjb3BlIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gc3RvcmFnZS5nZXRTdG9yZSgpO1xuICB9XG5cbiAgLyoqIEFsaWFzIHRvIGBuZXcgVXBkYXRlU2NvcGUoeyBpZCwgbmFtZSB9KS5ydW4oZm4pYCAqL1xuICBzdGF0aWMgdXBkYXRlV2l0aEluZm88VD4oaWQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCBmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgdGhpcyh7IGlkLCBuYW1lIH0pLnJ1bihmbik7XG4gIH1cbn1cblxuY29uc3Qgc3RvcmFnZSA9IG5ldyBBc3luY0xvY2FsU3RvcmFnZTxVcGRhdGVTY29wZT4oKTtcblxuLyoqXG4gKiBEaXNhYmxlIHRoZSBhc3luYyBsb2NhbCBzdG9yYWdlIGZvciB1cGRhdGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZVVwZGF0ZVN0b3JhZ2UoKTogdm9pZCB7XG4gIHN0b3JhZ2UuZGlzYWJsZSgpO1xufVxuIiwiLyoqXG4gKiBFeHBvcnRlZCBmdW5jdGlvbnMgZm9yIHRoZSBXb3JrZXIgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgV29ya2Zsb3cgaXNvbGF0ZVxuICpcbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHsgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBkaXNhYmxlU3RvcmFnZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IGRpc2FibGVVcGRhdGVTdG9yYWdlIH0gZnJvbSAnLi91cGRhdGUtc2NvcGUnO1xuaW1wb3J0IHsgV29ya2Zsb3dJbnRlcmNlcHRvcnNGYWN0b3J5IH0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQWN0aXZhdG9yIH0gZnJvbSAnLi9pbnRlcm5hbHMnO1xuaW1wb3J0IHsgc2V0QWN0aXZhdG9yVW50eXBlZCwgZ2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5cbi8vIEV4cG9ydCB0aGUgdHlwZSBmb3IgdXNlIG9uIHRoZSBcIndvcmtlclwiIHNpZGVcbmV4cG9ydCB7IFByb21pc2VTdGFja1N0b3JlIH0gZnJvbSAnLi9pbnRlcm5hbHMnO1xuXG5jb25zdCBnbG9iYWwgPSBnbG9iYWxUaGlzIGFzIGFueTtcbmNvbnN0IE9yaWdpbmFsRGF0ZSA9IGdsb2JhbFRoaXMuRGF0ZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBpc29sYXRlIHJ1bnRpbWUuXG4gKlxuICogU2V0cyByZXF1aXJlZCBpbnRlcm5hbCBzdGF0ZSBhbmQgaW5zdGFudGlhdGVzIHRoZSB3b3JrZmxvdyBhbmQgaW50ZXJjZXB0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5pdFJ1bnRpbWUob3B0aW9uczogV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gbmV3IEFjdGl2YXRvcih7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBpbmZvOiBmaXhQcm90b3R5cGVzKHtcbiAgICAgIC4uLm9wdGlvbnMuaW5mbyxcbiAgICAgIHVuc2FmZTogeyAuLi5vcHRpb25zLmluZm8udW5zYWZlLCBub3c6IE9yaWdpbmFsRGF0ZS5ub3cgfSxcbiAgICB9KSxcbiAgfSk7XG4gIC8vIFRoZXJlJ3Mgb25lIGFjdGl2YXRvciBwZXIgd29ya2Zsb3cgaW5zdGFuY2UsIHNldCBpdCBnbG9iYWxseSBvbiB0aGUgY29udGV4dC5cbiAgLy8gV2UgZG8gdGhpcyBiZWZvcmUgaW1wb3J0aW5nIGFueSB1c2VyIGNvZGUgc28gdXNlciBjb2RlIGNhbiBzdGF0aWNhbGx5IHJlZmVyZW5jZSBAdGVtcG9yYWxpby93b3JrZmxvdyBmdW5jdGlvbnNcbiAgLy8gYXMgd2VsbCBhcyBEYXRlIGFuZCBNYXRoLnJhbmRvbS5cbiAgc2V0QWN0aXZhdG9yVW50eXBlZChhY3RpdmF0b3IpO1xuXG4gIC8vIHdlYnBhY2sgYWxpYXMgdG8gcGF5bG9hZENvbnZlcnRlclBhdGhcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbiAgY29uc3QgY3VzdG9tUGF5bG9hZENvbnZlcnRlciA9IHJlcXVpcmUoJ19fdGVtcG9yYWxfY3VzdG9tX3BheWxvYWRfY29udmVydGVyJykucGF5bG9hZENvbnZlcnRlcjtcbiAgLy8gVGhlIGBwYXlsb2FkQ29udmVydGVyYCBleHBvcnQgaXMgdmFsaWRhdGVkIGluIHRoZSBXb3JrZXJcbiAgaWYgKGN1c3RvbVBheWxvYWRDb252ZXJ0ZXIgIT0gbnVsbCkge1xuICAgIGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyID0gY3VzdG9tUGF5bG9hZENvbnZlcnRlcjtcbiAgfVxuICAvLyB3ZWJwYWNrIGFsaWFzIHRvIGZhaWx1cmVDb252ZXJ0ZXJQYXRoXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzXG4gIGNvbnN0IGN1c3RvbUZhaWx1cmVDb252ZXJ0ZXIgPSByZXF1aXJlKCdfX3RlbXBvcmFsX2N1c3RvbV9mYWlsdXJlX2NvbnZlcnRlcicpLmZhaWx1cmVDb252ZXJ0ZXI7XG4gIC8vIFRoZSBgZmFpbHVyZUNvbnZlcnRlcmAgZXhwb3J0IGlzIHZhbGlkYXRlZCBpbiB0aGUgV29ya2VyXG4gIGlmIChjdXN0b21GYWlsdXJlQ29udmVydGVyICE9IG51bGwpIHtcbiAgICBhY3RpdmF0b3IuZmFpbHVyZUNvbnZlcnRlciA9IGN1c3RvbUZhaWx1cmVDb252ZXJ0ZXI7XG4gIH1cblxuICBjb25zdCB7IGltcG9ydFdvcmtmbG93cywgaW1wb3J0SW50ZXJjZXB0b3JzIH0gPSBnbG9iYWwuX19URU1QT1JBTF9fO1xuICBpZiAoaW1wb3J0V29ya2Zsb3dzID09PSB1bmRlZmluZWQgfHwgaW1wb3J0SW50ZXJjZXB0b3JzID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IGJ1bmRsZSBkaWQgbm90IHJlZ2lzdGVyIGltcG9ydCBob29rcycpO1xuICB9XG5cbiAgY29uc3QgaW50ZXJjZXB0b3JzID0gaW1wb3J0SW50ZXJjZXB0b3JzKCk7XG4gIGZvciAoY29uc3QgbW9kIG9mIGludGVyY2VwdG9ycykge1xuICAgIGNvbnN0IGZhY3Rvcnk6IFdvcmtmbG93SW50ZXJjZXB0b3JzRmFjdG9yeSA9IG1vZC5pbnRlcmNlcHRvcnM7XG4gICAgaWYgKGZhY3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiBmYWN0b3J5ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEZhaWxlZCB0byBpbml0aWFsaXplIHdvcmtmbG93cyBpbnRlcmNlcHRvcnM6IGV4cGVjdGVkIGEgZnVuY3Rpb24sIGJ1dCBnb3Q6ICcke2ZhY3Rvcnl9J2ApO1xuICAgICAgfVxuICAgICAgY29uc3QgaW50ZXJjZXB0b3JzID0gZmFjdG9yeSgpO1xuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5pbmJvdW5kLnB1c2goLi4uKGludGVyY2VwdG9ycy5pbmJvdW5kID8/IFtdKSk7XG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLnB1c2goLi4uKGludGVyY2VwdG9ycy5vdXRib3VuZCA/PyBbXSkpO1xuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5pbnRlcm5hbHMucHVzaCguLi4oaW50ZXJjZXB0b3JzLmludGVybmFscyA/PyBbXSkpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG1vZCA9IGltcG9ydFdvcmtmbG93cygpO1xuICBjb25zdCB3b3JrZmxvd0ZuID0gbW9kW2FjdGl2YXRvci5pbmZvLndvcmtmbG93VHlwZV07XG4gIGNvbnN0IGRlZmF1bHRXb3JrZmxvd0ZuID0gbW9kWydkZWZhdWx0J107XG5cbiAgaWYgKHR5cGVvZiB3b3JrZmxvd0ZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYWN0aXZhdG9yLndvcmtmbG93ID0gd29ya2Zsb3dGbjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmYXVsdFdvcmtmbG93Rm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBhY3RpdmF0b3Iud29ya2Zsb3cgPSBkZWZhdWx0V29ya2Zsb3dGbjtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBkZXRhaWxzID1cbiAgICAgIHdvcmtmbG93Rm4gPT09IHVuZGVmaW5lZFxuICAgICAgICA/ICdubyBzdWNoIGZ1bmN0aW9uIGlzIGV4cG9ydGVkIGJ5IHRoZSB3b3JrZmxvdyBidW5kbGUnXG4gICAgICAgIDogYGV4cGVjdGVkIGEgZnVuY3Rpb24sIGJ1dCBnb3Q6ICcke3R5cGVvZiB3b3JrZmxvd0ZufSdgO1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEZhaWxlZCB0byBpbml0aWFsaXplIHdvcmtmbG93IG9mIHR5cGUgJyR7YWN0aXZhdG9yLmluZm8ud29ya2Zsb3dUeXBlfSc6ICR7ZGV0YWlsc31gKTtcbiAgfVxufVxuXG4vKipcbiAqIE9iamVjdHMgdHJhbnNmZXJlZCB0byB0aGUgVk0gZnJvbSBvdXRzaWRlIGhhdmUgcHJvdG90eXBlcyBiZWxvbmdpbmcgdG8gdGhlXG4gKiBvdXRlciBjb250ZXh0LCB3aGljaCBtZWFucyB0aGF0IGluc3RhbmNlb2Ygd29uJ3Qgd29yayBpbnNpZGUgdGhlIFZNLiBUaGlzXG4gKiBmdW5jdGlvbiByZWN1cnNpdmVseSB3YWxrcyBvdmVyIHRoZSBjb250ZW50IG9mIGFuIG9iamVjdCwgYW5kIHJlY3JlYXRlIHNvbWVcbiAqIG9mIHRoZXNlIG9iamVjdHMgKG5vdGFibHkgQXJyYXksIERhdGUgYW5kIE9iamVjdHMpLlxuICovXG5mdW5jdGlvbiBmaXhQcm90b3R5cGVzPFg+KG9iajogWCk6IFgge1xuICBpZiAob2JqICE9IG51bGwgJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICBzd2l0Y2ggKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopPy5jb25zdHJ1Y3Rvcj8ubmFtZSkge1xuICAgICAgY2FzZSAnQXJyYXknOlxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSgob2JqIGFzIEFycmF5PHVua25vd24+KS5tYXAoZml4UHJvdG90eXBlcykpIGFzIFg7XG4gICAgICBjYXNlICdEYXRlJzpcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG9iaiBhcyB1bmtub3duIGFzIERhdGUpIGFzIFg7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKG9iaikubWFwKChbaywgdl0pOiBbc3RyaW5nLCBhbnldID0+IFtrLCBmaXhQcm90b3R5cGVzKHYpXSkpIGFzIFg7XG4gICAgfVxuICB9IGVsc2UgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSB3b3JrZmxvdy4gT3IgdG8gYmUgZXhhY3QsIF9jb21wbGV0ZV8gaW5pdGlhbGl6YXRpb24sIGFzIG1vc3QgcGFydCBoYXMgYmVlbiBkb25lIGluIGNvbnN0cnVjdG9yKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemUoaW5pdGlhbGl6ZVdvcmtmbG93Sm9iOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSUluaXRpYWxpemVXb3JrZmxvdyk6IHZvaWQge1xuICBnZXRBY3RpdmF0b3IoKS5pbml0aWFsaXplV29ya2Zsb3coaW5pdGlhbGl6ZVdvcmtmbG93Sm9iKTtcbn1cblxuLyoqXG4gKiBSdW4gYSBjaHVuayBvZiBhY3RpdmF0aW9uIGpvYnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uLCBiYXRjaEluZGV4ID0gMCk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgY29uc3QgaW50ZXJjZXB0ID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmludGVybmFscywgJ2FjdGl2YXRlJywgKHsgYWN0aXZhdGlvbiB9KSA9PiB7XG4gICAgLy8gQ2FzdCBmcm9tIHRoZSBpbnRlcmZhY2UgdG8gdGhlIGNsYXNzIHdoaWNoIGhhcyB0aGUgYHZhcmlhbnRgIGF0dHJpYnV0ZS5cbiAgICAvLyBUaGlzIGlzIHNhZmUgYmVjYXVzZSB3ZSBrbm93IHRoYXQgYWN0aXZhdGlvbiBpcyBhIHByb3RvIGNsYXNzLlxuICAgIGNvbnN0IGpvYnMgPSBhY3RpdmF0aW9uLmpvYnMgYXMgY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLldvcmtmbG93QWN0aXZhdGlvbkpvYltdO1xuXG4gICAgLy8gSW5pdGlhbGl6YXRpb24gd2lsbCBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LCBidXQgd2UgbWlnaHQgc3RpbGwgbmVlZCB0byBzdGFydCB0aGUgd29ya2Zsb3cgZnVuY3Rpb25cbiAgICBjb25zdCBzdGFydFdvcmtmbG93Sm9iID0gam9ic1swXS52YXJpYW50ID09PSAnaW5pdGlhbGl6ZVdvcmtmbG93JyA/IGpvYnMuc2hpZnQoKT8uaW5pdGlhbGl6ZVdvcmtmbG93IDogdW5kZWZpbmVkO1xuXG4gICAgZm9yIChjb25zdCBqb2Igb2Ygam9icykge1xuICAgICAgaWYgKGpvYi52YXJpYW50ID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGpvYi52YXJpYW50IHRvIGJlIGRlZmluZWQnKTtcblxuICAgICAgY29uc3QgdmFyaWFudCA9IGpvYltqb2IudmFyaWFudF07XG4gICAgICBpZiAoIXZhcmlhbnQpIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGpvYi4ke2pvYi52YXJpYW50fSB0byBiZSBzZXRgKTtcblxuICAgICAgYWN0aXZhdG9yW2pvYi52YXJpYW50XSh2YXJpYW50IGFzIGFueSAvKiBUUyBjYW4ndCBpbmZlciB0aGlzIHR5cGUgKi8pO1xuXG4gICAgICBpZiAoam9iLnZhcmlhbnQgIT09ICdxdWVyeVdvcmtmbG93JykgdHJ5VW5ibG9ja0NvbmRpdGlvbnMoKTtcbiAgICB9XG5cbiAgICBpZiAoc3RhcnRXb3JrZmxvd0pvYikge1xuICAgICAgY29uc3Qgc2FmZUpvYlR5cGVzOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uV29ya2Zsb3dBY3RpdmF0aW9uSm9iWyd2YXJpYW50J11bXSA9IFtcbiAgICAgICAgJ2luaXRpYWxpemVXb3JrZmxvdycsXG4gICAgICAgICdzaWduYWxXb3JrZmxvdycsXG4gICAgICAgICdkb1VwZGF0ZScsXG4gICAgICAgICdjYW5jZWxXb3JrZmxvdycsXG4gICAgICAgICd1cGRhdGVSYW5kb21TZWVkJyxcbiAgICAgIF07XG4gICAgICBpZiAoam9icy5zb21lKChqb2IpID0+ICFzYWZlSm9iVHlwZXMuaW5jbHVkZXMoam9iLnZhcmlhbnQpKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdSZWNlaXZlZCBib3RoIGluaXRpYWxpemVXb3JrZmxvdyBhbmQgbm9uLXNpZ25hbC9ub24tdXBkYXRlIGpvYnMgaW4gdGhlIHNhbWUgYWN0aXZhdGlvbjogJyArXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShqb2JzLm1hcCgoam9iKSA9PiBqb2IudmFyaWFudCkpXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGFjdGl2YXRvci5zdGFydFdvcmtmbG93KHN0YXJ0V29ya2Zsb3dKb2IpO1xuICAgICAgdHJ5VW5ibG9ja0NvbmRpdGlvbnMoKTtcbiAgICB9XG4gIH0pO1xuICBpbnRlcmNlcHQoeyBhY3RpdmF0aW9uLCBiYXRjaEluZGV4IH0pO1xufVxuXG4vKipcbiAqIENvbmNsdWRlIGEgc2luZ2xlIGFjdGl2YXRpb24uXG4gKiBTaG91bGQgYmUgY2FsbGVkIGFmdGVyIHByb2Nlc3NpbmcgYWxsIGFjdGl2YXRpb24gam9icyBhbmQgcXVldWVkIG1pY3JvdGFza3MuXG4gKlxuICogQWN0aXZhdGlvbiBmYWlsdXJlcyBhcmUgaGFuZGxlZCBpbiB0aGUgbWFpbiBOb2RlLmpzIGlzb2xhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25jbHVkZUFjdGl2YXRpb24oKTogY29yZXNkay53b3JrZmxvd19jb21wbGV0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Db21wbGV0aW9uIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGFjdGl2YXRvci5yZWplY3RCdWZmZXJlZFVwZGF0ZXMoKTtcbiAgY29uc3QgaW50ZXJjZXB0ID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmludGVybmFscywgJ2NvbmNsdWRlQWN0aXZhdGlvbicsIChpbnB1dCkgPT4gaW5wdXQpO1xuICBjb25zdCBhY3RpdmF0aW9uQ29tcGxldGlvbiA9IGFjdGl2YXRvci5jb25jbHVkZUFjdGl2YXRpb24oKTtcbiAgY29uc3QgeyBjb21tYW5kcyB9ID0gaW50ZXJjZXB0KHsgY29tbWFuZHM6IGFjdGl2YXRpb25Db21wbGV0aW9uLmNvbW1hbmRzIH0pO1xuICBpZiAoYWN0aXZhdG9yLmNvbXBsZXRlZCkge1xuICAgIGFjdGl2YXRvci53YXJuSWZVbmZpbmlzaGVkSGFuZGxlcnMoKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcnVuSWQ6IGFjdGl2YXRvci5pbmZvLnJ1bklkLFxuICAgIHN1Y2Nlc3NmdWw6IHsgLi4uYWN0aXZhdGlvbkNvbXBsZXRpb24sIGNvbW1hbmRzIH0sXG4gIH07XG59XG5cbi8qKlxuICogTG9vcCB0aHJvdWdoIGFsbCBibG9ja2VkIGNvbmRpdGlvbnMsIGV2YWx1YXRlIGFuZCB1bmJsb2NrIGlmIHBvc3NpYmxlLlxuICpcbiAqIEByZXR1cm5zIG51bWJlciBvZiB1bmJsb2NrZWQgY29uZGl0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyeVVuYmxvY2tDb25kaXRpb25zKCk6IG51bWJlciB7XG4gIGxldCBudW1VbmJsb2NrZWQgPSAwO1xuICBmb3IgKDs7KSB7XG4gICAgY29uc3QgcHJldlVuYmxvY2tlZCA9IG51bVVuYmxvY2tlZDtcbiAgICBmb3IgKGNvbnN0IFtzZXEsIGNvbmRdIG9mIGdldEFjdGl2YXRvcigpLmJsb2NrZWRDb25kaXRpb25zLmVudHJpZXMoKSkge1xuICAgICAgaWYgKGNvbmQuZm4oKSkge1xuICAgICAgICBjb25kLnJlc29sdmUoKTtcbiAgICAgICAgbnVtVW5ibG9ja2VkKys7XG4gICAgICAgIC8vIEl0IGlzIHNhZmUgdG8gZGVsZXRlIGVsZW1lbnRzIGR1cmluZyBtYXAgaXRlcmF0aW9uXG4gICAgICAgIGdldEFjdGl2YXRvcigpLmJsb2NrZWRDb25kaXRpb25zLmRlbGV0ZShzZXEpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJldlVuYmxvY2tlZCA9PT0gbnVtVW5ibG9ja2VkKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bVVuYmxvY2tlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3Bvc2UoKTogdm9pZCB7XG4gIGNvbnN0IGRpc3Bvc2UgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGdldEFjdGl2YXRvcigpLmludGVyY2VwdG9ycy5pbnRlcm5hbHMsICdkaXNwb3NlJywgYXN5bmMgKCkgPT4ge1xuICAgIGRpc2FibGVTdG9yYWdlKCk7XG4gICAgZGlzYWJsZVVwZGF0ZVN0b3JhZ2UoKTtcbiAgfSk7XG4gIGRpc3Bvc2Uoe30pO1xufVxuIiwiaW1wb3J0IHtcbiAgQWN0aXZpdHlGdW5jdGlvbixcbiAgQWN0aXZpdHlPcHRpb25zLFxuICBjb21waWxlUmV0cnlQb2xpY3ksXG4gIGVuY29kZUFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSxcbiAgZW5jb2RlV29ya2Zsb3dJZFJldXNlUG9saWN5LFxuICBleHRyYWN0V29ya2Zsb3dUeXBlLFxuICBIYW5kbGVyVW5maW5pc2hlZFBvbGljeSxcbiAgTG9jYWxBY3Rpdml0eU9wdGlvbnMsXG4gIG1hcFRvUGF5bG9hZHMsXG4gIFF1ZXJ5RGVmaW5pdGlvbixcbiAgc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlcixcbiAgU2VhcmNoQXR0cmlidXRlcyxcbiAgU2lnbmFsRGVmaW5pdGlvbixcbiAgdG9QYXlsb2FkcyxcbiAgVW50eXBlZEFjdGl2aXRpZXMsXG4gIFVwZGF0ZURlZmluaXRpb24sXG4gIFdpdGhXb3JrZmxvd0FyZ3MsXG4gIFdvcmtmbG93LFxuICBXb3JrZmxvd1Jlc3VsdFR5cGUsXG4gIFdvcmtmbG93UmV0dXJuVHlwZSxcbiAgV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdmVyc2lvbmluZ0ludGVudFRvUHJvdG8gfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3ZlcnNpb25pbmctaW50ZW50LWVudW0nO1xuaW1wb3J0IHsgRHVyYXRpb24sIG1zT3B0aW9uYWxUb1RzLCBtc1RvTnVtYmVyLCBtc1RvVHMsIHJlcXVpcmVkVHNUb01zIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90aW1lJztcbmltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IENhbmNlbGxhdGlvblNjb3BlLCByZWdpc3RlclNsZWVwSW1wbGVtZW50YXRpb24gfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyBVcGRhdGVTY29wZSB9IGZyb20gJy4vdXBkYXRlLXNjb3BlJztcbmltcG9ydCB7XG4gIEFjdGl2aXR5SW5wdXQsXG4gIExvY2FsQWN0aXZpdHlJbnB1dCxcbiAgU2lnbmFsV29ya2Zsb3dJbnB1dCxcbiAgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQsXG4gIFRpbWVySW5wdXQsXG59IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7XG4gIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLFxuICBDaGlsZFdvcmtmbG93T3B0aW9ucyxcbiAgQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMsXG4gIENvbnRpbnVlQXNOZXcsXG4gIENvbnRpbnVlQXNOZXdPcHRpb25zLFxuICBEZWZhdWx0U2lnbmFsSGFuZGxlcixcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBIYW5kbGVyLFxuICBRdWVyeUhhbmRsZXJPcHRpb25zLFxuICBTaWduYWxIYW5kbGVyT3B0aW9ucyxcbiAgVXBkYXRlSGFuZGxlck9wdGlvbnMsXG4gIFdvcmtmbG93SW5mbyxcbiAgVXBkYXRlSW5mbyxcbiAgZW5jb2RlQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsXG4gIGVuY29kZVBhcmVudENsb3NlUG9saWN5LFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgTG9jYWxBY3Rpdml0eURvQmFja29mZiB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IGFzc2VydEluV29ya2Zsb3dDb250ZXh0LCBnZXRBY3RpdmF0b3IsIG1heWJlR2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgeyBDaGlsZFdvcmtmbG93SGFuZGxlLCBFeHRlcm5hbFdvcmtmbG93SGFuZGxlIH0gZnJvbSAnLi93b3JrZmxvdy1oYW5kbGUnO1xuXG4vLyBBdm9pZCBhIGNpcmN1bGFyIGRlcGVuZGVuY3lcbnJlZ2lzdGVyU2xlZXBJbXBsZW1lbnRhdGlvbihzbGVlcCk7XG5cbi8qKlxuICogQWRkcyBkZWZhdWx0IHZhbHVlcyBvZiBgd29ya2Zsb3dJZGAgYW5kIGBjYW5jZWxsYXRpb25UeXBlYCB0byBnaXZlbiB3b3JrZmxvdyBvcHRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRGVmYXVsdFdvcmtmbG93T3B0aW9uczxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICBvcHRzOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMge1xuICBjb25zdCB7IGFyZ3MsIHdvcmtmbG93SWQsIC4uLnJlc3QgfSA9IG9wdHM7XG4gIHJldHVybiB7XG4gICAgd29ya2Zsb3dJZDogd29ya2Zsb3dJZCA/PyB1dWlkNCgpLFxuICAgIGFyZ3M6IChhcmdzID8/IFtdKSBhcyB1bmtub3duW10sXG4gICAgY2FuY2VsbGF0aW9uVHlwZTogQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUuV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVELFxuICAgIC4uLnJlc3QsXG4gIH07XG59XG5cbi8qKlxuICogUHVzaCBhIHN0YXJ0VGltZXIgY29tbWFuZCBpbnRvIHN0YXRlIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmZ1bmN0aW9uIHRpbWVyTmV4dEhhbmRsZXIoaW5wdXQ6IFRpbWVySW5wdXQpIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5kZWxldGUoaW5wdXQuc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBBbHJlYWR5IHJlc29sdmVkIG9yIG5ldmVyIHNjaGVkdWxlZFxuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgY2FuY2VsVGltZXI6IHtcbiAgICAgICAgICAgICAgc2VxOiBpbnB1dC5zZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHN0YXJ0VGltZXI6IHtcbiAgICAgICAgc2VxOiBpbnB1dC5zZXEsXG4gICAgICAgIHN0YXJ0VG9GaXJlVGltZW91dDogbXNUb1RzKGlucHV0LmR1cmF0aW9uTXMpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMudGltZXIuc2V0KGlucHV0LnNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQXN5bmNocm9ub3VzIHNsZWVwLlxuICpcbiAqIFNjaGVkdWxlcyBhIHRpbWVyIG9uIHRoZSBUZW1wb3JhbCBzZXJ2aWNlLlxuICpcbiAqIEBwYXJhbSBtcyBzbGVlcCBkdXJhdGlvbiAtIG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ30uXG4gKiBJZiBnaXZlbiBhIG5lZ2F0aXZlIG51bWJlciBvciAwLCB2YWx1ZSB3aWxsIGJlIHNldCB0byAxLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2xlZXAobXM6IER1cmF0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5zbGVlcCguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbicpO1xuICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMudGltZXIrKztcblxuICBjb25zdCBkdXJhdGlvbk1zID0gTWF0aC5tYXgoMSwgbXNUb051bWJlcihtcykpO1xuXG4gIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsICdzdGFydFRpbWVyJywgdGltZXJOZXh0SGFuZGxlcik7XG5cbiAgcmV0dXJuIGV4ZWN1dGUoe1xuICAgIGR1cmF0aW9uTXMsXG4gICAgc2VxLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVBY3Rpdml0eU9wdGlvbnMob3B0aW9uczogQWN0aXZpdHlPcHRpb25zKTogdm9pZCB7XG4gIGlmIChvcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXQgPT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnN0YXJ0VG9DbG9zZVRpbWVvdXQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1JlcXVpcmVkIGVpdGhlciBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0IG9yIHN0YXJ0VG9DbG9zZVRpbWVvdXQnKTtcbiAgfVxufVxuXG4vLyBVc2Ugc2FtZSB2YWxpZGF0aW9uIHdlIHVzZSBmb3Igbm9ybWFsIGFjdGl2aXRpZXNcbmNvbnN0IHZhbGlkYXRlTG9jYWxBY3Rpdml0eU9wdGlvbnMgPSB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucztcblxuLyoqXG4gKiBQdXNoIGEgc2NoZWR1bGVBY3Rpdml0eSBjb21tYW5kIGludG8gYWN0aXZhdG9yIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmZ1bmN0aW9uIHNjaGVkdWxlQWN0aXZpdHlOZXh0SGFuZGxlcih7IG9wdGlvbnMsIGFyZ3MsIGhlYWRlcnMsIHNlcSwgYWN0aXZpdHlUeXBlIH06IEFjdGl2aXR5SW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuaGFzKHNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQWxyZWFkeSByZXNvbHZlZCBvciBuZXZlciBzY2hlZHVsZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgIHJlcXVlc3RDYW5jZWxBY3Rpdml0eToge1xuICAgICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNjaGVkdWxlQWN0aXZpdHk6IHtcbiAgICAgICAgc2VxLFxuICAgICAgICBhY3Rpdml0eUlkOiBvcHRpb25zLmFjdGl2aXR5SWQgPz8gYCR7c2VxfWAsXG4gICAgICAgIGFjdGl2aXR5VHlwZSxcbiAgICAgICAgYXJndW1lbnRzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgcmV0cnlQb2xpY3k6IG9wdGlvbnMucmV0cnkgPyBjb21waWxlUmV0cnlQb2xpY3kob3B0aW9ucy5yZXRyeSkgOiB1bmRlZmluZWQsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUgfHwgYWN0aXZhdG9yLmluZm8udGFza1F1ZXVlLFxuICAgICAgICBoZWFydGJlYXRUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLmhlYXJ0YmVhdFRpbWVvdXQpLFxuICAgICAgICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzdGFydFRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnN0YXJ0VG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9TdGFydFRpbWVvdXQpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjYW5jZWxsYXRpb25UeXBlOiBlbmNvZGVBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUob3B0aW9ucy5jYW5jZWxsYXRpb25UeXBlKSxcbiAgICAgICAgZG9Ob3RFYWdlcmx5RXhlY3V0ZTogIShvcHRpb25zLmFsbG93RWFnZXJEaXNwYXRjaCA/PyB0cnVlKSxcbiAgICAgICAgdmVyc2lvbmluZ0ludGVudDogdmVyc2lvbmluZ0ludGVudFRvUHJvdG8ob3B0aW9ucy52ZXJzaW9uaW5nSW50ZW50KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFB1c2ggYSBzY2hlZHVsZUFjdGl2aXR5IGNvbW1hbmQgaW50byBzdGF0ZSBhY2N1bXVsYXRvciBhbmQgcmVnaXN0ZXIgY29tcGxldGlvblxuICovXG5hc3luYyBmdW5jdGlvbiBzY2hlZHVsZUxvY2FsQWN0aXZpdHlOZXh0SGFuZGxlcih7XG4gIG9wdGlvbnMsXG4gIGFyZ3MsXG4gIGhlYWRlcnMsXG4gIHNlcSxcbiAgYWN0aXZpdHlUeXBlLFxuICBhdHRlbXB0LFxuICBvcmlnaW5hbFNjaGVkdWxlVGltZSxcbn06IExvY2FsQWN0aXZpdHlJbnB1dCk6IFByb21pc2U8dW5rbm93bj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgLy8gRWFnZXJseSBmYWlsIHRoZSBsb2NhbCBhY3Rpdml0eSAod2hpY2ggd2lsbCBpbiB0dXJuIGZhaWwgdGhlIHdvcmtmbG93IHRhc2suXG4gIC8vIERvIG5vdCBmYWlsIG9uIHJlcGxheSB3aGVyZSB0aGUgbG9jYWwgYWN0aXZpdGllcyBtYXkgbm90IGJlIHJlZ2lzdGVyZWQgb24gdGhlIHJlcGxheSB3b3JrZXIuXG4gIGlmICghYWN0aXZhdG9yLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nICYmICFhY3RpdmF0b3IucmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXMuaGFzKGFjdGl2aXR5VHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYExvY2FsIGFjdGl2aXR5IG9mIHR5cGUgJyR7YWN0aXZpdHlUeXBlfScgbm90IHJlZ2lzdGVyZWQgb24gd29ya2VyYCk7XG4gIH1cbiAgdmFsaWRhdGVMb2NhbEFjdGl2aXR5T3B0aW9ucyhvcHRpb25zKTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuaGFzKHNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQWxyZWFkeSByZXNvbHZlZCBvciBuZXZlciBzY2hlZHVsZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgIHJlcXVlc3RDYW5jZWxMb2NhbEFjdGl2aXR5OiB7XG4gICAgICAgICAgICAgIHNlcSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc2NoZWR1bGVMb2NhbEFjdGl2aXR5OiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgb3JpZ2luYWxTY2hlZHVsZVRpbWUsXG4gICAgICAgIC8vIEludGVudGlvbmFsbHkgbm90IGV4cG9zaW5nIGFjdGl2aXR5SWQgYXMgYW4gb3B0aW9uXG4gICAgICAgIGFjdGl2aXR5SWQ6IGAke3NlcX1gLFxuICAgICAgICBhY3Rpdml0eVR5cGUsXG4gICAgICAgIGFyZ3VtZW50czogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIHJldHJ5UG9saWN5OiBvcHRpb25zLnJldHJ5ID8gY29tcGlsZVJldHJ5UG9saWN5KG9wdGlvbnMucmV0cnkpIDogdW5kZWZpbmVkLFxuICAgICAgICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzdGFydFRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnN0YXJ0VG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9TdGFydFRpbWVvdXQpLFxuICAgICAgICBsb2NhbFJldHJ5VGhyZXNob2xkOiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLmxvY2FsUmV0cnlUaHJlc2hvbGQpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjYW5jZWxsYXRpb25UeXBlOiBlbmNvZGVBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUob3B0aW9ucy5jYW5jZWxsYXRpb25UeXBlKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFNjaGVkdWxlIGFuIGFjdGl2aXR5IGFuZCBydW4gb3V0Ym91bmQgaW50ZXJjZXB0b3JzXG4gKiBAaGlkZGVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZUFjdGl2aXR5PFI+KGFjdGl2aXR5VHlwZTogc3RyaW5nLCBhcmdzOiBhbnlbXSwgb3B0aW9uczogQWN0aXZpdHlPcHRpb25zKTogUHJvbWlzZTxSPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5zY2hlZHVsZUFjdGl2aXR5KC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uJ1xuICApO1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGVtcHR5IGFjdGl2aXR5IG9wdGlvbnMnKTtcbiAgfVxuICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuYWN0aXZpdHkrKztcbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ3NjaGVkdWxlQWN0aXZpdHknLCBzY2hlZHVsZUFjdGl2aXR5TmV4dEhhbmRsZXIpO1xuXG4gIHJldHVybiBleGVjdXRlKHtcbiAgICBhY3Rpdml0eVR5cGUsXG4gICAgaGVhZGVyczoge30sXG4gICAgb3B0aW9ucyxcbiAgICBhcmdzLFxuICAgIHNlcSxcbiAgfSkgYXMgUHJvbWlzZTxSPjtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZSBhbiBhY3Rpdml0eSBhbmQgcnVuIG91dGJvdW5kIGludGVyY2VwdG9yc1xuICogQGhpZGRlblxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2NoZWR1bGVMb2NhbEFjdGl2aXR5PFI+KFxuICBhY3Rpdml0eVR5cGU6IHN0cmluZyxcbiAgYXJnczogYW55W10sXG4gIG9wdGlvbnM6IExvY2FsQWN0aXZpdHlPcHRpb25zXG4pOiBQcm9taXNlPFI+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnNjaGVkdWxlTG9jYWxBY3Rpdml0eSguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbidcbiAgKTtcbiAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBlbXB0eSBhY3Rpdml0eSBvcHRpb25zJyk7XG4gIH1cblxuICBsZXQgYXR0ZW1wdCA9IDE7XG4gIGxldCBvcmlnaW5hbFNjaGVkdWxlVGltZSA9IHVuZGVmaW5lZDtcblxuICBmb3IgKDs7KSB7XG4gICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLmFjdGl2aXR5Kys7XG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICAgJ3NjaGVkdWxlTG9jYWxBY3Rpdml0eScsXG4gICAgICBzY2hlZHVsZUxvY2FsQWN0aXZpdHlOZXh0SGFuZGxlclxuICAgICk7XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChhd2FpdCBleGVjdXRlKHtcbiAgICAgICAgYWN0aXZpdHlUeXBlLFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgYXJncyxcbiAgICAgICAgc2VxLFxuICAgICAgICBhdHRlbXB0LFxuICAgICAgICBvcmlnaW5hbFNjaGVkdWxlVGltZSxcbiAgICAgIH0pKSBhcyBQcm9taXNlPFI+O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIExvY2FsQWN0aXZpdHlEb0JhY2tvZmYpIHtcbiAgICAgICAgYXdhaXQgc2xlZXAocmVxdWlyZWRUc1RvTXMoZXJyLmJhY2tvZmYuYmFja29mZkR1cmF0aW9uLCAnYmFja29mZkR1cmF0aW9uJykpO1xuICAgICAgICBpZiAodHlwZW9mIGVyci5iYWNrb2ZmLmF0dGVtcHQgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBiYWNrb2ZmIGF0dGVtcHQgdHlwZScpO1xuICAgICAgICB9XG4gICAgICAgIGF0dGVtcHQgPSBlcnIuYmFja29mZi5hdHRlbXB0O1xuICAgICAgICBvcmlnaW5hbFNjaGVkdWxlVGltZSA9IGVyci5iYWNrb2ZmLm9yaWdpbmFsU2NoZWR1bGVUaW1lID8/IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uTmV4dEhhbmRsZXIoe1xuICBvcHRpb25zLFxuICBoZWFkZXJzLFxuICB3b3JrZmxvd1R5cGUsXG4gIHNlcSxcbn06IFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbklucHV0KTogUHJvbWlzZTxbUHJvbWlzZTxzdHJpbmc+LCBQcm9taXNlPHVua25vd24+XT4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgY29uc3Qgd29ya2Zsb3dJZCA9IG9wdGlvbnMud29ya2Zsb3dJZCA/PyB1dWlkNCgpO1xuICBjb25zdCBzdGFydFByb21pc2UgPSBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbXBsZXRlID0gIWFjdGl2YXRvci5jb21wbGV0aW9ucy5jaGlsZFdvcmtmbG93Q29tcGxldGUuaGFzKHNlcSk7XG5cbiAgICAgICAgICBpZiAoIWNvbXBsZXRlKSB7XG4gICAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgICBjYW5jZWxDaGlsZFdvcmtmbG93RXhlY3V0aW9uOiB7IGNoaWxkV29ya2Zsb3dTZXE6IHNlcSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIE5vdGhpbmcgdG8gY2FuY2VsIG90aGVyd2lzZVxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICBzZXEsXG4gICAgICAgIHdvcmtmbG93SWQsXG4gICAgICAgIHdvcmtmbG93VHlwZSxcbiAgICAgICAgaW5wdXQ6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLm9wdGlvbnMuYXJncyksXG4gICAgICAgIHJldHJ5UG9saWN5OiBvcHRpb25zLnJldHJ5ID8gY29tcGlsZVJldHJ5UG9saWN5KG9wdGlvbnMucmV0cnkpIDogdW5kZWZpbmVkLFxuICAgICAgICB0YXNrUXVldWU6IG9wdGlvbnMudGFza1F1ZXVlIHx8IGFjdGl2YXRvci5pbmZvLnRhc2tRdWV1ZSxcbiAgICAgICAgd29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93RXhlY3V0aW9uVGltZW91dCksXG4gICAgICAgIHdvcmtmbG93UnVuVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd1J1blRpbWVvdXQpLFxuICAgICAgICB3b3JrZmxvd1Rhc2tUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93VGFza1RpbWVvdXQpLFxuICAgICAgICBuYW1lc3BhY2U6IGFjdGl2YXRvci5pbmZvLm5hbWVzcGFjZSwgLy8gTm90IGNvbmZpZ3VyYWJsZVxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjYW5jZWxsYXRpb25UeXBlOiBlbmNvZGVDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZShvcHRpb25zLmNhbmNlbGxhdGlvblR5cGUpLFxuICAgICAgICB3b3JrZmxvd0lkUmV1c2VQb2xpY3k6IGVuY29kZVdvcmtmbG93SWRSZXVzZVBvbGljeShvcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeSksXG4gICAgICAgIHBhcmVudENsb3NlUG9saWN5OiBlbmNvZGVQYXJlbnRDbG9zZVBvbGljeShvcHRpb25zLnBhcmVudENsb3NlUG9saWN5KSxcbiAgICAgICAgY3JvblNjaGVkdWxlOiBvcHRpb25zLmNyb25TY2hlZHVsZSxcbiAgICAgICAgc2VhcmNoQXR0cmlidXRlczogb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzXG4gICAgICAgICAgPyBtYXBUb1BheWxvYWRzKHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsIG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlcylcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgbWVtbzogb3B0aW9ucy5tZW1vICYmIG1hcFRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIG9wdGlvbnMubWVtbyksXG4gICAgICAgIHZlcnNpb25pbmdJbnRlbnQ6IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKG9wdGlvbnMudmVyc2lvbmluZ0ludGVudCksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5jaGlsZFdvcmtmbG93U3RhcnQuc2V0KHNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gV2UgY29uc3RydWN0IGEgUHJvbWlzZSBmb3IgdGhlIGNvbXBsZXRpb24gb2YgdGhlIGNoaWxkIFdvcmtmbG93IGJlZm9yZSB3ZSBrbm93XG4gIC8vIGlmIHRoZSBXb3JrZmxvdyBjb2RlIHdpbGwgYXdhaXQgaXQgdG8gY2FwdHVyZSB0aGUgcmVzdWx0IGluIGNhc2UgaXQgZG9lcy5cbiAgY29uc3QgY29tcGxldGVQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIENoYWluIHN0YXJ0IFByb21pc2UgcmVqZWN0aW9uIHRvIHRoZSBjb21wbGV0ZSBQcm9taXNlLlxuICAgIHVudHJhY2tQcm9taXNlKHN0YXJ0UHJvbWlzZS5jYXRjaChyZWplY3QpKTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuY2hpbGRXb3JrZmxvd0NvbXBsZXRlLnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xuICB1bnRyYWNrUHJvbWlzZShzdGFydFByb21pc2UpO1xuICB1bnRyYWNrUHJvbWlzZShjb21wbGV0ZVByb21pc2UpO1xuICAvLyBQcmV2ZW50IHVuaGFuZGxlZCByZWplY3Rpb24gYmVjYXVzZSB0aGUgY29tcGxldGlvbiBtaWdodCBub3QgYmUgYXdhaXRlZFxuICB1bnRyYWNrUHJvbWlzZShjb21wbGV0ZVByb21pc2UuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKSk7XG4gIGNvbnN0IHJldCA9IG5ldyBQcm9taXNlPFtQcm9taXNlPHN0cmluZz4sIFByb21pc2U8dW5rbm93bj5dPigocmVzb2x2ZSkgPT4gcmVzb2x2ZShbc3RhcnRQcm9taXNlLCBjb21wbGV0ZVByb21pc2VdKSk7XG4gIHVudHJhY2tQcm9taXNlKHJldCk7XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXIoeyBzZXEsIHNpZ25hbE5hbWUsIGFyZ3MsIHRhcmdldCwgaGVhZGVycyB9OiBTaWduYWxXb3JrZmxvd0lucHV0KSB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGlmICghYWN0aXZhdG9yLmNvbXBsZXRpb25zLnNpZ25hbFdvcmtmbG93LmhhcyhzZXEpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7IGNhbmNlbFNpZ25hbFdvcmtmbG93OiB7IHNlcSB9IH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNpZ25hbEV4dGVybmFsV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgc2VxLFxuICAgICAgICBhcmdzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgc2lnbmFsTmFtZSxcbiAgICAgICAgLi4uKHRhcmdldC50eXBlID09PSAnZXh0ZXJuYWwnXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIHdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBhY3RpdmF0b3IuaW5mby5uYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgLi4udGFyZ2V0LndvcmtmbG93RXhlY3V0aW9uLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDoge1xuICAgICAgICAgICAgICBjaGlsZFdvcmtmbG93SWQ6IHRhcmdldC5jaGlsZFdvcmtmbG93SWQsXG4gICAgICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuc2lnbmFsV29ya2Zsb3cuc2V0KHNlcSwgeyByZXNvbHZlLCByZWplY3QgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFN5bWJvbCB1c2VkIGluIHRoZSByZXR1cm4gdHlwZSBvZiBwcm94eSBtZXRob2RzIHRvIG1hcmsgdGhhdCBhbiBhdHRyaWJ1dGUgb24gdGhlIHNvdXJjZSB0eXBlIGlzIG5vdCBhIG1ldGhvZC5cbiAqXG4gKiBAc2VlIHtAbGluayBBY3Rpdml0eUludGVyZmFjZUZvcn1cbiAqIEBzZWUge0BsaW5rIHByb3h5QWN0aXZpdGllc31cbiAqIEBzZWUge0BsaW5rIHByb3h5TG9jYWxBY3Rpdml0aWVzfVxuICovXG5leHBvcnQgY29uc3QgTm90QW5BY3Rpdml0eU1ldGhvZCA9IFN5bWJvbC5mb3IoJ19fVEVNUE9SQUxfTk9UX0FOX0FDVElWSVRZX01FVEhPRCcpO1xuXG4vKipcbiAqIFR5cGUgaGVscGVyIHRoYXQgdGFrZXMgYSB0eXBlIGBUYCBhbmQgdHJhbnNmb3JtcyBhdHRyaWJ1dGVzIHRoYXQgYXJlIG5vdCB7QGxpbmsgQWN0aXZpdHlGdW5jdGlvbn0gdG9cbiAqIHtAbGluayBOb3RBbkFjdGl2aXR5TWV0aG9kfS5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIFVzZWQgYnkge0BsaW5rIHByb3h5QWN0aXZpdGllc30gdG8gZ2V0IHRoaXMgY29tcGlsZS10aW1lIGVycm9yOlxuICpcbiAqIGBgYHRzXG4gKiBpbnRlcmZhY2UgTXlBY3Rpdml0aWVzIHtcbiAqICAgdmFsaWQoaW5wdXQ6IG51bWJlcik6IFByb21pc2U8bnVtYmVyPjtcbiAqICAgaW52YWxpZChpbnB1dDogbnVtYmVyKTogbnVtYmVyO1xuICogfVxuICpcbiAqIGNvbnN0IGFjdCA9IHByb3h5QWN0aXZpdGllczxNeUFjdGl2aXRpZXM+KHsgc3RhcnRUb0Nsb3NlVGltZW91dDogJzVtJyB9KTtcbiAqXG4gKiBhd2FpdCBhY3QudmFsaWQodHJ1ZSk7XG4gKiBhd2FpdCBhY3QuaW52YWxpZCgpO1xuICogLy8gXiBUUyBjb21wbGFpbnMgd2l0aDpcbiAqIC8vIChwcm9wZXJ0eSkgaW52YWxpZERlZmluaXRpb246IHR5cGVvZiBOb3RBbkFjdGl2aXR5TWV0aG9kXG4gKiAvLyBUaGlzIGV4cHJlc3Npb24gaXMgbm90IGNhbGxhYmxlLlxuICogLy8gVHlwZSAnU3ltYm9sJyBoYXMgbm8gY2FsbCBzaWduYXR1cmVzLigyMzQ5KVxuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIEFjdGl2aXR5SW50ZXJmYWNlRm9yPFQ+ID0ge1xuICBbSyBpbiBrZXlvZiBUXTogVFtLXSBleHRlbmRzIEFjdGl2aXR5RnVuY3Rpb24gPyBUW0tdIDogdHlwZW9mIE5vdEFuQWN0aXZpdHlNZXRob2Q7XG59O1xuXG4vKipcbiAqIENvbmZpZ3VyZSBBY3Rpdml0eSBmdW5jdGlvbnMgd2l0aCBnaXZlbiB7QGxpbmsgQWN0aXZpdHlPcHRpb25zfS5cbiAqXG4gKiBUaGlzIG1ldGhvZCBtYXkgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHRvIHNldHVwIEFjdGl2aXRpZXMgd2l0aCBkaWZmZXJlbnQgb3B0aW9ucy5cbiAqXG4gKiBAcmV0dXJuIGEge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1Byb3h5IHwgUHJveHl9IGZvclxuICogICAgICAgICB3aGljaCBlYWNoIGF0dHJpYnV0ZSBpcyBhIGNhbGxhYmxlIEFjdGl2aXR5IGZ1bmN0aW9uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwcm94eUFjdGl2aXRpZXMgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG4gKiBpbXBvcnQgKiBhcyBhY3Rpdml0aWVzIGZyb20gJy4uL2FjdGl2aXRpZXMnO1xuICpcbiAqIC8vIFNldHVwIEFjdGl2aXRpZXMgZnJvbSBtb2R1bGUgZXhwb3J0c1xuICogY29uc3QgeyBodHRwR2V0LCBvdGhlckFjdGl2aXR5IH0gPSBwcm94eUFjdGl2aXRpZXM8dHlwZW9mIGFjdGl2aXRpZXM+KHtcbiAqICAgc3RhcnRUb0Nsb3NlVGltZW91dDogJzMwIG1pbnV0ZXMnLFxuICogfSk7XG4gKlxuICogLy8gU2V0dXAgQWN0aXZpdGllcyBmcm9tIGFuIGV4cGxpY2l0IGludGVyZmFjZSAoZS5nLiB3aGVuIGRlZmluZWQgYnkgYW5vdGhlciBTREspXG4gKiBpbnRlcmZhY2UgSmF2YUFjdGl2aXRpZXMge1xuICogICBodHRwR2V0RnJvbUphdmEodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz5cbiAqICAgc29tZU90aGVySmF2YUFjdGl2aXR5KGFyZzE6IG51bWJlciwgYXJnMjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+O1xuICogfVxuICpcbiAqIGNvbnN0IHtcbiAqICAgaHR0cEdldEZyb21KYXZhLFxuICogICBzb21lT3RoZXJKYXZhQWN0aXZpdHlcbiAqIH0gPSBwcm94eUFjdGl2aXRpZXM8SmF2YUFjdGl2aXRpZXM+KHtcbiAqICAgdGFza1F1ZXVlOiAnamF2YS13b3JrZXItdGFza1F1ZXVlJyxcbiAqICAgc3RhcnRUb0Nsb3NlVGltZW91dDogJzVtJyxcbiAqIH0pO1xuICpcbiAqIGV4cG9ydCBmdW5jdGlvbiBleGVjdXRlKCk6IFByb21pc2U8dm9pZD4ge1xuICogICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGh0dHBHZXQoXCJodHRwOi8vZXhhbXBsZS5jb21cIik7XG4gKiAgIC8vIC4uLlxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm94eUFjdGl2aXRpZXM8QSA9IFVudHlwZWRBY3Rpdml0aWVzPihvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnMpOiBBY3Rpdml0eUludGVyZmFjZUZvcjxBPiB7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgZGVmaW5lZCcpO1xuICB9XG4gIC8vIFZhbGlkYXRlIGFzIGVhcmx5IGFzIHBvc3NpYmxlIGZvciBpbW1lZGlhdGUgdXNlciBmZWVkYmFja1xuICB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucyhvcHRpb25zKTtcbiAgcmV0dXJuIG5ldyBQcm94eShcbiAgICB7fSxcbiAgICB7XG4gICAgICBnZXQoXywgYWN0aXZpdHlUeXBlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aXZpdHlUeXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE9ubHkgc3RyaW5ncyBhcmUgc3VwcG9ydGVkIGZvciBBY3Rpdml0eSB0eXBlcywgZ290OiAke1N0cmluZyhhY3Rpdml0eVR5cGUpfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBhY3Rpdml0eVByb3h5RnVuY3Rpb24oLi4uYXJnczogdW5rbm93bltdKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgICAgICAgcmV0dXJuIHNjaGVkdWxlQWN0aXZpdHkoYWN0aXZpdHlUeXBlLCBhcmdzLCBvcHRpb25zKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfVxuICApIGFzIGFueTtcbn1cblxuLyoqXG4gKiBDb25maWd1cmUgTG9jYWwgQWN0aXZpdHkgZnVuY3Rpb25zIHdpdGggZ2l2ZW4ge0BsaW5rIExvY2FsQWN0aXZpdHlPcHRpb25zfS5cbiAqXG4gKiBUaGlzIG1ldGhvZCBtYXkgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHRvIHNldHVwIEFjdGl2aXRpZXMgd2l0aCBkaWZmZXJlbnQgb3B0aW9ucy5cbiAqXG4gKiBAcmV0dXJuIGEge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1Byb3h5IHwgUHJveHl9XG4gKiAgICAgICAgIGZvciB3aGljaCBlYWNoIGF0dHJpYnV0ZSBpcyBhIGNhbGxhYmxlIEFjdGl2aXR5IGZ1bmN0aW9uXG4gKlxuICogQHNlZSB7QGxpbmsgcHJveHlBY3Rpdml0aWVzfSBmb3IgZXhhbXBsZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3h5TG9jYWxBY3Rpdml0aWVzPEEgPSBVbnR5cGVkQWN0aXZpdGllcz4ob3B0aW9uczogTG9jYWxBY3Rpdml0eU9wdGlvbnMpOiBBY3Rpdml0eUludGVyZmFjZUZvcjxBPiB7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgZGVmaW5lZCcpO1xuICB9XG4gIC8vIFZhbGlkYXRlIGFzIGVhcmx5IGFzIHBvc3NpYmxlIGZvciBpbW1lZGlhdGUgdXNlciBmZWVkYmFja1xuICB2YWxpZGF0ZUxvY2FsQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb3h5KFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGdldChfLCBhY3Rpdml0eVR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpdml0eVR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgT25seSBzdHJpbmdzIGFyZSBzdXBwb3J0ZWQgZm9yIEFjdGl2aXR5IHR5cGVzLCBnb3Q6ICR7U3RyaW5nKGFjdGl2aXR5VHlwZSl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGxvY2FsQWN0aXZpdHlQcm94eUZ1bmN0aW9uKC4uLmFyZ3M6IHVua25vd25bXSkge1xuICAgICAgICAgIHJldHVybiBzY2hlZHVsZUxvY2FsQWN0aXZpdHkoYWN0aXZpdHlUeXBlLCBhcmdzLCBvcHRpb25zKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfVxuICApIGFzIGFueTtcbn1cblxuLy8gVE9ETzogZGVwcmVjYXRlIHRoaXMgcGF0Y2ggYWZ0ZXIgXCJlbm91Z2hcIiB0aW1lIGhhcyBwYXNzZWRcbmNvbnN0IEVYVEVSTkFMX1dGX0NBTkNFTF9QQVRDSCA9ICdfX3RlbXBvcmFsX2ludGVybmFsX2Nvbm5lY3RfZXh0ZXJuYWxfaGFuZGxlX2NhbmNlbF90b19zY29wZSc7XG4vLyBUaGUgbmFtZSBvZiB0aGlzIHBhdGNoIGNvbWVzIGZyb20gYW4gYXR0ZW1wdCB0byBidWlsZCBhIGdlbmVyaWMgaW50ZXJuYWwgcGF0Y2hpbmcgbWVjaGFuaXNtLlxuLy8gVGhhdCBlZmZvcnQgaGFzIGJlZW4gYWJhbmRvbmVkIGluIGZhdm9yIG9mIGEgbmV3ZXIgV29ya2Zsb3dUYXNrQ29tcGxldGVkTWV0YWRhdGEgYmFzZWQgbWVjaGFuaXNtLlxuY29uc3QgQ09ORElUSU9OXzBfUEFUQ0ggPSAnX19zZGtfaW50ZXJuYWxfcGF0Y2hfbnVtYmVyOjEnO1xuXG4vKipcbiAqIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBjYW4gYmUgdXNlZCB0byBzaWduYWwgYW5kIGNhbmNlbCBhbiBleGlzdGluZyBXb3JrZmxvdyBleGVjdXRpb24uXG4gKiBJdCB0YWtlcyBhIFdvcmtmbG93IElEIGFuZCBvcHRpb25hbCBydW4gSUQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHRlcm5hbFdvcmtmbG93SGFuZGxlKHdvcmtmbG93SWQ6IHN0cmluZywgcnVuSWQ/OiBzdHJpbmcpOiBFeHRlcm5hbFdvcmtmbG93SGFuZGxlIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LmdldEV4dGVybmFsV29ya2Zsb3dIYW5kbGUoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uIENvbnNpZGVyIHVzaW5nIENsaWVudC53b3JrZmxvdy5nZXRIYW5kbGUoLi4uKSBpbnN0ZWFkLiknXG4gICk7XG4gIHJldHVybiB7XG4gICAgd29ya2Zsb3dJZCxcbiAgICBydW5JZCxcbiAgICBjYW5jZWwoKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAvLyBDb25uZWN0IHRoaXMgY2FuY2VsIG9wZXJhdGlvbiB0byB0aGUgY3VycmVudCBjYW5jZWxsYXRpb24gc2NvcGUuXG4gICAgICAgIC8vIFRoaXMgaXMgYmVoYXZpb3Igd2FzIGludHJvZHVjZWQgYWZ0ZXIgdjAuMjIuMCBhbmQgaXMgaW5jb21wYXRpYmxlXG4gICAgICAgIC8vIHdpdGggaGlzdG9yaWVzIGdlbmVyYXRlZCB3aXRoIHByZXZpb3VzIFNESyB2ZXJzaW9ucyBhbmQgdGh1cyByZXF1aXJlc1xuICAgICAgICAvLyBwYXRjaGluZy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgdHJ5IHRvIGRlbGF5IHBhdGNoaW5nIGFzIG11Y2ggYXMgcG9zc2libGUgdG8gYXZvaWQgcG9sbHV0aW5nXG4gICAgICAgIC8vIGhpc3RvcmllcyB1bmxlc3Mgc3RyaWN0bHkgcmVxdWlyZWQuXG4gICAgICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgICAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChwYXRjaGVkKEVYVEVSTkFMX1dGX0NBTkNFTF9QQVRDSCkpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICAgICAgaWYgKHBhdGNoZWQoRVhURVJOQUxfV0ZfQ0FOQ0VMX1BBVENIKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5jYW5jZWxXb3JrZmxvdysrO1xuICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgIHJlcXVlc3RDYW5jZWxFeHRlcm5hbFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgICBuYW1lc3BhY2U6IGFjdGl2YXRvci5pbmZvLm5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgd29ya2Zsb3dJZCxcbiAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuY2FuY2VsV29ya2Zsb3cuc2V0KHNlcSwgeyByZXNvbHZlLCByZWplY3QgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10+KGRlZjogU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IHN0cmluZywgLi4uYXJnczogQXJncyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgcmV0dXJuIGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgICAgICdzaWduYWxXb3JrZmxvdycsXG4gICAgICAgIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXJcbiAgICAgICkoe1xuICAgICAgICBzZXE6IGFjdGl2YXRvci5uZXh0U2Vxcy5zaWduYWxXb3JrZmxvdysrLFxuICAgICAgICBzaWduYWxOYW1lOiB0eXBlb2YgZGVmID09PSAnc3RyaW5nJyA/IGRlZiA6IGRlZi5uYW1lLFxuICAgICAgICBhcmdzLFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICB0eXBlOiAnZXh0ZXJuYWwnLFxuICAgICAgICAgIHdvcmtmbG93RXhlY3V0aW9uOiB7IHdvcmtmbG93SWQsIHJ1bklkIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGU6IHN0cmluZyxcbiAgb3B0aW9uczogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93RnVuYzogVCxcbiAgb3B0aW9uczogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAqKk92ZXJyaWRlIGZvciBXb3JrZmxvd3MgdGhhdCBhY2NlcHQgbm8gYXJndW1lbnRzKiouXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzICgpID0+IFByb21pc2U8YW55Pj4od29ya2Zsb3dUeXBlOiBzdHJpbmcpOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBUaGUgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgKCkgPT4gUHJvbWlzZTxhbnk+Pih3b3JrZmxvd0Z1bmM6IFQpOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGVPckZ1bmM6IHN0cmluZyB8IFQsXG4gIG9wdGlvbnM/OiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5zdGFydENoaWxkKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLiBDb25zaWRlciB1c2luZyBDbGllbnQud29ya2Zsb3cuc3RhcnQoLi4uKSBpbnN0ZWFkLiknXG4gICk7XG4gIGNvbnN0IG9wdGlvbnNXaXRoRGVmYXVsdHMgPSBhZGREZWZhdWx0V29ya2Zsb3dPcHRpb25zKG9wdGlvbnMgPz8gKHt9IGFzIGFueSkpO1xuICBjb25zdCB3b3JrZmxvd1R5cGUgPSBleHRyYWN0V29ya2Zsb3dUeXBlKHdvcmtmbG93VHlwZU9yRnVuYyk7XG4gIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgJ3N0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbicsXG4gICAgc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uTmV4dEhhbmRsZXJcbiAgKTtcbiAgY29uc3QgW3N0YXJ0ZWQsIGNvbXBsZXRlZF0gPSBhd2FpdCBleGVjdXRlKHtcbiAgICBzZXE6IGFjdGl2YXRvci5uZXh0U2Vxcy5jaGlsZFdvcmtmbG93KyssXG4gICAgb3B0aW9uczogb3B0aW9uc1dpdGhEZWZhdWx0cyxcbiAgICBoZWFkZXJzOiB7fSxcbiAgICB3b3JrZmxvd1R5cGUsXG4gIH0pO1xuICBjb25zdCBmaXJzdEV4ZWN1dGlvblJ1bklkID0gYXdhaXQgc3RhcnRlZDtcblxuICByZXR1cm4ge1xuICAgIHdvcmtmbG93SWQ6IG9wdGlvbnNXaXRoRGVmYXVsdHMud29ya2Zsb3dJZCxcbiAgICBmaXJzdEV4ZWN1dGlvblJ1bklkLFxuICAgIGFzeW5jIHJlc3VsdCgpOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj4ge1xuICAgICAgcmV0dXJuIChhd2FpdCBjb21wbGV0ZWQpIGFzIGFueTtcbiAgICB9LFxuICAgIGFzeW5jIHNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10+KGRlZjogU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IHN0cmluZywgLi4uYXJnczogQXJncyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgcmV0dXJuIGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgICAgICdzaWduYWxXb3JrZmxvdycsXG4gICAgICAgIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXJcbiAgICAgICkoe1xuICAgICAgICBzZXE6IGFjdGl2YXRvci5uZXh0U2Vxcy5zaWduYWxXb3JrZmxvdysrLFxuICAgICAgICBzaWduYWxOYW1lOiB0eXBlb2YgZGVmID09PSAnc3RyaW5nJyA/IGRlZiA6IGRlZi5uYW1lLFxuICAgICAgICBhcmdzLFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICB0eXBlOiAnY2hpbGQnLFxuICAgICAgICAgIGNoaWxkV29ya2Zsb3dJZDogb3B0aW9uc1dpdGhEZWZhdWx0cy53b3JrZmxvd0lkLFxuICAgICAgICB9LFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dUeXBlOiBzdHJpbmcsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93RnVuYzogVCxcbiAgb3B0aW9uczogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBhbmQgYXdhaXQgaXRzIGNvbXBsZXRpb24uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqIC0gVGhpcyBvcGVyYXRpb24gaXMgY2FuY2VsbGFibGUgdXNpbmcge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKlxuICogQHJldHVybiBUaGUgcmVzdWx0IG9mIHRoZSBjaGlsZCBXb3JrZmxvdy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgKCkgPT4gV29ya2Zsb3dSZXR1cm5UeXBlPihcbiAgd29ya2Zsb3dUeXBlOiBzdHJpbmdcbik6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBhbmQgYXdhaXQgaXRzIGNvbXBsZXRpb24uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqIC0gRGVkdWNlcyB0aGUgV29ya2Zsb3cgdHlwZSBhbmQgc2lnbmF0dXJlIGZyb20gcHJvdmlkZWQgV29ya2Zsb3cgZnVuY3Rpb24uXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzICgpID0+IFdvcmtmbG93UmV0dXJuVHlwZT4od29ya2Zsb3dGdW5jOiBUKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZU9yRnVuYzogc3RyaW5nIHwgVCxcbiAgb3B0aW9ucz86IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuZXhlY3V0ZUNoaWxkKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLiBDb25zaWRlciB1c2luZyBDbGllbnQud29ya2Zsb3cuZXhlY3V0ZSguLi4pIGluc3RlYWQuJ1xuICApO1xuICBjb25zdCBvcHRpb25zV2l0aERlZmF1bHRzID0gYWRkRGVmYXVsdFdvcmtmbG93T3B0aW9ucyhvcHRpb25zID8/ICh7fSBhcyBhbnkpKTtcbiAgY29uc3Qgd29ya2Zsb3dUeXBlID0gZXh0cmFjdFdvcmtmbG93VHlwZSh3b3JrZmxvd1R5cGVPckZ1bmMpO1xuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICdzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24nLFxuICAgIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbk5leHRIYW5kbGVyXG4gICk7XG4gIGNvbnN0IGV4ZWNQcm9taXNlID0gZXhlY3V0ZSh7XG4gICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuY2hpbGRXb3JrZmxvdysrLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNXaXRoRGVmYXVsdHMsXG4gICAgaGVhZGVyczoge30sXG4gICAgd29ya2Zsb3dUeXBlLFxuICB9KTtcbiAgdW50cmFja1Byb21pc2UoZXhlY1Byb21pc2UpO1xuICBjb25zdCBjb21wbGV0ZWRQcm9taXNlID0gZXhlY1Byb21pc2UudGhlbigoW19zdGFydGVkLCBjb21wbGV0ZWRdKSA9PiBjb21wbGV0ZWQpO1xuICB1bnRyYWNrUHJvbWlzZShjb21wbGV0ZWRQcm9taXNlKTtcbiAgcmV0dXJuIGNvbXBsZXRlZFByb21pc2UgYXMgUHJvbWlzZTxhbnk+O1xufVxuXG4vKipcbiAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBXb3JrZmxvdy5cbiAqXG4gKiBXQVJOSU5HOiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSBmcm96ZW4gY29weSBvZiBXb3JrZmxvd0luZm8sIGF0IHRoZSBwb2ludCB3aGVyZSB0aGlzIG1ldGhvZCBoYXMgYmVlbiBjYWxsZWQuXG4gKiBDaGFuZ2VzIGhhcHBlbmluZyBhdCBsYXRlciBwb2ludCBpbiB3b3JrZmxvdyBleGVjdXRpb24gd2lsbCBub3QgYmUgcmVmbGVjdGVkIGluIHRoZSByZXR1cm5lZCBvYmplY3QuXG4gKlxuICogRm9yIHRoaXMgcmVhc29uLCB3ZSByZWNvbW1lbmQgY2FsbGluZyBgd29ya2Zsb3dJbmZvKClgIG9uIGV2ZXJ5IGFjY2VzcyB0byB7QGxpbmsgV29ya2Zsb3dJbmZvfSdzIGZpZWxkcyxcbiAqIHJhdGhlciB0aGFuIGNhY2hpbmcgdGhlIGBXb3JrZmxvd0luZm9gIG9iamVjdCAob3IgcGFydCBvZiBpdCkgaW4gYSBsb2NhbCB2YXJpYWJsZS4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHNcbiAqIC8vIEdPT0RcbiAqIGZ1bmN0aW9uIG15V29ya2Zsb3coKSB7XG4gKiAgIGRvU29tZXRoaW5nKHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXMpXG4gKiAgIC4uLlxuICogICBkb1NvbWV0aGluZ0Vsc2Uod29ya2Zsb3dJbmZvKCkuc2VhcmNoQXR0cmlidXRlcylcbiAqIH1cbiAqIGBgYFxuICpcbiAqIHZzXG4gKlxuICogYGBgdHNcbiAqIC8vIEJBRFxuICogZnVuY3Rpb24gbXlXb3JrZmxvdygpIHtcbiAqICAgY29uc3QgYXR0cmlidXRlcyA9IHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXNcbiAqICAgZG9Tb21ldGhpbmcoYXR0cmlidXRlcylcbiAqICAgLi4uXG4gKiAgIGRvU29tZXRoaW5nRWxzZShhdHRyaWJ1dGVzKVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZmxvd0luZm8oKTogV29ya2Zsb3dJbmZvIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LndvcmtmbG93SW5mbyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcbiAgcmV0dXJuIGFjdGl2YXRvci5pbmZvO1xufVxuXG4vKipcbiAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCB1cGRhdGUgaWYgYW55LlxuICpcbiAqIEByZXR1cm4gSW5mbyBmb3IgdGhlIGN1cnJlbnQgdXBkYXRlIGhhbmRsZXIgdGhlIGNvZGUgY2FsbGluZyB0aGlzIGlzIGV4ZWN1dGluZ1xuICogd2l0aGluIGlmIGFueS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGN1cnJlbnRVcGRhdGVJbmZvKCk6IFVwZGF0ZUluZm8gfCB1bmRlZmluZWQge1xuICBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cuY3VycmVudFVwZGF0ZUluZm8oLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG4gIHJldHVybiBVcGRhdGVTY29wZS5jdXJyZW50KCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCBjb2RlIGlzIGV4ZWN1dGluZyBpbiB3b3JrZmxvdyBjb250ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbldvcmtmbG93Q29udGV4dCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIG1heWJlR2V0QWN0aXZhdG9yKCkgIT09IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gYGZgIHRoYXQgd2lsbCBjYXVzZSB0aGUgY3VycmVudCBXb3JrZmxvdyB0byBDb250aW51ZUFzTmV3IHdoZW4gY2FsbGVkLlxuICpcbiAqIGBmYCB0YWtlcyB0aGUgc2FtZSBhcmd1bWVudHMgYXMgdGhlIFdvcmtmbG93IGZ1bmN0aW9uIHN1cHBsaWVkIHRvIHR5cGVwYXJhbSBgRmAuXG4gKlxuICogT25jZSBgZmAgaXMgY2FsbGVkLCBXb3JrZmxvdyBFeGVjdXRpb24gaW1tZWRpYXRlbHkgY29tcGxldGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNvbnRpbnVlQXNOZXdGdW5jPEYgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIG9wdGlvbnM/OiBDb250aW51ZUFzTmV3T3B0aW9uc1xuKTogKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rj4pID0+IFByb21pc2U8bmV2ZXI+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LmNvbnRpbnVlQXNOZXcoLi4uKSBhbmQgV29ya2Zsb3cubWFrZUNvbnRpbnVlQXNOZXdGdW5jKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcbiAgY29uc3QgaW5mbyA9IGFjdGl2YXRvci5pbmZvO1xuICBjb25zdCB7IHdvcmtmbG93VHlwZSwgdGFza1F1ZXVlLCAuLi5yZXN0IH0gPSBvcHRpb25zID8/IHt9O1xuICBjb25zdCByZXF1aXJlZE9wdGlvbnMgPSB7XG4gICAgd29ya2Zsb3dUeXBlOiB3b3JrZmxvd1R5cGUgPz8gaW5mby53b3JrZmxvd1R5cGUsXG4gICAgdGFza1F1ZXVlOiB0YXNrUXVldWUgPz8gaW5mby50YXNrUXVldWUsXG4gICAgLi4ucmVzdCxcbiAgfTtcblxuICByZXR1cm4gKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rj4pOiBQcm9taXNlPG5ldmVyPiA9PiB7XG4gICAgY29uc3QgZm4gPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsICdjb250aW51ZUFzTmV3JywgYXN5bmMgKGlucHV0KSA9PiB7XG4gICAgICBjb25zdCB7IGhlYWRlcnMsIGFyZ3MsIG9wdGlvbnMgfSA9IGlucHV0O1xuICAgICAgdGhyb3cgbmV3IENvbnRpbnVlQXNOZXcoe1xuICAgICAgICB3b3JrZmxvd1R5cGU6IG9wdGlvbnMud29ya2Zsb3dUeXBlLFxuICAgICAgICBhcmd1bWVudHM6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLmFyZ3MpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICB0YXNrUXVldWU6IG9wdGlvbnMudGFza1F1ZXVlLFxuICAgICAgICBtZW1vOiBvcHRpb25zLm1lbW8gJiYgbWFwVG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgb3B0aW9ucy5tZW1vKSxcbiAgICAgICAgc2VhcmNoQXR0cmlidXRlczogb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzXG4gICAgICAgICAgPyBtYXBUb1BheWxvYWRzKHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsIG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlcylcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgd29ya2Zsb3dSdW5UaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93UnVuVGltZW91dCksXG4gICAgICAgIHdvcmtmbG93VGFza1RpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dUYXNrVGltZW91dCksXG4gICAgICAgIHZlcnNpb25pbmdJbnRlbnQ6IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKG9wdGlvbnMudmVyc2lvbmluZ0ludGVudCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZm4oe1xuICAgICAgYXJncyxcbiAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgb3B0aW9uczogcmVxdWlyZWRPcHRpb25zLFxuICAgIH0pO1xuICB9O1xufVxuXG4vKipcbiAqIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1jb250aW51ZS1hcy1uZXcvIHwgQ29udGludWVzLUFzLU5ld30gdGhlIGN1cnJlbnQgV29ya2Zsb3cgRXhlY3V0aW9uXG4gKiB3aXRoIGRlZmF1bHQgb3B0aW9ucy5cbiAqXG4gKiBTaG9ydGhhbmQgZm9yIGBtYWtlQ29udGludWVBc05ld0Z1bmM8Rj4oKSguLi5hcmdzKWAuIChTZWU6IHtAbGluayBtYWtlQ29udGludWVBc05ld0Z1bmN9LilcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqYGBgdHNcbiAqaW1wb3J0IHsgY29udGludWVBc05ldyB9IGZyb20gJ0B0ZW1wb3JhbGlvL3dvcmtmbG93JztcbiAqXG4gKmV4cG9ydCBhc3luYyBmdW5jdGlvbiBteVdvcmtmbG93KG46IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICogIC8vIC4uLiBXb3JrZmxvdyBsb2dpY1xuICogIGF3YWl0IGNvbnRpbnVlQXNOZXc8dHlwZW9mIG15V29ya2Zsb3c+KG4gKyAxKTtcbiAqfVxuICpgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnRpbnVlQXNOZXc8RiBleHRlbmRzIFdvcmtmbG93PiguLi5hcmdzOiBQYXJhbWV0ZXJzPEY+KTogUHJvbWlzZTxuZXZlcj4ge1xuICByZXR1cm4gbWFrZUNvbnRpbnVlQXNOZXdGdW5jKCkoLi4uYXJncyk7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYW4gUkZDIGNvbXBsaWFudCBWNCB1dWlkLlxuICogVXNlcyB0aGUgd29ya2Zsb3cncyBkZXRlcm1pbmlzdGljIFBSTkcgbWFraW5nIGl0IHNhZmUgZm9yIHVzZSB3aXRoaW4gYSB3b3JrZmxvdy5cbiAqIFRoaXMgZnVuY3Rpb24gaXMgY3J5cHRvZ3JhcGhpY2FsbHkgaW5zZWN1cmUuXG4gKiBTZWUgdGhlIHtAbGluayBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDUwMzQvaG93LXRvLWNyZWF0ZS1hLWd1aWQtdXVpZCB8IHN0YWNrb3ZlcmZsb3cgZGlzY3Vzc2lvbn0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1dWlkNCgpOiBzdHJpbmcge1xuICAvLyBSZXR1cm4gdGhlIGhleGFkZWNpbWFsIHRleHQgcmVwcmVzZW50YXRpb24gb2YgbnVtYmVyIGBuYCwgcGFkZGVkIHdpdGggemVyb2VzIHRvIGJlIG9mIGxlbmd0aCBgcGBcbiAgY29uc3QgaG8gPSAobjogbnVtYmVyLCBwOiBudW1iZXIpID0+IG4udG9TdHJpbmcoMTYpLnBhZFN0YXJ0KHAsICcwJyk7XG4gIC8vIENyZWF0ZSBhIHZpZXcgYmFja2VkIGJ5IGEgMTYtYnl0ZSBidWZmZXJcbiAgY29uc3QgdmlldyA9IG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIoMTYpKTtcbiAgLy8gRmlsbCBidWZmZXIgd2l0aCByYW5kb20gdmFsdWVzXG4gIHZpZXcuc2V0VWludDMyKDAsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgdmlldy5zZXRVaW50MzIoNCwgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgPj4+IDApO1xuICB2aWV3LnNldFVpbnQzMig4LCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIHZpZXcuc2V0VWludDMyKDEyLCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIC8vIFBhdGNoIHRoZSA2dGggYnl0ZSB0byByZWZsZWN0IGEgdmVyc2lvbiA0IFVVSURcbiAgdmlldy5zZXRVaW50OCg2LCAodmlldy5nZXRVaW50OCg2KSAmIDB4ZikgfCAweDQwKTtcbiAgLy8gUGF0Y2ggdGhlIDh0aCBieXRlIHRvIHJlZmxlY3QgYSB2YXJpYW50IDEgVVVJRCAodmVyc2lvbiA0IFVVSURzIGFyZSlcbiAgdmlldy5zZXRVaW50OCg4LCAodmlldy5nZXRVaW50OCg4KSAmIDB4M2YpIHwgMHg4MCk7XG4gIC8vIENvbXBpbGUgdGhlIGNhbm9uaWNhbCB0ZXh0dWFsIGZvcm0gZnJvbSB0aGUgYXJyYXkgZGF0YVxuICByZXR1cm4gYCR7aG8odmlldy5nZXRVaW50MzIoMCksIDgpfS0ke2hvKHZpZXcuZ2V0VWludDE2KDQpLCA0KX0tJHtobyh2aWV3LmdldFVpbnQxNig2KSwgNCl9LSR7aG8oXG4gICAgdmlldy5nZXRVaW50MTYoOCksXG4gICAgNFxuICApfS0ke2hvKHZpZXcuZ2V0VWludDMyKDEwKSwgOCl9JHtobyh2aWV3LmdldFVpbnQxNigxNCksIDQpfWA7XG59XG5cbi8qKlxuICogUGF0Y2ggb3IgdXBncmFkZSB3b3JrZmxvdyBjb2RlIGJ5IGNoZWNraW5nIG9yIHN0YXRpbmcgdGhhdCB0aGlzIHdvcmtmbG93IGhhcyBhIGNlcnRhaW4gcGF0Y2guXG4gKlxuICogU2VlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC92ZXJzaW9uaW5nIHwgZG9jcyBwYWdlfSBmb3IgaW5mby5cbiAqXG4gKiBJZiB0aGUgd29ya2Zsb3cgaXMgcmVwbGF5aW5nIGFuIGV4aXN0aW5nIGhpc3RvcnksIHRoZW4gdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgaWYgdGhhdFxuICogaGlzdG9yeSB3YXMgcHJvZHVjZWQgYnkgYSB3b3JrZXIgd2hpY2ggYWxzbyBoYWQgYSBgcGF0Y2hlZGAgY2FsbCB3aXRoIHRoZSBzYW1lIGBwYXRjaElkYC5cbiAqIElmIHRoZSBoaXN0b3J5IHdhcyBwcm9kdWNlZCBieSBhIHdvcmtlciAqd2l0aG91dCogc3VjaCBhIGNhbGwsIHRoZW4gaXQgd2lsbCByZXR1cm4gZmFsc2UuXG4gKlxuICogSWYgdGhlIHdvcmtmbG93IGlzIG5vdCBjdXJyZW50bHkgcmVwbGF5aW5nLCB0aGVuIHRoaXMgY2FsbCAqYWx3YXlzKiByZXR1cm5zIHRydWUuXG4gKlxuICogWW91ciB3b3JrZmxvdyBjb2RlIHNob3VsZCBydW4gdGhlIFwibmV3XCIgY29kZSBpZiB0aGlzIHJldHVybnMgdHJ1ZSwgaWYgaXQgcmV0dXJucyBmYWxzZSwgeW91XG4gKiBzaG91bGQgcnVuIHRoZSBcIm9sZFwiIGNvZGUuIEJ5IGRvaW5nIHRoaXMsIHlvdSBjYW4gbWFpbnRhaW4gZGV0ZXJtaW5pc20uXG4gKlxuICogQHBhcmFtIHBhdGNoSWQgQW4gaWRlbnRpZmllciB0aGF0IHNob3VsZCBiZSB1bmlxdWUgdG8gdGhpcyBwYXRjaC4gSXQgaXMgT0sgdG8gdXNlIG11bHRpcGxlXG4gKiBjYWxscyB3aXRoIHRoZSBzYW1lIElELCB3aGljaCBtZWFucyBhbGwgc3VjaCBjYWxscyB3aWxsIGFsd2F5cyByZXR1cm4gdGhlIHNhbWUgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaGVkKHBhdGNoSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cucGF0Y2goLi4uKSBhbmQgV29ya2Zsb3cuZGVwcmVjYXRlUGF0Y2ggbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcbiAgcmV0dXJuIGFjdGl2YXRvci5wYXRjaEludGVybmFsKHBhdGNoSWQsIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBJbmRpY2F0ZSB0aGF0IGEgcGF0Y2ggaXMgYmVpbmcgcGhhc2VkIG91dC5cbiAqXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L3ZlcnNpb25pbmcgfCBkb2NzIHBhZ2V9IGZvciBpbmZvLlxuICpcbiAqIFdvcmtmbG93cyB3aXRoIHRoaXMgY2FsbCBtYXkgYmUgZGVwbG95ZWQgYWxvbmdzaWRlIHdvcmtmbG93cyB3aXRoIGEge0BsaW5rIHBhdGNoZWR9IGNhbGwsIGJ1dFxuICogdGhleSBtdXN0ICpub3QqIGJlIGRlcGxveWVkIHdoaWxlIGFueSB3b3JrZXJzIHN0aWxsIGV4aXN0IHJ1bm5pbmcgb2xkIGNvZGUgd2l0aG91dCBhXG4gKiB7QGxpbmsgcGF0Y2hlZH0gY2FsbCwgb3IgYW55IHJ1bnMgd2l0aCBoaXN0b3JpZXMgcHJvZHVjZWQgYnkgc3VjaCB3b3JrZXJzIGV4aXN0LiBJZiBlaXRoZXIga2luZFxuICogb2Ygd29ya2VyIGVuY291bnRlcnMgYSBoaXN0b3J5IHByb2R1Y2VkIGJ5IHRoZSBvdGhlciwgdGhlaXIgYmVoYXZpb3IgaXMgdW5kZWZpbmVkLlxuICpcbiAqIE9uY2UgYWxsIGxpdmUgd29ya2Zsb3cgcnVucyBoYXZlIGJlZW4gcHJvZHVjZWQgYnkgd29ya2VycyB3aXRoIHRoaXMgY2FsbCwgeW91IGNhbiBkZXBsb3kgd29ya2Vyc1xuICogd2hpY2ggYXJlIGZyZWUgb2YgZWl0aGVyIGtpbmQgb2YgcGF0Y2ggY2FsbCBmb3IgdGhpcyBJRC4gV29ya2VycyB3aXRoIGFuZCB3aXRob3V0IHRoaXMgY2FsbFxuICogbWF5IGNvZXhpc3QsIGFzIGxvbmcgYXMgdGhleSBhcmUgYm90aCBydW5uaW5nIHRoZSBcIm5ld1wiIGNvZGUuXG4gKlxuICogQHBhcmFtIHBhdGNoSWQgQW4gaWRlbnRpZmllciB0aGF0IHNob3VsZCBiZSB1bmlxdWUgdG8gdGhpcyBwYXRjaC4gSXQgaXMgT0sgdG8gdXNlIG11bHRpcGxlXG4gKiBjYWxscyB3aXRoIHRoZSBzYW1lIElELCB3aGljaCBtZWFucyBhbGwgc3VjaCBjYWxscyB3aWxsIGFsd2F5cyByZXR1cm4gdGhlIHNhbWUgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXByZWNhdGVQYXRjaChwYXRjaElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnBhdGNoKC4uLikgYW5kIFdvcmtmbG93LmRlcHJlY2F0ZVBhdGNoIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG4gIGFjdGl2YXRvci5wYXRjaEludGVybmFsKHBhdGNoSWQsIHRydWUpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBgZm5gIGV2YWx1YXRlcyB0byBgdHJ1ZWAgb3IgYHRpbWVvdXRgIGV4cGlyZXMuXG4gKlxuICogQHBhcmFtIHRpbWVvdXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICpcbiAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGNvbmRpdGlvbiB3YXMgdHJ1ZSBiZWZvcmUgdGhlIHRpbWVvdXQgZXhwaXJlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29uZGl0aW9uKGZuOiAoKSA9PiBib29sZWFuLCB0aW1lb3V0OiBEdXJhdGlvbik6IFByb21pc2U8Ym9vbGVhbj47XG5cbi8qKlxuICogUmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGBmbmAgZXZhbHVhdGVzIHRvIGB0cnVlYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmRpdGlvbihmbjogKCkgPT4gYm9vbGVhbik6IFByb21pc2U8dm9pZD47XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb25kaXRpb24oZm46ICgpID0+IGJvb2xlYW4sIHRpbWVvdXQ/OiBEdXJhdGlvbik6IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+IHtcbiAgYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LmNvbmRpdGlvbiguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcbiAgLy8gUHJpb3IgdG8gMS41LjAsIGBjb25kaXRpb24oZm4sIDApYCB3YXMgdHJlYXRlZCBhcyBlcXVpdmFsZW50IHRvIGBjb25kaXRpb24oZm4sIHVuZGVmaW5lZClgXG4gIGlmICh0aW1lb3V0ID09PSAwICYmICFwYXRjaGVkKENPTkRJVElPTl8wX1BBVENIKSkge1xuICAgIHJldHVybiBjb25kaXRpb25Jbm5lcihmbik7XG4gIH1cbiAgaWYgKHR5cGVvZiB0aW1lb3V0ID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgdGltZW91dCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gQ2FuY2VsbGF0aW9uU2NvcGUuY2FuY2VsbGFibGUoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UucmFjZShbc2xlZXAodGltZW91dCkudGhlbigoKSA9PiBmYWxzZSksIGNvbmRpdGlvbklubmVyKGZuKS50aGVuKCgpID0+IHRydWUpXSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCkuY2FuY2VsKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGNvbmRpdGlvbklubmVyKGZuKTtcbn1cblxuZnVuY3Rpb24gY29uZGl0aW9uSW5uZXIoZm46ICgpID0+IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuY29uZGl0aW9uKys7XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBhY3RpdmF0b3IuYmxvY2tlZENvbmRpdGlvbnMuZGVsZXRlKHNlcSk7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEVhZ2VyIGV2YWx1YXRpb25cbiAgICBpZiAoZm4oKSkge1xuICAgICAgcmVzb2x2ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFjdGl2YXRvci5ibG9ja2VkQ29uZGl0aW9ucy5zZXQoc2VxLCB7IGZuLCByZXNvbHZlIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYW4gdXBkYXRlIG1ldGhvZCBmb3IgYSBXb3JrZmxvdy5cbiAqXG4gKiBBIGRlZmluaXRpb24gaXMgdXNlZCB0byByZWdpc3RlciBhIGhhbmRsZXIgaW4gdGhlIFdvcmtmbG93IHZpYSB7QGxpbmsgc2V0SGFuZGxlcn0gYW5kIHRvIHVwZGF0ZSBhIFdvcmtmbG93IHVzaW5nIGEge0BsaW5rIFdvcmtmbG93SGFuZGxlfSwge0BsaW5rIENoaWxkV29ya2Zsb3dIYW5kbGV9IG9yIHtAbGluayBFeHRlcm5hbFdvcmtmbG93SGFuZGxlfS5cbiAqIEEgZGVmaW5pdGlvbiBjYW4gYmUgcmV1c2VkIGluIG11bHRpcGxlIFdvcmtmbG93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVVwZGF0ZTxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgbmFtZTogTmFtZVxuKTogVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAndXBkYXRlJyxcbiAgICBuYW1lLFxuICB9IGFzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzLCBOYW1lPjtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBzaWduYWwgbWV0aG9kIGZvciBhIFdvcmtmbG93LlxuICpcbiAqIEEgZGVmaW5pdGlvbiBpcyB1c2VkIHRvIHJlZ2lzdGVyIGEgaGFuZGxlciBpbiB0aGUgV29ya2Zsb3cgdmlhIHtAbGluayBzZXRIYW5kbGVyfSBhbmQgdG8gc2lnbmFsIGEgV29ya2Zsb3cgdXNpbmcgYSB7QGxpbmsgV29ya2Zsb3dIYW5kbGV9LCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZX0gb3Ige0BsaW5rIEV4dGVybmFsV29ya2Zsb3dIYW5kbGV9LlxuICogQSBkZWZpbml0aW9uIGNhbiBiZSByZXVzZWQgaW4gbXVsdGlwbGUgV29ya2Zsb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lU2lnbmFsPEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgbmFtZTogTmFtZVxuKTogU2lnbmFsRGVmaW5pdGlvbjxBcmdzLCBOYW1lPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3NpZ25hbCcsXG4gICAgbmFtZSxcbiAgfSBhcyBTaWduYWxEZWZpbml0aW9uPEFyZ3MsIE5hbWU+O1xufVxuXG4vKipcbiAqIERlZmluZSBhIHF1ZXJ5IG1ldGhvZCBmb3IgYSBXb3JrZmxvdy5cbiAqXG4gKiBBIGRlZmluaXRpb24gaXMgdXNlZCB0byByZWdpc3RlciBhIGhhbmRsZXIgaW4gdGhlIFdvcmtmbG93IHZpYSB7QGxpbmsgc2V0SGFuZGxlcn0gYW5kIHRvIHF1ZXJ5IGEgV29ya2Zsb3cgdXNpbmcgYSB7QGxpbmsgV29ya2Zsb3dIYW5kbGV9LlxuICogQSBkZWZpbml0aW9uIGNhbiBiZSByZXVzZWQgaW4gbXVsdGlwbGUgV29ya2Zsb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lUXVlcnk8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4oXG4gIG5hbWU6IE5hbWVcbik6IFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAncXVlcnknLFxuICAgIG5hbWUsXG4gIH0gYXMgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncywgTmFtZT47XG59XG5cbi8qKlxuICogU2V0IGEgaGFuZGxlciBmdW5jdGlvbiBmb3IgYSBXb3JrZmxvdyB1cGRhdGUsIHNpZ25hbCwgb3IgcXVlcnkuXG4gKlxuICogSWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZm9yIGEgZ2l2ZW4gdXBkYXRlLCBzaWduYWwsIG9yIHF1ZXJ5IG5hbWUgdGhlIGxhc3QgaGFuZGxlciB3aWxsIG92ZXJ3cml0ZSBhbnkgcHJldmlvdXMgY2FsbHMuXG4gKlxuICogQHBhcmFtIGRlZiBhbiB7QGxpbmsgVXBkYXRlRGVmaW5pdGlvbn0sIHtAbGluayBTaWduYWxEZWZpbml0aW9ufSwgb3Ige0BsaW5rIFF1ZXJ5RGVmaW5pdGlvbn0gYXMgcmV0dXJuZWQgYnkge0BsaW5rIGRlZmluZVVwZGF0ZX0sIHtAbGluayBkZWZpbmVTaWduYWx9LCBvciB7QGxpbmsgZGVmaW5lUXVlcnl9IHJlc3BlY3RpdmVseS5cbiAqIEBwYXJhbSBoYW5kbGVyIGEgY29tcGF0aWJsZSBoYW5kbGVyIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gZGVmaW5pdGlvbiBvciBgdW5kZWZpbmVkYCB0byB1bnNldCB0aGUgaGFuZGxlci5cbiAqIEBwYXJhbSBvcHRpb25zIGFuIG9wdGlvbmFsIGBkZXNjcmlwdGlvbmAgb2YgdGhlIGhhbmRsZXIgYW5kIGFuIG9wdGlvbmFsIHVwZGF0ZSBgdmFsaWRhdG9yYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10sIFQgZXh0ZW5kcyBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzPj4oXG4gIGRlZjogVCxcbiAgaGFuZGxlcjogSGFuZGxlcjxSZXQsIEFyZ3MsIFQ+IHwgdW5kZWZpbmVkLFxuICBvcHRpb25zPzogUXVlcnlIYW5kbGVyT3B0aW9uc1xuKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBzZXRIYW5kbGVyPFJldCwgQXJncyBleHRlbmRzIGFueVtdLCBUIGV4dGVuZHMgU2lnbmFsRGVmaW5pdGlvbjxBcmdzPj4oXG4gIGRlZjogVCxcbiAgaGFuZGxlcjogSGFuZGxlcjxSZXQsIEFyZ3MsIFQ+IHwgdW5kZWZpbmVkLFxuICBvcHRpb25zPzogU2lnbmFsSGFuZGxlck9wdGlvbnNcbik6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gc2V0SGFuZGxlcjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSwgVCBleHRlbmRzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzPj4oXG4gIGRlZjogVCxcbiAgaGFuZGxlcjogSGFuZGxlcjxSZXQsIEFyZ3MsIFQ+IHwgdW5kZWZpbmVkLFxuICBvcHRpb25zPzogVXBkYXRlSGFuZGxlck9wdGlvbnM8QXJncz5cbik6IHZvaWQ7XG5cbi8vIEZvciBVcGRhdGVzIGFuZCBTaWduYWxzIHdlIHdhbnQgdG8gbWFrZSBhIHB1YmxpYyBndWFyYW50ZWUgc29tZXRoaW5nIGxpa2UgdGhlXG4vLyBmb2xsb3dpbmc6XG4vL1xuLy8gICBcIklmIGEgV0ZUIGNvbnRhaW5zIGEgU2lnbmFsL1VwZGF0ZSwgYW5kIGlmIGEgaGFuZGxlciBpcyBhdmFpbGFibGUgZm9yIHRoYXRcbi8vICAgU2lnbmFsL1VwZGF0ZSwgdGhlbiB0aGUgaGFuZGxlciB3aWxsIGJlIGV4ZWN1dGVkLlwiXCJcbi8vXG4vLyBIb3dldmVyLCB0aGF0IHN0YXRlbWVudCBpcyBub3Qgd2VsbC1kZWZpbmVkLCBsZWF2aW5nIHNldmVyYWwgcXVlc3Rpb25zIG9wZW46XG4vL1xuLy8gMS4gV2hhdCBkb2VzIGl0IG1lYW4gZm9yIGEgaGFuZGxlciB0byBiZSBcImF2YWlsYWJsZVwiPyBXaGF0IGhhcHBlbnMgaWYgdGhlXG4vLyAgICBoYW5kbGVyIGlzIG5vdCBwcmVzZW50IGluaXRpYWxseSBidXQgaXMgc2V0IGF0IHNvbWUgcG9pbnQgZHVyaW5nIHRoZVxuLy8gICAgV29ya2Zsb3cgY29kZSB0aGF0IGlzIGV4ZWN1dGVkIGluIHRoYXQgV0ZUPyBXaGF0IGhhcHBlbnMgaWYgdGhlIGhhbmRsZXIgaXNcbi8vICAgIHNldCBhbmQgdGhlbiBkZWxldGVkLCBvciByZXBsYWNlZCB3aXRoIGEgZGlmZmVyZW50IGhhbmRsZXI/XG4vL1xuLy8gMi4gV2hlbiBpcyB0aGUgaGFuZGxlciBleGVjdXRlZD8gKFdoZW4gaXQgZmlyc3QgYmVjb21lcyBhdmFpbGFibGU/IEF0IHRoZSBlbmRcbi8vICAgIG9mIHRoZSBhY3RpdmF0aW9uPykgV2hhdCBhcmUgdGhlIGV4ZWN1dGlvbiBzZW1hbnRpY3Mgb2YgV29ya2Zsb3cgYW5kXG4vLyAgICBTaWduYWwvVXBkYXRlIGhhbmRsZXIgY29kZSBnaXZlbiB0aGF0IHRoZXkgYXJlIGNvbmN1cnJlbnQ/IENhbiB0aGUgdXNlclxuLy8gICAgcmVseSBvbiBTaWduYWwvVXBkYXRlIHNpZGUgZWZmZWN0cyBiZWluZyByZWZsZWN0ZWQgaW4gdGhlIFdvcmtmbG93IHJldHVyblxuLy8gICAgdmFsdWUsIG9yIGluIHRoZSB2YWx1ZSBwYXNzZWQgdG8gQ29udGludWUtQXMtTmV3PyBJZiB0aGUgaGFuZGxlciBpcyBhblxuLy8gICAgYXN5bmMgZnVuY3Rpb24gLyBjb3JvdXRpbmUsIGhvdyBtdWNoIG9mIGl0IGlzIGV4ZWN1dGVkIGFuZCB3aGVuIGlzIHRoZVxuLy8gICAgcmVzdCBleGVjdXRlZD9cbi8vXG4vLyAzLiBXaGF0IGhhcHBlbnMgaWYgdGhlIGhhbmRsZXIgaXMgbm90IGV4ZWN1dGVkPyAoaS5lLiBiZWNhdXNlIGl0IHdhc24ndFxuLy8gICAgYXZhaWxhYmxlIGluIHRoZSBzZW5zZSBkZWZpbmVkIGJ5ICgxKSlcbi8vXG4vLyA0LiBJbiB0aGUgY2FzZSBvZiBVcGRhdGUsIHdoZW4gaXMgdGhlIHZhbGlkYXRpb24gZnVuY3Rpb24gZXhlY3V0ZWQ/XG4vL1xuLy8gVGhlIGltcGxlbWVudGF0aW9uIGZvciBUeXBlc2NyaXB0IGlzIGFzIGZvbGxvd3M6XG4vL1xuLy8gMS4gc2RrLWNvcmUgc29ydHMgU2lnbmFsIGFuZCBVcGRhdGUgam9icyAoYW5kIFBhdGNoZXMpIGFoZWFkIG9mIGFsbCBvdGhlclxuLy8gICAgam9icy4gVGh1cyBpZiB0aGUgaGFuZGxlciBpcyBhdmFpbGFibGUgYXQgdGhlIHN0YXJ0IG9mIHRoZSBBY3RpdmF0aW9uIHRoZW5cbi8vICAgIHRoZSBTaWduYWwvVXBkYXRlIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIFdvcmtmbG93IGNvZGUgaXMgZXhlY3V0ZWQuIElmIGl0XG4vLyAgICBpcyBub3QsIHRoZW4gdGhlIFNpZ25hbC9VcGRhdGUgY2FsbHMgYXJlIHB1c2hlZCB0byBhIGJ1ZmZlci5cbi8vXG4vLyAyLiBPbiBlYWNoIGNhbGwgdG8gc2V0SGFuZGxlciBmb3IgYSBnaXZlbiBTaWduYWwvVXBkYXRlLCB3ZSBtYWtlIGEgcGFzc1xuLy8gICAgdGhyb3VnaCB0aGUgYnVmZmVyIGxpc3QuIElmIGEgYnVmZmVyZWQgam9iIGlzIGFzc29jaWF0ZWQgd2l0aCB0aGUganVzdC1zZXRcbi8vICAgIGhhbmRsZXIsIHRoZW4gdGhlIGpvYiBpcyByZW1vdmVkIGZyb20gdGhlIGJ1ZmZlciBhbmQgdGhlIGluaXRpYWxcbi8vICAgIHN5bmNocm9ub3VzIHBvcnRpb24gb2YgdGhlIGhhbmRsZXIgaXMgaW52b2tlZCBvbiB0aGF0IGlucHV0IChpLmUuXG4vLyAgICBwcmVlbXB0aW5nIHdvcmtmbG93IGNvZGUpLlxuLy9cbi8vIFRodXMgaW4gdGhlIGNhc2Ugb2YgVHlwZXNjcmlwdCB0aGUgcXVlc3Rpb25zIGFib3ZlIGFyZSBhbnN3ZXJlZCBhcyBmb2xsb3dzOlxuLy9cbi8vIDEuIEEgaGFuZGxlciBpcyBcImF2YWlsYWJsZVwiIGlmIGl0IGlzIHNldCBhdCB0aGUgc3RhcnQgb2YgdGhlIEFjdGl2YXRpb24gb3Jcbi8vICAgIGJlY29tZXMgc2V0IGF0IGFueSBwb2ludCBkdXJpbmcgdGhlIEFjdGl2YXRpb24uIElmIHRoZSBoYW5kbGVyIGlzIG5vdCBzZXRcbi8vICAgIGluaXRpYWxseSB0aGVuIGl0IGlzIGV4ZWN1dGVkIGFzIHNvb24gYXMgaXQgaXMgc2V0LiBTdWJzZXF1ZW50IGRlbGV0aW9uIG9yXG4vLyAgICByZXBsYWNlbWVudCBieSBhIGRpZmZlcmVudCBoYW5kbGVyIGhhcyBubyBpbXBhY3QgYmVjYXVzZSB0aGUgam9icyBpdCB3YXNcbi8vICAgIGhhbmRsaW5nIGhhdmUgYWxyZWFkeSBiZWVuIGhhbmRsZWQgYW5kIGFyZSBubyBsb25nZXIgaW4gdGhlIGJ1ZmZlci5cbi8vXG4vLyAyLiBUaGUgaGFuZGxlciBpcyBleGVjdXRlZCBhcyBzb29uIGFzIGl0IGJlY29tZXMgYXZhaWxhYmxlLiBJLmUuIGlmIHRoZVxuLy8gICAgaGFuZGxlciBpcyBzZXQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBBY3RpdmF0aW9uIHRoZW4gaXQgaXMgZXhlY3V0ZWQgd2hlblxuLy8gICAgZmlyc3QgYXR0ZW1wdGluZyB0byBwcm9jZXNzIHRoZSBTaWduYWwvVXBkYXRlIGpvYjsgYWx0ZXJuYXRpdmVseSwgaWYgaXQgaXNcbi8vICAgIHNldCBieSBhIHNldEhhbmRsZXIgY2FsbCBtYWRlIGJ5IFdvcmtmbG93IGNvZGUsIHRoZW4gaXQgaXMgZXhlY3V0ZWQgYXNcbi8vICAgIHBhcnQgb2YgdGhhdCBjYWxsIChwcmVlbXB0aW5nIFdvcmtmbG93IGNvZGUpLiBUaGVyZWZvcmUsIGEgdXNlciBjYW4gcmVseVxuLy8gICAgb24gU2lnbmFsL1VwZGF0ZSBzaWRlIGVmZmVjdHMgYmVpbmcgcmVmbGVjdGVkIGluIGUuZy4gdGhlIFdvcmtmbG93IHJldHVyblxuLy8gICAgdmFsdWUsIGFuZCBpbiB0aGUgdmFsdWUgcGFzc2VkIHRvIENvbnRpbnVlLUFzLU5ldy4gQWN0aXZhdGlvbiBqb2JzIGFyZVxuLy8gICAgcHJvY2Vzc2VkIGluIHRoZSBvcmRlciBzdXBwbGllZCBieSBzZGstY29yZSwgaS5lLiBTaWduYWxzLCB0aGVuIFVwZGF0ZXMsXG4vLyAgICB0aGVuIG90aGVyIGpvYnMuIFdpdGhpbiBlYWNoIGdyb3VwLCB0aGUgb3JkZXIgc2VudCBieSB0aGUgc2VydmVyIGlzXG4vLyAgICBwcmVzZXJ2ZWQuIElmIHRoZSBoYW5kbGVyIGlzIGFzeW5jLCBpdCBpcyBleGVjdXRlZCB1cCB0byBpdHMgZmlyc3QgeWllbGRcbi8vICAgIHBvaW50LlxuLy9cbi8vIDMuIFNpZ25hbCBjYXNlOiBJZiBhIGhhbmRsZXIgZG9lcyBub3QgYmVjb21lIGF2YWlsYWJsZSBmb3IgYSBTaWduYWwgam9iIHRoZW5cbi8vICAgIHRoZSBqb2IgcmVtYWlucyBpbiB0aGUgYnVmZmVyLiBJZiBhIGhhbmRsZXIgZm9yIHRoZSBTaWduYWwgYmVjb21lc1xuLy8gICAgYXZhaWxhYmxlIGluIGEgc3Vic2VxdWVudCBBY3RpdmF0aW9uIChvZiB0aGUgc2FtZSBvciBhIHN1YnNlcXVlbnQgV0ZUKVxuLy8gICAgdGhlbiB0aGUgaGFuZGxlciB3aWxsIGJlIGV4ZWN1dGVkLiBJZiBub3QsIHRoZW4gdGhlIFNpZ25hbCB3aWxsIG5ldmVyIGJlXG4vLyAgICByZXNwb25kZWQgdG8gYW5kIHRoaXMgY2F1c2VzIG5vIGVycm9yLlxuLy9cbi8vICAgIFVwZGF0ZSBjYXNlOiBJZiBhIGhhbmRsZXIgZG9lcyBub3QgYmVjb21lIGF2YWlsYWJsZSBmb3IgYW4gVXBkYXRlIGpvYiB0aGVuXG4vLyAgICB0aGUgVXBkYXRlIGlzIHJlamVjdGVkIGF0IHRoZSBlbmQgb2YgdGhlIEFjdGl2YXRpb24uIFRodXMsIGlmIGEgdXNlciBkb2VzXG4vLyAgICBub3Qgd2FudCBhbiBVcGRhdGUgdG8gYmUgcmVqZWN0ZWQgZm9yIHRoaXMgcmVhc29uLCB0aGVuIGl0IGlzIHRoZWlyXG4vLyAgICByZXNwb25zaWJpbGl0eSB0byBlbnN1cmUgdGhhdCB0aGVpciBhcHBsaWNhdGlvbiBhbmQgd29ya2Zsb3cgY29kZSBpbnRlcmFjdFxuLy8gICAgc3VjaCB0aGF0IGEgaGFuZGxlciBpcyBhdmFpbGFibGUgZm9yIHRoZSBVcGRhdGUgZHVyaW5nIGFueSBBY3RpdmF0aW9uXG4vLyAgICB3aGljaCBtaWdodCBjb250YWluIHRoZWlyIFVwZGF0ZSBqb2IuIChOb3RlIHRoYXQgdGhlIHVzZXIgb2Z0ZW4gaGFzXG4vLyAgICB1bmNlcnRhaW50eSBhYm91dCB3aGljaCBXRlQgdGhlaXIgU2lnbmFsL1VwZGF0ZSB3aWxsIGFwcGVhciBpbi4gRm9yXG4vLyAgICBleGFtcGxlLCBpZiB0aGV5IGNhbGwgc3RhcnRXb3JrZmxvdygpIGZvbGxvd2VkIGJ5IHN0YXJ0VXBkYXRlKCksIHRoZW4gdGhleVxuLy8gICAgd2lsbCB0eXBpY2FsbHkgbm90IGtub3cgd2hldGhlciB0aGVzZSB3aWxsIGJlIGRlbGl2ZXJlZCBpbiBvbmUgb3IgdHdvXG4vLyAgICBXRlRzLiBPbiB0aGUgb3RoZXIgaGFuZCB0aGVyZSBhcmUgc2l0dWF0aW9ucyB3aGVyZSB0aGV5IHdvdWxkIGhhdmUgcmVhc29uXG4vLyAgICB0byBiZWxpZXZlIHRoZXkgYXJlIGluIHRoZSBzYW1lIFdGVCwgZm9yIGV4YW1wbGUgaWYgdGhleSBkbyBub3Qgc3RhcnRcbi8vICAgIFdvcmtlciBwb2xsaW5nIHVudGlsIGFmdGVyIHRoZXkgaGF2ZSB2ZXJpZmllZCB0aGF0IGJvdGggcmVxdWVzdHMgaGF2ZVxuLy8gICAgc3VjY2VlZGVkLilcbi8vXG4vLyA0LiBJZiBhbiBVcGRhdGUgaGFzIGEgdmFsaWRhdGlvbiBmdW5jdGlvbiB0aGVuIGl0IGlzIGV4ZWN1dGVkIGltbWVkaWF0ZWx5XG4vLyAgICBwcmlvciB0byB0aGUgaGFuZGxlci4gKE5vdGUgdGhhdCB0aGUgdmFsaWRhdGlvbiBmdW5jdGlvbiBpcyByZXF1aXJlZCB0byBiZVxuLy8gICAgc3luY2hyb25vdXMpLlxuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8XG4gIFJldCxcbiAgQXJncyBleHRlbmRzIGFueVtdLFxuICBUIGV4dGVuZHMgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3M+IHwgU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3M+LFxuPihcbiAgZGVmOiBULFxuICBoYW5kbGVyOiBIYW5kbGVyPFJldCwgQXJncywgVD4gfCB1bmRlZmluZWQsXG4gIG9wdGlvbnM/OiBRdWVyeUhhbmRsZXJPcHRpb25zIHwgU2lnbmFsSGFuZGxlck9wdGlvbnMgfCBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzPlxuKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5zZXRIYW5kbGVyKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLicpO1xuICBjb25zdCBkZXNjcmlwdGlvbiA9IG9wdGlvbnM/LmRlc2NyaXB0aW9uO1xuICBpZiAoZGVmLnR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCB1cGRhdGVPcHRpb25zID0gb3B0aW9ucyBhcyBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzPiB8IHVuZGVmaW5lZDtcblxuICAgICAgY29uc3QgdmFsaWRhdG9yID0gdXBkYXRlT3B0aW9ucz8udmFsaWRhdG9yIGFzIFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZSB8IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IHVuZmluaXNoZWRQb2xpY3kgPSB1cGRhdGVPcHRpb25zPy51bmZpbmlzaGVkUG9saWN5ID8/IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LldBUk5fQU5EX0FCQU5ET047XG4gICAgICBhY3RpdmF0b3IudXBkYXRlSGFuZGxlcnMuc2V0KGRlZi5uYW1lLCB7IGhhbmRsZXIsIHZhbGlkYXRvciwgZGVzY3JpcHRpb24sIHVuZmluaXNoZWRQb2xpY3kgfSk7XG4gICAgICBhY3RpdmF0b3IuZGlzcGF0Y2hCdWZmZXJlZFVwZGF0ZXMoKTtcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgICAgYWN0aXZhdG9yLnVwZGF0ZUhhbmRsZXJzLmRlbGV0ZShkZWYubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZWYudHlwZSA9PT0gJ3NpZ25hbCcpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IHNpZ25hbE9wdGlvbnMgPSBvcHRpb25zIGFzIFNpZ25hbEhhbmRsZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgY29uc3QgdW5maW5pc2hlZFBvbGljeSA9IHNpZ25hbE9wdGlvbnM/LnVuZmluaXNoZWRQb2xpY3kgPz8gSGFuZGxlclVuZmluaXNoZWRQb2xpY3kuV0FSTl9BTkRfQUJBTkRPTjtcbiAgICAgIGFjdGl2YXRvci5zaWduYWxIYW5kbGVycy5zZXQoZGVmLm5hbWUsIHsgaGFuZGxlcjogaGFuZGxlciBhcyBhbnksIGRlc2NyaXB0aW9uLCB1bmZpbmlzaGVkUG9saWN5IH0pO1xuICAgICAgYWN0aXZhdG9yLmRpc3BhdGNoQnVmZmVyZWRTaWduYWxzKCk7XG4gICAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICAgIGFjdGl2YXRvci5zaWduYWxIYW5kbGVycy5kZWxldGUoZGVmLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGVmLnR5cGUgPT09ICdxdWVyeScpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFjdGl2YXRvci5xdWVyeUhhbmRsZXJzLnNldChkZWYubmFtZSwgeyBoYW5kbGVyOiBoYW5kbGVyIGFzIGFueSwgZGVzY3JpcHRpb24gfSk7XG4gICAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICAgIGFjdGl2YXRvci5xdWVyeUhhbmRsZXJzLmRlbGV0ZShkZWYubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGRlZmluaXRpb24gdHlwZTogJHsoZGVmIGFzIGFueSkudHlwZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFNldCBhIHNpZ25hbCBoYW5kbGVyIGZ1bmN0aW9uIHRoYXQgd2lsbCBoYW5kbGUgc2lnbmFscyBjYWxscyBmb3Igbm9uLXJlZ2lzdGVyZWQgc2lnbmFsIG5hbWVzLlxuICpcbiAqIFNpZ25hbHMgYXJlIGRpc3BhdGNoZWQgdG8gdGhlIGRlZmF1bHQgc2lnbmFsIGhhbmRsZXIgaW4gdGhlIG9yZGVyIHRoYXQgdGhleSB3ZXJlIGFjY2VwdGVkIGJ5IHRoZSBzZXJ2ZXIuXG4gKlxuICogSWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZm9yIGEgZ2l2ZW4gc2lnbmFsIG9yIHF1ZXJ5IG5hbWUgdGhlIGxhc3QgaGFuZGxlciB3aWxsIG92ZXJ3cml0ZSBhbnkgcHJldmlvdXMgY2FsbHMuXG4gKlxuICogQHBhcmFtIGhhbmRsZXIgYSBmdW5jdGlvbiB0aGF0IHdpbGwgaGFuZGxlIHNpZ25hbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcywgb3IgYHVuZGVmaW5lZGAgdG8gdW5zZXQgdGhlIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXREZWZhdWx0U2lnbmFsSGFuZGxlcihoYW5kbGVyOiBEZWZhdWx0U2lnbmFsSGFuZGxlciB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc2V0RGVmYXVsdFNpZ25hbEhhbmRsZXIoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBhY3RpdmF0b3IuZGVmYXVsdFNpZ25hbEhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIGFjdGl2YXRvci5kaXNwYXRjaEJ1ZmZlcmVkU2lnbmFscygpO1xuICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgIGFjdGl2YXRvci5kZWZhdWx0U2lnbmFsSGFuZGxlciA9IHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgfVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgdGhpcyBXb3JrZmxvdydzIFNlYXJjaCBBdHRyaWJ1dGVzIGJ5IG1lcmdpbmcgdGhlIHByb3ZpZGVkIGBzZWFyY2hBdHRyaWJ1dGVzYCB3aXRoIHRoZSBleGlzdGluZyBTZWFyY2hcbiAqIEF0dHJpYnV0ZXMsIGB3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdGhpcyBXb3JrZmxvdyBjb2RlOlxuICpcbiAqIGBgYHRzXG4gKiB1cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKHtcbiAqICAgQ3VzdG9tSW50RmllbGQ6IFsxXSxcbiAqICAgQ3VzdG9tQm9vbEZpZWxkOiBbdHJ1ZV1cbiAqIH0pO1xuICogdXBzZXJ0U2VhcmNoQXR0cmlidXRlcyh7XG4gKiAgIEN1c3RvbUludEZpZWxkOiBbNDJdLFxuICogICBDdXN0b21LZXl3b3JkRmllbGQ6IFsnZHVyYWJsZSBjb2RlJywgJ2lzIGdyZWF0J11cbiAqIH0pO1xuICogYGBgXG4gKlxuICogd291bGQgcmVzdWx0IGluIHRoZSBXb3JrZmxvdyBoYXZpbmcgdGhlc2UgU2VhcmNoIEF0dHJpYnV0ZXM6XG4gKlxuICogYGBgdHNcbiAqIHtcbiAqICAgQ3VzdG9tSW50RmllbGQ6IFs0Ml0sXG4gKiAgIEN1c3RvbUJvb2xGaWVsZDogW3RydWVdLFxuICogICBDdXN0b21LZXl3b3JkRmllbGQ6IFsnZHVyYWJsZSBjb2RlJywgJ2lzIGdyZWF0J11cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzZWFyY2hBdHRyaWJ1dGVzIFRoZSBSZWNvcmQgdG8gbWVyZ2UuIFVzZSBhIHZhbHVlIG9mIGBbXWAgdG8gY2xlYXIgYSBTZWFyY2ggQXR0cmlidXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBzZXJ0U2VhcmNoQXR0cmlidXRlcyhzZWFyY2hBdHRyaWJ1dGVzOiBTZWFyY2hBdHRyaWJ1dGVzKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy51cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcblxuICBpZiAoc2VhcmNoQXR0cmlidXRlcyA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZWFyY2hBdHRyaWJ1dGVzIG11c3QgYmUgYSBub24tbnVsbCBTZWFyY2hBdHRyaWJ1dGVzJyk7XG4gIH1cblxuICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgIHVwc2VydFdvcmtmbG93U2VhcmNoQXR0cmlidXRlczoge1xuICAgICAgc2VhcmNoQXR0cmlidXRlczogbWFwVG9QYXlsb2FkcyhzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLCBzZWFyY2hBdHRyaWJ1dGVzKSxcbiAgICB9LFxuICB9KTtcblxuICBhY3RpdmF0b3IubXV0YXRlV29ya2Zsb3dJbmZvKChpbmZvOiBXb3JrZmxvd0luZm8pOiBXb3JrZmxvd0luZm8gPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5pbmZvLFxuICAgICAgc2VhcmNoQXR0cmlidXRlczoge1xuICAgICAgICAuLi5pbmZvLnNlYXJjaEF0dHJpYnV0ZXMsXG4gICAgICAgIC4uLnNlYXJjaEF0dHJpYnV0ZXMsXG4gICAgICB9LFxuICAgIH07XG4gIH0pO1xufVxuXG4vKipcbiAqIFVwZGF0ZXMgdGhpcyBXb3JrZmxvdydzIE1lbW9zIGJ5IG1lcmdpbmcgdGhlIHByb3ZpZGVkIGBtZW1vYCB3aXRoIGV4aXN0aW5nXG4gKiBNZW1vcyAoYXMgcmV0dXJuZWQgYnkgYHdvcmtmbG93SW5mbygpLm1lbW9gKS5cbiAqXG4gKiBOZXcgbWVtbyBpcyBtZXJnZWQgYnkgcmVwbGFjaW5nIHByb3BlcnRpZXMgb2YgdGhlIHNhbWUgbmFtZSBfYXQgdGhlIGZpcnN0XG4gKiBsZXZlbCBvbmx5Xy4gU2V0dGluZyBhIHByb3BlcnR5IHRvIHZhbHVlIGB1bmRlZmluZWRgIG9yIGBudWxsYCBjbGVhcnMgdGhhdFxuICoga2V5IGZyb20gdGhlIE1lbW8uXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHNcbiAqIHVwc2VydE1lbW8oe1xuICogICBrZXkxOiB2YWx1ZSxcbiAqICAga2V5MzogeyBzdWJrZXkxOiB2YWx1ZSB9XG4gKiAgIGtleTQ6IHZhbHVlLFxuICogfSk7XG4gKiB1cHNlcnRNZW1vKHtcbiAqICAga2V5MjogdmFsdWVcbiAqICAga2V5MzogeyBzdWJrZXkyOiB2YWx1ZSB9XG4gKiAgIGtleTQ6IHVuZGVmaW5lZCxcbiAqIH0pO1xuICogYGBgXG4gKlxuICogd291bGQgcmVzdWx0IGluIHRoZSBXb3JrZmxvdyBoYXZpbmcgdGhlc2UgTWVtbzpcbiAqXG4gKiBgYGB0c1xuICoge1xuICogICBrZXkxOiB2YWx1ZSxcbiAqICAga2V5MjogdmFsdWUsXG4gKiAgIGtleTM6IHsgc3Via2V5MjogdmFsdWUgfSAgLy8gTm90ZSB0aGlzIG9iamVjdCB3YXMgY29tcGxldGVseSByZXBsYWNlZFxuICogICAvLyBOb3RlIHRoYXQga2V5NCB3YXMgY29tcGxldGVseSByZW1vdmVkXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gbWVtbyBUaGUgUmVjb3JkIHRvIG1lcmdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBzZXJ0TWVtbyhtZW1vOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cudXBzZXJ0TWVtbyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcblxuICBpZiAobWVtbyA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtZW1vIG11c3QgYmUgYSBub24tbnVsbCBSZWNvcmQnKTtcbiAgfVxuXG4gIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgbW9kaWZ5V29ya2Zsb3dQcm9wZXJ0aWVzOiB7XG4gICAgICB1cHNlcnRlZE1lbW86IHtcbiAgICAgICAgZmllbGRzOiBtYXBUb1BheWxvYWRzKFxuICAgICAgICAgIGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLFxuICAgICAgICAgIC8vIENvbnZlcnQgbnVsbCB0byB1bmRlZmluZWRcbiAgICAgICAgICBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMobWVtbykubWFwKChbaywgdl0pID0+IFtrLCB2ID8/IHVuZGVmaW5lZF0pKVxuICAgICAgICApLFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICBhY3RpdmF0b3IubXV0YXRlV29ya2Zsb3dJbmZvKChpbmZvOiBXb3JrZmxvd0luZm8pOiBXb3JrZmxvd0luZm8gPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5pbmZvLFxuICAgICAgbWVtbzogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyh7XG4gICAgICAgICAgLi4uaW5mby5tZW1vLFxuICAgICAgICAgIC4uLm1lbW8sXG4gICAgICAgIH0pLmZpbHRlcigoW18sIHZdKSA9PiB2ICE9IG51bGwpXG4gICAgICApLFxuICAgIH07XG4gIH0pO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdXBkYXRlIGFuZCBzaWduYWwgaGFuZGxlcnMgaGF2ZSBmaW5pc2hlZCBleGVjdXRpbmcuXG4gKlxuICogQ29uc2lkZXIgd2FpdGluZyBvbiB0aGlzIGNvbmRpdGlvbiBiZWZvcmUgd29ya2Zsb3cgcmV0dXJuIG9yIGNvbnRpbnVlLWFzLW5ldywgdG8gcHJldmVudFxuICogaW50ZXJydXB0aW9uIG9mIGluLXByb2dyZXNzIGhhbmRsZXJzIGJ5IHdvcmtmbG93IGV4aXQ6XG4gKlxuICogYGBgdHNcbiAqIGF3YWl0IHdvcmtmbG93LmNvbmRpdGlvbih3b3JrZmxvdy5hbGxIYW5kbGVyc0ZpbmlzaGVkKVxuICogYGBgXG4gKlxuICogQHJldHVybnMgdHJ1ZSBpZiB0aGVyZSBhcmUgbm8gaW4tcHJvZ3Jlc3MgdXBkYXRlIG9yIHNpZ25hbCBoYW5kbGVyIGV4ZWN1dGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbGxIYW5kbGVyc0ZpbmlzaGVkKCk6IGJvb2xlYW4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnYWxsSGFuZGxlcnNGaW5pc2hlZCgpIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcbiAgcmV0dXJuIGFjdGl2YXRvci5pblByb2dyZXNzU2lnbmFscy5zaXplID09PSAwICYmIGFjdGl2YXRvci5pblByb2dyZXNzVXBkYXRlcy5zaXplID09PSAwO1xufVxuXG5leHBvcnQgY29uc3Qgc3RhY2tUcmFjZVF1ZXJ5ID0gZGVmaW5lUXVlcnk8c3RyaW5nPignX19zdGFja190cmFjZScpO1xuZXhwb3J0IGNvbnN0IGVuaGFuY2VkU3RhY2tUcmFjZVF1ZXJ5ID0gZGVmaW5lUXVlcnk8RW5oYW5jZWRTdGFja1RyYWNlPignX19lbmhhbmNlZF9zdGFja190cmFjZScpO1xuZXhwb3J0IGNvbnN0IHdvcmtmbG93TWV0YWRhdGFRdWVyeSA9IGRlZmluZVF1ZXJ5PHRlbXBvcmFsLmFwaS5zZGsudjEuSVdvcmtmbG93TWV0YWRhdGE+KCdfX3RlbXBvcmFsX3dvcmtmbG93X21ldGFkYXRhJyk7XG4iLCIvLyBHRU5FUkFURUQgRklMRS4gRE8gTk9UIEVESVQuXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICBmdW5jdGlvbiB1bndyYXBEZWZhdWx0KGV4cG9ydHMpIHtcbiAgICByZXR1cm4gXCJkZWZhdWx0XCIgaW4gZXhwb3J0cyA/IGV4cG9ydHMuZGVmYXVsdCA6IGV4cG9ydHM7XG4gIH1cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZXhwb3J0cyA9IHt9O1xuICAgICAgZmFjdG9yeShleHBvcnRzKTtcbiAgICAgIHJldHVybiB1bndyYXBEZWZhdWx0KGV4cG9ydHMpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgZmFjdG9yeShleHBvcnRzKTtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikgbW9kdWxlLmV4cG9ydHMgPSB1bndyYXBEZWZhdWx0KGV4cG9ydHMpO1xuICB9IGVsc2Uge1xuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZXhwb3J0cyA9IHt9O1xuICAgICAgZmFjdG9yeShleHBvcnRzKTtcbiAgICAgIGdsb2JhbC5Mb25nID0gdW53cmFwRGVmYXVsdChleHBvcnRzKTtcbiAgICB9KSgpO1xuICB9XG59KShcbiAgdHlwZW9mIGdsb2JhbFRoaXMgIT09IFwidW5kZWZpbmVkXCJcbiAgICA/IGdsb2JhbFRoaXNcbiAgICA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiXG4gICAgICA/IHNlbGZcbiAgICAgIDogdGhpcyxcbiAgZnVuY3Rpb24gKF9leHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgICB2YWx1ZTogdHJ1ZSxcbiAgICB9KTtcbiAgICBfZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuICAgIC8qKlxuICAgICAqIEBsaWNlbnNlXG4gICAgICogQ29weXJpZ2h0IDIwMDkgVGhlIENsb3N1cmUgTGlicmFyeSBBdXRob3JzXG4gICAgICogQ29weXJpZ2h0IDIwMjAgRGFuaWVsIFdpcnR6IC8gVGhlIGxvbmcuanMgQXV0aG9ycy5cbiAgICAgKlxuICAgICAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gICAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgICAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAgICAqXG4gICAgICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAgICAqXG4gICAgICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAgICAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgICAgKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgICAgKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gICAgICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gICAgICpcbiAgICAgKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICAgICAqL1xuXG4gICAgLy8gV2ViQXNzZW1ibHkgb3B0aW1pemF0aW9ucyB0byBkbyBuYXRpdmUgaTY0IG11bHRpcGxpY2F0aW9uIGFuZCBkaXZpZGVcbiAgICB2YXIgd2FzbSA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHdhc20gPSBuZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UoXG4gICAgICAgIG5ldyBXZWJBc3NlbWJseS5Nb2R1bGUoXG4gICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgICAgICAgLy8gXFwwYXNtXG4gICAgICAgICAgICAwLCA5NywgMTE1LCAxMDksXG4gICAgICAgICAgICAvLyB2ZXJzaW9uIDFcbiAgICAgICAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAgICAgICAvLyBzZWN0aW9uIFwidHlwZVwiXG4gICAgICAgICAgICAxLCAxMywgMixcbiAgICAgICAgICAgIC8vIDAsICgpID0+IGkzMlxuICAgICAgICAgICAgOTYsIDAsIDEsIDEyNyxcbiAgICAgICAgICAgIC8vIDEsIChpMzIsIGkzMiwgaTMyLCBpMzIpID0+IGkzMlxuICAgICAgICAgICAgOTYsIDQsIDEyNywgMTI3LCAxMjcsIDEyNywgMSwgMTI3LFxuICAgICAgICAgICAgLy8gc2VjdGlvbiBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgIDMsIDcsIDYsXG4gICAgICAgICAgICAvLyAwLCB0eXBlIDBcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAvLyAxLCB0eXBlIDFcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAvLyAyLCB0eXBlIDFcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAvLyAzLCB0eXBlIDFcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAvLyA0LCB0eXBlIDFcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAvLyA1LCB0eXBlIDFcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAvLyBzZWN0aW9uIFwiZ2xvYmFsXCJcbiAgICAgICAgICAgIDYsIDYsIDEsXG4gICAgICAgICAgICAvLyAwLCBcImhpZ2hcIiwgbXV0YWJsZSBpMzJcbiAgICAgICAgICAgIDEyNywgMSwgNjUsIDAsIDExLFxuICAgICAgICAgICAgLy8gc2VjdGlvbiBcImV4cG9ydFwiXG4gICAgICAgICAgICA3LCA1MCwgNixcbiAgICAgICAgICAgIC8vIDAsIFwibXVsXCJcbiAgICAgICAgICAgIDMsIDEwOSwgMTE3LCAxMDgsIDAsIDEsXG4gICAgICAgICAgICAvLyAxLCBcImRpdl9zXCJcbiAgICAgICAgICAgIDUsIDEwMCwgMTA1LCAxMTgsIDk1LCAxMTUsIDAsIDIsXG4gICAgICAgICAgICAvLyAyLCBcImRpdl91XCJcbiAgICAgICAgICAgIDUsIDEwMCwgMTA1LCAxMTgsIDk1LCAxMTcsIDAsIDMsXG4gICAgICAgICAgICAvLyAzLCBcInJlbV9zXCJcbiAgICAgICAgICAgIDUsIDExNCwgMTAxLCAxMDksIDk1LCAxMTUsIDAsIDQsXG4gICAgICAgICAgICAvLyA0LCBcInJlbV91XCJcbiAgICAgICAgICAgIDUsIDExNCwgMTAxLCAxMDksIDk1LCAxMTcsIDAsIDUsXG4gICAgICAgICAgICAvLyA1LCBcImdldF9oaWdoXCJcbiAgICAgICAgICAgIDgsIDEwMywgMTAxLCAxMTYsIDk1LCAxMDQsIDEwNSwgMTAzLCAxMDQsIDAsIDAsXG4gICAgICAgICAgICAvLyBzZWN0aW9uIFwiY29kZVwiXG4gICAgICAgICAgICAxMCwgMTkxLCAxLCA2LFxuICAgICAgICAgICAgLy8gMCwgXCJnZXRfaGlnaFwiXG4gICAgICAgICAgICA0LCAwLCAzNSwgMCwgMTEsXG4gICAgICAgICAgICAvLyAxLCBcIm11bFwiXG4gICAgICAgICAgICAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLFxuICAgICAgICAgICAgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI2LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsXG4gICAgICAgICAgICAzMiwgNCwgMTY3LCAxMSxcbiAgICAgICAgICAgIC8vIDIsIFwiZGl2X3NcIlxuICAgICAgICAgICAgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MyxcbiAgICAgICAgICAgIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEyNywgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLFxuICAgICAgICAgICAgMzIsIDQsIDE2NywgMTEsXG4gICAgICAgICAgICAvLyAzLCBcImRpdl91XCJcbiAgICAgICAgICAgIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsXG4gICAgICAgICAgICAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjgsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCxcbiAgICAgICAgICAgIDMyLCA0LCAxNjcsIDExLFxuICAgICAgICAgICAgLy8gNCwgXCJyZW1fc1wiXG4gICAgICAgICAgICAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLFxuICAgICAgICAgICAgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI5LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsXG4gICAgICAgICAgICAzMiwgNCwgMTY3LCAxMSxcbiAgICAgICAgICAgIC8vIDUsIFwicmVtX3VcIlxuICAgICAgICAgICAgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MyxcbiAgICAgICAgICAgIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEzMCwgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLFxuICAgICAgICAgICAgMzIsIDQsIDE2NywgMTEsXG4gICAgICAgICAgXSksXG4gICAgICAgICksXG4gICAgICAgIHt9LFxuICAgICAgKS5leHBvcnRzO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gbm8gd2FzbSBzdXBwb3J0IDooXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIDY0IGJpdCB0d28ncy1jb21wbGVtZW50IGludGVnZXIsIGdpdmVuIGl0cyBsb3cgYW5kIGhpZ2ggMzIgYml0IHZhbHVlcyBhcyAqc2lnbmVkKiBpbnRlZ2Vycy5cbiAgICAgKiAgU2VlIHRoZSBmcm9tKiBmdW5jdGlvbnMgYmVsb3cgZm9yIG1vcmUgY29udmVuaWVudCB3YXlzIG9mIGNvbnN0cnVjdGluZyBMb25ncy5cbiAgICAgKiBAZXhwb3J0cyBMb25nXG4gICAgICogQGNsYXNzIEEgTG9uZyBjbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEgNjQgYml0IHR3bydzLWNvbXBsZW1lbnQgaW50ZWdlciB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbG93IFRoZSBsb3cgKHNpZ25lZCkgMzIgYml0cyBvZiB0aGUgbG9uZ1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoIFRoZSBoaWdoIChzaWduZWQpIDMyIGJpdHMgb2YgdGhlIGxvbmdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gTG9uZyhsb3csIGhpZ2gsIHVuc2lnbmVkKSB7XG4gICAgICAvKipcbiAgICAgICAqIFRoZSBsb3cgMzIgYml0cyBhcyBhIHNpZ25lZCB2YWx1ZS5cbiAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgKi9cbiAgICAgIHRoaXMubG93ID0gbG93IHwgMDtcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgaGlnaCAzMiBiaXRzIGFzIGEgc2lnbmVkIHZhbHVlLlxuICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAqL1xuICAgICAgdGhpcy5oaWdoID0gaGlnaCB8IDA7XG5cbiAgICAgIC8qKlxuICAgICAgICogV2hldGhlciB1bnNpZ25lZCBvciBub3QuXG4gICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAqL1xuICAgICAgdGhpcy51bnNpZ25lZCA9ICEhdW5zaWduZWQ7XG4gICAgfVxuXG4gICAgLy8gVGhlIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIGEgbG9uZyBpcyB0aGUgdHdvIGdpdmVuIHNpZ25lZCwgMzItYml0IHZhbHVlcy5cbiAgICAvLyBXZSB1c2UgMzItYml0IHBpZWNlcyBiZWNhdXNlIHRoZXNlIGFyZSB0aGUgc2l6ZSBvZiBpbnRlZ2VycyBvbiB3aGljaFxuICAgIC8vIEphdmFzY3JpcHQgcGVyZm9ybXMgYml0LW9wZXJhdGlvbnMuICBGb3Igb3BlcmF0aW9ucyBsaWtlIGFkZGl0aW9uIGFuZFxuICAgIC8vIG11bHRpcGxpY2F0aW9uLCB3ZSBzcGxpdCBlYWNoIG51bWJlciBpbnRvIDE2IGJpdCBwaWVjZXMsIHdoaWNoIGNhbiBlYXNpbHkgYmVcbiAgICAvLyBtdWx0aXBsaWVkIHdpdGhpbiBKYXZhc2NyaXB0J3MgZmxvYXRpbmctcG9pbnQgcmVwcmVzZW50YXRpb24gd2l0aG91dCBvdmVyZmxvd1xuICAgIC8vIG9yIGNoYW5nZSBpbiBzaWduLlxuICAgIC8vXG4gICAgLy8gSW4gdGhlIGFsZ29yaXRobXMgYmVsb3csIHdlIGZyZXF1ZW50bHkgcmVkdWNlIHRoZSBuZWdhdGl2ZSBjYXNlIHRvIHRoZVxuICAgIC8vIHBvc2l0aXZlIGNhc2UgYnkgbmVnYXRpbmcgdGhlIGlucHV0KHMpIGFuZCB0aGVuIHBvc3QtcHJvY2Vzc2luZyB0aGUgcmVzdWx0LlxuICAgIC8vIE5vdGUgdGhhdCB3ZSBtdXN0IEFMV0FZUyBjaGVjayBzcGVjaWFsbHkgd2hldGhlciB0aG9zZSB2YWx1ZXMgYXJlIE1JTl9WQUxVRVxuICAgIC8vICgtMl42MykgYmVjYXVzZSAtTUlOX1ZBTFVFID09IE1JTl9WQUxVRSAoc2luY2UgMl42MyBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgYXNcbiAgICAvLyBhIHBvc2l0aXZlIG51bWJlciwgaXQgb3ZlcmZsb3dzIGJhY2sgaW50byBhIG5lZ2F0aXZlKS4gIE5vdCBoYW5kbGluZyB0aGlzXG4gICAgLy8gY2FzZSB3b3VsZCBvZnRlbiByZXN1bHQgaW4gaW5maW5pdGUgcmVjdXJzaW9uLlxuICAgIC8vXG4gICAgLy8gQ29tbW9uIGNvbnN0YW50IHZhbHVlcyBaRVJPLCBPTkUsIE5FR19PTkUsIGV0Yy4gYXJlIGRlZmluZWQgYmVsb3cgdGhlIGZyb20qXG4gICAgLy8gbWV0aG9kcyBvbiB3aGljaCB0aGV5IGRlcGVuZC5cblxuICAgIC8qKlxuICAgICAqIEFuIGluZGljYXRvciB1c2VkIHRvIHJlbGlhYmx5IGRldGVybWluZSBpZiBhbiBvYmplY3QgaXMgYSBMb25nIG9yIG5vdC5cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKiBAY29uc3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIExvbmcucHJvdG90eXBlLl9faXNMb25nX187XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvbmcucHJvdG90eXBlLCBcIl9faXNMb25nX19cIiwge1xuICAgICAgdmFsdWU6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0geyp9IG9iaiBPYmplY3RcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKiBAaW5uZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0xvbmcob2JqKSB7XG4gICAgICByZXR1cm4gKG9iaiAmJiBvYmpbXCJfX2lzTG9uZ19fXCJdKSA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIG51bWJlclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICogQGlubmVyXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3R6MzIodmFsdWUpIHtcbiAgICAgIHZhciBjID0gTWF0aC5jbHozMih2YWx1ZSAmIC12YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWUgPyAzMSAtIGMgOiBjO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRlc3RzIGlmIHRoZSBzcGVjaWZpZWQgb2JqZWN0IGlzIGEgTG9uZy5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0geyp9IG9iaiBPYmplY3RcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBMb25nLmlzTG9uZyA9IGlzTG9uZztcblxuICAgIC8qKlxuICAgICAqIEEgY2FjaGUgb2YgdGhlIExvbmcgcmVwcmVzZW50YXRpb25zIG9mIHNtYWxsIGludGVnZXIgdmFsdWVzLlxuICAgICAqIEB0eXBlIHshT2JqZWN0fVxuICAgICAqIEBpbm5lclxuICAgICAqL1xuICAgIHZhciBJTlRfQ0FDSEUgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEEgY2FjaGUgb2YgdGhlIExvbmcgcmVwcmVzZW50YXRpb25zIG9mIHNtYWxsIHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLlxuICAgICAqIEB0eXBlIHshT2JqZWN0fVxuICAgICAqIEBpbm5lclxuICAgICAqL1xuICAgIHZhciBVSU5UX0NBQ0hFID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZFxuICAgICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICAgKiBAaW5uZXJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmcm9tSW50KHZhbHVlLCB1bnNpZ25lZCkge1xuICAgICAgdmFyIG9iaiwgY2FjaGVkT2JqLCBjYWNoZTtcbiAgICAgIGlmICh1bnNpZ25lZCkge1xuICAgICAgICB2YWx1ZSA+Pj49IDA7XG4gICAgICAgIGlmICgoY2FjaGUgPSAwIDw9IHZhbHVlICYmIHZhbHVlIDwgMjU2KSkge1xuICAgICAgICAgIGNhY2hlZE9iaiA9IFVJTlRfQ0FDSEVbdmFsdWVdO1xuICAgICAgICAgIGlmIChjYWNoZWRPYmopIHJldHVybiBjYWNoZWRPYmo7XG4gICAgICAgIH1cbiAgICAgICAgb2JqID0gZnJvbUJpdHModmFsdWUsIDAsIHRydWUpO1xuICAgICAgICBpZiAoY2FjaGUpIFVJTlRfQ0FDSEVbdmFsdWVdID0gb2JqO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgfD0gMDtcbiAgICAgICAgaWYgKChjYWNoZSA9IC0xMjggPD0gdmFsdWUgJiYgdmFsdWUgPCAxMjgpKSB7XG4gICAgICAgICAgY2FjaGVkT2JqID0gSU5UX0NBQ0hFW3ZhbHVlXTtcbiAgICAgICAgICBpZiAoY2FjaGVkT2JqKSByZXR1cm4gY2FjaGVkT2JqO1xuICAgICAgICB9XG4gICAgICAgIG9iaiA9IGZyb21CaXRzKHZhbHVlLCB2YWx1ZSA8IDAgPyAtMSA6IDAsIGZhbHNlKTtcbiAgICAgICAgaWYgKGNhY2hlKSBJTlRfQ0FDSEVbdmFsdWVdID0gb2JqO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gMzIgYml0IGludGVnZXIgdmFsdWUuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIFRoZSAzMiBiaXQgaW50ZWdlciBpbiBxdWVzdGlvblxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICAgKi9cbiAgICBMb25nLmZyb21JbnQgPSBmcm9tSW50O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAgICogQGlubmVyXG4gICAgICovXG4gICAgZnVuY3Rpb24gZnJvbU51bWJlcih2YWx1ZSwgdW5zaWduZWQpIHtcbiAgICAgIGlmIChpc05hTih2YWx1ZSkpIHJldHVybiB1bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgICAgIGlmICh1bnNpZ25lZCkge1xuICAgICAgICBpZiAodmFsdWUgPCAwKSByZXR1cm4gVVpFUk87XG4gICAgICAgIGlmICh2YWx1ZSA+PSBUV09fUFdSXzY0X0RCTCkgcmV0dXJuIE1BWF9VTlNJR05FRF9WQUxVRTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh2YWx1ZSA8PSAtVFdPX1BXUl82M19EQkwpIHJldHVybiBNSU5fVkFMVUU7XG4gICAgICAgIGlmICh2YWx1ZSArIDEgPj0gVFdPX1BXUl82M19EQkwpIHJldHVybiBNQVhfVkFMVUU7XG4gICAgICB9XG4gICAgICBpZiAodmFsdWUgPCAwKSByZXR1cm4gZnJvbU51bWJlcigtdmFsdWUsIHVuc2lnbmVkKS5uZWcoKTtcbiAgICAgIHJldHVybiBmcm9tQml0cyhcbiAgICAgICAgdmFsdWUgJSBUV09fUFdSXzMyX0RCTCB8IDAsXG4gICAgICAgICh2YWx1ZSAvIFRXT19QV1JfMzJfREJMKSB8IDAsXG4gICAgICAgIHVuc2lnbmVkLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRpbmcgdGhlIGdpdmVuIHZhbHVlLCBwcm92aWRlZCB0aGF0IGl0IGlzIGEgZmluaXRlIG51bWJlci4gT3RoZXJ3aXNlLCB6ZXJvIGlzIHJldHVybmVkLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBUaGUgbnVtYmVyIGluIHF1ZXN0aW9uXG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgICAqL1xuICAgIExvbmcuZnJvbU51bWJlciA9IGZyb21OdW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbG93Qml0c1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoQml0c1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAgICogQHJldHVybnMgeyFMb25nfVxuICAgICAqIEBpbm5lclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZyb21CaXRzKGxvd0JpdHMsIGhpZ2hCaXRzLCB1bnNpZ25lZCkge1xuICAgICAgcmV0dXJuIG5ldyBMb25nKGxvd0JpdHMsIGhpZ2hCaXRzLCB1bnNpZ25lZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSA2NCBiaXQgaW50ZWdlciB0aGF0IGNvbWVzIGJ5IGNvbmNhdGVuYXRpbmcgdGhlIGdpdmVuIGxvdyBhbmQgaGlnaCBiaXRzLiBFYWNoIGlzXG4gICAgICogIGFzc3VtZWQgdG8gdXNlIDMyIGJpdHMuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxvd0JpdHMgVGhlIGxvdyAzMiBiaXRzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhpZ2hCaXRzIFRoZSBoaWdoIDMyIGJpdHNcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAgICovXG4gICAgTG9uZy5mcm9tQml0cyA9IGZyb21CaXRzO1xuXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJhc2VcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZXhwb25lbnRcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqIEBpbm5lclxuICAgICAqL1xuICAgIHZhciBwb3dfZGJsID0gTWF0aC5wb3c7IC8vIFVzZWQgNCB0aW1lcyAoNCo4IHRvIDE1KzQpXG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAgICogQHBhcmFtIHsoYm9vbGVhbnxudW1iZXIpPX0gdW5zaWduZWRcbiAgICAgKiBAcGFyYW0ge251bWJlcj19IHJhZGl4XG4gICAgICogQHJldHVybnMgeyFMb25nfVxuICAgICAqIEBpbm5lclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZyb21TdHJpbmcoc3RyLCB1bnNpZ25lZCwgcmFkaXgpIHtcbiAgICAgIGlmIChzdHIubGVuZ3RoID09PSAwKSB0aHJvdyBFcnJvcihcImVtcHR5IHN0cmluZ1wiKTtcbiAgICAgIGlmICh0eXBlb2YgdW5zaWduZWQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgLy8gRm9yIGdvb2cubWF0aC5sb25nIGNvbXBhdGliaWxpdHlcbiAgICAgICAgcmFkaXggPSB1bnNpZ25lZDtcbiAgICAgICAgdW5zaWduZWQgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVuc2lnbmVkID0gISF1bnNpZ25lZDtcbiAgICAgIH1cbiAgICAgIGlmIChcbiAgICAgICAgc3RyID09PSBcIk5hTlwiIHx8XG4gICAgICAgIHN0ciA9PT0gXCJJbmZpbml0eVwiIHx8XG4gICAgICAgIHN0ciA9PT0gXCIrSW5maW5pdHlcIiB8fFxuICAgICAgICBzdHIgPT09IFwiLUluZmluaXR5XCJcbiAgICAgIClcbiAgICAgICAgcmV0dXJuIHVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICAgICAgcmFkaXggPSByYWRpeCB8fCAxMDtcbiAgICAgIGlmIChyYWRpeCA8IDIgfHwgMzYgPCByYWRpeCkgdGhyb3cgUmFuZ2VFcnJvcihcInJhZGl4XCIpO1xuICAgICAgdmFyIHA7XG4gICAgICBpZiAoKHAgPSBzdHIuaW5kZXhPZihcIi1cIikpID4gMCkgdGhyb3cgRXJyb3IoXCJpbnRlcmlvciBoeXBoZW5cIik7XG4gICAgICBlbHNlIGlmIChwID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmcm9tU3RyaW5nKHN0ci5zdWJzdHJpbmcoMSksIHVuc2lnbmVkLCByYWRpeCkubmVnKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIERvIHNldmVyYWwgKDgpIGRpZ2l0cyBlYWNoIHRpbWUgdGhyb3VnaCB0aGUgbG9vcCwgc28gYXMgdG9cbiAgICAgIC8vIG1pbmltaXplIHRoZSBjYWxscyB0byB0aGUgdmVyeSBleHBlbnNpdmUgZW11bGF0ZWQgZGl2LlxuICAgICAgdmFyIHJhZGl4VG9Qb3dlciA9IGZyb21OdW1iZXIocG93X2RibChyYWRpeCwgOCkpO1xuICAgICAgdmFyIHJlc3VsdCA9IFpFUk87XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkgKz0gOCkge1xuICAgICAgICB2YXIgc2l6ZSA9IE1hdGgubWluKDgsIHN0ci5sZW5ndGggLSBpKSxcbiAgICAgICAgICB2YWx1ZSA9IHBhcnNlSW50KHN0ci5zdWJzdHJpbmcoaSwgaSArIHNpemUpLCByYWRpeCk7XG4gICAgICAgIGlmIChzaXplIDwgOCkge1xuICAgICAgICAgIHZhciBwb3dlciA9IGZyb21OdW1iZXIocG93X2RibChyYWRpeCwgc2l6ZSkpO1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5tdWwocG93ZXIpLmFkZChmcm9tTnVtYmVyKHZhbHVlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0ID0gcmVzdWx0Lm11bChyYWRpeFRvUG93ZXIpO1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5hZGQoZnJvbU51bWJlcih2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHQudW5zaWduZWQgPSB1bnNpZ25lZDtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIHN0cmluZywgd3JpdHRlbiB1c2luZyB0aGUgc3BlY2lmaWVkIHJhZGl4LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgVGhlIHRleHR1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIExvbmdcbiAgICAgKiBAcGFyYW0geyhib29sZWFufG51bWJlcik9fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAgICogQHBhcmFtIHtudW1iZXI9fSByYWRpeCBUaGUgcmFkaXggaW4gd2hpY2ggdGhlIHRleHQgaXMgd3JpdHRlbiAoMi0zNiksIGRlZmF1bHRzIHRvIDEwXG4gICAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAgICovXG4gICAgTG9uZy5mcm9tU3RyaW5nID0gZnJvbVN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ3whe2xvdzogbnVtYmVyLCBoaWdoOiBudW1iZXIsIHVuc2lnbmVkOiBib29sZWFufX0gdmFsXG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAgICogQGlubmVyXG4gICAgICovXG4gICAgZnVuY3Rpb24gZnJvbVZhbHVlKHZhbCwgdW5zaWduZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcIm51bWJlclwiKSByZXR1cm4gZnJvbU51bWJlcih2YWwsIHVuc2lnbmVkKTtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiKSByZXR1cm4gZnJvbVN0cmluZyh2YWwsIHVuc2lnbmVkKTtcbiAgICAgIC8vIFRocm93cyBmb3Igbm9uLW9iamVjdHMsIGNvbnZlcnRzIG5vbi1pbnN0YW5jZW9mIExvbmc6XG4gICAgICByZXR1cm4gZnJvbUJpdHMoXG4gICAgICAgIHZhbC5sb3csXG4gICAgICAgIHZhbC5oaWdoLFxuICAgICAgICB0eXBlb2YgdW5zaWduZWQgPT09IFwiYm9vbGVhblwiID8gdW5zaWduZWQgOiB2YWwudW5zaWduZWQsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBzcGVjaWZpZWQgdmFsdWUgdG8gYSBMb25nIHVzaW5nIHRoZSBhcHByb3ByaWF0ZSBmcm9tKiBmdW5jdGlvbiBmb3IgaXRzIHR5cGUuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ3whe2xvdzogbnVtYmVyLCBoaWdoOiBudW1iZXIsIHVuc2lnbmVkOiBib29sZWFufX0gdmFsIFZhbHVlXG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICAgKi9cbiAgICBMb25nLmZyb21WYWx1ZSA9IGZyb21WYWx1ZTtcblxuICAgIC8vIE5PVEU6IHRoZSBjb21waWxlciBzaG91bGQgaW5saW5lIHRoZXNlIGNvbnN0YW50IHZhbHVlcyBiZWxvdyBhbmQgdGhlbiByZW1vdmUgdGhlc2UgdmFyaWFibGVzLCBzbyB0aGVyZSBzaG91bGQgYmVcbiAgICAvLyBubyBydW50aW1lIHBlbmFsdHkgZm9yIHRoZXNlLlxuXG4gICAgLyoqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAY29uc3RcbiAgICAgKiBAaW5uZXJcbiAgICAgKi9cbiAgICB2YXIgVFdPX1BXUl8xNl9EQkwgPSAxIDw8IDE2O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAY29uc3RcbiAgICAgKiBAaW5uZXJcbiAgICAgKi9cbiAgICB2YXIgVFdPX1BXUl8yNF9EQkwgPSAxIDw8IDI0O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAY29uc3RcbiAgICAgKiBAaW5uZXJcbiAgICAgKi9cbiAgICB2YXIgVFdPX1BXUl8zMl9EQkwgPSBUV09fUFdSXzE2X0RCTCAqIFRXT19QV1JfMTZfREJMO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAY29uc3RcbiAgICAgKiBAaW5uZXJcbiAgICAgKi9cbiAgICB2YXIgVFdPX1BXUl82NF9EQkwgPSBUV09fUFdSXzMyX0RCTCAqIFRXT19QV1JfMzJfREJMO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAY29uc3RcbiAgICAgKiBAaW5uZXJcbiAgICAgKi9cbiAgICB2YXIgVFdPX1BXUl82M19EQkwgPSBUV09fUFdSXzY0X0RCTCAvIDI7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7IUxvbmd9XG4gICAgICogQGNvbnN0XG4gICAgICogQGlubmVyXG4gICAgICovXG4gICAgdmFyIFRXT19QV1JfMjQgPSBmcm9tSW50KFRXT19QV1JfMjRfREJMKTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHshTG9uZ31cbiAgICAgKiBAaW5uZXJcbiAgICAgKi9cbiAgICB2YXIgWkVSTyA9IGZyb21JbnQoMCk7XG5cbiAgICAvKipcbiAgICAgKiBTaWduZWQgemVyby5cbiAgICAgKiBAdHlwZSB7IUxvbmd9XG4gICAgICovXG4gICAgTG9uZy5aRVJPID0gWkVSTztcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHshTG9uZ31cbiAgICAgKiBAaW5uZXJcbiAgICAgKi9cbiAgICB2YXIgVVpFUk8gPSBmcm9tSW50KDAsIHRydWUpO1xuXG4gICAgLyoqXG4gICAgICogVW5zaWduZWQgemVyby5cbiAgICAgKiBAdHlwZSB7IUxvbmd9XG4gICAgICovXG4gICAgTG9uZy5VWkVSTyA9IFVaRVJPO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUgeyFMb25nfVxuICAgICAqIEBpbm5lclxuICAgICAqL1xuICAgIHZhciBPTkUgPSBmcm9tSW50KDEpO1xuXG4gICAgLyoqXG4gICAgICogU2lnbmVkIG9uZS5cbiAgICAgKiBAdHlwZSB7IUxvbmd9XG4gICAgICovXG4gICAgTG9uZy5PTkUgPSBPTkU7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7IUxvbmd9XG4gICAgICogQGlubmVyXG4gICAgICovXG4gICAgdmFyIFVPTkUgPSBmcm9tSW50KDEsIHRydWUpO1xuXG4gICAgLyoqXG4gICAgICogVW5zaWduZWQgb25lLlxuICAgICAqIEB0eXBlIHshTG9uZ31cbiAgICAgKi9cbiAgICBMb25nLlVPTkUgPSBVT05FO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUgeyFMb25nfVxuICAgICAqIEBpbm5lclxuICAgICAqL1xuICAgIHZhciBORUdfT05FID0gZnJvbUludCgtMSk7XG5cbiAgICAvKipcbiAgICAgKiBTaWduZWQgbmVnYXRpdmUgb25lLlxuICAgICAqIEB0eXBlIHshTG9uZ31cbiAgICAgKi9cbiAgICBMb25nLk5FR19PTkUgPSBORUdfT05FO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUgeyFMb25nfVxuICAgICAqIEBpbm5lclxuICAgICAqL1xuICAgIHZhciBNQVhfVkFMVUUgPSBmcm9tQml0cygweGZmZmZmZmZmIHwgMCwgMHg3ZmZmZmZmZiB8IDAsIGZhbHNlKTtcblxuICAgIC8qKlxuICAgICAqIE1heGltdW0gc2lnbmVkIHZhbHVlLlxuICAgICAqIEB0eXBlIHshTG9uZ31cbiAgICAgKi9cbiAgICBMb25nLk1BWF9WQUxVRSA9IE1BWF9WQUxVRTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHshTG9uZ31cbiAgICAgKiBAaW5uZXJcbiAgICAgKi9cbiAgICB2YXIgTUFYX1VOU0lHTkVEX1ZBTFVFID0gZnJvbUJpdHMoMHhmZmZmZmZmZiB8IDAsIDB4ZmZmZmZmZmYgfCAwLCB0cnVlKTtcblxuICAgIC8qKlxuICAgICAqIE1heGltdW0gdW5zaWduZWQgdmFsdWUuXG4gICAgICogQHR5cGUgeyFMb25nfVxuICAgICAqL1xuICAgIExvbmcuTUFYX1VOU0lHTkVEX1ZBTFVFID0gTUFYX1VOU0lHTkVEX1ZBTFVFO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUgeyFMb25nfVxuICAgICAqIEBpbm5lclxuICAgICAqL1xuICAgIHZhciBNSU5fVkFMVUUgPSBmcm9tQml0cygwLCAweDgwMDAwMDAwIHwgMCwgZmFsc2UpO1xuXG4gICAgLyoqXG4gICAgICogTWluaW11bSBzaWduZWQgdmFsdWUuXG4gICAgICogQHR5cGUgeyFMb25nfVxuICAgICAqL1xuICAgIExvbmcuTUlOX1ZBTFVFID0gTUlOX1ZBTFVFO1xuXG4gICAgLyoqXG4gICAgICogQGFsaWFzIExvbmcucHJvdG90eXBlXG4gICAgICogQGlubmVyXG4gICAgICovXG4gICAgdmFyIExvbmdQcm90b3R5cGUgPSBMb25nLnByb3RvdHlwZTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBMb25nIHRvIGEgMzIgYml0IGludGVnZXIsIGFzc3VtaW5nIGl0IGlzIGEgMzIgYml0IGludGVnZXIuXG4gICAgICogQHRoaXMgeyFMb25nfVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS50b0ludCA9IGZ1bmN0aW9uIHRvSW50KCkge1xuICAgICAgcmV0dXJuIHRoaXMudW5zaWduZWQgPyB0aGlzLmxvdyA+Pj4gMCA6IHRoaXMubG93O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyB0aGUgTG9uZyB0byBhIHRoZSBuZWFyZXN0IGZsb2F0aW5nLXBvaW50IHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgdmFsdWUgKGRvdWJsZSwgNTMgYml0IG1hbnRpc3NhKS5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLnRvTnVtYmVyID0gZnVuY3Rpb24gdG9OdW1iZXIoKSB7XG4gICAgICBpZiAodGhpcy51bnNpZ25lZClcbiAgICAgICAgcmV0dXJuICh0aGlzLmhpZ2ggPj4+IDApICogVFdPX1BXUl8zMl9EQkwgKyAodGhpcy5sb3cgPj4+IDApO1xuICAgICAgcmV0dXJuIHRoaXMuaGlnaCAqIFRXT19QV1JfMzJfREJMICsgKHRoaXMubG93ID4+PiAwKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgdGhlIExvbmcgdG8gYSBzdHJpbmcgd3JpdHRlbiBpbiB0aGUgc3BlY2lmaWVkIHJhZGl4LlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcGFyYW0ge251bWJlcj19IHJhZGl4IFJhZGl4ICgyLTM2KSwgZGVmYXVsdHMgdG8gMTBcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIGByYWRpeGAgaXMgb3V0IG9mIHJhbmdlXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKHJhZGl4KSB7XG4gICAgICByYWRpeCA9IHJhZGl4IHx8IDEwO1xuICAgICAgaWYgKHJhZGl4IDwgMiB8fCAzNiA8IHJhZGl4KSB0aHJvdyBSYW5nZUVycm9yKFwicmFkaXhcIik7XG4gICAgICBpZiAodGhpcy5pc1plcm8oKSkgcmV0dXJuIFwiMFwiO1xuICAgICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAgIC8vIFVuc2lnbmVkIExvbmdzIGFyZSBuZXZlciBuZWdhdGl2ZVxuICAgICAgICBpZiAodGhpcy5lcShNSU5fVkFMVUUpKSB7XG4gICAgICAgICAgLy8gV2UgbmVlZCB0byBjaGFuZ2UgdGhlIExvbmcgdmFsdWUgYmVmb3JlIGl0IGNhbiBiZSBuZWdhdGVkLCBzbyB3ZSByZW1vdmVcbiAgICAgICAgICAvLyB0aGUgYm90dG9tLW1vc3QgZGlnaXQgaW4gdGhpcyBiYXNlIGFuZCB0aGVuIHJlY3Vyc2UgdG8gZG8gdGhlIHJlc3QuXG4gICAgICAgICAgdmFyIHJhZGl4TG9uZyA9IGZyb21OdW1iZXIocmFkaXgpLFxuICAgICAgICAgICAgZGl2ID0gdGhpcy5kaXYocmFkaXhMb25nKSxcbiAgICAgICAgICAgIHJlbTEgPSBkaXYubXVsKHJhZGl4TG9uZykuc3ViKHRoaXMpO1xuICAgICAgICAgIHJldHVybiBkaXYudG9TdHJpbmcocmFkaXgpICsgcmVtMS50b0ludCgpLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBcIi1cIiArIHRoaXMubmVnKCkudG9TdHJpbmcocmFkaXgpO1xuICAgICAgfVxuXG4gICAgICAvLyBEbyBzZXZlcmFsICg2KSBkaWdpdHMgZWFjaCB0aW1lIHRocm91Z2ggdGhlIGxvb3AsIHNvIGFzIHRvXG4gICAgICAvLyBtaW5pbWl6ZSB0aGUgY2FsbHMgdG8gdGhlIHZlcnkgZXhwZW5zaXZlIGVtdWxhdGVkIGRpdi5cbiAgICAgIHZhciByYWRpeFRvUG93ZXIgPSBmcm9tTnVtYmVyKHBvd19kYmwocmFkaXgsIDYpLCB0aGlzLnVuc2lnbmVkKSxcbiAgICAgICAgcmVtID0gdGhpcztcbiAgICAgIHZhciByZXN1bHQgPSBcIlwiO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIHJlbURpdiA9IHJlbS5kaXYocmFkaXhUb1Bvd2VyKSxcbiAgICAgICAgICBpbnR2YWwgPSByZW0uc3ViKHJlbURpdi5tdWwocmFkaXhUb1Bvd2VyKSkudG9JbnQoKSA+Pj4gMCxcbiAgICAgICAgICBkaWdpdHMgPSBpbnR2YWwudG9TdHJpbmcocmFkaXgpO1xuICAgICAgICByZW0gPSByZW1EaXY7XG4gICAgICAgIGlmIChyZW0uaXNaZXJvKCkpIHJldHVybiBkaWdpdHMgKyByZXN1bHQ7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHdoaWxlIChkaWdpdHMubGVuZ3RoIDwgNikgZGlnaXRzID0gXCIwXCIgKyBkaWdpdHM7XG4gICAgICAgICAgcmVzdWx0ID0gXCJcIiArIGRpZ2l0cyArIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBoaWdoIDMyIGJpdHMgYXMgYSBzaWduZWQgaW50ZWdlci5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMge251bWJlcn0gU2lnbmVkIGhpZ2ggYml0c1xuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUuZ2V0SGlnaEJpdHMgPSBmdW5jdGlvbiBnZXRIaWdoQml0cygpIHtcbiAgICAgIHJldHVybiB0aGlzLmhpZ2g7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGhpZ2ggMzIgYml0cyBhcyBhbiB1bnNpZ25lZCBpbnRlZ2VyLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBVbnNpZ25lZCBoaWdoIGJpdHNcbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmdldEhpZ2hCaXRzVW5zaWduZWQgPSBmdW5jdGlvbiBnZXRIaWdoQml0c1Vuc2lnbmVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMuaGlnaCA+Pj4gMDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbG93IDMyIGJpdHMgYXMgYSBzaWduZWQgaW50ZWdlci5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMge251bWJlcn0gU2lnbmVkIGxvdyBiaXRzXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5nZXRMb3dCaXRzID0gZnVuY3Rpb24gZ2V0TG93Qml0cygpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvdztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbG93IDMyIGJpdHMgYXMgYW4gdW5zaWduZWQgaW50ZWdlci5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMge251bWJlcn0gVW5zaWduZWQgbG93IGJpdHNcbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmdldExvd0JpdHNVbnNpZ25lZCA9IGZ1bmN0aW9uIGdldExvd0JpdHNVbnNpZ25lZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvdyA+Pj4gMDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbnVtYmVyIG9mIGJpdHMgbmVlZGVkIHRvIHJlcHJlc2VudCB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBMb25nLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUuZ2V0TnVtQml0c0FicyA9IGZ1bmN0aW9uIGdldE51bUJpdHNBYnMoKSB7XG4gICAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpXG4gICAgICAgIC8vIFVuc2lnbmVkIExvbmdzIGFyZSBuZXZlciBuZWdhdGl2ZVxuICAgICAgICByZXR1cm4gdGhpcy5lcShNSU5fVkFMVUUpID8gNjQgOiB0aGlzLm5lZygpLmdldE51bUJpdHNBYnMoKTtcbiAgICAgIHZhciB2YWwgPSB0aGlzLmhpZ2ggIT0gMCA/IHRoaXMuaGlnaCA6IHRoaXMubG93O1xuICAgICAgZm9yICh2YXIgYml0ID0gMzE7IGJpdCA+IDA7IGJpdC0tKSBpZiAoKHZhbCAmICgxIDw8IGJpdCkpICE9IDApIGJyZWFrO1xuICAgICAgcmV0dXJuIHRoaXMuaGlnaCAhPSAwID8gYml0ICsgMzMgOiBiaXQgKyAxO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcgY2FuIGJlIHNhZmVseSByZXByZXNlbnRlZCBhcyBhIEphdmFTY3JpcHQgbnVtYmVyLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmlzU2FmZUludGVnZXIgPSBmdW5jdGlvbiBpc1NhZmVJbnRlZ2VyKCkge1xuICAgICAgLy8gMl41My0xIGlzIHRoZSBtYXhpbXVtIHNhZmUgdmFsdWVcbiAgICAgIHZhciB0b3AxMUJpdHMgPSB0aGlzLmhpZ2ggPj4gMjE7XG4gICAgICAvLyBbMCwgMl41My0xXVxuICAgICAgaWYgKCF0b3AxMUJpdHMpIHJldHVybiB0cnVlO1xuICAgICAgLy8gPiAyXjUzLTFcbiAgICAgIGlmICh0aGlzLnVuc2lnbmVkKSByZXR1cm4gZmFsc2U7XG4gICAgICAvLyBbLTJeNTMsIC0xXSBleGNlcHQgLTJeNTNcbiAgICAgIHJldHVybiB0b3AxMUJpdHMgPT09IC0xICYmICEodGhpcy5sb3cgPT09IDAgJiYgdGhpcy5oaWdoID09PSAtMHgyMDAwMDApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgemVyby5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5pc1plcm8gPSBmdW5jdGlvbiBpc1plcm8oKSB7XG4gICAgICByZXR1cm4gdGhpcy5oaWdoID09PSAwICYmIHRoaXMubG93ID09PSAwO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgemVyby4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNpc1plcm99LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUuZXF6ID0gTG9uZ1Byb3RvdHlwZS5pc1plcm87XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBuZWdhdGl2ZS5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5pc05lZ2F0aXZlID0gZnVuY3Rpb24gaXNOZWdhdGl2ZSgpIHtcbiAgICAgIHJldHVybiAhdGhpcy51bnNpZ25lZCAmJiB0aGlzLmhpZ2ggPCAwO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBwb3NpdGl2ZSBvciB6ZXJvLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmlzUG9zaXRpdmUgPSBmdW5jdGlvbiBpc1Bvc2l0aXZlKCkge1xuICAgICAgcmV0dXJuIHRoaXMudW5zaWduZWQgfHwgdGhpcy5oaWdoID49IDA7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIG9kZC5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5pc09kZCA9IGZ1bmN0aW9uIGlzT2RkKCkge1xuICAgICAgcmV0dXJuICh0aGlzLmxvdyAmIDEpID09PSAxO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBldmVuLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmlzRXZlbiA9IGZ1bmN0aW9uIGlzRXZlbigpIHtcbiAgICAgIHJldHVybiAodGhpcy5sb3cgJiAxKSA9PT0gMDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZXF1YWxzIHRoZSBzcGVjaWZpZWQncy5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyhvdGhlcikge1xuICAgICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMudW5zaWduZWQgIT09IG90aGVyLnVuc2lnbmVkICYmXG4gICAgICAgIHRoaXMuaGlnaCA+Pj4gMzEgPT09IDEgJiZcbiAgICAgICAgb3RoZXIuaGlnaCA+Pj4gMzEgPT09IDFcbiAgICAgIClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXMuaGlnaCA9PT0gb3RoZXIuaGlnaCAmJiB0aGlzLmxvdyA9PT0gb3RoZXIubG93O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2VxdWFsc30uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmVxID0gTG9uZ1Byb3RvdHlwZS5lcXVhbHM7XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIHNwZWNpZmllZCdzLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxiaWdpbnR8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUubm90RXF1YWxzID0gZnVuY3Rpb24gbm90RXF1YWxzKG90aGVyKSB7XG4gICAgICByZXR1cm4gIXRoaXMuZXEoLyogdmFsaWRhdGVzICovIG90aGVyKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZGlmZmVycyBmcm9tIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNub3RFcXVhbHN9LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfGJpZ2ludHxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5uZXEgPSBMb25nUHJvdG90eXBlLm5vdEVxdWFscztcblxuICAgIC8qKlxuICAgICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbm90RXF1YWxzfS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxiaWdpbnR8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUubmUgPSBMb25nUHJvdG90eXBlLm5vdEVxdWFscztcblxuICAgIC8qKlxuICAgICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiB0aGUgc3BlY2lmaWVkJ3MuXG4gICAgICogQHRoaXMgeyFMb25nfVxuICAgICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfGJpZ2ludHxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uIGxlc3NUaGFuKG90aGVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wKC8qIHZhbGlkYXRlcyAqLyBvdGhlcikgPCAwO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2xlc3NUaGFufS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxiaWdpbnR8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUubHQgPSBMb25nUHJvdG90eXBlLmxlc3NUaGFuO1xuXG4gICAgLyoqXG4gICAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uIGxlc3NUaGFuT3JFcXVhbChvdGhlcikge1xuICAgICAgcmV0dXJuIHRoaXMuY29tcCgvKiB2YWxpZGF0ZXMgKi8gb3RoZXIpIDw9IDA7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbGVzc1RoYW5PckVxdWFsfS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxiaWdpbnR8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUubHRlID0gTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWw7XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2xlc3NUaGFuT3JFcXVhbH0uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmxlID0gTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWw7XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gdGhlIHNwZWNpZmllZCdzLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxiaWdpbnR8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbiBncmVhdGVyVGhhbihvdGhlcikge1xuICAgICAgcmV0dXJuIHRoaXMuY29tcCgvKiB2YWxpZGF0ZXMgKi8gb3RoZXIpID4gMDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNncmVhdGVyVGhhbn0uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmd0ID0gTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbjtcblxuICAgIC8qKlxuICAgICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuXG4gICAgICogQHRoaXMgeyFMb25nfVxuICAgICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfGJpZ2ludHxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWwgPSBmdW5jdGlvbiBncmVhdGVyVGhhbk9yRXF1YWwob3RoZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXAoLyogdmFsaWRhdGVzICovIG90aGVyKSA+PSAwO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2dyZWF0ZXJUaGFuT3JFcXVhbH0uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmd0ZSA9IExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsO1xuXG4gICAgLyoqXG4gICAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNncmVhdGVyVGhhbk9yRXF1YWx9LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfGJpZ2ludHxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5nZSA9IExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsO1xuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdGhpcyBMb25nJ3MgdmFsdWUgd2l0aCB0aGUgc3BlY2lmaWVkJ3MuXG4gICAgICogQHRoaXMgeyFMb25nfVxuICAgICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfGJpZ2ludHxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAgICogQHJldHVybnMge251bWJlcn0gMCBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgMSBpZiB0aGUgdGhpcyBpcyBncmVhdGVyIGFuZCAtMVxuICAgICAqICBpZiB0aGUgZ2l2ZW4gb25lIGlzIGdyZWF0ZXJcbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlKG90aGVyKSB7XG4gICAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICAgIGlmICh0aGlzLmVxKG90aGVyKSkgcmV0dXJuIDA7XG4gICAgICB2YXIgdGhpc05lZyA9IHRoaXMuaXNOZWdhdGl2ZSgpLFxuICAgICAgICBvdGhlck5lZyA9IG90aGVyLmlzTmVnYXRpdmUoKTtcbiAgICAgIGlmICh0aGlzTmVnICYmICFvdGhlck5lZykgcmV0dXJuIC0xO1xuICAgICAgaWYgKCF0aGlzTmVnICYmIG90aGVyTmVnKSByZXR1cm4gMTtcbiAgICAgIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHNpZ24gYml0cyBhcmUgdGhlIHNhbWVcbiAgICAgIGlmICghdGhpcy51bnNpZ25lZCkgcmV0dXJuIHRoaXMuc3ViKG90aGVyKS5pc05lZ2F0aXZlKCkgPyAtMSA6IDE7XG4gICAgICAvLyBCb3RoIGFyZSBwb3NpdGl2ZSBpZiBhdCBsZWFzdCBvbmUgaXMgdW5zaWduZWRcbiAgICAgIHJldHVybiBvdGhlci5oaWdoID4+PiAwID4gdGhpcy5oaWdoID4+PiAwIHx8XG4gICAgICAgIChvdGhlci5oaWdoID09PSB0aGlzLmhpZ2ggJiYgb3RoZXIubG93ID4+PiAwID4gdGhpcy5sb3cgPj4+IDApXG4gICAgICAgID8gLTFcbiAgICAgICAgOiAxO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDb21wYXJlcyB0aGlzIExvbmcncyB2YWx1ZSB3aXRoIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNjb21wYXJlfS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxiaWdpbnR8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IDAgaWYgdGhleSBhcmUgdGhlIHNhbWUsIDEgaWYgdGhlIHRoaXMgaXMgZ3JlYXRlciBhbmQgLTFcbiAgICAgKiAgaWYgdGhlIGdpdmVuIG9uZSBpcyBncmVhdGVyXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5jb21wID0gTG9uZ1Byb3RvdHlwZS5jb21wYXJlO1xuXG4gICAgLyoqXG4gICAgICogTmVnYXRlcyB0aGlzIExvbmcncyB2YWx1ZS5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMgeyFMb25nfSBOZWdhdGVkIExvbmdcbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uIG5lZ2F0ZSgpIHtcbiAgICAgIGlmICghdGhpcy51bnNpZ25lZCAmJiB0aGlzLmVxKE1JTl9WQUxVRSkpIHJldHVybiBNSU5fVkFMVUU7XG4gICAgICByZXR1cm4gdGhpcy5ub3QoKS5hZGQoT05FKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTmVnYXRlcyB0aGlzIExvbmcncyB2YWx1ZS4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNuZWdhdGV9LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEByZXR1cm5zIHshTG9uZ30gTmVnYXRlZCBMb25nXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5uZWcgPSBMb25nUHJvdG90eXBlLm5lZ2F0ZTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHN1bSBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuXG4gICAgICogQHRoaXMgeyFMb25nfVxuICAgICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfGJpZ2ludHxzdHJpbmd9IGFkZGVuZCBBZGRlbmRcbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9IFN1bVxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKGFkZGVuZCkge1xuICAgICAgaWYgKCFpc0xvbmcoYWRkZW5kKSkgYWRkZW5kID0gZnJvbVZhbHVlKGFkZGVuZCk7XG5cbiAgICAgIC8vIERpdmlkZSBlYWNoIG51bWJlciBpbnRvIDQgY2h1bmtzIG9mIDE2IGJpdHMsIGFuZCB0aGVuIHN1bSB0aGUgY2h1bmtzLlxuXG4gICAgICB2YXIgYTQ4ID0gdGhpcy5oaWdoID4+PiAxNjtcbiAgICAgIHZhciBhMzIgPSB0aGlzLmhpZ2ggJiAweGZmZmY7XG4gICAgICB2YXIgYTE2ID0gdGhpcy5sb3cgPj4+IDE2O1xuICAgICAgdmFyIGEwMCA9IHRoaXMubG93ICYgMHhmZmZmO1xuICAgICAgdmFyIGI0OCA9IGFkZGVuZC5oaWdoID4+PiAxNjtcbiAgICAgIHZhciBiMzIgPSBhZGRlbmQuaGlnaCAmIDB4ZmZmZjtcbiAgICAgIHZhciBiMTYgPSBhZGRlbmQubG93ID4+PiAxNjtcbiAgICAgIHZhciBiMDAgPSBhZGRlbmQubG93ICYgMHhmZmZmO1xuICAgICAgdmFyIGM0OCA9IDAsXG4gICAgICAgIGMzMiA9IDAsXG4gICAgICAgIGMxNiA9IDAsXG4gICAgICAgIGMwMCA9IDA7XG4gICAgICBjMDAgKz0gYTAwICsgYjAwO1xuICAgICAgYzE2ICs9IGMwMCA+Pj4gMTY7XG4gICAgICBjMDAgJj0gMHhmZmZmO1xuICAgICAgYzE2ICs9IGExNiArIGIxNjtcbiAgICAgIGMzMiArPSBjMTYgPj4+IDE2O1xuICAgICAgYzE2ICY9IDB4ZmZmZjtcbiAgICAgIGMzMiArPSBhMzIgKyBiMzI7XG4gICAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICAgIGMzMiAmPSAweGZmZmY7XG4gICAgICBjNDggKz0gYTQ4ICsgYjQ4O1xuICAgICAgYzQ4ICY9IDB4ZmZmZjtcbiAgICAgIHJldHVybiBmcm9tQml0cygoYzE2IDw8IDE2KSB8IGMwMCwgKGM0OCA8PCAxNikgfCBjMzIsIHRoaXMudW5zaWduZWQpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkaWZmZXJlbmNlIG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ30gc3VidHJhaGVuZCBTdWJ0cmFoZW5kXG4gICAgICogQHJldHVybnMgeyFMb25nfSBEaWZmZXJlbmNlXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uIHN1YnRyYWN0KHN1YnRyYWhlbmQpIHtcbiAgICAgIGlmICghaXNMb25nKHN1YnRyYWhlbmQpKSBzdWJ0cmFoZW5kID0gZnJvbVZhbHVlKHN1YnRyYWhlbmQpO1xuICAgICAgcmV0dXJuIHRoaXMuYWRkKHN1YnRyYWhlbmQubmVnKCkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkaWZmZXJlbmNlIG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzdWJ0cmFjdH0uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ30gc3VidHJhaGVuZCBTdWJ0cmFoZW5kXG4gICAgICogQHJldHVybnMgeyFMb25nfSBEaWZmZXJlbmNlXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5zdWIgPSBMb25nUHJvdG90eXBlLnN1YnRyYWN0O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcHJvZHVjdCBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuXG4gICAgICogQHRoaXMgeyFMb25nfVxuICAgICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfGJpZ2ludHxzdHJpbmd9IG11bHRpcGxpZXIgTXVsdGlwbGllclxuICAgICAqIEByZXR1cm5zIHshTG9uZ30gUHJvZHVjdFxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbiBtdWx0aXBseShtdWx0aXBsaWVyKSB7XG4gICAgICBpZiAodGhpcy5pc1plcm8oKSkgcmV0dXJuIHRoaXM7XG4gICAgICBpZiAoIWlzTG9uZyhtdWx0aXBsaWVyKSkgbXVsdGlwbGllciA9IGZyb21WYWx1ZShtdWx0aXBsaWVyKTtcblxuICAgICAgLy8gdXNlIHdhc20gc3VwcG9ydCBpZiBwcmVzZW50XG4gICAgICBpZiAod2FzbSkge1xuICAgICAgICB2YXIgbG93ID0gd2FzbVtcIm11bFwiXShcbiAgICAgICAgICB0aGlzLmxvdyxcbiAgICAgICAgICB0aGlzLmhpZ2gsXG4gICAgICAgICAgbXVsdGlwbGllci5sb3csXG4gICAgICAgICAgbXVsdGlwbGllci5oaWdoLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gZnJvbUJpdHMobG93LCB3YXNtW1wiZ2V0X2hpZ2hcIl0oKSwgdGhpcy51bnNpZ25lZCk7XG4gICAgICB9XG4gICAgICBpZiAobXVsdGlwbGllci5pc1plcm8oKSkgcmV0dXJuIHRoaXMudW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gICAgICBpZiAodGhpcy5lcShNSU5fVkFMVUUpKSByZXR1cm4gbXVsdGlwbGllci5pc09kZCgpID8gTUlOX1ZBTFVFIDogWkVSTztcbiAgICAgIGlmIChtdWx0aXBsaWVyLmVxKE1JTl9WQUxVRSkpIHJldHVybiB0aGlzLmlzT2RkKCkgPyBNSU5fVkFMVUUgOiBaRVJPO1xuICAgICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAgIGlmIChtdWx0aXBsaWVyLmlzTmVnYXRpdmUoKSkgcmV0dXJuIHRoaXMubmVnKCkubXVsKG11bHRpcGxpZXIubmVnKCkpO1xuICAgICAgICBlbHNlIHJldHVybiB0aGlzLm5lZygpLm11bChtdWx0aXBsaWVyKS5uZWcoKTtcbiAgICAgIH0gZWxzZSBpZiAobXVsdGlwbGllci5pc05lZ2F0aXZlKCkpXG4gICAgICAgIHJldHVybiB0aGlzLm11bChtdWx0aXBsaWVyLm5lZygpKS5uZWcoKTtcblxuICAgICAgLy8gSWYgYm90aCBsb25ncyBhcmUgc21hbGwsIHVzZSBmbG9hdCBtdWx0aXBsaWNhdGlvblxuICAgICAgaWYgKHRoaXMubHQoVFdPX1BXUl8yNCkgJiYgbXVsdGlwbGllci5sdChUV09fUFdSXzI0KSlcbiAgICAgICAgcmV0dXJuIGZyb21OdW1iZXIoXG4gICAgICAgICAgdGhpcy50b051bWJlcigpICogbXVsdGlwbGllci50b051bWJlcigpLFxuICAgICAgICAgIHRoaXMudW5zaWduZWQsXG4gICAgICAgICk7XG5cbiAgICAgIC8vIERpdmlkZSBlYWNoIGxvbmcgaW50byA0IGNodW5rcyBvZiAxNiBiaXRzLCBhbmQgdGhlbiBhZGQgdXAgNHg0IHByb2R1Y3RzLlxuICAgICAgLy8gV2UgY2FuIHNraXAgcHJvZHVjdHMgdGhhdCB3b3VsZCBvdmVyZmxvdy5cblxuICAgICAgdmFyIGE0OCA9IHRoaXMuaGlnaCA+Pj4gMTY7XG4gICAgICB2YXIgYTMyID0gdGhpcy5oaWdoICYgMHhmZmZmO1xuICAgICAgdmFyIGExNiA9IHRoaXMubG93ID4+PiAxNjtcbiAgICAgIHZhciBhMDAgPSB0aGlzLmxvdyAmIDB4ZmZmZjtcbiAgICAgIHZhciBiNDggPSBtdWx0aXBsaWVyLmhpZ2ggPj4+IDE2O1xuICAgICAgdmFyIGIzMiA9IG11bHRpcGxpZXIuaGlnaCAmIDB4ZmZmZjtcbiAgICAgIHZhciBiMTYgPSBtdWx0aXBsaWVyLmxvdyA+Pj4gMTY7XG4gICAgICB2YXIgYjAwID0gbXVsdGlwbGllci5sb3cgJiAweGZmZmY7XG4gICAgICB2YXIgYzQ4ID0gMCxcbiAgICAgICAgYzMyID0gMCxcbiAgICAgICAgYzE2ID0gMCxcbiAgICAgICAgYzAwID0gMDtcbiAgICAgIGMwMCArPSBhMDAgKiBiMDA7XG4gICAgICBjMTYgKz0gYzAwID4+PiAxNjtcbiAgICAgIGMwMCAmPSAweGZmZmY7XG4gICAgICBjMTYgKz0gYTE2ICogYjAwO1xuICAgICAgYzMyICs9IGMxNiA+Pj4gMTY7XG4gICAgICBjMTYgJj0gMHhmZmZmO1xuICAgICAgYzE2ICs9IGEwMCAqIGIxNjtcbiAgICAgIGMzMiArPSBjMTYgPj4+IDE2O1xuICAgICAgYzE2ICY9IDB4ZmZmZjtcbiAgICAgIGMzMiArPSBhMzIgKiBiMDA7XG4gICAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICAgIGMzMiAmPSAweGZmZmY7XG4gICAgICBjMzIgKz0gYTE2ICogYjE2O1xuICAgICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgICBjMzIgJj0gMHhmZmZmO1xuICAgICAgYzMyICs9IGEwMCAqIGIzMjtcbiAgICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgICAgYzMyICY9IDB4ZmZmZjtcbiAgICAgIGM0OCArPSBhNDggKiBiMDAgKyBhMzIgKiBiMTYgKyBhMTYgKiBiMzIgKyBhMDAgKiBiNDg7XG4gICAgICBjNDggJj0gMHhmZmZmO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKChjMTYgPDwgMTYpIHwgYzAwLCAoYzQ4IDw8IDE2KSB8IGMzMiwgdGhpcy51bnNpZ25lZCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHByb2R1Y3Qgb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI211bHRpcGx5fS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxiaWdpbnR8c3RyaW5nfSBtdWx0aXBsaWVyIE11bHRpcGxpZXJcbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9IFByb2R1Y3RcbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLm11bCA9IExvbmdQcm90b3R5cGUubXVsdGlwbHk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBkaXZpZGVkIGJ5IHRoZSBzcGVjaWZpZWQuIFRoZSByZXN1bHQgaXMgc2lnbmVkIGlmIHRoaXMgTG9uZyBpcyBzaWduZWQgb3JcbiAgICAgKiAgdW5zaWduZWQgaWYgdGhpcyBMb25nIGlzIHVuc2lnbmVkLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxiaWdpbnR8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9IFF1b3RpZW50XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbiBkaXZpZGUoZGl2aXNvcikge1xuICAgICAgaWYgKCFpc0xvbmcoZGl2aXNvcikpIGRpdmlzb3IgPSBmcm9tVmFsdWUoZGl2aXNvcik7XG4gICAgICBpZiAoZGl2aXNvci5pc1plcm8oKSkgdGhyb3cgRXJyb3IoXCJkaXZpc2lvbiBieSB6ZXJvXCIpO1xuXG4gICAgICAvLyB1c2Ugd2FzbSBzdXBwb3J0IGlmIHByZXNlbnRcbiAgICAgIGlmICh3YXNtKSB7XG4gICAgICAgIC8vIGd1YXJkIGFnYWluc3Qgc2lnbmVkIGRpdmlzaW9uIG92ZXJmbG93OiB0aGUgbGFyZ2VzdFxuICAgICAgICAvLyBuZWdhdGl2ZSBudW1iZXIgLyAtMSB3b3VsZCBiZSAxIGxhcmdlciB0aGFuIHRoZSBsYXJnZXN0XG4gICAgICAgIC8vIHBvc2l0aXZlIG51bWJlciwgZHVlIHRvIHR3bydzIGNvbXBsZW1lbnQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAhdGhpcy51bnNpZ25lZCAmJlxuICAgICAgICAgIHRoaXMuaGlnaCA9PT0gLTB4ODAwMDAwMDAgJiZcbiAgICAgICAgICBkaXZpc29yLmxvdyA9PT0gLTEgJiZcbiAgICAgICAgICBkaXZpc29yLmhpZ2ggPT09IC0xXG4gICAgICAgICkge1xuICAgICAgICAgIC8vIGJlIGNvbnNpc3RlbnQgd2l0aCBub24td2FzbSBjb2RlIHBhdGhcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgbG93ID0gKHRoaXMudW5zaWduZWQgPyB3YXNtW1wiZGl2X3VcIl0gOiB3YXNtW1wiZGl2X3NcIl0pKFxuICAgICAgICAgIHRoaXMubG93LFxuICAgICAgICAgIHRoaXMuaGlnaCxcbiAgICAgICAgICBkaXZpc29yLmxvdyxcbiAgICAgICAgICBkaXZpc29yLmhpZ2gsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBmcm9tQml0cyhsb3csIHdhc21bXCJnZXRfaGlnaFwiXSgpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmlzWmVybygpKSByZXR1cm4gdGhpcy51bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgICAgIHZhciBhcHByb3gsIHJlbSwgcmVzO1xuICAgICAgaWYgKCF0aGlzLnVuc2lnbmVkKSB7XG4gICAgICAgIC8vIFRoaXMgc2VjdGlvbiBpcyBvbmx5IHJlbGV2YW50IGZvciBzaWduZWQgbG9uZ3MgYW5kIGlzIGRlcml2ZWQgZnJvbSB0aGVcbiAgICAgICAgLy8gY2xvc3VyZSBsaWJyYXJ5IGFzIGEgd2hvbGUuXG4gICAgICAgIGlmICh0aGlzLmVxKE1JTl9WQUxVRSkpIHtcbiAgICAgICAgICBpZiAoZGl2aXNvci5lcShPTkUpIHx8IGRpdmlzb3IuZXEoTkVHX09ORSkpXG4gICAgICAgICAgICByZXR1cm4gTUlOX1ZBTFVFOyAvLyByZWNhbGwgdGhhdCAtTUlOX1ZBTFVFID09IE1JTl9WQUxVRVxuICAgICAgICAgIGVsc2UgaWYgKGRpdmlzb3IuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIE9ORTtcbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIHdlIGhhdmUgfG90aGVyfCA+PSAyLCBzbyB8dGhpcy9vdGhlcnwgPCB8TUlOX1ZBTFVFfC5cbiAgICAgICAgICAgIHZhciBoYWxmVGhpcyA9IHRoaXMuc2hyKDEpO1xuICAgICAgICAgICAgYXBwcm94ID0gaGFsZlRoaXMuZGl2KGRpdmlzb3IpLnNobCgxKTtcbiAgICAgICAgICAgIGlmIChhcHByb3guZXEoWkVSTykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRpdmlzb3IuaXNOZWdhdGl2ZSgpID8gT05FIDogTkVHX09ORTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlbSA9IHRoaXMuc3ViKGRpdmlzb3IubXVsKGFwcHJveCkpO1xuICAgICAgICAgICAgICByZXMgPSBhcHByb3guYWRkKHJlbS5kaXYoZGl2aXNvcikpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkaXZpc29yLmVxKE1JTl9WQUxVRSkpIHJldHVybiB0aGlzLnVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICAgICAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIHtcbiAgICAgICAgICBpZiAoZGl2aXNvci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLm5lZygpLmRpdihkaXZpc29yLm5lZygpKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5uZWcoKS5kaXYoZGl2aXNvcikubmVnKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGl2aXNvci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLmRpdihkaXZpc29yLm5lZygpKS5uZWcoKTtcbiAgICAgICAgcmVzID0gWkVSTztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSBhbGdvcml0aG0gYmVsb3cgaGFzIG5vdCBiZWVuIG1hZGUgZm9yIHVuc2lnbmVkIGxvbmdzLiBJdCdzIHRoZXJlZm9yZVxuICAgICAgICAvLyByZXF1aXJlZCB0byB0YWtlIHNwZWNpYWwgY2FyZSBvZiB0aGUgTVNCIHByaW9yIHRvIHJ1bm5pbmcgaXQuXG4gICAgICAgIGlmICghZGl2aXNvci51bnNpZ25lZCkgZGl2aXNvciA9IGRpdmlzb3IudG9VbnNpZ25lZCgpO1xuICAgICAgICBpZiAoZGl2aXNvci5ndCh0aGlzKSkgcmV0dXJuIFVaRVJPO1xuICAgICAgICBpZiAoZGl2aXNvci5ndCh0aGlzLnNocnUoMSkpKVxuICAgICAgICAgIC8vIDE1ID4+PiAxID0gNyA7IHdpdGggZGl2aXNvciA9IDggOyB0cnVlXG4gICAgICAgICAgcmV0dXJuIFVPTkU7XG4gICAgICAgIHJlcyA9IFVaRVJPO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXBlYXQgdGhlIGZvbGxvd2luZyB1bnRpbCB0aGUgcmVtYWluZGVyIGlzIGxlc3MgdGhhbiBvdGhlcjogIGZpbmQgYVxuICAgICAgLy8gZmxvYXRpbmctcG9pbnQgdGhhdCBhcHByb3hpbWF0ZXMgcmVtYWluZGVyIC8gb3RoZXIgKmZyb20gYmVsb3cqLCBhZGQgdGhpc1xuICAgICAgLy8gaW50byB0aGUgcmVzdWx0LCBhbmQgc3VidHJhY3QgaXQgZnJvbSB0aGUgcmVtYWluZGVyLiAgSXQgaXMgY3JpdGljYWwgdGhhdFxuICAgICAgLy8gdGhlIGFwcHJveGltYXRlIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgcmVhbCB2YWx1ZSBzbyB0aGF0IHRoZVxuICAgICAgLy8gcmVtYWluZGVyIG5ldmVyIGJlY29tZXMgbmVnYXRpdmUuXG4gICAgICByZW0gPSB0aGlzO1xuICAgICAgd2hpbGUgKHJlbS5ndGUoZGl2aXNvcikpIHtcbiAgICAgICAgLy8gQXBwcm94aW1hdGUgdGhlIHJlc3VsdCBvZiBkaXZpc2lvbi4gVGhpcyBtYXkgYmUgYSBsaXR0bGUgZ3JlYXRlciBvclxuICAgICAgICAvLyBzbWFsbGVyIHRoYW4gdGhlIGFjdHVhbCB2YWx1ZS5cbiAgICAgICAgYXBwcm94ID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihyZW0udG9OdW1iZXIoKSAvIGRpdmlzb3IudG9OdW1iZXIoKSkpO1xuXG4gICAgICAgIC8vIFdlIHdpbGwgdHdlYWsgdGhlIGFwcHJveGltYXRlIHJlc3VsdCBieSBjaGFuZ2luZyBpdCBpbiB0aGUgNDgtdGggZGlnaXQgb3JcbiAgICAgICAgLy8gdGhlIHNtYWxsZXN0IG5vbi1mcmFjdGlvbmFsIGRpZ2l0LCB3aGljaGV2ZXIgaXMgbGFyZ2VyLlxuICAgICAgICB2YXIgbG9nMiA9IE1hdGguY2VpbChNYXRoLmxvZyhhcHByb3gpIC8gTWF0aC5MTjIpLFxuICAgICAgICAgIGRlbHRhID0gbG9nMiA8PSA0OCA/IDEgOiBwb3dfZGJsKDIsIGxvZzIgLSA0OCksXG4gICAgICAgICAgLy8gRGVjcmVhc2UgdGhlIGFwcHJveGltYXRpb24gdW50aWwgaXQgaXMgc21hbGxlciB0aGFuIHRoZSByZW1haW5kZXIuICBOb3RlXG4gICAgICAgICAgLy8gdGhhdCBpZiBpdCBpcyB0b28gbGFyZ2UsIHRoZSBwcm9kdWN0IG92ZXJmbG93cyBhbmQgaXMgbmVnYXRpdmUuXG4gICAgICAgICAgYXBwcm94UmVzID0gZnJvbU51bWJlcihhcHByb3gpLFxuICAgICAgICAgIGFwcHJveFJlbSA9IGFwcHJveFJlcy5tdWwoZGl2aXNvcik7XG4gICAgICAgIHdoaWxlIChhcHByb3hSZW0uaXNOZWdhdGl2ZSgpIHx8IGFwcHJveFJlbS5ndChyZW0pKSB7XG4gICAgICAgICAgYXBwcm94IC09IGRlbHRhO1xuICAgICAgICAgIGFwcHJveFJlcyA9IGZyb21OdW1iZXIoYXBwcm94LCB0aGlzLnVuc2lnbmVkKTtcbiAgICAgICAgICBhcHByb3hSZW0gPSBhcHByb3hSZXMubXVsKGRpdmlzb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2Uga25vdyB0aGUgYW5zd2VyIGNhbid0IGJlIHplcm8uLi4gYW5kIGFjdHVhbGx5LCB6ZXJvIHdvdWxkIGNhdXNlXG4gICAgICAgIC8vIGluZmluaXRlIHJlY3Vyc2lvbiBzaW5jZSB3ZSB3b3VsZCBtYWtlIG5vIHByb2dyZXNzLlxuICAgICAgICBpZiAoYXBwcm94UmVzLmlzWmVybygpKSBhcHByb3hSZXMgPSBPTkU7XG4gICAgICAgIHJlcyA9IHJlcy5hZGQoYXBwcm94UmVzKTtcbiAgICAgICAgcmVtID0gcmVtLnN1YihhcHByb3hSZW0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGlzIExvbmcgZGl2aWRlZCBieSB0aGUgc3BlY2lmaWVkLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2RpdmlkZX0uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAgICogQHJldHVybnMgeyFMb25nfSBRdW90aWVudFxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUuZGl2ID0gTG9uZ1Byb3RvdHlwZS5kaXZpZGU7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBtb2R1bG8gdGhlIHNwZWNpZmllZC5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAgICogQHJldHVybnMgeyFMb25nfSBSZW1haW5kZXJcbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLm1vZHVsbyA9IGZ1bmN0aW9uIG1vZHVsbyhkaXZpc29yKSB7XG4gICAgICBpZiAoIWlzTG9uZyhkaXZpc29yKSkgZGl2aXNvciA9IGZyb21WYWx1ZShkaXZpc29yKTtcblxuICAgICAgLy8gdXNlIHdhc20gc3VwcG9ydCBpZiBwcmVzZW50XG4gICAgICBpZiAod2FzbSkge1xuICAgICAgICB2YXIgbG93ID0gKHRoaXMudW5zaWduZWQgPyB3YXNtW1wicmVtX3VcIl0gOiB3YXNtW1wicmVtX3NcIl0pKFxuICAgICAgICAgIHRoaXMubG93LFxuICAgICAgICAgIHRoaXMuaGlnaCxcbiAgICAgICAgICBkaXZpc29yLmxvdyxcbiAgICAgICAgICBkaXZpc29yLmhpZ2gsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBmcm9tQml0cyhsb3csIHdhc21bXCJnZXRfaGlnaFwiXSgpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnN1Yih0aGlzLmRpdihkaXZpc29yKS5tdWwoZGl2aXNvcikpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBtb2R1bG8gdGhlIHNwZWNpZmllZC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNtb2R1bG99LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfGJpZ2ludHxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgICAqIEByZXR1cm5zIHshTG9uZ30gUmVtYWluZGVyXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5tb2QgPSBMb25nUHJvdG90eXBlLm1vZHVsbztcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhpcyBMb25nIG1vZHVsbyB0aGUgc3BlY2lmaWVkLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI21vZHVsb30uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8YmlnaW50fHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAgICogQHJldHVybnMgeyFMb25nfSBSZW1haW5kZXJcbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLnJlbSA9IExvbmdQcm90b3R5cGUubW9kdWxvO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYml0d2lzZSBOT1Qgb2YgdGhpcyBMb25nLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5ub3QgPSBmdW5jdGlvbiBub3QoKSB7XG4gICAgICByZXR1cm4gZnJvbUJpdHMofnRoaXMubG93LCB+dGhpcy5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBjb3VudCBsZWFkaW5nIHplcm9zIG9mIHRoaXMgTG9uZy5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5jb3VudExlYWRpbmdaZXJvcyA9IGZ1bmN0aW9uIGNvdW50TGVhZGluZ1plcm9zKCkge1xuICAgICAgcmV0dXJuIHRoaXMuaGlnaCA/IE1hdGguY2x6MzIodGhpcy5oaWdoKSA6IE1hdGguY2x6MzIodGhpcy5sb3cpICsgMzI7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgY291bnQgbGVhZGluZyB6ZXJvcy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNjb3VudExlYWRpbmdaZXJvc30uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHshTG9uZ31cbiAgICAgKiBAcmV0dXJucyB7IW51bWJlcn1cbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLmNseiA9IExvbmdQcm90b3R5cGUuY291bnRMZWFkaW5nWmVyb3M7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNvdW50IHRyYWlsaW5nIHplcm9zIG9mIHRoaXMgTG9uZy5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5jb3VudFRyYWlsaW5nWmVyb3MgPSBmdW5jdGlvbiBjb3VudFRyYWlsaW5nWmVyb3MoKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb3cgPyBjdHozMih0aGlzLmxvdykgOiBjdHozMih0aGlzLmhpZ2gpICsgMzI7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgY291bnQgdHJhaWxpbmcgemVyb3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjY291bnRUcmFpbGluZ1plcm9zfS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0geyFMb25nfVxuICAgICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUuY3R6ID0gTG9uZ1Byb3RvdHlwZS5jb3VudFRyYWlsaW5nWmVyb3M7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlIEFORCBvZiB0aGlzIExvbmcgYW5kIHRoZSBzcGVjaWZpZWQuXG4gICAgICogQHRoaXMgeyFMb25nfVxuICAgICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfGJpZ2ludHxzdHJpbmd9IG90aGVyIE90aGVyIExvbmdcbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5hbmQgPSBmdW5jdGlvbiBhbmQob3RoZXIpIHtcbiAgICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKFxuICAgICAgICB0aGlzLmxvdyAmIG90aGVyLmxvdyxcbiAgICAgICAgdGhpcy5oaWdoICYgb3RoZXIuaGlnaCxcbiAgICAgICAgdGhpcy51bnNpZ25lZCxcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJpdHdpc2UgT1Igb2YgdGhpcyBMb25nIGFuZCB0aGUgc3BlY2lmaWVkLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxiaWdpbnR8c3RyaW5nfSBvdGhlciBPdGhlciBMb25nXG4gICAgICogQHJldHVybnMgeyFMb25nfVxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUub3IgPSBmdW5jdGlvbiBvcihvdGhlcikge1xuICAgICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgICByZXR1cm4gZnJvbUJpdHMoXG4gICAgICAgIHRoaXMubG93IHwgb3RoZXIubG93LFxuICAgICAgICB0aGlzLmhpZ2ggfCBvdGhlci5oaWdoLFxuICAgICAgICB0aGlzLnVuc2lnbmVkLFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYml0d2lzZSBYT1Igb2YgdGhpcyBMb25nIGFuZCB0aGUgZ2l2ZW4gb25lLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxiaWdpbnR8c3RyaW5nfSBvdGhlciBPdGhlciBMb25nXG4gICAgICogQHJldHVybnMgeyFMb25nfVxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUueG9yID0gZnVuY3Rpb24geG9yKG90aGVyKSB7XG4gICAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICAgIHJldHVybiBmcm9tQml0cyhcbiAgICAgICAgdGhpcy5sb3cgXiBvdGhlci5sb3csXG4gICAgICAgIHRoaXMuaGlnaCBeIG90aGVyLmhpZ2gsXG4gICAgICAgIHRoaXMudW5zaWduZWQsXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgc2hpZnRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5zaGlmdExlZnQgPSBmdW5jdGlvbiBzaGlmdExlZnQobnVtQml0cykge1xuICAgICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO1xuICAgICAgZWxzZSBpZiAobnVtQml0cyA8IDMyKVxuICAgICAgICByZXR1cm4gZnJvbUJpdHMoXG4gICAgICAgICAgdGhpcy5sb3cgPDwgbnVtQml0cyxcbiAgICAgICAgICAodGhpcy5oaWdoIDw8IG51bUJpdHMpIHwgKHRoaXMubG93ID4+PiAoMzIgLSBudW1CaXRzKSksXG4gICAgICAgICAgdGhpcy51bnNpZ25lZCxcbiAgICAgICAgKTtcbiAgICAgIGVsc2UgcmV0dXJuIGZyb21CaXRzKDAsIHRoaXMubG93IDw8IChudW1CaXRzIC0gMzIpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHNoaWZ0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdExlZnR9LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLnNobCA9IExvbmdQcm90b3R5cGUuc2hpZnRMZWZ0O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGFyaXRobWV0aWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAgICogQHRoaXMgeyFMb25nfVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHQgPSBmdW5jdGlvbiBzaGlmdFJpZ2h0KG51bUJpdHMpIHtcbiAgICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztcbiAgICAgIGVsc2UgaWYgKG51bUJpdHMgPCAzMilcbiAgICAgICAgcmV0dXJuIGZyb21CaXRzKFxuICAgICAgICAgICh0aGlzLmxvdyA+Pj4gbnVtQml0cykgfCAodGhpcy5oaWdoIDw8ICgzMiAtIG51bUJpdHMpKSxcbiAgICAgICAgICB0aGlzLmhpZ2ggPj4gbnVtQml0cyxcbiAgICAgICAgICB0aGlzLnVuc2lnbmVkLFxuICAgICAgICApO1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gZnJvbUJpdHMoXG4gICAgICAgICAgdGhpcy5oaWdoID4+IChudW1CaXRzIC0gMzIpLFxuICAgICAgICAgIHRoaXMuaGlnaCA+PSAwID8gMCA6IC0xLFxuICAgICAgICAgIHRoaXMudW5zaWduZWQsXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBhcml0aG1ldGljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3NoaWZ0UmlnaHR9LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICAgKi9cbiAgICBMb25nUHJvdG90eXBlLnNociA9IExvbmdQcm90b3R5cGUuc2hpZnRSaWdodDtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBsb2dpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUuc2hpZnRSaWdodFVuc2lnbmVkID0gZnVuY3Rpb24gc2hpZnRSaWdodFVuc2lnbmVkKG51bUJpdHMpIHtcbiAgICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztcbiAgICAgIGlmIChudW1CaXRzIDwgMzIpXG4gICAgICAgIHJldHVybiBmcm9tQml0cyhcbiAgICAgICAgICAodGhpcy5sb3cgPj4+IG51bUJpdHMpIHwgKHRoaXMuaGlnaCA8PCAoMzIgLSBudW1CaXRzKSksXG4gICAgICAgICAgdGhpcy5oaWdoID4+PiBudW1CaXRzLFxuICAgICAgICAgIHRoaXMudW5zaWduZWQsXG4gICAgICAgICk7XG4gICAgICBpZiAobnVtQml0cyA9PT0gMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2gsIDAsIHRoaXMudW5zaWduZWQpO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCA+Pj4gKG51bUJpdHMgLSAzMiksIDAsIHRoaXMudW5zaWduZWQpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgbG9naWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRSaWdodFVuc2lnbmVkfS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5zaHJ1ID0gTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0VW5zaWduZWQ7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgbG9naWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRSaWdodFVuc2lnbmVkfS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5zaHJfdSA9IExvbmdQcm90b3R5cGUuc2hpZnRSaWdodFVuc2lnbmVkO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHJvdGF0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUucm90YXRlTGVmdCA9IGZ1bmN0aW9uIHJvdGF0ZUxlZnQobnVtQml0cykge1xuICAgICAgdmFyIGI7XG4gICAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7XG4gICAgICBpZiAobnVtQml0cyA9PT0gMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2gsIHRoaXMubG93LCB0aGlzLnVuc2lnbmVkKTtcbiAgICAgIGlmIChudW1CaXRzIDwgMzIpIHtcbiAgICAgICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICAgICAgcmV0dXJuIGZyb21CaXRzKFxuICAgICAgICAgICh0aGlzLmxvdyA8PCBudW1CaXRzKSB8ICh0aGlzLmhpZ2ggPj4+IGIpLFxuICAgICAgICAgICh0aGlzLmhpZ2ggPDwgbnVtQml0cykgfCAodGhpcy5sb3cgPj4+IGIpLFxuICAgICAgICAgIHRoaXMudW5zaWduZWQsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBudW1CaXRzIC09IDMyO1xuICAgICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICAgIHJldHVybiBmcm9tQml0cyhcbiAgICAgICAgKHRoaXMuaGlnaCA8PCBudW1CaXRzKSB8ICh0aGlzLmxvdyA+Pj4gYiksXG4gICAgICAgICh0aGlzLmxvdyA8PCBudW1CaXRzKSB8ICh0aGlzLmhpZ2ggPj4+IGIpLFxuICAgICAgICB0aGlzLnVuc2lnbmVkLFxuICAgICAgKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjcm90YXRlTGVmdH0uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUucm90bCA9IExvbmdQcm90b3R5cGUucm90YXRlTGVmdDtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgICAqIEByZXR1cm5zIHshTG9uZ30gUm90YXRlZCBMb25nXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS5yb3RhdGVSaWdodCA9IGZ1bmN0aW9uIHJvdGF0ZVJpZ2h0KG51bUJpdHMpIHtcbiAgICAgIHZhciBiO1xuICAgICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO1xuICAgICAgaWYgKG51bUJpdHMgPT09IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoLCB0aGlzLmxvdywgdGhpcy51bnNpZ25lZCk7XG4gICAgICBpZiAobnVtQml0cyA8IDMyKSB7XG4gICAgICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgICAgIHJldHVybiBmcm9tQml0cyhcbiAgICAgICAgICAodGhpcy5oaWdoIDw8IGIpIHwgKHRoaXMubG93ID4+PiBudW1CaXRzKSxcbiAgICAgICAgICAodGhpcy5sb3cgPDwgYikgfCAodGhpcy5oaWdoID4+PiBudW1CaXRzKSxcbiAgICAgICAgICB0aGlzLnVuc2lnbmVkLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgbnVtQml0cyAtPSAzMjtcbiAgICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgICByZXR1cm4gZnJvbUJpdHMoXG4gICAgICAgICh0aGlzLmxvdyA8PCBiKSB8ICh0aGlzLmhpZ2ggPj4+IG51bUJpdHMpLFxuICAgICAgICAodGhpcy5oaWdoIDw8IGIpIHwgKHRoaXMubG93ID4+PiBudW1CaXRzKSxcbiAgICAgICAgdGhpcy51bnNpZ25lZCxcbiAgICAgICk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNyb3RhdGVSaWdodH0uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUucm90ciA9IExvbmdQcm90b3R5cGUucm90YXRlUmlnaHQ7XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gc2lnbmVkLlxuICAgICAqIEB0aGlzIHshTG9uZ31cbiAgICAgKiBAcmV0dXJucyB7IUxvbmd9IFNpZ25lZCBsb25nXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS50b1NpZ25lZCA9IGZ1bmN0aW9uIHRvU2lnbmVkKCkge1xuICAgICAgaWYgKCF0aGlzLnVuc2lnbmVkKSByZXR1cm4gdGhpcztcbiAgICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdywgdGhpcy5oaWdoLCBmYWxzZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byB1bnNpZ25lZC5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMgeyFMb25nfSBVbnNpZ25lZCBsb25nXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS50b1Vuc2lnbmVkID0gZnVuY3Rpb24gdG9VbnNpZ25lZCgpIHtcbiAgICAgIGlmICh0aGlzLnVuc2lnbmVkKSByZXR1cm4gdGhpcztcbiAgICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdywgdGhpcy5oaWdoLCB0cnVlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIGl0cyBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IGxlIFdoZXRoZXIgbGl0dGxlIG9yIGJpZyBlbmRpYW4sIGRlZmF1bHRzIHRvIGJpZyBlbmRpYW5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gQnl0ZSByZXByZXNlbnRhdGlvblxuICAgICAqL1xuICAgIExvbmdQcm90b3R5cGUudG9CeXRlcyA9IGZ1bmN0aW9uIHRvQnl0ZXMobGUpIHtcbiAgICAgIHJldHVybiBsZSA/IHRoaXMudG9CeXRlc0xFKCkgOiB0aGlzLnRvQnl0ZXNCRSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gaXRzIGxpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gTGl0dGxlIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS50b0J5dGVzTEUgPSBmdW5jdGlvbiB0b0J5dGVzTEUoKSB7XG4gICAgICB2YXIgaGkgPSB0aGlzLmhpZ2gsXG4gICAgICAgIGxvID0gdGhpcy5sb3c7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBsbyAmIDB4ZmYsXG4gICAgICAgIChsbyA+Pj4gOCkgJiAweGZmLFxuICAgICAgICAobG8gPj4+IDE2KSAmIDB4ZmYsXG4gICAgICAgIGxvID4+PiAyNCxcbiAgICAgICAgaGkgJiAweGZmLFxuICAgICAgICAoaGkgPj4+IDgpICYgMHhmZixcbiAgICAgICAgKGhpID4+PiAxNikgJiAweGZmLFxuICAgICAgICBoaSA+Pj4gMjQsXG4gICAgICBdO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gaXRzIGJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gQmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAgICovXG4gICAgTG9uZ1Byb3RvdHlwZS50b0J5dGVzQkUgPSBmdW5jdGlvbiB0b0J5dGVzQkUoKSB7XG4gICAgICB2YXIgaGkgPSB0aGlzLmhpZ2gsXG4gICAgICAgIGxvID0gdGhpcy5sb3c7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBoaSA+Pj4gMjQsXG4gICAgICAgIChoaSA+Pj4gMTYpICYgMHhmZixcbiAgICAgICAgKGhpID4+PiA4KSAmIDB4ZmYsXG4gICAgICAgIGhpICYgMHhmZixcbiAgICAgICAgbG8gPj4+IDI0LFxuICAgICAgICAobG8gPj4+IDE2KSAmIDB4ZmYsXG4gICAgICAgIChsbyA+Pj4gOCkgJiAweGZmLFxuICAgICAgICBsbyAmIDB4ZmYsXG4gICAgICBdO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgTG9uZyBmcm9tIGl0cyBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgICAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBieXRlcyBCeXRlIHJlcHJlc2VudGF0aW9uXG4gICAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IGxlIFdoZXRoZXIgbGl0dGxlIG9yIGJpZyBlbmRpYW4sIGRlZmF1bHRzIHRvIGJpZyBlbmRpYW5cbiAgICAgKiBAcmV0dXJucyB7TG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgICAqL1xuICAgIExvbmcuZnJvbUJ5dGVzID0gZnVuY3Rpb24gZnJvbUJ5dGVzKGJ5dGVzLCB1bnNpZ25lZCwgbGUpIHtcbiAgICAgIHJldHVybiBsZVxuICAgICAgICA/IExvbmcuZnJvbUJ5dGVzTEUoYnl0ZXMsIHVuc2lnbmVkKVxuICAgICAgICA6IExvbmcuZnJvbUJ5dGVzQkUoYnl0ZXMsIHVuc2lnbmVkKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIExvbmcgZnJvbSBpdHMgbGl0dGxlIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgICAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBieXRlcyBMaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAgICogQHJldHVybnMge0xvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICAgKi9cbiAgICBMb25nLmZyb21CeXRlc0xFID0gZnVuY3Rpb24gZnJvbUJ5dGVzTEUoYnl0ZXMsIHVuc2lnbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IExvbmcoXG4gICAgICAgIGJ5dGVzWzBdIHwgKGJ5dGVzWzFdIDw8IDgpIHwgKGJ5dGVzWzJdIDw8IDE2KSB8IChieXRlc1szXSA8PCAyNCksXG4gICAgICAgIGJ5dGVzWzRdIHwgKGJ5dGVzWzVdIDw8IDgpIHwgKGJ5dGVzWzZdIDw8IDE2KSB8IChieXRlc1s3XSA8PCAyNCksXG4gICAgICAgIHVuc2lnbmVkLFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIExvbmcgZnJvbSBpdHMgYmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgICAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBieXRlcyBCaWcgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAgICogQHJldHVybnMge0xvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICAgKi9cbiAgICBMb25nLmZyb21CeXRlc0JFID0gZnVuY3Rpb24gZnJvbUJ5dGVzQkUoYnl0ZXMsIHVuc2lnbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IExvbmcoXG4gICAgICAgIChieXRlc1s0XSA8PCAyNCkgfCAoYnl0ZXNbNV0gPDwgMTYpIHwgKGJ5dGVzWzZdIDw8IDgpIHwgYnl0ZXNbN10sXG4gICAgICAgIChieXRlc1swXSA8PCAyNCkgfCAoYnl0ZXNbMV0gPDwgMTYpIHwgKGJ5dGVzWzJdIDw8IDgpIHwgYnl0ZXNbM10sXG4gICAgICAgIHVuc2lnbmVkLFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gU3VwcG9ydCBjb252ZXJzaW9uIHRvL2Zyb20gQmlnSW50IHdoZXJlIGF2YWlsYWJsZVxuICAgIGlmICh0eXBlb2YgQmlnSW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiBiaWcgaW50ZWdlci5cbiAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIFRoZSBiaWcgaW50ZWdlciB2YWx1ZVxuICAgICAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgICAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAgICAgKi9cbiAgICAgIExvbmcuZnJvbUJpZ0ludCA9IGZ1bmN0aW9uIGZyb21CaWdJbnQodmFsdWUsIHVuc2lnbmVkKSB7XG4gICAgICAgIHZhciBsb3dCaXRzID0gTnVtYmVyKEJpZ0ludC5hc0ludE4oMzIsIHZhbHVlKSk7XG4gICAgICAgIHZhciBoaWdoQml0cyA9IE51bWJlcihCaWdJbnQuYXNJbnROKDMyLCB2YWx1ZSA+PiBCaWdJbnQoMzIpKSk7XG4gICAgICAgIHJldHVybiBmcm9tQml0cyhsb3dCaXRzLCBoaWdoQml0cywgdW5zaWduZWQpO1xuICAgICAgfTtcblxuICAgICAgLy8gT3ZlcnJpZGVcbiAgICAgIExvbmcuZnJvbVZhbHVlID0gZnVuY3Rpb24gZnJvbVZhbHVlV2l0aEJpZ0ludCh2YWx1ZSwgdW5zaWduZWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJiaWdpbnRcIikgcmV0dXJuIGZyb21CaWdJbnQodmFsdWUsIHVuc2lnbmVkKTtcbiAgICAgICAgcmV0dXJuIGZyb21WYWx1ZSh2YWx1ZSwgdW5zaWduZWQpO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBDb252ZXJ0cyB0aGUgTG9uZyB0byBpdHMgYmlnIGludGVnZXIgcmVwcmVzZW50YXRpb24uXG4gICAgICAgKiBAdGhpcyB7IUxvbmd9XG4gICAgICAgKiBAcmV0dXJucyB7YmlnaW50fVxuICAgICAgICovXG4gICAgICBMb25nUHJvdG90eXBlLnRvQmlnSW50ID0gZnVuY3Rpb24gdG9CaWdJbnQoKSB7XG4gICAgICAgIHZhciBsb3dCaWdJbnQgPSBCaWdJbnQodGhpcy5sb3cgPj4+IDApO1xuICAgICAgICB2YXIgaGlnaEJpZ0ludCA9IEJpZ0ludCh0aGlzLnVuc2lnbmVkID8gdGhpcy5oaWdoID4+PiAwIDogdGhpcy5oaWdoKTtcbiAgICAgICAgcmV0dXJuIChoaWdoQmlnSW50IDw8IEJpZ0ludCgzMikpIHwgbG93QmlnSW50O1xuICAgICAgfTtcbiAgICB9XG4gICAgdmFyIF9kZWZhdWx0ID0gKF9leHBvcnRzLmRlZmF1bHQgPSBMb25nKTtcbiAgfSxcbik7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIEhlbHBlcnMuXG5jb25zdCBzID0gMTAwMDtcbmNvbnN0IG0gPSBzICogNjA7XG5jb25zdCBoID0gbSAqIDYwO1xuY29uc3QgZCA9IGggKiAyNDtcbmNvbnN0IHcgPSBkICogNztcbmNvbnN0IHkgPSBkICogMzY1LjI1O1xuZnVuY3Rpb24gbXModmFsdWUsIG9wdGlvbnMpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2UodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucz8ubG9uZyA/IGZtdExvbmcodmFsdWUpIDogZm10U2hvcnQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgaXMgbm90IGEgc3RyaW5nIG9yIG51bWJlci4nKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBpc0Vycm9yKGVycm9yKVxuICAgICAgICAgICAgPyBgJHtlcnJvci5tZXNzYWdlfS4gdmFsdWU9JHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9YFxuICAgICAgICAgICAgOiAnQW4gdW5rbm93biBlcnJvciBoYXMgb2NjdXJlZC4nO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgfVxufVxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgIGlmIChzdHIubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgZXhjZWVkcyB0aGUgbWF4aW11bSBsZW5ndGggb2YgMTAwIGNoYXJhY3RlcnMuJyk7XG4gICAgfVxuICAgIGNvbnN0IG1hdGNoID0gL14oLT8oPzpcXGQrKT9cXC4/XFxkKykgKihtaWxsaXNlY29uZHM/fG1zZWNzP3xtc3xzZWNvbmRzP3xzZWNzP3xzfG1pbnV0ZXM/fG1pbnM/fG18aG91cnM/fGhycz98aHxkYXlzP3xkfHdlZWtzP3x3fHllYXJzP3x5cnM/fHkpPyQvaS5leGVjKHN0cik7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgICByZXR1cm4gTmFOO1xuICAgIH1cbiAgICBjb25zdCBuID0gcGFyc2VGbG9hdChtYXRjaFsxXSk7XG4gICAgY29uc3QgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICd5ZWFycyc6XG4gICAgICAgIGNhc2UgJ3llYXInOlxuICAgICAgICBjYXNlICd5cnMnOlxuICAgICAgICBjYXNlICd5cic6XG4gICAgICAgIGNhc2UgJ3knOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiB5O1xuICAgICAgICBjYXNlICd3ZWVrcyc6XG4gICAgICAgIGNhc2UgJ3dlZWsnOlxuICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgICAgIHJldHVybiBuICogdztcbiAgICAgICAgY2FzZSAnZGF5cyc6XG4gICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBkO1xuICAgICAgICBjYXNlICdob3Vycyc6XG4gICAgICAgIGNhc2UgJ2hvdXInOlxuICAgICAgICBjYXNlICdocnMnOlxuICAgICAgICBjYXNlICdocic6XG4gICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBoO1xuICAgICAgICBjYXNlICdtaW51dGVzJzpcbiAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgY2FzZSAnbWlucyc6XG4gICAgICAgIGNhc2UgJ21pbic6XG4gICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBtO1xuICAgICAgICBjYXNlICdzZWNvbmRzJzpcbiAgICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgICAgY2FzZSAnc2Vjcyc6XG4gICAgICAgIGNhc2UgJ3NlYyc6XG4gICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBzO1xuICAgICAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgICAgICBjYXNlICdtaWxsaXNlY29uZCc6XG4gICAgICAgIGNhc2UgJ21zZWNzJzpcbiAgICAgICAgY2FzZSAnbXNlYyc6XG4gICAgICAgIGNhc2UgJ21zJzpcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgb2NjdXIuXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSB1bml0ICR7dHlwZX0gd2FzIG1hdGNoZWQsIGJ1dCBubyBtYXRjaGluZyBjYXNlIGV4aXN0cy5gKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBtcztcbi8qKlxuICogU2hvcnQgZm9ybWF0IGZvciBgbXNgLlxuICovXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICAgIGNvbnN0IG1zQWJzID0gTWF0aC5hYnMobXMpO1xuICAgIGlmIChtc0FicyA+PSBkKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gZCl9ZGA7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBoKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gaCl9aGA7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBtKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gbSl9bWA7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBzKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gcyl9c2A7XG4gICAgfVxuICAgIHJldHVybiBgJHttc31tc2A7XG59XG4vKipcbiAqIExvbmcgZm9ybWF0IGZvciBgbXNgLlxuICovXG5mdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gICAgY29uc3QgbXNBYnMgPSBNYXRoLmFicyhtcyk7XG4gICAgaWYgKG1zQWJzID49IGQpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGQsICdkYXknKTtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IGgpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGgsICdob3VyJyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBtKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBtLCAnbWludXRlJyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBzKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBzLCAnc2Vjb25kJyk7XG4gICAgfVxuICAgIHJldHVybiBgJHttc30gbXNgO1xufVxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqL1xuZnVuY3Rpb24gcGx1cmFsKG1zLCBtc0FicywgbiwgbmFtZSkge1xuICAgIGNvbnN0IGlzUGx1cmFsID0gbXNBYnMgPj0gbiAqIDEuNTtcbiAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIG4pfSAke25hbWV9JHtpc1BsdXJhbCA/ICdzJyA6ICcnfWA7XG59XG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3IgZXJyb3JzLlxuICovXG5mdW5jdGlvbiBpc0Vycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgZXJyb3IgIT09IG51bGwgJiYgJ21lc3NhZ2UnIGluIGVycm9yO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0O1xuIiwiaW1wb3J0IHtwcm94eUFjdGl2aXRpZXMsIHdvcmtmbG93SW5mb30gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuXG5pbXBvcnQgdHlwZSB7Y3JlYXRlQWN0aXZpdGllc30gZnJvbSAnLi9hY3Rpdml0aWVzJztcbmltcG9ydCB0eXBlIHtFeHBvcnRXb3JrYm9va0FyZ3MsIEV4cG9ydFdvcmtib29rUmVzdWx0fSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFdvcmtib29rKHBhcmFtczogRXhwb3J0V29ya2Jvb2tBcmdzKTogUHJvbWlzZTxFeHBvcnRXb3JrYm9va1Jlc3VsdD4ge1xuICAgIGNvbnN0IHtmaW5pc2hFeHBvcnR9ID0gcHJveHlBY3Rpdml0aWVzPFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZUFjdGl2aXRpZXM+Pih7XG4gICAgICAgIC8vIFJldHJ5UG9saWN5IHNwZWNpZmllcyBob3cgdG8gYXV0b21hdGljYWxseSBoYW5kbGUgcmV0cmllcyBpZiBhbiBBY3Rpdml0eSBmYWlscy5cbiAgICAgICAgcmV0cnk6IHtcbiAgICAgICAgICAgIGluaXRpYWxJbnRlcnZhbDogJzEgc2Vjb25kJyxcbiAgICAgICAgICAgIG1heGltdW1JbnRlcnZhbDogJzEgbWludXRlJyxcbiAgICAgICAgICAgIGJhY2tvZmZDb2VmZmljaWVudDogMixcbiAgICAgICAgICAgIG1heGltdW1BdHRlbXB0czogNTAwLFxuICAgICAgICAgICAgLy8gbm9uUmV0cnlhYmxlRXJyb3JUeXBlczogWydJbnZhbGlkQWNjb3VudEVycm9yJywgJ0luc3VmZmljaWVudEZ1bmRzRXJyb3InXSxcbiAgICAgICAgfSxcbiAgICAgICAgc3RhcnRUb0Nsb3NlVGltZW91dDogJzEgbWludXRlJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHt3b3JrZmxvd0lkfSA9IHdvcmtmbG93SW5mbygpO1xuXG4gICAgYXdhaXQgZmluaXNoRXhwb3J0KHtleHBvcnRJZDogd29ya2Zsb3dJZH0pO1xuXG4gICAgcmV0dXJuIHtleHBvcnRJZDogd29ya2Zsb3dJZH07XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL2V4cG9ydC13b3JrYm9vayc7XG4iLCIvKiAoaWdub3JlZCkgKi8iLCIvKiAoaWdub3JlZCkgKi8iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiXG5jb25zdCBhcGkgPSByZXF1aXJlKCdAdGVtcG9yYWxpby93b3JrZmxvdy9saWIvd29ya2VyLWludGVyZmFjZS5qcycpO1xuZXhwb3J0cy5hcGkgPSBhcGk7XG5cbmNvbnN0IHsgb3ZlcnJpZGVHbG9iYWxzIH0gPSByZXF1aXJlKCdAdGVtcG9yYWxpby93b3JrZmxvdy9saWIvZ2xvYmFsLW92ZXJyaWRlcy5qcycpO1xub3ZlcnJpZGVHbG9iYWxzKCk7XG5cbmV4cG9ydHMuaW1wb3J0V29ya2Zsb3dzID0gZnVuY3Rpb24gaW1wb3J0V29ya2Zsb3dzKCkge1xuICByZXR1cm4gcmVxdWlyZSgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovIFwiL1VzZXJzL2VuZHVyYW5jZS93b3JrL2RhdGFsZW5zLXRyYW5zZmVyL3NyYy9jb21wb25lbnRzL3RlbXBvcmFsL3dvcmtmbG93cy9pbmRleC50c1wiKTtcbn1cblxuZXhwb3J0cy5pbXBvcnRJbnRlcmNlcHRvcnMgPSBmdW5jdGlvbiBpbXBvcnRJbnRlcmNlcHRvcnMoKSB7XG4gIHJldHVybiBbXG4gICAgXG4gIF07XG59XG4iXSwibmFtZXMiOlsicHJveHlBY3Rpdml0aWVzIiwid29ya2Zsb3dJbmZvIiwiZXhwb3J0V29ya2Jvb2siLCJwYXJhbXMiLCJmaW5pc2hFeHBvcnQiLCJyZXRyeSIsImluaXRpYWxJbnRlcnZhbCIsIm1heGltdW1JbnRlcnZhbCIsImJhY2tvZmZDb2VmZmljaWVudCIsIm1heGltdW1BdHRlbXB0cyIsInN0YXJ0VG9DbG9zZVRpbWVvdXQiLCJ3b3JrZmxvd0lkIiwiZXhwb3J0SWQiXSwic291cmNlUm9vdCI6IiJ9