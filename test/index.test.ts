import { describe, expect, test } from 'bun:test';
import app from '../src/server';

describe('Healthcheck', () => {
    test('Should return 200 Response', async () => {
        const req = new Request('http://localhost/');
        const res = await app.fetch(req);
        expect(res.status).toBe(200);
    });

    test('Should return success message', async () => {
        const req = new Request('http://localhost/');
        const res = await app.fetch(req);
        const body = await res.json();
        expect(body).toEqual({ success: true, message: 'OK' });
    });

    test('Should return 404 Response', async () => {
        const req = new Request('http://localhost/not-found');
        const res = await app.fetch(req);
        expect(res.status).toBe(404);
    });
});
