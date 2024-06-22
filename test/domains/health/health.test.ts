import { describe, expect, test } from 'bun:test';
import app from '../../../src/server';

describe('Health', () => {
    test('Should return 200 Response', async () => {
        const req = new Request('http://localhost/api/health/ok');

        const res = await app.fetch(req);

        expect(res.status).toBe(200);
    });

    test('Should return 404 Response', async () => {
        const req = new Request('http://localhost/api/health/fail');

        const res = await app.fetch(req);

        expect(res.status).toBe(404);
    });
});
