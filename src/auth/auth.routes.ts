import { createUser, getUserByEmail, getUserByEmailWithPassword, getUserByUsername } from '@/models/user';
import { registerSchema, loginSchema } from '@/auth/auth.schema';
import { deleteCookie, setSignedCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
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
        if (existingUsername) throw new HTTPException(400, { message: 'Username already exists' });

        const existingEmail = await getUserByEmail(body.email);
        if (existingEmail) throw new HTTPException(400, { message: 'Email already exists' });

        const hashedPassword = await Bun.password.hash(body.password, { algorithm: 'bcrypt' });
        if (!hashedPassword) throw new HTTPException(500, { message: 'Failed to hash password' });

        const newUser = await createUser({ ...body, password: hashedPassword });
        if (!newUser) throw new HTTPException(500, { message: 'Failed to create user' });

        const session = await createSession(newUser.id);
        if (!session) throw new HTTPException(500, { message: 'Failed to create session' });

        await setSignedCookie(c, '__session', String(session.id), process.env.SESSION_SECRET!, {
            path: '/',
            httpOnly: true,
            secure: Bun.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60,
            sameSite: 'lax'
        });

        return c.json({ success: true, message: 'User register successful' }, 201);
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
        if (!user) throw new HTTPException(400, { message: 'Invalid email or password' });

        const validPassword = await Bun.password.verify(body.password, user.password);
        if (!validPassword) throw new HTTPException(400, { message: 'Invalid email or password' });

        const session = await createSession(user.id);
        if (!session) throw new HTTPException(500, { message: 'Failed to create session' });

        await setSignedCookie(c, '__session', String(session.id), process.env.SESSION_SECRET!, {
            path: '/',
            httpOnly: true,
            secure: Bun.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60,
            sameSite: 'lax'
        });

        return c.json({ success: true, message: 'User login successful' }, 201);
    }
);

auth.post('/logout', async (c) => {
    deleteCookie(c, '__session', { path: '/' });
    return c.json({ success: true, message: 'User logout successful' }, 201);
});
