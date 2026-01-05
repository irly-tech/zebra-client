import { ZebraClient } from '../client.js';
import { ZSFinderTokenResponse } from '../types.js';

/**
 * API for authentication and token management.
 */
export class AuthAPI {
    constructor(private client: ZebraClient) { }

    /**
     * Generates a short-lived token for Zebra SmartFinder (ZSFinder) integration.
     * This token can be used by mobile apps or other clients to authenticate with the ZSFinder service.
     *
     * @returns A promise that resolves to the token response.
     */
    async createZSFinderToken(): Promise<ZSFinderTokenResponse> {
        return this.client.request<ZSFinderTokenResponse>(
            'auth.createZSFinderToken',
            'devices/credentials/token',
            { method: 'POST' },
            'devices/credentials/token'
        );
    }
}
