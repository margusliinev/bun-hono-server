import { describe, expect, test } from 'bun:test';
import app from '../../../src/server';

describe('Users', () => {
    test('Unauthenticed Request', async () => {
        const req = new Request('http://localhost/api/users');

        const res = await app.fetch(req);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body).toEqual({ success: false, message: 'Unauthenticated' });
    });
});
