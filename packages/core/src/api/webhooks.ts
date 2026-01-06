import { ZebraClient } from '../client.js';
import { CreateWebhookSubscriptionOptions, WebhookSubscription } from '../types.js';

/**
 * API for managing webhook subscriptions for environmental events.
 *
 * Use this API to register for real-time notifications about temperature excursions
 * and other sensor-related events.
 */
export class WebhooksAPI {
    constructor(private client: ZebraClient) { }

    /**
     * Registers a new webhook subscription.
     *
     * @param options - Configuration for the webhook subscription.
     * @returns A promise that resolves to the created subscription details.
     */
    async register(options: CreateWebhookSubscriptionOptions): Promise<WebhookSubscription> {
        return this.client.request<WebhookSubscription>(
            'webhooks.register',
            'subscription',
            {
                method: 'POST',
                body: JSON.stringify(options),
            },
            'subscription'
        );
    }

    /**
     * Lists all active webhook subscriptions for the tenant.
     *
     * @returns A promise that resolves to an array of webhook subscriptions.
     */
    async list(): Promise<WebhookSubscription[]> {
        return this.client.request<WebhookSubscription[]>(
            'webhooks.list',
            'subscription',
            { method: 'GET' },
            'subscription'
        );
    }

    /**
     * Stops (pauses) a webhook subscription.
     *
     * @param subscriptionId - The unique identifier of the subscription to stop.
     * @returns A promise that resolves when the subscription is stopped.
     */
    async stop(subscriptionId: string): Promise<void> {
        await this.client.request<void>(
            'webhooks.stop',
            `subscription/${subscriptionId}/stop`,
            { method: 'POST' },
            'subscription/:id/stop'
        );
    }

    /**
     * Starts (resumes) a stopped webhook subscription.
     *
     * @param subscriptionId - The unique identifier of the subscription to start.
     * @returns A promise that resolves when the subscription is started.
     */
    async start(subscriptionId: string): Promise<void> {
        await this.client.request<void>(
            'webhooks.start',
            `subscription/${subscriptionId}/start`,
            { method: 'POST' },
            'subscription/:id/start'
        );
    }

    /**
     * Deletes a webhook subscription.
     *
     * @param subscriptionId - The unique identifier of the subscription to delete.
     * @returns A promise that resolves when the subscription is deleted.
     */
    async delete(subscriptionId: string): Promise<void> {
        await this.client.request<void>(
            'webhooks.delete',
            `subscription/${subscriptionId}`,
            { method: 'DELETE' },
            'subscription/:id'
        );
    }
}
