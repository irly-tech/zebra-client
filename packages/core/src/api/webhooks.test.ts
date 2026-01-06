import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ZebraClient } from '../client.js';
import { CreateWebhookSubscriptionOptions, WebhookSubscription } from '../types.js';

describe('WebhooksAPI', () => {
    test('register should create a webhook subscription', async () => {
        const mockSubscription: WebhookSubscription = {
            id: 'sub-123',
            webhookUrl: 'https://example.com/webhook',
            name: 'Test Webhook',
            status: 'ACTIVE',
        };

        let capturedBody: any;

        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('subscription'));
            assert.strictEqual(options.method, 'POST');
            capturedBody = JSON.parse(options.body);
            return new Response(JSON.stringify(mockSubscription), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const options: CreateWebhookSubscriptionOptions = {
            webhookUrl: 'https://example.com/webhook',
            name: 'Test Webhook',
        };

        const result = await client.webhooks.register(options);

        assert.deepStrictEqual(result, mockSubscription);
        assert.strictEqual(capturedBody.webhookUrl, 'https://example.com/webhook');
    });

    test('list should retrieve all active subscriptions', async () => {
        const mockSubscriptions: WebhookSubscription[] = [
            {
                id: 'sub-1',
                webhookUrl: 'https://example.com/1',
                name: 'Webhook 1',
                status: 'ACTIVE',
            },
        ];

        const mockFetch = async (url: string) => {
            assert.ok(url.includes('subscription'));
            return new Response(JSON.stringify(mockSubscriptions), { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        const result = await client.webhooks.list();
        assert.deepStrictEqual(result, mockSubscriptions);
    });

    test('stop should pause a subscription', async () => {
        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('subscription/sub-123/stop'));
            assert.strictEqual(options.method, 'POST');
            return new Response('', { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        await client.webhooks.stop('sub-123');
    });

    test('start should resume a subscription', async () => {
        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('subscription/sub-123/start'));
            assert.strictEqual(options.method, 'POST');
            return new Response('', { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        await client.webhooks.start('sub-123');
    });

    test('delete should remove a subscription', async () => {
        const mockFetch = async (url: string, options: any) => {
            assert.ok(url.includes('subscription/sub-123'));
            assert.strictEqual(options.method, 'DELETE');
            return new Response('', { status: 200 });
        };

        const client = new ZebraClient({
            apiKey: 'test-key',
            fetch: mockFetch as any,
        });

        await client.webhooks.delete('sub-123');
    });
});
