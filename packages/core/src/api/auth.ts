import { ZebraClient } from '../client.js';
import { ZSFinderTokenResponse } from '../types.js';

export class AuthAPI {
    constructor(private client: ZebraClient) { }

    async createZSFinderToken(): Promise<ZSFinderTokenResponse> {
        return this.client.request<ZSFinderTokenResponse>(
            'auth.createZSFinderToken',
            'devices/credentials/token',
            { method: 'POST' },
            'devices/credentials/token'
        );
    }
}
