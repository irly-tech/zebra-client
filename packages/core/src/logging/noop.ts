import { LogProvider } from './types.js';

/**
 * A no-operation logging provider that discards all log messages.
 *
 * Use this when you want to silence all logging from the Zebra client.
 */
export class NoopLogProvider implements LogProvider {
    log(): void { }
}
