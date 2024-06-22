import { Hono } from 'hono';

const app = new Hono({ strict: true });

app.get('/ok', async (c) => c.json({ success: true, message: 'OK' }));

export default app;
