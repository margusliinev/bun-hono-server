import AuthRoutes from '@/domains/auth/auth.routes';
import HealthRoutes from '@/domains/health/health.routes';
import UsersRoutes from '@/domains/users/users.routes';
import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';
import { HTTPException } from 'hono/http-exception';

export const app = new Hono({ strict: false });

app.route('/api/health', HealthRoutes);
app.route('/api/auth', AuthRoutes);
app.route('/api/users', UsersRoutes);

app.notFound(async (c) => c.json({ success: false, message: 'Not Found' }, 404));
app.onError(async (err, c) => {
    if (err instanceof HTTPException) {
        return c.json({ success: false, message: err.message }, err.status);
    } else {
        return c.json({ success: false, message: err.message }, 500);
    }
});

showRoutes(app, { colorize: true });

export default { fetch: app.fetch, port: process.env.PORT || 3000 };
