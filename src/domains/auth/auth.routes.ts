import { createUser, getUserByEmail, getUserByEmailWithPassword, getUserByUsername } from '../../models/user';
import { deleteCookie, setSignedCookie } from 'hono/cookie';
import { loginSchema, registerSchema } from './auth.schema';
import { createSession } from '../../models/session';
import { HTTPException } from 'hono/http-exception';
import { validate } from '../../middleware';
import { Hono } from 'hono';

const app = new Hono()
    .post('/register', validate(registerSchema), async (c) => {
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

        console.log('SESSION', String(session.id));

        await setSignedCookie(c, '__session', String(session.id), process.env.SESSION_SECRET!, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60,
            sameSite: 'lax'
        });

        return c.json({ success: true, message: 'Register successful' }, 201);
    })
    .post('/login', validate(loginSchema), async (c) => {
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
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60,
            sameSite: 'lax'
        });

        return c.json({ success: true, message: 'Login successful' }, 201);
    })
    .post('/logout', async (c) => {
        deleteCookie(c, '__session', { path: '/' });
        return c.json({ success: true, message: 'Logout successful' }, 204);
    });
export default app;
