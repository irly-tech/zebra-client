import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ZebraClient } from '../client.js';
import { SensorStatus, SensorListResponse } from '../types.js';

describe('SensorsAPI', () => {
    test('getStatus should return sensor when single match found', async () => {
        const mockSensor: SensorStatus = {
            serial_number: 'SN12345',
            battery_level: 85,
            signal_strength: -60,
            last_seen: '2024-01-01T00:00:00Z',
            firmware_version: '1.0.0',
        };

        const mockResponse: SensorListResponse = {
            sensors: [mockSensor],
            page_response: {
                total_pages: 1,
                page_size: 10,
                current_page: 1,
            },
        };

        const mockFetch = async (url: string) => {
            assert.ok(url.includes('text_filter=SN12345'));
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.sensors.getStatus('SN12345');
        assert.deepStrictEqual(result, mockSensor);
    });

    test('getStatus should throw error when no sensors found', async () => {
        const mockResponse: SensorListResponse = {
            sensors: [],
            page_response: {
                total_pages: 0,
                page_size: 10,
                current_page: 1,
            },
        };

        const mockFetch = async () => {
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        await assert.rejects(
            async () => await client.sensors.getStatus('UNKNOWN'),
            {
                message: 'No sensor found with serial number: UNKNOWN',
            }
        );
    });

    test('getStatus should return first sensor when multiple matches found', async () => {
        const mockSensor1: SensorStatus = {
            serial_number: 'SN12345',
            battery_level: 85,
            signal_strength: -60,
            last_seen: '2024-01-01T00:00:00Z',
        };

        const mockSensor2: SensorStatus = {
            serial_number: 'SN12345-DUPLICATE',
            battery_level: 70,
            signal_strength: -70,
            last_seen: '2024-01-01T00:00:00Z',
        };

        const mockResponse: SensorListResponse = {
            sensors: [mockSensor1, mockSensor2],
            page_response: {
                total_pages: 1,
                page_size: 10,
                current_page: 1,
            },
        };

        const mockFetch = async () => {
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.sensors.getStatus('SN12345');
        assert.deepStrictEqual(result, mockSensor1);
    });

    test('getStatus should construct correct URL with text_filter parameter', async () => {
        let capturedUrl = '';

        const mockResponse: SensorListResponse = {
            sensors: [{
                serial_number: 'TEST',
                battery_level: 100,
                signal_strength: -50,
                last_seen: '2024-01-01T00:00:00Z',
            }],
            page_response: {
                total_pages: 1,
                page_size: 10,
                current_page: 1,
            },
        };

        const mockFetch = async (url: string) => {
            capturedUrl = url;
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        await client.sensors.getStatus('TEST-SERIAL');
        assert.ok(capturedUrl.includes('devices/environmental-sensors'));
        assert.ok(capturedUrl.includes('text_filter=TEST-SERIAL'));
    });

    test('register should register a sensor by serial number', async () => {
        const mockRegistration = {
            id: 'sensor-id-123',
            serial_number: 'SENSOR-SERIAL-123',
            mac_address: '00:11:22:33:44:55',
            enrolled_at: '2024-01-01T00:00:00Z',
        };

        let capturedBody: any;

        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('devices/sensor-enrollments'));
            assert.strictEqual(options.method, 'POST');
            capturedBody = JSON.parse(options.body);
            return new Response(JSON.stringify(mockRegistration), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.sensors.register('SENSOR-SERIAL-123');

        assert.deepStrictEqual(result, mockRegistration);
        assert.strictEqual(capturedBody.serial_number, 'SENSOR-SERIAL-123');
    });

    test('unregister should remove a sensor by serial number', async () => {
        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('devices/sensor-enrollments/SENSOR-SERIAL-123'));
            assert.strictEqual(options.method, 'DELETE');
            return new Response('', { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        await client.sensors.unregister('SENSOR-SERIAL-123');
    });

    test('listEnrolled should list enrolled sensors with pagination', async () => {
        const mockResponse = {
            sensors: [
                {
                    id: 'sensor-1',
                    serial_number: 'SN-001',
                    mac_address: '00:11:22:33:44:55',
                    battery_level: 85,
                    model: 'ZS100',
                },
                {
                    id: 'sensor-2',
                    serial_number: 'SN-002',
                    mac_address: '00:11:22:33:44:66',
                    battery_level: 90,
                    model: 'ZS100',
                },
            ],
        };

        const mockFetch = async (url: string) => {
            assert.ok(url.includes('devices/environmental-sensors'));
            assert.ok(url.includes('page.page=0'));
            assert.ok(url.includes('page.size=100'));
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.sensors.listEnrolled({ page: 0, pageSize: 100 });

        assert.deepStrictEqual(result, mockResponse);
        assert.strictEqual(result.sensors.length, 2);
    });

    test('triggerRead should request immediate reading', async () => {
        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('devices/environmental-sensors/sensor-uuid/readings'));
            assert.strictEqual(options.method, 'POST');
            return new Response('', { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        await client.sensors.triggerRead('sensor-uuid');
    });
});
