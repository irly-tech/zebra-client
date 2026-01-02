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
});
