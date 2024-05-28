import { createUser, getUserByEmail, getUserByEmailWithPassword, getUserByUsername, getUserById } from './models/user';
import { createSession, getUserBySessionId } from './models/session';
import { zValidator } from '@hono/zod-validator';
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import { usersTable } from './db/schema';
import { logger } from 'hono/logger';
import { Hono } from 'hono';
import { db } from './db';
import { z } from 'zod';

declare module 'hono' {
    interface ContextVariableMap {
        user: number;
    }
}

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

const loginSchema = z.object({
    email: z.string({ invalid_type_error: 'Email is invalid' }).min(1, { message: 'Email is required' }).email({ message: 'Email is invalid' }),
    password: z.string({ invalid_type_error: 'Password is invalid' }).min(1, { message: 'Password is required' })
});

const app = new Hono();

app.use(logger());

app.notFound(async (c) => {
    return c.json({ success: false, message: 'Not Found' }, 404);
});

app.onError(async (err, c) => {
    return c.json({ success: false, message: err.message }, 500);
});

app.use('/users/*', async (c, next) => {
    const session = await getSignedCookie(c, process.env.SESSION_SECRET!, '__session');
    if (!session) return c.json({ success: false, message: 'Unauthorized' }, 401);

    const user = await getUserBySessionId(Number(session));
    if (!user) {
        deleteCookie(c, '__session', { path: '/' });
        return c.json({ success: false, message: 'Unauthorized' }, 401);
    }

    c.set('user', user.id);
    await next();
});

app.get('/', async (c) => {
    return c.json({ success: true, message: 'Hello World' });
});

app.get('/users', async (c) => {
    const users = await db.select().from(usersTable);
    return c.json({ success: true, data: users });
});

app.get('/users/me', async (c) => {
    const user = await getUserById(c.get('user'));
    return c.json({ success: true, data: user });
});

app.post('/auth/register', zValidator('json', registerSchema), async (c) => {
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

    await setSignedCookie(c, '__session', String(session.id), process.env.SESSION_SECRET!, {
        path: '/',
        httpOnly: true,
        secure: Bun.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax'
    });

    return c.json({ success: true, message: 'User register successful' });
});

app.post('/auth/login', zValidator('json', loginSchema), async (c) => {
    const body = c.req.valid('json');

    const user = await getUserByEmailWithPassword(body.email);
    if (!user) return c.json({ success: false, message: 'Invalid email or password' }, 400);

    const validPassword = await Bun.password.verify(body.password, user.password);
    if (!validPassword) return c.json({ success: false, message: 'Invalid email or password' }, 400);

    const session = await createSession(user.id);
    if (!session) return c.json({ success: false, message: 'Failed to create session' }, 500);

    await setSignedCookie(c, '__session', String(session.id), process.env.SESSION_SECRET!, {
        path: '/',
        httpOnly: true,
        secure: Bun.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax'
    });

    return c.json({ success: true, message: 'User login successful' });
});

export default { fetch: app.fetch, port: process.env.PORT };
