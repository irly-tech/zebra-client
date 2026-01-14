/**
 * Log levels supported by the logging provider.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Interface for logging providers.
 *
 * Implement this interface to integrate with your own logging system
 * (e.g., Google Cloud Logging, Winston, Pino, etc.).
 *
 * @example
 * ```typescript
 * import { LogProvider, LogLevel } from '@irly-tech/zebra-client';
 *
 * class MyLogProvider implements LogProvider {
 *     log(level: LogLevel, message: string, ...args: unknown[]): void {
 *         myLogger[level](message, ...args);
 *     }
 * }
 * ```
 */
export interface LogProvider {
    /**
     * Logs a message at the specified level.
     *
     * @param level - The severity level of the log message.
     * @param message - The log message.
     * @param args - Additional arguments to log (similar to console.log).
     */
    log(level: LogLevel, message: string, ...args: unknown[]): void;
}
