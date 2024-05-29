import { deleteCookie, getSignedCookie } from 'hono/cookie';
import { getUserBySessionId } from '@/models/session';
import { createMiddleware } from 'hono/factory';

export const authGuard = createMiddleware(async (c, next) => {
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
