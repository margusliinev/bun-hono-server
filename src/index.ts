import HealthRoutes from './domains/health/health.routes';
import UsersRoutes from './domains/users/users.routes';
import AuthRoutes from './domains/auth/auth.routes';
import { HTTPException } from 'hono/http-exception';
import { serveStatic } from 'hono/bun';
import { showRoutes } from 'hono/dev';
import { Hono } from 'hono';

export const app = new Hono({ strict: false });

app.use('*', serveStatic({ root: './client/dist' }));

const apiRoutes = app.basePath('/api').route('/health', HealthRoutes).route('/users', UsersRoutes).route('/auth', AuthRoutes);

app.notFound(async (c) => c.json({ success: false, message: 'Not Found' }, 404));
app.onError(async (err, c) => {
    if (err instanceof HTTPException) {
        return c.json({ success: false, message: err.message }, err.status);
    } else {
        return c.json({ success: false, message: err.message }, 500);
    }
});

showRoutes(app, { colorize: true });

export type APIRoutes = typeof apiRoutes;
export default { fetch: app.fetch, port: process.env.PORT || 3000 };
