import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ZebraClient } from '../client.js';
import { ZSFinderTokenResponse } from '../types.js';

describe('AuthAPI', () => {
    test('createZSFinderToken should create token for ZSFinder app', async () => {
        const mockResponse: ZSFinderTokenResponse = {
            token: 'zsfinder-token-abc123',
            expires_at: '2024-12-31T23:59:59Z',
        };

        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('devices/credentials/token'));
            assert.strictEqual(options.method, 'POST');
            return new Response(JSON.stringify(mockResponse), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.auth.createZSFinderToken();

        assert.deepStrictEqual(result, mockResponse);
        assert.strictEqual(result.token, 'zsfinder-token-abc123');
    });
});
