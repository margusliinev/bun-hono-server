import { describe, expect, test } from 'bun:test';
import app from '../../../src/server';

describe('Perform Healthcheck', () => {
    test('Should return 200 response when url is correct', async () => {
        const req = new Request('http://localhost/api/health/ok');

        const res = await app.fetch(req);

        expect(res.status).toBe(200);
    });

    test('Should return 404 response when url is incorrect', async () => {
        const req = new Request('http://localhost/api/health/fail');

        const res = await app.fetch(req);

        expect(res.status).toBe(404);
    });
});
