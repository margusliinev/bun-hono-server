import { auth } from '@/auth/auth.routes';
import { users } from '@/users/users.routes';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const app = new Hono({ strict: true });

app.get('/', async (c) => c.json({ success: true, message: 'OK' }));
app.route('/api/auth', auth);
app.route('/api/users', users);

app.notFound(async (c) => c.json({ success: false, message: 'Not Found' }, 404));
app.onError(async (err, c) => {
    if (err instanceof HTTPException) {
        return c.json({ success: false, message: err.message }, err.status);
    } else {
        return c.json({ success: false, message: err.message }, 500);
    }
});

export default { fetch: app.fetch, port: process.env.PORT || 3000 };
