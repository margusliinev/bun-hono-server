import { deleteCookie, getSignedCookie } from 'hono/cookie';
import { getUserBySessionId } from '../models/session';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

export const authenticate = createMiddleware(async (c, next) => {
    const session = await getSignedCookie(c, process.env.SESSION_SECRET!, '__session');
    if (!session) throw new HTTPException(401, { message: 'Unauthorized' });

    const user = await getUserBySessionId(Number(session));
    if (!user) {
        deleteCookie(c, '__session', { path: '/' });
        throw new HTTPException(401, { message: 'Unauthorized' });
    }

    c.set('user', user.id);
    await next();
});
