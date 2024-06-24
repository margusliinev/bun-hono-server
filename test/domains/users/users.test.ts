import { describe, expect, test, beforeAll } from 'bun:test';
import app from '../../../src/server';

async function getSessionCookie() {
    const authResponse = await app.fetch(
        new Request('http://localhost/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'johndoe@gmail.com', password: 'johndoe123' })
        })
    );

    const cookies = authResponse.headers.get('set-cookie');
    return cookies;
}

describe('Users Domain', async () => {
    describe('Get Users', () => {
        let sessionCookie: string | null;

        beforeAll(async () => {
            sessionCookie = await getSessionCookie();
        });

        test('Should return 200 response when session cookie is provided', async () => {
            const req = new Request('http://localhost/api/users', {
                headers: {
                    cookie: `${sessionCookie}`
                }
            });

            const res = await app.fetch(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.data).toHaveLength(20);
        });

        test('Should return 401 response when session cookie is not provided', async () => {
            const req = new Request('http://localhost/api/users');

            const res = await app.fetch(req);
            const body = await res.json();

            expect(res.status).toBe(401);
            expect(body).toEqual({ success: false, message: 'Unauthenticated' });
        });
    });

    describe('Get Current User', () => {
        let sessionCookie: string | null;

        beforeAll(async () => {
            sessionCookie = await getSessionCookie();
        });

        test('Should return 200 response when session cookie is provided', async () => {
            const req = new Request('http://localhost/api/users/me', {
                headers: {
                    cookie: `${sessionCookie}`
                }
            });

            const res = await app.fetch(req);
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.data.username).toEqual('johndoe');
        });

        test('Should return 401 response when session cookie is not provided', async () => {
            const req = new Request('http://localhost/api/users/me');

            const res = await app.fetch(req);
            const body = await res.json();

            expect(res.status).toBe(401);
            expect(body).toEqual({ success: false, message: 'Unauthenticated' });
        });
    });
});
