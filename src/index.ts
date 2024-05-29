import { authGuard } from '@/auth/auth.guard';
import { auth } from '@/auth/auth.routes';
import { users } from '@/users/users.routes';
import { logger } from 'hono/logger';
import { Hono } from 'hono';
import { User } from './db/schema';

declare module 'hono' {
    interface ContextVariableMap {
        user: User['id'];
    }
}

const app = new Hono();
app.use(logger());

app.route('/auth', auth);
app.use(authGuard);
app.route('/users', users);

app.notFound(async (c) => c.json({ success: false, message: 'Not Found' }, 404));
app.onError(async (err, c) => c.json({ success: false, message: err.message }, 500));

export default { fetch: app.fetch, port: process.env.PORT || 3000 };
