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

describe('Auth Domain', async () => {
    describe('User Registration', () => {
        describe('Username Validation', () => {
            test('Should fail when username is not provided', async () => {
                const req = registerUser({ email: 'johndoe@gmail.com', password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Username is required' });
            });

            test('Should fail when username is not a string', async () => {
                const req = registerUser({ username: 5, email: 'johndoe@gmail.com', password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Username is invalid' });
            });

            test('Should fail when username is less than 3 characters', async () => {
                const req = registerUser({ username: 'jo', email: 'johndoe@gmail.com', password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Username must be between 3 and 39 characters' });
            });

            test('Should fail when username is more than 39 characters', async () => {
                const req = registerUser({ username: 'johndoejohndoejohndoejohndoejohndoejohndoejohndoe', email: 'johndoe@gmail.com', password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Username must be between 3 and 39 characters' });
            });

            test('Should fail when username starts with a hyphen', async () => {
                const req = registerUser({ username: '-johndoe', email: 'johndoe@gmail.com', password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Username cannot start or end with a hyphen' });
            });

            test('Should fail when username ends with a hyphen', async () => {
                const req = registerUser({ username: 'johndoe-', email: 'johndoe@gmail.com', password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Username cannot start or end with a hyphen' });
            });

            test('Should fail when username contains invalid characters', async () => {
                const req = registerUser({ username: 'johndoe@', email: 'johndoe@gmail.com', password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Username can only contain letters (A-Z), numbers (0-9), and hyphens (-)' });
            });

            test('Should fail when username is already in use', async () => {
                const req = registerUser({ username: 'johndoe', email: 'johndoe@gmail.com', password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Username already exists' });
            });
        });
        describe('Email Validation', () => {
            test('Should fail when email is not provided', async () => {
                const req = registerUser({ username: 'johndoe', password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Email is required' });
            });

            test('Should fail when email is not a string', async () => {
                const req = registerUser({ username: 'johndoe', email: 5, password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Email is invalid' });
            });

            test('Should fail when email is invalid', async () => {
                const req = registerUser({ username: 'johndoe', email: 'johndoegmail.com', password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Email is invalid' });
            });

            test('Should fail when email is already in use', async () => {
                const req = registerUser({ username: 'johndoe1', email: 'johndoe@gmail.com', password: 'johndoe123' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Email already exists' });
            });
        });
        describe('Password Validation', () => {
            test('Should fail when password is not provided', async () => {
                const req = registerUser({ username: 'johndoe', email: 'johndoe@gmail.com' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Password is required' });
            });

            test('Should fail when password is not a string', async () => {
                const req = registerUser({ username: 'johndoe', email: 'johndoe@gmail.com', password: 12345678 });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Password is invalid' });
            });

            test('Should fail when password is less than 8 characters', async () => {
                const req = registerUser({ username: 'johndoe', email: 'johndoe@gmail.com', password: 'johndoe' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Password must be at least 8 characters' });
            });

            test('Should fail when password does not contain a number', async () => {
                const req = registerUser({ username: 'johndoe', email: 'johndoe@gmail.com', password: 'megajohndoe' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Password must contain at least one number' });
            });

            test('Should fail when password does not contain a letter', async () => {
                const req = registerUser({ username: 'johndoe', email: 'johndoe@gmail.com', password: '12345678' });

                const res = await app.fetch(req);
                const body = await res.json();

                expect(res.status).toBe(400);
                expect(body).toEqual({ success: false, message: 'Password must contain at least one letter' });
            });
        });
    });
});
