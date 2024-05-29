import { createUser, getUserByEmail, getUserByEmailWithPassword, getUserByUsername } from '@/models/user';
import { registerSchema, loginSchema } from '@/auth/auth.schema';
import { setSignedCookie } from 'hono/cookie';
import { createSession } from '@/models/session';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

export const auth = new Hono();

auth.post(
    '/register',
    zValidator('json', registerSchema, (result, c) => {
        if (!result.success) {
            const issues = result.error.issues.map((issue) => issue.message);
            const firstIssue = issues[0];
            return c.json({ success: false, message: firstIssue }, 400);
        }
    }),
    async (c) => {
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
    }
);

auth.post(
    '/login',
    zValidator('json', loginSchema, (result, c) => {
        if (!result.success) {
            const issues = result.error.issues.map((issue) => issue.message);
            const firstIssue = issues[0];
            return c.json({ success: false, message: firstIssue }, 400);
        }
    }),
    async (c) => {
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
    }
);
