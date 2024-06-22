import { describe, expect, test } from 'bun:test';
import app from '../../../src/server';

const registerUser = (body: object) => {
    return new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

describe('Auth', () => {
    test('Username is required', async () => {
        const req = registerUser({ email: 'johndoe@gmail.com', password: 'johndoe123' });

        const res = await app.fetch(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body).toEqual({ success: false, message: 'Username is required' });
    });

    test('Email is required', async () => {
        const req = registerUser({ username: 'johndoe', password: 'johndoe123' });

        const res = await app.fetch(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body).toEqual({ success: false, message: 'Email is required' });
    });

    test('Password is required', async () => {
        const req = registerUser({ username: 'johndoe', email: 'johndoe@gmail.com' });

        const res = await app.fetch(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body).toEqual({ success: false, message: 'Password is required' });
    });

    test('Username already exists', async () => {
        const req = registerUser({ username: 'johndoe', email: 'johndoe@gmail.com', password: 'johndoe123' });

        const res = await app.fetch(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body).toEqual({ success: false, message: 'Username already exists' });
    });

    test('Email already exists', async () => {
        const req = registerUser({ username: 'johndoe1', email: 'johndoe@gmail.com', password: 'johndoe123' });

        const res = await app.fetch(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body).toEqual({ success: false, message: 'Email already exists' });
    });
});
