#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { ZebraClient } from '../client.js';

async function main() {
    const { values, positionals } = parseArgs({
        options: {
            'api-key': {
                type: 'string',
                short: 'k',
            },
            'base-url': {
                type: 'string',
                short: 'u',
            },
            'help': {
                type: 'boolean',
                short: 'h',
            },
        },
        allowPositionals: true,
    });

    if (values.help || positionals.length === 0) {
        console.log(`
Usage: zebra-harness [options] <command> [args...]

Commands:
  list-sensors          List all sensors
  get-sensor <id>       Get status for a specific sensor
  list-alarms <taskId>  List active alarms for a task
  get-readings <taskId> <sensorTaskId> <startTime>
                        Get readings for a sensor (startTime as ISO string)
  list-tasks            List all tasks
  get-task <taskId>     Get details for a specific task
  get-auth-token        Get an authentication token (ZSFinder)

Options:
  -k, --api-key     Zebra API Key (or set ZEBRA_API_KEY env var)
  -u, --base-url    Zebra API Base URL (or set ZEBRA_BASE_URL env var)
  -h, --help        Show this help message

Note: If running via npm, use -- to separate npm arguments from harness arguments:
  npm run -w @irly-tech/zebra-client harness -- --api-key=YOUR_KEY list-sensors
        `);
        process.exit(0);
    }

    const apiKey = values['api-key'] || process.env.ZEBRA_API_KEY;
    if (!apiKey) {
        console.error('Error: --api-key is required (or set ZEBRA_API_KEY environment variable)');
        console.error('If running via npm, remember to use -- before arguments:');
        console.error('  npm run -w @irly-tech/zebra-client harness -- --api-key=... list-sensors');
        process.exit(1);
    }

    const client = new ZebraClient({
        apiKey,
        baseUrl: values['base-url'] || process.env.ZEBRA_BASE_URL,
    });

    const [command, ...args] = positionals;

    try {
        let result: any;
        switch (command) {
            case 'list-sensors':
                result = await client.sensors.list();
                break;
            case 'get-sensor':
                if (!args[0]) throw new Error('Sensor serial number is required');
                result = await client.sensors.getStatus(args[0]);
                break;
            case 'list-alarms':
                if (!args[0]) throw new Error('Task ID is required');
                result = await client.alarms.list({ taskId: args[0] });
                break;
            case 'get-readings':
                if (!args[0] || !args[1] || !args[2]) {
                    throw new Error('Usage: get-readings <taskId> <sensorTaskId> <startTime>');
                }
                result = await client.readings.getLog({
                    taskId: args[0],
                    sensorTaskId: args[1],
                    startTime: new Date(args[2]),
                });
                break;
            case 'list-tasks':
                result = await client.tasks.list({});
                break;
            case 'get-task':
                if (!args[0]) throw new Error('Task ID is required');
                result = await client.tasks.get(args[0]);
                break;
            case 'get-auth-token':
                result = await client.auth.createZSFinderToken();
                break;
            default:
                console.error(`Unknown command: ${command}`);
                process.exit(1);
        }

        console.log(JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error(`Error executing ${command}:`, error.message);
        if (error.statusCode) {
            console.error(`Status Code: ${error.statusCode}`);
        }
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
