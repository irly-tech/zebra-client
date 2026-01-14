import { LogProvider, LogLevel } from './types.js';

/**
 * Default logging provider that outputs to the console.
 *
 * This is the default logger used by the Zebra client if no custom
 * log provider is specified.
 */
export class ConsoleLogProvider implements LogProvider {
    log(level: LogLevel, message: string, ...args: unknown[]): void {
        switch (level) {
            case 'debug':
                console.debug(message, ...args);
                break;
            case 'info':
                console.info(message, ...args);
                break;
            case 'warn':
                console.warn(message, ...args);
                break;
            case 'error':
                console.error(message, ...args);
                break;
            default:
                console.log(message, ...args);
                break;
        }
    }
}
