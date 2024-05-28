import { describe, expect, it } from 'bun:test';
import app from '../src';

describe('My first test', () => {
    it('Should return 200 Response', async () => {
        const req = new Request('http://localhost/');
        const res = await app.fetch(req);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ success: true, message: 'Hello World' });
    });
});
