import { trace, metrics, Span, SpanStatusCode, Tracer, Meter } from '@opentelemetry/api';
import { TelemetryProvider, RequestContext, RequestResult } from '@irly-tech/zebra-client';

export interface OTelTelemetryProviderConfig {
    tracer?: Tracer;
    meter?: Meter;
    metricPrefix?: string;
    defaultAttributes?: Record<string, string | number | boolean>;
}

export class OTelTelemetryProvider implements TelemetryProvider {
    private tracer: Tracer;
    private meter: Meter;
    private metricPrefix: string;
    private defaultAttributes: Record<string, string | number | boolean>;
    private spans = new Map<string, Span>();

    private requestCounter;
    private durationHistogram;
    private errorCounter;
    private rateLimitCounter;
    private retryCounter;

    constructor(config: OTelTelemetryProviderConfig = {}) {
        this.tracer = config.tracer || trace.getTracer('@irly-tech/zebra-client');
        this.meter = config.meter || metrics.getMeter('@irly-tech/zebra-client');
        this.metricPrefix = config.metricPrefix || 'zebra_api';
        this.defaultAttributes = config.defaultAttributes || {};

        const prefix = this.metricPrefix ? `${this.metricPrefix}_` : '';

        this.requestCounter = this.meter.createCounter(`${prefix}requests_total`, {
            description: 'Total number of Zebra API requests',
        });

        this.durationHistogram = this.meter.createHistogram(`${prefix}request_duration_ms`, {
            description: 'Request latency distribution',
            unit: 'ms',
        });

        this.errorCounter = this.meter.createCounter(`${prefix}errors_total`, {
            description: 'Total number of failed Zebra API requests',
        });

        this.rateLimitCounter = this.meter.createCounter(`${prefix}rate_limits_total`, {
            description: 'Number of rate limit hits',
        });

        this.retryCounter = this.meter.createCounter(`${prefix}retries_total`, {
            description: 'Number of retry attempts',
        });
    }

    onRequestStart(context: RequestContext): void {
        const span = this.tracer.startSpan(context.operationName, {
            attributes: {
                ...this.defaultAttributes,
                ...context.attributes,
                'http.method': context.method,
                'http.url': context.endpoint,
                'http.route': context.route || context.endpoint,
                'zebra.operation': context.operationName,
            },
        });

        // We use a simple composite key for tracking spans in progress
        const key = `${context.operationName}-${context.startTime}`;
        this.spans.set(key, span);

        this.requestCounter.add(1, {
            ...this.defaultAttributes,
            'zebra.operation': context.operationName,
            'http.route': context.route || context.endpoint,
        });
    }

    onRequestEnd(context: RequestContext, result: RequestResult): void {
        const key = `${context.operationName}-${context.startTime}`;
        const span = this.spans.get(key);

        if (span) {
            span.setAttribute('http.status_code', result.statusCode);
            span.setAttribute('zebra.retry_count', result.retryCount);
            span.setAttribute('zebra.rate_limited', result.rateLimited);

            if (result.success) {
                span.setStatus({ code: SpanStatusCode.OK });
            } else {
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: result.error?.message,
                });
                if (result.error) {
                    span.recordException(result.error);
                }
                this.errorCounter.add(1, {
                    ...this.defaultAttributes,
                    'zebra.operation': context.operationName,
                    'http.route': context.route || context.endpoint,
                    'http.status_code': result.statusCode,
                    'error.type': result.error?.name || 'Error',
                });
            }

            span.end();
            this.spans.delete(key);
        }

        this.durationHistogram.record(result.duration, {
            ...this.defaultAttributes,
            'zebra.operation': context.operationName,
            'http.route': context.route || context.endpoint,
            'http.status_code': result.statusCode,
        });
    }

    onRateLimitHit(context: RequestContext, retryAfter?: number): void {
        const key = `${context.operationName}-${context.startTime}`;
        const span = this.spans.get(key);

        if (span) {
            span.addEvent('rate_limit_hit', {
                'retry_after': retryAfter,
            });
        }

        this.rateLimitCounter.add(1, {
            ...this.defaultAttributes,
            'zebra.operation': context.operationName,
        });
    }

    onRetry(context: RequestContext, attempt: number, reason: string): void {
        const key = `${context.operationName}-${context.startTime}`;
        const span = this.spans.get(key);

        if (span) {
            span.addEvent('retry', {
                'attempt': attempt,
                'reason': reason,
            });
        }

        this.retryCounter.add(1, {
            ...this.defaultAttributes,
            'zebra.operation': context.operationName,
            'retry.attempt': attempt,
        });
    }
}
