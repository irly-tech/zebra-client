import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { ZebraClient } from '../client.js';
import { LogProvider, LogLevel } from './types.js';
import { ConsoleLogProvider } from './console.js';
import { NoopLogProvider } from './noop.js';

describe('Logging', () => {
    describe('ConsoleLogProvider', () => {
        it('should call console methods for each log level', () => {
            const provider = new ConsoleLogProvider();

            const debugSpy = mock.method(console, 'debug', () => { });
            const infoSpy = mock.method(console, 'info', () => { });
            const warnSpy = mock.method(console, 'warn', () => { });
            const errorSpy = mock.method(console, 'error', () => { });

            provider.log('debug', 'debug message', { extra: 'data' });
            provider.log('info', 'info message');
            provider.log('warn', 'warn message');
            provider.log('error', 'error message');

            assert.strictEqual(debugSpy.mock.callCount(), 1);
            assert.strictEqual(infoSpy.mock.callCount(), 1);
            assert.strictEqual(warnSpy.mock.callCount(), 1);
            assert.strictEqual(errorSpy.mock.callCount(), 1);

            debugSpy.mock.restore();
            infoSpy.mock.restore();
            warnSpy.mock.restore();
            errorSpy.mock.restore();
        });
    });

    describe('NoopLogProvider', () => {
        it('should not throw when called', () => {
            const provider = new NoopLogProvider();
            assert.doesNotThrow(() => {
                provider.log('debug', 'test');
                provider.log('info', 'test');
                provider.log('warn', 'test');
                provider.log('error', 'test');
            });
        });
    });

    describe('ZebraClient with custom LogProvider', () => {
        it('should use custom log provider when provided', async () => {
            const logs: { level: LogLevel; message: string; args: unknown[] }[] = [];

            const customProvider: LogProvider = {
                log(level, message, ...args) {
                    logs.push({ level, message, args });
                },
            };

            const client = new ZebraClient({
                apiKey: 'test-key',
                logProvider: customProvider,
                fetch: async () => new Response(JSON.stringify({ data: 'test' }), { status: 200 }),
            });

            await client.request('test.operation', 'test-endpoint');

            assert.strictEqual(logs.length, 1);
            assert.strictEqual(logs[0].level, 'debug');
            assert.ok(logs[0].message.includes('Final URL'));
        });

        it('should expose log provider on client instance', () => {
            const customProvider: LogProvider = {
                log() { },
            };

            const client = new ZebraClient({
                apiKey: 'test-key',
                logProvider: customProvider,
            });

            assert.strictEqual(client.log, customProvider);
        });

        it('should use ConsoleLogProvider by default', () => {
            const client = new ZebraClient({ apiKey: 'test-key' });
            assert.ok(client.log instanceof ConsoleLogProvider);
        });

        it('should silence logs with NoopLogProvider', async () => {
            const consoleSpy = mock.method(console, 'debug', () => { });

            const client = new ZebraClient({
                apiKey: 'test-key',
                logProvider: new NoopLogProvider(),
                fetch: async () => new Response(JSON.stringify({ data: 'test' }), { status: 200 }),
            });

            await client.request('test.operation', 'test-endpoint');

            assert.strictEqual(consoleSpy.mock.callCount(), 0);
            consoleSpy.mock.restore();
        });
    });
});
