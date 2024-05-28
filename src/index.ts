import { createUser, getUserByEmail, getUserByUsername } from './models/user';
import { createSession } from './models/session';
import { zValidator } from '@hono/zod-validator';
import { setSignedCookie } from 'hono/cookie';
import { usersTable } from './db/schema';
import { logger } from 'hono/logger';
import { Hono } from 'hono';
import { db } from './db';
import { z } from 'zod';

if (!process.env.PORT) throw new Error('PORT is not defined');

const registerSchema = z.object({
    username: z
        .string({ invalid_type_error: 'Username is invalid' })
        .min(3, { message: 'Username must be between 3 and 39 characters' })
        .max(39, { message: 'Username must be between 3 and 39 characters' })
        .regex(/^[^-].*[^-]$/, { message: 'Username cannot start or end with a hyphen' })
        .regex(/^[a-zA-Z0-9-]+$/, { message: 'Username can only contain letters (A-Z), numbers (0-9), and hyphens (-)' }),
    email: z.string({ invalid_type_error: 'Email is invalid' }).min(1, { message: 'Email is required' }).email({ message: 'Email is invalid' }),
    password: z
        .string({ invalid_type_error: 'Password is invalid' })
        .min(8, { message: 'Password must be at least 8 characters' })
        .regex(/.*\d.*/, { message: 'Password must contain at least one number' })
        .regex(/.*[A-Za-z].*/, { message: 'Password must contain at least one letter' })
});

const app = new Hono();

app.use(logger());

app.get('/', async (c) => {
    return c.json({ success: true, message: 'Hello World' });
});

app.get('/users', async (c) => {
    const users = await db.select().from(usersTable);
    return c.json({ success: true, data: users });
});

app.post('/users', zValidator('json', registerSchema), async (c) => {
    const body = c.req.valid('json');

    const existingUsername = await getUserByUsername(body.username);
    if (existingUsername) return c.json({ success: false, message: 'Username already exists' }, 400);

    const existingEmail = await getUserByEmail(body.email);
    if (existingEmail) return c.json({ success: false, message: 'Email already exists' }, 400);

    const hashedPassword = await Bun.password.hash(body.password, { algorithm: 'bcrypt' });
    if (!hashedPassword) return c.json({ success: false, message: 'Failed to hash password' }, 500);

    const newUser = await createUser({ ...body, password: hashedPassword });
    if (!newUser) return c.json({ success: false, message: 'Failed to create user' }, 500);

    const session = await createSession(newUser.id);
    if (!session) return c.json({ success: false, message: 'Failed to create session' }, 500);

    const hasher = new Bun.CryptoHasher('sha256');
    const encryptedSession = hasher.update(String(session.id)).digest('hex');

    await setSignedCookie(c, '__session', encryptedSession, process.env.SESSION_SECRET!, {
        path: '/',
        httpOnly: true,
        secure: Bun.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax'
    });

    return c.json({ success: true, message: 'User created' });
});

export default { fetch: app.fetch, port: process.env.PORT };
